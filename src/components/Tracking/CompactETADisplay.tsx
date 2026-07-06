import React, { useEffect, useState } from 'react';
import { Clock, Navigation, TrendingUp } from 'lucide-react';
import { calculateETA } from '../../services/trackingService';

interface CompactETADisplayProps {
  engagementId: number;
  onError?: (error: string) => void;
}

interface ETAData {
  duration_seconds: number;
  distance_meters: number;
  traffic_aware: boolean;
  calculated_at: number;
  confidence: string;
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.ceil(seconds / 60)} min`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
};

/**
 * Compact ETA Display for booking cards
 * Shows provider ETA and distance in a minimal format
 */
export const CompactETADisplay: React.FC<CompactETADisplayProps> = ({
  engagementId,
  onError,
}) => {
  const [eta, setEta] = useState<ETAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentETA, setCurrentETA] = useState<number>(0);

  // Fetch ETA on mount
  useEffect(() => {
    let mounted = true;

    const fetchETA = async () => {
      try {
        setLoading(true);
        const etaData = await calculateETA(engagementId);
        
        if (mounted && etaData) {
          setEta(etaData);
          setCurrentETA(etaData.duration_seconds);
        }
      } catch (error: any) {
        // Silently fail - provider might not have started journey yet
        if (mounted) {
          setEta(null);
          if (onError && error?.response?.status !== 404) {
            onError('Unable to calculate ETA');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchETA();

    return () => {
      mounted = false;
    };
  }, [engagementId, onError]);

  // Update countdown every second
  useEffect(() => {
    if (!eta) return;

    const startTime = eta.calculated_at;
    const initialDuration = eta.duration_seconds;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const newETA = Math.max(0, initialDuration - elapsed);
      setCurrentETA(newETA);
    }, 1000);

    return () => clearInterval(interval);
  }, [eta]);

  // Don't show anything if loading or no ETA available
  if (loading || !eta) {
    return null;
  }

  // Calculate color based on ETA
  const getETAColor = () => {
    if (currentETA < 180) return 'text-green-700 bg-green-50 border-green-200';
    if (currentETA < 600) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${getETAColor()}`}>
      <Clock className="h-3 w-3" />
      <span className="font-semibold">
        {currentETA > 0 ? formatTime(currentETA) : 'Arriving'}
      </span>
      {eta.distance_meters > 0 && (
        <>
          <span className="text-[10px] opacity-60">·</span>
          <Navigation className="h-3 w-3 opacity-70" />
          <span className="opacity-90">{formatDistance(eta.distance_meters)}</span>
        </>
      )}
      {eta.traffic_aware && (
        <TrendingUp className="h-3 w-3 opacity-60" title="Live traffic" />
      )}
    </div>
  );
};

export default CompactETADisplay;
