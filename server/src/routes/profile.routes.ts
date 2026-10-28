import { Router } from 'express';
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  submitMyStudentProfile,
  getStudentProfileById,
  reviewStudentProfile,
  getMentorDirectory,
} from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/student/me', getMyStudentProfile);
router.put('/student/me', updateMyStudentProfile);
router.post('/student/submit', submitMyStudentProfile);
router.get('/student/:id', getStudentProfileById);
router.put('/student/:id/review', reviewStudentProfile);
router.get('/mentors', getMentorDirectory);

export default router;
