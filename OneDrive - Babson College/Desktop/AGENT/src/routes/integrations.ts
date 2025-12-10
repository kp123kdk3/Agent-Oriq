import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as integrationController from '../controllers/integrationController';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/', integrationController.getIntegrations);
router.post('/', integrationController.createIntegration);
router.get('/:id', integrationController.getIntegration);
router.put('/:id', integrationController.updateIntegration);
router.delete('/:id', integrationController.deleteIntegration);
router.post('/:id/test', integrationController.testIntegration);
router.post('/:id/sync', integrationController.syncIntegration);

export default router;

