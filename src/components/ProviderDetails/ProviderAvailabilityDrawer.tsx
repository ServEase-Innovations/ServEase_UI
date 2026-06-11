/* eslint-disable */
import { IconButton } from "src/components/Button/icon-button";
import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Collapse,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import moment from "moment";
import { ServiceProviderDTO } from "../../types/ProviderDetailsType";
import { useLanguage } from "src/context/LanguageContext";

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: "linear-gradient(135deg, #0369a1 0%, #0f172a 55%, #0f172a 100%)",
  color: "#f8fafc",
}));

const AccordionHeader = styled(Stack)(({ theme }) => ({
  cursor: "pointer",
  padding: theme.spacing(1.25, 1.5),
  borderRadius: 10,
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
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
  const { t } = useLanguage();
  const [previousBookingExpanded, setPreviousBookingExpanded] = useState(false);
  const [scheduleExceptionsExpanded, setScheduleExceptionsExpanded] = useState(false);

  if (!provider) return null;

  const summary = provider.monthlyAvailability?.summary;
  const windowDays = summary?.totalDays ?? 0;
  const daysAtPreferred = summary?.daysAtPreferredTime ?? 0;
  const daysDifferent = summary?.daysWithDifferentTime ?? 0;
  const daysUnavailable = summary?.unavailableDays ?? 0;
  const bookableDays = daysAtPreferred + daysDifferent;
  const progressPct =
    windowDays > 0 ? Math.min(100, Math.round((daysAtPreferred / windowDays) * 100)) : 0;

  const formatTime = (timeString: string) =>
    moment(timeString, "HH:mm").format("hh:mm A");

  const formatDate = (dateString: string) =>
    moment(dateString).format("MMMM D, YYYY");

  const formatDateTime = (dateString: string) =>
    moment(dateString).format("MMM D, YYYY • hh:mm A");

  const isFullyAvailable = provider.monthlyAvailability?.fullyAvailable === true;

  const getAvailabilityStatus = () => {
    if (!provider.monthlyAvailability) return t("unknown");
    if (isFullyAvailable) return t("fullyAvailable");
    if (bookableDays > 0) return t("partiallyAvailable");
    return t("unknown");
  };

  const getAvailabilityChipColor = (): "success" | "warning" | "default" => {
    if (isFullyAvailable) return "success";
    if (bookableDays > 0) return "warning";
    return "default";
  };

  const getInsightAlert = () => {
    if (provider.bestMatch) {
      return {
        severity: "success" as const,
        icon: <LocalFireDepartmentIcon />,
        title: t("bestMatchProvider"),
        body: t("bestMatchDescription"),
      };
    }
    if (isFullyAvailable) {
      return {
        severity: "success" as const,
        icon: <CheckCircleIcon />,
        title: t("availabilityStrongMatch"),
        body: t("perfectAvailabilityDescription"),
      };
    }
    return {
      severity: "info" as const,
      icon: <InfoIcon />,
      title: t("goodMatch"),
      body: t("partialAvailabilityMessage"),
    };
  };

  const insight = getInsightAlert();

  const getBookingTypeLabel = (bookingType: string) => {
    switch (bookingType) {
      case "MONTHLY":
        return t("monthlyBooking");
      case "WEEKLY":
        return t("weeklyBooking");
      case "DAILY":
        return t("dailyBooking");
      default:
        return bookingType;
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case "COOK":
        return t("cook");
      case "MAID":
        return t("maid");
      case "NANNY":
        return t("nanny");
      default:
        return serviceType;
    }
  };

  const getEngagementStatusLabel = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return t("assigned");
      case "COMPLETED":
        return t("completed");
      case "CANCELLED":
        return t("cancelled");
      default:
        return status;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 440, md: 520 },
          maxWidth: "100vw",
        },
      }}
    >
      <DrawerHeader>
        <Stack spacing={1} flex={1} minWidth={0}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "inherit" }}>
            {t("availabilityDetails")}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(248,250,252,0.85)" }} noWrap>
            {provider.firstName} {provider.lastName}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {provider.bestMatch && (
              <Chip
                icon={<LocalFireDepartmentIcon sx={{ color: "#f59e0b !important" }} />}
                label={t("bestMatch")}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: "rgba(245,158,11,0.15)",
                  color: "#fde68a",
                  border: "1px solid rgba(245,158,11,0.35)",
                }}
              />
            )}
            {provider.previouslyBooked && (
              <Chip
                icon={<HistoryIcon sx={{ color: "#7dd3fc !important" }} />}
                label={t("previouslyBooked")}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: "rgba(14,165,233,0.15)",
                  color: "#bae6fd",
                  border: "1px solid rgba(14,165,233,0.35)",
                }}
              />
            )}
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="large" sx={{ color: "#f8fafc", mt: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      <Box sx={{ p: { xs: 2, sm: 3 }, overflow: "auto", height: "calc(100vh - 120px)" }}>
        <Alert severity={insight.severity} icon={insight.icon} sx={{ mb: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {insight.title}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {insight.body}
          </Typography>
        </Alert>

        {provider.previouslyBooked && provider.previousBookingDetails && (
          <Paper
            elevation={0}
            sx={{ mb: 2.5, border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
          >
            <AccordionHeader
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              onClick={() => setPreviousBookingExpanded((v) => !v)}
              role="button"
              aria-expanded={previousBookingExpanded}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                <HistoryIcon color="info" fontSize="small" />
                <Box minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t("previousBooking")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {previousBookingExpanded ? t("hideDetails") : t("showDetails")}
                  </Typography>
                </Box>
              </Stack>
              {previousBookingExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </AccordionHeader>

            <Collapse in={previousBookingExpanded}>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <DetailRow
                    icon={<ReceiptIcon fontSize="small" />}
                    label={t("bookingId")}
                    value={`#${provider.previousBookingDetails.engagementId}`}
                  />
                  <DetailRow
                    icon={<AccessTimeIcon fontSize="small" />}
                    label={t("bookingType")}
                    value={
                      <Chip
                        label={getBookingTypeLabel(provider.previousBookingDetails.bookingType)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    }
                  />
                  <DetailRow
                    icon={<HistoryIcon fontSize="small" />}
                    label={t("serviceType")}
                    value={
                      <Chip
                        label={getServiceTypeLabel(provider.previousBookingDetails.serviceType)}
                        size="small"
                        variant="outlined"
                      />
                    }
                  />
                  <DetailRow
                    icon={<CalendarTodayIcon fontSize="small" />}
                    label={t("duration")}
                    value={`${formatDate(provider.previousBookingDetails.startDate)} – ${formatDate(provider.previousBookingDetails.endDate)}`}
                  />
                  <DetailRow
                    icon={<InfoIcon fontSize="small" />}
                    label={t("status")}
                    value={
                      <Chip
                        label={getEngagementStatusLabel(
                          provider.previousBookingDetails.engagementStatus
                        )}
                        size="small"
                        color={
                          provider.previousBookingDetails.engagementStatus === "ASSIGNED"
                            ? "success"
                            : "default"
                        }
                      />
                    }
                  />
                  <DetailRow
                    icon={<ReceiptIcon fontSize="small" />}
                    label={t("amount")}
                    value={
                      <Typography component="span" fontWeight={700} color="success.main">
                        ₹{provider.previousBookingDetails.baseAmount}
                      </Typography>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" textAlign="right">
                    {t("bookedOn")}: {formatDateTime(provider.previousBookingDetails.createdAt)}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {t("previousBookingMessage")}
                </Typography>
              </Box>
            </Collapse>
          </Paper>
        )}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <CalendarMonthIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={700}>
                {t("monthlyAvailability")}
              </Typography>
            </Stack>
            <Chip
              label={getAvailabilityStatus()}
              color={getAvailabilityChipColor()}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {t("preferredWorkingTime")}
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "grey.50",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <AccessTimeIcon color="primary" fontSize="small" />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem" }}>
                {formatTime(provider.monthlyAvailability?.preferredTime || "08:00")}
              </Typography>
              <Chip label={t("daily")} size="small" variant="outlined" />
            </Paper>
          </Box>

          {summary && windowDays > 0 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1}>
                <Typography variant="caption" color="text.secondary">
                  {t("availabilitySummary")}
                </Typography>
                <Typography variant="caption" fontWeight={600} color="text.primary">
                  {t("availabilityProgressLabel", {
                    available: daysAtPreferred,
                    total: windowDays,
                  })}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{
                  height: 8,
                  borderRadius: 99,
                  mb: 2,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 99,
                    bgcolor: isFullyAvailable ? "success.main" : "primary.main",
                  },
                }}
              />

              <Stack spacing={1.25}>
                <StatRow
                  icon={<EventAvailableIcon color="success" fontSize="small" />}
                  label={t("daysAtPreferredTime")}
                  value={`${daysAtPreferred} ${t("days")}`}
                  chipColor="success"
                />
                {daysDifferent > 0 && (
                  <StatRow
                    icon={<AccessTimeIcon color="warning" fontSize="small" />}
                    label={t("daysWithDifferentTime")}
                    value={`${daysDifferent} ${t("days")}`}
                    chipColor="warning"
                  />
                )}
                {daysUnavailable > 0 && (
                  <StatRow
                    icon={<EventBusyIcon color="error" fontSize="small" />}
                    label={t("unavailableDays")}
                    value={`${daysUnavailable} ${t("days")}`}
                    chipColor="error"
                  />
                )}
                <Divider sx={{ my: 0.5 }} />
                <StatRow
                  icon={<CalendarMonthIcon color="primary" fontSize="small" />}
                  label={t("calendarDaysInWindow")}
                  value={`${windowDays} ${t("days")}`}
                  chipColor="primary"
                  filled
                />
              </Stack>
            </Box>
          )}
        </Paper>

        {provider.monthlyAvailability?.exceptions &&
          provider.monthlyAvailability.exceptions.length > 0 && (
            <Paper
              elevation={0}
              sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
            >
              <AccordionHeader
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => setScheduleExceptionsExpanded((v) => !v)}
                role="button"
                aria-expanded={scheduleExceptionsExpanded}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                  <WarningIcon color="warning" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t("scheduleExceptions")}
                  </Typography>
                  <Chip
                    label={`${provider.monthlyAvailability.exceptions.length}`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Stack>
                {scheduleExceptionsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </AccordionHeader>

              <Collapse in={scheduleExceptionsExpanded}>
                <Divider />
                <List disablePadding sx={{ px: 1.5, py: 1 }}>
                  {provider.monthlyAvailability.exceptions.map((exception, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ px: 0, py: 1.25 }}>
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                        <InfoIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {moment(exception.date).format("ddd, MMM D")}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.5} mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {exception.reason === "ON_DEMAND"
                                ? t("availableOnDemand")
                                : t("notAvailableAtPreferredTime")}
                            </Typography>
                            {exception.suggestedTime && (
                              <Typography variant="caption" fontWeight={500}>
                                {t("suggestedTime")}: {formatTime(exception.suggestedTime)}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t("scheduleExceptionsInfo")}
                  </Typography>
                </Box>
              </Collapse>
            </Paper>
          )}

        {!provider.bestMatch && !isFullyAvailable && (
          <Alert severity="warning" sx={{ mt: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {t("whyNotBestMatch")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {t("whyNotBestMatchDescription")}
            </Typography>
          </Alert>
        )}
      </Box>
    </Drawer>
  );
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
        {icon}
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Box sx={{ textAlign: "right" }}>{value}</Box>
    </Stack>
  );
}

function StatRow({
  icon,
  label,
  value,
  chipColor,
  filled = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  chipColor: "success" | "warning" | "error" | "primary";
  filled?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Chip
        label={value}
        size="small"
        color={chipColor}
        variant={filled ? "filled" : "outlined"}
        sx={{ fontWeight: 600 }}
      />
    </Stack>
  );
}

export default ProviderAvailabilityDrawer;
