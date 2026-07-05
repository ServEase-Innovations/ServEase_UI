import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import {
  setConnectionStatus,
  setHeartbeat,
  updateLocation,
  updateEstimatedPosition,
  setProviderStatus,
  updateETA,
  setError,
} from '../../../features/tracking/trackingSlice';

interface UseTrackingWebSocketProps {
  sessionToken: string | null;
  engagementId: number | null;
  enabled: boolean;
}

interface LocationUpdateMessage {
  type: 'location_update';
  engagement_id: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    bearing?: number;
    speed?: number;
    timestamp: number;
  };
  eta?: {
    duration_seconds: number;
    eta_range: {
      min_seconds: number;
      max_seconds: number;
    };
  };
}

interface StatusChangeMessage {
  type: 'status_change';
  engagement_id: number;
  old_status: string;
  new_status: string;
}

interface ConnectionLostMessage {
  type: 'connection_lost';
  engagement_id: number;
  last_update_at: number;
  estimated_position: {
    latitude: number;
    longitude: number;
    confidence: number;
    seconds_since_update: number;
  };
}

export const useTrackingWebSocket = ({
  sessionToken,
  engagementId,
  enabled,
}: UseTrackingWebSocketProps) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || !sessionToken || !engagementId) {
      return;
    }

    if (socketRef.current?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Connecting to tracking WebSocket...');
    dispatch(setConnectionStatus({ status: 'connecting', transport: 'websocket' }));

    const wsUrl = process.env.REACT_APP_TRACKING_WS_URL || 'http://localhost:5007';
    
    const socket = io(wsUrl, {
      auth: {
        token: sessionToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    socketRef.current = socket;

    // Connection established
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      dispatch(setConnectionStatus({ status: 'connected', transport: 'websocket' }));
      reconnectAttemptsRef.current = 0;

      // Subscribe to engagement
      socket.emit('subscribe', { engagement_id: engagementId });
    });

    // Subscribed confirmation
    socket.on('subscribed', (data: { engagement_id: number; timestamp: number }) => {
      console.log('✅ Subscribed to engagement:', data.engagement_id);
    });

    // Location update received
    socket.on('location_update', (data: LocationUpdateMessage) => {
      console.log('📍 Location update:', data);
      dispatch(updateLocation(data.location));
      
      if (data.eta) {
        dispatch(updateETA({
          engagement_id: data.engagement_id,
          distance_meters: 0, // Not provided in this message
          duration_seconds: data.eta.duration_seconds,
          eta_range: data.eta.eta_range,
          traffic_aware: false,
          calculated_at: Date.now(),
          confidence: 'medium',
        }));
      }
    });

    // Status change received
    socket.on('status_change', (data: StatusChangeMessage) => {
      console.log('📊 Status change:', data);
      dispatch(setProviderStatus(data.new_status as any));
    });

    // Connection lost (provider offline)
    socket.on('connection_lost', (data: ConnectionLostMessage) => {
      console.log('⚠️ Provider offline, estimated position:', data);
      dispatch(updateEstimatedPosition({
        latitude: data.estimated_position.latitude,
        longitude: data.estimated_position.longitude,
        estimated: true,
        confidence: data.estimated_position.confidence,
        based_on_update_at: data.last_update_at,
        seconds_since_update: data.estimated_position.seconds_since_update,
        estimation_method: 'linear_projection',
      }));
    });

    // Heartbeat response
    socket.on('pong', (data: { timestamp: number }) => {
      dispatch(setHeartbeat(data.timestamp));
    });

    // Error received
    socket.on('error', (error: { code: string; message: string }) => {
      console.error('WebSocket error:', error);
      dispatch(setError(error.message));
    });

    // Disconnected
    socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected:', reason);
      dispatch(setConnectionStatus({ status: 'disconnected' }));

      if (reason === 'io server disconnect') {
        // Server disconnected, try manual reconnect
        socket.connect();
      }
    });

    // Reconnecting
    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
      dispatch(setConnectionStatus({ status: 'reconnecting' }));
      reconnectAttemptsRef.current = attemptNumber;
    });

    // Reconnected
    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      dispatch(setConnectionStatus({ status: 'connected', transport: 'websocket' }));
      reconnectAttemptsRef.current = 0;

      // Re-subscribe after reconnection
      socket.emit('subscribe', { engagement_id: engagementId });
    });

    // Failed to reconnect
    socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after max attempts');
      dispatch(setError('Connection lost. Please refresh the page.'));
    });

    // Start heartbeat
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000); // Every 30 seconds

    // Store interval for cleanup
    (socket as any).heartbeatInterval = heartbeatInterval;

  }, [enabled, sessionToken, engagementId, dispatch]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting WebSocket...');
      
      // Clear heartbeat interval
      const heartbeatInterval = (socketRef.current as any).heartbeatInterval;
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }

      // Unsubscribe if we have an engagement ID
      if (engagementId) {
        socketRef.current.emit('unsubscribe', { engagement_id: engagementId });
      }

      socketRef.current.disconnect();
      socketRef.current = null;
      
      dispatch(setConnectionStatus({ status: 'disconnected' }));
    }
  }, [engagementId, dispatch]);

  // Connect/disconnect based on enabled flag
  useEffect(() => {
    if (enabled && sessionToken && engagementId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, sessionToken, engagementId, connect, disconnect]);

  return {
    isConnected: socketRef.current?.connected || false,
    socket: socketRef.current,
    reconnect: connect,
    disconnect,
  };
};
