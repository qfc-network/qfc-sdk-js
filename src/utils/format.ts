/**
 * Shorten an address for display
 *
 * @param address - The full address
 * @param chars - Number of characters to show on each end (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 *
 * @example
 * ```ts
 * shortenAddress("0x1234567890abcdef1234567890abcdef12345678")
 * // "0x1234...5678"
 * ```
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 4) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Shorten a hash for display
 *
 * @param hash - The full hash
 * @param head - Characters to show at start (default: 6)
 * @param tail - Characters to show at end (default: 4)
 * @returns Shortened hash
 */
export function shortenHash(hash: string, head: number = 6, tail: number = 4): string {
  if (!hash) return '';
  if (hash.length <= head + tail + 2) return hash;
  return `${hash.slice(0, head + 2)}…${hash.slice(-tail)}`;
}

/**
 * Format a number with thousands separators
 *
 * @param value - The number to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted string
 */
export function formatNumber(value: number | string, locale: string = 'en-US'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) {
    return String(value);
  }
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format a bigint with thousands separators
 *
 * @param value - The bigint to format
 * @returns Formatted string
 */
export function formatBigInt(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a timestamp to locale string
 *
 * @param timestamp - Unix timestamp in milliseconds or seconds
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatTimestamp(
  timestamp: number | bigint,
  options?: Intl.DateTimeFormatOptions
): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  // Assume milliseconds if > 1e12, otherwise seconds
  const ms = ts > 1e12 ? ts : ts * 1000;
  const date = new Date(ms);
  return date.toLocaleString('en-US', {
    hour12: false,
    ...options,
  });
}

/**
 * Format relative time (e.g., "5 minutes ago")
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  const ms = ts > 1e12 ? ts : ts * 1000;
  const now = Date.now();
  const diff = now - ms;

  if (diff < 0) return 'in the future';
  if (diff < 1000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)} seconds ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
  return formatTimestamp(ms);
}

/**
 * Format block number for display
 *
 * @param blockNumber - The block number
 * @returns Formatted string with # prefix
 */
export function formatBlockNumber(blockNumber: number | bigint): string {
  const num = typeof blockNumber === 'bigint' ? blockNumber : BigInt(blockNumber);
  return `#${formatBigInt(num)}`;
}

/**
 * Format gas amount
 *
 * @param gas - Gas amount
 * @returns Formatted gas string
 */
export function formatGas(gas: bigint): string {
  return formatBigInt(gas);
}

/**
 * Format percentage
 *
 * @param value - Value between 0 and 1 (or 0-100)
 * @param decimals - Decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const pct = value > 1 ? value : value * 100;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Pad hex string to specific byte length
 *
 * @param hex - Hex string
 * @param bytes - Target byte length
 * @returns Padded hex string
 */
export function padHex(hex: string, bytes: number): string {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  return '0x' + clean.padStart(bytes * 2, '0');
}

/**
 * Strip leading zeros from hex string
 *
 * @param hex - Hex string
 * @returns Hex string without leading zeros
 */
export function stripHexLeadingZeros(hex: string): string {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const stripped = clean.replace(/^0+/, '') || '0';
  return '0x' + stripped;
}
