/* eslint-disable */
import React from 'react';
import { X, Calendar, Clock, MapPin, User, CreditCard, Tag, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../../components/Common/Badge/Badge';
import { Separator } from '../../components/Common/Separator/Separator';
import { getServiceTitle, getBookingTypeBadge, getStatusBadge } from '../Common/Booking/BookingUtils';
import dayjs from 'dayjs';
import { DialogHeader } from '../ProviderDetails/CookServicesDialog.styles';

interface EngagementDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // Replace with proper Booking type
}

const formatTimeToAMPM = (timeString: string): string => {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  } catch (error) {
    return timeString;
  }
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMMM D, YYYY');
};

const EngagementDetailsDrawer: React.FC<EngagementDetailsDrawerProps> = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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
              {getBookingTypeBadge(booking.bookingType)}
              {getStatusBadge(booking.taskStatus)}
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
                <p className="text-xl font-bold text-gray-900">{getServiceTitle(booking.service_type)}</p>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                <p className="font-medium">{formatDate(booking.startDate)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">End Date</p>
                <p className="font-medium">{formatDate(booking.endDate)}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Time Slot</p>
              <p className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                {formatTimeToAMPM(booking.start_time)} - {formatTimeToAMPM(booking.end_time)}
              </p>
            </div>
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
                  {booking.providerRating > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      ⭐ {booking.providerRating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tasks & Responsibilities */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Tasks & Responsibilities
            </h3>
            
            <div className="space-y-3">
              {/* Main Tasks */}
              {booking.responsibilities?.tasks && booking.responsibilities.tasks.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Main Tasks</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.responsibilities.tasks.map((task: any, index: number) => {
                      const taskDetails = Object.entries(task)
                        .filter(([key]) => key !== 'taskType')
                        .map(([key, value]) => `${value} ${key}`)
                        .join(', ');
                      
                      return (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {task.taskType} {taskDetails && `- ${taskDetails}`}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {booking.responsibilities?.add_ons && booking.responsibilities.add_ons.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Add-ons</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.responsibilities.add_ons.map((addon: any, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {addon.taskType}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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
                  <Badge className={getPaymentStatusColor(booking.payment.status)}>
                    {booking.payment.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Mode</span>
                  <span className="font-medium capitalize">{booking.payment.payment_mode}</span>
                </div>
              </div>
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
                {booking.modifications.map((mod: any, index: number) => (
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
                <p className="text-xs text-gray-500">Booking Date</p>
                <p className="text-sm font-medium">{dayjs(booking.bookingDate).format('MMM D, YYYY')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assignment Status</p>
                <p className="text-sm font-medium capitalize">{booking.assignmentStatus}</p>
              </div>
              {booking.leave_days > 0 && (
                <div>
                  <p className="text-xs text-gray-500">Leave Days</p>
                  <p className="text-sm font-medium">{booking.leave_days}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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