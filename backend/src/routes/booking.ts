import { Router, Request, Response } from 'express';
import { bookingService } from '../services/bookingService';
import { validateRequest, createBookingSchema } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { CreateBookingRequest, ApiResponse } from '../types';

const router = Router();

// Create new booking
router.post('/', 
  authenticateToken,
  validateRequest(createBookingSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const bookingData: CreateBookingRequest = req.body;
      
      const newBooking = await bookingService.createBooking(userId, bookingData);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: newBooking,
        message: 'Booking created successfully'
      };

      res.status(201).json(apiResponse);
    } catch (error) {
      console.error('Create booking error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create booking',
          code: 'BOOKING_CREATE_ERROR',
          status: 400
        }
      };

      res.status(400).json(apiResponse);
    }
  }
);

// Get booking by ID
router.get('/:bookingId', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const bookingId = parseInt(req.params.bookingId);
      
      if (isNaN(bookingId)) {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'Invalid booking ID',
            code: 'INVALID_BOOKING_ID',
            status: 400
          }
        };
        return res.status(400).json(apiResponse);
      }
      
      const booking = await bookingService.getBookingById(bookingId, userId);
      
      if (!booking) {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'Booking not found',
            code: 'BOOKING_NOT_FOUND',
            status: 404
          }
        };
        return res.status(404).json(apiResponse);
      }

      const apiResponse: ApiResponse<any> = {
        success: true,
        data: booking
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Get booking error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get booking',
          code: 'BOOKING_GET_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Get user's bookings
router.get('/', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await bookingService.getUserBookings(userId, page, limit);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: result
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Get user bookings error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get bookings',
          code: 'BOOKINGS_GET_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Update booking status
router.put('/:bookingId/status', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const bookingId = parseInt(req.params.bookingId);
      const { status } = req.body;
      
      if (isNaN(bookingId)) {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'Invalid booking ID',
            code: 'INVALID_BOOKING_ID',
            status: 400
          }
        };
        return res.status(400).json(apiResponse);
      }
      
      if (!status) {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'Status is required',
            code: 'MISSING_STATUS',
            status: 400
          }
        };
        return res.status(400).json(apiResponse);
      }
      
      const updatedBooking = await bookingService.updateBookingStatus(bookingId, status, userId);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: updatedBooking,
        message: 'Booking status updated successfully'
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Update booking status error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update booking status',
          code: 'BOOKING_STATUS_UPDATE_ERROR',
          status: 400
        }
      };

      res.status(400).json(apiResponse);
    }
  }
);

// Cancel booking
router.put('/:bookingId/cancel', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const bookingId = parseInt(req.params.bookingId);
      
      if (isNaN(bookingId)) {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'Invalid booking ID',
            code: 'INVALID_BOOKING_ID',
            status: 400
          }
        };
        return res.status(400).json(apiResponse);
      }
      
      const cancelledBooking = await bookingService.cancelBooking(bookingId, userId);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: cancelledBooking,
        message: 'Booking cancelled successfully'
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Cancel booking error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to cancel booking',
          code: 'BOOKING_CANCEL_ERROR',
          status: 400
        }
      };

      res.status(400).json(apiResponse);
    }
  }
);

// Get booking statistics
router.get('/stats/summary', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      const stats = await bookingService.getBookingStats(userId);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: stats
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Get booking stats error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get booking statistics',
          code: 'BOOKING_STATS_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Process booking with provider
router.post('/:bookingId/process', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const bookingId = parseInt(req.params.bookingId);
      
      if (isNaN(bookingId)) {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'Invalid booking ID',
            code: 'INVALID_BOOKING_ID',
            status: 400
          }
        };
        return res.status(400).json(apiResponse);
      }
      
      const result = await bookingService.processBookingWithProvider(bookingId);
      
      if (result.success) {
        const apiResponse: ApiResponse<any> = {
          success: true,
          data: {
            provider_booking_id: result.providerBookingId,
            message: 'Booking processed successfully with provider'
          }
        };
        res.json(apiResponse);
      } else {
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: result.error || 'Failed to process booking with provider',
            code: 'PROVIDER_PROCESSING_ERROR',
            status: 400
          }
        };
        res.status(400).json(apiResponse);
      }
    } catch (error) {
      console.error('Process booking with provider error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to process booking with provider',
          code: 'PROVIDER_PROCESSING_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

export default router;