/**
 * Transaction type enum
 */
export enum TransactionType {
  /** Standard transfer */
  Transfer = 0,
  /** Contract creation */
  ContractCreate = 1,
  /** Contract call */
  ContractCall = 2,
  /** Stake tokens */
  Stake = 3,
  /** Unstake tokens */
  Unstake = 4,
  /** Register as validator */
  ValidatorRegister = 5,
  /** Exit as validator */
  ValidatorExit = 6,
  /** Delegate to validator */
  Delegate = 7,
  /** Undelegate from validator */
  Undelegate = 8,
  /** Claim rewards */
  ClaimRewards = 9,
}

/**
 * Transaction request for sending
 */
export interface TransactionRequest {
  /** Recipient address (null for contract creation) */
  to?: string | null;
  /** Sender address (usually set by wallet) */
  from?: string;
  /** Transaction nonce */
  nonce?: number;
  /** Gas limit */
  gasLimit?: bigint;
  /** Gas price (legacy) */
  gasPrice?: bigint;
  /** Max fee per gas (EIP-1559) */
  maxFeePerGas?: bigint;
  /** Max priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas?: bigint;
  /** Transaction data */
  data?: string;
  /** Value to send (in wei) */
  value?: bigint;
  /** Chain ID */
  chainId?: number;
  /** Transaction type */
  type?: number;
  /** Access list (EIP-2930) */
  accessList?: Array<{ address: string; storageKeys: string[] }>;
}

/**
 * Signed transaction response from RPC
 */
export interface TransactionResponse {
  /** Transaction hash */
  hash: string;
  /** Transaction type */
  type: number;
  /** Chain ID */
  chainId: number;
  /** Sender nonce */
  nonce: number;
  /** Gas limit */
  gasLimit: bigint;
  /** Gas price */
  gasPrice: bigint;
  /** Max fee per gas (EIP-1559) */
  maxFeePerGas?: bigint;
  /** Max priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas?: bigint;
  /** Sender address */
  from: string;
  /** Recipient address */
  to: string | null;
  /** Value transferred (wei) */
  value: bigint;
  /** Transaction data */
  data: string;
  /** Signature v */
  v: number;
  /** Signature r */
  r: string;
  /** Signature s */
  s: string;
  /** Block hash (null if pending) */
  blockHash: string | null;
  /** Block number (null if pending) */
  blockNumber: bigint | null;
  /** Transaction index in block (null if pending) */
  transactionIndex: number | null;
}

/**
 * Transaction receipt status
 */
export enum ReceiptStatus {
  /** Transaction failed */
  Failure = 0,
  /** Transaction succeeded */
  Success = 1,
}

/**
 * Event log from transaction execution
 */
export interface Log {
  /** Contract address that emitted the log */
  address: string;
  /** Indexed topics */
  topics: string[];
  /** Non-indexed data */
  data: string;
  /** Block hash */
  blockHash: string;
  /** Block number */
  blockNumber: bigint;
  /** Transaction hash */
  transactionHash: string;
  /** Transaction index in block */
  transactionIndex: number;
  /** Log index in block */
  logIndex: number;
  /** Whether this log was removed due to reorg */
  removed: boolean;
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  /** Transaction hash */
  transactionHash: string;
  /** Transaction index in block */
  transactionIndex: number;
  /** Block hash */
  blockHash: string;
  /** Block number */
  blockNumber: bigint;
  /** Sender address */
  from: string;
  /** Recipient address */
  to: string | null;
  /** Contract address (if contract creation) */
  contractAddress: string | null;
  /** Cumulative gas used up to this transaction */
  cumulativeGasUsed: bigint;
  /** Gas used by this transaction */
  gasUsed: bigint;
  /** Effective gas price */
  effectiveGasPrice: bigint;
  /** Transaction status (1 = success, 0 = failure) */
  status: ReceiptStatus;
  /** Logs emitted */
  logs: Log[];
  /** Logs bloom filter */
  logsBloom: string;
  /** Transaction type */
  type: number;
}

/**
 * Fee data for transaction
 */
export interface FeeData {
  /** Gas price for legacy transactions */
  gasPrice: bigint;
  /** Max fee per gas for EIP-1559 */
  maxFeePerGas: bigint;
  /** Max priority fee for EIP-1559 */
  maxPriorityFeePerGas: bigint;
}

/**
 * Pending transaction in mempool
 */
export interface PendingTransaction extends TransactionResponse {
  /** When the transaction was first seen */
  firstSeen?: bigint;
}
