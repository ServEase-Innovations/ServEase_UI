import {
  computePaymentTotals,
  computeCheckoutWithWallet,
  formatTaxesFeesInfo,
  appendPaymentFeeRows,
} from './paymentTotals';
import type { QuoteBreakdownRow } from './quoteBreakdown';

describe('paymentTotals utility', () => {
  describe('computePaymentTotals', () => {
    it('returns zero for 0 or negative base amount', () => {
      expect(computePaymentTotals(0)).toEqual({
        base_amount: 0,
        platform_fee: 0,
        gst: 0,
        taxes_and_fees: 0,
        total_amount: 0,
      });

      expect(computePaymentTotals(-100)).toEqual({
        base_amount: 0,
        platform_fee: 0,
        gst: 0,
        taxes_and_fees: 0,
        total_amount: 0,
      });
    });

    it('calculates correct fees for positive base amount', () => {
      // 1000 base
      // Platform fee (6%) = 60
      // GST (18% on platform fee) = 60 * 0.18 = 10.8
      // Taxes & Fees = 70.8
      // Total = 1070.8
      const totals = computePaymentTotals(1000);
      expect(totals.base_amount).toBe(1000);
      expect(totals.platform_fee).toBe(60);
      expect(totals.gst).toBe(10.8);
      expect(totals.taxes_and_fees).toBe(70.8);
      expect(totals.total_amount).toBe(1070.8);
    });

    it('rounds values correctly to 2 decimal places', () => {
      const totals = computePaymentTotals(1234.56);
      expect(totals.platform_fee).toBe(74.07); // 1234.56 * 0.06 = 74.0736 -> 74.07
      expect(totals.gst).toBe(13.33); // 74.07 * 0.18 = 13.3326 -> 13.33
      expect(totals.taxes_and_fees).toBe(87.4); // 74.07 + 13.33 = 87.4
      expect(totals.total_amount).toBe(1321.96); // 1234.56 + 87.4 = 1321.96
    });
  });

  describe('computeCheckoutWithWallet', () => {
    const totals = computePaymentTotals(1000); // total is 1070.8

    it('returns full amount if useWallet is false', () => {
      const split = computeCheckoutWithWallet(totals, 500, false);
      expect(split).toEqual({
        wallet_applied: 0,
        razorpay_amount: 1070.8,
        remaining_wallet: 500,
      });
    });

    it('returns full amount if wallet balance is 0', () => {
      const split = computeCheckoutWithWallet(totals, 0, true);
      expect(split).toEqual({
        wallet_applied: 0,
        razorpay_amount: 1070.8,
        remaining_wallet: 0,
      });
    });

    it('applies partial wallet balance', () => {
      const split = computeCheckoutWithWallet(totals, 500, true);
      expect(split).toEqual({
        wallet_applied: 500,
        razorpay_amount: 570.8, // 1070.8 - 500
        remaining_wallet: 0,
      });
    });

    it('applies full wallet balance if it exceeds total', () => {
      const split = computeCheckoutWithWallet(totals, 2000, true);
      expect(split).toEqual({
        wallet_applied: 1070.8,
        razorpay_amount: 0,
        remaining_wallet: 929.2, // 2000 - 1070.8
      });
    });
  });

  describe('formatTaxesFeesInfo', () => {
    it('formats fees string correctly', () => {
      const totals = computePaymentTotals(1000);
      const expected = "Platform fee: ₹60\nGST (18% on platform fee): ₹10.8";
      expect(formatTaxesFeesInfo(totals)).toBe(expected);
    });
  });

  describe('appendPaymentFeeRows', () => {
    it('returns original rows if baseAmount is 0', () => {
      const rows: any = [{ label: 'Service', amount: 0, kind: 'item' }];
      expect(appendPaymentFeeRows(rows, 0)).toEqual(rows);
    });

    it('appends fee rows correctly', () => {
      const rows: any = [{ label: 'Service', amount: 1000, kind: 'item' }];
      const result = appendPaymentFeeRows(rows, 1000);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ label: 'Service', amount: 1000, kind: 'item' });
      expect(result[1]).toEqual({ label: 'Taxes & fees', amount: 70.8, kind: 'taxes_fees' });
      expect(result[2]).toEqual({ label: 'Amount payable', amount: 1070.8, kind: 'total' });
    });
  });
});
