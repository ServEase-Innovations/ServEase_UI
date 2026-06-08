export type BookingNotificationRow = {
  type?: string;
  metadata?: unknown;
  bookingActionable?: boolean;
  bookingClosureLabel?: string | null;
};

const NEW_BOOKING_TYPES = new Set([
  "NEW_BOOKING_OPPORTUNITY",
  "NEW_BOOKING_REQUEST",
]);

function asMeta(m: unknown): Record<string, unknown> | null {
  if (m && typeof m === "object" && !Array.isArray(m)) {
    return m as Record<string, unknown>;
  }
  return null;
}

function isNewBookingType(type?: string): boolean {
  const t = (type || "").toUpperCase();
  return (
    NEW_BOOKING_TYPES.has(t) || t.includes("NEW_BOOKING") || t.includes("OPPORTUNITY")
  );
}

export type BookingNotificationAction = {
  actionable: boolean;
  label: string | null;
};

/** Whether Accept / Decline / View details should show for this in-app row. */
export function getBookingNotificationAction(
  n: BookingNotificationRow
): BookingNotificationAction | null {
  if (!isNewBookingType(n.type)) return null;

  if (n.bookingActionable === false) {
    return {
      actionable: false,
      label: n.bookingClosureLabel ?? "Already accepted",
    };
  }
  if (n.bookingActionable === true) {
    return { actionable: true, label: null };
  }

  const meta = asMeta(n.metadata);
  const engStatus = String(
    meta?.engagement_status ?? meta?.engagementStatus ?? ""
  ).toUpperCase();
  const assignStatus = String(
    meta?.assignment_status ?? meta?.assignmentStatus ?? ""
  ).toUpperCase();
  const assignedSp = meta?.serviceproviderid ?? meta?.serviceProviderId;

  if (
    ["CANCELLED", "EXPIRED", "COMPLETED", "CLOSED", "REJECTED"].includes(
      engStatus
    )
  ) {
    return { actionable: false, label: "Already accepted" };
  }
  if (assignedSp != null && assignedSp !== "") {
    return { actionable: false, label: "Already accepted" };
  }
  if (assignStatus && assignStatus !== "UNASSIGNED") {
    return { actionable: false, label: "Already accepted" };
  }
  if (
    engStatus &&
    !["OPEN_FOR_ACCEPTANCE", "UNASSIGNED", ""].includes(engStatus)
  ) {
    return { actionable: false, label: "Already accepted" };
  }

  return { actionable: true, label: null };
}
