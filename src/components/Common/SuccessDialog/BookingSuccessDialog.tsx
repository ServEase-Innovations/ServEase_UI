/* eslint-disable */
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  keyframes,
  styled
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CelebrationIcon from '@mui/icons-material/Celebration';
import Confetti from 'react-confetti';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const countdown = keyframes`
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
`;

// Styled components with compact design
const SuccessDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #0a2a66 0%, #575aff 100%)',
    overflow: 'visible',
    animation: `${fadeIn} 0.4s ease-out`,
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    maxWidth: '420px',
    width: '90vw',
    margin: '20px',
  },
}));

const DialogContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  minHeight: 'auto',
}));

const SuccessIcon = styled(CheckCircleIcon)(({ theme }) => ({
  fontSize: '60px',
  color: '#4CAF50',
  background: 'white',
  borderRadius: '50%',
  padding: theme.spacing(1),
  animation: `${bounce} 0.8s ease-in-out`,
  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
  marginBottom: theme.spacing(1.5),
}));

const Celebration = styled(CelebrationIcon)(({ theme }) => ({
  position: 'absolute',
  fontSize: '24px',
  opacity: 0.7,
  animation: `${pulse} 2s infinite`,
  
  '&:nth-of-type(1)': {
    top: '12px',
    left: '12px',
    color: '#FFD700',
  },
  '&:nth-of-type(2)': {
    top: '12px',
    right: '12px',
    color: '#FF6B6B',
    animationDelay: '0.3s',
  },
  '&:nth-of-type(3)': {
    bottom: '12px',
    left: '12px',
    color: '#4ECDC4',
    animationDelay: '0.6s',
  },
  '&:nth-of-type(4)': {
    bottom: '12px',
    right: '12px',
    color: '#FFA500',
    animationDelay: '0.9s',
  },
}));

const SuccessTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  background: 'linear-gradient(45deg, #FFFFFF, #F8F9FA)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  animation: `${fadeIn} 0.6s ease-out 0.2s both`,
}));

const SuccessMessage = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  marginBottom: theme.spacing(2),
  opacity: 0.95,
  animation: `${fadeIn} 0.6s ease-out 0.3s both`,
  fontWeight: 500,
  lineHeight: 1.4,
}));

const DetailBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  margin: theme.spacing(1.5, 0),
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  animation: `${fadeIn} 0.6s ease-out 0.4s both`,
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  
  '&:last-child': {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottom: 'none',
  },
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  opacity: 0.9,
  fontWeight: 500,
  textAlign: 'left',
  flex: 1,
}));

const DetailValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: '#FFFFFF',
  textAlign: 'right',
  flex: 1,
}));

const AmountValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: '#FFD700',
  textShadow: '0 1px 3px rgba(255, 215, 0, 0.3)',
}));

const CountdownBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: '4px',
  background: 'linear-gradient(90deg, #FFD700, #FFA500)',
  animation: `${countdown} 6.5s linear forwards`,
  borderRadius: '0 0 16px 16px',
}));

const RedirectMessage = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  opacity: 0.8,
  animation: `${fadeIn} 0.6s ease-out 0.6s both`,
  marginTop: theme.spacing(1),
  fontStyle: 'italic',
}));

const ContinueButton = styled('button')(({ theme }) => ({
  background: 'linear-gradient(45deg, #FFFFFF, #F8F9FA)',
  border: 'none',
  borderRadius: '25px',
  padding: theme.spacing(1, 3),
  color: '#667eea',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: theme.spacing(1.5),
  transition: 'all 0.3s ease',
  animation: `${fadeIn} 0.6s ease-out 0.5s both`,
  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.15)',
  width: '100%',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(255, 255, 255, 0.25)',
    background: 'linear-gradient(45deg, #F8F9FA, #FFFFFF)',
  },
  
  '&:active': {
    transform: 'translateY(0)',
  },
}));

interface BookingSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  bookingDetails?: {
    providerName?: string;
    serviceType?: string;
    totalAmount?: number;
    bookingDate?: string;
    persons?: number;
  };
  message?: string;
  onRedirectToBookings?: () => void;
  onNavigateToBookings?: () => void; // Add this new prop for navigation
}

const BookingSuccessDialog: React.FC<BookingSuccessDialogProps> = ({
  open,
  onClose,
  bookingDetails,
  message = "Payment verified and completed successfully",
  onRedirectToBookings,
  onNavigateToBookings // This will handle the navigation to bookings page
}) => {
  const [showConfetti, setShowConfetti] = React.useState(false);

  useEffect(() => {
    if (open) {
      // Show confetti for 6-7 seconds
      setShowConfetti(true);
      
      // Set timer to hide confetti after 6.5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 6500);

      // Set timer to close dialog and redirect after 6.5 seconds
      const closeTimer = setTimeout(() => {
        handleAutoClose();
      }, 6500);

      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [open]);

  const handleAutoClose = () => {
    // First navigate to bookings, then close dialog
    if (onNavigateToBookings) {
      onNavigateToBookings();
    } else if (onRedirectToBookings) {
      onRedirectToBookings(); // Fallback to old prop
    }
    onClose();
  };

  const handleViewBookings = () => {
    setShowConfetti(false);
    
    // Navigate to bookings page
    if (onNavigateToBookings) {
      onNavigateToBookings();
    } else if (onRedirectToBookings) {
      onRedirectToBookings(); // Fallback to old prop
    }
    
    // Close the dialog
    onClose();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };
  console.log("bookingDetails",bookingDetails);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#667eea', '#764ba2', '#FFD700', '#4CAF50', '#FF6B6B', '#4ECDC4']}
        />
      )}
      
      <SuccessDialog
        open={open}
        onClose={handleViewBookings} // Use the new handler for close
        maxWidth="sm"
        fullWidth
      >
        <DialogContainer>
          {/* Countdown Bar */}
          <CountdownBar />
          
          {/* Celebration Icons */}
          <Celebration />
          <Celebration />
          <Celebration />
          <Celebration />
          
          {/* Success Icon */}
          <SuccessIcon />
          
          {/* Title */}
          <SuccessTitle variant="h5">
            Booking Confirmed! 🎉
          </SuccessTitle>
          
          {/* Message */}
          <SuccessMessage variant="body2">
            {message}
          </SuccessMessage>
          
          {/* Booking Details */}
          {bookingDetails && (
            <DetailBox>
              <DetailItem>
                <DetailLabel variant="body2">
                  Service Provider:
                </DetailLabel>
                <DetailValue variant="body2">
                  {bookingDetails.providerName || 'N/A'}
                </DetailValue>
              </DetailItem>
              
              <DetailItem>
                <DetailLabel variant="body2">
                  Service Type:
                </DetailLabel>
                <DetailValue variant="body2">
                  {bookingDetails.serviceType}
                </DetailValue>
              </DetailItem>
              
              <DetailItem>
                <DetailLabel variant="body2">
                  Persons:
                </DetailLabel>
                <DetailValue variant="body2">
                  {bookingDetails.persons}
                </DetailValue>
              </DetailItem>
              
              {bookingDetails.bookingDate && (
                <DetailItem>
                  <DetailLabel variant="body2">
                    Booking Date:
                  </DetailLabel>
                  <DetailValue variant="body2">
                    {formatDate(bookingDetails.bookingDate)}
                  </DetailValue>
                </DetailItem>
              )}
              
              <DetailItem>
                <DetailLabel variant="body2">
                  Total Amount:
                </DetailLabel>
                <AmountValue variant="body2">
                  ₹{bookingDetails.totalAmount?.toFixed(2)}
                </AmountValue>
              </DetailItem>
            </DetailBox>
          )}
          
          {/* Email Note */}
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem', mt: 1 }}>
            You will receive a confirmation email shortly
          </Typography>
          
          {/* Redirect Message */}
          <RedirectMessage variant="body2">
            Redirecting to bookings page in a few seconds...
          </RedirectMessage>
          
          {/* Manual Close Button */}
          <ContinueButton onClick={handleViewBookings}>
            View My Bookings
          </ContinueButton>
        </DialogContainer>
      </SuccessDialog>
    </>
  );
};

export default BookingSuccessDialog;