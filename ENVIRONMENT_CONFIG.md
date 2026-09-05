# Environment Configuration Guide

## Overview

The ServEase UI app now uses centralized environment configuration files to manage API endpoints for different environments (development, production).

## Files Structure

```
apps/servase-ui/
├── .env.development          # Development config (localhost)
├── .env.production           # Production config (Render endpoints)
├── src/config/
│   ├── environments.ts       # Environment-specific configuration
│   └── urls.ts              # Exports urls object (uses environments.ts)
```

## How It Works

1. **Configuration Files** (`environments.ts`):
   - Contains `developmentConfig` and `productionConfig`
   - Each config has all endpoint URLs and secrets
   - Automatically selects config based on `NODE_ENV`

2. **Environment Files** (`.env.*`):
   - `.env.development` - Used when running `npm start`
   - `.env.production` - Used when running `npm run build`
   - Can override any config value with environment variables

3. **Priority Order**:
   ```
   Environment Variable > Config File > Default
   ```

## Usage

### Development (Local)

```bash
# Uses .env.development (localhost endpoints)
npm start
```

### Production Build

```bash
# Uses .env.production (Render endpoints)
npm run build
```

### Override Specific Endpoint

You can override any endpoint by setting environment variables:

```bash
# Override just the payments URL
REACT_APP_PAYMENTS_URL=https://my-custom-payments.com npm start
```

## Updating Endpoints

### Option 1: Edit Config Files (Recommended)

Edit `src/config/environments.ts`:

```typescript
export const productionConfig: EnvironmentConfig = {
  endpoints: {
    payments: 'https://your-new-payments-url.com',
    // ... other endpoints
  },
};
```

### Option 2: Edit .env Files

Edit `.env.production`:

```bash
REACT_APP_PAYMENTS_URL=https://your-new-payments-url.com
```

### Option 3: Netlify Environment Variables

In Netlify dashboard, set environment variables to override:
- `REACT_APP_PAYMENTS_URL`
- `REACT_APP_PROVIDER_URL`
- etc.

## Available Endpoints

| Service | Environment Variable | Dev Default | Prod Default |
|---------|---------------------|-------------|--------------|
| Payments | `REACT_APP_PAYMENTS_URL` | `localhost:4100` | `payments-vyqp.onrender.com` |
| Providers | `REACT_APP_PROVIDER_URL` | `localhost:4000` | `providers-*.onrender.com` |
| Preferences | `REACT_APP_PREFERENCES_URL` | `localhost:3001` | `preferences-6leu.onrender.com` |
| Utils | `REACT_APP_UTILS_URL` | `localhost:3030` | `utils-qhvi.onrender.com` |
| Reviews | `REACT_APP_REVIEWS_URL` | `localhost:5005` | `reviews-4mls.onrender.com` |
| Tickets | `REACT_APP_TICKETS_URL` | `localhost:5006` | `tickets-1cfe.onrender.com` |
| Coupons | `REACT_APP_COUPONS_URL` | `localhost:3002` | `coupons-s9zq.onrender.com` |
| Chat | `REACT_APP_CHAT_URL` | `localhost:5001` | `chat-b3wl.onrender.com` |
| Image Uploader | `REACT_APP_IMAGE_UPLOADER_URL` | `localhost:5003` | `imageuploader-5njj.onrender.com` |
| Tracking | `REACT_APP_TRACKING_API_URL` | `localhost:5007` | `tracking-api.onrender.com` |

## Secrets

Production secrets should be set in Netlify environment variables, NOT in `.env.production`:

- `REACT_APP_GOOGLE_MAPS_API_KEY`
- `REACT_APP_RAZORPAY_KEY`
- `REACT_APP_ADMIN_PUSH_SECRET`
- `REACT_APP_ADMIN_TICKET_SECRET`

## Debugging

To see which configuration is being used:

```typescript
import { printConfig } from './config/environments';

// In your component or App.tsx
printConfig(); // Logs all endpoints to console
```

## Migration from Old System

The old system used hardcoded defaults in `urls.ts`. The new system:
- ✅ Centralizes all endpoints in one place
- ✅ Makes switching environments easier
- ✅ Still supports environment variable overrides
- ✅ Better documentation and type safety

All existing code using `urls.payments`, `urls.providers`, etc. continues to work without changes.
