import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Button, LinearProgress } from '@mui/material';
import {
  SignalWifiOff as OfflineIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface OfflineBannerProps {
  lastUpdateAt: number;
  confidence: number;
  onRetry?: () => void;
}

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
};

const getConfidenceMessage = (confidence: number): string => {
  if (confidence >= 0.8) {
    return 'Position is fairly accurate';
  } else if (confidence >= 0.5) {
    return 'Approximate position shown';
  } else if (confidence > 0) {
    return 'Position may be inaccurate';
  } else {
    return 'Showing last known location';
  }
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.5) return 'warning';
  return 'error';
};

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  lastUpdateAt,
  confidence,
  onRetry,
}) => {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(lastUpdateAt));

  // Update time ago every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(lastUpdateAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdateAt]);

  const confidenceColor = getConfidenceColor(confidence);
  const confidenceMessage = getConfidenceMessage(confidence);
  const confidencePercent = Math.round(confidence * 100);

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'absolute',
        top: 80,
        left: 16,
        right: 16,
        zIndex: 1000,
        px: 2,
        py: 1.5,
        backgroundColor: 'warning.light',
        borderLeft: 4,
        borderColor: 'warning.main',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        {/* Icon */}
        <OfflineIcon sx={{ color: 'warning.dark', mt: 0.5 }} />

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
            Connection Lost
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Last updated {timeAgo}
          </Typography>

          {/* Confidence Indicator */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {confidenceMessage}
              </Typography>
              <Typography variant="caption" color={`${confidenceColor}.main`} fontWeight="medium">
                {confidencePercent}% confidence
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={confidencePercent}
              color={confidenceColor as any}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Warning for low confidence */}
          {confidence < 0.5 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 1,
                p: 0.75,
                backgroundColor: 'error.light',
                borderRadius: 1,
              }}
            >
              <WarningIcon fontSize="small" color="error" />
              <Typography variant="caption" color="error.dark">
                {confidence > 0
                  ? 'Estimated location - actual position may vary significantly'
                  : 'Showing last known location only'}
              </Typography>
            </Box>
          )}

          {/* Retry Button */}
          {onRetry && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              sx={{ mt: 0.5 }}
            >
              Reconnect
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default OfflineBanner;
