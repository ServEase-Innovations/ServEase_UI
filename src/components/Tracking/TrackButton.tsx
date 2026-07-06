import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { checkTrackingAvailability, startTrackingSession, getLocationUpdate } from '../../services/trackingService';
import { startSession, showMap, setDestination, setError, setLoading, updateLocation, setMapCenter } from '../../features/tracking/trackingSlice';

interface TrackButtonProps {
  engagementId: number;
  customerId: number;
  onTrackingStart?: () => void;
}

export const TrackButton: React.FC<TrackButtonProps> = ({
  engagementId,
  customerId,
  onTrackingStart,
}) => {
  const dispatch = useDispatch();
  const [availability, setAvailability] = useState<{
    available: boolean;
    provider_status: string | null;
    reason: string | null;
    is_team: boolean;
    team_data: {
      lead_provider_id: number;
      member_ids: number[];
      member_count: number;
      members: Array<{ id: number; name: string }>;
    } | null;
    engagement_details: {
      id: number;
      provider_id: number;
      customer_id: number;
      service_address: {
        latitude: number;
        longitude: number;
        address: string;
      };
    };
  } | null>(null);
  const [loading, setLoadingState] = useState(false);

  const checkAvailability = React.useCallback(async () => {
    try {
      const result = await checkTrackingAvailability(engagementId);
      setAvailability(result);
    } catch (error) {
      console.error('Failed to check tracking availability:', error);
      setAvailability({
        available: false,
        provider_status: null,
        reason: 'Failed to check availability',
        is_team: false,
        team_data: null,
        engagement_details: {
          id: 0,
          provider_id: 0,
          customer_id: 0,
          service_address: {
            latitude: 0,
            longitude: 0,
            address: '',
          },
        },
      });
    }
  }, [engagementId]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const handleTrackClick = async () => {
    if (!availability?.available) {
      return;
    }

    setLoadingState(true);
    dispatch(setLoading(true));

    try {
      // Start tracking session
      const session = await startTrackingSession(engagementId, customerId);

      // Update Redux state
      dispatch(startSession({
        session_id: session.session_id,
        engagement_id: engagementId,
        session_token: session.session_token,
        is_team: session.is_team || false,
        team_data: session.team_data || null,
      }));

      // Set destination if available
      if (availability.engagement_details?.service_address) {
        const address = availability.engagement_details.service_address;
        dispatch(setDestination({
          latitude: address.latitude || 0,
          longitude: address.longitude || 0,
          address: address.address || '',
        }));
      }

      // Fetch initial location
      try {
        const locationData = await getLocationUpdate(engagementId);
        if (locationData?.location) {
          console.log('Initial location fetched:', locationData.location);
          dispatch(updateLocation(locationData.location));
          
          // Center map on provider location
          dispatch(setMapCenter({
            latitude: locationData.location.latitude,
            longitude: locationData.location.longitude,
          }));
        }
      } catch (locError) {
        console.warn('Could not fetch initial location:', locError);
      }

      // Show map
      dispatch(showMap());

      // Callback for parent component
      if (onTrackingStart) {
        onTrackingStart();
      }
    } catch (error: any) {
      console.error('Failed to start tracking:', error);
      dispatch(setError(
        error.response?.data?.error || 'Failed to start tracking session'
      ));
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  // Show loading while checking availability
  if (availability === null) {
    return (
      <Button
        variant="outlined"
        disabled
        startIcon={<CircularProgress size={16} />}
      >
        Checking...
      </Button>
    );
  }

  // Show track button with appropriate state
  if (availability.available) {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LocationIcon />}
        onClick={handleTrackClick}
        disabled={loading}
      >
        Track Provider
      </Button>
    );
  }

  // Show disabled button with tooltip explaining why
  return (
    <Tooltip title={availability.reason || 'Tracking not available'}>
      <span>
        <Button
          variant="outlined"
          disabled
          startIcon={<LocationIcon />}
        >
          Track Provider
        </Button>
      </span>
    </Tooltip>
  );
};

export default TrackButton;
