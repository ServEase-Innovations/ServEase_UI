// types.ts
export interface ProviderDetailsType {
    serviceproviderId: string;
    firstname: string;
    middleName?: string;
    lastname: string;
    gender: string;
    dob: string;
    diet: string;
    language?: string;
    experience?: string;
    otherServices?: string;
    housekeepingRole: string;
    availableTimeSlots?: string[];
  }
  
  export interface EnhancedProviderDetails extends ProviderDetailsType {
    selectedMorningTime?: number | null;
    selectedEveningTime?: number | null;
    matchedMorningSelection?: string | null;
    matchedEveningSelection?: string | null;
    startTime?: string;
    endTime?: string;
  }
  
  export interface DialogProps {
    open: boolean;
    handleClose: () => void;
    providerDetails: EnhancedProviderDetails;
  }

  /** Monthly availability summary */
export interface MonthlyAvailabilitySummary {
  totalDays: number;
  daysAtPreferredTime: number;
  daysWithDifferentTime: number;
  unavailableDays: number;
}

/** Monthly availability exception */
export interface MonthlyAvailabilityException {
  date: string;               // YYYY-MM-DD
  reason: "ON_DEMAND" | "FULLY_BOOKED";
  suggestedTime: string | null; // HH:mm or null
}

/** Monthly availability DTO */
export interface MonthlyAvailabilityDTO {
  preferredTime: string; // HH:mm
  fullyAvailable: boolean;
  summary: MonthlyAvailabilitySummary;
  exceptions: MonthlyAvailabilityException[];
}

/** Service Provider DTO (Frontend) */
export interface ServiceProviderDTO {
  serviceproviderid: string;

  // Basic info
  firstname: string;
  lastname: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  experience: number; // years
  rating: number;
  dob: string; // ISO date string
  age: number;
  otherServices: string | null;

  housekeepingrole: string;

  // Preferences
  diet: "VEG" | "NON_VEG" | "BOTH";
  cookingspeciality: "VEG" | "NON_VEG" | "BOTH";
  languageknown: string[] | null;
  
  // Location
  locality: string;
  location: string;
  pincode: number;
  latitude: number;
  longitude: number;
  distance_km: number;

  // Ranking flags
  bestMatch: boolean;

  // Availability
  monthlyAvailability: MonthlyAvailabilityDTO;
}


export interface NearbyMonthlyResponseDTO {
  count: number;
  providers: ServiceProviderDTO[];
}

