import dayjs from 'dayjs';
import { toCalendarDay, countInclusiveDays } from './inclusiveDayCount';

describe('inclusiveDayCount utility', () => {
  describe('toCalendarDay', () => {
    it('returns null for null or undefined input', () => {
      expect(toCalendarDay(null)).toBeNull();
      expect(toCalendarDay(undefined)).toBeNull();
    });

    it('returns null for invalid dates', () => {
      expect(toCalendarDay('invalid-date')).toBeNull();
    });

    it('normalizes valid date to start of day', () => {
      const date = new Date('2026-07-12T15:30:00Z');
      const calendarDay = toCalendarDay(date);
      
      expect(calendarDay).not.toBeNull();
      expect(calendarDay?.hour()).toBe(0);
      expect(calendarDay?.minute()).toBe(0);
      expect(calendarDay?.second()).toBe(0);
      expect(calendarDay?.millisecond()).toBe(0);
    });

    it('handles dayjs objects', () => {
      const d = dayjs('2026-07-12T10:00:00');
      const calendarDay = toCalendarDay(d);
      expect(calendarDay?.hour()).toBe(0);
    });
  });

  describe('countInclusiveDays', () => {
    it('returns 0 if start or end is invalid', () => {
      expect(countInclusiveDays('invalid', '2026-07-12')).toBe(0);
      expect(countInclusiveDays('2026-07-12', 'invalid')).toBe(0);
    });

    it('calculates inclusive days correctly for same day', () => {
      expect(countInclusiveDays('2026-07-12', '2026-07-12')).toBe(1);
    });

    it('calculates inclusive days correctly for multiple days', () => {
      // Jun 16 to Jun 25 is exactly 10 days inclusive
      expect(countInclusiveDays('2026-06-16', '2026-06-25')).toBe(10);
    });

    it('handles Date objects', () => {
      const start = new Date('2026-07-10T10:00:00');
      const end = new Date('2026-07-12T20:00:00');
      expect(countInclusiveDays(start, end)).toBe(3);
    });

    it('ignores time of day when counting days', () => {
      const start = '2026-07-10T23:59:59';
      const end = '2026-07-12T00:00:01';
      expect(countInclusiveDays(start, end)).toBe(3);
    });
  });
});
