import { pool } from '../config/database';
import { 
  Booking, 
  CreateBookingRequest, 
  PassengerInfo, 
  BookingStatus, 
  PaymentStatus 
} from '../types';
import { NotFoundError, ConflictError } from '../middleware/errorHandler';
import { ticketProviderService } from './ticketProviders';

export class BookingService {
  // Create new booking
  async createBooking(userId: number, bookingData: CreateBookingRequest): Promise<Booking> {
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');

      // Get ticket details from provider
      const ticketDetails = await ticketProviderService.getTicketDetails(bookingData.ticket_id);
      if (!ticketDetails) {
        throw new NotFoundError('Ticket not found');
      }

      // Calculate total price
      const totalPrice = ticketDetails.price * bookingData.passengers.length;

      // Create booking record
      const bookingResult = await client.query(
        `INSERT INTO bookings 
         (user_id, provider_name, from_location, to_location, departure_date, return_date,
          passengers_count, transport_type, total_price, currency, status, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          userId,
          bookingData.provider_name,
          ticketDetails.from_location,
          ticketDetails.to_location,
          ticketDetails.departure_date,
          ticketDetails.return_date || null,
          bookingData.passengers.length,
          ticketDetails.transport_type,
          totalPrice,
          ticketDetails.currency,
          'pending' as BookingStatus,
          'pending' as PaymentStatus
        ]
      );

      const booking = bookingResult.rows[0];

      // Create passenger details records
      for (const passenger of bookingData.passengers) {
        await client.query(
          `INSERT INTO passenger_details 
           (booking_id, first_name, last_name, birth_date, passport_number, nationality, seat_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            booking.id,
            passenger.first_name,
            passenger.last_name,
            passenger.birth_date,
            passenger.passport_number || null,
            passenger.nationality,
            passenger.seat_preference || null
          ]
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      return booking;
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: number, userId?: number): Promise<Booking | null> {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT b.*, 
               array_agg(json_build_object(
                 'first_name', pd.first_name,
                 'last_name', pd.last_name,
                 'birth_date', pd.birth_date,
                 'passport_number', pd.passport_number,
                 'nationality', pd.nationality,
                 'seat_number', pd.seat_number
               )) as passengers
        FROM bookings b
        LEFT JOIN passenger_details pd ON b.id = pd.booking_id
        WHERE b.id = $1
      `;

      const params: any[] = [bookingId];

      if (userId) {
        query += ' AND b.user_id = $2';
        params.push(userId);
      }

      query += ' GROUP BY b.id';

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Get user's bookings
  async getUserBookings(userId: number, page: number = 1, limit: number = 20): Promise<{
    bookings: Booking[];
    total: number;
    totalPages: number;
  }> {
    const client = await pool.connect();
    
    try {
      // Get total count
      const countResult = await client.query(
        'SELECT COUNT(*) FROM bookings WHERE user_id = $1',
        [userId]
      );
      const total = parseInt(countResult.rows[0].count);

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Get bookings with pagination
      const result = await client.query(
        `SELECT * FROM bookings 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return {
        bookings: result.rows,
        total,
        totalPages
      };
    } finally {
      client.release();
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: number, status: BookingStatus, userId?: number): Promise<Booking> {
    const client = await pool.connect();
    
    try {
      let query = 'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
      const params: any[] = [status, bookingId];

      if (userId) {
        query += ' AND user_id = $3';
        params.push(userId);
      }

      query += ' RETURNING *';

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        throw new NotFoundError('Booking not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Update payment status
  async updatePaymentStatus(bookingId: number, paymentStatus: PaymentStatus): Promise<Booking> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE bookings 
         SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [paymentStatus, bookingId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Booking not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: number, userId: number): Promise<Booking> {
    const client = await pool.connect();
    
    try {
      // Check if booking can be cancelled
      const booking = await this.getBookingById(bookingId, userId);
      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.status === 'cancelled') {
        throw new ConflictError('Booking is already cancelled');
      }

      if (booking.status === 'completed') {
        throw new ConflictError('Cannot cancel completed booking');
      }

      // Update booking status
      const result = await client.query(
        `UPDATE bookings 
         SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [bookingId, userId]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Get booking statistics
  async getBookingStats(userId: number): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  }> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           COUNT(*) as total,
           COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
           COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
           COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
         FROM bookings 
         WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Process booking with provider
  async processBookingWithProvider(bookingId: number): Promise<{ success: boolean; providerBookingId?: string; error?: string }> {
    try {
      const booking = await this.getBookingById(bookingId);
      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      // In production, this would make an actual API call to the provider
      // For now, simulate a successful booking
      const mockProviderBookingId = `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update booking with provider booking ID
      await this.updateBookingStatus(bookingId, 'confirmed');

      return {
        success: true,
        providerBookingId: mockProviderBookingId
      };
    } catch (error) {
      console.error('Error processing booking with provider:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();