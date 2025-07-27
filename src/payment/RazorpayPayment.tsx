import React, { useState } from 'react';
import axios from 'axios';

const RazorpayPayment = () => {
  const [amount, setAmount] = useState<any>();

  // Function to call the backend to create an order
  const createOrder = async (amount) => {
    try {
      const response = await axios.post('http://wss://utils-ndt3.onrender.com/create-order', { amount });
      return response.data.orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  // Function to handle Razorpay payment
  const handlePayment = async () => {
    const orderId = await createOrder(amount); // Get the orderId from backend

    if (!orderId) return;

    const options = {
      key: 'YOUR_KEY_ID', // Your Razorpay key ID
      amount: amount * 100, // Amount in paise (e.g., 100 for ₹1)
      currency: 'INR',
      name: 'Your Company Name',
      description: 'Test Transaction',
      order_id: orderId, // Order ID received from backend
      handler: function (response) {
        alert('Payment Successful');
        console.log(response);
      },
      prefill: {
        name: 'Your Name',
        email: 'your-email@example.com',
        contact: '9999999999',
      },
      notes: {
        address: 'Your Address',
      },
      theme: {
        color: '#F37254',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div>
      <h2>Razorpay Payment</h2>
      <div>
        <label>Amount (INR):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default RazorpayPayment;
