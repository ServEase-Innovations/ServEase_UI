import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import {
  AccessTime as ClockIcon,
  DirectionsCar as CarIcon,
  People as TeamIcon,
} from '@mui/icons-material';

interface ETADisplayProps {
  eta: {
    duration_seconds: number;
    eta_range: {
      min_seconds: number;
      max_seconds: number;
    };
    distance_meters: number;
    traffic_aware: boolean;
    confidence: string;
    calculated_at: number;
  };
  isTeam?: boolean;
  teamMemberCount?: number;
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

const getETAColor = (seconds: number): string => {
  if (seconds < 180) return 'success'; // < 3 min - green
  if (seconds < 600) return 'primary'; // < 10 min - blue
  return 'warning'; // > 10 min - orange
};

const getConfidenceLabel = (confidence: string): string => {
  switch (confidence) {
    case 'high':
      return 'Accurate';
    case 'medium':
      return 'Estimated';
    case 'low':
      return 'Approximate';
    default:
      return '';
  }
};

export const ETADisplay: React.FC<ETADisplayProps> = ({
  eta,
  isTeam = false,
  teamMemberCount = 0,
}) => {
  const [currentETA, setCurrentETA] = useState(eta.duration_seconds);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update ETA countdown every second
  useEffect(() => {
    const startTime = eta.calculated_at;
    const initialDuration = eta.duration_seconds;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
      
      // Update current ETA by subtracting elapsed time
      const newETA = Math.max(0, initialDuration - elapsed);
      setCurrentETA(newETA);
    }, 1000);

    return () => clearInterval(interval);
  }, [eta.duration_seconds, eta.calculated_at]);

  // Reset when ETA prop changes
  useEffect(() => {
    setCurrentETA(eta.duration_seconds);
    setElapsedTime(0);
  }, [eta.calculated_at]);

  const etaColor = getETAColor(currentETA);
  const minETA = Math.max(0, eta.eta_range.min_seconds - elapsedTime);
  const maxETA = Math.max(0, eta.eta_range.max_seconds - elapsedTime);

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        px: 3,
        py: 2,
        minWidth: 300,
        maxWidth: 400,
      }}
    >
      <Box>
        {/* Main ETA */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ClockIcon color={etaColor as any} fontSize="large" />
          <Box>
            <Typography variant="h5" fontWeight="bold" color={`${etaColor}.main`}>
              {currentETA > 0 ? formatTime(currentETA) : 'Arriving now'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(minETA)} - {formatTime(maxETA)} away
            </Typography>
          </Box>
        </Box>

        {/* Distance & Traffic Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Distance */}
          {eta.distance_meters > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDistance(eta.distance_meters)}
              </Typography>
            </Box>
          )}

          {/* Traffic Aware Chip */}
          {eta.traffic_aware && (
            <Chip
              label="Live traffic"
              size="small"
              color="info"
              sx={{ height: 20 }}
            />
          )}

          {/* Confidence Chip */}
          {eta.confidence && (
            <Chip
              label={getConfidenceLabel(eta.confidence)}
              size="small"
              variant="outlined"
              sx={{ height: 20 }}
            />
          )}

          {/* Team Indicator */}
          {isTeam && teamMemberCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TeamIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Team of {teamMemberCount}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Arrival Message */}
        {currentETA < 180 && currentETA > 0 && (
          <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="success.main" fontWeight="medium">
              {isTeam ? 'Team' : 'Provider'} arriving soon
            </Typography>
          </Box>
        )}

        {/* Arrived Message */}
        {currentETA === 0 && (
          <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="success.main" fontWeight="bold">
              {isTeam ? 'Team' : 'Provider'} has arrived!
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ETADisplay;
