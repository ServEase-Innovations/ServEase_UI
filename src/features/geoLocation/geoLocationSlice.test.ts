import geoLocationReducer, { add, remove } from './geoLocationSlice';
import { normalizeGeoLocationPayload } from 'src/utils/bookingLocation';

jest.mock('src/utils/bookingLocation', () => ({
  normalizeGeoLocationPayload: jest.fn(),
}));

describe('geoLocationSlice', () => {
  const initialState = {
    value: null as Record<string, unknown> | null,
    updatedAt: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle initial state', () => {
    expect(geoLocationReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle add when normalize returns a value', () => {
    const payload = { lat: 10, lng: 20 };
    const normalized = { latitude: 10, longitude: 20 };
    (normalizeGeoLocationPayload as jest.Mock).mockReturnValue(normalized);

    const actual = geoLocationReducer(initialState, add(payload));
    
    expect(normalizeGeoLocationPayload).toHaveBeenCalledWith(payload);
    expect(actual.value).toEqual(normalized);
    expect(actual.updatedAt).toEqual(1672531200000);
  });

  it('should handle add when normalize returns null (falls back to payload)', () => {
    const payload = { location: 'New York' };
    (normalizeGeoLocationPayload as jest.Mock).mockReturnValue(null);

    const actual = geoLocationReducer(initialState, add(payload));
    
    expect(normalizeGeoLocationPayload).toHaveBeenCalledWith(payload);
    expect(actual.value).toEqual(payload);
    expect(actual.updatedAt).toEqual(1672531200000);
  });

  it('should handle remove', () => {
    const activeState = {
      value: { lat: 10 },
      updatedAt: 123456789,
    };
    const actual = geoLocationReducer(activeState, remove());
    
    expect(actual.value).toBeNull();
    expect(actual.updatedAt).toEqual(1672531200000);
  });
});
