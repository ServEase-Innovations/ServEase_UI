/* eslint-disable */
import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import moment from 'moment';
import { ServiceProviderDTO } from '../../types/ProviderDetailsType';
import { useLanguage } from 'src/context/LanguageContext';

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const AvailabilityBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.contrastText,
  fontWeight: 600,
  '&.partial': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  '&.limited': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
}));

const TimeSlot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: 8,
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  '&.exception': {
    backgroundColor: theme.palette.warning[50],
    borderColor: theme.palette.warning[200],
  },
}));

interface ProviderAvailabilityDrawerProps {
  open: boolean;
  onClose: () => void;
  provider: ServiceProviderDTO | null;
}

const ProviderAvailabilityDrawer: React.FC<ProviderAvailabilityDrawerProps> = ({
  open,
  onClose,
  provider,
}) => {
  const { t } = useLanguage(); // Add this line to use translations

  if (!provider) return null;

  const formatTime = (timeString: string) => {
    return moment(timeString, 'HH:mm').format('hh:mm A');
  };

  const getAvailabilityStatus = () => {
    const availability = provider.monthlyAvailability;
    if (!availability) return t('unknown');
    
    if (availability.fullyAvailable) return t('fullyAvailable');
    return t('partiallyAvailable');
  };

  const getAvailabilityColor = () => {
    const availability = provider.monthlyAvailability;
    if (!availability) return 'default';
    
    if (availability.fullyAvailable) return 'success';
    return 'warning';
  };

  const getBestMatchMessage = () => {
    if (provider.bestMatch) {
      return t('bestMatchMessage');
    } else {
      if (provider.monthlyAvailability?.fullyAvailable === false) {
        return t('partialAvailabilityMessage');
      }
      return t('goodMatchMessage');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500, md: 600 },
          maxWidth: '100vw',
        },
      }}
    >
      <DrawerHeader>
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={600}>
            {t('availabilityDetails')}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1" color="text.secondary">
              {provider.firstName} {provider.lastName}
            </Typography>
            {provider.bestMatch && (
              <Chip
                icon={<LocalFireDepartmentIcon />}
                label={t('bestMatch')}
                size="small"
                color="warning"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      <Box sx={{ p: 3, overflow: 'auto', height: 'calc(100vh - 120px)' }}>
        {/* Best Match Alert */}
        {provider.bestMatch ? (
          <Alert 
            severity="success" 
            icon={<LocalFireDepartmentIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {t('bestMatchProvider')}
            </Typography>
            <Typography variant="body2">
              {t('bestMatchDescription')}
            </Typography>
          </Alert>
        ) : (
          <Alert 
            severity="info"
            icon={<InfoIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {t('goodMatch')}
            </Typography>
            <Typography variant="body2">
              {getBestMatchMessage()}
            </Typography>
          </Alert>
        )}

        {/* Monthly Availability Summary */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarMonthIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                {t('monthlyAvailability')}
              </Typography>
            </Stack>
            <AvailabilityBadge
              label={getAvailabilityStatus()}
              color={getAvailabilityColor()}
              variant="filled"
              size="medium"
            />
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Preferred Time */}
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('preferredWorkingTime')}
              </Typography>
              <TimeSlot>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AccessTimeIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    {formatTime(provider.monthlyAvailability?.preferredTime || '08:00')}
                  </Typography>
                  <Chip label={t('daily')} size="small" variant="outlined" />
                </Stack>
              </TimeSlot>
            </Box>

            {/* Availability Stats */}
            {provider.monthlyAvailability?.summary && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('availabilitySummary')}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EventAvailableIcon color="success" />
                        <Typography variant="body1">{t('daysAtPreferredTime')}</Typography>
                      </Stack>
                      <Chip 
                        label={`${provider.monthlyAvailability.summary.daysAtPreferredTime} ${t('days')}`}
                        color="success"
                        variant="outlined"
                      />
                    </Stack>

                    {provider.monthlyAvailability.summary.daysWithDifferentTime > 0 && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTimeIcon color="warning" />
                          <Typography variant="body1">{t('daysWithDifferentTime')}</Typography>
                        </Stack>
                        <Chip 
                          label={`${provider.monthlyAvailability.summary.daysWithDifferentTime} ${t('days')}`}
                          color="warning"
                          variant="outlined"
                        />
                      </Stack>
                    )}

                    {provider.monthlyAvailability.summary.unavailableDays > 0 && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EventBusyIcon color="error" />
                          <Typography variant="body1">{t('unavailableDays')}</Typography>
                        </Stack>
                        <Chip 
                          label={`${provider.monthlyAvailability.summary.unavailableDays} ${t('days')}`}
                          color="error"
                          variant="outlined"
                        />
                      </Stack>
                    )}

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" fontWeight={600}>
                        {t('totalAvailableDays')}
                      </Typography>
                      <Chip 
                        label={`${provider.monthlyAvailability.summary.totalDays} ${t('days')}`}
                        color="primary"
                        variant="filled"
                      />
                    </Stack>
                  </Stack>
                </Paper>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Schedule Exceptions */}
        {provider.monthlyAvailability?.exceptions && 
         provider.monthlyAvailability.exceptions.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <WarningIcon color="warning" />
              <Typography variant="h6" fontWeight={600}>
                {t('scheduleExceptions')}
              </Typography>
              <Chip 
                label={`${provider.monthlyAvailability.exceptions.length} ${t('exceptions')}`}
                size="small"
                color="warning"
                variant="outlined"
              />
            </Stack>

            <List disablePadding>
              {provider.monthlyAvailability.exceptions.map((exception, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      px: 0,
                      py: 2,
                      backgroundColor: 'warning.50',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <InfoIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {moment(exception.date).format('ddd, MMM D, YYYY')}
                          </Typography>
                          <Chip 
                            label={t(exception.reason.toLowerCase())}
                            size="small"
                            color="warning"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={1} mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            {exception.reason === 'ON_DEMAND' 
                              ? t('availableOnDemand')
                              : t('notAvailableAtPreferredTime')}
                          </Typography>
                          {exception.suggestedTime && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <AccessTimeIcon fontSize="small" />
                              <Typography variant="body2" fontWeight={500}>
                                {t('suggestedTime')}: {formatTime(exception.suggestedTime)}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                  {index < provider.monthlyAvailability.exceptions.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('scheduleExceptionsInfo')}
              </Typography>
            </Alert>
          </Paper>
        )}

        {/* Fully Available Notice */}
        {provider.monthlyAvailability?.fullyAvailable && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ mt: 3 }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {t('perfectAvailability')}
            </Typography>
            <Typography variant="body2">
              {t('perfectAvailabilityDescription')}
            </Typography>
          </Alert>
        )}

        {/* Not a Best Match Explanation */}
        {!provider.bestMatch && provider.monthlyAvailability?.fullyAvailable === false && (
          <Alert 
            severity="warning"
            sx={{ mt: 3 }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {t('whyNotBestMatch')}
            </Typography>
            <Typography variant="body2">
              {t('whyNotBestMatchDescription')}
            </Typography>
          </Alert>
        )}
      </Box>
    </Drawer>
  );
};

export default ProviderAvailabilityDrawer;