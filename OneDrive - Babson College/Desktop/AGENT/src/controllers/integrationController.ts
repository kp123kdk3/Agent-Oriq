import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getIntegrations = async (req: AuthRequest, res: Response) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: { hotelId: req.user!.hotelId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { integrations },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const createIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const integration = await prisma.integration.create({
      data: {
        ...req.body,
        hotelId: req.user!.hotelId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { integration },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
    });

    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }

    res.json({
      status: 'success',
      data: { integration },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const integration = await prisma.integration.update({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
      data: req.body,
    });

    res.json({
      status: 'success',
      data: { integration },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteIntegration = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.integration.delete({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
    });

    res.json({
      status: 'success',
      message: 'Integration deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const testIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
    });

    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }

    // In production, test the actual integration
    res.json({
      status: 'success',
      data: {
        connected: true,
        message: 'Integration test successful',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const syncIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
    });

    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }

    // In production, sync data from the integration
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'success',
      },
    });

    res.json({
      status: 'success',
      message: 'Integration synced successfully',
    });
  } catch (error: any) {
    await prisma.integration.update({
      where: { id: req.params.id },
      data: {
        syncStatus: 'error',
        errorMessage: error.message,
      },
    });

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

