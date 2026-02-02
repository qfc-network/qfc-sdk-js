/**
 * Network configuration for QFC blockchain
 */
export interface NetworkConfig {
  /** Chain ID as number */
  chainId: number;
  /** Chain ID as hex string (e.g., '0x2328') */
  chainIdHex: string;
  /** Human-readable network name */
  name: string;
  /** JSON-RPC endpoint URL */
  rpcUrl: string;
  /** WebSocket endpoint URL (optional) */
  wsUrl?: string;
  /** Block explorer URL */
  explorerUrl: string;
  /** Native token symbol */
  symbol: string;
  /** Native token decimals (always 18 for QFC) */
  decimals: number;
  /** Faucet URL for testnet (optional) */
  faucetUrl?: string;
}

/**
 * Network identifier keys
 */
export type NetworkKey = 'localhost' | 'testnet' | 'mainnet';

/**
 * Epoch information for PoC consensus
 */
export interface EpochInfo {
  /** Current epoch number */
  number: bigint;
  /** Epoch start timestamp (milliseconds) */
  startTime: bigint;
  /** Epoch duration (milliseconds) */
  durationMs: bigint;
  /** Current slot within the epoch */
  slot?: number;
}

/**
 * Network statistics
 */
export interface NetworkStats {
  /** Latest block height */
  latestBlock: bigint;
  /** Latest block timestamp (milliseconds) */
  latestTimestamp: bigint;
  /** Average block time (milliseconds) */
  avgBlockTimeMs: number;
  /** Transactions per second */
  tps: number;
  /** Number of active addresses (24h) */
  activeAddresses: number;
  /** Total number of validators */
  totalValidators: number;
  /** Number of active validators */
  activeValidators: number;
  /** Total staked amount (wei) */
  totalStaked: bigint;
}

/**
 * Sync status of the node
 */
export interface SyncStatus {
  /** Whether the node is currently syncing */
  syncing: boolean;
  /** Starting block of sync (if syncing) */
  startingBlock?: bigint;
  /** Current block of sync (if syncing) */
  currentBlock?: bigint;
  /** Highest block known (if syncing) */
  highestBlock?: bigint;
}

/**
 * Node information
 */
export interface NodeInfo {
  /** Node software version */
  version: string;
  /** Chain ID */
  chainId: number;
  /** Number of connected peers */
  peerCount: number;
  /** Whether this node is a validator */
  isValidator: boolean;
  /** Current sync status */
  syncStatus: SyncStatus;
}
