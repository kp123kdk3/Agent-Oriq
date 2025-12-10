import { PrismaClient, Message, MessageChannel, MessageDirection, MessageStatus } from '@prisma/client';
import { openAIService } from '../ai/openaiService';

const prisma = new PrismaClient();

export interface MessageCreateInput {
  channel: MessageChannel;
  direction: MessageDirection;
  content: string;
  hotelId: string;
  guestId?: string;
  bookingId?: string;
  language?: string;
}

export interface MessageSendInput {
  channel: MessageChannel;
  content: string;
  hotelId: string;
  guestId: string;
  bookingId?: string;
}

export class MessageService {
  /**
   * Send a message to a guest
   */
  async sendMessage(input: MessageSendInput): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        channel: input.channel,
        direction: 'OUTBOUND',
        content: input.content,
        hotelId: input.hotelId,
        guestId: input.guestId,
        bookingId: input.bookingId,
        status: 'SENT',
      },
    });

    // In production, integrate with actual messaging providers
    // (Twilio for SMS, WhatsApp Business API, SendGrid for email, etc.)
    await this.deliverMessage(message);

    return message;
  }

  /**
   * Handle incoming message
   */
  async handleIncomingMessage(input: MessageCreateInput): Promise<{
    message: Message;
    aiResponse?: Message;
  }> {
    // Create incoming message record
    const message = await prisma.message.create({
      data: {
        ...input,
        direction: 'INBOUND',
        status: 'DELIVERED',
      },
      include: {
        guest: true,
        booking: true,
        hotel: true,
      },
    });

    // Generate AI response
    const aiResponse = await this.generateAIResponse(message);

    return {
      message,
      aiResponse: aiResponse || undefined,
    };
  }

  /**
   * Generate AI response for incoming message
   */
  private async generateAIResponse(message: Message): Promise<Message | null> {
    try {
      const context = {
        hotelName: (message as any).hotel?.name,
        guestName: (message as any).guest?.firstName,
        bookingInfo: (message as any).booking,
        language: message.language || 'en',
      };

      const aiResponse = await openAIService.generateResponse(message.content, context);

      // Check if AI can handle this autonomously or needs human escalation
      if (aiResponse.urgency && aiResponse.urgency > 7) {
        // High urgency - create task for staff
        await this.createTaskFromMessage(message, aiResponse);
      }

      // Create AI response message
      const responseMessage = await prisma.message.create({
        data: {
          channel: message.channel,
          direction: 'OUTBOUND',
          content: aiResponse.message,
          aiResponse: true,
          hotelId: message.hotelId,
          guestId: message.guestId,
          bookingId: message.bookingId,
          language: message.language,
          status: 'SENT',
        },
      });

      // Update original message with intent and sentiment
      await prisma.message.update({
        where: { id: message.id },
        data: {
          intent: aiResponse.intent,
          sentiment: aiResponse.sentiment,
        },
      });

      await this.deliverMessage(responseMessage);

      return responseMessage;
    } catch (error: any) {
      console.error('AI response generation error:', error);
      return null;
    }
  }

  /**
   * Create task from high-urgency message
   */
  private async createTaskFromMessage(message: Message, aiResponse: any): Promise<void> {
    try {
      await prisma.task.create({
        data: {
          title: `Guest Request: ${aiResponse.intent || 'General'}`,
          description: message.content,
          type: this.mapIntentToTaskType(aiResponse.intent),
          priority: aiResponse.urgency && aiResponse.urgency > 8 ? 'URGENT' : 'HIGH',
          hotelId: message.hotelId,
          guestId: message.guestId,
          bookingId: message.bookingId,
          metadata: {
            source: 'message',
            messageId: message.id,
            channel: message.channel,
          },
        },
      });
    } catch (error: any) {
      console.error('Task creation error:', error);
    }
  }

  /**
   * Map message intent to task type
   */
  private mapIntentToTaskType(intent?: string): string {
    const mapping: Record<string, string> = {
      request: 'GUEST_REQUEST',
      complaint: 'FRONT_DESK',
      maintenance: 'MAINTENANCE',
      housekeeping: 'HOUSEKEEPING',
      concierge: 'CONCIERGE',
    };

    return mapping[intent || ''] || 'OTHER';
  }

  /**
   * Deliver message via appropriate channel
   */
  private async deliverMessage(message: Message): Promise<void> {
    // In production, integrate with actual providers
    switch (message.channel) {
      case 'SMS':
        // Integrate with Twilio SMS
        break;
      case 'WHATSAPP':
        // Integrate with WhatsApp Business API
        break;
      case 'EMAIL':
        // Integrate with SendGrid/Mailgun
        break;
      case 'WEB_CHAT':
        // WebSocket to frontend
        break;
      default:
        console.log(`Message delivery for ${message.channel} not implemented`);
    }

    // Update status to delivered
    await prisma.message.update({
      where: { id: message.id },
      data: { status: 'DELIVERED' },
    });
  }

  /**
   * Get messages for a hotel with filters
   */
  async getMessages(
    hotelId: string,
    filters: {
      channel?: MessageChannel;
      guestId?: string;
      bookingId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ messages: Message[]; total: number }> {
    const where: any = {
      hotelId,
      ...(filters.channel && { channel: filters.channel }),
      ...(filters.guestId && { guestId: filters.guestId }),
      ...(filters.bookingId && { bookingId: filters.bookingId }),
      ...(filters.startDate &&
        filters.endDate && {
          createdAt: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
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
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.message.count({ where }),
    ]);

    return { messages, total };
  }

  /**
   * Get a single message by ID
   */
  async getMessage(messageId: string, hotelId: string): Promise<Message | null> {
    return prisma.message.findFirst({
      where: {
        id: messageId,
        hotelId,
      },
      include: {
        guest: true,
        booking: true,
        task: true,
      },
    });
  }
}

export const messageService = new MessageService();

