import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Role, AssignmentStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

export const getDepartmentOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'HOD access required' });
      return;
    }

    const [
      totalStudents,
      totalFaculty,
      activeAssignments,
      pendingEndorsements,
      submittedProfiles,
      totalSessions,
      recommendationStats,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.facultyProfile.count(),
      prisma.mentorAssignment.count({ where: { status: 'ACTIVE' } }),
      prisma.endorsement.count({ where: { status: 'PENDING' } }),
      prisma.studentProfile.count({ where: { status: 'SUBMITTED' } }),
      prisma.mentoringSession.count(),
      prisma.recommendation.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const unassignedStudentsCount = Math.max(0, totalStudents - activeAssignments);
    const coveragePercentage = totalStudents > 0 ? Math.round((activeAssignments / totalStudents) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        activeAssignments,
        unassignedStudentsCount,
        coveragePercentage,
        pendingEndorsements,
        submittedProfiles,
        totalSessions,
        recommendationStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch department overview' });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'HOD access required' });
      return;
    }

    const assignments = await prisma.mentorAssignment.findMany({
      include: {
        studentProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        facultyProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    // Also get all unassigned students
    const assignedStudentIds = assignments.filter((a) => a.status === 'ACTIVE').map((a) => a.studentProfileId);
    const unassignedStudents = await prisma.studentProfile.findMany({
      where: {
        id: { notIn: assignedStudentIds },
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    // Also get all faculty with current mentee count
    const faculty = await prisma.facultyProfile.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        mentorAssignments: { where: { status: 'ACTIVE' } },
      },
    });

    res.json({
      success: true,
      assignments,
      unassignedStudents,
      faculty: faculty.map((f) => ({
        id: f.id,
        name: `${f.user.firstName} ${f.user.lastName}`,
        email: f.user.email,
        designation: f.designation,
        maxMentees: f.maxMentees,
        activeCount: f.mentorAssignments.length,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
};

const assignSchema = z.object({
  studentProfileId: z.string().uuid(),
  facultyProfileId: z.string().uuid(),
  notes: z.string().optional().nullable(),
});

export const assignMentor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'HOD access required' });
      return;
    }

    const parseResult = assignSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parseResult.error.errors });
      return;
    }

    const { studentProfileId, facultyProfileId, notes } = parseResult.data;

    // Deactivate previous active assignment if exists
    await prisma.mentorAssignment.updateMany({
      where: { studentProfileId, status: AssignmentStatus.ACTIVE },
      data: { status: AssignmentStatus.REASSIGNED, endedAt: new Date() },
    });

    // Create new assignment
    const assignment = await prisma.mentorAssignment.create({
      data: {
        studentProfileId,
        facultyProfileId,
        assignedById: user.userId,
        status: AssignmentStatus.ACTIVE,
        notes,
      },
      include: {
        studentProfile: { include: { user: true } },
        facultyProfile: { include: { user: true } },
      },
    });

    // Notify mentor and student
    await prisma.notification.createMany({
      data: [
        {
          userId: assignment.studentProfile.userId,
          title: 'Mentor Assigned',
          message: `${assignment.facultyProfile.user.firstName} ${assignment.facultyProfile.user.lastName} has been assigned as your mentor.`,
          type: 'INFO',
          link: '/mentee/dashboard',
        },
        {
          userId: assignment.facultyProfile.user.id,
          title: 'New Mentee Assigned',
          message: `Student ${assignment.studentProfile.usn} (${assignment.studentProfile.user.firstName} ${assignment.studentProfile.user.lastName}) has been assigned to you.`,
          type: 'INFO',
          link: '/mentor/mentees',
        },
      ],
    });

    await logAudit({
      actorId: user.userId,
      actorRole: user.role,
      action: 'MENTOR_ASSIGN',
      entityType: 'MentorAssignment',
      entityId: assignment.id,
      changeSummary: `Assigned student ${assignment.studentProfile.usn} to mentor ${assignment.facultyProfile.user.lastName}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, assignment, message: 'Mentor assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to assign mentor' });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'HOD or Administrator access required' });
      return;
    }

    const logs = await prisma.auditLog.findMany({
      include: {
        actor: { select: { firstName: true, lastName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'HOD or Administrator access required' });
      return;
    }

    const users = await prisma.user.findMany({
      include: {
        department: true,
        studentProfile: true,
        facultyProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(Role),
  phone: z.string().optional().nullable(),
  // Student specific
  usn: z.string().optional(),
  course: z.string().optional(),
  semester: z.number().int().min(1).max(8).optional(),
  // Faculty specific
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  qualifications: z.string().optional(),
});

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'HOD access required' });
      return;
    }

    const parseResult = createUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parseResult.error.errors });
      return;
    }

    const data = parseResult.data;

    // Check unique email
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const departmentId = user.departmentId;

    const newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        departmentId,
      },
    });

    if (data.role === Role.STUDENT && data.usn) {
      await prisma.studentProfile.create({
        data: {
          userId: newUser.id,
          usn: data.usn.toUpperCase().trim(),
          course: data.course || 'B.Tech',
          department: 'Computer Science & Engineering',
          departmentId,
          semester: data.semester || 1,
        },
      });
    } else if ((data.role === Role.MENTOR || data.role === Role.HOD) && data.employeeId) {
      await prisma.facultyProfile.create({
        data: {
          userId: newUser.id,
          employeeId: data.employeeId.toUpperCase().trim(),
          department: 'Computer Science & Engineering',
          departmentId,
          designation: data.designation || 'Assistant Professor',
          qualifications: data.qualifications || 'M.Tech',
        },
      });
    }

    await logAudit({
      actorId: user.userId,
      actorRole: user.role,
      action: 'USER_CREATE',
      entityType: 'User',
      entityId: newUser.id,
      changeSummary: `Created user ${newUser.email} with role ${newUser.role}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, user: newUser, message: 'User created successfully' });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};
