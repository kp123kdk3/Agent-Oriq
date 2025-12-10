import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getGuests = async (req: AuthRequest, res: Response) => {
  try {
    const { limit, offset, search } = req.query;
    
    const where: any = {
      hotelId: req.user!.hotelId,
      ...(search && {
        OR: [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
        ],
      }),
    };

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        take: limit ? parseInt(limit as string) : 50,
        skip: offset ? parseInt(offset as string) : 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.guest.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: { guests, total },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const createGuest = async (req: AuthRequest, res: Response) => {
  try {
    const guest = await prisma.guest.create({
      data: {
        ...req.body,
        hotelId: req.user!.hotelId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { guest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getGuest = async (req: AuthRequest, res: Response) => {
  try {
    const guest = await prisma.guest.findFirst({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!guest) {
      return res.status(404).json({
        status: 'error',
        message: 'Guest not found',
      });
    }

    res.json({
      status: 'success',
      data: { guest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateGuest = async (req: AuthRequest, res: Response) => {
  try {
    const guest = await prisma.guest.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: req.body,
    });

    res.json({
      status: 'success',
      data: { guest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getGuestHistory = async (req: AuthRequest, res: Response) => {
  try {
    const guestId = req.params.id;
    
    const [bookings, calls, messages, tasks] = await Promise.all([
      prisma.booking.findMany({
        where: { guestId, hotelId: req.user!.hotelId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.call.findMany({
        where: { guestId, hotelId: req.user!.hotelId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.message.findMany({
        where: { guestId, hotelId: req.user!.hotelId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.task.findMany({
        where: { guestId, hotelId: req.user!.hotelId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        history: {
          bookings,
          calls,
          messages,
          tasks,
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

