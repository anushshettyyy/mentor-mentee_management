import { Response } from 'express';
import { z } from 'zod';
import { Role, EndorsementStatus, RecommendationStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

export const getEndorsements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { status } = req.query;
    let whereClause: any = {};

    if (status) {
      whereClause.status = status as EndorsementStatus;
    }

    if (user.role === Role.MENTOR) {
      whereClause.requestedByMentorId = user.facultyProfileId;
    } else if (user.role === Role.STUDENT) {
      whereClause.studentProfileId = user.studentProfileId;
    }

    const endorsements = await prisma.endorsement.findMany({
      where: whereClause,
      include: {
        recommendation: true,
        studentProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        requestedByMentor: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        reviewedByHod: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, endorsements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch endorsements' });
  }
};

const endorsementDecisionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']),
  decisionNotes: z.string().min(5, 'Mandatory explanation/notes required for audit trail'),
});

export const makeEndorsementDecision = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    // Only HOD or ADMIN can endorse
    if (!user || (user.role !== Role.HOD && user.role !== Role.ADMIN)) {
      res.status(403).json({ success: false, message: 'Unauthorized. Only HOD or Administrator can endorse records.' });
      return;
    }

    const parseResult = endorsementDecisionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parseResult.error.errors });
      return;
    }

    const { status, decisionNotes } = parseResult.data;

    const endorsement = await prisma.endorsement.findUnique({
      where: { id },
      include: {
        recommendation: true,
        studentProfile: { include: { user: true } },
        requestedByMentor: { include: { user: true } },
      },
    });

    if (!endorsement) {
      res.status(404).json({ success: false, message: 'Endorsement request not found' });
      return;
    }

    // Update endorsement record without overwriting original snapshot!
    const updatedEndorsement = await prisma.endorsement.update({
      where: { id },
      data: {
        status: status as EndorsementStatus,
        decisionNotes,
        reviewedByHodId: user.facultyProfileId || undefined,
        reviewedAt: new Date(),
      },
      include: {
        requestedByMentor: { include: { user: true } },
        studentProfile: { include: { user: true } },
      },
    });

    // If linked to recommendation, update its status accordingly
    if (endorsement.recommendationId) {
      let recStatus: RecommendationStatus = RecommendationStatus.IN_PROGRESS;
      if (status === 'APPROVED') recStatus = RecommendationStatus.ENDORSED;
      else if (status === 'REJECTED') recStatus = RecommendationStatus.REJECTED;

      await prisma.recommendation.update({
        where: { id: endorsement.recommendationId },
        data: { status: recStatus },
      });
    }

    // Notify mentor
    if ((endorsement as any).requestedByMentor?.userId) {
      await prisma.notification.create({
        data: {
          userId: (endorsement as any).requestedByMentor.userId,
          title: `Endorsement ${status}`,
          message: `HOD marked endorsement as ${status}. Notes: "${decisionNotes.slice(0, 80)}"`,
          type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
          link: '/mentor/mentees',
        },
      });
    }

    // Notify student if student profile exists
    if ((endorsement as any).studentProfile?.userId) {
      await prisma.notification.create({
        data: {
          userId: (endorsement as any).studentProfile.userId,
          title: `Mentoring Record Endorsement ${status}`,
          message: `Department HOD reviewed record with status: ${status}`,
          type: status === 'APPROVED' ? 'SUCCESS' : 'INFO',
          link: '/mentee/recommendations',
        },
      });
    }

    await logAudit({
      actorId: user.userId,
      actorRole: user.role,
      action: 'ENDORSEMENT_DECISION',
      entityType: 'Endorsement',
      entityId: id,
      changeSummary: `HOD decision: ${status}. Notes: ${decisionNotes}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      endorsement: updatedEndorsement,
      message: `Endorsement recorded as ${status}`,
    });
  } catch (error: any) {
    console.error('Endorsement decision error:', error);
    res.status(500).json({ success: false, message: 'Failed to process endorsement decision' });
  }
};
