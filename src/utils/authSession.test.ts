import { hasStoredAuthToken, isAppSessionAuthenticated, isCustomerCheckoutReady } from './authSession';
import { resolveCustomerId } from 'src/services/couponService';

jest.mock('src/services/couponService', () => ({
  resolveCustomerId: jest.fn(),
}));

describe('authSession utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('hasStoredAuthToken', () => {
    it('should return true if token is in localStorage', () => {
      localStorage.setItem('token', 'abc');
      expect(hasStoredAuthToken()).toBe(true);
    });

    it('should return false if token is not in localStorage', () => {
      expect(hasStoredAuthToken()).toBe(false);
    });
  });

  describe('isAppSessionAuthenticated', () => {
    it('should return true if auth0IsAuthenticated is true', () => {
      expect(isAppSessionAuthenticated(null, true)).toBe(true);
    });

    it('should return true if appUser exists and token is stored', () => {
      localStorage.setItem('token', 'abc');
      expect(isAppSessionAuthenticated({ name: 'User' }, false)).toBe(true);
    });

    it('should return false if neither condition is met', () => {
      expect(isAppSessionAuthenticated(null, false)).toBe(false);
      
      // Has user but no token
      expect(isAppSessionAuthenticated({ name: 'User' }, false)).toBe(false);
      
      // Has token but no user
      localStorage.setItem('token', 'abc');
      expect(isAppSessionAuthenticated(null, false)).toBe(false);
    });
  });

  describe('isCustomerCheckoutReady', () => {
    it('should return false if resolveCustomerId returns falsey', () => {
      (resolveCustomerId as jest.Mock).mockReturnValue(null);
      expect(isCustomerCheckoutReady({ name: 'User' }, true)).toBe(false);
    });

    it('should return true if customerId exists and session is authenticated', () => {
      (resolveCustomerId as jest.Mock).mockReturnValue('123');
      expect(isCustomerCheckoutReady(null, true)).toBe(true);
    });

    it('should return false if customerId exists but session is not authenticated', () => {
      (resolveCustomerId as jest.Mock).mockReturnValue('123');
      expect(isCustomerCheckoutReady(null, false)).toBe(false);
    });
  });
});
