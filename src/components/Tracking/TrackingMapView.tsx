import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  MyLocation as RecenterIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { useTrackingWebSocket } from './hooks/useTrackingWebSocket';
import { ETADisplay } from './ETADisplay';
import { OfflineBanner } from './OfflineBanner';
import { hideMap, stopSession, setAutoCenter, resetTracking } from '../../features/tracking/trackingSlice';
import { stopTrackingSession } from '../../services/trackingService';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 28.6139, // Delhi
  lng: 77.2090,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

interface RootState {
  tracking: any; // Replace with actual type
}

export const TrackingMapView: React.FC = () => {
  const dispatch = useDispatch();
  const tracking = useSelector((state: RootState) => state.tracking);
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  // WebSocket connection
  const { isConnected, reconnect } = useTrackingWebSocket({
    sessionToken: tracking.session.sessionToken,
    engagementId: tracking.session.engagementId,
    enabled: tracking.ui.isMapVisible && tracking.session.isActive,
  });

  // Calculate map center
  const mapCenter = tracking.map.center 
    ? { lat: tracking.map.center.latitude, lng: tracking.map.center.longitude }
    : defaultCenter;

  // Get provider position (real or estimated) - memoized to prevent unnecessary re-renders
  const providerPosition = React.useMemo(() => {
    if (tracking.provider.estimatedPosition) {
      return {
        lat: tracking.provider.estimatedPosition.latitude,
        lng: tracking.provider.estimatedPosition.longitude,
        estimated: true,
        confidence: tracking.provider.estimatedPosition.confidence,
      };
    }
    if (tracking.provider.location) {
      return {
        lat: tracking.provider.location.latitude,
        lng: tracking.provider.location.longitude,
        estimated: false,
      };
    }
    return null;
  }, [tracking.provider.location, tracking.provider.estimatedPosition]);

  // Get destination position - memoized to prevent unnecessary re-renders
  const destinationPosition = React.useMemo(() => {
    if (tracking.destination.latitude && tracking.destination.longitude) {
      return {
        lat: tracking.destination.latitude,
        lng: tracking.destination.longitude,
      };
    }
    return null;
  }, [tracking.destination.latitude, tracking.destination.longitude]);

  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fit bounds to show both markers
  useEffect(() => {
    if (!map || !providerPosition || !destinationPosition) return;

    if (tracking.map.isAutoCenter) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(providerPosition);
      bounds.extend(destinationPosition);
      setBounds(bounds);
      map.fitBounds(bounds);
    }
  }, [map, providerPosition, destinationPosition, tracking.map.isAutoCenter]);

  // Handle recenter
  const handleRecenter = useCallback(() => {
    if (!map || !bounds) return;
    dispatch(setAutoCenter(true));
    map.fitBounds(bounds);
  }, [map, bounds, dispatch]);

  // Handle close
  const handleClose = async () => {
    try {
      // Stop tracking session
      if (tracking.session.id) {
        await stopTrackingSession(tracking.session.id);
        dispatch(stopSession());
      }
    } catch (error) {
      console.error('Failed to stop tracking session:', error);
    } finally {
      dispatch(hideMap());
      dispatch(resetTracking());
    }
  };

  // Handle message button
  const handleMessage = () => {
    // TODO: Open messaging interface
    console.log('Open messaging interface');
  };

  // Handle user pan/zoom (disable auto-center)
  const handleMapInteraction = useCallback(() => {
    if (tracking.map.isAutoCenter) {
      dispatch(setAutoCenter(false));
    }
  }, [tracking.map.isAutoCenter, dispatch]);

  // Show loading error
  if (loadError) {
    return (
      <Dialog open={tracking.ui.isMapVisible} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">
            Failed to load Google Maps. Please check your internet connection and try again.
          </Alert>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Show loading
  if (!isLoaded) {
    return (
      <Dialog open={tracking.ui.isMapVisible} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={tracking.ui.isMapVisible}
      maxWidth="lg"
      fullWidth
      fullScreen
      onClose={handleClose}
    >
      <DialogContent sx={{ p: 0, position: 'relative', height: '100vh' }}>
        {/* Error Alert */}
        {tracking.ui.error && (
          <Alert
            severity="error"
            onClose={() => dispatch({ type: 'tracking/clearError' })}
            sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000 }}
          >
            {tracking.ui.error}
          </Alert>
        )}

        {/* Offline Banner */}
        {!tracking.provider.isOnline && tracking.provider.estimatedPosition && (
          <OfflineBanner
            lastUpdateAt={tracking.provider.estimatedPosition.based_on_update_at}
            confidence={tracking.provider.estimatedPosition.confidence}
            onRetry={reconnect}
          />
        )}

        {/* ETA Display */}
        {tracking.eta && (
          <ETADisplay
            eta={tracking.eta}
            isTeam={tracking.team.isTeam}
            teamMemberCount={tracking.team.members.length}
          />
        )}

        {/* Map */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={tracking.map.zoom}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onDragStart={handleMapInteraction}
          onZoomChanged={handleMapInteraction}
        >
          {/* Provider Marker */}
          {providerPosition && (
            <>
              <Marker
                position={providerPosition}
                icon={{
                  url: tracking.team.isTeam
                    ? '/assets/team-marker.png'
                    : '/assets/provider-marker.png',
                  scaledSize: new google.maps.Size(40, 40),
                }}
                label={tracking.team.isTeam ? 'Team' : undefined}
                opacity={providerPosition.estimated ? 0.6 : 1}
              />
              {/* Accuracy circle */}
              {!providerPosition.estimated && tracking.provider.location?.accuracy && (
                <Circle
                  center={providerPosition}
                  radius={tracking.provider.location.accuracy}
                  options={{
                    fillColor: '#4285F4',
                    fillOpacity: 0.2,
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.5,
                    strokeWeight: 1,
                  }}
                />
              )}
            </>
          )}

          {/* Destination Marker */}
          {destinationPosition && (
            <Marker
              position={destinationPosition}
              icon={{
                url: '/assets/destination-marker.png',
                scaledSize: new google.maps.Size(40, 40),
              }}
              label="Destination"
            />
          )}
        </GoogleMap>

        {/* Control Buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 80,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {/* Recenter Button */}
          {!tracking.map.isAutoCenter && (
            <Paper elevation={3}>
              <IconButton onClick={handleRecenter} size="large">
                <RecenterIcon />
              </IconButton>
            </Paper>
          )}

          {/* Message Button */}
          <Paper elevation={3}>
            <IconButton onClick={handleMessage} size="large" color="primary">
              <MessageIcon />
            </IconButton>
          </Paper>
        </Box>

        {/* Close Button */}
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
          <Paper elevation={3}>
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          </Paper>
        </Box>

        {/* Connection Status */}
        <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
          <Paper elevation={3} sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color={isConnected ? 'success.main' : 'warning.main'}>
              {isConnected ? '🟢 Connected' : '🟡 Reconnecting...'}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TrackingMapView;
