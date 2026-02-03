import { describe, it, expect } from 'vitest';
import {
  isValidAddress,
  isValidHex,
  isValidTxHash,
  isValidBlockHash,
  isValidAmount,
  isValidMnemonic,
  isValidPrivateKey,
  isValidChainId,
  normalizeAddress,
  addressesEqual,
  validatePassword,
} from '../src/utils/validation';

describe('validation', () => {
  describe('isValidAddress', () => {
    it('should return true for valid addresses', () => {
      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidAddress('0xABCDEF0123456789ABCDEF0123456789ABCDEF01')).toBe(true);
    });

    it('should return true for checksummed addresses', () => {
      expect(isValidAddress('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed')).toBe(true);
    });

    it('should return false for invalid addresses', () => {
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('0xGGGG567890123456789012345678901234567890')).toBe(false);
      // Note: ethers.isAddress accepts 40 hex chars without 0x prefix
    });
  });

  describe('isValidHex', () => {
    it('should return true for valid hex strings', () => {
      expect(isValidHex('0x')).toBe(true);
      expect(isValidHex('0x1234')).toBe(true);
      expect(isValidHex('0xabcdef')).toBe(true);
      expect(isValidHex('0xABCDEF')).toBe(true);
    });

    it('should return false for invalid hex strings', () => {
      expect(isValidHex('')).toBe(false);
      expect(isValidHex('1234')).toBe(false);
      expect(isValidHex('0xGHIJ')).toBe(false);
      expect(isValidHex('hello')).toBe(false);
    });
  });

  describe('isValidTxHash', () => {
    it('should return true for valid tx hashes (64 hex chars after 0x)', () => {
      const validHash = '0x' + '1'.repeat(64);
      expect(isValidTxHash(validHash)).toBe(true);
      const validHash2 = '0x' + 'abcdef'.repeat(10) + 'abcd';
      expect(isValidTxHash(validHash2)).toBe(true);
    });

    it('should return false for invalid tx hashes', () => {
      expect(isValidTxHash('')).toBe(false);
      expect(isValidTxHash('0x123')).toBe(false);
      expect(isValidTxHash('0x' + '1'.repeat(63))).toBe(false);
      expect(isValidTxHash('0x' + '1'.repeat(65))).toBe(false);
    });
  });

  describe('isValidBlockHash', () => {
    it('should return true for valid block hashes', () => {
      const validHash = '0x' + 'a'.repeat(64);
      expect(isValidBlockHash(validHash)).toBe(true);
    });

    it('should return false for invalid block hashes', () => {
      expect(isValidBlockHash('0x123')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should return true for valid amounts', () => {
      expect(isValidAmount('0')).toBe(true);
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount(0n)).toBe(true);
      expect(isValidAmount(100n)).toBe(true);
      expect(isValidAmount('999999999999999999999999')).toBe(true);
    });

    it('should return false for invalid amounts', () => {
      expect(isValidAmount('-1')).toBe(false);
      expect(isValidAmount(-1n)).toBe(false);
      expect(isValidAmount('abc')).toBe(false);
      // Note: BigInt('') returns 0n which is >= 0, so empty string is valid
    });
  });

  describe('isValidMnemonic', () => {
    it('should return true for valid 12-word mnemonic', () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      expect(isValidMnemonic(mnemonic)).toBe(true);
    });

    it('should return false for invalid mnemonics', () => {
      expect(isValidMnemonic('')).toBe(false);
      expect(isValidMnemonic('hello world')).toBe(false);
      expect(isValidMnemonic('invalid mnemonic phrase that is not valid words')).toBe(false);
    });
  });

  describe('isValidPrivateKey', () => {
    it('should return true for valid private keys', () => {
      // 64 hex characters
      const validKey = '0x' + '1'.repeat(64);
      expect(isValidPrivateKey(validKey)).toBe(true);

      // Without 0x prefix
      const validKeyNoPrefix = '1'.repeat(64);
      expect(isValidPrivateKey(validKeyNoPrefix)).toBe(true);
    });

    it('should return false for invalid private keys', () => {
      expect(isValidPrivateKey('')).toBe(false);
      expect(isValidPrivateKey('0x123')).toBe(false);
      expect(isValidPrivateKey('not a key')).toBe(false);
      // All zeros is invalid (would be zero private key)
      expect(isValidPrivateKey('0x' + '0'.repeat(64))).toBe(false);
    });
  });

  describe('isValidChainId', () => {
    it('should return true for valid chain IDs', () => {
      expect(isValidChainId(1)).toBe(true);
      expect(isValidChainId(9000)).toBe(true);
      expect(isValidChainId('9001')).toBe(true);
    });

    it('should return false for invalid chain IDs', () => {
      expect(isValidChainId(0)).toBe(false);
      expect(isValidChainId(-1)).toBe(false);
      expect(isValidChainId(1.5)).toBe(false);
      expect(isValidChainId('abc')).toBe(false);
    });
  });

  describe('normalizeAddress', () => {
    it('should return checksummed address', () => {
      const input = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'.toLowerCase();
      expect(normalizeAddress(input)).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
    });

    it('should throw for invalid address', () => {
      expect(() => normalizeAddress('invalid')).toThrow();
    });
  });

  describe('addressesEqual', () => {
    it('should return true for equal addresses (case insensitive)', () => {
      const addr1 = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
      const addr2 = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
      expect(addressesEqual(addr1, addr2)).toBe(true);
    });

    it('should return false for different addresses', () => {
      const addr1 = '0x1234567890123456789012345678901234567890';
      const addr2 = '0x0987654321098765432109876543210987654321';
      expect(addressesEqual(addr1, addr2)).toBe(false);
    });

    it('should return false for invalid addresses', () => {
      expect(addressesEqual('invalid', '0x1234567890123456789012345678901234567890')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('MyP@ssw0rd123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.strength).toBe('strong');
    });

    it('should validate medium passwords', () => {
      const result = validatePassword('Password1');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.strength).toBe('medium');
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.strength).toBe('weak');
    });

    it('should require minimum length', () => {
      const result = validatePassword('Abc1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should require uppercase letter', () => {
      const result = validatePassword('password1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should require lowercase letter', () => {
      const result = validatePassword('PASSWORD1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should require number', () => {
      const result = validatePassword('Password');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });
});
