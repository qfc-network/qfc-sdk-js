import { describe, it, expect } from 'vitest';
import {
  parseQfc,
  formatQfc,
  formatQfcWithCommas,
  parseTokenAmount,
  formatTokenAmount,
  convertDecimals,
  parseGwei,
  formatGwei,
  ONE_QFC,
  ONE_GWEI,
} from '../src/utils/units';

describe('units', () => {
  describe('parseQfc', () => {
    it('should parse integer QFC amounts', () => {
      expect(parseQfc('1')).toBe(10n ** 18n);
      expect(parseQfc('100')).toBe(100n * 10n ** 18n);
      expect(parseQfc('0')).toBe(0n);
    });

    it('should parse decimal QFC amounts', () => {
      expect(parseQfc('1.5')).toBe(15n * 10n ** 17n);
      expect(parseQfc('0.1')).toBe(10n ** 17n);
      expect(parseQfc('0.000000000000000001')).toBe(1n);
    });

    it('should parse large amounts', () => {
      expect(parseQfc('1000000')).toBe(10n ** 24n);
      expect(parseQfc('999999999.999999999999999999')).toBeDefined();
    });

    it('should throw for invalid inputs', () => {
      expect(() => parseQfc('')).toThrow();
      expect(() => parseQfc('abc')).toThrow();
      // Note: ethers.parseUnits allows negative values
    });
  });

  describe('formatQfc', () => {
    it('should format wei to QFC with default decimals', () => {
      expect(formatQfc(10n ** 18n)).toBe('1.0000');
      expect(formatQfc(15n * 10n ** 17n)).toBe('1.5000');
      expect(formatQfc(0n)).toBe('0.0000');
    });

    it('should format with custom decimals', () => {
      expect(formatQfc(10n ** 18n, 2)).toBe('1.00');
      expect(formatQfc(10n ** 18n, 0)).toBe('1');
      expect(formatQfc(15n * 10n ** 17n, 1)).toBe('1.5');
    });

    it('should format large amounts', () => {
      expect(formatQfc(10n ** 24n, 0)).toBe('1000000');
      expect(formatQfc(1234567n * 10n ** 18n, 2)).toBe('1234567.00');
    });

    it('should format small amounts', () => {
      expect(formatQfc(1n, 18)).toContain('0.000000000000000001');
    });
  });

  describe('formatQfcWithCommas', () => {
    it('should add thousands separators', () => {
      expect(formatQfcWithCommas(1234567n * 10n ** 18n)).toBe('1,234,567.0000');
      expect(formatQfcWithCommas(10n ** 18n)).toBe('1.0000');
      expect(formatQfcWithCommas(0n)).toBe('0.0000');
    });

    it('should handle custom decimals', () => {
      expect(formatQfcWithCommas(1234567n * 10n ** 18n, 2)).toBe('1,234,567.00');
      expect(formatQfcWithCommas(1234567n * 10n ** 18n, 0)).toBe('1,234,567');
    });
  });

  describe('parseTokenAmount', () => {
    it('should parse with 18 decimals', () => {
      expect(parseTokenAmount('1', 18)).toBe(10n ** 18n);
    });

    it('should parse with 6 decimals (USDC-like)', () => {
      expect(parseTokenAmount('1', 6)).toBe(10n ** 6n);
      expect(parseTokenAmount('1.5', 6)).toBe(15n * 10n ** 5n);
    });

    it('should parse with 8 decimals (WBTC-like)', () => {
      expect(parseTokenAmount('1', 8)).toBe(10n ** 8n);
    });
  });

  describe('formatTokenAmount', () => {
    it('should format with 18 decimals', () => {
      expect(formatTokenAmount(10n ** 18n, 18, 4)).toBe('1.0000');
    });

    it('should format with 6 decimals', () => {
      expect(formatTokenAmount(10n ** 6n, 6, 2)).toBe('1.00');
      expect(formatTokenAmount(1500000n, 6, 2)).toBe('1.50');
    });
  });

  describe('convertDecimals', () => {
    it('should return same value for same decimals', () => {
      expect(convertDecimals(100n, 18, 18)).toBe(100n);
    });

    it('should scale up when increasing decimals', () => {
      expect(convertDecimals(100n, 6, 18)).toBe(100n * 10n ** 12n);
    });

    it('should scale down when decreasing decimals', () => {
      expect(convertDecimals(100n * 10n ** 18n, 18, 6)).toBe(100n * 10n ** 6n);
    });
  });

  describe('parseGwei', () => {
    it('should parse gwei to wei', () => {
      expect(parseGwei('1')).toBe(10n ** 9n);
      expect(parseGwei('10')).toBe(10n * 10n ** 9n);
      expect(parseGwei('0.1')).toBe(10n ** 8n);
    });
  });

  describe('formatGwei', () => {
    it('should format wei to gwei', () => {
      expect(formatGwei(10n ** 9n)).toBe('1.0');
      expect(formatGwei(10n * 10n ** 9n)).toBe('10.0');
    });
  });

  describe('constants', () => {
    it('should have correct ONE_QFC', () => {
      expect(ONE_QFC).toBe(10n ** 18n);
    });

    it('should have correct ONE_GWEI', () => {
      expect(ONE_GWEI).toBe(10n ** 9n);
    });
  });
});
