import express from 'express';
import { authenticate } from '../middleware/auth';
import * as guestController from '../controllers/guestController';

const router = express.Router();

router.use(authenticate);

router.get('/', guestController.getGuests);
router.post('/', guestController.createGuest);
router.get('/:id', guestController.getGuest);
router.put('/:id', guestController.updateGuest);
router.get('/:id/history', guestController.getGuestHistory);

export default router;

