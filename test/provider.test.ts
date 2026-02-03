import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QfcProvider, createProvider } from '../src/provider/QfcProvider';
import { NETWORKS } from '../src/constants';

describe('QfcProvider', () => {
  let provider: QfcProvider;
  let sendSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Create provider with a static network to avoid network detection
    provider = new QfcProvider('http://localhost:8545', { chainId: 9000, name: 'test' });

    // Spy on the send method to mock RPC calls
    sendSpy = vi.spyOn(provider, 'send');

    // Mock RPC responses
    sendSpy.mockImplementation(async (method: string, params: unknown[]) => {
      switch (method) {
        case 'qfc_getValidators':
          return [
            {
              address: '0x1234567890123456789012345678901234567890',
              totalStake: '1000000000000000000000',
              contributionScore: 0.95,
              commission: 5,
              status: 'active',
              uptime: 99.9,
              moniker: 'Validator1',
            },
          ];
        case 'qfc_getValidator':
          return {
            address: params[0],
            operatorAddress: params[0],
            totalStake: '1000000000000000000000',
            selfStake: '500000000000000000000',
            delegatedStake: '500000000000000000000',
            delegatorCount: 10,
            contributionScore: 0.95,
            commission: 5,
            status: 'active',
            uptime: 99.9,
            blocksProduced: '1000',
            blocksMissed: '5',
            totalRewards: '100000000000000000000',
            registeredAt: '1704067200000',
            lastActiveAt: '1704153600000',
            moniker: 'Validator1',
          };
        case 'qfc_getContributionScore':
          return 0.95;
        case 'qfc_getEpoch':
          return {
            number: '100',
            startTime: '1704067200000',
            durationMs: '86400000',
            slot: 50,
          };
        case 'qfc_getNetworkStats':
          return {
            latestBlock: '1000000',
            latestTimestamp: '1704153600000',
            avgBlockTimeMs: 300,
            tps: 1000,
            activeAddresses: 50000,
            totalValidators: 100,
            activeValidators: 95,
            totalStaked: '1000000000000000000000000',
          };
        case 'qfc_getNodeInfo':
          return {
            version: '1.0.0',
            chainId: 9000,
            peerCount: 50,
            isValidator: false,
            syncing: false,
          };
        case 'qfc_getPendingTransactions':
          return ['0x' + '1'.repeat(64), '0x' + '2'.repeat(64)];
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create provider with URL', () => {
      const p = new QfcProvider('http://localhost:8545', { chainId: 9000, name: 'test' });
      expect(p).toBeInstanceOf(QfcProvider);
    });

    it('should create provider with network config', () => {
      const p = new QfcProvider(
        NETWORKS.testnet.rpcUrl,
        NETWORKS.testnet
      );
      expect(p).toBeInstanceOf(QfcProvider);
      expect(p.networkConfig).toBe(NETWORKS.testnet);
    });
  });

  describe('getValidators', () => {
    it('should return validator list', async () => {
      const validators = await provider.getValidators();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0);
      expect(validators[0]).toHaveProperty('address');
      expect(validators[0]).toHaveProperty('totalStake');
      expect(validators[0]).toHaveProperty('contributionScore');
      expect(sendSpy).toHaveBeenCalledWith('qfc_getValidators', []);
    });
  });

  describe('getValidator', () => {
    it('should return validator details', async () => {
      const validator = await provider.getValidator(
        '0x1234567890123456789012345678901234567890'
      );
      expect(validator).not.toBeNull();
      expect(validator?.address).toBe('0x1234567890123456789012345678901234567890');
      expect(validator?.totalStake).toBeDefined();
      expect(validator?.selfStake).toBeDefined();
      expect(validator?.delegatedStake).toBeDefined();
      expect(sendSpy).toHaveBeenCalledWith('qfc_getValidator', ['0x1234567890123456789012345678901234567890']);
    });
  });

  describe('getContributionScore', () => {
    it('should return contribution score', async () => {
      const score = await provider.getContributionScore(
        '0x1234567890123456789012345678901234567890'
      );
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('getEpoch', () => {
    it('should return epoch info', async () => {
      const epoch = await provider.getEpoch();
      expect(epoch).toHaveProperty('number');
      expect(epoch).toHaveProperty('startTime');
      expect(epoch).toHaveProperty('durationMs');
      expect(epoch).toHaveProperty('slot');
      expect(typeof epoch.number).toBe('bigint');
    });
  });

  describe('getNetworkStats', () => {
    it('should return network statistics', async () => {
      const stats = await provider.getNetworkStats();
      expect(stats).toHaveProperty('latestBlock');
      expect(stats).toHaveProperty('tps');
      expect(stats).toHaveProperty('totalValidators');
      expect(stats).toHaveProperty('activeValidators');
      expect(stats).toHaveProperty('totalStaked');
      expect(typeof stats.latestBlock).toBe('bigint');
    });
  });

  describe('getNodeInfo', () => {
    it('should return node info', async () => {
      const info = await provider.getNodeInfo();
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('chainId');
      expect(info).toHaveProperty('peerCount');
      expect(info).toHaveProperty('isValidator');
      expect(info).toHaveProperty('syncStatus');
    });
  });

  describe('getPendingTransactions', () => {
    it('should return pending transaction hashes', async () => {
      const pending = await provider.getPendingTransactions();
      expect(Array.isArray(pending)).toBe(true);
      pending.forEach((hash) => {
        expect(hash.startsWith('0x')).toBe(true);
      });
    });
  });
});

describe('createProvider', () => {
  it('should create provider from URL', () => {
    const provider = createProvider('http://localhost:8545');
    expect(provider).toBeInstanceOf(QfcProvider);
  });

  it('should create provider from network config', () => {
    const provider = createProvider(NETWORKS.testnet);
    expect(provider).toBeInstanceOf(QfcProvider);
  });
});
