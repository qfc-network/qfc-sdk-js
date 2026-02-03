import { describe, it, expect } from 'vitest';
import {
  NETWORKS,
  QFC_DECIMALS,
  MIN_STAKE,
  MIN_DELEGATION,
  UNSTAKE_DELAY,
  GAS_LIMITS,
  SDK_ERRORS,
  CONTRACTS,
  getNetworkByChainId,
} from '../src/constants';

describe('constants', () => {
  describe('NETWORKS', () => {
    it('should have localhost network', () => {
      expect(NETWORKS.localhost).toBeDefined();
      expect(NETWORKS.localhost.chainId).toBe(9000);
      expect(NETWORKS.localhost.rpcUrl).toContain('127.0.0.1');
    });

    it('should have testnet network', () => {
      expect(NETWORKS.testnet).toBeDefined();
      expect(NETWORKS.testnet.chainId).toBe(9000);
      expect(NETWORKS.testnet.rpcUrl).toContain('testnet');
    });

    it('should have mainnet network', () => {
      expect(NETWORKS.mainnet).toBeDefined();
      expect(NETWORKS.mainnet.chainId).toBe(9001);
      expect(NETWORKS.mainnet.rpcUrl).toContain('rpc.qfc.network');
    });

    it('should have valid network config structure', () => {
      Object.values(NETWORKS).forEach((network) => {
        expect(network).toHaveProperty('name');
        expect(network).toHaveProperty('chainId');
        expect(network).toHaveProperty('chainIdHex');
        expect(network).toHaveProperty('rpcUrl');
        expect(network).toHaveProperty('symbol');
        expect(network).toHaveProperty('decimals');

        expect(typeof network.name).toBe('string');
        expect(typeof network.chainId).toBe('number');
        expect(typeof network.rpcUrl).toBe('string');
        expect(network.chainIdHex.startsWith('0x')).toBe(true);
      });
    });
  });

  describe('getNetworkByChainId', () => {
    it('should return localhost for chain ID 9000', () => {
      const network = getNetworkByChainId(9000);
      expect(network?.chainId).toBe(9000);
    });

    it('should return mainnet for chain ID 9001', () => {
      const network = getNetworkByChainId(9001);
      expect(network?.chainId).toBe(9001);
    });

    it('should return undefined for unknown chain ID', () => {
      const network = getNetworkByChainId(99999);
      expect(network).toBeUndefined();
    });
  });

  describe('QFC_DECIMALS', () => {
    it('should be 18', () => {
      expect(QFC_DECIMALS).toBe(18);
    });
  });

  describe('staking constants', () => {
    it('should have MIN_STAKE defined as bigint', () => {
      expect(MIN_STAKE).toBeDefined();
      expect(typeof MIN_STAKE).toBe('bigint');
      expect(MIN_STAKE).toBeGreaterThan(0n);
      // 10,000 QFC in wei
      expect(MIN_STAKE).toBe(10000n * 10n ** 18n);
    });

    it('should have MIN_DELEGATION defined as bigint', () => {
      expect(MIN_DELEGATION).toBeDefined();
      expect(typeof MIN_DELEGATION).toBe('bigint');
      expect(MIN_DELEGATION).toBeGreaterThan(0n);
      expect(MIN_DELEGATION).toBeLessThan(MIN_STAKE);
      // 100 QFC in wei
      expect(MIN_DELEGATION).toBe(100n * 10n ** 18n);
    });

    it('should have UNSTAKE_DELAY defined as bigint', () => {
      expect(UNSTAKE_DELAY).toBeDefined();
      expect(typeof UNSTAKE_DELAY).toBe('bigint');
      expect(UNSTAKE_DELAY).toBeGreaterThan(0n);
      // 7 days in seconds
      expect(UNSTAKE_DELAY).toBe(7n * 24n * 60n * 60n);
    });
  });

  describe('GAS_LIMITS', () => {
    it('should have standard gas limits defined', () => {
      expect(GAS_LIMITS).toBeDefined();
      expect(GAS_LIMITS.TRANSFER).toBeDefined();
      expect(GAS_LIMITS.STAKE).toBeDefined();
      expect(GAS_LIMITS.UNSTAKE).toBeDefined();
      expect(GAS_LIMITS.DELEGATE).toBeDefined();
    });

    it('should have reasonable gas limits', () => {
      expect(GAS_LIMITS.TRANSFER).toBe(21000n);
      expect(GAS_LIMITS.STAKE).toBeGreaterThan(21000n);
      expect(GAS_LIMITS.UNSTAKE).toBeGreaterThan(21000n);
    });

    it('should have ERC20 gas limits', () => {
      expect(GAS_LIMITS.ERC20_TRANSFER).toBeDefined();
      expect(GAS_LIMITS.ERC20_APPROVE).toBeDefined();
    });
  });

  describe('SDK_ERRORS', () => {
    it('should have error definitions', () => {
      expect(SDK_ERRORS).toBeDefined();
      expect(typeof SDK_ERRORS).toBe('object');
    });
  });

  describe('CONTRACTS', () => {
    it('should have known contract addresses', () => {
      expect(CONTRACTS).toBeDefined();
      expect(CONTRACTS.STAKING_TESTNET).toBeDefined();
      expect(CONTRACTS.STAKING_MAINNET).toBeDefined();
      expect(CONTRACTS.MULTICALL3).toBeDefined();
    });

    it('should have valid addresses', () => {
      expect(CONTRACTS.STAKING_TESTNET.startsWith('0x')).toBe(true);
      expect(CONTRACTS.STAKING_MAINNET.startsWith('0x')).toBe(true);
      expect(CONTRACTS.MULTICALL3.startsWith('0x')).toBe(true);
    });
  });
});
