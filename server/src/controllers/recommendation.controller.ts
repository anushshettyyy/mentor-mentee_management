import { Response } from 'express';
import { z } from 'zod';
import { Role, RecommendationCategory, Priority, RecommendationStatus, EndorsementStatus, EndorsementItemType } from '@prisma/client';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
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
        whereClause.studentProfileId = String(studentProfileId);
      } else {
        whereClause.facultyProfileId = user.facultyProfileId;
      }
    } else if (user.role === Role.HOD || user.role === Role.ADMIN) {
      if (studentProfileId) {
        whereClause.studentProfileId = String(studentProfileId);
      }
    }

    const recommendations = await prisma.recommendation.findMany({
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
        endorsements: { orderBy: { createdAt: 'desc' } },
        actionItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
  }
};

const createRecommendationSchema = z.object({
  studentProfileId: z.string().uuid(),
  title: z.string().min(3, 'Title is required'),
  category: z.nativeEnum(RecommendationCategory),
  explanation: z.string().min(10, 'Detailed explanation is required'),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  targetDate: z.string().optional().nullable(),
  resources: z.string().optional().nullable(),
  successCriteria: z.string().optional().nullable(),
  submitForEndorsement: z.boolean().optional().default(false),
});

export const createRecommendation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.MENTOR && user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'Faculty privileges required' });
      return;
    }

    const parseResult = createRecommendationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Validation error', errors: parseResult.error.errors });
      return;
    }

    const data = parseResult.data;

    if (user.role === Role.MENTOR) {
      const assignment = await prisma.mentorAssignment.findFirst({
        where: {
          studentProfileId: data.studentProfileId,
          facultyProfileId: user.facultyProfileId,
          status: 'ACTIVE',
        },
      });

      if (!assignment) {
        res.status(403).json({ success: false, message: 'Unauthorized. Not assigned to this student.' });
        return;
      }
    }

    const facultyProfileId = user.facultyProfileId!;

    const recommendation = await prisma.recommendation.create({
      data: {
        studentProfileId: data.studentProfileId,
        facultyProfileId,
        title: data.title,
        category: data.category,
        explanation: data.explanation,
        priority: data.priority,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        resources: data.resources,
        successCriteria: data.successCriteria,
        status: data.submitForEndorsement ? RecommendationStatus.SUBMITTED_FOR_ENDORSEMENT : RecommendationStatus.IN_PROGRESS,
        hodEndorsementRequested: data.submitForEndorsement,
      },
      include: {
        studentProfile: { include: { user: true } },
      },
    });

    // If requested for endorsement, create endorsement queue record
    if (data.submitForEndorsement) {
      await prisma.endorsement.create({
        data: {
          itemType: EndorsementItemType.RECOMMENDATION,
          itemId: recommendation.id,
          recommendationId: recommendation.id,
          studentProfileId: data.studentProfileId,
          requestedByMentorId: facultyProfileId,
          status: EndorsementStatus.PENDING,
          originalContentSnapshot: {
            title: recommendation.title,
            category: recommendation.category,
            priority: recommendation.priority,
            explanation: recommendation.explanation,
            targetDate: recommendation.targetDate?.toISOString(),
            resources: recommendation.resources,
            successCriteria: recommendation.successCriteria,
          },
        },
      });

      // Find HODs to notify
      const hodUsers = await prisma.user.findMany({
        where: { role: Role.HOD },
      });

      for (const hod of hodUsers) {
        await prisma.notification.create({
          data: {
            userId: hod.id,
            title: 'Endorsement Required',
            message: `New recommendation "${recommendation.title}" submitted by mentor for student ${recommendation.studentProfile.usn}`,
            type: 'ACTION_REQUIRED',
            link: '/hod/approvals',
          },
        });
      }
    }

    // Notify student
    await prisma.notification.create({
      data: {
        userId: recommendation.studentProfile.userId,
        title: 'New Recommendation Added',
        message: `Your mentor added a recommendation: "${recommendation.title}"`,
        type: 'INFO',
        link: '/mentee/recommendations',
      },
    });

    await logAudit({
      actorId: user.userId,
      actorRole: user.role,
      action: 'RECOMMENDATION_CREATE',
      entityType: 'Recommendation',
      entityId: recommendation.id,
      changeSummary: `Created recommendation: ${recommendation.title}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, recommendation, message: 'Recommendation created successfully' });
  } catch (error: any) {
    console.error('Create recommendation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create recommendation' });
  }
};

export const submitForEndorsement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user || (user.role !== Role.MENTOR && user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'Faculty privileges required' });
      return;
    }

    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        studentProfile: { include: { user: true } },
      },
    });

    if (!recommendation) {
      res.status(404).json({ success: false, message: 'Recommendation not found' });
      return;
    }

    // Update recommendation status
    const updated = await prisma.recommendation.update({
      where: { id },
      data: {
        status: RecommendationStatus.SUBMITTED_FOR_ENDORSEMENT,
        hodEndorsementRequested: true,
      },
    });

    // Create Endorsement record with versioned snapshot
    await prisma.endorsement.create({
      data: {
        itemType: EndorsementItemType.RECOMMENDATION,
        itemId: recommendation.id,
        recommendationId: recommendation.id,
        studentProfileId: recommendation.studentProfileId,
        requestedByMentorId: recommendation.facultyProfileId,
        status: EndorsementStatus.PENDING,
        originalContentSnapshot: {
          title: recommendation.title,
          category: recommendation.category,
          priority: recommendation.priority,
          explanation: recommendation.explanation,
          targetDate: recommendation.targetDate?.toISOString(),
          resources: recommendation.resources,
          successCriteria: recommendation.successCriteria,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    // Notify HODs
    const hodUsers = await prisma.user.findMany({ where: { role: Role.HOD } });
    for (const hod of hodUsers) {
      await prisma.notification.create({
        data: {
          userId: hod.id,
          title: 'Endorsement Request',
          message: `Recommendation "${recommendation.title}" submitted for your endorsement.`,
          type: 'ACTION_REQUIRED',
          link: '/hod/approvals',
        },
      });
    }

    await logAudit({
      actorId: user.userId,
      actorRole: user.role,
      action: 'ENDORSEMENT_SUBMIT',
      entityType: 'Recommendation',
      entityId: id,
      changeSummary: `Submitted recommendation "${recommendation.title}" for HOD endorsement`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, recommendation: updated, message: 'Submitted for HOD endorsement' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit recommendation for endorsement' });
  }
};
