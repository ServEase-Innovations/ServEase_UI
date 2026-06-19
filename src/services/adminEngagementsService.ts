import PaymentInstance from "./paymentInstance";

export type AdminEngagementRow = {
  engagement_id: number;
  booking_type: string;
  service_type: string;
  assignment_status: string;
  engagement_status: string;
  task_status: string;
  start_date: string | null;
  start_time: string | null;
  base_amount: number;
  address?: string | null;
  customer: {
    customerid: number;
    firstname?: string;
    lastname?: string;
    mobile?: string;
  };
  provider: {
    serviceproviderid: number;
    firstname?: string;
    lastname?: string;
  } | null;
  payment_status?: string;
  total_amount?: number;
};

export async function fetchAdminEscalatedOnDemandEngagements() {
  const { data } = await PaymentInstance.get<{
    success: boolean;
    engagements: AdminEngagementRow[];
    count: number;
  }>("/api/admin/engagements", {
    params: {
      booking_type: "ON_DEMAND",
      crm_escalated: true,
      limit: 100,
    },
  });
  return data.engagements ?? [];
}

export async function assignOnDemandEngagement(engagementId: number, providerId: number) {
  const { data } = await PaymentInstance.post<{ success: boolean }>(
    `/api/v2/engagements/${engagementId}/assign`,
    { providerId }
  );
  return data;
}

export type AdminVacationProviderRow = {
  engagement_id: number;
  customer: {
    customerid: number;
    firstname?: string;
    lastname?: string;
    mobile?: string;
  };
  provider: {
    serviceproviderid: number;
    firstname?: string;
    lastname?: string;
    mobile?: string;
  };
  booking_type: string;
  service_type: string;
  vacation_start_date: string;
  vacation_end_date: string;
  leave_days: number;
  address?: string | null;
  pending_on_demand?: Array<{
    engagement_id: number;
    service_type: string;
    start_date: string | null;
    address?: string | null;
  }>;
};

export async function fetchAdminVacationProviders(includePendingOnDemand = true) {
  const { data } = await PaymentInstance.get<{
    success: boolean;
    vacations: AdminVacationProviderRow[];
    count: number;
  }>("/api/admin/vacation-providers", {
    params: {
      include_pending_on_demand: includePendingOnDemand,
    },
  });
  return data.vacations ?? [];
}
