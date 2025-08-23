import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, paymentRequestSchema } from '../middleware/validation';
import { PaymentRequest, PaymentResponse, ApiResponse } from '../types';

const router = Router();

// Process payment
router.post('/process', 
  authenticateToken,
  validateRequest(paymentRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const paymentData: PaymentRequest = req.body;
      
      // In production, this would integrate with a real payment gateway like Stripe
      // For now, we'll simulate a successful payment
      
      // Validate that the booking belongs to the user
      // This would typically involve checking the database
      
      // Simulate payment processing
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate payment success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const paymentResponse: PaymentResponse = {
          transaction_id: transactionId,
          status: 'paid',
          amount: paymentData.amount,
          currency: paymentData.currency
        };

        const apiResponse: ApiResponse<PaymentResponse> = {
          success: true,
          data: paymentResponse,
          message: 'Payment processed successfully'
        };

        res.json(apiResponse);
      } else {
        // Simulate payment failure
        const apiResponse: ApiResponse<null> = {
          success: false,
          error: {
            message: 'Payment failed - insufficient funds',
            code: 'PAYMENT_FAILED',
            status: 400
          }
        };

        res.status(400).json(apiResponse);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Payment processing failed',
          code: 'PAYMENT_PROCESSING_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Get payment methods
router.get('/methods', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const paymentMethods = [
        {
          id: 'card',
          name: 'Credit/Debit Card',
          description: 'Visa, MasterCard, American Express',
          icon: '💳',
          enabled: true
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Pay with your PayPal account',
          icon: '🔵',
          enabled: true
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Direct bank transfer',
          icon: '🏦',
          enabled: false
        }
      ];

      const apiResponse: ApiResponse<any[]> = {
        success: true,
        data: paymentMethods
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Get payment methods error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get payment methods',
          code: 'PAYMENT_METHODS_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Get payment status
router.get('/status/:transactionId', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      
      // In production, this would query the payment gateway or database
      // For now, return mock data
      const paymentStatus = {
        transaction_id: transactionId,
        status: 'paid',
        amount: 12000,
        currency: 'RUB',
        created_at: new Date().toISOString(),
        payment_method: 'card',
        last_four_digits: '1234'
      };

      const apiResponse: ApiResponse<any> = {
        success: true,
        data: paymentStatus
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Get payment status error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get payment status',
          code: 'PAYMENT_STATUS_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Refund payment
router.post('/refund/:transactionId', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      const { reason } = req.body;
      
      // In production, this would call the payment gateway's refund API
      // For now, simulate a successful refund
      
      const refundResult = {
        transaction_id: transactionId,
        refund_id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'refunded',
        amount: 12000,
        currency: 'RUB',
        reason: reason || 'Customer request',
        refunded_at: new Date().toISOString()
      };

      const apiResponse: ApiResponse<any> = {
        success: true,
        data: refundResult,
        message: 'Payment refunded successfully'
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Refund payment error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to refund payment',
          code: 'REFUND_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Get payment history
router.get('/history', 
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // In production, this would query the database for payment history
      // For now, return mock data
      const mockPayments = [
        {
          id: 1,
          transaction_id: 'txn_123456789',
          amount: 12000,
          currency: 'RUB',
          status: 'paid',
          payment_method: 'card',
          created_at: new Date().toISOString(),
          booking_id: 1
        },
        {
          id: 2,
          transaction_id: 'txn_987654321',
          amount: 8500,
          currency: 'RUB',
          status: 'paid',
          payment_method: 'paypal',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          booking_id: 2
        }
      ];

      const total = mockPayments.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedPayments = mockPayments.slice(offset, offset + limit);

      const apiResponse: ApiResponse<any> = {
        success: true,
        data: {
          payments: paginatedPayments,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Get payment history error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get payment history',
          code: 'PAYMENT_HISTORY_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Webhook for payment notifications (for production payment gateways)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // In production, this would handle webhooks from payment gateways
    // Verify webhook signature, process payment updates, etc.
    
    console.log('Payment webhook received:', req.body);
    
    // Return success to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;