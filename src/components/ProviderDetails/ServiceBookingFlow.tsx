/* eslint-disable */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BOOKINGS } from "../../Constants/pagesConstants";
import { Tooltip, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { EnhancedProviderDetails } from "../../types/ProviderDetailsType";
import { removeFromCart, selectCartItems } from "../../features/addToCart/addToSlice";
import { isMaidCartItem, isMealCartItem } from "../../types/cartSlice";
import {
  MaidRoot,
  MaidHeader,
  MaidHeaderTitle,
  MaidHeaderSub,
  MaidCloseBtn,
  MaidScroll,
  MaidCard,
  MaidMetricRow,
  MaidMetricLabel,
  MaidMetricValue,
  MaidPriceBlock,
  MaidPriceHero,
  MaidPriceLabel,
  MaidPriceMeta,
  MaidQuotePulse,
  MaidReviewTotal,
  MaidFooter,
  MaidFooterTop,
  MaidFooterMuted,
  MaidFooterPrice,
  MaidFooterActions,
  MaidBtnGhost,
  MaidBtnPrimary,
} from "./MaidServiceDialog.styles";
import { useAuth0 } from "@auth0/auth0-react";
import { BookingPayload, BookingService, resolveServiceProviderIdForPayload } from "src/services/bookingService";
import BookingSuccessDialog from "../Common/SuccessDialog/BookingSuccessDialog";
import { useLanguage } from "src/context/LanguageContext";
import { useAppUser } from "src/context/AppUserContext";
import Auth0SignInDialog from "../Auth/Auth0SignInDialog";
import { openAuth0PopupWindow } from "src/utils/openAuth0PopupWindow";
import {
  getBookingTypeFromPreference,
  formatInr,
  formatDateOnly,
} from "src/utils/maidPricingUtils";
import MaidBookingDetailsSection from "./MaidBookingDetailsSection";
import {
  SERVICE_BOOKING_CONFIG,
  computeDurationHours,
  loadServiceQuote,
  type ServiceBookingKind,
} from "./serviceBookingConfig";
import { buildQuoteBreakdown, type QuoteBreakdownRow } from "src/utils/quoteBreakdown";
import {
  appendPaymentFeeRows,
  computePaymentTotals,
} from "src/utils/paymentTotals";
import PriceBreakdown from "./PriceBreakdown";
import type { PricingQuoteResponse } from "src/services/pricingService";

const ACCENT_BTN = "#0b5bd3";

export interface ServiceBookingFlowProps {
  serviceKind: ServiceBookingKind;
  active: boolean;
  presentation: "dialog" | "page";
  onClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
  /** Lets parent booking modal stay open while success UI is shown. */
  onSuccessDialogChange?: (open: boolean) => void;
}

const ServiceBookingFlow: React.FC<ServiceBookingFlowProps> = ({
  serviceKind,
  active,
  presentation,
  onClose,
  providerDetails,
  sendDataToParent,
  onSuccessDialogChange,
}) => {
  const cfg = SERVICE_BOOKING_CONFIG[serviceKind];
  const isPage = presentation === "page";
  const { t } = useLanguage();
  const dispatch = useDispatch();

  const allCartItems = useSelector(selectCartItems);
  const legacyCartItems = allCartItems.filter(
    serviceKind === "maid" ? isMaidCartItem : isMealCartItem
  );

  const [loading, setLoading] = useState(false);
  const [auth0SignInOpen, setAuth0SignInOpen] = useState(false);
  const auth0PopupRef = useRef<Window | null>(null);
  const [quotePreview, setQuotePreview] = useState<{
    total: number;
    loading: boolean;
    error?: string;
    breakdown: QuoteBreakdownRow[];
    quote?: PricingQuoteResponse["quote"];
  }>({
    total: 0,
    loading: false,
    breakdown: [],
  });

  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const providerFullName =
    `${providerDetails?.firstName || ""} ${providerDetails?.lastName || ""}`.trim();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingSuccessDetails, setBookingSuccessDetails] = useState<any>(null);

  useEffect(() => {
    onSuccessDialogChange?.(successDialogOpen);
  }, [successDialogOpen, onSuccessDialogChange]);

  const { appUser } = useAppUser();
  const { isAuthenticated, loginWithPopup } = useAuth0();

  const bookingTypeCode = getBookingTypeFromPreference(
    bookingType?.bookingPreference ?? "Date"
  );
  const providerId =
    resolveServiceProviderIdForPayload(providerDetails) ??
    resolveServiceProviderIdForPayload({
      serviceProviderId:
        bookingType?.serviceproviderId ?? bookingType?.serviceProviderId,
      serviceproviderid: bookingType?.serviceproviderId,
    });
  const serviceTotal = quotePreview.total || 0;
  const paymentTotals = useMemo(
    () => computePaymentTotals(serviceTotal),
    [serviceTotal]
  );
  const payableTotal = paymentTotals.total_amount || 0;
  const displayBreakdown = useMemo(
    () => appendPaymentFeeRows(quotePreview.breakdown, serviceTotal),
    [quotePreview.breakdown, serviceTotal]
  );
  const priceReady =
    !quotePreview.loading && payableTotal > 0 && !quotePreview.error;
  /** On-demand bookings can checkout without a provider (backend: UNASSIGNED). */
  const providerRequired = bookingTypeCode !== "ON_DEMAND";
  const canCheckout = priceReady && (!providerRequired || providerId != null);
  const checkoutBlockReason =
    providerRequired && !providerId
      ? providerDetails
        ? "Select a provider to continue"
        : "Choose a provider from the list, then tap Book now"
      : quotePreview.loading
        ? "Calculating price…"
        : quotePreview.error
          ? quotePreview.error
          : payableTotal <= 0
            ? "Pick a valid date and time to see price"
            : !providerId && bookingTypeCode === "ON_DEMAND"
              ? "Pay now to confirm — provider matching after payment"
              : undefined;
  const flowTitleId = `${serviceKind}-flow-title`;

  useEffect(() => {
    if (!active) {
      setLoading(false);
      setAuth0SignInOpen(false);
      if (auth0PopupRef.current && !auth0PopupRef.current.closed) {
        try {
          auth0PopupRef.current.close();
        } catch {
          /* ignore */
        }
      }
      auth0PopupRef.current = null;
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    legacyCartItems.forEach((item) => {
      dispatch(removeFromCart({ id: item.id, type: cfg.cartType }));
    });
  }, [active, legacyCartItems, dispatch, cfg.cartType]);

  useEffect(() => {
    if (!active) return;
    const customerId = appUser?.customerid;
    const start_date =
      formatDateOnly(String(bookingType?.startDate ?? "")) ||
      new Date().toISOString().split("T")[0];
    const end_date = formatDateOnly(String(bookingType?.endDate ?? "")) || start_date;
    const durationHours = computeDurationHours(
      bookingTypeCode,
      String(bookingType?.startTime ?? ""),
      String(bookingType?.endTime ?? ""),
      start_date,
      end_date,
      String(bookingType?.timeRange ?? "")
    );

    setQuotePreview((p) => ({ ...p, loading: true, error: undefined, breakdown: [] }));
    let cancelled = false;

    loadServiceQuote(serviceKind, {
      bookingType: bookingTypeCode,
      customerId,
      startDate: start_date,
      endDate: end_date,
      durationHours,
      hoursPerDay:
        (bookingTypeCode === "SHORT_TERM" || bookingTypeCode === "MONTHLY") &&
        durationHours != null
          ? durationHours
          : undefined,
      ratePreference: "mid",
    })
      .then((res) => {
        if (!cancelled) {
          const total = Number(res.total) || 0;
          setQuotePreview({
            total,
            loading: false,
            error: total > 0 ? undefined : res.quoteError,
            quote: res.quote,
            breakdown: buildQuoteBreakdown(res.quote, total),
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const ax = err as { response?: { data?: { error?: string } }; message?: string };
          setQuotePreview({
            total: 0,
            loading: false,
            error: ax.response?.data?.error || ax.message || "Could not load price",
            breakdown: [],
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setQuotePreview((p) => (p.loading ? { ...p, loading: false } : p));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    active,
    serviceKind,
    bookingTypeCode,
    bookingType?.startDate,
    bookingType?.endDate,
    bookingType?.startTime,
    bookingType?.endTime,
    bookingType?.timeRange,
    bookingType?.bookingPreference,
    appUser?.customerid,
  ]);

  const handleLoginToContinue = () => {
    const popup = openAuth0PopupWindow();
    if (!popup) {
      setSnackbarMessage(t("auth0SignInNote"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    auth0PopupRef.current = popup;
    setAuth0SignInOpen(true);
    void loginWithPopup({ authorizationParams: { prompt: "login" } }, { popup })
      .then(() => {
        setAuth0SignInOpen(false);
        auth0PopupRef.current = null;
      })
      .catch(() => {
        setAuth0SignInOpen(false);
        try {
          auth0PopupRef.current?.close();
        } catch {
          /* ignore */
        }
        auth0PopupRef.current = null;
      });
  };

  const handleAuth0DialogClose = () => {
    try {
      auth0PopupRef.current?.close();
    } catch {
      /* ignore */
    }
    auth0PopupRef.current = null;
    setAuth0SignInOpen(false);
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    onClose();
  };

  const handleNavigateToBookings = () => {
    setSuccessDialogOpen(false);
    onClose();
    sendDataToParent?.(BOOKINGS);
  };

  const handleCheckout = async () => {
    if (!canCheckout) {
      setSnackbarMessage("Price is not available for this booking. Try another date or time.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);

      const customerId = appUser?.customerid;
      if (!customerId) {
        setSnackbarMessage("User information not found. Please login again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const booking_type = getBookingTypeFromPreference(
        bookingType?.bookingPreference ?? "Date"
      );
      const spId = providerId;
      if (booking_type !== "ON_DEMAND" && !spId) {
        setSnackbarMessage("Missing provider. Please pick a provider again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const start_date =
        formatDateOnly(String(bookingType?.startDate ?? "")) ||
        new Date().toISOString().split("T")[0];
      const end_date = formatDateOnly(String(bookingType?.endDate ?? "")) || start_date;
      const durationHours = computeDurationHours(
        booking_type,
        String(bookingType?.startTime ?? ""),
        String(bookingType?.endTime ?? ""),
        start_date,
        end_date,
        String(bookingType?.timeRange ?? "")
      );

      const quoteRes = await loadServiceQuote(serviceKind, {
        bookingType: booking_type,
        customerId,
        startDate: start_date,
        endDate: end_date || start_date,
        durationHours,
        hoursPerDay:
          (booking_type === "SHORT_TERM" || booking_type === "MONTHLY") &&
          durationHours != null
            ? durationHours
            : undefined,
        ratePreference: "mid",
      });

      const checkoutTotal = quoteRes.total ?? 0;
      if (checkoutTotal <= 0) {
        setSnackbarMessage("Price is not available for this booking.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      const payload: BookingPayload = {
        customerid: customerId,
        serviceproviderid: spId ?? null,
        start_date,
        end_date,
        start_time: bookingType?.startTime || "",
        responsibilities: { tasks: [], add_ons: [] },
        booking_type,
        taskStatus: "NOT_STARTED",
        service_type: cfg.serviceType,
        base_amount: checkoutTotal,
        addon_total: 0,
        use_pricing_engine: true,
        pricing_snapshot: quoteRes.quote,
        payment_mode: "razorpay",
        end_time: bookingType?.endTime || "",
      };
      const result = await BookingService.bookAndPay(payload);

      setBookingSuccessDetails({
        providerName: providerFullName,
        serviceType: t(cfg.successServiceKey),
        totalAmount: computePaymentTotals(checkoutTotal).total_amount,
        bookingDate: bookingType?.startDate || new Date().toISOString().split("T")[0],
        persons: 1,
        message:
          result?.verifyResult?.message ||
          "Your booking is confirmed. Payment was successful.",
      });

      setSuccessDialogOpen(true);
    } catch (error: any) {
      let backendMessage = "Failed to initiate payment";
      if (error?.response?.data) {
        if (typeof error.response.data === "string") backendMessage = error.response.data;
        else if (error.response.data.error) backendMessage = error.response.data.error;
        else if (error.response.data.message) backendMessage = error.response.data.message;
      } else if (error.message) {
        backendMessage = error.message;
      }
      setSnackbarMessage(backendMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!active && presentation === "dialog" && !successDialogOpen) return null;

  if (successDialogOpen && presentation === "dialog" && !active) {
    return (
      <BookingSuccessDialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        bookingDetails={bookingSuccessDetails}
        message={bookingSuccessDetails?.message}
        onNavigateToBookings={handleNavigateToBookings}
      />
    );
  }

  return (
    <>
      <MaidRoot $page={isPage} style={successDialogOpen ? { visibility: "hidden" as const } : undefined}>
        <MaidHeader style={{ background: cfg.headerGradient }}>
          {isPage ? (
            <MaidCloseBtn
              aria-label="back"
              onClick={() => {
                setLoading(false);
                onClose();
              }}
              size="small"
              sx={{ left: 8, right: "auto" }}
            >
              <ArrowBackIcon fontSize="small" sx={{ color: "#fff" }} />
            </MaidCloseBtn>
          ) : (
            <MaidCloseBtn
              aria-label="close"
              onClick={() => {
                setLoading(false);
                onClose();
              }}
              size="small"
            >
              <CloseIcon fontSize="small" sx={{ color: "#fff" }} />
            </MaidCloseBtn>
          )}
          <MaidHeaderTitle id={flowTitleId}>{t(cfg.titleKey)}</MaidHeaderTitle>
          <MaidHeaderSub>
            {providerFullName || (isPage ? "Choose a provider from the list" : "")}
          </MaidHeaderSub>
        </MaidHeader>

        <MaidScroll>
          <MaidCard>
            <MaidBookingDetailsSection active={active} />
          </MaidCard>

          <MaidCard>
            <MaidPriceHero>
              <MaidPriceBlock>
                <MaidPriceLabel>
                  {quotePreview.loading ? (
                    <>
                      <MaidQuotePulse />
                      Updating price…
                    </>
                  ) : (
                    "Amount payable"
                  )}
                </MaidPriceLabel>
                <MaidReviewTotal $loading={quotePreview.loading}>
                  {formatInr(payableTotal)}
                </MaidReviewTotal>
              </MaidPriceBlock>
              <MaidPriceMeta>
                {checkoutBlockReason ?? cfg.priceMetaReady}
              </MaidPriceMeta>
            </MaidPriceHero>
            <PriceBreakdown
              rows={displayBreakdown}
              loading={quotePreview.loading}
              paymentTotals={paymentTotals}
            />
          </MaidCard>
        </MaidScroll>

        <MaidFooter>
          <MaidFooterTop>
            <div>
              <MaidFooterMuted>Amount payable</MaidFooterMuted>
              <MaidFooterPrice>
                {quotePreview.loading ? "…" : formatInr(payableTotal)}
              </MaidFooterPrice>
            </div>
          </MaidFooterTop>
          <MaidFooterActions>
            <MaidBtnGhost type="button" onClick={() => onClose()}>
              {isPage ? "Back" : t("close") || "Close"}
            </MaidBtnGhost>
            {!isAuthenticated ? (
              <>
                <Tooltip title={t("youNeedToLogin")}>
                  <IconButton size="small" sx={{ color: ACCENT_BTN }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <MaidBtnPrimary type="button" onClick={handleLoginToContinue}>
                  {t("loginToContinue")}
                </MaidBtnPrimary>
              </>
            ) : (
              <MaidBtnPrimary
                type="button"
                disabled={!canCheckout || loading}
                title={checkoutBlockReason}
                onClick={() => void handleCheckout()}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  t("checkout") || "Pay now"
                )}
              </MaidBtnPrimary>
            )}
          </MaidFooterActions>
        </MaidFooter>
      </MaidRoot>

      <Auth0SignInDialog open={auth0SignInOpen} onClose={handleAuth0DialogClose} />

      <BookingSuccessDialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        bookingDetails={bookingSuccessDetails}
        message={bookingSuccessDetails?.message}
        onNavigateToBookings={handleNavigateToBookings}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ServiceBookingFlow;
