import type { NetworkConfig, NetworkKey } from '../types';

/**
 * QFC Network configurations
 */
export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  localhost: {
    chainId: 9000,
    chainIdHex: '0x2328',
    name: 'QFC Local',
    rpcUrl: 'http://127.0.0.1:8545',
    wsUrl: 'ws://127.0.0.1:8546',
    explorerUrl: 'http://127.0.0.1:3000',
    symbol: 'QFC',
    decimals: 18,
  },
  testnet: {
    chainId: 9000,
    chainIdHex: '0x2328',
    name: 'QFC Testnet',
    rpcUrl: 'https://rpc.testnet.qfc.network',
    wsUrl: 'wss://ws.testnet.qfc.network',
    explorerUrl: 'https://explorer.testnet.qfc.network',
    symbol: 'QFC',
    decimals: 18,
    faucetUrl: 'https://faucet.testnet.qfc.network',
  },
  mainnet: {
    chainId: 9001,
    chainIdHex: '0x2329',
    name: 'QFC Mainnet',
    rpcUrl: 'https://rpc.qfc.network',
    wsUrl: 'wss://ws.qfc.network',
    explorerUrl: 'https://explorer.qfc.network',
    symbol: 'QFC',
    decimals: 18,
  },
} as const;

/**
 * Default network (testnet for development)
 */
export const DEFAULT_NETWORK = NETWORKS.testnet;

/**
 * Get network by chain ID
 */
export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return Object.values(NETWORKS).find((n) => n.chainId === chainId);
}

/**
 * Get network by name
 */
export function getNetwork(name: NetworkKey): NetworkConfig {
  return NETWORKS[name];
}

/**
 * Check if a chain ID is a QFC network
 */
export function isQfcNetwork(chainId: number): boolean {
  return chainId === 9000 || chainId === 9001;
}
