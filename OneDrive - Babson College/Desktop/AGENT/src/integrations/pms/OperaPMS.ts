import { BasePMS, Booking, Room, Guest } from './BasePMS';
import axios from 'axios';

export class OperaPMS extends BasePMS {
  private apiClient: any;

  constructor(config: any, hotelId: string) {
    super(config, hotelId);
    this.apiClient = axios.create({
      baseURL: config.apiUrl || 'https://api.opera.com',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async getStatus(): Promise<any> {
    const connected = await this.testConnection();
    return {
      connected,
      lastSync: new Date(),
    };
  }

  async sync(): Promise<void> {
    // Sync bookings, rooms, guests from Opera
    await Promise.all([
      this.syncBookings(),
      this.syncRooms(),
      this.syncGuests(),
    ]);
  }

  async getBookings(startDate?: Date, endDate?: Date): Promise<Booking[]> {
    try {
      const response = await this.apiClient.get('/bookings', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      });
      return response.data.map(this.mapOperaBooking);
    } catch (error: any) {
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    try {
      const response = await this.apiClient.get(`/bookings/${bookingId}`);
      return this.mapOperaBooking(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    try {
      const response = await this.apiClient.post('/bookings', this.mapToOperaBooking(booking));
      return this.mapOperaBooking(response.data);
    } catch (error: any) {
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    try {
      const response = await this.apiClient.patch(`/bookings/${bookingId}`, this.mapToOperaBooking(updates));
      return this.mapOperaBooking(response.data);
    } catch (error: any) {
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      await this.apiClient.delete(`/bookings/${bookingId}`);
      return true;
    } catch (error: any) {
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async getRooms(): Promise<Room[]> {
    try {
      const response = await this.apiClient.get('/rooms');
      return response.data.map(this.mapOperaRoom);
    } catch (error: any) {
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async getRoom(roomNumber: string): Promise<Room | null> {
    try {
      const response = await this.apiClient.get(`/rooms/${roomNumber}`);
      return this.mapOperaRoom(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async updateRoomStatus(roomNumber: string, status: string): Promise<boolean> {
    try {
      await this.apiClient.patch(`/rooms/${roomNumber}`, { status });
      return true;
    } catch (error: any) {
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async getGuest(guestId: string): Promise<Guest | null> {
    try {
      const response = await this.apiClient.get(`/guests/${guestId}`);
      return this.mapOperaGuest(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  async searchGuests(query: string): Promise<Guest[]> {
    try {
      const response = await this.apiClient.get('/guests/search', {
        params: { q: query },
      });
      return response.data.map(this.mapOperaGuest);
    } catch (error: any) {
      throw new Error(`Opera API error: ${error.message}`);
    }
  }

  private async syncBookings(): Promise<void> {
    const bookings = await this.getBookings();
    // In production, sync to local database
    console.log(`Synced ${bookings.length} bookings from Opera`);
  }

  private async syncRooms(): Promise<void> {
    const rooms = await this.getRooms();
    // In production, sync to local database
    console.log(`Synced ${rooms.length} rooms from Opera`);
  }

  private async syncGuests(): Promise<void> {
    // In production, implement guest syncing
    console.log('Synced guests from Opera');
  }

  // Mapping functions (adapt Opera API format to our format)
  private mapOperaBooking(data: any): Booking {
    return {
      id: data.id,
      confirmationNumber: data.confirmationNumber,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      guestName: `${data.guest?.firstName} ${data.guest?.lastName}`,
      guestEmail: data.guest?.email,
      guestPhone: data.guest?.phone,
      roomNumber: data.room?.number,
      status: data.status,
      totalAmount: data.totalAmount,
    };
  }

  private mapToOperaBooking(booking: Partial<Booking>): any {
    return {
      checkIn: booking.checkIn?.toISOString(),
      checkOut: booking.checkOut?.toISOString(),
      guest: {
        firstName: booking.guestName?.split(' ')[0],
        lastName: booking.guestName?.split(' ')[1],
        email: booking.guestEmail,
        phone: booking.guestPhone,
      },
      room: booking.roomNumber ? { number: booking.roomNumber } : undefined,
      totalAmount: booking.totalAmount,
    };
  }

  private mapOperaRoom(data: any): Room {
    return {
      id: data.id,
      number: data.number,
      type: data.type,
      status: data.status,
      floor: data.floor,
    };
  }

  private mapOperaGuest(data: any): Guest {
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      loyaltyTier: data.loyaltyTier,
    };
  }
}

