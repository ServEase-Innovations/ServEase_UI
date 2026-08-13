import { renderHook, act } from '@testing-library/react';
import { useBookingScheduleFlow } from './useBookingScheduleFlow';
import * as reactRedux from 'react-redux';
import { checkSelectedProviderAvailability } from 'src/services/providerScheduleAvailability';
import { confirmProviderScheduleVerified } from 'src/features/bookingType/bookingTypeSlice';
import { isBookingScheduleComplete, computeDurationHours } from 'src/components/ProviderDetails/serviceBookingConfig';
import { getBookingTypeFromPreference, formatDateOnly } from 'src/utils/maidPricingUtils';
import { resolveScheduleTimeFields } from 'src/utils/bookingSchedulePatch';

jest.mock('react-redux', () => ({
  __esModule: true,
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('src/services/providerScheduleAvailability', () => ({
  __esModule: true,
  checkSelectedProviderAvailability: jest.fn(),
}));

jest.mock('src/features/bookingType/bookingTypeSlice', () => ({
  __esModule: true,
  confirmProviderScheduleVerified: jest.fn(),
}));

jest.mock('src/components/ProviderDetails/serviceBookingConfig', () => ({
  __esModule: true,
  isBookingScheduleComplete: jest.fn(),
  computeDurationHours: jest.fn(),
}));

jest.mock('src/utils/maidPricingUtils', () => ({
  __esModule: true,
  getBookingTypeFromPreference: jest.fn(),
  formatDateOnly: jest.fn(),
}));

jest.mock('src/utils/bookingSchedulePatch', () => ({
  __esModule: true,
  resolveScheduleTimeFields: jest.fn(),
}));

describe('useBookingScheduleFlow', () => {
  let mockDispatch: jest.Mock;
  const mockState = {
    bookingType: {
      value: {
        startDate: '2023-01-01',
        endDate: '2023-01-01',
        bookingPreference: 'Date',
        timeRange: 'Morning',
        timeSlot: '10:00 AM',
      },
      scheduleRevision: 1,
      scheduleDirty: false,
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    (reactRedux.useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    
    (isBookingScheduleComplete as jest.Mock).mockReturnValue(true);
    (computeDurationHours as jest.Mock).mockReturnValue(2);
    (getBookingTypeFromPreference as jest.Mock).mockReturnValue('REGULAR');
    (formatDateOnly as jest.Mock).mockImplementation((d) => d || '2023-01-01');
    (resolveScheduleTimeFields as jest.Mock).mockReturnValue({ startTime: '10:00', endTime: '12:00' });
    
    (reactRedux.useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      return selectorFn(mockState);
    });
  });

  it('should initialize correctly and not check availability if conditions are unmet', () => {
    const { result } = renderHook(() => useBookingScheduleFlow({ active: false }));
    
    expect(result.current.scheduleReady).toBe(true);
    expect(result.current.selectedProviderAvailability.loading).toBe(false);
    expect(checkSelectedProviderAvailability).not.toHaveBeenCalled();
  });

  it('should call checkSelectedProviderAvailability when all conditions are met', async () => {
    (checkSelectedProviderAvailability as jest.Mock).mockResolvedValue({
      available: true,
      message: 'Available',
    });

    const { result } = renderHook(() => useBookingScheduleFlow({ 
      active: true,
      providerId: 123,
      latitude: 10.0,
      longitude: 20.0,
      customerId: 456,
      role: 'COOK'
    }));
    
    // Initially loading
    expect(result.current.selectedProviderAvailability.loading).toBe(true);
    
    // Wait for the async effect to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(checkSelectedProviderAvailability).toHaveBeenCalledWith({
      providerId: 123,
      latitude: 10.0,
      longitude: 20.0,
      role: 'COOK',
      startDate: '2023-01-01',
      endDate: '2023-01-01',
      preferredStartTime: '10:00',
      serviceDurationMinutes: 120,
      customerId: 456,
    });

    expect(result.current.selectedProviderAvailability.loading).toBe(false);
    expect(result.current.selectedProviderAvailability.available).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith(confirmProviderScheduleVerified('123'));
  });

  it('should handle availability check failure gracefully', async () => {
    (checkSelectedProviderAvailability as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBookingScheduleFlow({ 
      active: true,
      providerId: 123,
      latitude: 10.0,
      longitude: 20.0,
    }));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.selectedProviderAvailability.loading).toBe(false);
    expect(result.current.selectedProviderAvailability.available).toBe(false);
    expect(result.current.selectedProviderAvailability.message).toContain('Could not verify provider');
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
