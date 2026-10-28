import { Response } from 'express';
import { z } from 'zod';
import { Role, SessionType, SessionStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { studentProfileId } = req.query;

    let whereClause: any = {};

    if (user.role === Role.STUDENT) {
      if (!user.studentProfileId) {
        res.status(400).json({ success: false, message: 'Student profile missing' });
        return;
      }
      whereClause.studentProfileId = user.studentProfileId;
    } else if (user.role === Role.MENTOR) {
      if (studentProfileId) {
        // Verify mentor is assigned to this student
        const isAssigned = await prisma.mentorAssignment.findFirst({
          where: {
            facultyProfileId: user.facultyProfileId,
            studentProfileId: String(studentProfileId),
            status: 'ACTIVE',
          },
        });
        if (!isAssigned) {
          res.status(403).json({ success: false, message: 'Unauthorized. Not assigned to this mentee.' });
          return;
        }
        whereClause.studentProfileId = String(studentProfileId);
      } else {
        whereClause.facultyProfileId = user.facultyProfileId;
      }
    } else if (user.role === Role.HOD || user.role === Role.ADMIN) {
      if (studentProfileId) {
        whereClause.studentProfileId = String(studentProfileId);
      }
    }

    const sessions = await prisma.mentoringSession.findMany({
      where: whereClause,
      include: {
        studentProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        facultyProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        actionItems: true,
      },
      orderBy: { sessionDate: 'desc' },
    });

    // PRIVACY ENFORCEMENT: Never expose privateFacultyNotes to students!
    const sanitizedSessions = sessions.map((s) => {
      if (user.role === Role.STUDENT) {
        const { privateFacultyNotes, ...safeSession } = s;
        return safeSession;
      }
      return s;
    });

    res.json({ success: true, sessions: sanitizedSessions });
  } catch (error: any) {
    console.error('Fetch sessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentoring sessions' });
  }
};

const createSessionSchema = z.object({
  studentProfileId: z.string().uuid(),
  sessionDate: z.string(),
  type: z.nativeEnum(SessionType).default(SessionType.ONE_ON_ONE),
  discussionSummary: z.string().min(5, 'Discussion summary is required'),
  privateFacultyNotes: z.string().optional().nullable(),
  agreedActionItemsSummary: z.string().optional().nullable(),
  nextFollowUpDate: z.string().optional().nullable(),
  status: z.nativeEnum(SessionStatus).default(SessionStatus.COMPLETED),
  actionItems: z
    .array(
      z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
      })
    )
    .optional(),
});

export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.MENTOR && user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'Faculty or HOD role required to log sessions' });
      return;
    }

    const parseResult = createSessionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parseResult.error.errors });
      return;
    }

    const data = parseResult.data;

    // Verify mentor assignment if user is MENTOR
    if (user.role === Role.MENTOR) {
      const assignment = await prisma.mentorAssignment.findFirst({
        where: {
          studentProfileId: data.studentProfileId,
          facultyProfileId: user.facultyProfileId,
          status: 'ACTIVE',
        },
      });

      if (!assignment) {
        res.status(403).json({ success: false, message: 'You are not active mentor for this student' });
        return;
      }
    }

    const facultyProfileId = user.facultyProfileId!;

    const session = await prisma.mentoringSession.create({
      data: {
        studentProfileId: data.studentProfileId,
        facultyProfileId,
        sessionDate: new Date(data.sessionDate),
        type: data.type,
        discussionSummary: data.discussionSummary,
        privateFacultyNotes: data.privateFacultyNotes,
        agreedActionItemsSummary: data.agreedActionItemsSummary,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
        status: data.status,
      },
    });

    // Create action items if attached
    if (data.actionItems && data.actionItems.length > 0) {
      await Promise.all(
        data.actionItems.map((item) =>
          prisma.actionItem.create({
            data: {
              studentProfileId: data.studentProfileId,
              facultyProfileId,
              sessionId: session.id,
              title: item.title,
              description: item.description,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
              priority: item.priority as any,
            },
          })
        )
      );
    }

    // Notify student about new mentoring session notes
    const student = await prisma.studentProfile.findUnique({
      where: { id: data.studentProfileId },
      include: { user: true },
    });

    if (student) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: 'Mentoring Session Recorded',
          message: `Mentoring session recorded on ${new Date(data.sessionDate).toLocaleDateString()}. Action items updated.`,
          type: 'INFO',
          link: '/mentee/sessions',
        },
      });
    }

    await logAudit({
      actorId: user.userId,
      actorRole: user.role,
      action: 'SESSION_CREATE',
      entityType: 'MentoringSession',
      entityId: session.id,
      changeSummary: `Session created: ${data.type} with student ${student?.usn}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, session, message: 'Mentoring session saved successfully' });
  } catch (error: any) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
};
