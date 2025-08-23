import { Router, Request, Response } from 'express';
import { ticketProviderService } from '../services/ticketProviders';
import { userService } from '../services/userService';
import { validateRequest, searchRequestSchema } from '../middleware/validation';
import { optionalAuth } from '../middleware/auth';
import { SearchRequest, SearchResponse, ApiResponse } from '../types';

const router = Router();

// Search tickets
router.post('/', 
  validateRequest(searchRequestSchema),
  optionalAuth,
  async (req: Request, res: Response) => {
    try {
      const searchRequest: SearchRequest = req.body;
      
      // Convert search request to provider format
      const providerRequest = {
        from: searchRequest.from_location,
        to: searchRequest.to_location,
        departure_date: searchRequest.departure_date,
        return_date: searchRequest.return_date,
        adults: searchRequest.passengers_count,
        children: 0,
        infants: 0,
        currency: 'RUB',
        locale: 'ru'
      };

      // Search tickets from all providers
      const results = await ticketProviderService.searchTickets(providerRequest);

      // Save search to history if user is authenticated
      if (req.user) {
        try {
          await userService.saveSearchToHistory(req.user.id, searchRequest);
        } catch (error) {
          console.error('Failed to save search history:', error);
        }
      }

      const searchResponse: SearchResponse = {
        results,
        total_count: results.length,
        search_id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const apiResponse: ApiResponse<SearchResponse> = {
        success: true,
        data: searchResponse,
        message: `Found ${results.length} tickets`
      };

      res.json(apiResponse);
    } catch (error) {
      console.error('Search error:', error);
      
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Search failed',
          code: 'SEARCH_ERROR',
          status: 500
        }
      };

      res.status(500).json(apiResponse);
    }
  }
);

// Get ticket details
router.get('/ticket/:ticketId', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await ticketProviderService.getTicketDetails(ticketId);
    
    if (!ticket) {
      const apiResponse: ApiResponse<null> = {
        success: false,
        error: {
          message: 'Ticket not found',
          code: 'TICKET_NOT_FOUND',
          status: 404
        }
      };
      return res.status(404).json(apiResponse);
    }

    const apiResponse: ApiResponse<any> = {
      success: true,
      data: ticket
    };

    res.json(apiResponse);
  } catch (error) {
    console.error('Get ticket details error:', error);
    
    const apiResponse: ApiResponse<null> = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to get ticket details',
        code: 'TICKET_DETAILS_ERROR',
        status: 500
      }
    };

    res.status(500).json(apiResponse);
  }
});

// Get available providers
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers = ticketProviderService.getAvailableProviders();
    
    const apiResponse: ApiResponse<string[]> = {
      success: true,
      data: providers
    };

    res.json(apiResponse);
  } catch (error) {
    console.error('Get providers error:', error);
    
    const apiResponse: ApiResponse<null> = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to get providers',
        code: 'PROVIDERS_ERROR',
        status: 500
      }
    };

    res.status(500).json(apiResponse);
  }
});

// Check provider health
router.get('/providers/:providerName/health', async (req: Request, res: Response) => {
  try {
    const { providerName } = req.params;
    
    const isHealthy = await ticketProviderService.checkProviderHealth(providerName);
    
    const apiResponse: ApiResponse<{ provider: string; healthy: boolean }> = {
      success: true,
      data: {
        provider: providerName,
        healthy: isHealthy
      }
    };

    res.json(apiResponse);
  } catch (error) {
    console.error('Provider health check error:', error);
    
    const apiResponse: ApiResponse<null> = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Health check failed',
        code: 'HEALTH_CHECK_ERROR',
        status: 500
      }
    };

    res.status(500).json(apiResponse);
  }
});

// Get popular routes (mock data)
router.get('/popular-routes', async (req: Request, res: Response) => {
  try {
    const popularRoutes = [
      {
        from: 'Moscow',
        to: 'Saint Petersburg',
        transport_types: ['airplane', 'train', 'bus'],
        avg_price: 8500,
        currency: 'RUB'
      },
      {
        from: 'Moscow',
        to: 'Kazan',
        transport_types: ['airplane', 'train'],
        avg_price: 6500,
        currency: 'RUB'
      },
      {
        from: 'Saint Petersburg',
        to: 'Kazan',
        transport_types: ['airplane', 'train'],
        avg_price: 7200,
        currency: 'RUB'
      },
      {
        from: 'Moscow',
        to: 'Sochi',
        transport_types: ['airplane', 'train'],
        avg_price: 12000,
        currency: 'RUB'
      },
      {
        from: 'Moscow',
        to: 'Yekaterinburg',
        transport_types: ['airplane', 'train'],
        avg_price: 8000,
        currency: 'RUB'
      }
    ];

    const apiResponse: ApiResponse<any[]> = {
      success: true,
      data: popularRoutes
    };

    res.json(apiResponse);
  } catch (error) {
    console.error('Get popular routes error:', error);
    
    const apiResponse: ApiResponse<null> = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to get popular routes',
        code: 'POPULAR_ROUTES_ERROR',
        status: 500
      }
    };

    res.status(500).json(apiResponse);
  }
});

export default router;