import { useEffect } from "react";
import { io } from "socket.io-client";
import { urls } from "src/config/urls";
import {
  dispatchAdminTicketActivity,
  type AdminTicketActivityDetail,
} from "src/utils/supportTicketEvents";
import {
  dispatchAdminOnDemandEscalation,
  type AdminOnDemandEscalationDetail,
} from "src/utils/onDemandEscalationEvents";

/** Connect to payments Socket.IO and forward admin ops events to the UI. */
export function useAdminOpsSocket(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const socket = io(urls.payments, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnection: true,
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

    socket.on("on_demand_crm_escalation", (payload: AdminOnDemandEscalationDetail) => {
      const engagementId = Number(payload?.engagementId);
      if (!Number.isFinite(engagementId) || engagementId < 1) return;
      dispatchAdminOnDemandEscalation({
        ...payload,
        engagementId,
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

/** @deprecated Use useAdminOpsSocket */
export const useAdminTicketSocket = useAdminOpsSocket;
