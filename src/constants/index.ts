/**
 * QFC SDK Constants
 */

export {
  NETWORKS,
  DEFAULT_NETWORK,
  getNetwork,
  getNetworkByChainId,
  isQfcNetwork,
} from './networks';

export { SDK_ERRORS, QfcError, createError } from './errors';

export {
  ERC20_ABI,
  ERC721_ABI,
  ERC1155_ABI,
  QFC_STAKING_ABI,
  WRAPPED_TOKEN_ABI,
  MULTICALL3_ABI,
} from './abis';

/**
 * Token decimals for QFC
 */
export const QFC_DECIMALS = 18;

/**
 * Minimum stake requirement (10,000 QFC in wei)
 */
export const MIN_STAKE = 10000n * 10n ** 18n;

/**
 * Minimum delegation (100 QFC in wei)
 */
export const MIN_DELEGATION = 100n * 10n ** 18n;

/**
 * Unstake delay (7 days in seconds)
 */
export const UNSTAKE_DELAY = 7n * 24n * 60n * 60n;

/**
 * Block time in milliseconds
 */
export const BLOCK_TIME_MS = 3000;

/**
 * Epoch duration in seconds
 */
export const EPOCH_DURATION = 10;

/**
 * Maximum validators in the active set
 */
export const MAX_VALIDATORS = 1000;

/**
 * Gas limits for common operations
 */
export const GAS_LIMITS = {
  /** Simple transfer */
  TRANSFER: 21000n,
  /** ERC-20 transfer */
  ERC20_TRANSFER: 65000n,
  /** ERC-20 approve */
  ERC20_APPROVE: 46000n,
  /** Contract deployment (estimate) */
  CONTRACT_DEPLOY: 500000n,
  /** Stake operation */
  STAKE: 100000n,
  /** Unstake operation */
  UNSTAKE: 80000n,
  /** Delegate operation */
  DELEGATE: 120000n,
  /** Claim rewards */
  CLAIM_REWARDS: 60000n,
  /** Register validator */
  REGISTER_VALIDATOR: 200000n,
} as const;

/**
 * Well-known contract addresses
 */
export const CONTRACTS = {
  /** Staking contract address (testnet) */
  STAKING_TESTNET: '0x0000000000000000000000000000000000001000',
  /** Staking contract address (mainnet) */
  STAKING_MAINNET: '0x0000000000000000000000000000000000001000',
  /** Multicall3 address */
  MULTICALL3: '0xcA11bde05977b3631167028862bE2a173976CA11',
} as const;
