import express from 'express';
import { authenticate } from '../middleware/auth';
import * as callController from '../controllers/callController';

const router = express.Router();

router.use(authenticate);

// Webhook endpoint for Twilio (no auth required)
router.post('/webhook/twilio', callController.handleTwilioWebhook);

// Protected routes
router.get('/', callController.getCalls);
router.get('/:id', callController.getCall);
router.post('/:id/transcript', callController.getCallTranscript);
router.get('/:id/recording', callController.getCallRecording);

export default router;

