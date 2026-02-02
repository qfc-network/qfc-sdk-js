import { ethers } from 'ethers';
import { QFC_DECIMALS } from '../constants';

/**
 * Parse a QFC amount string to wei (bigint)
 *
 * @param value - The amount in QFC (e.g., "1.5")
 * @returns The amount in wei as bigint
 *
 * @example
 * ```ts
 * parseQfc("1.5") // 1500000000000000000n
 * parseQfc("100") // 100000000000000000000n
 * ```
 */
export function parseQfc(value: string): bigint {
  return ethers.parseUnits(value, QFC_DECIMALS);
}

/**
 * Format wei to QFC string
 *
 * @param wei - The amount in wei
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted string in QFC
 *
 * @example
 * ```ts
 * formatQfc(1500000000000000000n) // "1.5"
 * formatQfc(1500000000000000000n, 2) // "1.50"
 * ```
 */
export function formatQfc(wei: bigint, decimals: number = 4): string {
  const formatted = ethers.formatUnits(wei, QFC_DECIMALS);
  const num = parseFloat(formatted);
  return num.toFixed(decimals);
}

/**
 * Format wei to QFC with thousands separators
 *
 * @param wei - The amount in wei
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted string with commas
 *
 * @example
 * ```ts
 * formatQfcWithCommas(1234567000000000000000000n) // "1,234,567.0000"
 * ```
 */
export function formatQfcWithCommas(wei: bigint, decimals: number = 4): string {
  const formatted = ethers.formatUnits(wei, QFC_DECIMALS);
  const [whole, fraction = ''] = formatted.split('.');
  const wholeWithCommas = whole?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return decimals > 0
    ? `${wholeWithCommas}.${paddedFraction}`
    : wholeWithCommas;
}

/**
 * Parse token amount with custom decimals
 *
 * @param value - The amount as string
 * @param decimals - Token decimals
 * @returns Amount in smallest unit as bigint
 */
export function parseTokenAmount(value: string, decimals: number): bigint {
  return ethers.parseUnits(value, decimals);
}

/**
 * Format token amount with custom decimals
 *
 * @param amount - The amount in smallest unit
 * @param tokenDecimals - Token decimals
 * @param displayDecimals - Number of decimals to display (default: 4)
 * @returns Formatted string
 */
export function formatTokenAmount(
  amount: bigint,
  tokenDecimals: number,
  displayDecimals: number = 4
): string {
  const formatted = ethers.formatUnits(amount, tokenDecimals);
  const num = parseFloat(formatted);
  return num.toFixed(displayDecimals);
}

/**
 * Convert between different unit scales
 *
 * @param value - The value to convert
 * @param fromDecimals - Source decimals
 * @param toDecimals - Target decimals
 * @returns Converted value
 */
export function convertDecimals(
  value: bigint,
  fromDecimals: number,
  toDecimals: number
): bigint {
  if (fromDecimals === toDecimals) {
    return value;
  }
  if (fromDecimals > toDecimals) {
    return value / 10n ** BigInt(fromDecimals - toDecimals);
  }
  return value * 10n ** BigInt(toDecimals - fromDecimals);
}

/**
 * Parse gwei to wei
 */
export function parseGwei(gwei: string): bigint {
  return ethers.parseUnits(gwei, 9);
}

/**
 * Format wei to gwei
 */
export function formatGwei(wei: bigint): string {
  return ethers.formatUnits(wei, 9);
}

/**
 * One QFC in wei
 */
export const ONE_QFC = 10n ** 18n;

/**
 * One gwei in wei
 */
export const ONE_GWEI = 10n ** 9n;
