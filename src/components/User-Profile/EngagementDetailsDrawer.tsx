/* eslint-disable */
import React from 'react';
import { X, Calendar, Clock, MapPin, User, CreditCard, Tag, AlertCircle, CheckCircle, XCircle, Download, Printer } from 'lucide-react';
import { Badge } from '../../components/Common/Badge/Badge';
import { Separator } from '../../components/Common/Separator/Separator';
import { BookingTimeline, MonthlyBookingTimeline, DateWiseTimeline, type TimelineData, type MonthlyTimelineData } from '../../components/Common/BookingTimeline';
import { getServiceTitle, getBookingTypeBadge, getStatusBadge } from '../Common/Booking/BookingUtils';
import dayjs from 'dayjs';
import { DialogHeader } from '../ProviderDetails/CookServicesDialog.styles';
import { Button } from '../../components/Button/button';
import {
  BookingService,
  isPaymentCancelledError,
} from 'src/services/bookingService';
import Invoice from '../Invoice/Invoice';
import {
  coalesceStartEpoch,
  formatBookingCreatedAt,
  formatBookingTimeRange,
  toEpochOrNull,
} from 'src/services/bookingEpoch';
import type { EngagementEpochFields } from 'src/services/epochContract';
import paymentInstance from 'src/services/paymentInstance';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface DrawerPayment {
  engagement_id?: number | string;
  base_amount?: number | string;
  platform_fee?: number | string;
  gst?: number | string;
  total_amount?: number | string;
  payment_mode?: string;
  status?: string;
}

interface DrawerBooking extends Partial<EngagementEpochFields> {
  id: number;
  bookingType?: string;
  taskStatus?: string;
  service_type?: string;
  startDate?: string;
  endDate?: string;
  start_time?: string;
  end_time?: string;
  customerName?: string;
  serviceProviderName?: string;
  providerRating?: number;
  bookingDate?: string;
  created_at?: string;
  placed_at_label?: string;
  assignmentStatus?: string;
  leave_days?: number;
  payment?: DrawerPayment;
  modifications?: Array<{ action?: string; date?: string; refund?: number; penalty?: number }>;
  // Timeline recalculation fields
  actual_start_epoch?: number;
  actual_end_epoch?: number;
  duration_minutes?: number;
  is_timeline_recalculated?: boolean;
  early_start_minutes?: number;
  // Today's service info (for MONTHLY/SHORT_TERM)
  today_service?: {
    service_day_id?: number | string;
    status?: string;
    can_start?: boolean;
    can_generate_otp?: boolean;
    can_complete?: boolean;
    otp_active?: boolean;
    // Actual start/end times from service_days table
    actual_start_epoch?: number;
    actual_end_epoch?: number;
  };
}

interface EngagementDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: DrawerBooking | null;
  onPaymentComplete?: () => void | Promise<void>;
}

interface ExtensionSlot {
  hours: number;
  newEndTime: string;
  newEndTimeFormatted: string;
  additionalCost: number;
  totalCost: number;
  pricing?: {
    baseGross: number;
    baseNet: number;
    hourDiscount: number;
    platformFee: number;
    gst: number;
    total: number;
  };
  discounts?: Array<{
    label: string;
    amount: number;
  }>;
}

interface ExtensionAvailability {
  canExtend: boolean;
  reason?: string;
  currentEndTimeFormatted?: string;
  hourlyRate?: number;
  availableSlots?: ExtensionSlot[];
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMMM D, YYYY');
};

const EngagementDetailsDrawer: React.FC<EngagementDetailsDrawerProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentComplete,
}) => {
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  
  // Extension states
  const [showExtendDialog, setShowExtendDialog] = React.useState(false);
  const [extensionAvailability, setExtensionAvailability] = React.useState<ExtensionAvailability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = React.useState(false);
  const [selectedExtension, setSelectedExtension] = React.useState<ExtensionSlot | null>(null);
  const [isExtending, setIsExtending] = React.useState(false);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error' | 'warning' | 'info'>('success');

  const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (!isOpen || !booking) return null;

  // Extension handlers
  const isProviderAssigned = () => {
    const notAssignedString = 'Not Assigned';
    return !!(
      booking.serviceProviderName &&
      booking.serviceProviderName !== notAssignedString &&
      booking.serviceProviderName.trim() !== '' &&
      booking.serviceProviderName !== 'Not Assigned'
    );
  };

  const canShowExtendButton = () => {
    return (
      booking.bookingType === 'ON_DEMAND' &&
      isProviderAssigned() &&
      ['NOT_STARTED', 'IN_PROGRESS'].includes(booking.taskStatus || '') &&
      booking.payment?.status !== 'PENDING'
    );
  };

  const handleExtendClick = async () => {
    setShowExtendDialog(true);
    await checkExtensionAvailability();
  };

  const checkExtensionAvailability = async () => {
    try {
      setLoadingAvailability(true);
      const response = await paymentInstance.get(
        `/api/v2/engagements/${booking.id}/extension-availability`
      );
      setExtensionAvailability(response.data);
      
      if (!response.data.canExtend) {
        setSnackbarMessage(response.data.reason || 'Booking cannot be extended at this time');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        setShowExtendDialog(false);
      }
    } catch (error: any) {
      console.error('Error checking availability:', error);
      setSnackbarMessage('Unable to check extension availability. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setShowExtendDialog(false);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleExtendBooking = async () => {
    if (!selectedExtension) {
      setSnackbarMessage('Please select an extension option');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    try {
      setIsExtending(true);
      
      // Step 1: Initiate extension and create Razorpay order
      const response = await paymentInstance.post(
        `/api/v2/engagements/${booking.id}/extend`,
        {
          extensionHours: selectedExtension.hours,
          newEndTime: selectedExtension.newEndTime,
          additionalAmount: selectedExtension.additionalCost
        }
      );

      const {
        razorpay_order_id,
        razorpay_key_id,
        amount,
        currency
      } = response.data;

      if (!razorpay_order_id) {
        setSnackbarMessage('Payment order could not be created. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsExtending(false);
        return;
      }

      // Step 2: Load Razorpay script dynamically
      const { loadRazorpayCheckoutScript } = await import('src/utils/loadRazorpayCheckout');
      const RazorpayConstructor = await loadRazorpayCheckoutScript();

      // Step 3: Open Razorpay checkout
      const options = {
        key: razorpay_key_id || 'rzp_test_lTdgjtSRlEwreA',
        amount: amount,
        currency: currency || 'INR',
        order_id: razorpay_order_id,
        name: 'Serveaso',
        description: `Extend booking by ${selectedExtension.hours} hour${selectedExtension.hours > 1 ? 's' : ''}`,
        handler: async function (razorpayResponse: any) {
          try {
            // Step 4: Verify payment
            await paymentInstance.post(`/api/v2/engagements/${booking.id}/extend/verify`, {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });

            setSnackbarMessage('Booking extended successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            
            setShowExtendDialog(false);
            setSelectedExtension(null);
            
            if (onPaymentComplete) await onPaymentComplete();
            setTimeout(() => onClose(), 500);
          } catch (verifyError: any) {
            console.error('Extension payment verification error:', verifyError);
            const message = verifyError?.response?.data?.error || 'Payment verification failed';
            setSnackbarMessage(message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
          } finally {
            setIsExtending(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsExtending(false);
          }
        },
        prefill: {
          name: booking.customerName || '',
          contact: '9999999999',
          email: '',
        },
        theme: {
          color: '#3b82f6', // blue-600
        },
      };

      const razorpay = new RazorpayConstructor(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Extension initiation error:', error);
      const message = error?.response?.data?.error || error?.message || 'Failed to initiate extension';
      setSnackbarMessage(message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsExtending(false);
    }
  };

  if (!isOpen || !booking) return null;

  const startEpoch = coalesceStartEpoch(booking?.start_epoch, booking?.startDate);
  const endEpoch = toEpochOrNull(booking?.end_epoch);
  const displayStartDate =
    startEpoch != null
      ? dayjs.unix(startEpoch).format('MMMM D, YYYY')
      : booking?.startDate
        ? formatDate(booking.startDate)
        : '—';
  const displayEndDate =
    endEpoch != null
      ? dayjs.unix(endEpoch).format('MMMM D, YYYY')
      : booking?.endDate
        ? formatDate(booking.endDate)
        : displayStartDate;
  const displayTimeRange =
    formatBookingTimeRange({
      start_epoch: booking?.start_epoch,
      end_epoch: booking?.end_epoch,
      start_time: booking?.start_time,
      end_time: booking?.end_time,
    }) || '—';

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  /**
   * Build timeline data for BookingTimeline component (ON_DEMAND)
   */
  const buildTimelineData = (): TimelineData => {
    return {
      scheduled: {
        start_time: booking.start_time,
        end_time: booking.end_time,
        start_epoch: booking.start_epoch,
        end_epoch: booking.end_epoch,
      },
      actual: booking.actual_start_epoch ? {
        start_epoch: booking.actual_start_epoch,
        end_epoch: booking.actual_end_epoch,
      } : undefined,
      duration_minutes: booking.duration_minutes,
      is_recalculated: booking.is_timeline_recalculated,
      early_start_minutes: booking.early_start_minutes,
    };
  };

  /**
   * Build timeline data for MonthlyBookingTimeline component (MONTHLY/SHORT_TERM)
   */
  const buildMonthlyTimelineData = (): MonthlyTimelineData => {
    // Get today's service day info if available
    const todayService = booking.today_service;
    
    // Calculate early start minutes if we have actual start time
    let earlyStartMinutes = 0;
    if (todayService?.actual_start_epoch && booking.start_epoch) {
      earlyStartMinutes = Math.round((booking.start_epoch - todayService.actual_start_epoch) / 60);
    }
    
    return {
      booking_period: {
        start_date: booking.startDate || '',
        end_date: booking.endDate || '',
        total_days: booking.leave_days || 0, // This might need adjustment based on actual field
      },
      daily_schedule: {
        scheduled_start_time: booking.start_time || '',
        scheduled_end_time: booking.end_time || '',
        duration_minutes: booking.duration_minutes || 60,
      },
      current_service: todayService ? {
        date: dayjs().format('YYYY-MM-DD'), // Today's date
        scheduled_start_time: booking.start_time || '',
        scheduled_end_time: booking.end_time || '',
        actual_start_time: todayService.actual_start_epoch 
          ? dayjs.unix(todayService.actual_start_epoch).format('HH:mm')
          : undefined,
        actual_start_epoch: todayService.actual_start_epoch,
        actual_end_time: todayService.actual_end_epoch 
          ? dayjs.unix(todayService.actual_end_epoch).format('HH:mm')
          : undefined,
        actual_end_epoch: todayService.actual_end_epoch,
        status: todayService.status || 'SCHEDULED',
        early_start_minutes: earlyStartMinutes > 0 ? earlyStartMinutes : undefined,
      } : undefined,
    };
  };

  const handleCompletePayment = async () => {
    const engagementId = booking.payment?.engagement_id ?? booking.id;
    if (!engagementId) {
      alert("Cannot resume payment: booking id missing.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      await BookingService.payPendingEngagement(engagementId, {
        name: booking.customerName,
      });
      if (onPaymentComplete) {
        await onPaymentComplete();
      }
      onClose();
    } catch (err: unknown) {
      if (isPaymentCancelledError(err)) {
        return;
      }
      console.error("Complete payment error:", err);
      const ax = err as { response?: { data?: { error?: string } }; message?: string };
      alert(
        ax.response?.data?.error ||
          ax.message ||
          "Unable to resume payment. Please try again."
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <DialogHeader className="flex items-center justify-between bg-gray-900 px-4 py-3">
          <h2 className="text-xl font-semibold text-white">
            Booking Details
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-gray-800 absolute top-3 right-3"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking ID and Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-lg font-medium text-gray-900">#{booking.id}</p>
            </div>
            <div className="flex gap-2">
              {getBookingTypeBadge(booking.bookingType || '')}
              {getStatusBadge(booking.taskStatus || '')}
            </div>
          </div>

          {/* Service Type */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <span className="text-2xl">
                  {booking.service_type === 'maid' ? '🧹' : 
                   booking.service_type === 'cook' ? '👩‍🍳' : 
                   booking.service_type === 'nanny' ? '❤️' : '🧹'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Type</p>
                <p className="text-xl font-bold text-gray-900">{getServiceTitle(booking.service_type || '')}</p>
              </div>
            </div>
          </div>

          {/* Schedule Information with Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Schedule
            </h3>
            
            {/* For MONTHLY and SHORT_TERM: Show date range */}
            {(booking.bookingType === 'MONTHLY' || booking.bookingType === 'SHORT_TERM') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium">{displayStartDate}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">End Date</p>
                  <p className="font-medium">{displayEndDate}</p>
                </div>
              </div>
            )}

            {/* For ON_DEMAND: Show single date + Actual Times Prominently */}
            {booking.bookingType === 'ON_DEMAND' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Service Date</p>
                    <p className="font-medium">{displayStartDate}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Booking Type</p>
                    <p className="font-medium">On Demand</p>
                  </div>
                </div>

                {/* Show Actual Times Prominently for ON_DEMAND */}
                {booking.actual_start_epoch && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-sm font-semibold text-green-800">
                        Actual Service Times
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-green-600 mb-1">Started At</p>
                        <p className="text-lg font-bold text-green-800">
                          {dayjs.unix(booking.actual_start_epoch).format('h:mm A')}
                        </p>
                      </div>
                      {booking.actual_end_epoch && (
                        <div>
                          <p className="text-xs text-green-600 mb-1">
                            {booking.taskStatus === 'COMPLETED' ? 'Ended At' : 'Will End At'}
                          </p>
                          <p className="text-lg font-bold text-green-800">
                            {dayjs.unix(booking.actual_end_epoch).format('h:mm A')}
                          </p>
                        </div>
                      )}
                    </div>
                    {booking.early_start_minutes && booking.early_start_minutes > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-green-700">
                          ✓ Service started {booking.early_start_minutes} minutes early
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Render appropriate timeline component based on booking type */}
            {booking.bookingType === 'ON_DEMAND' ? (
              <BookingTimeline 
                timeline={buildTimelineData()} 
                status={booking.taskStatus}
                showEarlyStartBadge={true}
              />
            ) : (
              <>
                <MonthlyBookingTimeline
                  timeline={buildMonthlyTimelineData()}
                  bookingType={booking.bookingType || 'MONTHLY'}
                />
                
                {/* Date-wise timeline for MONTHLY/SHORT_TERM bookings */}
                <DateWiseTimeline
                  engagementId={booking.id}
                  bookingType={booking.bookingType || 'MONTHLY'}
                />
              </>
            )}
          </div>

          {/* Provider Information */}
          {booking.serviceProviderName && booking.serviceProviderName !== 'Not Assigned' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                Service Provider
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{booking.serviceProviderName}</p>
                  </div>
                  {(booking.providerRating ?? 0) > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      ⭐ {(booking.providerRating ?? 0).toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {booking.payment && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                Payment Details
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Amount</span>
                  <span className="font-medium">₹{booking.payment.base_amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">₹{booking.payment.platform_fee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GST</span>
                  <span className="font-medium">₹{booking.payment.gst}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{booking.payment.total_amount}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Payment Status</span>
                  <Badge className={getPaymentStatusColor(booking.payment.status || 'UNKNOWN')}>
                    {booking.payment.status || 'UNKNOWN'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Mode</span>
                  <span className="font-medium capitalize">{booking.payment.payment_mode}</span>
                </div>

                {/* Complete Payment Button - Show only for PENDING status */}
                {booking.payment.status === 'PENDING' && booking.taskStatus !== 'CANCELLED' && (
                  <div className="mt-4">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleCompletePayment}
                      disabled={isProcessingPayment}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {isProcessingPayment ? 'Processing...' : 'Complete Payment Now'}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Complete payment to confirm your booking
                    </p>
                  </div>
                )}

                {/* Invoice Component - Show only for SUCCESS status */}
                {booking.payment.status === 'SUCCESS' && <Invoice booking={booking} />}
              </div>
            </div>
          )}

          {/* Extend Service Hour Button */}
          {canShowExtendButton() && (
            <div className="space-y-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleExtendClick}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3"
              >
                <Clock className="h-5 w-5 mr-2" />
                Extend Service Hour
              </Button>
            </div>
          )}

          {/* Modification History */}
          {booking.modifications && booking.modifications.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Modification History
              </h3>
              
              <div className="space-y-3">
                {booking.modifications.map((mod, index: number) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-yellow-200 text-yellow-800">
                        {mod.action}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {dayjs(mod.date).format('MMM D, YYYY h:mm A')}
                      </span>
                    </div>
                    {mod.refund && (
                      <p className="text-sm text-green-600">Refund: ₹{mod.refund}</p>
                    )}
                    {mod.penalty && (
                      <p className="text-sm text-red-600">Penalty: ₹{mod.penalty}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-gray-500" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Placed on</p>
                <p className="text-sm font-medium">
                  {formatBookingCreatedAt(booking.created_at || booking.bookingDate) ||
                    booking.placed_at_label?.trim() ||
                    '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assignment Status</p>
                <p className="text-sm font-medium capitalize">{booking.assignmentStatus}</p>
              </div>
              {(booking.leave_days ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-500">Leave Days</p>
                  <p className="text-sm font-medium">{booking.leave_days}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Extend Service Hour Dialog */}
      {showExtendDialog && (
        <>
          {/* Dialog Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 transition-opacity z-[60]"
            onClick={() => setShowExtendDialog(false)}
          />
          
          {/* Dialog Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[70] max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 relative">
              <div className="flex items-center justify-center gap-3">
                <Clock className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Extend Service Hour</h2>
              </div>
              <button
                onClick={() => setShowExtendDialog(false)}
                className="absolute right-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              {loadingAvailability ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Checking provider availability...</p>
                </div>
              ) : extensionAvailability && extensionAvailability.canExtend ? (
                <>
                  {/* Current Booking Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    {booking.is_timeline_recalculated && booking.early_start_minutes && booking.early_start_minutes > 0 && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-green-700 font-medium">
                            Service started {booking.early_start_minutes} min early
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 ml-4">
                          End time was adjusted to preserve {booking.duration_minutes}-minute duration
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                          Current End Time
                          {booking.is_timeline_recalculated && (
                            <span className="text-green-600 ml-1">✓</span>
                          )}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {extensionAvailability.currentEndTimeFormatted}
                        </p>
                        {booking.is_timeline_recalculated && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            (Adjusted from early start)
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                          Hourly Rate
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{extensionAvailability.hourlyRate}/hour
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-4">Select Extension Duration</h3>

                  {/* Extension Options */}
                  <div className="space-y-3 mb-6">
                    {extensionAvailability.availableSlots?.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedExtension(slot)}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          selectedExtension?.hours === slot.hours
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedExtension?.hours === slot.hours
                                ? 'border-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedExtension?.hours === slot.hours && (
                                <div className="w-3 h-3 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-gray-900">
                                +{slot.hours} hour{slot.hours > 1 ? 's' : ''}
                              </p>
                              <p className="text-sm text-gray-600">
                                Until {slot.newEndTimeFormatted}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              +₹{slot.additionalCost}
                            </p>
                            <p className="text-xs text-gray-500">
                              Total: ₹{slot.totalCost}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Summary */}
                  {selectedExtension && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3">Price Breakup</h4>
                      <div className="space-y-2">
                        
                        {/* Pricing Breakdown */}
                        {selectedExtension.pricing && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Base Amount:</span>
                              <span className="text-gray-900">₹{selectedExtension.pricing.baseNet.toFixed(2)}</span>
                            </div>
                            {selectedExtension.discounts && selectedExtension.discounts.length > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-green-600">{selectedExtension.discounts[0].label}:</span>
                                <span className="text-green-600">-₹{selectedExtension.discounts[0].amount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Platform Fee (6%):</span>
                              <span className="text-gray-900">₹{selectedExtension.pricing.platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">GST (18%):</span>
                              <span className="text-gray-900">₹{selectedExtension.pricing.gst.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-blue-200 my-2"></div>
                          </>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold text-gray-900">
                            +{selectedExtension.hours} hour{selectedExtension.hours > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">New End Time:</span>
                          <span className="font-semibold text-gray-900">
                            {selectedExtension.newEndTimeFormatted}
                          </span>
                        </div>
                        
                        <div className="border-t-2 border-blue-300 pt-3 mt-3 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Additional Cost:</span>
                          <span className="text-xl font-bold text-blue-600">
                            ₹{selectedExtension.additionalCost}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                  <h3 className="text-xl font-bold text-gray-900">Cannot Extend</h3>
                  <p className="text-gray-600 text-center">
                    {extensionAvailability?.reason || 'This booking cannot be extended at this time'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {extensionAvailability?.canExtend && (
              <div className="border-t border-gray-200 p-4 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExtendDialog(false)}
                  disabled={isExtending}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleExtendBooking}
                  disabled={!selectedExtension || isExtending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isExtending ? 'Processing...' : 'Confirm Extension'}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        style={{ marginTop: '60px' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Add CSS for highlight animation */}
      <style>{`
        .highlight-booking {
          animation: highlightPulse 2s ease-in-out;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        @keyframes highlightPulse {
          0%, 100% {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
          50% {
            border-color: #60a5fa;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          }
        }
      `}</style>
    </>
  );
};

export default EngagementDetailsDrawer;