import express from 'express';
import { authenticate } from '../middleware/auth';
import * as messageController from '../controllers/messageController';

const router = express.Router();

router.use(authenticate);

router.get('/', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.get('/:id', messageController.getMessage);
router.post('/webhook/:channel', messageController.handleWebhook);

export default router;

