export function openSupportTicketDialog(ticketId: number) {
  window.dispatchEvent(
    new CustomEvent("open-support-ticket", {
      detail: { ticketId: Number(ticketId) },
    })
  );
}

export type OpenSupportTicketDetail = { ticketId: number };

export type AdminTicketActivityDetail = {
  ticketId: number;
  ticketNumber?: string | null;
  title?: string;
  body?: string;
  reason?: string;
  status?: string | null;
  customerId?: number | null;
  createdAt?: string;
};

export const ADMIN_TICKET_ACTIVITY_EVENT = "admin-ticket-activity";
export const ADMIN_OPEN_TICKET_EVENT = "admin-open-ticket";

export function dispatchAdminTicketActivity(detail: AdminTicketActivityDetail) {
  window.dispatchEvent(
    new CustomEvent(ADMIN_TICKET_ACTIVITY_EVENT, { detail })
  );
}

export function dispatchAdminOpenTicket(ticketId: number) {
  window.dispatchEvent(
    new CustomEvent(ADMIN_OPEN_TICKET_EVENT, {
      detail: { ticketId: Number(ticketId) },
    })
  );
}
