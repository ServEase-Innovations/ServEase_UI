// ServiceProviderHeader.tsx
import React from "react";
import { Box, Typography, Tabs, Tab, Badge, Tooltip, Avatar, Rating } from "@mui/material";
import { styled } from "@mui/system";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const ProfileHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px',
  backgroundColor: '#ffffff',
  color: '#333',
  borderRadius: '10px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  textAlign: 'center',
  height: '12%',
  marginTop: '65px',
  gap: '9px',
});

interface ServiceProviderHeaderProps {
  firstName?: string;
  lastName?: string;
  bookings: any[];
  selectedTab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const ServiceProviderHeader: React.FC<ServiceProviderHeaderProps> = ({
  firstName,
  lastName,
  bookings,
  selectedTab,
  handleTabChange
}) => {
  return (
    <ProfileHeader>
      {/* Profile Section: Avatar, Name & Icons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Avatar sx={{ width: 60, height: 60, bgcolor: '#0056b3', color: 'white' }}>
          <AccountCircleIcon fontSize="large" />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {`${firstName} ${lastName}`}
        </Typography>

        {/* Icons beside name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tooltip title="Total Bookings">
            <Badge badgeContent={bookings.length} color="primary">
              <EventIcon fontSize="medium" sx={{ color: '#1976d2' }} />
            </Badge>
          </Tooltip>

          <Tooltip title="Confirmed Bookings">
            <Badge badgeContent={bookings.filter((b) => b.status === 'Confirmed').length} color="primary">
              <CheckCircleIcon fontSize="medium" sx={{ color: '#388e3c' }} />
            </Badge>
          </Tooltip>

          <Tooltip title="Pending Bookings">
            <Badge badgeContent={bookings.filter((b) => b.status === 'Pending').length} color="secondary">
              <WarningIcon fontSize="medium" sx={{ color: '#f57c00' }} />
            </Badge>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ marginTop: '20px' }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="service recap tabs" centered>
          <Tab label="Profile" />
          <Tab label="Service Recap" />
          <Tab label="Attendance Calender" />
          <Tab label="Earnings Summary" />
        </Tabs>
      </Box>
      
      {/* Rating */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Rating value={4} precision={0.5} readOnly sx={{ marginRight: '10px' }} />
      </Box>
    </ProfileHeader>
  );
};

export default ServiceProviderHeader;