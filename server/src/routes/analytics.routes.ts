import { Router } from 'express';
import { getMenteeDashboardData, getMentorDashboardData } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/mentee-dashboard', getMenteeDashboardData);
router.get('/mentor-dashboard', getMentorDashboardData);

export default router;
