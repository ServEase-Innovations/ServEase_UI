// ProviderDetailsType.ts
export interface MonthlyAvailabilitySummary {
  totalDays: number;
  daysAtPreferredTime: number;
  daysWithDifferentTime: number;
  unavailableDays: number;
}

export interface MonthlyAvailabilityException {
  date: string;
  reason: "ON_DEMAND" | "FULLY_BOOKED";
  suggestedTime: string | null;
}

export interface MonthlyAvailabilityDTO {
  preferredTime: string;
  fullyAvailable: boolean;
  summary: MonthlyAvailabilitySummary;
  exceptions: MonthlyAvailabilityException[];
}

export interface PreviousBookingDetails {
  engagementId: string;
  bookingType: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  vacationStartDate?: string | null;
  vacationEndDate?: string | null;
  leaveDays?: number;
  engagementStatus: string;
  assignmentStatus: string;
  taskStatus: string;
  active: boolean;
  baseAmount: number;
  createdAt: string;
}

/** Approved vacation on an active long-term engagement — provider may be assignable on-demand during these dates. */
export interface VacationAvailabilityDTO {
  status: "ACTIVE";
  engagementId: string | null;
  leaveDays: number;
  vacationStartDate: string;
  vacationEndDate: string;
  engagementStartDate: string | null;
  engagementEndDate: string | null;
  /** True when vacation dates overlap the current provider search window. */
  overlapsSearchWindow: boolean;
}

export interface ServiceProviderDTO {
  /** Legacy lowercase key */
  serviceproviderid?: string | number;
  /** Nearby-monthly API (preferred) */
  serviceProviderId?: string | number;
  /** Mixed casing used in some Redux payloads */
  serviceproviderId?: string | number;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  profilePic?: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  experience: number;
  rating: number;
  dob: string;
  age: number;
  otherServices: string | null;
  housekeepingRole: string;
  housekeepingRoles: string[];
  diet: "VEG" | "NONVEG" | "BOTH";
  cookingspeciality: "VEG" | "NONVEG" | "BOTH";
  languageknown: string | string[] | null;
  /** Nearby / search APIs (preferred) */
  languageKnown?: string | string[] | null;
  locality: string;
  location: string;
  pincode: number;
  latitude: number;
  longitude: number;
  distance_km: number;
  bestMatch: boolean;
  monthlyAvailability: MonthlyAvailabilityDTO;
  previouslyBooked: boolean;
  previousBookingDetails: PreviousBookingDetails | null;
  vacationAvailability?: VacationAvailabilityDTO | null;
}

export interface NearbyMonthlyResponseDTO {
  count: number;
  providers: ServiceProviderDTO[];
}
 export interface EnhancedProviderDetails extends ServiceProviderDTO {
    selectedMorningTime?: number | null;
    selectedEveningTime?: number | null;
    matchedMorningSelection?: string | null;
    matchedEveningSelection?: string | null;
    startTime?: string;
    endTime?: string;
  }