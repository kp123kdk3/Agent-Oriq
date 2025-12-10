import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { callService } from '../services/calls/callService';

export const getCalls = async (req: AuthRequest, res: Response) => {
  try {
    const { status, direction, guestId, startDate, endDate, limit, offset } = req.query;
    
    const result = await callService.getCalls(req.user!.hotelId, {
      status: status as any,
      direction: direction as any,
      guestId: guestId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getCall = async (req: AuthRequest, res: Response) => {
  try {
    const call = await callService.getCall(req.params.id, req.user!.hotelId);
    
    if (!call) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found',
      });
    }

    res.json({
      status: 'success',
      data: { call },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const handleTwilioWebhook = async (req: any, res: Response) => {
  try {
    const call = await callService.handleTwilioWebhook(req.body);
    res.json({ status: 'success', data: { call } });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getCallTranscript = async (req: AuthRequest, res: Response) => {
  try {
    const call = await callService.getCall(req.params.id, req.user!.hotelId);
    
    if (!call) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found',
      });
    }

    res.json({
      status: 'success',
      data: { transcript: call.transcript },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getCallRecording = async (req: AuthRequest, res: Response) => {
  try {
    const call = await callService.getCall(req.params.id, req.user!.hotelId);
    
    if (!call) {
      return res.status(404).json({
        status: 'error',
        message: 'Call not found',
      });
    }

    res.json({
      status: 'success',
      data: { recordingUrl: call.recordingUrl },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

