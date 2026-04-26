/**
 * API shape for GET /api/admin/engagements
 */
export type AdminEngagementRow = {
  engagement_id: number;
  booking_type: string | null;
  service_type: string | null;
  assignment_status: string | null;
  task_status: string | null;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  base_amount: number;
  customer: {
    customerid: number;
    firstname: string | null;
    lastname: string | null;
    mobile: string | null;
  };
  provider: {
    serviceproviderid: number;
    firstname: string | null;
    lastname: string | null;
  } | null;
  payment: { status: string; total_amount: number; payment_mode: string } | null;
  created_at: string | null;
};

export function deriveEngagementStage(e: {
  assignment_status?: string | null;
  task_status?: string | null;
  active?: boolean;
  booking_type?: string | null;
  payment?: { status?: string } | null;
}): string {
  if (e.active === false) {
    return "Closed / inactive";
  }
  const asg = String(e.assignment_status || "").toUpperCase();
  const task = String(e.task_status || "").toUpperCase();
  const book = String(e.booking_type || "").toUpperCase();
  const pay = String(e.payment?.status || "").toUpperCase();

  if (asg === "UNASSIGNED" || asg === "") {
    if (book === "ON_DEMAND") {
      return "Unassigned (on-demand — no provider yet)";
    }
    return "Unassigned (no provider accepted)";
  }

  if (pay && pay !== "SUCCESS" && (pay === "PENDING" || pay === "INIT" || pay === "CREATED")) {
    return `Payment: ${e.payment?.status || pay}`;
  }
  if (asg === "ASSIGNED" && task === "NOT_STARTED" && (pay === "SUCCESS" || !e.payment)) {
    return "Assigned & scheduled (not started)";
  }
  if (task === "IN_PROGRESS") {
    return "In service";
  }
  if (task === "COMPLETED") {
    return "Completed";
  }
  if (task === "CANCELLED" || task === "CANCELED") {
    return "Cancelled";
  }
  if (asg === "ASSIGNED" && pay === "SUCCESS" && task === "NOT_STARTED") {
    return "Booked (paid) — not started";
  }
  return [asg || "—", task || "—"].join(" · ");
}

export function adminRowToFormInitial(r: AdminEngagementRow) {
  const providerId = r.provider?.serviceproviderid ?? 0;
  return {
    engagement_id: r.engagement_id,
    start_date: (r.start_date || "").slice(0, 10),
    end_date: (r.end_date || "").slice(0, 10),
    start_time: (r.start_time || "09:00").slice(0, 5),
    task_status: r.task_status || "NOT_STARTED",
    service_type: r.service_type || "",
    booking_type: r.booking_type || "",
    base_amount: r.base_amount != null ? String(r.base_amount) : "",
    active: r.active !== false,
    serviceproviderid: String(providerId || ""),
    contextProviderId: providerId,
  };
}
