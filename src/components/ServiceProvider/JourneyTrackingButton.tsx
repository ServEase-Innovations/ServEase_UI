import { useState, useEffect, useRef } from 'react';
import { Button } from '../Button/button';
import { useToast } from '../hooks/use-toast';
import {
  startJourney,
  markArrived,
  getTrackingStatus,
  updateLocation,
  TrackingStatus,
} from '../../services/providerTrackingService';
import { Navigation, MapPin, Loader2, CheckCircle2, Radio } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../Common/alert-dialog';

interface Props {
  engagementId: number;
  onStatusChange?: (status: string) => void;
}

export default function JourneyTrackingButton({ engagementId, onStatusChange }: Props) {
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [arriveDialogOpen, setArriveDialogOpen] = useState(false);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    loadTrackingStatus();
  }, [engagementId]);

  // Start/stop location tracking based on status
  useEffect(() => {
    const currentStatus = trackingStatus?.tracking_status;
    
    if (currentStatus === 'en_route') {
      // Start location tracking
      startLocationTracking();
    } else {
      // Stop location tracking
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingStatus?.tracking_status]);

  const startLocationTracking = () => {
    if (locationIntervalRef.current) return; // Already tracking

    console.log('Starting location tracking for engagement', engagementId);
    
    // Reset last update time
    lastUpdateTimeRef.current = 0;

    // Small delay to ensure backend status is updated
    setTimeout(() => {
      // Try to use continuous location watching
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy, speed, heading } = position.coords;
            
            // Throttle updates to max once per 15 seconds
            const now = Date.now();
            const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
            
            if (timeSinceLastUpdate < 15000 && lastUpdateTimeRef.current > 0) {
              console.log('Skipping update (throttled):', { timeSinceLastUpdate });
              return;
            }
            
            lastUpdateTimeRef.current = now;
            console.log('Location update:', { latitude, longitude, accuracy });
            
            // Send location update to backend
            updateLocation(
              engagementId,
              latitude,
              longitude,
              accuracy,
              speed || undefined,
              heading || undefined
            ).catch((error) => {
              console.error('Failed to update location:', error.response?.data || error.message);
            });
          },
          (error) => {
            console.warn('Location watch error:', error.code, error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
      }

      // Fallback: poll location every 15 seconds
      locationIntervalRef.current = setInterval(async () => {
        try {
          const position = await getCurrentLocation();
          console.log('Polling location update:', position);
          await updateLocation(
            engagementId,
            position.latitude,
            position.longitude
          );
        } catch (error: any) {
          console.error('Failed to get/update location:', error.message);
        }
      }, 15000);
    }, 1000); // Wait 1 second for backend to process journey start
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    console.log('Stopped location tracking');
  };

  const loadTrackingStatus = async () => {
    try {
      setFetchingStatus(true);
      const status = await getTrackingStatus(engagementId);
      setTrackingStatus(status);
    } catch (error) {
      console.error('Error loading tracking status:', error);
    } finally {
      setFetchingStatus(false);
    }
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Location error:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  const handleStartJourney = async () => {
    try {
      setLoading(true);

      // Get current location
      let location;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn('Could not get location, continuing without it');
      }

      // Start journey
      const response = await startJourney(engagementId, location);

      // Update status
      await loadTrackingStatus();

      toast({
        title: 'Journey Started',
        description: 'Customer can now track your location in real-time.',
      });

      if (onStatusChange) {
        onStatusChange(response.tracking_status);
      }
      
      setStartDialogOpen(false);
    } catch (error: any) {
      console.error('Error starting journey:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start journey. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkArrived = async () => {
    try {
      setLoading(true);

      // Get current location
      let location;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn('Could not get location');
      }

      // Mark arrived
      const response = await markArrived(engagementId, location);

      // Update status
      await loadTrackingStatus();

      toast({
        title: 'Arrival Confirmed',
        description: 'Customer tracking has been stopped.',
      });

      if (onStatusChange) {
        onStatusChange(response.tracking_status);
      }
      
      setArriveDialogOpen(false);
    } catch (error: any) {
      console.error('Error marking arrived:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to mark arrival. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStatus) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    );
  }

  const currentStatus = trackingStatus?.tracking_status || 'not_started';

  // Don't show button if service is already completed
  if (currentStatus === 'service_completed') {
    return null;
  }

  // Show "Start Journey" button if not started
  if (currentStatus === 'not_started') {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full border-sky-300 bg-sky-50 px-2 text-xs font-semibold text-sky-700 hover:border-sky-400 hover:bg-sky-100"
          onClick={() => setStartDialogOpen(true)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <span className="inline-flex items-center">
              <Navigation className="mr-1 h-3.5 w-3.5" aria-hidden />
              Start Journey
            </span>
          )}
        </Button>

        <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-sky-600" />
                Start Journey?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This will enable customer tracking so they can see your location in real-time while you travel to their location.
                <div className="mt-3 rounded-lg bg-sky-50 border border-sky-200 p-3">
                  <p className="text-sm font-medium text-sky-900">What happens next:</p>
                  <ul className="mt-2 space-y-1 text-sm text-sky-800">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Customer will see your live location on their map</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>They'll get estimated arrival time updates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Remember to mark arrival when you reach</span>
                    </li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleStartJourney}
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Start Journey
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Show "Mark Arrived" button if en route
  if (currentStatus === 'en_route') {
    return (
      <>
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-sky-50 border border-sky-200 px-3 py-2 shadow-sm">
            <Radio className="h-4 w-4 text-sky-600 animate-pulse" />
            <span className="text-xs font-semibold text-sky-900 flex-1">
              Customer Tracking Active
            </span>
            <span className="text-xs text-sky-700 font-semibold">Live</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full border-emerald-300 bg-emerald-50 px-2 text-xs font-semibold text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100"
            onClick={() => setArriveDialogOpen(true)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span className="inline-flex items-center">
                <MapPin className="mr-1 h-3.5 w-3.5" aria-hidden />
                Mark Arrived
              </span>
            )}
          </Button>
        </div>

        <AlertDialog open={arriveDialogOpen} onOpenChange={setArriveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Mark Arrival?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                Confirm that you have reached the customer location. This will stop real-time tracking.
                <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-sm font-medium text-emerald-900">After marking arrival:</p>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-800">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Customer tracking will stop</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>You can start the service</span>
                    </li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Not Yet</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleMarkArrived}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Yes, I've Arrived
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Show status for arrived/service_started
  if (currentStatus === 'arrived' || currentStatus === 'service_started') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 shadow-sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-900">
          {currentStatus === 'arrived' ? 'Arrived at location' : 'Service in progress'}
        </span>
      </div>
    );
  }

  return null;
}
