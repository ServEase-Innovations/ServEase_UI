/* eslint-disable */
import axios from "axios";
import { useSelector } from "react-redux";
import store from "src/store/userStore";
import PaymentInstance from "./paymentInstance";
import dayjs from "dayjs";
import { resolveProviderId } from "src/utils/providerId";
import {
  formatServiceAddressFromGeoLocation,
  resolveLocationCoords,
} from "src/utils/bookingLocation";

/** Injected by https://checkout.razorpay.com/v1/checkout.js (do not augment `Window` — conflicts with other typings). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRazorpayCtor(): any {
  return (window as any).Razorpay;
}

// const API_BASE = "https://payments-vyqp.onrender.com"; // backend base URL (use urls.payments in app code)

async function loadRazorpayScript(): Promise<boolean> {
  if (getRazorpayCtor()) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface BookingPayload {
  customerid: number;
  serviceproviderid: number | null;
  start_date: string;
  end_date: string;
  start_epoch?: number;
  end_epoch?: number;
  start_date_epoch?: number;
  end_date_epoch?: number;
  responsibilities: any;
  booking_type: string;
  service_type: string;
  base_amount: number;
  payment_mode?: "razorpay" | "UPI" | "CASH";
  use_wallet?: boolean;
  [key: string]: any;
}

/**
 * Provider cards / API use `serviceProviderId` (camelCase); legacy code used `serviceproviderid`.
 * Returns a positive integer PK or null — never 0 (booking layer treats 0 as "no provider").
 */
export function resolveServiceProviderIdForPayload(
  details: {
    id?: string | number | null;
    serviceProviderId?: string | number | null;
    serviceproviderId?: string | number | null;
    serviceproviderid?: string | number | null;
  } | null | undefined
): number | null {
  const resolved = resolveProviderId(details as Record<string, unknown>);
  if (!resolved) return null;
  const n = Number(resolved);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  engagementId : number;
}

export const PAYMENT_CANCELLED_MESSAGE = "Payment cancelled";

export class PaymentCancelledError extends Error {
  constructor(message = PAYMENT_CANCELLED_MESSAGE) {
    super(message);
    this.name = "PaymentCancelledError";
  }
}

export function isPaymentCancelledError(err: unknown): boolean {
  if (err instanceof PaymentCancelledError) return true;
  if (err && typeof err === "object") {
    const e = err as { name?: string; message?: string; description?: string };
    const msg = String(e.message || e.description || "").toLowerCase();
    return (
      e.name === "PaymentCancelledError" ||
      msg.includes("payment cancelled") ||
      msg.includes("user closed")
    );
  }
  return false;
}

function toEpochSeconds(dateYmd?: string, timeHm?: string): number | null {
  if (!dateYmd || !timeHm) return null;
  const dt = dayjs(`${dateYmd} ${timeHm}`);
  if (!dt.isValid()) return null;
  return dt.unix();
}

function toDateStartEpoch(dateYmd?: string): number | null {
  if (!dateYmd) return null;
  const d = dayjs(dateYmd);
  return d.isValid() ? d.startOf("day").unix() : null;
}

function toDateEndEpoch(dateYmd?: string): number | null {
  if (!dateYmd) return null;
  const d = dayjs(dateYmd);
  return d.isValid() ? d.endOf("day").unix() : null;
}

function normalizeEpochFirstPayload(payload: BookingPayload): BookingPayload {
  const out: BookingPayload = { ...payload };
  const bookingType = String(out.booking_type || "").toUpperCase();
  const startDate = String(out.start_date || "").slice(0, 10);
  const endDateRaw = String(out.end_date || "").slice(0, 10);
  const startTime = String(out.start_time || "");
  const endTime = String(out.end_time || "");

  const startEpochFromFields = toEpochSeconds(startDate, startTime);
  let endEpochFromFields = toEpochSeconds(
    bookingType === "ON_DEMAND" ? startDate : (endDateRaw || startDate),
    endTime
  );

  let startEpoch = Number(out.start_epoch);
  if (!Number.isFinite(startEpoch) || startEpoch <= 0) {
    startEpoch = startEpochFromFields ?? NaN;
  }

  let endEpoch = Number(out.end_epoch);
  if (!Number.isFinite(endEpoch) || endEpoch <= 0) {
    endEpoch = endEpochFromFields ?? NaN;
  }

  if (bookingType === "ON_DEMAND") {
    out.end_date = startDate;
    if ((!Number.isFinite(endEpoch) || endEpoch <= startEpoch) && Number.isFinite(startEpoch)) {
      endEpoch = startEpoch + 60 * 60;
    }
  }

  if (Number.isFinite(startEpoch) && Number.isFinite(endEpoch) && endEpoch > startEpoch) {
    out.start_epoch = Math.floor(startEpoch);
    out.end_epoch = Math.floor(endEpoch);
    out.duration_minutes = Math.round((endEpoch - startEpoch) / 60);
  } else {
    out.duration_minutes = out.duration_minutes || 60;
  }

  out.start_date_epoch = out.start_date_epoch ?? toDateStartEpoch(startDate) ?? undefined;
  const finalEndDate = String(out.end_date || startDate).slice(0, 10);
  out.end_date_epoch = out.end_date_epoch ?? toDateEndEpoch(finalEndDate) ?? undefined;

  return out;
}

export const BookingService = {

  
  createEngagement: async (payload: BookingPayload) => {
    const res = await PaymentInstance.post(`/api/v2/createEngagements`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  openRazorpay: async (
    razorpay_order_id: string,
    amountPaise: number,
    currency = "INR",
    prefill?: { name?: string; email?: string; contact?: string },
    razorpayKeyId?: string
  ) => {
    const ok = await loadRazorpayScript();
    if (!ok) throw new Error("Failed to load Razorpay SDK");
    const Razorpay = getRazorpayCtor();
    if (typeof Razorpay !== "function") {
      throw new Error("Razorpay not available on window");
    }

    return new Promise<RazorpayPaymentResponse>((resolve, reject) => {
      console.log("Opening Razorpay with order id:", razorpay_order_id, "and amount (paise):", amountPaise);
      const checkoutKey =
        razorpayKeyId ||
        process.env.REACT_APP_RAZORPAY_KEY ||
        "rzp_test_lTdgjtSRlEwreA";

      let settled = false;
      const finish = (
        settle: "resolve" | "reject",
        value: RazorpayPaymentResponse | unknown
      ) => {
        if (settled) return;
        settled = true;
        if (settle === "resolve") {
          resolve(value as RazorpayPaymentResponse);
        } else {
          reject(value);
        }
      };

      const rzp = new Razorpay({
        key: checkoutKey,
        amount: amountPaise,
        currency,
        order_id: razorpay_order_id,
        name: "Serveaso",
        description: "Booking Payment",
        handler: function (resp: RazorpayPaymentResponse) {
          finish("resolve", resp);
        },
        prefill: {
          name: prefill?.name || "Test User",
          email: prefill?.email || "test@example.com",
          contact: prefill?.contact || "9999999999",
        },
        theme: { color: "#0ea5e9" },
        modal: {
          ondismiss: function () {
            finish("reject", new PaymentCancelledError());
          },
        },
      });
      rzp.on("payment.failed", (resp: any) => {
        finish("reject", resp?.error || new Error("Payment failed"));
      });
      rzp.open();
    });
  },

  verifyPayment: async (paymentData: RazorpayPaymentResponse) => {
    const res = await PaymentInstance.post(`/api/v2/createEngagements/verify`, paymentData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  /** Resume checkout for a booking with PENDING payment (My Bookings → Pay now). */
  resumePayment: async (engagementId: number | string) => {
    const id = Number(engagementId);
    if (!Number.isFinite(id) || id < 1) {
      throw new Error("Invalid engagement id");
    }
    const res = await PaymentInstance.post(
      `/api/v2/createEngagements/resume-payment`,
      { engagementId: id },
      { headers: { "Content-Type": "application/json" } }
    );
    const data = res.data;
    if (data?.success === false) {
      throw new Error(data.error || "Could not resume payment");
    }
    return data as {
      razorpay_order_id: string;
      razorpay_key_id?: string;
      amount: number;
      amount_inr?: number;
      currency: string;
      engagementId: number;
      customer?: {
        firstname?: string;
        lastname?: string;
        contact?: string;
        email?: string;
      };
    };
  },

  /**
   * Open Razorpay for an existing PENDING payment and verify on success.
   */
  payPendingEngagement: async (
    engagementId: number | string,
    prefill?: { name?: string; email?: string; contact?: string }
  ) => {
    const resume = await BookingService.resumePayment(engagementId);
    const orderId = resume.razorpay_order_id;
    if (!orderId) throw new Error("Razorpay order id not found");

    let amountPaise = Number(resume.amount);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      const inr = Number(resume.amount_inr);
      amountPaise = Math.round(inr * 100);
    }
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      throw new Error("Invalid payment amount");
    }

    const paymentResponse = await BookingService.openRazorpay(
      orderId,
      amountPaise,
      resume.currency || "INR",
      prefill,
      resume.razorpay_key_id
    );
    paymentResponse.engagementId = resume.engagementId ?? Number(engagementId);

    const verifyResult = await BookingService.verifyPayment(paymentResponse);
    return { resume, paymentResponse, verifyResult };
  },

  /**
   * Full flow: create engagement -> open Razorpay -> verify
   */
  bookAndPay: async (payload: BookingPayload) => {


    console.log("Booking payload before processing:", payload);
    payload = normalizeEpochFirstPayload(payload);

    const state = store.getState();
    const location: unknown = state.geoLocation.value;
    const coords = resolveLocationCoords(location);

    console.log("Location from store:", location);

    // payload.start_time = to24Hour(payload.start_time);
    payload.serviceproviderid = payload.serviceproviderid === 0 ? null : payload.serviceproviderid;
    payload.latitude = coords?.lat ?? 0;
    payload.longitude = coords?.lng ?? 0;
    payload.address = formatServiceAddressFromGeoLocation(location) || null;
    console.log("Location:", location);
    console.log("Address:", payload.address);
    console.log("Payload:", payload);
    const engagementData = await BookingService.createEngagement(payload);

    if (engagementData?.wallet_only) {
      return {
        engagementData,
        paymentResponse: null,
        verifyResult: {
          success: true,
          message: "Booking paid from wallet balance",
        },
      };
    }

    const orderId = engagementData?.razorpay_order_id;
    if (!orderId) throw new Error("Razorpay order id not found in response");

    let amountPaise: number;
    if (engagementData?.razorpay_amount != null) {
      amountPaise = Math.round(Number(engagementData.razorpay_amount) * 100);
    } else if (engagementData?.razorpayOrder?.amount) {
      amountPaise = Number(engagementData.razorpayOrder.amount);
    } else if (engagementData?.total_amount != null) {
      amountPaise = Math.round(Number(engagementData.total_amount) * 100);
    } else if (engagementData?.payment?.total_amount) {
      amountPaise = Math.round(Number(engagementData.payment.total_amount) * 100);
    } else {
      amountPaise = Math.round(payload.base_amount * 100);
    }

    const paymentResponse = await BookingService.openRazorpay(
      orderId,
      amountPaise,
      "INR",
      undefined,
      engagementData?.razorpay_key_id
    );

    paymentResponse.engagementId = engagementData?.engagement_id;

    const verifyResult = await BookingService.verifyPayment(paymentResponse);

    return { engagementData, paymentResponse, verifyResult };
  },
};

function to24Hour(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  hours = parseInt(hours, 10);

  if (modifier.toLowerCase() === "pm" && hours !== 12) {
    hours += 12;
  }
  if (modifier.toLowerCase() === "am" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}
