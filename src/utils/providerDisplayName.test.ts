import { formatProviderDisplayName, providerInitials, trimNamePart } from './providerDisplayName';

describe('providerDisplayName utils', () => {
  describe('trimNamePart', () => {
    it('should trim whitespace', () => {
      expect(trimNamePart('  John  ')).toBe('John');
    });

    it('should return empty string for null or undefined', () => {
      expect(trimNamePart(null)).toBe('');
      expect(trimNamePart(undefined)).toBe('');
    });
  });

  describe('formatProviderDisplayName', () => {
    it('should format full name', () => {
      expect(formatProviderDisplayName({ firstName: 'John', middleName: 'A', lastName: 'Doe' })).toBe('John A Doe');
    });

    it('should handle alternate casing', () => {
      expect(formatProviderDisplayName({ firstname: 'John', middlename: 'A', lastname: 'Doe' })).toBe('John A Doe');
    });

    it('should skip missing parts', () => {
      expect(formatProviderDisplayName({ firstName: 'John', lastName: 'Doe' })).toBe('John Doe');
      expect(formatProviderDisplayName({ firstName: 'John' })).toBe('John');
    });

    it('should handle null provider', () => {
      expect(formatProviderDisplayName(null)).toBe('');
    });
  });

  describe('providerInitials', () => {
    it('should return initials', () => {
      expect(providerInitials({ firstName: 'John', lastName: 'Doe' })).toBe('JD');
    });

    it('should handle missing last name', () => {
      expect(providerInitials({ firstName: 'John' })).toBe('J');
    });

    it('should return ? for empty names', () => {
      expect(providerInitials(null)).toBe('?');
      expect(providerInitials({})).toBe('?');
    });
  });
});
