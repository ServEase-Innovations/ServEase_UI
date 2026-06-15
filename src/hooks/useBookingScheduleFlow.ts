import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBookingTypeFromPreference,
  formatDateOnly,
} from "src/utils/maidPricingUtils";
import { isBookingScheduleComplete } from "src/components/ProviderDetails/serviceBookingConfig";
import {
  checkSelectedProviderAvailability,
  type ProviderScheduleCheckResult,
} from "src/services/providerScheduleAvailability";
import { computeDurationHours } from "src/components/ProviderDetails/serviceBookingConfig";
import { resolveScheduleTimeFields } from "src/utils/bookingSchedulePatch";
import { confirmProviderScheduleVerified } from "src/features/bookingType/bookingTypeSlice";

export type SelectedProviderAvailabilityState = {
  loading: boolean;
  available: boolean;
  message?: string;
};

export type UseBookingScheduleFlowOptions = {
  active?: boolean;
  providerId?: number | string | null;
  role?: string;
  latitude?: number | null;
  longitude?: number | null;
  customerId?: number | null;
};

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useBookingScheduleFlow(options: UseBookingScheduleFlowOptions = {}) {
  const dispatch = useDispatch();
  const {
    active = true,
    providerId,
    role = "COOK",
    latitude,
    longitude,
    customerId,
  } = options;

  const committedSchedule = useSelector(
    (state: {
      bookingType?: {
        value?: Record<string, unknown> | null;
        scheduleRevision?: number;
      };
    }) => state.bookingType?.value ?? null
  );

  const scheduleRevision = useSelector(
    (state: { bookingType?: { scheduleRevision?: number } }) =>
      state.bookingType?.scheduleRevision ?? 0
  );
  const scheduleDirty = useSelector(
    (state: { bookingType?: { scheduleDirty?: boolean } }) =>
      Boolean(state.bookingType?.scheduleDirty)
  );

  const bookingTypeCode = getBookingTypeFromPreference(
    String(committedSchedule?.bookingPreference ?? "Date")
  );

  const scheduleReady = useMemo(
    () =>
      isBookingScheduleComplete(
        (committedSchedule ?? {}) as Record<string, unknown>,
        bookingTypeCode
      ),
    [committedSchedule, bookingTypeCode]
  );

  const [selectedProviderAvailability, setSelectedProviderAvailability] =
    useState<SelectedProviderAvailabilityState>({
      loading: false,
      available: true,
    });

  const resolvedProviderId = useMemo(() => {
    const n = Number(providerId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [providerId]);

  const coordsReady =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const scheduleParams = useMemo(() => {
    if (!committedSchedule) return null;

    const startDate =
      formatDateOnly(String(committedSchedule.startDate ?? "")) || todayYmd();
    const endDate =
      formatDateOnly(String(committedSchedule.endDate ?? "")) || startDate;
    const { startTime, endTime } = resolveScheduleTimeFields(committedSchedule);
    const durationHours = computeDurationHours(
      bookingTypeCode,
      startTime,
      endTime,
      startDate,
      endDate,
      String(committedSchedule.timeRange ?? ""),
      String(committedSchedule.timeSlot ?? "")
    );
    const durationMinutes =
      durationHours != null && durationHours > 0
        ? Math.round(durationHours * 60)
        : 60;

    return {
      startDate,
      endDate,
      preferredStartTime: startTime,
      durationMinutes,
      role: String(committedSchedule.housekeepingRole || role),
    };
  }, [committedSchedule, bookingTypeCode, role]);

  useEffect(() => {
    if (
      !active ||
      !resolvedProviderId ||
      bookingTypeCode === "ON_DEMAND" ||
      !scheduleReady ||
      !coordsReady ||
      scheduleDirty ||
      !scheduleParams
    ) {
      setSelectedProviderAvailability({ loading: false, available: true });
      return;
    }

    let cancelled = false;
    setSelectedProviderAvailability((prev) => ({ ...prev, loading: true }));

    checkSelectedProviderAvailability({
      providerId: resolvedProviderId,
      latitude: latitude!,
      longitude: longitude!,
      role: scheduleParams.role,
      startDate: scheduleParams.startDate,
      endDate: scheduleParams.endDate,
      preferredStartTime: scheduleParams.preferredStartTime,
      serviceDurationMinutes: scheduleParams.durationMinutes,
      customerId,
    })
      .then((result: ProviderScheduleCheckResult) => {
        if (cancelled) return;
        setSelectedProviderAvailability({
          loading: false,
          available: result.available,
          message: result.message,
        });
        if (result.available) {
          dispatch(confirmProviderScheduleVerified(String(resolvedProviderId)));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedProviderAvailability({
          loading: false,
          available: false,
          message:
            "Could not verify provider availability for this schedule. Please try again or choose another provider.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    active,
    resolvedProviderId,
    bookingTypeCode,
    scheduleReady,
    coordsReady,
    scheduleDirty,
    latitude,
    longitude,
    customerId,
    scheduleParams,
    scheduleRevision,
    dispatch,
  ]);

  const selectedProviderReady =
    !resolvedProviderId ||
    bookingTypeCode === "ON_DEMAND" ||
    (selectedProviderAvailability.available && !selectedProviderAvailability.loading);

  return {
    committedSchedule,
    scheduleRevision,
    bookingTypeCode,
    scheduleReady,
    selectedProviderAvailability,
    selectedProviderReady,
  };
}
