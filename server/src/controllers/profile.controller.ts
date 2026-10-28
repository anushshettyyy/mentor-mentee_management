import { Response } from 'express';
import { z } from 'zod';
import { ProfileStatus, Role } from '@prisma/client';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

// Calculate completion score based on filled fields
const calculateCompletion = (profile: any): number => {
  const fields = [
    Boolean(profile.usn),
    Boolean(profile.department),
    Boolean(profile.course),
    Boolean(profile.semester),
    Boolean(profile.phone),
    Boolean(profile.dateOfBirth),
    Boolean(profile.address),
    Boolean(profile.profilePhoto),
    Array.isArray(profile.hobbies) && profile.hobbies.length > 0,
    Array.isArray(profile.interests) && profile.interests.length > 0,
    Array.isArray(profile.skills) && profile.skills.length > 0,
    Array.isArray(profile.strengths) && profile.strengths.length > 0,
    Array.isArray(profile.areasToImprove) && profile.areasToImprove.length > 0,
    Boolean(profile.careerGoals),
    Boolean(profile.shortTermGoals),
    Boolean(profile.longTermGoals),
    Array.isArray(profile.achievements) && profile.achievements.length > 0,
    Array.isArray(profile.certifications) && profile.certifications.length > 0,
    Boolean(profile.extracurricularActivities),
    Array.isArray(profile.languages) && profile.languages.length > 0,
    Boolean(profile.preferredLearningStyle),
    Boolean(profile.academicInterests),
    Boolean(profile.supportRequested),
  ];

  const filledCount = fields.filter(Boolean).length;
  return Math.min(100, Math.round((filledCount / fields.length) * 100));
};

export const getMyStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Student role required' });
      return;
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
        mentorAssignments: {
          where: { status: 'ACTIVE' },
          include: {
            facultyProfile: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
              },
            },
          },
        },
        academicRecords: { orderBy: { semester: 'asc' } },
        endorsements: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
  }
};

const updateProfileSchema = z.object({
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  profilePhoto: z.string().optional().nullable(),
  hobbies: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  areasToImprove: z.array(z.string()).optional(),
  careerGoals: z.string().optional().nullable(),
  shortTermGoals: z.string().optional().nullable(),
  longTermGoals: z.string().optional().nullable(),
  achievements: z.any().optional(),
  certifications: z.any().optional(),
  extracurricularActivities: z.string().optional().nullable(),
  languages: z.array(z.string()).optional(),
  preferredLearningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING']).optional(),
  academicInterests: z.string().optional().nullable(),
  supportRequested: z.string().optional().nullable(),
  semester: z.number().int().min(1).max(8).optional(),
});

export const updateMyStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Student role required' });
      return;
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parseResult.error.errors });
      return;
    }

    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existingProfile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    const data = parseResult.data;
    const merged = { ...existingProfile, ...data };
    const completionPercentage = calculateCompletion(merged);

    const updated = await prisma.studentProfile.update({
      where: { userId: req.user.userId },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : existingProfile.dateOfBirth,
        completionPercentage,
        // If it was changes requested, update back to draft
        status: existingProfile.status === ProfileStatus.CHANGES_REQUESTED ? ProfileStatus.DRAFT : existingProfile.status,
      },
    });

    await logAudit({
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'PROFILE_UPDATE',
      entityType: 'StudentProfile',
      entityId: updated.id,
      changeSummary: `Updated profile (completion: ${completionPercentage}%)`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, profile: updated, message: 'Profile draft saved successfully' });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const submitMyStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Student role required' });
      return;
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        mentorAssignments: {
          where: { status: 'ACTIVE' },
          include: { facultyProfile: { include: { user: true } } },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    if (profile.completionPercentage < 40) {
      res.status(400).json({
        success: false,
        message: 'Profile completion is below minimum threshold (40%). Please fill key details before submitting.',
      });
      return;
    }

    const updated = await prisma.studentProfile.update({
      where: { userId: req.user.userId },
      data: {
        status: ProfileStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    // Notify assigned mentor if exists
    const activeAssignment = profile.mentorAssignments[0];
    if (activeAssignment?.facultyProfile?.user) {
      await prisma.notification.create({
        data: {
          userId: activeAssignment.facultyProfile.user.id,
          title: 'Student Profile Submitted',
          message: `${profile.usn} has submitted their profile for mentor review.`,
          type: 'ACTION_REQUIRED',
          link: `/mentor/mentee/${profile.id}`,
        },
      });
    }

    await logAudit({
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'PROFILE_SUBMIT',
      entityType: 'StudentProfile',
      entityId: updated.id,
      changeSummary: 'Submitted profile for mentor verification',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, profile: updated, message: 'Profile submitted for mentor review' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit profile' });
  }
};

export const getStudentProfileById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
        mentorAssignments: {
          where: { status: 'ACTIVE' },
          include: {
            facultyProfile: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
              },
            },
          },
        },
        academicRecords: { orderBy: { semester: 'asc' } },
        endorsements: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Role-based security check (IDOR Prevention)
    if (user.role === Role.STUDENT && user.studentProfileId !== profile.id) {
      res.status(403).json({ success: false, message: 'Unauthorized. Students cannot view other students profiles.' });
      return;
    }

    if (user.role === Role.MENTOR) {
      const isAssigned = (profile as any).mentorAssignments?.some((a: any) => a.facultyProfileId === user.facultyProfileId);
      if (!isAssigned) {
        res.status(403).json({ success: false, message: 'Unauthorized. You are not assigned as this student’s mentor.' });
        return;
      }
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
  }
};

const reviewSchema = z.object({
  status: z.enum(['APPROVED_ENDORSED', 'CHANGES_REQUESTED']),
  reviewNotes: z.string().min(3, 'Review notes or requested feedback is required'),
});

export const reviewStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user || (user.role !== Role.MENTOR && user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'Mentor or HOD permissions required' });
      return;
    }

    const parseResult = reviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parseResult.error.errors });
      return;
    }

    const { status, reviewNotes } = parseResult.data;

    const profile = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        mentorAssignments: { where: { status: 'ACTIVE' } },
        user: true,
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    // Check mentor assignment if user is MENTOR
    if (user.role === Role.MENTOR) {
      const isAssigned = (profile as any).mentorAssignments?.some((a: any) => a.facultyProfileId === user.facultyProfileId);
      if (!isAssigned) {
        res.status(403).json({ success: false, message: 'Unauthorized. You are not assigned to this mentee.' });
        return;
      }
    }

    const updated = await prisma.studentProfile.update({
      where: { id },
      data: {
        status: status as ProfileStatus,
        reviewNotes,
        reviewedAt: new Date(),
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: profile.userId,
        title: status === 'APPROVED_ENDORSED' ? 'Profile Approved' : 'Profile Changes Requested',
        message: reviewNotes,
        type: status === 'APPROVED_ENDORSED' ? 'SUCCESS' : 'WARNING',
        link: '/mentee/profile',
      },
    });

    await logAudit({
      actorId: user.userId,
      actorRole: user.role,
      action: 'PROFILE_REVIEW',
      entityType: 'StudentProfile',
      entityId: id,
      changeSummary: `Profile reviewed as ${status}. Notes: ${reviewNotes.slice(0, 80)}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, profile: updated, message: `Profile successfully marked as ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to review profile' });
  }
};

export const getMentorDirectory = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentors = await prisma.facultyProfile.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, role: true } },
        mentorAssignments: { where: { status: 'ACTIVE' } },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    const formatted = mentors.map((m) => ({
      id: m.id,
      employeeId: m.employeeId,
      name: `${m.user.firstName} ${m.user.lastName}`,
      email: m.user.email,
      phone: m.user.phone,
      avatarUrl: m.user.avatarUrl,
      role: m.user.role,
      designation: m.designation,
      qualifications: m.qualifications,
      specialization: m.specialization,
      cabinLocation: m.cabinLocation,
      officeHours: m.officeHours,
      activeMenteesCount: m.mentorAssignments.length,
      maxMentees: m.maxMentees,
    }));

    res.json({ success: true, mentors: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch mentor directory' });
  }
};
