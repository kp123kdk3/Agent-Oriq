import { PrismaClient, Task, TaskType, TaskPriority, TaskStatus } from '@prisma/client';
import { openAIService } from '../ai/openaiService';

const prisma = new PrismaClient();

export interface TaskCreateInput {
  title: string;
  description?: string;
  type: TaskType;
  priority?: TaskPriority;
  hotelId: string;
  roomId?: string;
  guestId?: string;
  bookingId?: string;
  assignedToId?: string;
  dueAt?: Date;
  slaMinutes?: number;
  metadata?: any;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string;
  dueAt?: Date;
  completedAt?: Date;
}

export class TaskService {
  /**
   * Create a new task
   */
  async createTask(input: TaskCreateInput, createdById?: string): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        ...input,
        priority: input.priority || 'MEDIUM',
        status: 'PENDING',
        createdById,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Check for overdue tasks and send alerts
    this.checkSLA(task);

    return task;
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, hotelId: string, input: TaskUpdateInput): Promise<Task> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        hotelId,
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // If marking as completed, set completedAt
    if (input.status === 'COMPLETED' && !input.completedAt) {
      input.completedAt = new Date();
    }

    // If status changed from completed, clear completedAt
    if (input.status && input.status !== 'COMPLETED' && task.status === 'COMPLETED') {
      input.completedAt = null;
    }

    return prisma.task.update({
      where: { id: taskId },
      data: input,
      include: {
        assignedTo: true,
        room: true,
        guest: true,
        booking: true,
      },
    });
  }

  /**
   * Assign task to a user
   */
  async assignTask(taskId: string, hotelId: string, userId: string): Promise<Task> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        hotelId,
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId: userId,
        status: task.status === 'PENDING' ? 'IN_PROGRESS' : task.status,
      },
      include: {
        assignedTo: true,
      },
    });
  }

  /**
   * Get tasks with filters
   */
  async getTasks(
    hotelId: string,
    filters: {
      status?: TaskStatus;
      type?: TaskType;
      priority?: TaskPriority;
      assignedToId?: string;
      roomId?: string;
      guestId?: string;
      overdue?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ tasks: Task[]; total: number }> {
    const where: any = {
      hotelId,
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.assignedToId && { assignedToId: filters.assignedToId }),
      ...(filters.roomId && { roomId: filters.roomId }),
      ...(filters.guestId && { guestId: filters.guestId }),
      ...(filters.overdue && {
        status: { not: 'COMPLETED' },
        dueAt: { lt: new Date() },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          room: {
            select: {
              id: true,
              number: true,
              type: true,
            },
          },
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
        orderBy: [
          { priority: 'desc' },
          { dueAt: 'asc' },
          { createdAt: 'desc' },
        ],
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string, hotelId: string): Promise<Task | null> {
    return prisma.task.findFirst({
      where: {
        id: taskId,
        hotelId,
      },
      include: {
        assignedTo: true,
        createdBy: true,
        room: true,
        guest: true,
        booking: true,
        messages: true,
      },
    });
  }

  /**
   * Check SLA and mark overdue tasks
   */
  private async checkSLA(task: Task): Promise<void> {
    if (!task.slaMinutes || !task.dueAt) {
      return;
    }

    const now = new Date();
    const dueTime = new Date(task.dueAt.getTime() - task.slaMinutes * 60 * 1000);

    if (now > dueTime && task.status !== 'COMPLETED') {
      await prisma.task.update({
        where: { id: task.id },
        data: { status: 'OVERDUE' },
      });

      // In production, send alert to management
      console.log(`Task ${task.id} is overdue!`);
    }
  }

  /**
   * Auto-assign task based on type and department
   */
  async autoAssignTask(taskId: string): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { hotel: true },
    });

    if (!task || task.assignedToId) {
      return null;
    }

    // Find appropriate user based on task type
    const departmentMap: Record<TaskType, string> = {
      HOUSEKEEPING: 'housekeeping',
      MAINTENANCE: 'engineering',
      CONCIERGE: 'concierge',
      FRONT_DESK: 'front-desk',
      GUEST_REQUEST: 'front-desk',
      WAKE_UP_CALL: 'front-desk',
      AMENITY_DELIVERY: 'housekeeping',
      ROOM_SERVICE: 'housekeeping',
      OTHER: 'front-desk',
    };

    const department = departmentMap[task.type];

    const user = await prisma.user.findFirst({
      where: {
        hotelId: task.hotelId,
        department,
        isActive: true,
      },
    });

    if (user) {
      return this.assignTask(taskId, task.hotelId, user.id);
    }

    return null;
  }
}

export const taskService = new TaskService();

