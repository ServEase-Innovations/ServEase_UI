import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getLocationUpdate } from '../../../services/trackingService';
import { updateLocation } from '../../../features/tracking/trackingSlice';

interface UseLocationPollingProps {
  engagementId: number | null;
  enabled: boolean;
  interval?: number;
}

/**
 * Hook to poll for location updates as fallback for WebSocket
 * Polls every 10 seconds by default
 */
export const useLocationPolling = ({
  engagementId,
  enabled,
  interval = 10000,
}: UseLocationPollingProps) => {
  const dispatch = useDispatch();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !engagementId) {
      // Clean up polling if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log(`Starting location polling for engagement ${engagementId}`);

    // Fetch immediately
    const fetchLocation = async () => {
      try {
        const locationData = await getLocationUpdate(engagementId);
        if (locationData?.location) {
          console.log('Polled location update:', locationData.location);
          dispatch(updateLocation(locationData.location));
        }
      } catch (error) {
        console.error('Location polling error:', error);
      }
    };

    // Initial fetch
    fetchLocation();

    // Set up interval
    intervalRef.current = setInterval(fetchLocation, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        console.log('Stopping location polling');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [engagementId, enabled, interval, dispatch]);

  return {
    isPolling: !!intervalRef.current,
  };
};
