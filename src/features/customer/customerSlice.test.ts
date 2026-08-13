import customerReducer, {
  clearCustomer,
  setHasMobileNumber,
  setMobileNumber,
  setAlternateNumber,
  fetchCustomerDetails,
} from './customerSlice';
import providerInstance from '../../services/providerInstance';

jest.mock('../../services/providerInstance', () => ({
  get: jest.fn(),
}));

describe('customerSlice', () => {
  const initialState = {
    customerId: null,
    mobileNo: null,
    alternateNo: null,
    firstName: null,
    lastName: null,
    emailId: null,
    hasMobileNumber: null,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle initial state', () => {
    expect(customerReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setHasMobileNumber', () => {
    const actual = customerReducer(initialState, setHasMobileNumber(true));
    expect(actual.hasMobileNumber).toEqual(true);
  });

  it('should handle setMobileNumber', () => {
    const actual = customerReducer(initialState, setMobileNumber('1234567890'));
    expect(actual.mobileNo).toEqual('1234567890');
    expect(actual.hasMobileNumber).toEqual(true);
  });

  it('should handle setAlternateNumber', () => {
    const actual = customerReducer(initialState, setAlternateNumber('0987654321'));
    expect(actual.alternateNo).toEqual('0987654321');
  });

  it('should handle clearCustomer', () => {
    const populatedState = {
      customerId: '1',
      mobileNo: '123',
      alternateNo: '456',
      firstName: 'John',
      lastName: 'Doe',
      emailId: 'john@example.com',
      hasMobileNumber: true,
      loading: false,
      error: 'some error',
    };
    const actual = customerReducer(populatedState, clearCustomer());
    expect(actual).toEqual({
      customerId: null,
      mobileNo: null,
      alternateNo: null,
      firstName: null,
      lastName: null,
      emailId: null,
      hasMobileNumber: null,
      loading: false, // Remains unchanged
      error: 'some error', // Remains unchanged by clearCustomer
    });
  });

  describe('fetchCustomerDetails async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: fetchCustomerDetails.pending.type };
      const state = customerReducer({ ...initialState, error: 'old error' }, action);
      expect(state.loading).toEqual(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state with valid payload', () => {
      const payload = {
        customerId: '123',
        firstName: 'Jane',
        lastName: 'Doe',
        emailId: 'jane@example.com',
        mobileNo: '+1 (555) 123-4567',
        alternateNo: '555-987-6543'
      };
      const action = { type: fetchCustomerDetails.fulfilled.type, payload };
      const state = customerReducer(initialState, action);

      expect(state.loading).toEqual(false);
      expect(state.customerId).toEqual('123');
      expect(state.firstName).toEqual('Jane');
      expect(state.lastName).toEqual('Doe');
      expect(state.emailId).toEqual('jane@example.com');
      // Should strip non-digits
      expect(state.mobileNo).toEqual('15551234567');
      expect(state.alternateNo).toEqual('5559876543');
      expect(state.hasMobileNumber).toEqual(true); // Length >= 10
    });

    it('should handle fulfilled state with short mobile number', () => {
      const payload = { mobileNo: '123' };
      const action = { type: fetchCustomerDetails.fulfilled.type, payload };
      const state = customerReducer(initialState, action);
      
      expect(state.hasMobileNumber).toEqual(false); // Length < 10
      expect(state.mobileNo).toEqual('123');
    });

    it('should handle rejected state', () => {
      const action = { type: fetchCustomerDetails.rejected.type, payload: 'API Error' };
      const state = customerReducer(initialState, action);
      
      expect(state.loading).toEqual(false);
      expect(state.error).toEqual('API Error');
      expect(state.hasMobileNumber).toBeNull();
    });
  });
});
