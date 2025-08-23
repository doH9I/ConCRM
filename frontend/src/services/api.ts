import axios from 'axios'

// Create axios instance
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const endpoints = {
  // Search
  search: '/search',
  ticketDetails: (id: string) => `/search/ticket/${id}`,
  providers: '/search/providers',
  popularRoutes: '/search/popular-routes',
  
  // User
  login: '/user/login',
  register: '/user/register',
  profile: '/user/profile',
  updateProfile: '/user/profile',
  changePassword: '/user/change-password',
  searchHistory: '/user/search-history',
  verifyToken: '/user/verify-token',
  
  // Booking
  createBooking: '/booking',
  getBooking: (id: number) => `/booking/${id}`,
  getUserBookings: '/booking',
  updateBookingStatus: (id: number) => `/booking/${id}/status`,
  cancelBooking: (id: number) => `/booking/${id}/cancel`,
  bookingStats: '/booking/stats/summary',
  processBooking: (id: number) => `/booking/${id}/process`,
  
  // Payment
  processPayment: '/payment/process',
  paymentMethods: '/payment/methods',
  paymentStatus: (id: string) => `/payment/status/${id}`,
  refundPayment: (id: string) => `/payment/refund/${id}`,
  paymentHistory: '/payment/history',
}

// Helper functions for common API operations
export const apiHelpers = {
  // Search tickets
  searchTickets: async (searchData: any) => {
    const response = await api.post(endpoints.search, searchData)
    return response.data
  },

  // Get ticket details
  getTicketDetails: async (ticketId: string) => {
    const response = await api.get(endpoints.ticketDetails(ticketId))
    return response.data
  },

  // Create booking
  createBooking: async (bookingData: any) => {
    const response = await api.post(endpoints.createBooking, bookingData)
    return response.data
  },

  // Process payment
  processPayment: async (paymentData: any) => {
    const response = await api.post(endpoints.processPayment, paymentData)
    return response.data
  },

  // Get user profile
  getUserProfile: async () => {
    const response = await api.get(endpoints.profile)
    return response.data
  },

  // Update user profile
  updateUserProfile: async (profileData: any) => {
    const response = await api.put(endpoints.updateProfile, profileData)
    return response.data
  },

  // Get user bookings
  getUserBookings: async (page = 1, limit = 20) => {
    const response = await api.get(endpoints.getUserBookings, {
      params: { page, limit }
    })
    return response.data
  },

  // Get popular routes
  getPopularRoutes: async () => {
    const response = await api.get(endpoints.popularRoutes)
    return response.data
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await api.get(endpoints.paymentMethods)
    return response.data
  }
}