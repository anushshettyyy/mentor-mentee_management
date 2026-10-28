import { Response } from 'express';
import { Role, ActionItemStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';

export const getMenteeDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Student access required' });
      return;
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.userId },
      include: {
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
      },
    });

    if (!studentProfile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const studentProfileId = studentProfile.id;

    const [
      activeRecommendationsCount,
      pendingActionItemsCount,
      completedActionItemsCount,
      nextSession,
      recentSessions,
      recentEndorsements,
    ] = await Promise.all([
      prisma.recommendation.count({
        where: { studentProfileId, status: { in: ['IN_PROGRESS', 'SUBMITTED_FOR_ENDORSEMENT', 'ENDORSED'] } },
      }),
      prisma.actionItem.count({
        where: { studentProfileId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
      }),
      prisma.actionItem.count({
        where: { studentProfileId, status: ActionItemStatus.COMPLETED },
      }),
      prisma.mentoringSession.findFirst({
        where: {
          studentProfileId,
          nextFollowUpDate: { gte: new Date() },
        },
        orderBy: { nextFollowUpDate: 'asc' },
      }),
      prisma.mentoringSession.findMany({
        where: { studentProfileId },
        orderBy: { sessionDate: 'desc' },
        take: 3,
        select: {
          id: true,
          sessionDate: true,
          type: true,
          discussionSummary: true,
          agreedActionItemsSummary: true,
          nextFollowUpDate: true,
          status: true,
        },
      }),
      prisma.endorsement.findMany({
        where: { studentProfileId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    res.json({
      success: true,
      data: {
        profile: studentProfile,
        assignedMentor: studentProfile.mentorAssignments[0]?.facultyProfile || null,
        stats: {
          completionPercentage: studentProfile.completionPercentage,
          activeRecommendations: activeRecommendationsCount,
          pendingTasks: pendingActionItemsCount,
          completedTasks: completedActionItemsCount,
          nextFollowUpDate: nextSession?.nextFollowUpDate || null,
        },
        recentSessions,
        recentEndorsements,
      },
    });
  } catch (error: any) {
    console.error('Mentee dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentee dashboard metrics' });
  }
};

export const getMentorDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== Role.MENTOR && user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'Faculty access required' });
      return;
    }

    const facultyProfileId = user.facultyProfileId;
    if (!facultyProfileId) {
      res.status(400).json({ success: false, message: 'Faculty profile not found' });
      return;
    }

    // Get assigned mentees
    const assignments = await prisma.mentorAssignment.findMany({
      where: { facultyProfileId, status: 'ACTIVE' },
      include: {
        studentProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
            actionItems: true,
            recommendations: true,
            mentoringSessions: { orderBy: { sessionDate: 'desc' }, take: 1 },
          },
        },
      },
    });

    const menteeProfiles = assignments.map((a) => a.studentProfile);
    const menteeIds = menteeProfiles.map((p) => p.id);

    const [
      profilesAwaitingReview,
      recommendationsRequiringFollowup,
      overdueTasks,
      upcomingSessions,
    ] = await Promise.all([
      prisma.studentProfile.count({
        where: { id: { in: menteeIds }, status: 'SUBMITTED' },
      }),
      prisma.recommendation.count({
        where: { facultyProfileId, status: 'IN_PROGRESS' },
      }),
      prisma.actionItem.count({
        where: {
          facultyProfileId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.mentoringSession.findMany({
        where: {
          facultyProfileId,
          nextFollowUpDate: { gte: new Date() },
        },
        include: {
          studentProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { nextFollowUpDate: 'asc' },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalAssignedMentees: menteeProfiles.length,
          profilesAwaitingReview,
          recommendationsRequiringFollowup,
          overdueTasks,
        },
        mentees: menteeProfiles.map((p) => ({
          id: p.id,
          usn: p.usn,
          name: `${p.user.firstName} ${p.user.lastName}`,
          email: p.user.email,
          semester: p.semester,
          course: p.course,
          completionPercentage: p.completionPercentage,
          status: p.status,
          avatarUrl: p.user.avatarUrl,
          totalRecommendations: p.recommendations.length,
          pendingTasks: p.actionItems.filter((i) => i.status !== ActionItemStatus.COMPLETED).length,
          lastSessionDate: p.mentoringSessions[0]?.sessionDate || null,
          nextFollowUpDate: p.mentoringSessions[0]?.nextFollowUpDate || null,
        })),
        upcomingSessions,
      },
    });
  } catch (error: any) {
    console.error('Mentor dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentor dashboard metrics' });
  }
};
