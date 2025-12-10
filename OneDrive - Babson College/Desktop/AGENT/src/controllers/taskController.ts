import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { taskService } from '../services/tasks/taskService';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, priority, assignedToId, roomId, guestId, overdue, limit, offset } = req.query;
    
    const result = await taskService.getTasks(req.user!.hotelId, {
      status: status as any,
      type: type as any,
      priority: priority as any,
      assignedToId: assignedToId as string,
      roomId: roomId as string,
      guestId: guestId as string,
      overdue: overdue === 'true',
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

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.createTask(
      {
        ...req.body,
        hotelId: req.user!.hotelId,
      },
      req.user!.id
    );

    res.status(201).json({
      status: 'success',
      data: { task },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.getTask(req.params.id, req.user!.hotelId);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    res.json({
      status: 'success',
      data: { task },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.user!.hotelId,
      req.body
    );

    res.json({
      status: 'success',
      data: { task },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const task = await taskService.updateTask(
      req.params.id,
      req.user!.hotelId,
      { status }
    );

    res.json({
      status: 'success',
      data: { task },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const assignTask = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const task = await taskService.assignTask(
      req.params.id,
      req.user!.hotelId,
      userId
    );

    res.json({
      status: 'success',
      data: { task },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getTaskHistory = async (req: AuthRequest, res: Response) => {
  try {
    // In production, implement task history/audit log
    res.json({
      status: 'success',
      data: { history: [] },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

