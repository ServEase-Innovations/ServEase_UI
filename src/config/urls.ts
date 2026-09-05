/**
 * Central API base URLs. Uses environment-specific configurations.
 * 
 * @see environments.ts for centralized dev/prod endpoint configuration
 * 
 * Environment variables still work and will override the config values.
 */
import { getEndpoint } from './environments';

export const urls = {
  /** **payments** — HTTP + Socket.IO; engagements, payments, in-app notifications. */
  get payments() {
    return getEndpoint('payments');
  },
  /** **providers** (customer/SP CRUD, discovery). */
  get providers() {
    return getEndpoint('providers');
  },
  get preferences() {
    return getEndpoint('preferences');
  },
  /** **utils** — check-email, pricing `/records`, etc. */
  get utils() {
    return getEndpoint('utils');
  },
  /**
   * Raw WebSocket to utils (e.g. booking `LISTEN` bridge in some deployments).
   * Set `REACT_APP_UTILS_WS_URL` if the HTTP and WS hosts differ (common on Render).
   */
  get utilsWebsocket() {
    return getEndpoint('utilsWebsocket');
  },
  get reviews() {
    return getEndpoint('reviews');
  },
  /** **tickets** — customer complaints & admin support queue. */
  get tickets() {
    return getEndpoint('tickets');
  },
  /** **coupons** service — not wired to a shared axios client yet. */
  get coupons() {
    return getEndpoint('coupons');
  },
  /**
   * **chat** — ServEase support widget (`find-or-create` user, `/api/chat`, `/api/message`, Socket.IO).
   * @see `src/components/Chat/Chatbot.tsx`
   */
  get chat() {
    return getEndpoint('chat');
  },
  /** **image-uploader** — Cloudinary-backed file uploads (SP registration). */
  get imageUploader() {
    return getEndpoint('imageUploader');
  },
  /** **tracking** — real-time provider location tracking. */
  get tracking() {
    return getEndpoint('tracking');
  },
  /** **tracking websocket** — real-time tracking WebSocket. */
  get trackingWebsocket() {
    return getEndpoint('trackingWebsocket');
  },
};

/** Payments pricing V2 API paths (Render DEV: https://payments-vyqp.onrender.com). */
export const paymentsPricingPaths = {
  quote: "/api/v2/pricing/quote",
  plans: "/api/v2/pricing/plans",
  plan: (serviceType: string, bookingType: string) =>
    `/api/v2/pricing/plans/${encodeURIComponent(serviceType.toUpperCase())}/${encodeURIComponent(bookingType.toUpperCase())}`,
} as const;
