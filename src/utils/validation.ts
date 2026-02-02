import { ethers } from 'ethers';

/**
 * Check if a string is a valid Ethereum/QFC address
 *
 * @param address - The address to validate
 * @returns True if valid address
 *
 * @example
 * ```ts
 * isValidAddress("0x1234...") // true
 * isValidAddress("invalid") // false
 * ```
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid hex string
 *
 * @param hex - The hex string to validate
 * @returns True if valid hex
 */
export function isValidHex(hex: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(hex);
}

/**
 * Check if a string is a valid transaction hash
 *
 * @param hash - The hash to validate (66 characters including 0x)
 * @returns True if valid tx hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

/**
 * Check if a string is a valid block hash
 *
 * @param hash - The hash to validate
 * @returns True if valid block hash
 */
export function isValidBlockHash(hash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

/**
 * Check if a value is a valid non-negative amount
 *
 * @param value - The value to validate
 * @returns True if valid non-negative amount
 */
export function isValidAmount(value: string | bigint): boolean {
  try {
    const bn = typeof value === 'bigint' ? value : BigInt(value);
    return bn >= 0n;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid mnemonic phrase
 *
 * @param phrase - The mnemonic phrase
 * @returns True if valid mnemonic
 */
export function isValidMnemonic(phrase: string): boolean {
  try {
    return ethers.Mnemonic.isValidMnemonic(phrase);
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid private key
 *
 * @param key - The private key (with or without 0x prefix)
 * @returns True if valid private key
 */
export function isValidPrivateKey(key: string): boolean {
  try {
    const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
    if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
      return false;
    }
    new ethers.Wallet(key.startsWith('0x') ? key : `0x${key}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a chain ID
 *
 * @param chainId - The chain ID
 * @returns True if valid chain ID
 */
export function isValidChainId(chainId: number | string): boolean {
  const id = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
  return Number.isInteger(id) && id > 0;
}

/**
 * Normalize address to checksum format
 *
 * @param address - The address to normalize
 * @returns Checksummed address
 * @throws If invalid address
 */
export function normalizeAddress(address: string): string {
  return ethers.getAddress(address);
}

/**
 * Check if two addresses are equal (case-insensitive)
 *
 * @param a - First address
 * @param b - Second address
 * @returns True if addresses are equal
 */
export function addressesEqual(a: string, b: string): boolean {
  try {
    return ethers.getAddress(a) === ethers.getAddress(b);
  } catch {
    return false;
  }
}

/**
 * Validate password strength
 *
 * @param password - The password to validate
 * @returns Validation result with errors
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    strength = password.length >= 12 && /[!@#$%^&*]/.test(password) ? 'strong' : 'medium';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}
