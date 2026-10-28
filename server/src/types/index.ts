import { Request } from 'express';
import { Role } from '@prisma/client';

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: Role;
  studentProfileId?: string;
  facultyProfileId?: string;
  departmentId?: string;
}

export interface AuthRequest extends Request {
  user?: UserTokenPayload;
}
