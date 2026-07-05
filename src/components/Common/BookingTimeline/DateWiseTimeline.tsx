/**
 * DateWiseTimeline Component
 * 
 * Displays a comprehensive date-by-date timeline for MONTHLY and SHORT_TERM bookings
 * Shows service history with actual start/end times for each day
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Badge } from '../Badge/Badge';
import dayjs from 'dayjs';
import axios from 'axios';

export interface ServiceDayData {
  service_day_id: number;
  service_date: string;  // YYYY-MM-DD
  status: string;  // SCHEDULED, IN_PROGRESS, COMPLETED
  scheduled: {
    start_time: string;
    end_time: string;
    start_epoch: number;
    end_epoch: number;
  };
  actual?: {
    start_epoch: number;
    end_epoch?: number;
    start_time: string;
    end_time?: string;
  };
  early_start_minutes: number;
  started_at?: string;
  completed_at?: string;
}

export interface DateWiseTimelineProps {
  engagementId: number;
  bookingType: string;
  className?: string;
}

/**
 * DateWiseTimeline Component
 */
export const DateWiseTimeline: React.FC<DateWiseTimelineProps> = ({
  engagementId,
  bookingType,
  className = '',
}) => {
  const [serviceDays, setServiceDays] = useState<ServiceDayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const fetchServiceDays = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('customerToken');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:4100/api'}/engagements/${engagementId}/service-days`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setServiceDays(response.data.service_days || []);
        } else {
          setError('Failed to load service days');
        }
      } catch (err: any) {
        console.error('Error fetching service days:', err);
        setError(err.response?.data?.error || 'Failed to load service days');
      } finally {
        setLoading(false);
      }
    };

    if (engagementId) {
      fetchServiceDays();
    }
  }, [engagementId]);

  const formatDate = (dateStr: string): string => {
    return dayjs(dateStr).format('MMM D, YYYY');
  };

  const formatDateShort = (dateStr: string): string => {
    return dayjs(dateStr).format('MMM D');
  };

  const formatDay = (dateStr: string): string => {
    return dayjs(dateStr).format('ddd');
  };

  const isToday = (dateStr: string): boolean => {
    return dayjs(dateStr).isSame(dayjs(), 'day');
  };

  const isPast = (dateStr: string): boolean => {
    return dayjs(dateStr).isBefore(dayjs(), 'day');
  };

  const isFuture = (dateStr: string): boolean => {
    return dayjs(dateStr).isAfter(dayjs(), 'day');
  };

  const getStatusColor = (status: string): string => {
    const upper = status.toUpperCase();
    if (upper === 'COMPLETED') return 'text-green-700';
    if (upper === 'IN_PROGRESS') return 'text-blue-700';
    return 'text-gray-600';
  };

  const getStatusBadgeColor = (status: string): string => {
    const upper = status.toUpperCase();
    if (upper === 'COMPLETED') return 'bg-green-100 text-green-800';
    if (upper === 'IN_PROGRESS') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-600">Loading service history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (serviceDays.length === 0) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-sm text-gray-600">No service days found for this booking.</p>
      </div>
    );
  }

  const completedCount = serviceDays.filter(sd => sd.status.toUpperCase() === 'COMPLETED').length;
  const upcomingCount = serviceDays.filter(sd => sd.status.toUpperCase() === 'SCHEDULED' && isFuture(sd.service_date)).length;
  const todayService = serviceDays.find(sd => isToday(sd.service_date));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with toggle */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between hover:bg-gray-100 rounded p-2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Date-Wise Service History</h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-600">
              {completedCount} completed • {upcomingCount} upcoming • {serviceDays.length} total
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </div>
        </button>
      </div>

      {/* Timeline */}
      {expanded && (
        <div className="space-y-2">
          {serviceDays.map((serviceDay, index) => {
            const isLast = index === serviceDays.length - 1;
            const dayIsToday = isToday(serviceDay.service_date);
            const dayIsPast = isPast(serviceDay.service_date);
            const statusUpper = serviceDay.status.toUpperCase();
            const isCompleted = statusUpper === 'COMPLETED';
            const isActive = statusUpper === 'IN_PROGRESS';
            const hasActual = !!serviceDay.actual;
            const isEarly = serviceDay.early_start_minutes > 0;

            return (
              <div
                key={serviceDay.service_day_id}
                className={`relative pl-8 pb-3 ${!isLast ? 'border-l-2' : ''} ${
                  isCompleted ? 'border-green-300' : 
                  isActive ? 'border-blue-300' : 
                  'border-gray-200'
                }`}
              >
                {/* Timeline dot */}
                <div className={`absolute left-0 top-0 -ml-[9px] w-4 h-4 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-600' :
                  isActive ? 'bg-blue-500 border-blue-600 animate-pulse' :
                  'bg-gray-300 border-gray-400'
                }`} />

                {/* Service day card */}
                <div className={`rounded-lg p-3 border-2 ${
                  dayIsToday ? 'bg-yellow-50 border-yellow-300' :
                  isCompleted ? 'bg-green-50 border-green-200' :
                  isActive ? 'bg-blue-50 border-blue-200' :
                  'bg-white border-gray-200'
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {formatDateShort(serviceDay.service_date)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDay(serviceDay.service_date)}
                      </span>
                      {dayIsToday && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Today
                        </Badge>
                      )}
                    </div>
                    <Badge className={`${getStatusBadgeColor(serviceDay.status)} text-xs`}>
                      {isCompleted ? (
                        <><CheckCircle className="h-3 w-3 inline mr-1" /> Completed</>
                      ) : isActive ? (
                        <><Clock className="h-3 w-3 inline mr-1 animate-pulse" /> Active</>
                      ) : (
                        <><Clock className="h-3 w-3 inline mr-1" /> Scheduled</>
                      )}
                    </Badge>
                  </div>

                  {/* Early start alert */}
                  {isEarly && hasActual && (
                    <div className="mb-2 p-2 bg-green-100 border-l-4 border-green-500 rounded text-xs text-green-800">
                      ✓ Started {serviceDay.early_start_minutes} minutes early
                    </div>
                  )}

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Scheduled times */}
                    <div>
                      <p className="text-gray-500 mb-1">Start Time</p>
                      <p className="font-medium text-gray-900">
                        {serviceDay.scheduled.start_time}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">End Time</p>
                      <p className="font-medium text-gray-900">
                        {serviceDay.scheduled.end_time}
                      </p>
                    </div>

                    {/* Actual times (if available) */}
                    {hasActual && serviceDay.actual && (
                      <>
                        <div>
                          <p className="text-gray-500 mb-1">Started At</p>
                          <p className="font-bold text-green-700">
                            {serviceDay.actual.start_time}
                            <span className="ml-1 text-green-600">✓</span>
                          </p>
                        </div>
                        {serviceDay.actual.end_time && (
                          <div>
                            <p className="text-gray-500 mb-1">Ended At</p>
                            <p className="font-bold text-blue-700">
                              {serviceDay.actual.end_time}
                              <span className="ml-1 text-blue-600">✓</span>
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DateWiseTimeline;
