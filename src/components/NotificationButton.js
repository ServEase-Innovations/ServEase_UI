// NotificationButton.js
import React from 'react';
import { FaBell } from 'react-icons/fa'; // You'll need react-icons installed

const publicVapidKey = 'BO0fj8ZGgK5NOd9lv0T0E273Uh4VptN2d8clBns7aOBusDGbIh_ZIyQ8W8C-WViT1bdJlr0NkEozugQQqj8_nTo';

const NotificationButton = () => {
  const subscribeUser = async () => {
    const register = await navigator.serviceWorker.ready;

    // Unsubscribe old subscription if exists
    const existingSubscription = await register.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    await fetch('http://localhost:4000/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('User subscribed:', subscription);
    alert('Subscribed successfully!');
  };

  const triggerNotification = async () => {
    try {
      const response = await fetch('http://localhost:4000/send-notification', {
        method: 'POST',
        body: JSON.stringify({
          title: "Hello from your App!",
          body: "This is a test push notification without Postman.",
          url: "http://localhost:3000"
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        console.log('Notification triggered!');
        alert('Notification sent!');
      } else {
        console.error('Notification failed');
        alert('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    }
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button onClick={subscribeUser}>Enable Notifications</button>
      <FaBell
        size={24}
        style={{ cursor: 'pointer' }}
        onClick={triggerNotification}
        title="Send Test Notification"
      />
    </div>
  );
};

export default NotificationButton;
