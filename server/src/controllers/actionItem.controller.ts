import { Response } from 'express';
import { z } from 'zod';
import { Role, ActionItemStatus, Priority } from '@prisma/client';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

export const getActionItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { studentProfileId } = req.query;
    let whereClause: any = {};

    if (user.role === Role.STUDENT) {
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

    const items = await prisma.actionItem.findMany({
      where: whereClause,
      include: {
        studentProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        facultyProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        recommendation: { select: { id: true, title: true, category: true } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });

    res.json({ success: true, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch action items' });
  }
};

const updateActionItemSchema = z.object({
  status: z.nativeEnum(ActionItemStatus).optional(),
  studentNotes: z.string().optional().nullable(),
  mentorFeedback: z.string().optional().nullable(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().optional().nullable(),
});

export const updateActionItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const item = await prisma.actionItem.findUnique({
      where: { id },
      include: { studentProfile: true },
    });

    if (!item) {
      res.status(404).json({ success: false, message: 'Action item not found' });
      return;
    }

    // Role scope verification
    if (user.role === Role.STUDENT && item.studentProfileId !== user.studentProfileId) {
      res.status(403).json({ success: false, message: 'Unauthorized access to action item' });
      return;
    }

    const parseResult = updateActionItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parseResult.error.errors });
      return;
    }

    const data = parseResult.data;

    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === ActionItemStatus.COMPLETED) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (data.studentNotes !== undefined) updateData.studentNotes = data.studentNotes;
    if (data.mentorFeedback !== undefined && user.role !== Role.STUDENT) {
      updateData.mentorFeedback = data.mentorFeedback;
    }
    if (data.priority && user.role !== Role.STUDENT) updateData.priority = data.priority;
    if (data.dueDate && user.role !== Role.STUDENT) updateData.dueDate = new Date(data.dueDate);

    const updated = await prisma.actionItem.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      actorId: user.userId,
      actorRole: user.role,
      action: 'ACTION_ITEM_UPDATE',
      entityType: 'ActionItem',
      entityId: id,
      changeSummary: `Updated action item: status ${updated.status}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, item: updated, message: 'Action item updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update action item' });
  }
};
