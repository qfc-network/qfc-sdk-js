import { describe, it, expect, vi } from 'vitest';
import { ethers } from 'ethers';
import {
  getERC1155,
  getMulticall3,
  isContract,
  createContract,
} from '../src/contract/Contract';
import {
  ERC20_ABI,
  ERC721_ABI,
  ERC1155_ABI,
  MULTICALL3_ABI,
  CONTRACTS,
} from '../src/constants';

// Mock provider
const mockProvider = {
  getCode: vi.fn(),
} as unknown as ethers.Provider;

describe('Contract', () => {
  describe('ABI exports from constants', () => {
    it('should export ERC20_ABI', () => {
      expect(Array.isArray(ERC20_ABI)).toBe(true);
      expect(ERC20_ABI.length).toBeGreaterThan(0);
    });

    it('should export ERC721_ABI', () => {
      expect(Array.isArray(ERC721_ABI)).toBe(true);
      expect(ERC721_ABI.length).toBeGreaterThan(0);
    });

    it('should export ERC1155_ABI', () => {
      expect(Array.isArray(ERC1155_ABI)).toBe(true);
      expect(ERC1155_ABI.length).toBeGreaterThan(0);
    });

    it('should export MULTICALL3_ABI', () => {
      expect(Array.isArray(MULTICALL3_ABI)).toBe(true);
      expect(MULTICALL3_ABI.length).toBeGreaterThan(0);
    });
  });

  describe('getERC1155', () => {
    it('should create ERC1155 token interface', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const result = getERC1155(address, mockProvider);

      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('contract');
      expect(typeof result.balanceOf).toBe('function');
      expect(typeof result.balanceOfBatch).toBe('function');
      expect(typeof result.uri).toBe('function');
    });
  });

  describe('getMulticall3', () => {
    it('should create Multicall3 interface', () => {
      const result = getMulticall3(mockProvider);

      expect(result).toHaveProperty('address', CONTRACTS.MULTICALL3);
      expect(result).toHaveProperty('contract');
      expect(typeof result.aggregate).toBe('function');
      expect(typeof result.aggregate3).toBe('function');
      expect(typeof result.getEthBalance).toBe('function');
      expect(typeof result.getBlockNumber).toBe('function');
    });

    it('should accept custom address', () => {
      const customAddress = '0x1234567890123456789012345678901234567890';
      const result = getMulticall3(mockProvider, customAddress);
      expect(result.address).toBe(customAddress);
    });
  });

  describe('createContract', () => {
    it('should create contract instance', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const contract = createContract(address, ERC20_ABI, mockProvider);
      expect(contract).toBeInstanceOf(ethers.Contract);
    });
  });

  describe('isContract', () => {
    it('should return true for contract address', async () => {
      vi.mocked(mockProvider.getCode).mockResolvedValue('0x6080604052...');

      const result = await isContract(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      expect(result).toBe(true);
    });

    it('should return false for EOA (code is 0x)', async () => {
      vi.mocked(mockProvider.getCode).mockResolvedValue('0x');

      const result = await isContract(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      expect(result).toBe(false);
    });

    it('should return false for code 0x0', async () => {
      vi.mocked(mockProvider.getCode).mockResolvedValue('0x0');

      const result = await isContract(
        '0x1234567890123456789012345678901234567890',
        mockProvider
      );
      expect(result).toBe(false);
    });
  });
});
