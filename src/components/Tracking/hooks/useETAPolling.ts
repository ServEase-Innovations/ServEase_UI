import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { calculateETA } from '../../../services/trackingService';
import { updateETA } from '../../../features/tracking/trackingSlice';

interface UseETAPollingProps {
  engagementId: number | null;
  enabled: boolean;
  interval?: number;
}

/**
 * Hook to poll for ETA updates
 * Calculates ETA every 30 seconds by default to account for traffic changes
 */
export const useETAPolling = ({
  engagementId,
  enabled,
  interval = 30000, // 30 seconds
}: UseETAPollingProps) => {
  const dispatch = useDispatch();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !engagementId) {
      // Clean up polling if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log(`Starting ETA polling for engagement ${engagementId}`);

    // Fetch ETA and update Redux state
    const fetchETA = async () => {
      try {
        setIsCalculating(true);
        setError(null);
        
        const etaData = await calculateETA(engagementId);
        
        if (etaData) {
          console.log('ETA calculated:', {
            duration: `${Math.round(etaData.duration_seconds / 60)}min`,
            distance: `${(etaData.distance_meters / 1000).toFixed(1)}km`,
            traffic_aware: etaData.traffic_aware,
          });
          
          dispatch(updateETA(etaData));
        }
      } catch (error: any) {
        console.error('ETA calculation error:', error);
        
        // Don't show error for 404 (just means ETA not available yet)
        if (error?.response?.status !== 404) {
          setError(error?.response?.data?.message || 'Failed to calculate ETA');
        }
      } finally {
        setIsCalculating(false);
      }
    };

    // Initial fetch
    fetchETA();

    // Set up interval
    intervalRef.current = setInterval(fetchETA, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        console.log('Stopping ETA polling');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [engagementId, enabled, interval, dispatch]);

  return {
    isCalculating,
    error,
  };
};
