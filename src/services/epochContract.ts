export type EpochSeconds = number;

/** Shared API shape for objects that expose canonical instant bounds. */
export interface EpochRange {
  start_epoch?: EpochSeconds | null;
  end_epoch?: EpochSeconds | null;
}

/** Shared API shape for calendar-style day rows. */
export interface EpochDateRow {
  date?: string | null;
  date_epoch?: EpochSeconds | null;
}

/** Provider/customer today-booking slot shape (Phase 1 additive contract). */
export interface TodayBookingEpochFields extends EpochRange {
  slot_start_epoch?: EpochSeconds | null;
  slot_end_epoch?: EpochSeconds | null;
  engagement_start_epoch?: EpochSeconds | null;
  engagement_end_epoch?: EpochSeconds | null;
}

/** Engagement list shape with date-level epoch helpers. */
export interface EngagementEpochFields extends EpochRange {
  start_date_epoch?: EpochSeconds | null;
  end_date_epoch?: EpochSeconds | null;
}

