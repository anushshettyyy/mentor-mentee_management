import { Router } from 'express';
import { getSessions, createSession } from '../controllers/session.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSessions);
router.post('/', createSession);

export default router;
