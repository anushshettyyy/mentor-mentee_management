import { Router } from 'express';
import { getEndorsements, makeEndorsementDecision } from '../controllers/endorsement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getEndorsements);
router.post('/:id/decision', makeEndorsementDecision);

export default router;
