import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ProviderConfig, 
  ProviderSearchRequest, 
  ProviderSearchResponse,
  TicketResult,
  TransportType,
  TripType
} from '../types';

// Configuration for different ticket providers
const providers: ProviderConfig[] = [
  {
    name: 'aviasales',
    api_key: process.env.AVIASALES_API_KEY || '',
    base_url: process.env.AVIASALES_BASE_URL || 'https://api.aviasales.com',
    enabled: true
  },
  {
    name: 'omio',
    api_key: process.env.OMIO_API_KEY || '',
    base_url: process.env.OMIO_BASE_URL || 'https://api.omio.com',
    enabled: true
  },
  {
    name: 'kiwi',
    api_key: process.env.KIWI_API_KEY || '',
    base_url: process.env.KIWI_BASE_URL || 'https://api.kiwi.com',
    enabled: true
  },
  {
    name: 'busfor',
    api_key: process.env.BUSFOR_API_KEY || '',
    base_url: process.env.BUSFOR_BASE_URL || 'https://api.busfor.com',
    enabled: true
  }
];

// Mock data for demonstration purposes
const mockTicketData: Record<string, TicketResult[]> = {
  aviasales: [
    {
      id: 'av_001',
      provider_name: 'Aviasales',
      provider_logo: 'https://via.placeholder.com/100x50/2563eb/ffffff?text=AV',
      from_location: 'Moscow',
      to_location: 'Saint Petersburg',
      departure_date: '2024-02-15',
      departure_time: '10:00',
      arrival_time: '11:30',
      duration: '1h 30m',
      stops_count: 0,
      price: 12000,
      currency: 'RUB',
      original_price: 15000,
      discount_percentage: 20,
      transport_type: 'airplane',
      trip_type: 'one_way',
      available_seats: 45,
      amenities: ['WiFi', 'Entertainment', 'Refreshments']
    },
    {
      id: 'av_002',
      provider_name: 'Aviasales',
      provider_logo: 'https://via.placeholder.com/100x50/2563eb/ffffff?text=AV',
      from_location: 'Moscow',
      to_location: 'Saint Petersburg',
      departure_date: '2024-02-15',
      departure_time: '14:00',
      arrival_time: '15:30',
      duration: '1h 30m',
      stops_count: 0,
      price: 13500,
      currency: 'RUB',
      transport_type: 'airplane',
      trip_type: 'one_way',
      available_seats: 32,
      amenities: ['WiFi', 'Entertainment']
    }
  ],
  omio: [
    {
      id: 'om_001',
      provider_name: 'Omio',
      provider_logo: 'https://via.placeholder.com/100x50/059669/ffffff?text=OM',
      from_location: 'Moscow',
      to_location: 'Saint Petersburg',
      departure_date: '2024-02-15',
      departure_time: '08:30',
      arrival_time: '12:45',
      duration: '4h 15m',
      stops_count: 1,
      stops: ['Tver'],
      price: 2500,
      currency: 'RUB',
      transport_type: 'train',
      trip_type: 'one_way',
      available_seats: 120,
      amenities: ['WiFi', 'Restaurant', 'Power Outlets']
    }
  ],
  kiwi: [
    {
      id: 'kw_001',
      provider_name: 'Kiwi',
      provider_logo: 'https://via.placeholder.com/100x50/dc2626/ffffff?text=KW',
      from_location: 'Moscow',
      to_location: 'Saint Petersburg',
      departure_date: '2024-02-15',
      departure_time: '16:00',
      arrival_time: '17:30',
      duration: '1h 30m',
      stops_count: 0,
      price: 11800,
      currency: 'RUB',
      transport_type: 'airplane',
      trip_type: 'one_way',
      available_seats: 28,
      amenities: ['WiFi', 'Entertainment']
    }
  ],
  busfor: [
    {
      id: 'bf_001',
      provider_name: 'Busfor',
      provider_logo: 'https://via.placeholder.com/100x50/7c3aed/ffffff?text=BF',
      from_location: 'Moscow',
      to_location: 'Saint Petersburg',
      departure_date: '2024-02-15',
      departure_time: '20:00',
      arrival_time: '06:00',
      duration: '10h 0m',
      stops_count: 2,
      stops: ['Tver', 'Novgorod'],
      price: 1200,
      currency: 'RUB',
      transport_type: 'bus',
      trip_type: 'one_way',
      available_seats: 45,
      amenities: ['WiFi', 'Power Outlets', 'Toilet']
    }
  ]
};

export class TicketProviderService {
  private providers: ProviderConfig[];
  private axiosInstances: Map<string, AxiosInstance>;

  constructor() {
    this.providers = providers.filter(p => p.enabled);
    this.axiosInstances = new Map();
    
    // Initialize axios instances for each provider
    this.providers.forEach(provider => {
      this.axiosInstances.set(provider.name, axios.create({
        baseURL: provider.base_url,
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${provider.api_key}`,
          'Content-Type': 'application/json'
        }
      }));
    });
  }

  // Search tickets from all providers
  async searchTickets(searchRequest: ProviderSearchRequest): Promise<TicketResult[]> {
    const allResults: TicketResult[] = [];
    const searchPromises: Promise<TicketResult[]>[] = [];

    // Search from each provider concurrently
    this.providers.forEach(provider => {
      searchPromises.push(
        this.searchFromProvider(provider.name, searchRequest)
          .catch(error => {
            console.error(`Error searching from ${provider.name}:`, error);
            return [];
          })
      );
    });

    try {
      const results = await Promise.allSettled(searchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        }
      });

      // Sort results by price
      return allResults.sort((a, b) => a.price - b.price);
    } catch (error) {
      console.error('Error in searchTickets:', error);
      return [];
    }
  }

  // Search from a specific provider
  private async searchFromProvider(providerName: string, searchRequest: ProviderSearchRequest): Promise<TicketResult[]> {
    try {
      // For demonstration, return mock data
      // In production, you would make actual API calls to providers
      const mockData = mockTicketData[providerName] || [];
      
      // Filter mock data based on search criteria
      return mockData.filter(ticket => {
        // Simple filtering logic - in production this would be more sophisticated
        return ticket.from_location.toLowerCase().includes(searchRequest.from.toLowerCase()) &&
               ticket.to_location.toLowerCase().includes(searchRequest.to.toLowerCase());
      });
    } catch (error) {
      console.error(`Error searching from ${providerName}:`, error);
      return [];
    }
  }

  // Get ticket details by ID
  async getTicketDetails(ticketId: string): Promise<TicketResult | null> {
    try {
      // Find ticket in mock data
      for (const providerTickets of Object.values(mockTicketData)) {
        const ticket = providerTickets.find(t => t.id === ticketId);
        if (ticket) {
          return ticket;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting ticket details:', error);
      return null;
    }
  }

  // Book ticket with provider
  async bookTicket(ticketId: string, passengerInfo: any): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    try {
      // In production, this would make an actual booking API call to the provider
      // For now, return a mock successful booking
      const mockBookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        bookingId: mockBookingId
      };
    } catch (error) {
      console.error('Error booking ticket:', error);
      return {
        success: false,
        error: 'Failed to book ticket with provider'
      };
    }
  }

  // Get available providers
  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  // Check provider health
  async checkProviderHealth(providerName: string): Promise<boolean> {
    try {
      const provider = this.providers.find(p => p.name === providerName);
      if (!provider) return false;

      const axiosInstance = this.axiosInstances.get(providerName);
      if (!axiosInstance) return false;

      // Make a simple health check request
      await axiosInstance.get('/health');
      return true;
    } catch (error) {
      console.error(`Health check failed for ${providerName}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const ticketProviderService = new TicketProviderService();