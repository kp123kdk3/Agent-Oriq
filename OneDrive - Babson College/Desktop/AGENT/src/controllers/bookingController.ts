import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status, guestId, startDate, endDate, limit, offset } = req.query;
    
    const where: any = {
      hotelId: req.user!.hotelId,
      ...(status && { status: status as any }),
      ...(guestId && { guestId: guestId as string }),
      ...(startDate &&
        endDate && {
          OR: [
            {
              checkIn: { lte: new Date(endDate as string) },
              checkOut: { gte: new Date(startDate as string) },
            },
          ],
        }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          room: {
            select: {
              id: true,
              number: true,
              type: true,
            },
          },
        },
        orderBy: { checkIn: 'desc' },
        take: limit ? parseInt(limit as string) : 50,
        skip: offset ? parseInt(offset as string) : 0,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: { bookings, total },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.create({
      data: {
        ...req.body,
        hotelId: req.user!.hotelId,
        confirmationNumber: `CONF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      include: {
        guest: true,
        room: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { booking },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      include: {
        guest: true,
        room: true,
        tasks: true,
        messages: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found',
      });
    }

    res.json({
      status: 'success',
      data: { booking },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: req.body,
      include: {
        guest: true,
        room: true,
      },
    });

    res.json({
      status: 'success',
      data: { booking },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: {
        status: 'CHECKED_IN',
      },
      include: {
        guest: true,
        room: true,
      },
    });

    res.json({
      status: 'success',
      data: { booking },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: {
        status: 'CHECKED_OUT',
      },
      include: {
        guest: true,
        room: true,
      },
    });

    res.json({
      status: 'success',
      data: { booking },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: {
        status: 'CANCELLED',
      },
    });

    res.json({
      status: 'success',
      data: { booking },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

