import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_BASE = "https://payments-j5id.onrender.com"; // backend base URL

async function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return true;
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
  serviceproviderid: number;
  start_date: string;
  end_date: string;
  responsibilities: any;
  booking_type: string;
  service_type: string;
  base_amount: number;
  payment_mode?: "razorpay" | "UPI" | "CASH";
  [key: string]: any;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  engagementId : number;
}

export const BookingService = {
  createEngagement: async (payload: BookingPayload) => {
    const res = await axios.post(`${API_BASE}/api/engagements`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  openRazorpay: async (orderId: string, amountPaise: number, currency = "INR") => {
    const ok = await loadRazorpayScript();
    if (!ok) throw new Error("Failed to load Razorpay SDK");

    return new Promise<RazorpayPaymentResponse>((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: "rzp_test_lTdgjtSRlEwreA",
        amount: amountPaise,
        currency,
        order_id: orderId,
        name: "Serveaso",
        description: "Booking Payment",
        handler: function (resp: RazorpayPaymentResponse) {
          resolve(resp);
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: { color: "#0ea5e9" },
      });
      rzp.on("payment.failed", (resp: any) => {
        reject(resp.error);
      });
      rzp.open();
    });
  },

  verifyPayment: async (paymentData: RazorpayPaymentResponse) => {
    const res = await axios.post(`${API_BASE}/api/payments/verify`, paymentData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  /**
   * Full flow: create engagement -> open Razorpay -> verify
   */
  bookAndPay: async (payload: BookingPayload) => {
    const engagementData = await BookingService.createEngagement(payload);

    // Extract order id & amount
    const orderId =
      engagementData?.payment?.razorpay_order_id ||
      engagementData?.razorpayOrder?.id;

    if (!orderId) throw new Error("Razorpay order id not found in response");

    let amountPaise: number;
    if (engagementData?.razorpayOrder?.amount) {
      amountPaise = Number(engagementData.razorpayOrder.amount);
    } else if (engagementData?.payment?.total_amount) {
      amountPaise = Math.round(Number(engagementData.payment.total_amount) * 100);
    } else {
      amountPaise = Math.round(payload.base_amount * 100);
    }

    // Open Razorpay
    const paymentResponse = await BookingService.openRazorpay(orderId, amountPaise);

    paymentResponse.engagementId = engagementData?.engagement?.engagement_id;

    // Verify payment on backend
    const verifyResult = await BookingService.verifyPayment(paymentResponse);

    return { engagementData, paymentResponse, verifyResult };
  },
};
