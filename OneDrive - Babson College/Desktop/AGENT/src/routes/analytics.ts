import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as analyticsController from '../controllers/analyticsController';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/calls', analyticsController.getCallAnalytics);
router.get('/messages', analyticsController.getMessageAnalytics);
router.get('/tasks', analyticsController.getTaskAnalytics);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/predictions', analyticsController.getPredictions);

export default router;

