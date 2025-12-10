import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { openAIService } from '../services/ai/openaiService';

const prisma = new PrismaClient();

export const getUpsellOpportunities = async (req: AuthRequest, res: Response) => {
  try {
    const { status, guestId, bookingId, limit, offset } = req.query;
    
    const where: any = {
      hotelId: req.user!.hotelId,
      ...(status && { status: status as any }),
      ...(guestId && { guestId: guestId as string }),
      ...(bookingId && { bookingId: bookingId as string }),
    };

    const [opportunities, total] = await Promise.all([
      prisma.upsellOpportunity.findMany({
        where,
        include: {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          booking: {
            select: {
              id: true,
              confirmationNumber: true,
            },
          },
        },
        orderBy: { suggestedAt: 'desc' },
        take: limit ? parseInt(limit as string) : 50,
        skip: offset ? parseInt(offset as string) : 0,
      }),
      prisma.upsellOpportunity.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: { opportunities, total },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const offerUpsell = async (req: AuthRequest, res: Response) => {
  try {
    const opportunity = await prisma.upsellOpportunity.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: {
        status: 'OFFERED',
        offeredAt: new Date(),
      },
    });

    res.json({
      status: 'success',
      data: { opportunity },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const acceptUpsell = async (req: AuthRequest, res: Response) => {
  try {
    const opportunity = await prisma.upsellOpportunity.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    res.json({
      status: 'success',
      data: { opportunity },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const declineUpsell = async (req: AuthRequest, res: Response) => {
  try {
    const opportunity = await prisma.upsellOpportunity.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: {
        status: 'DECLINED',
      },
    });

    res.json({
      status: 'success',
      data: { opportunity },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getUpsellAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = req.user!.hotelId;
    
    const [total, accepted, declined, pending, revenue] = await Promise.all([
      prisma.upsellOpportunity.count({ where: { hotelId } }),
      prisma.upsellOpportunity.count({ where: { hotelId, status: 'ACCEPTED' } }),
      prisma.upsellOpportunity.count({ where: { hotelId, status: 'DECLINED' } }),
      prisma.upsellOpportunity.count({ where: { hotelId, status: 'PENDING' } }),
      prisma.upsellOpportunity.aggregate({
        where: { hotelId, status: 'ACCEPTED' },
        _sum: { revenue: true },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        analytics: {
          total,
          accepted,
          declined,
          pending,
          totalRevenue: revenue._sum.revenue || 0,
          acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
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

