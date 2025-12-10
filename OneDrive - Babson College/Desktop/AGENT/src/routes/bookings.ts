import express from 'express';
import { authenticate } from '../middleware/auth';
import * as bookingController from '../controllers/bookingController';

const router = express.Router();

router.use(authenticate);

router.get('/', bookingController.getBookings);
router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.getBooking);
router.put('/:id', bookingController.updateBooking);
router.patch('/:id/checkin', bookingController.checkIn);
router.patch('/:id/checkout', bookingController.checkOut);
router.delete('/:id', bookingController.cancelBooking);

export default router;

