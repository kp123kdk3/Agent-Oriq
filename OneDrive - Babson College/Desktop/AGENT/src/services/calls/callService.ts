import { PrismaClient, Call, CallStatus, CallDirection } from '@prisma/client';
import twilio from 'twilio';
import { openAIService } from '../ai/openaiService';

const prisma = new PrismaClient();

const twilioClient = process.env.TWILIO_ACCOUNT_SID
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export interface CallCreateInput {
  phoneNumber: string;
  direction: CallDirection;
  hotelId: string;
  guestId?: string;
  bookingId?: string;
}

export interface CallUpdateInput {
  status?: CallStatus;
  duration?: number;
  transcript?: string;
  summary?: string;
  intent?: string;
  sentiment?: string;
  urgency?: number;
  recordingUrl?: string;
}

export class CallService {
  /**
   * Create a new call record
   */
  async createCall(input: CallCreateInput): Promise<Call> {
    return prisma.call.create({
      data: {
        phoneNumber: input.phoneNumber,
        direction: input.direction,
        hotelId: input.hotelId,
        guestId: input.guestId,
        bookingId: input.bookingId,
        status: 'IN_PROGRESS',
      },
    });
  }

  /**
   * Update call with transcript and analysis
   */
  async updateCall(callId: string, input: CallUpdateInput): Promise<Call> {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        hotel: true,
        guest: true,
        booking: true,
      },
    });

    if (!call) {
      throw new Error('Call not found');
    }

    // If transcript is provided, analyze it with AI
    if (input.transcript && !input.intent) {
      const analysis = await openAIService.analyzeCall(input.transcript, {
        hotelName: call.hotel.name,
        guestName: call.guest?.firstName,
        bookingInfo: call.booking,
      });

      input.intent = analysis.intent;
      input.sentiment = analysis.sentiment;
      input.urgency = analysis.urgency;
      input.summary = analysis.summary || input.summary;
    }

    return prisma.call.update({
      where: { id: callId },
      data: input,
    });
  }

  /**
   * Get calls for a hotel with filters
   */
  async getCalls(
    hotelId: string,
    filters: {
      status?: CallStatus;
      direction?: CallDirection;
      guestId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ calls: Call[]; total: number }> {
    const where: any = {
      hotelId,
      ...(filters.status && { status: filters.status }),
      ...(filters.direction && { direction: filters.direction }),
      ...(filters.guestId && { guestId: filters.guestId }),
      ...(filters.startDate &&
        filters.endDate && {
          createdAt: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
    };

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        include: {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
      prisma.call.count({ where }),
    ]);

    return { calls, total };
  }

  /**
   * Get a single call by ID
   */
  async getCall(callId: string, hotelId: string): Promise<Call | null> {
    return prisma.call.findFirst({
      where: {
        id: callId,
        hotelId,
      },
      include: {
        guest: true,
        booking: true,
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Handle incoming Twilio webhook
   */
  async handleTwilioWebhook(data: any): Promise<Call> {
    const phoneNumber = data.From || data.Caller;
    const callSid = data.CallSid;

    // Find or create hotel based on Twilio number
    // In production, you'd have a mapping table
    const hotel = await prisma.hotel.findFirst({
      where: {
        pbxConfig: {
          path: ['twilio', 'phoneNumber'],
          equals: data.To,
        },
      },
    });

    if (!hotel) {
      throw new Error('Hotel not found for this phone number');
    }

    // Check if guest exists
    const guest = await prisma.guest.findFirst({
      where: {
        hotelId: hotel.id,
        phone: phoneNumber,
      },
    });

    // Create call record
    const call = await this.createCall({
      phoneNumber,
      direction: 'INBOUND',
      hotelId: hotel.id,
      guestId: guest?.id,
    });

    return call;
  }

  /**
   * Initiate outbound call via Twilio
   */
  async initiateOutboundCall(
    hotelId: string,
    phoneNumber: string,
    message?: string
  ): Promise<Call> {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Create call record
    const call = await this.createCall({
      phoneNumber,
      direction: 'OUTBOUND',
      hotelId,
    });

    // Make Twilio call
    try {
      const twilioCall = await twilioClient.calls.create({
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER || '',
        url: `${process.env.API_URL}/api/calls/webhook/twilio`,
        statusCallback: `${process.env.API_URL}/api/calls/webhook/twilio/status`,
      });

      // Update call with Twilio SID
      await prisma.call.update({
        where: { id: call.id },
        data: {
          // Store Twilio SID in metadata if needed
        },
      });
    } catch (error: any) {
      await prisma.call.update({
        where: { id: call.id },
        data: { status: 'FAILED' },
      });
      throw error;
    }

    return call;
  }
}

export const callService = new CallService();

