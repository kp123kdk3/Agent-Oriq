import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { messageService } from '../services/messaging/messageService';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { channel, guestId, bookingId, startDate, endDate, limit, offset } = req.query;
    
    const result = await messageService.getMessages(req.user!.hotelId, {
      channel: channel as any,
      guestId: guestId as string,
      bookingId: bookingId as string,
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

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { channel, content, guestId, bookingId } = req.body;
    
    const message = await messageService.sendMessage({
      channel,
      content,
      hotelId: req.user!.hotelId,
      guestId,
      bookingId,
    });

    res.json({
      status: 'success',
      data: { message },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await messageService.getMessage(req.params.id, req.user!.hotelId);
    
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found',
      });
    }

    res.json({
      status: 'success',
      data: { message },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const handleWebhook = async (req: any, res: Response) => {
  try {
    const channel = req.params.channel;
    const { content, phoneNumber, email, guestId, bookingId } = req.body;
    
    // Find hotel - in production, use webhook secret verification
    const hotelId = req.user?.hotelId || req.body.hotelId;
    
    if (!hotelId) {
      return res.status(400).json({
        status: 'error',
        message: 'Hotel ID required',
      });
    }

    const result = await messageService.handleIncomingMessage({
      channel: channel.toUpperCase() as any,
      direction: 'INBOUND',
      content,
      hotelId,
      guestId,
      bookingId,
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

