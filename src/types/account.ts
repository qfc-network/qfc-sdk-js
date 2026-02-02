/**
 * Account type
 */
export enum AccountType {
  /** Externally Owned Account (user) */
  EOA = 'eoa',
  /** Smart Contract */
  Contract = 'contract',
  /** Validator account */
  Validator = 'validator',
}

/**
 * Account state
 */
export interface Account {
  /** Account address */
  address: string;
  /** Account balance (wei) */
  balance: bigint;
  /** Transaction nonce */
  nonce: bigint;
  /** Code hash (for contracts) */
  codeHash?: string;
  /** Storage root (for contracts) */
  storageRoot?: string;
  /** Account type */
  type: AccountType;
}

/**
 * Account with extended information
 */
export interface AccountInfo extends Account {
  /** Whether this account is a contract */
  isContract: boolean;
  /** Contract code (if applicable and requested) */
  code?: string;
  /** Number of transactions sent */
  transactionCount?: number;
  /** First seen block */
  firstSeenBlock?: bigint;
  /** Last active block */
  lastActiveBlock?: bigint;
}

/**
 * Staking information for an account
 */
export interface StakeInfo {
  /** Account address */
  address: string;
  /** Total staked amount (wei) */
  stakedAmount: bigint;
  /** Amount currently unstaking (wei) */
  unstakingAmount: bigint;
  /** When unstaking completes (timestamp) */
  unstakingCompletesAt?: bigint;
  /** Claimable rewards (wei) */
  pendingRewards: bigint;
  /** Total rewards earned (wei) */
  totalRewardsEarned: bigint;
  /** Whether this account is a validator */
  isValidator: boolean;
  /** Validator address (if delegating) */
  delegatedTo?: string;
}

/**
 * Delegation information
 */
export interface Delegation {
  /** Delegator address */
  delegator: string;
  /** Validator address */
  validator: string;
  /** Delegated amount (wei) */
  amount: bigint;
  /** Pending rewards (wei) */
  pendingRewards: bigint;
  /** When delegation started */
  startedAt: bigint;
}

/**
 * Token balance (ERC-20)
 */
export interface TokenBalance {
  /** Token contract address */
  tokenAddress: string;
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Token decimals */
  decimals: number;
  /** Balance (in smallest unit) */
  balance: bigint;
  /** Balance formatted with decimals */
  balanceFormatted: string;
}

/**
 * NFT token (ERC-721)
 */
export interface NFTToken {
  /** Token contract address */
  contractAddress: string;
  /** Token ID */
  tokenId: bigint;
  /** Token name */
  name?: string;
  /** Token symbol */
  symbol?: string;
  /** Token URI */
  tokenUri?: string;
  /** Token metadata */
  metadata?: Record<string, unknown>;
}
