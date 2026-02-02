/**
 * Validator status
 */
export enum ValidatorStatus {
  /** Pending activation */
  Pending = 'pending',
  /** Active and participating */
  Active = 'active',
  /** Temporarily jailed */
  Jailed = 'jailed',
  /** Exiting */
  Exiting = 'exiting',
  /** Fully exited */
  Exited = 'exited',
  /** Slashed and removed */
  Slashed = 'slashed',
}

/**
 * Contribution score breakdown
 */
export interface ContributionScoreBreakdown {
  /** Stake contribution (30% weight) */
  stake: number;
  /** Compute contribution (20% weight) */
  compute: number;
  /** Uptime contribution (15% weight) */
  uptime: number;
  /** Validation accuracy (15% weight) */
  accuracy: number;
  /** Network service quality (10% weight) */
  network: number;
  /** Storage contribution (5% weight) */
  storage: number;
  /** Historical reputation (5% weight) */
  reputation: number;
  /** Total score (0-1) */
  total: number;
}

/**
 * Validator information
 */
export interface Validator {
  /** Validator address */
  address: string;
  /** Operator address (who controls the validator) */
  operatorAddress: string;
  /** Total staked amount (own + delegated) */
  totalStake: bigint;
  /** Self-staked amount */
  selfStake: bigint;
  /** Delegated amount from others */
  delegatedStake: bigint;
  /** Number of delegators */
  delegatorCount: number;
  /** Contribution score (0-1) */
  contributionScore: number;
  /** Contribution score breakdown */
  scoreBreakdown?: ContributionScoreBreakdown;
  /** Commission rate (0-100) */
  commission: number;
  /** Validator status */
  status: ValidatorStatus;
  /** Uptime percentage (0-100) */
  uptime: number;
  /** Number of blocks produced */
  blocksProduced: bigint;
  /** Number of blocks missed */
  blocksMissed: bigint;
  /** Total rewards earned */
  totalRewards: bigint;
  /** When validator registered */
  registeredAt: bigint;
  /** When validator was last active */
  lastActiveAt: bigint;
  /** Jail end time (if jailed) */
  jailEndTime?: bigint;
  /** Validator moniker/name */
  moniker?: string;
  /** Validator website */
  website?: string;
  /** Validator description */
  description?: string;
}

/**
 * Validator summary for lists
 */
export interface ValidatorSummary {
  /** Validator address */
  address: string;
  /** Total stake */
  totalStake: bigint;
  /** Contribution score */
  contributionScore: number;
  /** Commission rate */
  commission: number;
  /** Status */
  status: ValidatorStatus;
  /** Uptime */
  uptime: number;
  /** Moniker */
  moniker?: string;
}

/**
 * Slashing event
 */
export interface SlashingEvent {
  /** Validator address */
  validator: string;
  /** Offense type */
  offense: SlashableOffense;
  /** Amount slashed (wei) */
  amount: bigint;
  /** Block where slash occurred */
  blockNumber: bigint;
  /** Transaction hash */
  transactionHash: string;
  /** Jail duration (seconds) */
  jailDuration: bigint;
}

/**
 * Slashable offense types
 */
export enum SlashableOffense {
  /** Signed two different blocks at same height */
  DoubleSign = 'double_sign',
  /** Produced invalid block */
  InvalidBlock = 'invalid_block',
  /** Censored transactions */
  Censorship = 'censorship',
  /** Was offline too long */
  Offline = 'offline',
  /** Voted for invalid block */
  FalseVote = 'false_vote',
}

/**
 * Validator set for an epoch
 */
export interface ValidatorSet {
  /** Epoch number */
  epoch: bigint;
  /** List of active validators */
  validators: ValidatorSummary[];
  /** Total stake in this set */
  totalStake: bigint;
  /** Number of validators */
  count: number;
}

/**
 * Block production statistics
 */
export interface BlockProductionStats {
  /** Validator address */
  validator: string;
  /** Time period (epoch or custom range) */
  period: {
    start: bigint;
    end: bigint;
  };
  /** Blocks proposed */
  proposed: number;
  /** Blocks missed */
  missed: number;
  /** Proposal success rate */
  successRate: number;
}
