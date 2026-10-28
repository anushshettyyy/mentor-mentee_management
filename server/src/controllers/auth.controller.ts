import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-production-grade-jwt-secret-key-2026-mentor-mentee';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid email or password format', errors: parseResult.error.errors });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        department: true,
        studentProfile: {
          include: {
            mentorAssignments: {
              where: { status: 'ACTIVE' },
              include: {
                facultyProfile: {
                  include: {
                    user: {
                      select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
        facultyProfile: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid credentials or account disabled' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      studentProfileId: user.studentProfile?.id,
      facultyProfileId: user.facultyProfile?.id,
      departmentId: user.departmentId || undefined,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: (JWT_EXPIRES_IN || '7d') as any });

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      changeSummary: `User ${user.email} logged in successfully`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        department: user.department,
        studentProfile: user.studentProfile,
        facultyProfile: user.facultyProfile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An internal error occurred during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        department: true,
        studentProfile: {
          include: {
            mentorAssignments: {
              where: { status: 'ACTIVE' },
              include: {
                facultyProfile: {
                  include: {
                    user: {
                      select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
        facultyProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        department: user.department,
        studentProfile: user.studentProfile,
        facultyProfile: user.facultyProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
};

export const getDemoAccounts = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      accounts: [
        {
          role: 'STUDENT',
          name: 'Rahul Kumar (Complete Profile)',
          email: 'rahul.kumar@student.edu',
          password: 'Password@123',
          description: '6th Sem B.Tech CSE, 95% profile completion, AWS endorsed',
        },
        {
          role: 'STUDENT',
          name: 'Ananya Sen (Submitted/Pending Review)',
          email: 'ananya.sen@student.edu',
          password: 'Password@123',
          description: '6th Sem B.Tech CSE, Submitted profile awaiting mentor review',
        },
        {
          role: 'MENTOR',
          name: 'Dr. Sneha Sharma (Faculty/Mentor)',
          email: 'sneha.sharma@college.edu',
          password: 'Password@123',
          description: 'Associate Professor CSE, 2 assigned mentees, active sessions & recommendations',
        },
        {
          role: 'HOD',
          name: 'Dr. Ramesh Rao (Head of Department)',
          email: 'hod.cse@college.edu',
          password: 'Password@123',
          description: 'CSE Department Head, pending endorsements, mentor assignments, analytics',
        },
        {
          role: 'ADMIN',
          name: 'Suresh Patel (System Admin)',
          email: 'admin@college.edu',
          password: 'Password@123',
          description: 'Full institutional administrative access and audits',
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load demo accounts' });
  }
};
