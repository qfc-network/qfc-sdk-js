import { describe, it, expect, beforeEach } from 'vitest';
import { ethers } from 'ethers';
import { QfcWallet, createWallet } from '../src/wallet/QfcWallet';

// Test private key (DO NOT USE IN PRODUCTION)
const TEST_PRIVATE_KEY = '0x' + '1'.repeat(64);
const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('QfcWallet', () => {
  describe('constructor', () => {
    it('should create wallet from private key', () => {
      const wallet = new QfcWallet(TEST_PRIVATE_KEY);
      expect(wallet).toBeInstanceOf(QfcWallet);
      expect(wallet.address).toBeDefined();
      expect(wallet.address.startsWith('0x')).toBe(true);
      expect(wallet.address.length).toBe(42);
    });

    it('should handle key without 0x prefix', () => {
      const wallet = new QfcWallet('1'.repeat(64));
      expect(wallet).toBeInstanceOf(QfcWallet);
    });
  });

  describe('static methods', () => {
    describe('createRandomWithMnemonic', () => {
      it('should create a random wallet with mnemonic', () => {
        const result = QfcWallet.createRandomWithMnemonic();
        expect(result.wallet).toBeInstanceOf(QfcWallet);
        expect(result.mnemonic).toBeDefined();
        expect(result.mnemonic.split(' ').length).toBeGreaterThanOrEqual(12);
        expect(result.wallet.address.startsWith('0x')).toBe(true);
      });

      it('should create different wallets each time', () => {
        const result1 = QfcWallet.createRandomWithMnemonic();
        const result2 = QfcWallet.createRandomWithMnemonic();
        expect(result1.wallet.address).not.toBe(result2.wallet.address);
        expect(result1.mnemonic).not.toBe(result2.mnemonic);
      });
    });

    describe('fromMnemonic', () => {
      it('should create wallet from mnemonic', () => {
        const wallet = QfcWallet.fromMnemonic(TEST_MNEMONIC);
        expect(wallet).toBeInstanceOf(QfcWallet);
        expect(wallet.address).toBeDefined();
      });

      it('should create same wallet from same mnemonic', () => {
        const wallet1 = QfcWallet.fromMnemonic(TEST_MNEMONIC);
        const wallet2 = QfcWallet.fromMnemonic(TEST_MNEMONIC);
        expect(wallet1.address).toBe(wallet2.address);
      });

      it('should throw for invalid mnemonic', () => {
        expect(() => QfcWallet.fromMnemonic('invalid mnemonic')).toThrow();
      });
    });
  });

  describe('instance methods', () => {
    let wallet: QfcWallet;

    beforeEach(() => {
      wallet = new QfcWallet(TEST_PRIVATE_KEY);
    });

    describe('connect', () => {
      it('should return a new QfcWallet', () => {
        const connected = wallet.connect(null);
        expect(connected).toBeInstanceOf(QfcWallet);
      });
    });

    describe('signMessage', () => {
      it('should sign message', async () => {
        const message = 'Hello, World!';
        const signature = await wallet.signMessage(message);
        expect(signature).toBeDefined();
        expect(signature.startsWith('0x')).toBe(true);
      });

      it('should produce deterministic signatures', async () => {
        const message = 'Hello, World!';
        const sig1 = await wallet.signMessage(message);
        const sig2 = await wallet.signMessage(message);
        expect(sig1).toBe(sig2);
      });

      it('should produce different signatures for different messages', async () => {
        const sig1 = await wallet.signMessage('Message 1');
        const sig2 = await wallet.signMessage('Message 2');
        expect(sig1).not.toBe(sig2);
      });
    });

    describe('signTypedData', () => {
      it('should sign EIP-712 typed data', async () => {
        const domain = {
          name: 'Test',
          version: '1',
          chainId: 9000,
          verifyingContract: '0x1234567890123456789012345678901234567890',
        };

        const types = {
          Message: [{ name: 'content', type: 'string' }],
        };

        const value = {
          content: 'Hello, World!',
        };

        const signature = await wallet.signTypedData(domain, types, value);
        expect(signature).toBeDefined();
        expect(signature.startsWith('0x')).toBe(true);
      });
    });

    describe('getAddress', () => {
      it('should return checksummed address', async () => {
        const address = await wallet.getAddress();
        expect(address).toBe(wallet.address);
        expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      });
    });
  });

  describe('staking methods', () => {
    let wallet: QfcWallet;

    beforeEach(() => {
      wallet = new QfcWallet(TEST_PRIVATE_KEY);
    });

    it('should have stake method', () => {
      expect(typeof wallet.stake).toBe('function');
    });

    it('should have unstake method', () => {
      expect(typeof wallet.unstake).toBe('function');
    });

    it('should have claimRewards method', () => {
      expect(typeof wallet.claimRewards).toBe('function');
    });

    it('should have delegate method', () => {
      expect(typeof wallet.delegate).toBe('function');
    });

    it('should have undelegate method', () => {
      expect(typeof wallet.undelegate).toBe('function');
    });

    it('should have registerValidator method', () => {
      expect(typeof wallet.registerValidator).toBe('function');
    });

    it('should have exitValidator method', () => {
      expect(typeof wallet.exitValidator).toBe('function');
    });

    it('should have getStakeInfo method', () => {
      expect(typeof wallet.getStakeInfo).toBe('function');
    });

    it('should have getDelegation method', () => {
      expect(typeof wallet.getDelegation).toBe('function');
    });
  });
});

describe('createWallet', () => {
  it('should create wallet from private key', () => {
    const wallet = createWallet(TEST_PRIVATE_KEY);
    expect(wallet).toBeInstanceOf(QfcWallet);
  });

  it('should create wallet from mnemonic', () => {
    const wallet = createWallet(TEST_MNEMONIC);
    expect(wallet).toBeInstanceOf(QfcWallet);
  });

  it('should create random wallet', () => {
    const result = createWallet('random');
    expect(result).toHaveProperty('wallet');
    expect(result).toHaveProperty('mnemonic');
    expect((result as { wallet: QfcWallet }).wallet).toBeInstanceOf(QfcWallet);
  });
});
