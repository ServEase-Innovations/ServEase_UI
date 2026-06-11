/* eslint-disable */
import React, { useCallback, useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Snackbar, Alert, CircularProgress, Checkbox, FormControlLabel, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CalendarClock } from "lucide-react";
import { coalesceStartEpoch } from "src/services/bookingEpoch";
import {
  BookingService,
  isPaymentCancelledError,
} from "src/services/bookingService";
import { formatInr } from "src/utils/maidPricingUtils";
import { computeCheckoutWithWallet } from "src/utils/paymentTotals";
import { fetchCustomerWallet } from "src/services/walletService";
import { useLanguage } from "src/context/LanguageContext";
import ModifyBookingScheduleSection, {
  type ModifyBookingScheduleHandle,
  type ModifyWizardState,
} from "./ModifyBookingScheduleSection";
import {
  MaidStyledDialog,
  MaidStyledContent,
  bookingDialogSlotProps,
  MaidRoot,
  MaidHeader,
  MaidHeaderTitle,
  MaidHeaderSub,
  MaidCloseBtn,
  MaidScroll,
  MaidCard,
  MaidCardTitle,
  MaidCardSub,
  MaidPriceHero,
  MaidPriceBlock,
  MaidPriceLabel,
  MaidReviewTotal,
  MaidPriceMeta,
  MaidQuotePulse,
  MaidFooter,
  MaidFooterTop,
  MaidFooterMuted,
  MaidFooterPrice,
  MaidFooterActions,
  MaidBtnGhost,
  MaidBtnPrimary,
} from "../ProviderDetails/MaidServiceDialog.styles";

interface Booking {
  bookingType: string;
  id: number;
  startDate: string;
  endDate: string;
  start_epoch?: number | null;
  end_epoch?: number | null;
  start_time?: string;
  end_time?: string;
  timeSlot: string;
  service_type: string;
  serviceProviderId?: number;
  latitude?: number | null;
  longitude?: number | null;
  customerId?: number;
  modifiedDate: string;
  bookingDate: string;
  hasVacation?: boolean;
  modifications?: Array<{
    date: string;
    action: string;
    changes?: {
      new_start_date?: string;
      new_end_date?: string;
      new_start_time?: string;
      start_date?: { from: string; to: string };
      end_date?: { from: string; to: string };
      start_time?: { from: string; to: string };
    };
    refund?: number;
    penalty?: number;
  }>;
  payment?: {
    base_amount?: string | number;
    platform_fee?: string | number;
    gst?: string | number;
    total_amount?: string | number;
    status?: string;
  };
  base_amount?: number;
}

type ModificationFeeQuote = {
  booking_base: number;
  platform_fee: number;
  gst: number;
  taxes_and_fees: number;
  total_amount: number;
};

interface ModifyBookingDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  timeSlots: string[];
  onSave: (updatedData: {
    startDate: string;
    endDate: string;
    timeSlot: string;
  }) => void;
  customerId: number | null;
  refreshBookings: () => Promise<void>;
}

const ModifyBookingDialog: React.FC<ModifyBookingDialogProps> = ({
  open,
  onClose,
  booking,
  onSave,
  customerId,
  refreshBookings,
}) => {
  const { t } = useLanguage();
  const scheduleRef = useRef<ModifyBookingScheduleHandle>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityVerified, setAvailabilityVerified] = useState(false);
  const [availabilityCheckBlocked, setAvailabilityCheckBlocked] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [wizardState, setWizardState] = useState<ModifyWizardState>({
    step: "schedule",
    canGoNext: false,
    canGoBack: false,
    canSubmit: false,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success" | "warning">(
    "error"
  );
  const [modificationFee, setModificationFee] = useState<ModificationFeeQuote | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  const resolveBookingStart = (value: Booking | null): Dayjs | null => {
    if (!value) return null;
    const startEpoch = coalesceStartEpoch(value.start_epoch, value.startDate);
    return startEpoch != null ? dayjs.unix(startEpoch) : dayjs(value.startDate);
  };

  const parseTimeSlot = (booking: Booking): { start?: string; end?: string } => {
    if (booking.start_time) {
      return {
        start: booking.start_time,
        end: booking.end_time || undefined,
      };
    }
    const slot = String(booking.timeSlot || "").trim();
    if (slot.includes("-")) {
      const [a, b] = slot.split("-").map((s) => s.trim());
      return { start: a, end: b };
    }
    return { start: slot || undefined };
  };

  const getBookedTime = (value: Booking | null) => {
    if (!value) return dayjs();
    const base = resolveBookingStart(value) || dayjs();
    const { start } = parseTimeSlot(value);
    if (!start) return base;
    const parsed = dayjs(start, ["HH:mm", "H:mm", "h:mm A", "hh:mm A"], true);
    if (parsed.isValid()) {
      return base.hour(parsed.hour()).minute(parsed.minute()).second(0);
    }
    return base;
  };

  const isModificationTimeAllowed = (value: Booking | null): boolean => {
    if (!value) return false;
    const base = resolveBookingStart(value);
    if (!base) return false;
    const bookedTime = getBookedTime(value);
    return dayjs().isBefore(bookedTime.subtract(30, "minute"));
  };

  const isBookingAlreadyModified = (value: Booking | null): boolean => {
    if (!value) return false;
    const modifications = value.modifications ?? [];
    return modifications.some((mod) => {
      const action = String(mod.action || "");
      return (
        action === "Schedule Rescheduled" ||
        action === "Date Rescheduled" ||
        action === "Time Rescheduled" ||
        action === "Rescheduled"
      );
    });
  };

  const getModificationStatusMessage = (value: Booking | null): string => {
    if (!value) return "";
    if (isBookingAlreadyModified(value)) {
      return "This booking has already been modified and cannot be modified again.";
    }
    if (!isModificationTimeAllowed(value)) {
      return "Modification is only allowed at least 30 minutes before the scheduled time.";
    }
    return "";
  };

  const isModificationDisabled = (value: Booking | null): boolean => {
    if (!value) return true;
    return !isModificationTimeAllowed(value) || isBookingAlreadyModified(value);
  };

  const getTimeUntilBooking = (value: Booking | null): string => {
    if (!value) return "";
    const bookedTime = getBookedTime(value);
    const now = dayjs();
    const diffMinutes = bookedTime.diff(now, "minute");
    if (diffMinutes <= 0) return "Booking has already started or passed";
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0
      ? `${hours}h ${minutes}m until booking starts`
      : `${minutes}m until booking starts`;
  };

  const getLastModificationDetails = (value: Booking | null): string => {
    const modifications = value?.modifications ?? [];
    if (modifications.length === 0) return "";
    const lastMod = modifications[modifications.length - 1];
    if (lastMod.changes?.start_date) {
      return `Last rescheduled from ${lastMod.changes.start_date.from} to ${lastMod.changes.start_date.to}`;
    }
    if (lastMod.changes?.start_time) {
      return `Last time changed from ${lastMod.changes.start_time.from} to ${lastMod.changes.start_time.to}`;
    }
    return `Last modified: ${lastMod.action}`;
  };

  const showToast = useCallback((message: string, severity: "error" | "success" | "warning") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleAvailabilityVerifiedChange = useCallback(
    (verified: boolean, message?: string) => {
      setAvailabilityVerified(verified);
      if (!verified && message) {
        showToast(message, "error");
      }
    },
    [showToast]
  );

  const handleScheduleChange = useCallback(() => {
    setAvailabilityVerified(false);
    setAvailabilityCheckBlocked(false);
  }, []);

  const handleCheckAvailability = async () => {
    setError(null);
    setIsCheckingAvailability(true);
    try {
      const ok = await scheduleRef.current?.checkAvailability();
      if (ok) {
        setAvailabilityVerified(true);
        setAvailabilityCheckBlocked(false);
        showToast("Your service provider is available for this schedule.", "success");
      } else {
        setAvailabilityVerified(false);
        setAvailabilityCheckBlocked(true);
      }
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmit = async () => {
    if (!booking) return;

    if (isModificationDisabled(booking)) {
      setError(getModificationStatusMessage(booking));
      return;
    }

    const snapshot = scheduleRef.current?.getScheduleSnapshot();
    if (!snapshot) {
      setError("Select your dates and daily start time before saving.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!availabilityVerified) {
        setError("Check provider availability before updating your schedule.");
        setIsLoading(false);
        return;
      }
      const result = await BookingService.modifyScheduleWithPayment({
        engagementId: booking.id,
        start_date: snapshot.startDate,
        end_date: snapshot.endDate,
        start_time: snapshot.startTime,
        end_time: snapshot.endTime || undefined,
        modified_by_id: customerId,
        modified_by_role: "CUSTOMER",
        use_wallet: useWalletBalance && walletBalance > 0,
      });

      if (result.requires_payment && result.razorpay_order_id) {
        const amountPaise =
          result.amount != null && Number.isFinite(Number(result.amount))
            ? Number(result.amount)
            : Math.round(Number(result.amount_inr || 0) * 100);
        if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
          throw new Error("Invalid modification payment amount");
        }
        const paymentResponse = await BookingService.openRazorpay(
          result.razorpay_order_id,
          amountPaise,
          result.currency || "INR",
          undefined,
          result.razorpay_key_id
        );
        paymentResponse.engagementId = booking.id;
        await BookingService.verifyModifySchedulePayment(paymentResponse);
      }

      if (customerId !== null) await refreshBookings();

      const displayTime = dayjs(snapshot.startTime, "HH:mm").isValid()
        ? dayjs(snapshot.startTime, "HH:mm").format("hh:mm A")
        : booking.timeSlot;

      onSave({
        startDate: snapshot.startDate,
        endDate: snapshot.endDate,
        timeSlot: displayTime,
      });
    } catch (err: unknown) {
      if (isPaymentCancelledError(err)) {
        setError("Payment cancelled. Your schedule was not updated.");
        return;
      }
      const apiMessage =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const message = apiMessage || "Failed to modify booking. Please try again.";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && booking) {
      setError(null);
      setAvailabilityVerified(false);
      setAvailabilityCheckBlocked(false);
      setModificationFee(null);
      setWizardState({
        step: "schedule",
        canGoNext: false,
        canGoBack: false,
        canSubmit: false,
      });
    }
  }, [open, booking]);

  useEffect(() => {
    if (!open || !booking?.id || !availabilityVerified) {
      setModificationFee(null);
      return;
    }
    let cancelled = false;
    setFeeLoading(true);
    void BookingService.getModificationFee(booking.id)
      .then((quote) => {
        if (!cancelled) {
          setModificationFee({
            booking_base: quote.booking_base,
            platform_fee: quote.platform_fee,
            gst: quote.gst,
            taxes_and_fees: quote.taxes_and_fees,
            total_amount: quote.total_amount,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setModificationFee(null);
      })
      .finally(() => {
        if (!cancelled) setFeeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, booking?.id, availabilityVerified]);

  useEffect(() => {
    if (!open || customerId == null) return;
    let cancelled = false;
    setWalletLoading(true);
    void fetchCustomerWallet(customerId)
      .then((wallet) => {
        if (!cancelled) {
          const balance = Math.max(0, Number(wallet.balance ?? 0));
          setWalletBalance(balance);
          setUseWalletBalance(balance > 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWalletBalance(0);
          setUseWalletBalance(false);
        }
      })
      .finally(() => {
        if (!cancelled) setWalletLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, customerId]);

  const handleWizardContinue = () => {
    scheduleRef.current?.goNext();
  };

  const handleWizardBack = () => {
    scheduleRef.current?.goBack();
  };

  if (!open || !booking) return null;

  const modificationDisabled = isModificationDisabled(booking);
  const statusMessage = getModificationStatusMessage(booking);
  const timeUntilBooking = getTimeUntilBooking(booking);
  const lastModificationDetails = getLastModificationDetails(booking);
  const times = parseTimeSlot(booking);

  const bookingCoords =
    booking.latitude != null &&
    booking.longitude != null &&
    Number.isFinite(Number(booking.latitude)) &&
    Number.isFinite(Number(booking.longitude))
      ? { lat: Number(booking.latitude), lng: Number(booking.longitude) }
      : null;

  const canModifyType =
    booking.bookingType === "MONTHLY" || booking.bookingType === "SHORT_TERM";

  const bookingTypeLabel = booking.bookingType.replace(/_/g, " ");
  const currentScheduleLabel = `${(resolveBookingStart(booking) || dayjs()).format("MMM D, YYYY")}${
    booking.endDate && booking.bookingType === "SHORT_TERM"
      ? ` – ${dayjs(booking.endDate).format("MMM D, YYYY")}`
      : ""
  } · ${booking.timeSlot}`;

  const modificationWalletSplit =
    modificationFee != null
      ? computeCheckoutWithWallet(
          {
            base_amount: modificationFee.booking_base,
            platform_fee: modificationFee.platform_fee,
            gst: modificationFee.gst,
            taxes_and_fees: modificationFee.taxes_and_fees,
            total_amount: modificationFee.total_amount,
          },
          walletBalance,
          useWalletBalance
        )
      : { wallet_applied: 0, razorpay_amount: 0, remaining_wallet: walletBalance };

  const modificationPayable =
    modificationFee != null ? modificationWalletSplit.razorpay_amount : 0;

  return (
    <>
      <MaidStyledDialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        scroll="body"
        aria-labelledby="modify-booking-title"
        slotProps={bookingDialogSlotProps}
        disableEnforceFocus
      >
        <MaidStyledContent>
          <MaidRoot>
            <MaidHeader>
              <MaidCloseBtn aria-label="close" onClick={onClose} size="small">
                <CloseIcon fontSize="small" sx={{ color: "#fff" }} />
              </MaidCloseBtn>
              <MaidHeaderTitle id="modify-booking-title">Modify Booking</MaidHeaderTitle>
              <MaidHeaderSub>
                {bookingTypeLabel} · Booking #{booking.id} · {timeUntilBooking}
              </MaidHeaderSub>
            </MaidHeader>

            <MaidScroll>
              <MaidCard>
                <MaidCardTitle>Current schedule</MaidCardTitle>
                <MaidCardSub>{booking.service_type}</MaidCardSub>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.8125rem",
                    color: "#334155",
                  }}
                >
                  <CalendarClock size={16} style={{ color: "#0b5bd3", flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{currentScheduleLabel}</span>
                </div>
                {(booking.modifications?.length ?? 0) > 0 ? (
                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: "0.75rem",
                      lineHeight: 1.45,
                      color: "#b45309",
                    }}
                  >
                    {lastModificationDetails}
                  </p>
                ) : null}
              </MaidCard>

              {error ? (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {error}
                </div>
              ) : null}
              {modificationDisabled ? (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #fde68a",
                    background: "#fffbeb",
                    fontSize: "0.75rem",
                    color: "#b45309",
                    textAlign: "center",
                  }}
                >
                  {statusMessage}
                </div>
              ) : null}

              {!modificationDisabled && canModifyType ? (
                <MaidCard>
                  <ModifyBookingScheduleSection
                    ref={scheduleRef}
                    bookingType={booking.bookingType}
                    serviceType={booking.service_type}
                    engagementId={booking.id}
                    providerId={booking.serviceProviderId}
                    customerId={customerId}
                    bookingCoords={bookingCoords}
                    initialStartDate={booking.startDate}
                    initialEndDate={booking.endDate}
                    initialStartTime={times.start}
                    initialEndTime={times.end}
                    onAvailabilityVerifiedChange={handleAvailabilityVerifiedChange}
                    onScheduleChange={handleScheduleChange}
                    onWizardStateChange={setWizardState}
                    availabilityVerified={availabilityVerified}
                    isCheckingAvailability={isCheckingAvailability}
                  />
                </MaidCard>
              ) : !canModifyType ? (
                <MaidCard>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
                    Only monthly and short-term bookings can be rescheduled here.
                  </p>
                </MaidCard>
              ) : null}

              {!modificationDisabled &&
              canModifyType &&
              wizardState.step === "review" &&
              availabilityVerified &&
              feeLoading ? (
                <MaidCard>
                  <MaidPriceHero>
                    <MaidPriceBlock>
                      <MaidPriceLabel>
                        <MaidQuotePulse />
                        Loading modification charge…
                      </MaidPriceLabel>
                    </MaidPriceBlock>
                  </MaidPriceHero>
                </MaidCard>
              ) : null}
              {!modificationDisabled &&
              canModifyType &&
              wizardState.step === "review" &&
              availabilityVerified &&
              modificationFee ? (
                <MaidCard>
                  <MaidPriceHero>
                    <MaidPriceBlock>
                      <MaidPriceLabel>Modification charge</MaidPriceLabel>
                      <MaidReviewTotal $loading={false}>
                        {formatInr(modificationFee.total_amount)}
                      </MaidReviewTotal>
                    </MaidPriceBlock>
                    <MaidPriceMeta>
                      6% platform fee on booking cost ({formatInr(modificationFee.booking_base)})
                    </MaidPriceMeta>
                  </MaidPriceHero>
                  <Box
                    sx={{
                      mt: 1.25,
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.25 }}>
                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>Platform fee (6%)</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                        {formatInr(modificationFee.platform_fee)}
                      </Typography>
                    </Box>
                  </Box>
                  {walletBalance > 0 ? (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid #dbeafe",
                        bgcolor: "#f8fbff",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={useWalletBalance}
                            onChange={(e) => setUseWalletBalance(e.target.checked)}
                            disabled={walletLoading || isLoading}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                              {t("useWalletBalance")}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              {t("walletBalanceAvailable", {
                                amount: formatInr(walletBalance),
                              })}
                            </Typography>
                          </Box>
                        }
                      />
                      {useWalletBalance && modificationWalletSplit.wallet_applied > 0 ? (
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5, color: "#0369a1" }}
                        >
                          {modificationWalletSplit.razorpay_amount <= 0
                            ? t("walletCoversFullAmount")
                            : `${t("walletAppliedLabel")}: ${formatInr(modificationWalletSplit.wallet_applied)} · ${t("payViaRazorpay")}: ${formatInr(modificationWalletSplit.razorpay_amount)}`}
                        </Typography>
                      ) : null}
                    </Box>
                  ) : null}
                </MaidCard>
              ) : null}
            </MaidScroll>

            {!modificationDisabled && canModifyType ? (
              <MaidFooter>
                {wizardState.step === "review" ? (
                  <>
                    {availabilityVerified && modificationFee ? (
                      <MaidFooterTop>
                        <div>
                          <MaidFooterMuted>
                            {modificationWalletSplit.wallet_applied > 0
                              ? modificationPayable <= 0
                                ? t("walletAppliedLabel")
                                : t("payViaRazorpay")
                              : "Amount payable"}
                          </MaidFooterMuted>
                          <MaidFooterPrice>
                            {feeLoading ? "…" : formatInr(modificationPayable)}
                          </MaidFooterPrice>
                        </div>
                      </MaidFooterTop>
                    ) : null}
                    <MaidFooterActions style={{ marginBottom: 8 }}>
                      <MaidBtnGhost
                        type="button"
                        onClick={onClose}
                        disabled={isLoading || isCheckingAvailability}
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </MaidBtnGhost>
                      <MaidBtnGhost
                        type="button"
                        onClick={handleWizardBack}
                        disabled={isLoading || isCheckingAvailability}
                        style={{ flex: 1 }}
                      >
                        Back
                      </MaidBtnGhost>
                    </MaidFooterActions>
                    {availabilityVerified ? (
                      <MaidBtnPrimary
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={
                          isLoading ||
                          isCheckingAvailability ||
                          !wizardState.canSubmit ||
                          feeLoading ||
                          !modificationFee
                        }
                        style={{ width: "100%" }}
                      >
                        {isLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : modificationPayable > 0 ? (
                          `Pay ${formatInr(modificationPayable)} & update`
                        ) : (
                          "Update schedule"
                        )}
                      </MaidBtnPrimary>
                    ) : (
                      <MaidBtnPrimary
                        type="button"
                        onClick={() => void handleCheckAvailability()}
                        disabled={
                          isLoading ||
                          isCheckingAvailability ||
                          !wizardState.canSubmit ||
                          availabilityCheckBlocked
                        }
                        title={
                          availabilityCheckBlocked
                            ? "Adjust your dates or time, then check availability again"
                            : undefined
                        }
                        style={{ width: "100%" }}
                      >
                        {isCheckingAvailability ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Check provider availability"
                        )}
                      </MaidBtnPrimary>
                    )}
                  </>
                ) : (
                  <MaidFooterActions>
                    <MaidBtnGhost type="button" onClick={onClose} disabled={isLoading}>
                      Cancel
                    </MaidBtnGhost>
                    <MaidBtnPrimary
                      type="button"
                      onClick={handleWizardContinue}
                      disabled={isLoading || !wizardState.canGoNext}
                    >
                      Continue
                    </MaidBtnPrimary>
                  </MaidFooterActions>
                )}
              </MaidFooter>
            ) : null}
          </MaidRoot>
        </MaidStyledContent>
      </MaidStyledDialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={
          snackbarSeverity === "error"
            ? 9000
            : snackbarMessage.includes("provider is available")
              ? 5000
              : 4000
        }
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: { xs: 7, sm: 8 } }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            maxWidth: { xs: "min(100vw - 24px, 520px)", sm: 520 },
            "& .MuiAlert-message": { lineHeight: 1.5 },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModifyBookingDialog;
