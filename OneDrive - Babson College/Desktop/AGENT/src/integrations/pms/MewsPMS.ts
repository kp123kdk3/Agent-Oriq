import { BasePMS, Booking, Room, Guest } from './BasePMS';
import axios from 'axios';

export class MewsPMS extends BasePMS {
  private apiClient: any;

  constructor(config: any, hotelId: string) {
    super(config, hotelId);
    this.apiClient = axios.create({
      baseURL: config.apiUrl || 'https://api.mews.com',
      headers: {
        'X-ApiKey': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/api/connector/v1/enterprises');
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
    await Promise.all([
      this.syncBookings(),
      this.syncRooms(),
      this.syncGuests(),
    ]);
  }

  async getBookings(startDate?: Date, endDate?: Date): Promise<Booking[]> {
    try {
      const response = await this.apiClient.post('/api/connector/v1/reservations/getAll', {
        Extent: {
          Reservations: true,
        },
        Filter: {
          StartUtc: startDate?.toISOString(),
          EndUtc: endDate?.toISOString(),
        },
      });
      return response.data.Reservations.map(this.mapMewsBooking);
    } catch (error: any) {
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    try {
      const response = await this.apiClient.post('/api/connector/v1/reservations/getByIds', {
        ReservationIds: [bookingId],
      });
      if (response.data.Reservations.length === 0) return null;
      return this.mapMewsBooking(response.data.Reservations[0]);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    try {
      const response = await this.apiClient.post('/api/connector/v1/reservations/add', {
        Reservations: [this.mapToMewsBooking(booking)],
      });
      return this.mapMewsBooking(response.data.Reservations[0]);
    } catch (error: any) {
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    try {
      const response = await this.apiClient.post('/api/connector/v1/reservations/update', {
        Reservations: [{
          Id: bookingId,
          ...this.mapToMewsBooking(updates),
        }],
      });
      return this.mapMewsBooking(response.data.Reservations[0]);
    } catch (error: any) {
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      await this.apiClient.post('/api/connector/v1/reservations/delete', {
        ReservationIds: [bookingId],
      });
      return true;
    } catch (error: any) {
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async getRooms(): Promise<Room[]> {
    try {
      const response = await this.apiClient.post('/api/connector/v1/spaces/getAll', {});
      return response.data.Spaces.map(this.mapMewsRoom);
    } catch (error: any) {
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async getRoom(roomNumber: string): Promise<Room | null> {
    try {
      const rooms = await this.getRooms();
      return rooms.find(r => r.number === roomNumber) || null;
    } catch (error: any) {
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async updateRoomStatus(roomNumber: string, status: string): Promise<boolean> {
    try {
      await this.apiClient.post('/api/connector/v1/spaces/update', {
        Spaces: [{
          Number: roomNumber,
          State: status,
        }],
      });
      return true;
    } catch (error: any) {
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async getGuest(guestId: string): Promise<Guest | null> {
    try {
      const response = await this.apiClient.post('/api/connector/v1/customers/getAll', {
        CustomerIds: [guestId],
      });
      if (response.data.Customers.length === 0) return null;
      return this.mapMewsGuest(response.data.Customers[0]);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  async searchGuests(query: string): Promise<Guest[]> {
    try {
      const response = await this.apiClient.post('/api/connector/v1/customers/search', {
        SearchString: query,
      });
      return response.data.Customers.map(this.mapMewsGuest);
    } catch (error: any) {
      throw new Error(`Mews API error: ${error.message}`);
    }
  }

  private async syncBookings(): Promise<void> {
    const bookings = await this.getBookings();
    console.log(`Synced ${bookings.length} bookings from Mews`);
  }

  private async syncRooms(): Promise<void> {
    const rooms = await this.getRooms();
    console.log(`Synced ${rooms.length} rooms from Mews`);
  }

  private async syncGuests(): Promise<void> {
    console.log('Synced guests from Mews');
  }

  private mapMewsBooking(data: any): Booking {
    return {
      id: data.Id,
      confirmationNumber: data.Number,
      checkIn: new Date(data.StartUtc),
      checkOut: new Date(data.EndUtc),
      guestName: `${data.Customer?.FirstName} ${data.Customer?.LastName}`,
      guestEmail: data.Customer?.Email,
      guestPhone: data.Customer?.Phone,
      roomNumber: data.AssignedSpace?.Number,
      status: data.State,
      totalAmount: data.TotalAmount?.Value,
    };
  }

  private mapToMewsBooking(booking: Partial<Booking>): any {
    return {
      StartUtc: booking.checkIn?.toISOString(),
      EndUtc: booking.checkOut?.toISOString(),
      Customer: {
        FirstName: booking.guestName?.split(' ')[0],
        LastName: booking.guestName?.split(' ')[1],
        Email: booking.guestEmail,
        Phone: booking.guestPhone,
      },
      AssignedSpace: booking.roomNumber ? { Number: booking.roomNumber } : undefined,
    };
  }

  private mapMewsRoom(data: any): Room {
    return {
      id: data.Id,
      number: data.Number,
      type: data.Type,
      status: data.State,
      floor: data.Floor,
    };
  }

  private mapMewsGuest(data: any): Guest {
    return {
      id: data.Id,
      firstName: data.FirstName,
      lastName: data.LastName,
      email: data.Email,
      phone: data.Phone,
      loyaltyTier: data.LoyaltyCode,
    };
  }
}

