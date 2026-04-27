/**
 * Dispatched on `window` when a support (admin) message is received (socket or poll) so
 * the help panel can show it without a second `io()` client (shared socket is wiped by
 * `removeAllListeners` on reconnect in the global provider).
 */
export const CHAT_INCOMING_MESSAGE_EVENT = "se:chat-incoming-message";

/**
 * Polling + websocket is required for many mobile networks, corporate proxies, and some hosts
 * (websocket-only often fails on Render, Cloud Run, or strict firewalls).
 */
export const defaultChatSocketOptions = {
  transports: ["websocket", "polling"] as string[],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 8,
  timeout: 20_000,
};
