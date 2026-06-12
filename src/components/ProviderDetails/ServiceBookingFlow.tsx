/* eslint-disable */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BOOKINGS } from "../../Constants/pagesConstants";
import { Tooltip, Snackbar, Alert, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, CircularProgress, Checkbox, FormControlLabel } from "@mui/material";
import { Button, dialogActionsClassName } from "../Button/button";
import { IconButton } from "../Button/icon-button";
import { Info } from "lucide-react";
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
import { isCustomerCheckoutReady } from "src/utils/authSession";
import {
  getBookingTypeFromPreference,
  formatInr,
  formatDateOnly,
} from "src/utils/maidPricingUtils";
import MaidBookingDetailsSection from "./MaidBookingDetailsSection";
import type { MaidBookingDetailsSectionHandle } from "./MaidBookingDetailsSection";
import {
  SERVICE_BOOKING_CONFIG,
  computeDurationHours,
  isBookingScheduleComplete,
  loadServiceQuote,
  type ServiceBookingKind,
} from "./serviceBookingConfig";
import { buildQuoteBreakdown, type QuoteBreakdownRow } from "src/utils/quoteBreakdown";
import {
  appendPaymentFeeRows,
  computeCheckoutWithWallet,
  computePaymentTotals,
} from "src/utils/paymentTotals";
import { fetchCustomerWallet } from "src/services/walletService";
import PriceBreakdown from "./PriceBreakdown";
import type { PricingQuoteResponse } from "src/services/pricingService";
import axios from "axios";
import { urls } from "src/config/urls";
import dayjs from "dayjs";
import BookingLocationSection from "./BookingLocationSection";
import {
  hasValidBookingLocation,
  resolveLocationCoords,
} from "src/utils/bookingLocation";
import {
  checkOnDemandProviderAvailability,
  ON_DEMAND_NO_PROVIDERS_MESSAGE,
} from "src/services/onDemandAvailability";
import { useBookingScheduleFlow } from "src/hooks/useBookingScheduleFlow";

const COUPON_FEEDBACK_MS = 2000;
const AVAILABILITY_ERROR_SNACKBAR_MS = 9000;
const todayYmd = () => dayjs().format("YYYY-MM-DD");

type CouponOption = {
  code: string;
  serviceType: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minimumOrderValue?: number | null;
};

function couponMeetsMinOrder(coupon: CouponOption, orderTotal: number): boolean {
  const min = coupon.minimumOrderValue;
  if (min == null || min <= 0) return true;
  return orderTotal >= min;
}

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
  const schedulePendingCommit = useSelector(
    (state: { bookingType?: { scheduleDirty?: boolean } }) =>
      Boolean(state.bookingType?.scheduleDirty)
  );
  const scheduleIncomplete = useSelector(
    (state: { bookingType?: { scheduleIncomplete?: boolean } }) =>
      Boolean(state.bookingType?.scheduleIncomplete)
  );
  const scheduleDraft = useSelector(
    (state: { bookingType?: { scheduleDraft?: Record<string, unknown> | null } }) =>
      state.bookingType?.scheduleDraft ?? null
  );
  const effectiveBookingType = useMemo(() => {
    if (!schedulePendingCommit || !scheduleDraft) return bookingType;
    return { ...(bookingType ?? {}), ...scheduleDraft };
  }, [bookingType, scheduleDraft, schedulePendingCommit]);
  const geoLocation = useSelector((state: any) => state?.geoLocation?.value);
  const bookingLocationReady = hasValidBookingLocation(geoLocation);
  const bookingCoords = resolveLocationCoords(geoLocation);
  const [onDemandAvailability, setOnDemandAvailability] = useState<{
    loading: boolean;
    available: boolean;
    message?: string;
  }>({ loading: false, available: true });
  const providerFullName =
    `${providerDetails?.firstName || ""} ${providerDetails?.lastName || ""}`.trim();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingSuccessDetails, setBookingSuccessDetails] = useState<any>(null);
  const [availableCoupons, setAvailableCoupons] = useState<CouponOption[]>([]);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponInfo, setCouponInfo] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const lastPayableTotalRef = useRef<number>(0);
  const couponSnackbarKeyRef = useRef<string | null>(null);
  const scheduleActionsRef = useRef<MaidBookingDetailsSectionHandle | null>(null);
  const providerAvailabilityLoadingRef = useRef(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityCheckBlocked, setAvailabilityCheckBlocked] = useState(false);
  const [availabilityCheckBlockedMessage, setAvailabilityCheckBlockedMessage] =
    useState<string | undefined>();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  useEffect(() => {
    onSuccessDialogChange?.(successDialogOpen);
  }, [successDialogOpen, onSuccessDialogChange]);

  const { appUser } = useAppUser();
  const {
    isAuthenticated: auth0IsAuthenticated,
    loginWithPopup,
    loginWithRedirect,
  } = useAuth0();

  const isCheckoutAuthenticated = useMemo(
    () => isCustomerCheckoutReady(appUser, auth0IsAuthenticated),
    [appUser, auth0IsAuthenticated]
  );

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
  const {
    scheduleReady,
    selectedProviderAvailability,
    selectedProviderReady,
  } = useBookingScheduleFlow({
    active,
    providerId,
    role: cfg.serviceType,
    latitude: bookingCoords?.lat ?? null,
    longitude: bookingCoords?.lng ?? null,
    customerId: appUser?.customerid,
  });
  const serviceTotal = quotePreview.total || 0;
  const paymentTotals = useMemo(
    () => computePaymentTotals(serviceTotal),
    [serviceTotal]
  );
  const payableTotal = paymentTotals.total_amount || 0;
  const walletSplit = useMemo(
    () =>
      computeCheckoutWithWallet(
        paymentTotals,
        walletBalance,
        useWalletBalance && walletBalance > 0
      ),
    [paymentTotals, walletBalance, useWalletBalance]
  );
  const payableViaGateway = walletSplit.razorpay_amount;
  useEffect(() => {
    lastPayableTotalRef.current = payableViaGateway;
  }, [payableViaGateway]);

  useEffect(() => {
    if (!active || !isCheckoutAuthenticated || !appUser?.customerid) {
      setWalletBalance(0);
      setUseWalletBalance(false);
      return;
    }

    let cancelled = false;
    setWalletLoading(true);
    void fetchCustomerWallet(appUser.customerid)
      .then((wallet) => {
        if (cancelled) return;
        const balance = Math.max(0, Number(wallet.balance ?? 0));
        setWalletBalance(balance);
        setUseWalletBalance(balance > 0);
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
  }, [active, appUser?.customerid, isCheckoutAuthenticated]);
  const displayBreakdown = useMemo(
    () => appendPaymentFeeRows(quotePreview.breakdown, serviceTotal),
    [quotePreview.breakdown, serviceTotal]
  );
  const priceReady =
    scheduleReady &&
    !quotePreview.loading &&
    payableTotal > 0 &&
    !quotePreview.error;
  /** On-demand bookings can checkout without a provider (backend: UNASSIGNED). */
  const providerRequired = bookingTypeCode !== "ON_DEMAND";
  const onDemandProviderReady =
    bookingTypeCode !== "ON_DEMAND" ||
    (onDemandAvailability.available && !onDemandAvailability.loading);
  const canCheckout =
    scheduleReady &&
    !schedulePendingCommit &&
    !scheduleIncomplete &&
    priceReady &&
    bookingLocationReady &&
    onDemandProviderReady &&
    selectedProviderReady &&
    (!providerRequired || providerId != null);
  const normalizedCouponInput = couponInput.trim().toUpperCase();
  const couponCountLabel = availableCoupons.length;
  const estimateCouponSavings = React.useCallback(
    (coupon: CouponOption) => {
      if (serviceTotal <= 0) return 0;
      if (coupon.discountType === "PERCENTAGE") {
        return (serviceTotal * coupon.discountValue) / 100;
      }
      return coupon.discountValue;
    },
    [serviceTotal]
  );
  const eligibleCoupons = useMemo(
    () =>
      availableCoupons
        .filter((c) => couponMeetsMinOrder(c, serviceTotal))
        .sort((a, b) => estimateCouponSavings(b) - estimateCouponSavings(a)),
    [availableCoupons, serviceTotal, estimateCouponSavings]
  );
  const ineligibleCoupons = useMemo(
    () =>
      availableCoupons.filter(
        (c) =>
          c.minimumOrderValue != null &&
          c.minimumOrderValue > 0 &&
          serviceTotal < Number(c.minimumOrderValue)
      ),
    [availableCoupons, serviceTotal]
  );
  const bestCoupon = eligibleCoupons[0] || null;
  const bestCouponSavings = bestCoupon ? estimateCouponSavings(bestCoupon) : 0;
  const secondaryEligibleCoupons = useMemo(
    () =>
      bestCoupon
        ? eligibleCoupons.filter((c) => c.code !== bestCoupon.code)
        : eligibleCoupons,
    [eligibleCoupons, bestCoupon]
  );
  const checkoutBlockReason =
    !scheduleReady || scheduleIncomplete
      ? bookingTypeCode === "SHORT_TERM"
        ? "Select your date range and daily start time"
        : "Select a time for your chosen date"
      : providerRequired && !providerId
        ? providerDetails
          ? "Select a provider to continue"
          : "Choose a provider from the list, then tap Book now"
        : quotePreview.loading
          ? "Calculating price…"
          : quotePreview.error
            ? quotePreview.error
            : payableTotal <= 0
              ? "Pick a valid date and time to see price"
              : !bookingLocationReady
                ? "Select a service address before checkout"
                : bookingTypeCode === "ON_DEMAND" && !bookingCoords
                  ? "Select a map location so we can check provider availability"
                  : onDemandAvailability.loading
                    ? "Checking provider availability in your area…"
                    : bookingTypeCode === "ON_DEMAND" && !onDemandAvailability.available
                      ? onDemandAvailability.message || ON_DEMAND_NO_PROVIDERS_MESSAGE
                      : providerRequired &&
                          providerId &&
                          bookingTypeCode !== "ON_DEMAND" &&
                          selectedProviderAvailability.loading
                        ? "Checking if your provider is available for this schedule…"
                        : providerRequired &&
                            providerId &&
                            bookingTypeCode !== "ON_DEMAND" &&
                            !selectedProviderAvailability.available
                          ? selectedProviderAvailability.message
                          : !providerId && bookingTypeCode === "ON_DEMAND"
                            ? "Pay now to confirm — provider matching after payment"
                            : undefined;
  const flowTitleId = `${serviceKind}-flow-title`;

  const showAvailabilityErrorSnackbar = useCallback((message?: string) => {
    const text = String(message || "").trim();
    if (!text) return;
    setSnackbarMessage(text);
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }, []);

  const handleAvailabilityCheckBlockedChange = useCallback(
    (blocked: boolean, message?: string) => {
      setAvailabilityCheckBlocked(blocked);
      setAvailabilityCheckBlockedMessage(message);
      if (blocked) {
        showAvailabilityErrorSnackbar(message);
      }
    },
    [showAvailabilityErrorSnackbar]
  );

  const needsScheduleAvailabilityCheck =
    schedulePendingCommit || scheduleIncomplete;

  useEffect(() => {
    if (
      !active ||
      !providerRequired ||
      !providerId ||
      bookingTypeCode === "ON_DEMAND" ||
      !scheduleReady ||
      !bookingCoords ||
      needsScheduleAvailabilityCheck
    ) {
      providerAvailabilityLoadingRef.current = selectedProviderAvailability.loading;
      return;
    }

    const wasLoading = providerAvailabilityLoadingRef.current;
    const isLoading = selectedProviderAvailability.loading;
    providerAvailabilityLoadingRef.current = isLoading;

    if (
      wasLoading &&
      !isLoading &&
      !selectedProviderAvailability.available &&
      selectedProviderAvailability.message
    ) {
      showAvailabilityErrorSnackbar(selectedProviderAvailability.message);
    }
  }, [
    active,
    bookingCoords,
    bookingTypeCode,
    needsScheduleAvailabilityCheck,
    providerId,
    providerRequired,
    scheduleReady,
    selectedProviderAvailability.available,
    selectedProviderAvailability.loading,
    selectedProviderAvailability.message,
    showAvailabilityErrorSnackbar,
  ]);

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
    if (!customerId) {
      setAvailableCoupons([]);
      return;
    }
    let cancelled = false;
    setCouponLoading(true);
    axios
      .get(`${urls.coupons}/api/coupons/customer/${customerId}`, {
        params: { serviceType: cfg.serviceType },
      })
      .then(({ data }) => {
        if (cancelled) return;
        const source = Array.isArray(data?.coupons)
          ? data.coupons
          : Array.isArray(data?.data?.coupons)
            ? data.data.coupons
            : [];
        type CouponApi = {
          coupon_code?: string;
          service_type?: string;
          discount_type?: string;
          discount_value?: number | string;
          minimum_order_value?: number | string | null;
        };
        const mapped = source
          .map((c: CouponApi) => ({
            code: String(c?.coupon_code || "").trim().toUpperCase(),
            serviceType: String(c?.service_type || "").trim().toUpperCase(),
            discountType:
              String(c?.discount_type || "FIXED_AMOUNT").toUpperCase() === "PERCENTAGE"
                ? "PERCENTAGE"
                : "FIXED_AMOUNT",
            discountValue: Number(c?.discount_value) || 0,
            minimumOrderValue:
              c?.minimum_order_value != null ? Number(c.minimum_order_value) : null,
          }))
          .filter((c: CouponOption) => Boolean(c.code) && c.discountValue > 0);
        setAvailableCoupons(mapped);
      })
      .catch(() => {
        if (!cancelled) setAvailableCoupons([]);
      })
      .finally(() => {
        if (!cancelled) setCouponLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active, appUser?.customerid, cfg.serviceType]);

  useEffect(() => {
    if (!appliedCouponCode) return;
    const applied = availableCoupons.find((c) => c.code === appliedCouponCode);
    if (applied && !couponMeetsMinOrder(applied, serviceTotal)) {
      setAppliedCouponCode(null);
      setCouponInfo(
        `${applied.code} removed: minimum order is ${formatInr(applied.minimumOrderValue ?? 0)}`
      );
    }
  }, [appliedCouponCode, availableCoupons, serviceTotal]);

  useEffect(() => {
    if (!couponInfo || couponInfo.startsWith("Applying")) return;
    const id = window.setTimeout(() => setCouponInfo(null), COUPON_FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [couponInfo]);

  useEffect(() => {
    if (!active) return;
    if (!isBookingScheduleComplete(effectiveBookingType, bookingTypeCode)) {
      setQuotePreview({
        total: 0,
        loading: false,
        error: undefined,
        breakdown: [],
      });
      return;
    }
    const customerId = appUser?.customerid;
    const start_date =
      formatDateOnly(String(effectiveBookingType?.startDate ?? "")) ||
      todayYmd();
    const raw_end_date =
      formatDateOnly(String(effectiveBookingType?.endDate ?? "")) || start_date;
    const end_date = bookingTypeCode === "ON_DEMAND" ? start_date : raw_end_date;
    const durationHours = computeDurationHours(
      bookingTypeCode,
      String(effectiveBookingType?.startTime ?? ""),
      String(effectiveBookingType?.endTime ?? ""),
      start_date,
      end_date,
      String(effectiveBookingType?.timeRange ?? "")
    );

    setQuotePreview((p) => ({ ...p, loading: true, error: undefined, breakdown: [] }));
    let cancelled = false;

    loadServiceQuote(serviceKind, {
      bookingType: bookingTypeCode,
      customerId,
      couponCode: appliedCouponCode || undefined,
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
          const nextPayable = computePaymentTotals(total).total_amount || 0;
          const previousPayable = lastPayableTotalRef.current || 0;
          const savings = Math.max(0, previousPayable - nextPayable);
          const couponWarning =
            res.coupon_warning ?? (res.quote as { coupon_warning?: string })?.coupon_warning;
          setQuotePreview({
            total,
            loading: false,
            error: total > 0 ? undefined : res.quoteError,
            quote: res.quote,
            breakdown: buildQuoteBreakdown(res.quote, total),
          });
          if (couponWarning && appliedCouponCode) {
            setCouponInfo(couponWarning);
            setSnackbarMessage(couponWarning);
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
          } else if (appliedCouponCode && total > 0) {
            const discountRow = (res.quote?.discounts ?? []).find((d) =>
              String(d.label || "").toLowerCase().includes("coupon")
            );
            const couponSavings = Number(discountRow?.amount) || savings;
            if (couponSavings > 0) {
              setCouponInfo(
                `Coupon ${appliedCouponCode} applied · You saved ${formatInr(couponSavings)}`
              );
              const snackKey = `${appliedCouponCode}:success:${Math.round(couponSavings)}`;
              if (couponSnackbarKeyRef.current !== snackKey) {
                couponSnackbarKeyRef.current = snackKey;
                setSnackbarMessage(`${appliedCouponCode} applied · Saved ${formatInr(couponSavings)}`);
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
              }
            } else {
              setCouponInfo(`Coupon ${appliedCouponCode} did not change the price`);
              const snackKey = `${appliedCouponCode}:warn`;
              if (couponSnackbarKeyRef.current !== snackKey) {
                couponSnackbarKeyRef.current = snackKey;
                setSnackbarMessage(`${appliedCouponCode} did not reduce your total`);
                setSnackbarSeverity("warning");
                setSnackbarOpen(true);
              }
            }
          }
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const ax = err as { response?: { data?: { error?: string } }; message?: string };
          const backendError = ax.response?.data?.error || ax.message || "Could not load price";
          setQuotePreview({
            total: 0,
            loading: false,
            error: backendError,
            breakdown: [],
          });
          if (appliedCouponCode) {
            setCouponInfo(`Could not apply ${appliedCouponCode}: ${backendError}`);
            const snackKey = `${appliedCouponCode}:error`;
            if (couponSnackbarKeyRef.current !== snackKey) {
              couponSnackbarKeyRef.current = snackKey;
              setSnackbarMessage(`Coupon apply failed: ${backendError}`);
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
            }
          }
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
    effectiveBookingType?.startDate,
    effectiveBookingType?.endDate,
    effectiveBookingType?.startTime,
    effectiveBookingType?.endTime,
    effectiveBookingType?.timeRange,
    effectiveBookingType?.bookingPreference,
    schedulePendingCommit,
    appliedCouponCode,
    appUser?.customerid,
  ]);

  useEffect(() => {
    if (!active || bookingTypeCode !== "ON_DEMAND") {
      setOnDemandAvailability({ loading: false, available: true });
      return;
    }
    if (!scheduleReady || !bookingCoords) {
      setOnDemandAvailability({
        loading: false,
        available: false,
        message: bookingCoords
          ? undefined
          : "Select a map location so we can check provider availability.",
      });
      return;
    }

    const startDate =
      formatDateOnly(String(bookingType?.startDate ?? "")) || todayYmd();
    const startTime = String(bookingType?.startTime ?? "").trim();
    const endTime = String(bookingType?.endTime ?? "").trim();
    const durationHours = computeDurationHours(
      bookingTypeCode,
      startTime,
      endTime,
      startDate,
      startDate,
      String(bookingType?.timeRange ?? "")
    );
    const durationMinutes =
      durationHours != null && durationHours > 0
        ? Math.round(durationHours * 60)
        : 60;

    let cancelled = false;
    setOnDemandAvailability((prev) => ({ ...prev, loading: true }));
    checkOnDemandProviderAvailability({
      latitude: bookingCoords.lat,
      longitude: bookingCoords.lng,
      serviceType: cfg.serviceType,
      startDate,
      startTime,
      durationMinutes,
      providerId: providerId ?? undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setOnDemandAvailability({
          loading: false,
          available: result.available,
          message: result.message,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setOnDemandAvailability({
          loading: false,
          available: false,
          message: "Could not verify provider availability. Please try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    active,
    bookingTypeCode,
    scheduleReady,
    bookingCoords?.lat,
    bookingCoords?.lng,
    bookingType?.startDate,
    bookingType?.startTime,
    bookingType?.endTime,
    bookingType?.timeRange,
    cfg.serviceType,
    providerId,
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
    sendDataToParent?.(BOOKINGS);
    onClose();
  };

  const applyCouponCode = (code: string) => {
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) return;
    const match = availableCoupons.find((c) => c.code === normalized);
    if (match && !couponMeetsMinOrder(match, serviceTotal)) {
      setCouponInfo(`${normalized} needs minimum order ${formatInr(match.minimumOrderValue ?? 0)}`);
      return;
    }
    couponSnackbarKeyRef.current = null;
    setAppliedCouponCode(normalized);
    setCouponInput(normalized);
    setCouponDialogOpen(false);
    setCouponInfo(`Applying ${normalized}...`);
  };

  const removeCoupon = () => {
    couponSnackbarKeyRef.current = null;
    setAppliedCouponCode(null);
    setCouponInput("");
    setCouponInfo(null);
  };

  const couponPreview = (coupon: CouponOption): string => {
    if (coupon.discountType === "PERCENTAGE") return `${coupon.discountValue}% off`;
    return `${formatInr(coupon.discountValue)} off`;
  };

  const handleCheckout = async () => {
    const booking_type = getBookingTypeFromPreference(
      bookingType?.bookingPreference ?? "Date"
    );

    if (!isBookingScheduleComplete(bookingType, booking_type)) {
      setSnackbarMessage(
        booking_type === "SHORT_TERM"
          ? "Please select your date range and daily start time before checkout."
          : "Please select a time for your chosen date before checkout."
      );
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (!bookingLocationReady) {
      setSnackbarMessage("Please select a service address before confirming your booking.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (
      booking_type === "ON_DEMAND" &&
      (!onDemandAvailability.available || onDemandAvailability.loading)
    ) {
      setSnackbarMessage(
        onDemandAvailability.message || ON_DEMAND_NO_PROVIDERS_MESSAGE
      );
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (scheduleIncomplete) {
      setSnackbarMessage(
        bookingTypeCode === "SHORT_TERM"
          ? "Select your date range and daily start time before checkout."
          : "Select a time for your chosen date before checkout."
      );
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (schedulePendingCommit) {
      setSnackbarMessage("Tap Check availability to confirm your schedule changes.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

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
      const spId = providerId;
      if (booking_type !== "ON_DEMAND" && !spId) {
        setSnackbarMessage("Missing provider. Please pick a provider again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const start_date =
        formatDateOnly(String(bookingType?.startDate ?? "")) ||
        todayYmd();
      const raw_end_date = formatDateOnly(String(bookingType?.endDate ?? "")) || start_date;
      const end_date = booking_type === "ON_DEMAND" ? start_date : raw_end_date;
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
        couponCode: appliedCouponCode || undefined,
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

      const startTime = String(bookingType?.startTime ?? "").trim();
      const endTime = String(bookingType?.endTime ?? "").trim();

      const payload: BookingPayload = {
        customerid: customerId,
        serviceproviderid: spId ?? null,
        start_date,
        end_date: booking_type === "ON_DEMAND" ? start_date : end_date,
        start_time: startTime,
        responsibilities: { tasks: [], add_ons: [] },
        booking_type,
        taskStatus: "NOT_STARTED",
        service_type: cfg.serviceType,
        base_amount: checkoutTotal,
        addon_total: 0,
        use_pricing_engine: true,
        pricing_snapshot: quoteRes.quote,
        coupon_code: appliedCouponCode || undefined,
        payment_mode: "razorpay",
        use_wallet: useWalletBalance && walletBalance > 0,
        end_time: endTime,
      };
      const startEpoch = dayjs(`${start_date} ${payload.start_time}`).unix();
      const endEpoch =
        booking_type === "ON_DEMAND" && endTime
          ? dayjs(`${start_date} ${endTime}`).unix()
          : payload.end_time
            ? dayjs(`${payload.end_date} ${payload.end_time}`).unix()
            : startEpoch + 60 * 60;
      payload.start_epoch = Number.isFinite(startEpoch) ? startEpoch : undefined;
      payload.end_epoch =
        Number.isFinite(endEpoch) && endEpoch > startEpoch ? endEpoch : startEpoch + 60 * 60;
      payload.start_date_epoch = dayjs(start_date).startOf("day").unix();
      payload.end_date_epoch = dayjs(payload.end_date || start_date).endOf("day").unix();
      const result = await BookingService.bookAndPay(payload);

      setBookingSuccessDetails({
        providerName: providerFullName,
        serviceType: t(cfg.successServiceKey),
        totalAmount: computePaymentTotals(checkoutTotal).total_amount,
        bookingDate: bookingType?.startDate || todayYmd(),
        persons: 1,
        message:
          result?.verifyResult?.message ||
          "Your booking is confirmed. Payment was successful.",
      });

      setSuccessDialogOpen(true);
    } catch (error: unknown) {
      let backendMessage = "Failed to initiate payment";
      const axErr = error as {
        response?: { data?: string | { error?: string; message?: string } };
        message?: string;
      };
      if (axErr?.response?.data) {
        if (typeof axErr.response.data === "string") backendMessage = axErr.response.data;
        else if (axErr.response.data.error) backendMessage = axErr.response.data.error;
        else if (axErr.response.data.message) backendMessage = axErr.response.data.message;
      } else if (axErr.message) {
        backendMessage = axErr.message;
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
      <MaidRoot $page={isPage} style={successDialogOpen ? { display: "none" } : undefined}>
        <MaidHeader style={{ background: cfg.headerGradient }}>
          <MaidCloseBtn
            aria-label={isPage ? "back" : "close"}
            onClick={() => {
              setLoading(false);
              onClose();
            }}
            size="small"
            sx={isPage ? { left: 8, right: "auto" } : undefined}
          >
            {isPage ? (
              <ArrowBackIcon fontSize="small" sx={{ color: "#fff" }} />
            ) : (
              <CloseIcon fontSize="small" sx={{ color: "#fff" }} />
            )}
          </MaidCloseBtn>
          <MaidHeaderTitle id={flowTitleId}>{t(cfg.titleKey)}</MaidHeaderTitle>
          <MaidHeaderSub>
            {providerFullName || (isPage ? "Choose a provider from the list" : "")}
          </MaidHeaderSub>
        </MaidHeader>

        <MaidScroll>
          <MaidCard>
            <MaidBookingDetailsSection
              active={active}
              providerId={providerId}
              bookingCoords={bookingCoords}
              role={cfg.serviceType}
              customerId={appUser?.customerid}
              onApplyingScheduleChange={setIsCheckingAvailability}
              onScheduleActionsReady={(actions) => {
                scheduleActionsRef.current = actions;
              }}
              onAvailabilityCheckBlockedChange={handleAvailabilityCheckBlockedChange}
            />
          </MaidCard>

          {providerRequired &&
          providerId &&
          bookingTypeCode !== "ON_DEMAND" &&
          scheduleReady &&
          bookingCoords &&
          !needsScheduleAvailabilityCheck &&
          !selectedProviderAvailability.loading &&
          !selectedProviderAvailability.available ? (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                border: "1px solid #fecaca",
                background: "#fef2f2",
              }}
            >
              <Typography variant="body2" sx={{ color: "#991b1b", lineHeight: 1.5 }}>
                {selectedProviderAvailability.message ||
                  "This provider is not available for your selected dates and time. Please adjust your schedule or choose another provider."}
              </Typography>
            </Box>
          ) : null}

          {bookingTypeCode === "ON_DEMAND" &&
          scheduleReady &&
          bookingCoords &&
          !onDemandAvailability.loading &&
          !onDemandAvailability.available ? (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                border: "1px solid #fecaca",
                background: "#fef2f2",
              }}
              role="alert"
            >
              <Typography sx={{ fontSize: 13, color: "#991b1b", lineHeight: 1.45 }}>
                {onDemandAvailability.message || ON_DEMAND_NO_PROVIDERS_MESSAGE}
              </Typography>
            </Box>
          ) : null}

          <MaidCard>
            <BookingLocationSection />
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
            <Box sx={{ mt: 1.25, p: 1.5, borderRadius: 2, border: "1px solid #dbeafe", background: "#f8fbff" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.75 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Coupons</Typography>
                </Box>
                <Box sx={{ minWidth: 24, px: 1, py: "2px", borderRadius: 999, backgroundColor: "#dbeafe", textAlign: "center" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8" }}>{couponCountLabel}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 12, color: "#64748b", lineHeight: "17px" }}>
                  {couponLoading
                    ? "Checking available coupons..."
                    : appliedCouponCode
                      ? `Applied: ${appliedCouponCode}`
                      : bestCoupon
                        ? `${couponCountLabel} available · Best: ${bestCoupon.code} (${couponPreview(bestCoupon)})`
                        : couponCountLabel > 0
                          ? `${couponCountLabel} available`
                        : "No coupons available"}
              </Typography>
              {!appliedCouponCode && bestCouponSavings > 0 ? (
                <Typography sx={{ fontSize: 12, color: "#047857", fontWeight: 600, mt: 0.5 }}>
                  Save up to {formatInr(bestCouponSavings)} with the best coupon
                </Typography>
              ) : null}
              {couponInfo ? (
                <Typography sx={{ fontSize: 12, color: "#0369a1", mt: 0.5 }}>{couponInfo}</Typography>
              ) : null}
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {!appliedCouponCode && bestCoupon ? (
                  <Button
                    variant="contained"
                    size="sm"
                    onClick={() => applyCouponCode(bestCoupon.code)}
                    className="font-bold"
                  >
                    Apply best
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCouponDialogOpen(true)}
                  disabled={couponLoading}
                  className="font-bold border-sky-600 text-sky-700 hover:bg-sky-50"
                >
                  {appliedCouponCode ? "Change coupon" : "View coupons"}
                </Button>
                  {!appliedCouponCode && bestCoupon ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCouponInput(bestCoupon.code);
                        setCouponDialogOpen(true);
                      }}
                      className="font-bold"
                    >
                      Details
                    </Button>
                  ) : null}
                {appliedCouponCode ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeCoupon}
                    className="font-bold"
                  >
                    Remove
                  </Button>
                ) : null}
              </Box>
            </Box>
            {isCheckoutAuthenticated && walletBalance > 0 ? (
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
                      disabled={walletLoading || loading}
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
                {useWalletBalance && walletSplit.wallet_applied > 0 ? (
                  <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#0369a1" }}>
                    {walletSplit.razorpay_amount <= 0
                      ? t("walletCoversFullAmount")
                      : `${t("walletAppliedLabel")}: ${formatInr(walletSplit.wallet_applied)} · ${t("payViaRazorpay")}: ${formatInr(walletSplit.razorpay_amount)}`}
                  </Typography>
                ) : null}
              </Box>
            ) : null}
            <PriceBreakdown
              rows={displayBreakdown}
              loading={quotePreview.loading}
              paymentTotals={paymentTotals}
              walletApplied={walletSplit.wallet_applied}
              amountPayable={walletSplit.razorpay_amount}
              walletAppliedLabel={t("walletAppliedLabel")}
              walletPayableLabel={t("payViaRazorpay")}
            />
          </MaidCard>
        </MaidScroll>

        <MaidFooter>
          <MaidFooterTop>
            <div>
              <MaidFooterMuted>
                {walletSplit.wallet_applied > 0
                  ? walletSplit.razorpay_amount <= 0
                    ? t("walletAppliedLabel")
                    : t("payViaRazorpay")
                  : "Amount payable"}
              </MaidFooterMuted>
              <MaidFooterPrice>
                {quotePreview.loading
                  ? "…"
                  : formatInr(
                      walletSplit.wallet_applied > 0
                        ? walletSplit.razorpay_amount
                        : payableTotal
                    )}
              </MaidFooterPrice>
            </div>
          </MaidFooterTop>
          <MaidFooterActions>
            <MaidBtnGhost type="button" onClick={() => onClose()}>
              {isPage ? "Back" : t("close") || "Close"}
            </MaidBtnGhost>
            {!isCheckoutAuthenticated ? (
              <>
                <Tooltip title={t("youNeedToLogin")}>
                  <IconButton
                    className="h-8 w-8 text-sky-600"
                    aria-label="Coupon info"
                  >
                    <Info className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
                <MaidBtnPrimary type="button" onClick={handleLoginToContinue}>
                  {t("loginToContinue")}
                </MaidBtnPrimary>
              </>
            ) : needsScheduleAvailabilityCheck ? (
              <MaidBtnPrimary
                type="button"
                disabled={
                  scheduleIncomplete ||
                  isCheckingAvailability ||
                  loading ||
                  availabilityCheckBlocked
                }
                title={
                  scheduleIncomplete
                    ? bookingTypeCode === "SHORT_TERM"
                      ? "Select your date range and daily start time"
                      : "Select a time for your chosen date"
                    : availabilityCheckBlocked
                      ? availabilityCheckBlockedMessage ||
                        "Adjust your schedule, then check availability again"
                      : "Confirm your schedule changes before checkout"
                }
                onClick={() => void scheduleActionsRef.current?.checkAvailability()}
              >
                {isCheckingAvailability ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Check availability"
                )}
              </MaidBtnPrimary>
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
        autoHideDuration={
          snackbarSeverity === "error" ? AVAILABILITY_ERROR_SNACKBAR_MS : COUPON_FEEDBACK_MS
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
            alignItems: "flex-start",
            "& .MuiAlert-message": { lineHeight: 1.5 },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={couponDialogOpen} onClose={() => setCouponDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            pb: 1.25,
            background: cfg.headerGradient,
            color: "#fff",
          }}
        >
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>Apply Coupon</Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.9)", mt: 0.5 }}>
            Use the best offer or enter your code manually.
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center" }}>
            <TextField
              fullWidth
              label="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              size="small"
            />
            <Button
              variant="contained"
              onClick={() => applyCouponCode(normalizedCouponInput)}
              disabled={!normalizedCouponInput}
              className="h-10 shrink-0 whitespace-nowrap px-4 font-bold"
            >
              Apply
            </Button>
          </Box>
          {bestCoupon ? (
            <Box
              sx={{
                mb: 1.75,
                p: 1.5,
                border: "1px solid #22c55e",
                background: "linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.25,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 11, color: "#047857", fontWeight: 700, letterSpacing: 0.2 }}>
                  Recommended
                </Typography>
                <Typography sx={{ fontSize: 15, color: "#064e3b", fontWeight: 800 }}>
                  {bestCoupon.code}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#065f46" }}>
                  {couponPreview(bestCoupon)} · Save {formatInr(bestCouponSavings)}
                </Typography>
              </Box>
              <Button
                variant={appliedCouponCode === bestCoupon.code ? "contained" : "outline"}
                size="sm"
                onClick={() => applyCouponCode(bestCoupon.code)}
                className="min-w-[88px] font-bold"
              >
                {appliedCouponCode === bestCoupon.code ? "Applied" : "Use"}
              </Button>
            </Box>
          ) : null}
          {secondaryEligibleCoupons.length > 0 ? (
            <>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 1 }}>
                More eligible coupons
              </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {secondaryEligibleCoupons.map((coupon) => (
                <Box
                  key={coupon.code}
                  sx={{
                    border:
                      appliedCouponCode === coupon.code
                        ? "1px solid #60a5fa"
                        : "1px solid #e2e8f0",
                    borderRadius: 2,
                    p: 1.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    backgroundColor:
                      appliedCouponCode === coupon.code ? "#eff6ff" : "#fff",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{coupon.code}</Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {couponPreview(coupon)}
                      {coupon.minimumOrderValue ? ` · Min order ${formatInr(coupon.minimumOrderValue)}` : ""}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#047857", fontWeight: 600, mt: 0.25 }}>
                      You save {formatInr(estimateCouponSavings(coupon))}
                    </Typography>
                  </Box>
                  <Button
                    size="sm"
                    variant={appliedCouponCode === coupon.code ? "contained" : "link"}
                    onClick={() => applyCouponCode(coupon.code)}
                    className="font-bold"
                  >
                    {appliedCouponCode === coupon.code ? "Applied" : "Use"}
                  </Button>
                </Box>
              ))}
            </Box>
            </>
          ) : eligibleCoupons.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {couponLoading
                ? "Loading coupons..."
                : `No ${cfg.serviceType === "COOK" ? "Cook" : "Maid"} coupons available for this order.`}
            </Typography>
          ) : null}
          {ineligibleCoupons.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 1 }}>
                Unavailable for current total
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {ineligibleCoupons.map((coupon) => (
                  <Box
                    key={coupon.code}
                    sx={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 2,
                      p: 1.25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      opacity: 0.7,
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{coupon.code}</Typography>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        Min order {formatInr(Number(coupon.minimumOrderValue || 0))}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>Locked</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions className={dialogActionsClassName}>
          <Button variant="dialogCancel" onClick={() => setCouponDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ServiceBookingFlow;
