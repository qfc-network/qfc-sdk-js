import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  shortenAddress,
  shortenHash,
  formatNumber,
  formatBigInt,
  formatTimestamp,
  formatRelativeTime,
  formatBlockNumber,
  formatGas,
  formatPercentage,
  padHex,
  stripHexLeadingZeros,
} from '../src/utils/format';

describe('format', () => {
  describe('shortenAddress', () => {
    const fullAddress = '0x1234567890abcdef1234567890abcdef12345678';

    it('should shorten address with default chars', () => {
      expect(shortenAddress(fullAddress)).toBe('0x1234...5678');
    });

    it('should shorten with custom chars', () => {
      expect(shortenAddress(fullAddress, 6)).toBe('0x123456...345678');
      expect(shortenAddress(fullAddress, 2)).toBe('0x12...78');
    });

    it('should return empty string for empty input', () => {
      expect(shortenAddress('')).toBe('');
    });

    it('should return full address if already short', () => {
      expect(shortenAddress('0x1234')).toBe('0x1234');
    });
  });

  describe('shortenHash', () => {
    const fullHash = '0x' + 'a'.repeat(64);

    it('should shorten hash with default params', () => {
      const result = shortenHash(fullHash);
      expect(result.startsWith('0xaaaaaa')).toBe(true);
      expect(result.endsWith('aaaa')).toBe(true);
      expect(result.includes('…')).toBe(true);
    });

    it('should shorten with custom head/tail', () => {
      const result = shortenHash(fullHash, 10, 6);
      expect(result.startsWith('0x' + 'a'.repeat(10))).toBe(true);
      expect(result.endsWith('a'.repeat(6))).toBe(true);
    });

    it('should return empty for empty input', () => {
      expect(shortenHash('')).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('should format integers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1000)).toBe('1,000');
    });

    it('should format decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });

    it('should handle string input', () => {
      expect(formatNumber('1234567')).toBe('1,234,567');
    });

    it('should return original for non-finite numbers', () => {
      expect(formatNumber(Infinity)).toBe('Infinity');
      expect(formatNumber(NaN)).toBe('NaN');
    });
  });

  describe('formatBigInt', () => {
    it('should format bigint with commas', () => {
      expect(formatBigInt(1234567n)).toBe('1,234,567');
      expect(formatBigInt(1000n)).toBe('1,000');
      expect(formatBigInt(0n)).toBe('0');
    });

    it('should handle large numbers', () => {
      expect(formatBigInt(10n ** 18n)).toBe('1,000,000,000,000,000,000');
    });
  });

  describe('formatTimestamp', () => {
    it('should format millisecond timestamp', () => {
      const ts = 1704067200000; // 2024-01-01 00:00:00 UTC
      const result = formatTimestamp(ts);
      expect(result).toContain('2024');
    });

    it('should format second timestamp', () => {
      const ts = 1704067200; // 2024-01-01 00:00:00 UTC
      const result = formatTimestamp(ts);
      expect(result).toContain('2024');
    });

    it('should handle bigint timestamp', () => {
      const ts = 1704067200000n;
      const result = formatTimestamp(ts);
      expect(result).toContain('2024');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "just now" for recent timestamps', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const ts = Date.now() - 500; // 500ms ago
      expect(formatRelativeTime(ts)).toBe('just now');
    });

    it('should return seconds ago', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:30Z'));
      const ts = new Date('2024-01-01T00:00:00Z').getTime();
      expect(formatRelativeTime(ts)).toBe('30 seconds ago');
    });

    it('should return minutes ago', () => {
      vi.setSystemTime(new Date('2024-01-01T00:05:00Z'));
      const ts = new Date('2024-01-01T00:00:00Z').getTime();
      expect(formatRelativeTime(ts)).toBe('5 minutes ago');
    });

    it('should return hours ago', () => {
      vi.setSystemTime(new Date('2024-01-01T03:00:00Z'));
      const ts = new Date('2024-01-01T00:00:00Z').getTime();
      expect(formatRelativeTime(ts)).toBe('3 hours ago');
    });

    it('should return days ago', () => {
      vi.setSystemTime(new Date('2024-01-04T00:00:00Z'));
      const ts = new Date('2024-01-01T00:00:00Z').getTime();
      expect(formatRelativeTime(ts)).toBe('3 days ago');
    });

    it('should return "in the future" for future timestamps', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const ts = new Date('2024-01-02T00:00:00Z').getTime();
      expect(formatRelativeTime(ts)).toBe('in the future');
    });
  });

  describe('formatBlockNumber', () => {
    it('should format with # prefix and commas', () => {
      expect(formatBlockNumber(1234567)).toBe('#1,234,567');
      expect(formatBlockNumber(1000n)).toBe('#1,000');
    });
  });

  describe('formatGas', () => {
    it('should format gas with commas', () => {
      expect(formatGas(21000n)).toBe('21,000');
      expect(formatGas(1000000n)).toBe('1,000,000');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal percentage (0-1)', () => {
      expect(formatPercentage(0.5)).toBe('50.00%');
      expect(formatPercentage(0.123)).toBe('12.30%');
    });

    it('should format percentage (0-100)', () => {
      expect(formatPercentage(50)).toBe('50.00%');
      expect(formatPercentage(99.9)).toBe('99.90%');
    });

    it('should respect decimals parameter', () => {
      expect(formatPercentage(0.5, 0)).toBe('50%');
      expect(formatPercentage(0.12345, 3)).toBe('12.345%');
    });
  });

  describe('padHex', () => {
    it('should pad hex to specified byte length', () => {
      expect(padHex('0x1', 4)).toBe('0x00000001');
      expect(padHex('0xff', 4)).toBe('0x000000ff');
    });

    it('should handle input without 0x prefix', () => {
      expect(padHex('1', 4)).toBe('0x00000001');
    });

    it('should not truncate if already long enough', () => {
      expect(padHex('0x12345678', 4)).toBe('0x12345678');
    });
  });

  describe('stripHexLeadingZeros', () => {
    it('should strip leading zeros', () => {
      expect(stripHexLeadingZeros('0x00000001')).toBe('0x1');
      expect(stripHexLeadingZeros('0x000000ff')).toBe('0xff');
    });

    it('should preserve at least one digit', () => {
      expect(stripHexLeadingZeros('0x00000000')).toBe('0x0');
    });

    it('should handle input without 0x prefix', () => {
      expect(stripHexLeadingZeros('00001')).toBe('0x1');
    });
  });
});
