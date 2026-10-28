import { Role } from '@prisma/client';
import { prisma } from '../prisma';

export interface AuditParams {
  actorId?: string;
  actorRole?: Role;
  action: string;
  entityType: string;
  entityId?: string;
  changeSummary?: string;
  ipAddress?: string;
  userAgent?: string | string[];
}

export const logAudit = async (params: AuditParams) => {
  try {
    const ua = Array.isArray(params.userAgent) ? params.userAgent.join(', ') : params.userAgent;
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorRole: params.actorRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changeSummary: params.changeSummary,
        ipAddress: params.ipAddress,
        userAgent: ua,
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
