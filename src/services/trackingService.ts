import axios from 'axios';

// Create axios instance for tracking service
const trackingAPI = axios.create({
  baseURL: process.env.REACT_APP_TRACKING_API_URL 
    ? `${process.env.REACT_APP_TRACKING_API_URL}/api/tracking`
    : 'http://localhost:5007/api/tracking',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
trackingAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Adjust based on your auth implementation
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
trackingAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Tracking API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Check if tracking is available for an engagement
 */
export const checkTrackingAvailability = async (engagementId: number) => {
  const response = await trackingAPI.get(`/availability/${engagementId}`);
  return response.data;
};

/**
 * Start a tracking session
 */
export const startTrackingSession = async (engagementId: number, customerId: number) => {
  const response = await trackingAPI.post('/session/start', {
    engagement_id: engagementId,
    customer_id: customerId,
  });
  return response.data;
};

/**
 * Stop a tracking session
 */
export const stopTrackingSession = async (sessionId: string) => {
  const response = await trackingAPI.post('/session/stop', {
    session_id: sessionId,
  });
  return response.data;
};

/**
 * Get latest location update (polling fallback)
 */
export const getLocationUpdate = async (engagementId: number) => {
  const response = await trackingAPI.get(`/location/${engagementId}`);
  return response.data;
};

/**
 * Get current ETA from cache
 */
export const getETA = async (engagementId: number) => {
  const response = await trackingAPI.get(`/eta/${engagementId}`);
  return response.data;
};

/**
 * Calculate ETA with traffic-aware routing
 */
export const calculateETA = async (engagementId: number) => {
  const response = await trackingAPI.post('/calculate-eta', {
    engagement_id: engagementId,
  });
  return response.data;
};

/**
 * Health check
 */
export const checkHealth = async () => {
  const response = await trackingAPI.get('/health');
  return response.data;
};

// Named exports are preferred for tree-shaking and easier refactoring
const trackingService = {
  checkTrackingAvailability,
  startTrackingSession,
  stopTrackingSession,
  getLocationUpdate,
  getETA,
  calculateETA,
  checkHealth,
};

export default trackingService;
