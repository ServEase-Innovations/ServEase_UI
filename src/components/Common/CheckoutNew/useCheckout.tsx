/* eslint-disable */
import { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { BookingDetails } from 'src/types/engagementRequest';
import { removeFromCart, selectCartItems } from 'src/features/addToCart/addToSlice';
import { isMaidCartItem, isMealCartItem, isNannyCartItem } from 'src/types/cartSlice';
import axiosInstance from 'src/services/axiosInstance';

interface CheckoutParams {
  baseTotal: number;
  customerName: string;
  customerId: string;
  bookingDetails: BookingDetails;
  user: any;
  currentLocation: string;
  sendDataToParent?: (data: string) => void;
  handleClose: () => void;
}

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const allCartItems = useSelector(selectCartItems);

  const getEngagementsDescription = (items: any[]) => {
    return items.map(item => {
      if (isMealCartItem(item)) {
        return `${item.mealType} for ${item.persons} persons`;
      } else if (isMaidCartItem(item)) {
        if (item.serviceType === 'package') {
          if (item.name === 'utensilCleaning') return `Utensil cleaning for ${item.details?.persons || 1} persons`;
          if (item.name === 'sweepingMopping') return `Sweeping & mopping for ${item.details?.houseSize || '2BHK'}`;
          if (item.name === 'bathroomCleaning') return `Bathroom cleaning for ${item.details?.bathrooms || 2} bathrooms`;
        } else if (item.serviceType === 'addon') {
          return item.name.split(/(?=[A-Z])/).join(' ');
        }
      } else if (isNannyCartItem(item)) {
        return `${item.careType} care (${item.packageType}) for age ${item.age}`;
      }
      return item.name || 'Service';
    }).join(', ');
  };

  const getServiceType = (items: any[]) => {
    // Determine service type based on cart items
    const hasMeal = items.some(isMealCartItem);
    const hasMaid = items.some(isMaidCartItem);
    const hasNanny = items.some(isNannyCartItem);

    if (hasMeal && !hasMaid && !hasNanny) return 'COOK';
    if (hasMaid && !hasMeal && !hasNanny) return 'MAID';
    if (hasNanny && !hasMeal && !hasMaid) return 'NANNY';
    return 'MIXED'; // Multiple service types
  };

  const handleCheckout = async ({
    baseTotal,
    customerName,
    customerId,
    bookingDetails,
    user,
    currentLocation,
    sendDataToParent,
    handleClose
  }: CheckoutParams) => {
    try {
      setLoading(true);
      setError(null);

      // Calculate tax and platform fee (18% tax + 6% platform fee)
      const tax = baseTotal * 0.18;
      const platformFee = baseTotal * 0.06;
      const grandTotal = baseTotal + tax + platformFee;

      // Create Razorpay order
      const response = await axios.post(
        "https://utils-ndt3.onrender.com/create-order",
        { amount: Math.round(grandTotal * 100) },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 && response.data.success) {
        const orderId = response.data.orderId;
        const amount = Math.round(grandTotal * 100);
        const currency = "INR";

        const options = {
          key: "rzp_test_lTdgjtSRlEwreA",
          amount,
          currency,
          name: "Serveaso",
          description: "Service Booking",
          order_id: orderId,
          handler: async function (razorpayResponse: any) {
            try {
              // Save booking
              const bookingResponse = await axiosInstance.post(
                "/api/serviceproviders/engagement/add",
                bookingDetails
              );

              if (bookingResponse.status === 201) {
                // Calculate payment details
                const calculatePaymentResponse = await axiosInstance.post(
                  "/api/payments/calculate-payment",
                  null,
                  {
                    params: {
                      customerId: customerId,
                      baseAmount: grandTotal,
                      startDate_P: bookingDetails.startDate,
                      endDate_P: bookingDetails.endDate,
                      paymentMode: bookingDetails.paymentMode,
                      serviceType: bookingDetails.serviceType,
                    }
                  }
                );

                // Clear cart
                dispatch(removeFromCart({ type: 'meal' }));
                dispatch(removeFromCart({ type: 'maid' }));
                dispatch(removeFromCart({ type: 'nanny' }));

                // Send notification
                try {
                  await fetch("http://localhost:4000/send-notification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: "Booking Confirmed",
                      message: `Your booking has been confirmed!`,
                      userId: customerId,
                      redirectUrl: "http://localhost:3000/bookings",
                    }),
                  });
                } catch (notificationError) {
                  console.error("Notification error:", notificationError);
                }

                if (sendDataToParent) {
                  sendDataToParent('BOOKINGS');
                }
                
                handleClose();
              }
            } catch (error) {
              console.error("Error in payment handler:", error);
              handleClose();
            }
          },
          prefill: {
            name: customerName,
            email: user?.email || "",
            contact: user?.mobileNo || "",
          },
          theme: { color: "#3399cc" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Failed to initiate payment. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { handleCheckout, loading, error, getEngagementsDescription, getServiceType };
};