/**
 * BookingTimeline Component
 * 
 * Displays booking timeline with support for recalculated times when service starts early.
 * Shows both scheduled and actual times, with visual indicators for early starts.
 */

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Badge } from '../Badge/Badge';
import dayjs from 'dayjs';

export interface TimelineData {
  scheduled: {
    start_time?: string;
    end_time?: string;
    start_epoch?: number | null;
    end_epoch?: number | null;
  };
  actual?: {
    start_time?: string;
    end_time?: string;
    start_epoch?: number | null;
    end_epoch?: number | null;
  };
  duration_minutes?: number;
  is_recalculated?: boolean;
  early_start_minutes?: number;
}

export interface BookingTimelineProps {
  timeline: TimelineData;
  status?: string;
  showEarlyStartBadge?: boolean;
  className?: string;
}

/**
 * Format epoch to time string (HH:mm AM/PM)
 */
const formatEpochToTime = (epoch: number | null | undefined): string => {
  if (!epoch) return '—';
  return dayjs.unix(epoch).format('h:mm A');
};

/**
 * Get display start time (actual if available, else scheduled)
 */
const getDisplayStartTime = (timeline: TimelineData): string => {
  if (timeline.actual?.start_epoch) {
    return formatEpochToTime(timeline.actual.start_epoch);
  }
  if (timeline.actual?.start_time) {
    return timeline.actual.start_time;
  }
  if (timeline.scheduled?.start_epoch) {
    return formatEpochToTime(timeline.scheduled.start_epoch);
  }
  return timeline.scheduled?.start_time || '—';
};

/**
 * Get display end time (actual if available, else scheduled)
 */
const getDisplayEndTime = (timeline: TimelineData): string => {
  if (timeline.actual?.end_epoch) {
    return formatEpochToTime(timeline.actual.end_epoch);
  }
  if (timeline.actual?.end_time) {
    return timeline.actual.end_time;
  }
  if (timeline.scheduled?.end_epoch) {
    return formatEpochToTime(timeline.scheduled.end_epoch);
  }
  return timeline.scheduled?.end_time || '—';
};

/**
 * Check if timeline is recalculated and started early
 */
const isEarlyStart = (timeline: TimelineData): boolean => {
  return !!(
    timeline.is_recalculated &&
    timeline.early_start_minutes &&
    timeline.early_start_minutes > 0
  );
};

/**
 * BookingTimeline Component
 */
export const BookingTimeline: React.FC<BookingTimelineProps> = ({
  timeline,
  status,
  showEarlyStartBadge = true,
  className = '',
}) => {
  const displayStartTime = getDisplayStartTime(timeline);
  const displayEndTime = getDisplayEndTime(timeline);
  const scheduledStartTime = timeline.scheduled?.start_time || 
    formatEpochToTime(timeline.scheduled?.start_epoch ?? undefined);
  const early = isEarlyStart(timeline);
  const isActive = status === 'IN_PROGRESS';
  const hasActualTime = !!(timeline.actual?.start_epoch || timeline.actual?.start_time);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Early Start Alert */}
      {early && showEarlyStartBadge && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Service Started Early
            </p>
            <p className="text-xs text-green-700 mt-1">
              Service provider arrived {timeline.early_start_minutes} minutes before scheduled time.
              {timeline.duration_minutes && (
                <> Service duration ({timeline.duration_minutes} min) has been preserved.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Timeline Display */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-blue-500" />
          Service Timeline
          {hasActualTime && (
            <span className="text-xs font-normal text-green-600">(Actual Times)</span>
          )}
        </h4>

        {/* Start Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isActive || early ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600">
              {hasActualTime ? 'Started At' : 'Start Time'}
            </span>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${
              hasActualTime ? 'text-green-700' : 'text-gray-900'
            }`}>
              {displayStartTime}
              {hasActualTime && (
                <span className="ml-1 text-green-600">✓</span>
              )}
            </p>
            {early && scheduledStartTime !== displayStartTime && (
              <p className="text-xs text-gray-500">
                Scheduled: {scheduledStartTime}
              </p>
            )}
          </div>
        </div>

        {/* Duration */}
        {timeline.duration_minutes && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duration</span>
            <span className="text-sm font-medium text-gray-900">
              {timeline.duration_minutes} minutes
            </span>
          </div>
        )}

        {/* End Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              status === 'COMPLETED' ? 'bg-blue-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600">
              {status === 'COMPLETED' ? 'Ended At' : 'End Time'}
            </span>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${
              hasActualTime ? 'text-green-700' : 'text-gray-900'
            }`}>
              {displayEndTime}
              {hasActualTime && (
                <span className="ml-1 text-green-600">✓</span>
              )}
            </p>
            {early && timeline.scheduled?.end_time && 
             timeline.scheduled.end_time !== displayEndTime && (
              <p className="text-xs text-gray-500">
                Originally: {timeline.scheduled.end_time || 
                  formatEpochToTime(timeline.scheduled.end_epoch ?? undefined)}
              </p>
            )}
          </div>
        </div>

        {/* Early Start Badge */}
        {early && showEarlyStartBadge && (
          <div className="pt-2 border-t border-gray-200">
            <Badge className="bg-green-100 text-green-800 text-xs">
              ✓ Started {timeline.early_start_minutes} min early
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTimeline;
