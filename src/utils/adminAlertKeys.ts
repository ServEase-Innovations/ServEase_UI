import type { AdminOnDemandEscalationDetail } from "src/utils/onDemandEscalationEvents";
import type { AdminTicketActivityDetail } from "src/utils/supportTicketEvents";

/** Stable key for support-ticket socket alerts. */
export function ticketAlertKey(detail: Pick<AdminTicketActivityDetail, "ticketId" | "createdAt" | "reason">) {
  return `ticket-${detail.ticketId}-${detail.createdAt || ""}-${detail.reason || ""}`;
}

/** Stable key per escalated on-demand engagement (must not include volatile timestamps). */
export function onDemandEscalationAlertKey(
  detail: Pick<AdminOnDemandEscalationDetail, "engagementId">
) {
  return `on-demand-${detail.engagementId}`;
}
