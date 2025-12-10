import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = req.user!.hotelId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      todayCalls,
      todayMessages,
      activeTasks,
      todayBookings,
      overdueTasks,
      pendingUpsells,
    ] = await Promise.all([
      prisma.call.count({
        where: {
          hotelId,
          createdAt: { gte: today },
        },
      }),
      prisma.message.count({
        where: {
          hotelId,
          createdAt: { gte: today },
        },
      }),
      prisma.task.count({
        where: {
          hotelId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
      prisma.booking.count({
        where: {
          hotelId,
          checkIn: { lte: new Date() },
          checkOut: { gte: new Date() },
          status: 'CHECKED_IN',
        },
      }),
      prisma.task.count({
        where: {
          hotelId,
          status: 'OVERDUE',
        },
      }),
      prisma.upsellOpportunity.count({
        where: {
          hotelId,
          status: 'PENDING',
        },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        dashboard: {
          todayCalls,
          todayMessages,
          activeTasks,
          todayBookings,
          overdueTasks,
          pendingUpsells,
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

export const getCallAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = req.user!.hotelId;
    const { startDate, endDate } = req.query;
    
    const where: any = {
      hotelId,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
    };

    const [total, byStatus, byIntent, avgDuration] = await Promise.all([
      prisma.call.count({ where }),
      prisma.call.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.call.groupBy({
        by: ['intent'],
        where,
        _count: true,
      }),
      prisma.call.aggregate({
        where: { ...where, duration: { not: null } },
        _avg: { duration: true },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        analytics: {
          total,
          byStatus,
          byIntent,
          avgDuration: avgDuration._avg.duration || 0,
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

export const getMessageAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = req.user!.hotelId;
    const { startDate, endDate } = req.query;
    
    const where: any = {
      hotelId,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
    };

    const [total, byChannel, aiResponses] = await Promise.all([
      prisma.message.count({ where }),
      prisma.message.groupBy({
        by: ['channel'],
        where,
        _count: true,
      }),
      prisma.message.count({
        where: { ...where, aiResponse: true },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        analytics: {
          total,
          byChannel,
          aiResponseRate: total > 0 ? (aiResponses / total) * 100 : 0,
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

export const getTaskAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = req.user!.hotelId;
    const { startDate, endDate } = req.query;
    
    const where: any = {
      hotelId,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
    };

    const [total, byStatus, byType, byPriority, avgCompletionTime] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.task.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      // Calculate average completion time
      prisma.task.findMany({
        where: { ...where, status: 'COMPLETED', completedAt: { not: null } },
        select: {
          createdAt: true,
          completedAt: true,
        },
      }),
    ]);

    const completionTimes = avgCompletionTime
      .map((task) => {
        if (task.completedAt) {
          return (task.completedAt.getTime() - task.createdAt.getTime()) / 1000 / 60; // minutes
        }
        return null;
      })
      .filter((time): time is number => time !== null);

    const avgCompletion = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    res.json({
      status: 'success',
      data: {
        analytics: {
          total,
          byStatus,
          byType,
          byPriority,
          avgCompletionTime: avgCompletion,
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

export const getRevenueAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = req.user!.hotelId;
    const { startDate, endDate } = req.query;
    
    const where: any = {
      hotelId,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
    };

    const [bookingRevenue, upsellRevenue] = await Promise.all([
      prisma.booking.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      prisma.upsellOpportunity.aggregate({
        where: { ...where, status: 'ACCEPTED' },
        _sum: { revenue: true },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        analytics: {
          bookingRevenue: bookingRevenue._sum.totalAmount || 0,
          upsellRevenue: upsellRevenue._sum.revenue || 0,
          totalRevenue:
            (bookingRevenue._sum.totalAmount || 0) + (upsellRevenue._sum.revenue || 0),
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

export const getPredictions = async (req: AuthRequest, res: Response) => {
  try {
    // In production, implement ML-based predictions
    res.json({
      status: 'success',
      data: {
        predictions: {
          expectedCalls: 0,
          expectedBookings: 0,
          recommendedStaffing: 0,
          maintenanceAlerts: [],
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

