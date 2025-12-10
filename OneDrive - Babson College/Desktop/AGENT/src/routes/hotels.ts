import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as hotelController from '../controllers/hotelController';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER'), hotelController.getHotels);
router.get('/:id', hotelController.getHotel);
router.put('/:id', authorize('ADMIN', 'MANAGER'), hotelController.updateHotel);
router.get('/:id/stats', hotelController.getHotelStats);

export default router;

