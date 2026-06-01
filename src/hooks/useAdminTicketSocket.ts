import { useEffect } from "react";
import { io } from "socket.io-client";
import { urls } from "src/config/urls";
import {
  dispatchAdminTicketActivity,
  type AdminTicketActivityDetail,
} from "src/utils/supportTicketEvents";

/** Connect to payments Socket.IO and forward support-ticket events to the admin UI. */
export function useAdminTicketSocket(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const socket = io(urls.payments, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("join", { adminTickets: true });
    });

    socket.on("support_ticket_activity", (payload: AdminTicketActivityDetail) => {
      const ticketId = Number(payload?.ticketId);
      if (!Number.isFinite(ticketId) || ticketId < 1) return;
      dispatchAdminTicketActivity({
        ...payload,
        ticketId,
      });
    });

    socket.on("connect_error", (err) => {
      console.warn("[admin-tickets] socket:", err?.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
}
