export type AdminOnDemandEscalationDetail = {
  engagementId: number;
  bookingType?: string;
  serviceType?: string;
  startEpoch?: number | null;
  startTimeLabel?: string | null;
  address?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  customerMobile?: string | null;
  customerEmail?: string | null;
  escalatedAt?: string;
};

export const ADMIN_ON_DEMAND_ESCALATION_EVENT = "admin-on-demand-escalation";
export const ADMIN_OPEN_ON_DEMAND_ESCALATIONS_EVENT = "admin-open-on-demand-escalations";

export function dispatchAdminOnDemandEscalation(detail: AdminOnDemandEscalationDetail) {
  window.dispatchEvent(
    new CustomEvent(ADMIN_ON_DEMAND_ESCALATION_EVENT, { detail })
  );
}

export function dispatchAdminOpenOnDemandEscalations() {
  window.dispatchEvent(new CustomEvent(ADMIN_OPEN_ON_DEMAND_ESCALATIONS_EVENT));
}
