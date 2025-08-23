// User types
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Search types
export interface SearchRequest {
  from_location: string;
  to_location: string;
  departure_date: string;
  return_date?: string;
  passengers_count: number;
  transport_type: TransportType;
  trip_type: TripType;
}

export interface SearchResponse {
  results: TicketResult[];
  total_count: number;
  search_id: string;
}

export interface TicketResult {
  id: string;
  provider_name: string;
  provider_logo?: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  return_date?: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  stops_count: number;
  stops?: string[];
  price: number;
  currency: string;
  original_price?: number;
  discount_percentage?: number;
  transport_type: TransportType;
  trip_type: TripType;
  available_seats: number;
  booking_url?: string;
  terms_and_conditions?: string;
  baggage_info?: BaggageInfo;
  amenities?: string[];
}

export interface BaggageInfo {
  cabin_baggage: string;
  checked_baggage: string;
  additional_fees?: number;
}

// Transport and trip types
export type TransportType = 'airplane' | 'train' | 'bus';
export type TripType = 'one_way' | 'round_trip';

// Booking types
export interface CreateBookingRequest {
  ticket_id: string;
  provider_name: string;
  passengers: PassengerInfo[];
  contact_info: ContactInfo;
  payment_method: PaymentMethod;
}

export interface PassengerInfo {
  first_name: string;
  last_name: string;
  birth_date: string;
  passport_number?: string;
  nationality: string;
  seat_preference?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'bank_transfer';
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
  cardholder_name?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  provider_name: string;
  provider_booking_id?: string;
  from_location: string;
  to_location: string;
  departure_date: Date;
  return_date?: Date;
  passengers_count: number;
  transport_type: TransportType;
  total_price: number;
  currency: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Payment types
export interface PaymentRequest {
  booking_id: number;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
}

export interface PaymentResponse {
  transaction_id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  payment_url?: string;
}

// API Provider types
export interface ProviderConfig {
  name: string;
  api_key: string;
  base_url: string;
  enabled: boolean;
}

export interface ProviderSearchRequest {
  from: string;
  to: string;
  departure_date: string;
  return_date?: string;
  adults: number;
  children?: number;
  infants?: number;
  currency?: string;
  locale?: string;
}

export interface ProviderSearchResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: string;
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

// Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}