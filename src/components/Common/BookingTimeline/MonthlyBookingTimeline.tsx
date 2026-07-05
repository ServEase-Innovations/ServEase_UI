/**
 * MonthlyBookingTimeline Component
 * 
 * Displays comprehensive timeline for MONTHLY and SHORT_TERM bookings
 * Shows overall booking period + daily service schedule with actual start times
 */

import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '../Badge/Badge';
import dayjs from 'dayjs';

export interface MonthlyTimelineData {
  // Overall booking period
  booking_period: {
    start_date: string;  // YYYY-MM-DD
    end_date: string;    // YYYY-MM-DD
    total_days: number;
  };
  
  // Daily service schedule
  daily_schedule: {
    scheduled_start_time: string;  // HH:mm
    scheduled_end_time: string;    // HH:mm
    duration_minutes: number;
  };
  
  // Today's or recent service (if available)
  current_service?: {
    date: string;  // YYYY-MM-DD
    scheduled_start_time: string;
    scheduled_end_time: string;
    actual_start_time?: string;
    actual_start_epoch?: number;
    actual_end_time?: string;
    actual_end_epoch?: number;
    status: string;  // SCHEDULED, IN_PROGRESS, COMPLETED
    early_start_minutes?: number;
  };
}

export interface MonthlyBookingTimelineProps {
  timeline: MonthlyTimelineData;
  bookingType: string;  // MONTHLY, SHORT_TERM
  className?: string;
}

/**
 * Format date in readable format
 */
const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format('MMM D, YYYY');
};

/**
 * Calculate days between two dates
 */
const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return end.diff(start, 'day') + 1; // +1 to include both start and end dates
};

/**
 * MonthlyBookingTimeline Component
 */
export const MonthlyBookingTimeline: React.FC<MonthlyBookingTimelineProps> = ({
  timeline,
  bookingType,
  className = '',
}) => {
  const totalDays = timeline.booking_period?.total_days || 
    getDaysBetween(timeline.booking_period.start_date, timeline.booking_period.end_date);
  
  const hasCurrentService = !!timeline.current_service;
  const isServiceActive = timeline.current_service?.status === 'IN_PROGRESS';
  const isServiceCompleted = timeline.current_service?.status === 'COMPLETED';
  const hasActualStartTime = !!(timeline.current_service?.actual_start_epoch || timeline.current_service?.actual_start_time);
  const hasActualEndTime = !!(timeline.current_service?.actual_end_epoch || timeline.current_service?.actual_end_time);
  const isEarly = timeline.current_service?.early_start_minutes && timeline.current_service.early_start_minutes > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Booking Period Overview */}
      <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">
            {bookingType === 'MONTHLY' ? 'Monthly Booking Period' : 'Booking Period'}
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-blue-600 mb-1">Start Date</p>
            <p className="text-sm font-bold text-blue-900">
              {formatDate(timeline.booking_period.start_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-600 mb-1">End Date</p>
            <p className="text-sm font-bold text-blue-900">
              {formatDate(timeline.booking_period.end_date)}
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Total Duration</span>
            <span className="text-sm font-bold text-blue-900">
              {totalDays} {totalDays === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Service Schedule */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Daily Service Schedule</h4>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Service Time</span>
            <span className="text-sm font-medium text-gray-900">
              {timeline.daily_schedule.scheduled_start_time} - {timeline.daily_schedule.scheduled_end_time}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duration</span>
            <span className="text-sm font-medium text-gray-900">
              {timeline.daily_schedule.duration_minutes} minutes
            </span>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Service provider will arrive daily at the scheduled time during the booking period
            </p>
          </div>
        </div>
      </div>

      {/* Today's Service (if available) */}
      {hasCurrentService && (
        <div className={`rounded-lg p-4 border-2 ${
          isServiceActive ? 'bg-green-50 border-green-200' : 
          isServiceCompleted ? 'bg-blue-50 border-blue-200' : 
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            {isServiceCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className={`h-5 w-5 ${isServiceActive ? 'text-green-600' : 'text-gray-600'}`} />
            )}
            <h4 className={`font-semibold ${
              isServiceActive ? 'text-green-900' : 
              isServiceCompleted ? 'text-blue-900' : 
              'text-gray-900'
            }`}>
              {isServiceActive ? "Today's Service (Active)" : 
               isServiceCompleted ? "Today's Service (Completed)" : 
               "Today's Service"}
            </h4>
            <Badge className={
              isServiceActive ? 'bg-green-100 text-green-800 ml-auto' :
              isServiceCompleted ? 'bg-blue-100 text-blue-800 ml-auto' :
              'bg-gray-100 text-gray-800 ml-auto'
            }>
              {timeline.current_service?.status || 'SCHEDULED'}
            </Badge>
          </div>

          {/* Early Start Alert */}
          {isEarly && timeline.current_service && (
            <div className="mb-3 p-2 bg-green-100 border-l-4 border-green-500 rounded">
              <p className="text-xs text-green-800 font-medium">
                ✓ Service started {timeline.current_service.early_start_minutes} minutes early today
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            {timeline.current_service && (
              <>
                {/* Date */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(timeline.current_service.date)}
                  </span>
                </div>
                
                {/* Start Time - Scheduled */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Start Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {timeline.current_service.scheduled_start_time}
                  </span>
                </div>
                
                {/* Started At - Actual (if available) */}
                {hasActualStartTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-semibold">Started At</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-700">
                        {timeline.current_service.actual_start_time}
                        <span className="ml-1 text-green-600">✓</span>
                      </span>
                    </div>
                  </div>
                )}
                
                {/* End Time - Scheduled */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">End Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {timeline.current_service.scheduled_end_time}
                  </span>
                </div>
                
                {/* Ended At - Actual (if available) */}
                {hasActualEndTime && isServiceCompleted && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-semibold">Ended At</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-blue-700">
                        {timeline.current_service.actual_end_time}
                        <span className="ml-1 text-blue-600">✓</span>
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Duration */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {timeline.daily_schedule.duration_minutes} minutes
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
        <p className="text-xs text-blue-800">
          <strong className="font-semibold">
            {bookingType === 'MONTHLY' ? 'Monthly Booking' : 'Short-Term Booking'}:
          </strong> Service provider will visit daily at {timeline.daily_schedule.scheduled_start_time} from{' '}
          {dayjs(timeline.booking_period.start_date).format('MMM D')} to{' '}
          {dayjs(timeline.booking_period.end_date).format('MMM D, YYYY')}.
          {hasActualStartTime && ' Actual service times are tracked for each visit.'}
        </p>
      </div>
    </div>
  );
};

export default MonthlyBookingTimeline;
