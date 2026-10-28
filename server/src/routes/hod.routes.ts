import { Router } from 'express';
import {
  getDepartmentOverview,
  getAssignments,
  assignMentor,
  getAuditLogs,
  getUsers,
  createUser,
} from '../controllers/hod.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', getDepartmentOverview);
router.get('/assignments', getAssignments);
router.post('/assign', assignMentor);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getUsers);
router.post('/users', createUser);

export default router;
