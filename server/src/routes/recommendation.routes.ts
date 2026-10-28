import { Router } from 'express';
import { getRecommendations, createRecommendation, submitForEndorsement } from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getRecommendations);
router.post('/', createRecommendation);
router.post('/:id/submit-endorsement', submitForEndorsement);

export default router;
