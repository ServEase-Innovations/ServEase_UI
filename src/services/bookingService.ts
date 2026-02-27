/* eslint-disable */
import axios from "axios";
import { useSelector } from "react-redux";
import store from "src/store/userStore";
import PaymentInstance from "./paymentInstance";
import dayjs from "dayjs";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// const API_BASE = "https://payments-j5id.onrender.com"; // backend base URL

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
  serviceproviderid: number | null;
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
    const res = await PaymentInstance.post(`/api/v2/createEngagements`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  openRazorpay: async (razorpay_order_id: string, amountPaise: number, currency = "INR") => {
    const ok = await loadRazorpayScript();
    if (!ok) throw new Error("Failed to load Razorpay SDK");

    return new Promise<RazorpayPaymentResponse>((resolve, reject) => {
      console.log("Opening Razorpay with order id:", razorpay_order_id, "and amount (paise):", amountPaise);
      const rzp = new window.Razorpay({
        key: "rzp_test_SHU1MPGbiCzst9",
        amount: amountPaise,
        currency,
        order_id: razorpay_order_id,
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
    const res = await PaymentInstance.post(`/api/v2/createEngagements/verify`, paymentData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  /**
   * Full flow: create engagement -> open Razorpay -> verify
   */
  bookAndPay: async (payload: BookingPayload) => {


    console.log("Booking payload before processing:", payload);

    payload.duration_minutes = payload.duration_minutes || 60; // Default to 60 minutes if not provided

    if(payload.start_time && payload.end_time){
      const start = dayjs(`${payload.start_date} ${payload.start_time}`);
      const end = dayjs(`${payload.end_date} ${payload.end_time}`);
      payload.duration_minutes = Math.round(end.diff(start, 'minute'));
    }

    const state = store.getState();
    const location : any = state.geoLocation.value; 

    let latitude = 0;
    let longitude = 0;


    if(location?.geometry?.location){
      latitude = location?.geometry?.location?.lat;
      longitude = location?.geometry?.location?.lng;
    } else if (location?.lat && location?.lng) {
      latitude = location?.lat;
      longitude = location?.lng;
    }


    console.log("location payload:", location);
    
    console.log("Current location from store:", location);
    // payload.start_time = to24Hour(payload.start_time);
    payload.serviceproviderid = payload.serviceproviderid === 0 ? null : payload.serviceproviderid;
    payload.latitude = latitude;
    payload.longitude = longitude;
    const engagementData = await BookingService.createEngagement(payload);

    // Extract order id & amount
    const orderId =
      engagementData?.razorpay_order_id;

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

    paymentResponse.engagementId = engagementData?.engagement_id;

    // Verify payment on backend
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
