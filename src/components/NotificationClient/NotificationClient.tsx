import React, { useEffect, useRef, useState } from 'react';

const SERVICE_PROVIDER_ID = '202'; // ✅ Replace dynamically if needed

const sendWhenReady = (ws: WebSocket, data: any) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    ws.addEventListener(
      'open',
      () => {
        ws.send(JSON.stringify(data));
      },
      { once: true }
    );
  }
};

const NotificationClient = () => {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000/');

    // Send IDENTIFY only when ready
    if (ws.current) {
      sendWhenReady(ws.current, {
        type: 'IDENTIFY',
        id: SERVICE_PROVIDER_ID,
      });
    }

    ws.current.onmessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('📨 Message received:', message);

      setMessages((prev) => [...prev, message]);
      setPopupMessage(message); // Show popup dialog
    };

    ws.current.onerror = (error: Event) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  const handleClosePopup = () => setPopupMessage(null);
  const handleView = () => {
    alert('Viewing details...');
    setPopupMessage(null);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>📬 Notifications for Service Provider: {SERVICE_PROVIDER_ID}</h2>
      {messages.length === 0 ? (
        <p>No notifications yet...</p>
      ) : (
        <ul>
          {messages.map((msg, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>{msg}</li>
          ))}
        </ul>
      )}

      {popupMessage && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 9999,
          width: '300px',
          textAlign: 'center',
        }}>
          <h3>🔔 New Notification</h3>
          <p>{popupMessage}</p>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleView} style={{ marginRight: '10px' }}>View</button>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationClient;
