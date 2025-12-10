import { BaseIntegration, IntegrationConfig } from '../base/BaseIntegration';

export interface Booking {
  id: string;
  confirmationNumber: string;
  checkIn: Date;
  checkOut: Date;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber?: string;
  status: string;
  totalAmount?: number;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  status: string;
  floor?: number;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  loyaltyTier?: string;
}

export abstract class BasePMS extends BaseIntegration {
  /**
   * Get all bookings
   */
  abstract getBookings(startDate?: Date, endDate?: Date): Promise<Booking[]>;

  /**
   * Get a specific booking by ID
   */
  abstract getBooking(bookingId: string): Promise<Booking | null>;

  /**
   * Create a new booking
   */
  abstract createBooking(booking: Partial<Booking>): Promise<Booking>;

  /**
   * Update a booking
   */
  abstract updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking>;

  /**
   * Cancel a booking
   */
  abstract cancelBooking(bookingId: string): Promise<boolean>;

  /**
   * Get all rooms
   */
  abstract getRooms(): Promise<Room[]>;

  /**
   * Get room by number
   */
  abstract getRoom(roomNumber: string): Promise<Room | null>;

  /**
   * Update room status
   */
  abstract updateRoomStatus(roomNumber: string, status: string): Promise<boolean>;

  /**
   * Get guest information
   */
  abstract getGuest(guestId: string): Promise<Guest | null>;

  /**
   * Search guests
   */
  abstract searchGuests(query: string): Promise<Guest[]>;
}

