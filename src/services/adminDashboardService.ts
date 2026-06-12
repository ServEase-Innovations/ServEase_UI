import paymentInstance from "./paymentInstance";
import { fetchAdminTicketStats, type TicketStats } from "./ticketsService";

export type DashboardDayPoint = { date: string; count?: number; amount?: number };

export type AdminDashboardData = {
  generated_at: string;
  period_days: number;
  counts: {
    customers: { total: number; active: number; last_30_days: number };
    providers: { total: number; active: number; last_30_days: number };
    engagements: { total: number; active: number; unassigned: number; last_30_days: number };
    payments: { success_count: number; total_collected: number; net_revenue: number };
  };
  changes: {
    customers_pct: number;
    providers_pct: number;
    engagements_pct: number;
    revenue_pct: number;
  };
  charts: {
    bookings_by_day: Array<{ date: string; count: number }>;
    revenue_by_day: Array<{ date: string; amount: number }>;
  };
  recent: {
    customers: Array<{
      customerid: number;
      firstname: string;
      lastname: string;
      enrolleddate: string | null;
    }>;
    engagements: Array<{
      engagement_id: number;
      booking_type: string | null;
      service_type: string | null;
      assignment_status: string | null;
      task_status: string | null;
      created_at: string | null;
      customer_name: string | null;
    }>;
  };
};

export type AdminDashboardSnapshot = {
  dashboard: AdminDashboardData;
  tickets: TicketStats | null;
};

export async function fetchAdminDashboard(days = 14): Promise<AdminDashboardSnapshot> {
  const [dashboardRes, ticketsRes] = await Promise.allSettled([
    paymentInstance.get<{ success: boolean; error?: string } & AdminDashboardData>(
      "/api/admin/dashboard",
      { params: { days } }
    ),
    fetchAdminTicketStats(),
  ]);

  if (dashboardRes.status === "rejected") {
    throw dashboardRes.reason;
  }

  const body = dashboardRes.value.data;
  if (!body?.success) {
    throw new Error(body?.error || "Failed to load dashboard metrics");
  }

  const { success: _s, error: _e, ...dashboard } = body;

  return {
    dashboard: dashboard as AdminDashboardData,
    tickets: ticketsRes.status === "fulfilled" ? ticketsRes.value.stats : null,
  };
}
