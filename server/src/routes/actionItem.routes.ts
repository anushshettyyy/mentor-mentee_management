import { Router } from 'express';
import { getActionItems, updateActionItem } from '../controllers/actionItem.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getActionItems);
router.put('/:id', updateActionItem);

export default router;
