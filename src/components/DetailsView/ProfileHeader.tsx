import React from "react";
import { Box, Typography, Badge, Tooltip, Tabs, Tab, Avatar } from "@mui/material";
import { Stack, styled, useMediaQuery, useTheme } from "@mui/system";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useSelector } from "react-redux";
import { RootState } from "../../store/userStore";

type UserState = {
  value?: {
    role?: string;
    serviceProviderDetails?: any;
  } | null;
};

const StyledProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  backgroundColor: '#ffffff',
  color: '#333',
  borderRadius: '10px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
  marginBottom: '20px',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
  },
}));
const ProfileInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '12px',
  [theme.breakpoints.up('sm')]: {
    marginBottom: 0,
  },
}));

interface ProfileHeaderProps {
  selectedTab: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  bookingsCount: number;
  confirmedCount: number;
  pendingCount: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  selectedTab,
  handleTabChange,
  bookingsCount,
  confirmedCount,
  pendingCount
}) => { 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.user as UserState);
  const firstName = user?.value?.serviceProviderDetails?.firstName;
  const lastName = user?.value?.serviceProviderDetails?.lastName;

    return (
    <StyledProfileHeader>
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar sx={{ 
          width: isMobile ? 40 : 48, 
          height: isMobile ? 40 : 48, 
          bgcolor: '#0056b3', 
          color: 'white',
          marginRight: '8px' // Added to bring name closer
        }}>
          <AccountCircleIcon fontSize={isMobile ? "medium" : "large"} />
        </Avatar>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}> {/* Reduced gap */}
          <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ 
            fontWeight: 'bold',
            marginRight: '12px' // Added space between name and icons
          }}>
            {`${firstName} ${lastName}`}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}> {/* Reduced gap */}
            <Tooltip title="Total Bookings">
              <Badge badgeContent={bookingsCount} color="primary" sx={{
                '& .MuiBadge-badge': {
                  fontSize: isMobile ? '0.6rem' : '0.75rem',
                  height: isMobile ? 16 : 18, // Smaller badges
                  minWidth: isMobile ? 16 : 18,
                }
              }}>
                <EventIcon fontSize={isMobile ? "small" : "medium"} sx={{ 
                  color: '#1976d2',
                  fontSize: isMobile ? '1rem' : '1.25rem' // Smaller icons
                }} />
              </Badge>
            </Tooltip>

            <Tooltip title="Confirmed Bookings">
              <Badge badgeContent={confirmedCount} color="primary" sx={{
                '& .MuiBadge-badge': {
                  fontSize: isMobile ? '0.6rem' : '0.75rem',
                  height: isMobile ? 16 : 18,
                  minWidth: isMobile ? 16 : 18,
                }
              }}>
                <CheckCircleIcon fontSize={isMobile ? "small" : "medium"} sx={{ 
                  color: '#388e3c',
                  fontSize: isMobile ? '1rem' : '1.25rem'
                }} />
              </Badge>
            </Tooltip>

            <Tooltip title="Pending Bookings">
              <Badge badgeContent={pendingCount} color="secondary" sx={{
                '& .MuiBadge-badge': {
                  fontSize: isMobile ? '0.6rem' : '0.75rem',
                  height: isMobile ? 16 : 18,
                  minWidth: isMobile ? 16 : 18,
                }
              }}>
                <WarningIcon fontSize={isMobile ? "small" : "medium"} sx={{ 
                  color: '#f57c00',
                  fontSize: isMobile ? '1rem' : '1.25rem'
                }} />
              </Badge>
            </Tooltip>
          </Box>
        </Box>
      </Stack>

      <Box sx={{ 
        width: '100%',
        overflowX: 'auto',
        marginTop: isMobile ? '8px' : 0,
        '& .MuiTabs-scroller': {
          overflow: 'visible !important',
        }
      }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange} 
          aria-label="service recap tabs"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            minHeight: 'auto',
            '& .MuiTab-root': {
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              padding: isMobile ? '6px 8px' : '8px 12px',
              minHeight: 'auto',
              minWidth: 'auto',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }
          }}
        >
          <Tab label="Profile" />
          <Tab label="Service Recap" />
          <Tab label="Attendance" />
          <Tab label="Earnings" />
        </Tabs>
      </Box>
    </StyledProfileHeader>
  );
};

export default ProfileHeader;