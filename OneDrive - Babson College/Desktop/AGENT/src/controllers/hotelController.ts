import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHotels = async (req: AuthRequest, res: Response) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        roomCount: true,
        createdAt: true,
      },
    });

    res.json({
      status: 'success',
      data: { hotels },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getHotel = async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        country: true,
        phone: true,
        email: true,
        timezone: true,
        currency: true,
        roomCount: true,
        pmsType: true,
        pbxType: true,
        settings: true,
      },
    });

    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found',
      });
    }

    res.json({
      status: 'success',
      data: { hotel },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateHotel = async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await prisma.hotel.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      status: 'success',
      data: { hotel },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getHotelStats = async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = req.params.id;
    const [calls, messages, tasks, bookings] = await Promise.all([
      prisma.call.count({ where: { hotelId } }),
      prisma.message.count({ where: { hotelId } }),
      prisma.task.count({ where: { hotelId } }),
      prisma.booking.count({ where: { hotelId } }),
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          calls,
          messages,
          tasks,
          bookings,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

