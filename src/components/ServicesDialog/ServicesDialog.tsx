/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Dialog, DialogContent, IconButton, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DialogHeader } from '../ProviderDetails/CookServicesDialog.styles';
import BookingDialog from '../BookingDialog/BookingDialog';
import CookServicesDialog from '../ProviderDetails/CookServicesDialog';
import MaidServiceDialog from '../ProviderDetails/MaidServiceDialog';
import NannyServicesDialog from '../ProviderDetails/NannyServicesDialog';
import { Dayjs } from 'dayjs';
import { useDispatch } from 'react-redux';
import { add as addBooking } from "../../features/bookingType/bookingTypeSlice";

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

interface ServicesDialogProps {
  open: boolean;
  onClose: () => void;
  onServiceSelect?: (serviceType: string) => void;
  sendDataToParent?: (data: string, type?: string) => void;
}

const ServicesDialog: React.FC<ServicesDialogProps> = ({
  open,
  onClose,
  onServiceSelect,
  sendDataToParent
}) => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:600px)");

  // Booking states
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'COOK' | 'MAID' | 'NANNY' | ''>('');
  const [selectedService, setSelectedService] = useState('');

  const [selectedOption, setSelectedOption] = useState("Date");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  const [openServiceDialog, setOpenServiceDialog] = useState(false);

  const serviceOptions: ServiceOption[] = [
    {
      id: 'home-cook',
      title: 'Home Cook',
      description: 'Skilled and hygienic cooks who specialize in home-style meals.',
      icon: '👩‍🍳',
      color: 'text-green-600',
      gradient: 'from-green-50 to-green-100'
    },
    {
      id: 'cleaning-help',
      title: 'Cleaning Help',
      description: 'Reliable maids for daily, deep, or special occasion cleaning.',
      icon: '🧹',
      color: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100'
    },
    {
      id: 'caregiver',
      title: 'Caregiver',
      description: 'Trained support for children, seniors, or patients at home.',
      icon: '❤️',
      color: 'text-red-600',
      gradient: 'from-red-50 to-red-100'
    },
  ];

  const handleServiceClick = (serviceId: string) => {
    let serviceType: 'COOK' | 'MAID' | 'NANNY' = 'COOK';
    let serviceName = '';

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

    setSelectedType(serviceType);
    setSelectedService(serviceName);

    onClose();
    setBookingDialogOpen(true);

    if (onServiceSelect) {
      onServiceSelect(serviceId);
    }
  };

  const handleBookingSave = () => {
    let timeRange = "";
    let timeSlot = "";

    if (selectedOption === "Date") {
      timeRange = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
      timeSlot = timeRange;
    } else if (selectedOption === "Short term") {
      timeRange = startTime?.format("HH:mm") || "";
      timeSlot = `${startTime?.format("HH:mm") || ""}-${endTime?.format("HH:mm") || ""}`;
    } else {
      timeRange = startTime?.format("HH:mm") || "";
      timeSlot = startTime?.format("HH:mm") || "";
    }

    const booking = {
      startDate: startDate ? startDate.split("T")[0] : "",
      endDate: endDate ? endDate.split("T")[0] : startDate ? startDate.split("T")[0] : "",
      timeRange,
      bookingPreference: selectedOption,
      housekeepingRole: selectedType,
      startTime: startTime?.format("HH:mm") || "",
      endTime: endTime?.format("HH:mm") || "",
      timeSlot
    };

    dispatch(addBooking(booking));
    setBookingDialogOpen(false);

    if (selectedOption === "Date") {
      setOpenServiceDialog(true);
    } else if (sendDataToParent) {
      sendDataToParent('DETAILS');
    }
  };

  const handleServiceDialogClose = () => {
    setOpenServiceDialog(false);
    if (sendDataToParent) {
      sendDataToParent('DETAILS');
    }
  };

  return (
    <>
      {/* Services Dialog */}
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogHeader>
          <div className="flex items-center justify-between w-full relative">
            <p className="text-muted-foreground mt-2">Select Your Service</p>

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
          </div>
        </DialogHeader>

        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-6 text-center" style={{ color: 'rgb(14, 48, 92)' }}>
              All Services
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceOptions.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer hover:border-primary/50"
                  onClick={() => handleServiceClick(service.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{service.icon}</div>
                    <div>
                      <h5 className="font-medium">{service.title}</h5>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        onSave={handleBookingSave}
        selectedOption={selectedOption}
        onOptionChange={setSelectedOption}
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
      />

      {/* Service-Specific Dialogs */}
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
