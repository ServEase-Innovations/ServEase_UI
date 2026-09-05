/**
 * Environment-specific configuration for API endpoints.
 * 
 * Usage:
 * - Development: Uses localhost or Render dev endpoints
 * - Production: Uses production Render endpoints
 * 
 * To switch environments, set NODE_ENV or use .env files:
 * - .env.development (npm start, npm run build:dev)
 * - .env.production (npm run build)
 */

export type Environment = 'development' | 'production';

export interface EnvironmentConfig {
  name: Environment;
  endpoints: {
    payments: string;
    providers: string;
    preferences: string;
    utils: string;
    utilsWebsocket: string;
    reviews: string;
    tickets: string;
    coupons: string;
    chat: string;
    imageUploader: string;
    tracking: string;
    trackingWebsocket: string;
  };
  secrets: {
    googleMapsApiKey: string;
    razorpayKey: string;
    adminPushSecret: string;
    adminTicketSecret: string;
    adminEmail: string;
    chatAdminId: string;
  };
}

/**
 * Development configuration - uses localhost for most services
 */
export const developmentConfig: EnvironmentConfig = {
  name: 'development',
  endpoints: {
    payments: 'http://localhost:4100',
    providers: 'http://localhost:4000',
    preferences: 'http://localhost:3001',
    utils: 'http://localhost:3030',
    utilsWebsocket: 'ws://localhost:3030',
    reviews: 'http://localhost:5005',
    tickets: 'http://localhost:5006',
    coupons: 'http://localhost:3002',
    chat: 'http://localhost:5001',
    imageUploader: 'http://localhost:5003',
    tracking: 'http://localhost:5007',
    trackingWebsocket: 'ws://localhost:5007',
  },
  secrets: {
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    razorpayKey: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_lTdgjtSRlEwreA',
    adminPushSecret: process.env.REACT_APP_ADMIN_PUSH_SECRET || 'serveaso-test-push-secret',
    adminTicketSecret: process.env.REACT_APP_ADMIN_TICKET_SECRET || 'serveaso-test-push-secret',
    adminEmail: process.env.REACT_APP_ADMIN_EMAIL || 'admin@serveaso.com',
    chatAdminId: process.env.REACT_APP_CHAT_ADMIN_ID || '698ace8b8ea84c91bdc93678',
  },
};

/**
 * Production configuration - uses Render endpoints
 */
export const productionConfig: EnvironmentConfig = {
  name: 'production',
  endpoints: {
    payments: 'https://payments-vyqp.onrender.com',
    providers: 'https://providers-vz68.onrender.com',
    preferences: 'https://preferences-6leu.onrender.com',
    utils: 'https://utils-qhvi.onrender.com',
    utilsWebsocket: 'wss://utils-qhvi.onrender.com',
    reviews: 'https://reviews-4mls.onrender.com',
    tickets: 'https://tickets-1cfe.onrender.com',
    coupons: 'https://coupons-s9zq.onrender.com',
    chat: 'https://chat-b3wl.onrender.com',
    imageUploader: 'https://imageuploader-5njj.onrender.com',
    tracking: 'https://tracking-api.onrender.com', // Update with actual URL
    trackingWebsocket: 'wss://tracking-api.onrender.com', // Update with actual URL
  },
  secrets: {
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    razorpayKey: process.env.REACT_APP_RAZORPAY_KEY || '',
    adminPushSecret: process.env.REACT_APP_ADMIN_PUSH_SECRET || '',
    adminTicketSecret: process.env.REACT_APP_ADMIN_TICKET_SECRET || '',
    adminEmail: process.env.REACT_APP_ADMIN_EMAIL || 'admin@serveaso.com',
    chatAdminId: process.env.REACT_APP_CHAT_ADMIN_ID || '698ace8b8ea84c91bdc93678',
  },
};

/**
 * Get the current environment configuration
 */
export function getCurrentEnvironment(): Environment {
  return (process.env.NODE_ENV as Environment) || 'development';
}

/**
 * Get the configuration for the current environment
 */
export function getConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();
  return env === 'production' ? productionConfig : developmentConfig;
}

/**
 * Get a specific endpoint URL for the current environment
 */
export function getEndpoint(service: keyof EnvironmentConfig['endpoints']): string {
  const config = getConfig();
  
  // Allow environment variables to override config
  const envVarMap: Record<string, string | undefined> = {
    payments: process.env.REACT_APP_PAYMENTS_URL || process.env.REACT_APP_SOCKET_URL,
    providers: process.env.REACT_APP_PROVIDER_URL || process.env.REACT_APP_URL,
    preferences: process.env.REACT_APP_PREFERENCES_URL,
    utils: process.env.REACT_APP_UTILS_URL || process.env.REACT_APP_UTLIS_URL,
    utilsWebsocket: process.env.REACT_APP_UTILS_WS_URL,
    reviews: process.env.REACT_APP_REVIEWS_URL,
    tickets: process.env.REACT_APP_TICKETS_URL,
    coupons: process.env.REACT_APP_COUPONS_URL,
    chat: process.env.REACT_APP_CHAT_URL,
    imageUploader: process.env.REACT_APP_IMAGE_UPLOADER_URL,
    tracking: process.env.REACT_APP_TRACKING_API_URL,
    trackingWebsocket: process.env.REACT_APP_TRACKING_WS_URL,
  };
  
  const envOverride = envVarMap[service];
  if (envOverride && envOverride.trim() !== '') {
    return envOverride.replace(/\/$/, '');
  }
  
  return config.endpoints[service];
}

/**
 * Get a specific secret for the current environment
 */
export function getSecret(secret: keyof EnvironmentConfig['secrets']): string {
  const config = getConfig();
  return config.secrets[secret];
}

/**
 * Print current configuration (for debugging)
 */
export function printConfig(): void {
  const config = getConfig();
  console.log('🔧 Current Environment:', config.name.toUpperCase());
  console.log('📡 API Endpoints:');
  Object.entries(config.endpoints).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}
