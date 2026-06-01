/**
 * Central API base URLs. Defaults match `npm run dev` from the Serveaso-BE monorepo.
 * Override in `.env.local` / your host’s build env.
 *
 * ## Map: env → monorepo service → axios (or socket) client → what it is for
 *
 * | Env (first one wins) | `urls` / client | Main usage in the UI |
 * |----------------------|-----------------|----------------------|
 * | `REACT_APP_PAYMENTS_URL`, `REACT_APP_SOCKET_URL` | `urls.payments` → `paymentInstance`, `io(urls.payments)` | **payments** (Engagements, payments, in-app notifications, **Socket.IO** toasts) |
 * | `REACT_APP_PROVIDER_URL`, `REACT_APP_URL` | `urls.providers` → `providerInstance` | **providers** (e.g. `POST /api/customer` registration) |
 * | (same) | `urls.providers` → `axiosInstance` (same base as `providerInstance`) | Legacy duplicate client — prefer `providerInstance` |
 * | `REACT_APP_PREFERENCES_URL` | `urls.preferences` → `preferenceInstance` | **preferences** (saved locations / `user-settings` API) |
 * | `REACT_APP_UTILS_URL`, `REACT_APP_UTLIS_URL` (typo) | `urls.utils` → `utilsInstance` | **utils** (`/customer/check-email`, `/records` pricing, `/api/platform-settings`, `/api/platform-status`) |
 * | `REACT_APP_UTILS_WS_URL` (optional) | `urls.utilsWebsocket` | Raw **WebSocket** to utils (e.g. `NotificationClient`); if unset, derived from `urls.utils` (`http` → `ws`, `https` → `wss`) |
 * | `REACT_APP_REVIEWS_URL` | `urls.reviews` → `reviewsInstance` | **reviews** |
 * | `REACT_APP_TICKETS_URL` | `urls.tickets` → `ticketsInstance` | **tickets** (complaints / support) |
 * | `REACT_APP_COUPONS_URL` | `urls.coupons` | **coupons** (no axios file yet; reserved) |
 * | `REACT_APP_CHAT_URL` | `urls.chat` → `Chatbot` (axios + Socket.IO) | **help / live support** widget |
 *
 * ## Not used by this file
 * - `REACT_APP_API_URL` — not read anywhere. A generic host (e.g. `https://servease-be-5x7f.onrender.com`) does **nothing** unless
 *   you set one of the variables above to that same origin for the right **service** (e.g. point `REACT_APP_PROVIDER_URL` at a gateway
 *   that paths to providers, etc.). This app is multi-service, not a single `servease-be` URL in code.
 */
function ev(...keys: (string | undefined)[]) {
  for (const v of keys) {
    if (v != null && String(v).trim() !== "") {
      return v.replace(/\/$/, "");
    }
  }
  return undefined;
}

export const urls = {
  /** **payments** — HTTP + Socket.IO; engagements, notifications. */
  get payments() {
    return (
      ev(process.env.REACT_APP_PAYMENTS_URL, process.env.REACT_APP_SOCKET_URL) ||
      "http://localhost:4100"
    );
  },
  /** **providers** (customer/SP CRUD, discovery). */
  get providers() {
    return ev(process.env.REACT_APP_PROVIDER_URL, process.env.REACT_APP_URL) || "http://localhost:4000";
  },
  get preferences() {
    return process.env.REACT_APP_PREFERENCES_URL || "http://localhost:3001";
  },
  /** **utils** — check-email, pricing `/records`, etc. */
  get utils() {
    return ev(process.env.REACT_APP_UTILS_URL, process.env.REACT_APP_UTLIS_URL) || "http://localhost:3030";
  },
  /**
   * Raw WebSocket to utils (e.g. booking `LISTEN` bridge in some deployments).
   * Set `REACT_APP_UTILS_WS_URL` if the HTTP and WS hosts differ (common on Render).
   */
  get utilsWebsocket() {
    const explicit = ev(process.env.REACT_APP_UTILS_WS_URL);
    if (explicit) {
      return explicit;
    }
    const http = this.utils;
    if (http.startsWith("https://")) {
      return http.replace(/^https:\/\//, "wss://").replace(/\/$/, "");
    }
    if (http.startsWith("http://")) {
      return http.replace(/^http:\/\//, "ws://").replace(/\/$/, "");
    }
    return "ws://localhost:3030";
  },
  get reviews() {
    return process.env.REACT_APP_REVIEWS_URL || "http://localhost:5005";
  },
  /** **tickets** — customer complaints & admin support queue. */
  get tickets() {
    return process.env.REACT_APP_TICKETS_URL || "http://localhost:5006";
  },
  /** **coupons** service — not wired to a shared axios client yet. */
  get coupons() {
    return process.env.REACT_APP_COUPONS_URL || "http://localhost:3002";
  },
  /**
   * **chat** — ServEase support widget (`find-or-create` user, `/api/chat`, `/api/message`, Socket.IO).
   * @see `src/components/Chat/Chatbot.tsx`
   */
  get chat() {
    return process.env.REACT_APP_CHAT_URL || "https://chat-b3wl.onrender.com";
  },
};

/** Payments pricing V2 API paths (Render: https://payments-j5id.onrender.com). */
export const paymentsPricingPaths = {
  quote: "/api/v2/pricing/quote",
  plans: "/api/v2/pricing/plans",
  plan: (serviceType: string, bookingType: string) =>
    `/api/v2/pricing/plans/${encodeURIComponent(serviceType.toUpperCase())}/${encodeURIComponent(bookingType.toUpperCase())}`,
} as const;
