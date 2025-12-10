import express from 'express';
import { authenticate } from '../middleware/auth';
import * as upsellController from '../controllers/upsellController';

const router = express.Router();

router.use(authenticate);

router.get('/', upsellController.getUpsellOpportunities);
router.post('/:id/offer', upsellController.offerUpsell);
router.patch('/:id/accept', upsellController.acceptUpsell);
router.patch('/:id/decline', upsellController.declineUpsell);
router.get('/analytics', upsellController.getUpsellAnalytics);

export default router;

