import type { TransactionResponse } from './transaction';

/**
 * Block header information
 */
export interface BlockHeader {
  /** Block version */
  version: number;
  /** Block height/number */
  number: bigint;
  /** Hash of this block */
  hash: string;
  /** Hash of the parent block */
  parentHash: string;
  /** State root (Merkle Patricia Trie) */
  stateRoot: string;
  /** Transactions root (Merkle Tree) */
  transactionsRoot: string;
  /** Receipts root (Merkle Tree) */
  receiptsRoot: string;
  /** Block producer/miner address */
  producer: string;
  /** Producer's contribution score */
  contributionScore: bigint;
  /** Block timestamp (milliseconds) */
  timestamp: bigint;
  /** Gas limit for this block */
  gasLimit: bigint;
  /** Gas used in this block */
  gasUsed: bigint;
  /** Extra data (max 32 bytes) */
  extraData: string;
}

/**
 * Full block with transactions
 */
export interface Block extends BlockHeader {
  /** Number of transactions in this block */
  transactionCount: number;
  /** Size of the block in bytes */
  size?: number;
}

/**
 * Block with full transaction objects
 */
export interface BlockWithTransactions extends Block {
  /** Full transaction objects */
  transactions: TransactionResponse[];
}

/**
 * Block tag for specifying block reference
 */
export type BlockTag = 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';

/**
 * Block identifier - can be height, hash, or tag
 */
export type BlockIdentifier = bigint | number | string | BlockTag;

/**
 * Logs bloom filter (256 bytes as hex)
 */
export type Bloom = string;

/**
 * Vote in the consensus
 */
export interface Vote {
  /** Block hash being voted on */
  blockHash: string;
  /** Block height */
  blockHeight: bigint;
  /** Voter address */
  voter: string;
  /** Vote decision */
  decision: 'accept' | 'reject';
  /** Vote timestamp */
  timestamp: bigint;
  /** Vote signature */
  signature: string;
}
