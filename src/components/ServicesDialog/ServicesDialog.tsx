/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  IconButton, 
  useMediaQuery, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DialogHeader } from '../ProviderDetails/CookServicesDialog.styles';
import BookingDialog from '../BookingDialog/BookingDialog';
import CookServicesDialog from '../ProviderDetails/CookServicesDialog';
import MaidServiceDialog from '../ProviderDetails/MaidServiceDialog';
import NannyServicesDialog from '../ProviderDetails/NannyServicesDialog';
import { Dayjs } from 'dayjs';
import { useDispatch } from 'react-redux';
import { add as addBooking } from "../../features/bookingType/bookingTypeSlice";
import { Button } from '../Button/button';
import { DETAILS } from 'src/Constants/pagesConstants';

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  accentColor: string;
}

export interface ServicesDialogProps {
  open: boolean;
  onClose: () => void;
  onServiceSelect?: (serviceType: string) => void;
  sendDataToParent?: (data: string, type?: string) => void;
  // Add these optional props
  bookingType?: string;
  setBookingType?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ServicesDialog: React.FC<ServicesDialogProps> = ({
  open,
  onClose,
  onServiceSelect,
  sendDataToParent,
  bookingType, // Add this
  setBookingType // Add this
}) => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:600px)");

  // Booking states - matching the Header component
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'COOK' | 'MAID' | 'NANNY' | ''>('');
  const [selectedService, setSelectedService] = useState('');
  
  // Booking dialog states - matching Header component
  const [selectedRadioButtonValue, setSelectedRadioButtonValue] = useState("Date");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);

  const themeColors = {
    headerBg: 'rgb(14, 48, 92)',
    primary: '#2FB3FF',
    textPrimary: 'rgb(14, 48, 92)',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    background: '#FFFFFF'
  };

  const cleaningHelpColors = {
    iconColor: '#2FB3FF',
    bgColor: '#EFF6FF',
    accentColor: '#2FB3FF'
  };

  const serviceOptions: ServiceOption[] = [
    {
      id: 'home-cook',
      title: 'Home Cook',
      description: 'Verified cooks for hygienic, home-style meals',
      icon: '../CookNew.png',
      iconColor: cleaningHelpColors.iconColor,
      bgColor: cleaningHelpColors.bgColor,
      accentColor: cleaningHelpColors.accentColor
    },
    {
      id: 'cleaning-help',
      title: 'Cleaning Help',
      description: 'Trained maids for thorough home cleaning',
      icon: '../MaidNew.png',
      iconColor: cleaningHelpColors.iconColor,
      bgColor: cleaningHelpColors.bgColor,
      accentColor: cleaningHelpColors.accentColor
    },
    {
      id: 'caregiver',
      title: 'Caregiver',
      description: 'Compassionate caregivers for children & elderly',
      icon: '../NannyNew.png',
      iconColor: cleaningHelpColors.iconColor,
      bgColor: cleaningHelpColors.bgColor,
      accentColor: cleaningHelpColors.accentColor
    },
  ];

  // Function to handle service selection - matching Header component's handleServiceClick
  const handleServiceSelect = (serviceId: string) => {
    let serviceType: 'COOK' | 'MAID' | 'NANNY' = 'COOK';
    let serviceName = '';

    // Map service ID to internal types - same mapping as Header
    if (serviceId === 'home-cook') {
      serviceType = 'COOK';
      serviceName = 'Home Cook';
    } else if (serviceId === 'cleaning-help') {
      serviceType = 'MAID';
      serviceName = 'Cleaning Help';
    } else if (serviceId === 'caregiver') {
      serviceType = 'NANNY';
      serviceName = 'Caregiver';
    }

    // Set states - same as Header
    setSelectedType(serviceType);
    setSelectedService(serviceName);

    // Close services dialog and open booking dialog - same flow as Header
    onClose();
    setBookingDialogOpen(true);

    if (onServiceSelect) {
      onServiceSelect(serviceId);
    }
  };

  const handleBookingSave = () => {
    console.log("=== handleBookingSave called ===");
    console.log("selectedRadioButtonValue:", selectedRadioButtonValue);
    console.log("selectedType:", selectedType);
    console.log("sendDataToParent exists:", !!sendDataToParent);
    
    let timeRange = "";
    let timeSlot = "";

    if (selectedRadioButtonValue === "Date") {
      timeRange = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
      timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    } else if (selectedRadioButtonValue === "Short term") {
      timeRange = startTime?.format("HH:mm") || "";
      timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    } else {
      timeRange = startTime?.format("HH:mm") || "";
      timeSlot = startTime?.format("HH:mm") || "";
    }

    const booking = {
      startDate: startDate ? startDate.split("T")[0] : "",
      endDate: endDate
        ? endDate.split("T")[0]
        : startDate
        ? startDate.split("T")[0]
        : "",
      timeRange: timeRange,
      bookingPreference: selectedRadioButtonValue,
      housekeepingRole: selectedType,
      startTime: startTime?.format("HH:mm") || "",
      endTime: endTime?.format("HH:mm") || "",
      timeSlot: timeSlot
    };

    console.log("Booking details from ServicesDialog:", booking);

    // Dispatch booking to Redux
    dispatch(addBooking(booking));
    
    // Close booking dialog
    setBookingDialogOpen(false);

    // Handle navigation based on booking type
    if (selectedRadioButtonValue === "Date") {
      console.log("Opening service-specific dialog for Date booking");
      setOpenServiceDialog(true);
    } else {
      console.log(`Non-Date booking (${selectedRadioButtonValue}), calling sendDataToParent with DETAILS`);
      if (sendDataToParent) {
        sendDataToParent(DETAILS);
      } else {
        console.error("ERROR: sendDataToParent is undefined!");
      }
    }
  };

  const handleServiceDialogClose = () => {
    console.log("handleServiceDialogClose called");
    setOpenServiceDialog(false);
    
    // Always navigate to DETAILS after service dialog closes
    // This handles both successful completion and cancellation
    if (sendDataToParent) {
      console.log("Calling sendDataToParent(DETAILS) from handleServiceDialogClose");
      sendDataToParent(DETAILS);
    } else {
      console.error("ERROR: sendDataToParent is undefined in handleServiceDialogClose");
    }
  };

  // Handle booking dialog close - don't navigate here
  const handleBookingDialogClose = () => {
    console.log("Booking dialog closed");
    setBookingDialogOpen(false);
    // Reset states when booking dialog is closed without saving
    setSelectedType('');
    setSelectedRadioButtonValue("Date");
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
  };

  return (
    <>
      {/* Services Dialog */}
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            overflow: 'hidden',
          }
        }}
      >
        <DialogHeader>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%', 
            position: 'relative',
            padding: '16px 24px'
          }}>
            <Typography 
              sx={{ 
                color: 'white',
                opacity: 0.9,
                fontSize: '14px',
                mt: 0.5
              }}
            >
              Select Your Service
            </Typography>

            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 7,
                top: 7,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(47, 179, 255, 0.41)',
                },
                zIndex: 1300,
                width: isMobile ? 32 : 40,
                height: isMobile ? 32 : 40,
              }}
            >
              <CloseIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
            </IconButton>
          </Box>
        </DialogHeader>

        <DialogContent sx={{ 
          padding: { xs: '20px', md: '24px' },
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <Box sx={{ mt: 4 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3
            }}>
              {serviceOptions.map((service) => (
                <Card
                  key={service.id}
                  sx={{
                    borderRadius: '12px',
                    borderLeft: `2px solid ${service.accentColor}`,
                    backgroundColor: `${alpha(service.accentColor, 0.04)}`,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-4px)',
                    }
                  }}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <CardContent sx={{ 
                    padding: '24px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    flexGrow: 1,
                    '&:last-child': { paddingBottom: '16px' }
                  }}>
                    {/* Circular Image Container */}
                    <Box
                      sx={{
                        backgroundColor: '#2FB3FF20',
                        borderRadius: '50%',
                        width: '140px',
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        border: `4px solid ${alpha('#2FB3FF', 0.3)}`,
                        overflow: 'hidden',
                        transition: 'transform 0.3s, border-color 0.3s',
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(47, 179, 255, 0.15)',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          borderColor: alpha('#2FB3FF', 0.6),
                          boxShadow: '0 6px 20px rgba(47, 179, 255, 0.25)',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <img
                          src={service.icon}
                          alt={service.title}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            minWidth: '100%',
                            minHeight: '100%',
                            objectFit: 'cover',
                            maxWidth: '100% !important',
                            filter: 'brightness(1.05) contrast(1.05)',
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div style="
                                width: 100%;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: linear-gradient(135deg, #2FB3FF, #0984e3);
                                color: white;
                                font-size: 24px;
                                font-weight: bold;
                                border-radius: 50%;
                              ">
                                ${service.title.charAt(0)}
                              </div>
                            `;
                          }}
                        />
                      </Box>
                      
                      {/* Subtle glow effect */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, transparent 30%, rgba(47, 179, 255, 0.1) 100%)',
                          pointerEvents: 'none',
                        }}
                      />
                    </Box>
                    
                    {/* Title and Description */}
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: '16px',
                          color: 'rgba(21, 57, 104, 1)',
                          mb: 1
                        }}
                      >
                        {service.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeColors.textSecondary,
                          fontSize: '13px',
                          lineHeight: 1.5,
                          mb: 2
                        }}
                      >
                        {service.description}
                      </Typography>
                    </Box>

                    {/* Select Service Button */}
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Selected service: ${service.id}`);
                        handleServiceSelect(service.id);
                      }}
                      sx={{
                        mt: 'auto',
                        backgroundColor: service.accentColor,
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        padding: '8px 24px',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: service.accentColor,
                          opacity: 0.9,
                          boxShadow: `0 4px 12px ${alpha(service.accentColor, 0.3)}`,
                        }
                      }}
                    >
                      Select Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog - Using same component as Header */}
      <BookingDialog
        open={bookingDialogOpen}
        onClose={handleBookingDialogClose}
        onSave={handleBookingSave}
        selectedOption={selectedRadioButtonValue}
        onOptionChange={setSelectedRadioButtonValue}
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
      />

      {/* Service-Specific Dialogs - All use the same close handler */}
      {selectedType === "COOK" && (
        <CookServicesDialog
          open={openServiceDialog}
          handleClose={handleServiceDialogClose}
          sendDataToParent={sendDataToParent}
        />
      )}
      {selectedType === "MAID" && (
        <MaidServiceDialog
          open={openServiceDialog}
          handleClose={handleServiceDialogClose}
          sendDataToParent={sendDataToParent}
        />
      )}
      {selectedType === "NANNY" && (
        <NannyServicesDialog
          open={openServiceDialog}
          handleClose={handleServiceDialogClose}
          sendDataToParent={sendDataToParent}
        />
      )}
    </>
  );
};

export default ServicesDialog;