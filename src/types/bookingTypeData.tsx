export type Bookingtype = {
    startDate?: any;
    endDate?: any;
    bookingPreference?: string;
    morningSelection?: any;
    eveningSelection?: any;
    timeRange?: any;
    duration?: any;
    housekeepingRole?:any;
    startTime?: string | null;  // Added from BookingForm
    endTime?: string | null;    // Added from BookingForm
    serviceType?: 'Regular' | 'Premium';  // Added from BookingForm
}