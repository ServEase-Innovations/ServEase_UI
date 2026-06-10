import ticketsInstance from "./ticketsInstance";
import adminTicketsInstance from "./adminTicketsInstance";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_CUSTOMER"
  | "RESOLUTION_PROVIDED"
  | "PENDING_CUSTOMER_CONFIRMATION"
  | "REOPENED"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

const AWAITING_CUSTOMER_CONFIRMATION: TicketStatus[] = [
  "RESOLUTION_PROVIDED",
  "PENDING_CUSTOMER_CONFIRMATION",
  "RESOLVED",
];

export function isAwaitingCustomerConfirmation(status: TicketStatus | string): boolean {
  return AWAITING_CUSTOMER_CONFIRMATION.includes(status as TicketStatus);
}

export type TicketCategory =
  | "GENERAL"
  | "BOOKING"
  | "PAYMENT"
  | "SERVICE_QUALITY"
  | "PROVIDER_CONDUCT"
  | "REFUND"
  | "APP_TECHNICAL";

export interface SupportTicket {
  ticket_id: number;
  ticket_number: string;
  customerid: number;
  engagement_id: number | null;
  serviceproviderid: number | null;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_admin_email: string | null;
  sla_hours: number;
  sla_due_at: string;
  is_overdue: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string | null;
  customer_mobile?: string | null;
  comments?: TicketComment[];
}

export interface TicketComment {
  comment_id: number;
  author_type: string;
  author_id: number | null;
  author_name: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  waiting_customer: number;
  pending_customer_confirmation?: number;
  reopened?: number;
  resolved: number;
  overdue: number;
  high_priority_open: number;
}

export function getEngagementIdFromBooking(booking: { id?: number; engagement_id?: number }) {
  if (booking?.engagement_id != null) return Number(booking.engagement_id);
  if (booking?.id != null) return Number(booking.id);
  return null;
}

export async function fetchTicketMeta() {
  const { data } = await ticketsInstance.get<{
    success: boolean;
    categories: TicketCategory[];
    priorities: TicketPriority[];
    default_sla_hours: number;
  }>("/api/tickets/meta");
  return data;
}

export async function createSupportTicket(payload: {
  customerId: number;
  subject: string;
  description: string;
  category?: TicketCategory;
  engagementId?: number | null;
}) {
  const { data } = await ticketsInstance.post<{
    success: boolean;
    message?: string;
    ticket?: SupportTicket;
    error?: string;
  }>("/api/tickets", payload, {
    headers: { "x-customer-id": String(payload.customerId) },
  });
  return data;
}

export async function fetchMyTickets(customerId: number, status?: TicketStatus) {
  const { data } = await ticketsInstance.get<{
    success: boolean;
    tickets: SupportTicket[];
    count: number;
  }>("/api/tickets/mine", {
    params: { customerId, status },
  });
  return data.tickets ?? [];
}

export async function fetchTicketById(ticketId: number, customerId: number) {
  const { data } = await ticketsInstance.get<{ success: boolean; ticket: SupportTicket }>(
    `/api/tickets/${ticketId}`,
    { params: { customerId } }
  );
  return data.ticket;
}

export async function addCustomerTicketComment(
  ticketId: number,
  customerId: number,
  body: string
) {
  const { data } = await ticketsInstance.post<{ success: boolean; ticket: SupportTicket }>(
    `/api/tickets/${ticketId}/comments`,
    { body },
    { headers: { "x-customer-id": String(customerId) } }
  );
  return data.ticket;
}

export async function acceptTicketResolution(ticketId: number, customerId: number) {
  const { data } = await ticketsInstance.post<{ success: boolean; ticket: SupportTicket }>(
    `/api/tickets/${ticketId}/accept-resolution`,
    {},
    { headers: { "x-customer-id": String(customerId) } }
  );
  return data.ticket;
}

export async function reopenSupportTicket(
  ticketId: number,
  customerId: number,
  body?: string
) {
  const { data } = await ticketsInstance.post<{ success: boolean; ticket: SupportTicket }>(
    `/api/tickets/${ticketId}/reopen`,
    { body },
    { headers: { "x-customer-id": String(customerId) } }
  );
  return data.ticket;
}

export async function fetchAdminTicketStats() {
  const { data } = await adminTicketsInstance.get<{
    success: boolean;
    stats: TicketStats;
    default_sla_hours: number;
  }>("/api/admin/tickets/stats");
  return data;
}

export async function fetchAdminTickets(params?: {
  status?: string;
  priority?: string;
  overdueOnly?: boolean;
  search?: string;
}) {
  const { data } = await adminTicketsInstance.get<{
    success: boolean;
    tickets: SupportTicket[];
    count: number;
  }>("/api/admin/tickets", { params });
  return data.tickets ?? [];
}

export async function fetchAdminTicketById(ticketId: number) {
  const { data } = await adminTicketsInstance.get<{ success: boolean; ticket: SupportTicket }>(
    `/api/admin/tickets/${ticketId}`
  );
  return data.ticket;
}

export async function updateAdminTicket(
  ticketId: number,
  updates: Partial<{
    status: TicketStatus;
    priority: TicketPriority;
    sla_hours: number;
    assigned_admin_email: string;
    resolution_notes: string;
  }>
) {
  const { data } = await adminTicketsInstance.patch<{ success: boolean; ticket: SupportTicket }>(
    `/api/admin/tickets/${ticketId}`,
    updates
  );
  return data.ticket;
}

export async function addAdminTicketComment(
  ticketId: number,
  body: string,
  isInternal = false
) {
  const { data } = await adminTicketsInstance.post<{ success: boolean; ticket: SupportTicket }>(
    `/api/admin/tickets/${ticketId}/comments`,
    { body, is_internal: isInternal }
  );
  return data.ticket;
}

export async function provideAdminTicketResolution(
  ticketId: number,
  resolutionNotes: string
) {
  const { data } = await adminTicketsInstance.post<{ success: boolean; ticket: SupportTicket }>(
    `/api/admin/tickets/${ticketId}/provide-resolution`,
    { resolution_notes: resolutionNotes }
  );
  return data.ticket;
}

const TICKET_ERROR_MESSAGES: Record<string, string> = {
  CUSTOMER_ID_REQUIRED: "Please sign in again to submit a complaint.",
  ENGAGEMENT_NOT_FOUND: "This booking could not be found.",
  CUSTOMER_MISMATCH: "This booking does not belong to your account.",
  MISSING_REQUIRED_FIELDS: "Please enter a subject and description.",
  INVALID_CATEGORY: "Please choose a valid category.",
  ADMIN_STATUS_FORBIDDEN:
    "This status must be set through the resolution workflow. Provide resolution and let the customer confirm before closing.",
  RESOLUTION_NOTES_REQUIRED: "Please enter resolution notes before requesting customer confirmation.",
  NOT_AWAITING_CONFIRMATION: "This ticket is not waiting for your confirmation.",
  USE_REOPEN_ACTION: "Use “Still need help” to reopen this ticket instead of adding a comment.",
  AWAITING_CUSTOMER_CONFIRMATION:
    "This ticket is waiting for the customer to accept or reopen the resolution.",
};

export function ticketErrorMessage(code?: string, fallback = "Something went wrong.") {
  if (!code) return fallback;
  return TICKET_ERROR_MESSAGES[code] || fallback;
}
