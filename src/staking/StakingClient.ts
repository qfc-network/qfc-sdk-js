import { ethers } from 'ethers';
import type { Provider } from 'ethers';
import {
  CONTRACTS,
  QFC_STAKING_ABI,
  MIN_STAKE,
  UNSTAKE_DELAY,
} from '../constants';
import {
  ValidatorStatus,
  type StakeInfo,
  type Delegation,
  type Validator,
  type ValidatorSummary,
} from '../types';
import type { QfcProvider } from '../provider';

/**
 * High-level staking client for read-only operations
 *
 * Use this for querying staking data without needing a wallet.
 * For staking operations that require signing, use QfcWallet.
 *
 * @example
 * ```ts
 * import { StakingClient, QfcProvider, NETWORKS } from '@qfc/sdk';
 *
 * const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);
 * const staking = new StakingClient(provider);
 *
 * // Get stake info for an address
 * const stakeInfo = await staking.getStakeInfo("0x...");
 *
 * // Get all validators
 * const validators = await staking.getValidators();
 *
 * // Get validator details
 * const validator = await staking.getValidator("0xvalidator...");
 * ```
 */
export class StakingClient {
  private readonly _provider: Provider;
  private readonly _contract: ethers.Contract;
  private readonly _stakingAddress: string;

  /**
   * Create a new StakingClient
   *
   * @param provider - Provider to use for queries
   * @param stakingAddress - Optional custom staking contract address
   */
  constructor(provider: Provider, stakingAddress?: string) {
    this._provider = provider;

    // Determine staking address based on network
    if (stakingAddress) {
      this._stakingAddress = stakingAddress;
    } else {
      const qfcProvider = provider as QfcProvider;
      this._stakingAddress =
        qfcProvider.networkConfig?.chainId === 9001
          ? CONTRACTS.STAKING_MAINNET
          : CONTRACTS.STAKING_TESTNET;
    }

    this._contract = new ethers.Contract(
      this._stakingAddress,
      QFC_STAKING_ABI,
      provider
    );
  }

  /**
   * Get staking address
   */
  get stakingAddress(): string {
    return this._stakingAddress;
  }

  /**
   * Get minimum stake requirement
   */
  async getMinStake(): Promise<bigint> {
    try {
      const getMinStakeFn = this._contract.getFunction('getMinStake');
      return await getMinStakeFn();
    } catch {
      return MIN_STAKE;
    }
  }

  /**
   * Get unstake delay (in seconds)
   */
  async getUnstakeDelay(): Promise<bigint> {
    try {
      const getUnstakeDelayFn = this._contract.getFunction('getUnstakeDelay');
      return await getUnstakeDelayFn();
    } catch {
      return UNSTAKE_DELAY;
    }
  }

  /**
   * Get staking information for an address
   *
   * @param address - Address to query
   * @returns Staking information
   */
  async getStakeInfo(address: string): Promise<StakeInfo> {
    const getStakeInfoFn = this._contract.getFunction('getStakeInfo');
    const [stakedAmount, unstakingAmount, unstakingCompletesAt, pendingRewards] =
      await getStakeInfoFn(address);

    // Check if address is a validator
    let isValidator = false;
    try {
      const getValidatorFn = this._contract.getFunction('getValidator');
      const validator = await getValidatorFn(address);
      isValidator = validator && validator.totalStake > 0n;
    } catch {
      isValidator = false;
    }

    return {
      address,
      stakedAmount,
      unstakingAmount,
      unstakingCompletesAt: unstakingCompletesAt > 0n ? unstakingCompletesAt : undefined,
      pendingRewards,
      totalRewardsEarned: 0n, // Would need additional query
      isValidator,
    };
  }

  /**
   * Get delegation from delegator to validator
   *
   * @param delegator - Delegator address
   * @param validator - Validator address
   * @returns Delegation information
   */
  async getDelegation(delegator: string, validator: string): Promise<Delegation> {
    const getDelegationFn = this._contract.getFunction('getDelegation');
    const [amount, pendingRewards] = await getDelegationFn(delegator, validator);

    return {
      delegator,
      validator,
      amount,
      pendingRewards,
      startedAt: 0n, // Would need additional query or event parsing
    };
  }

  /**
   * Get all delegations for an address
   *
   * @param delegator - Delegator address
   * @returns Array of delegations
   */
  async getDelegations(delegator: string): Promise<Delegation[]> {
    // Get all validators and check for delegations
    const validators = await this.getValidators();
    const delegations: Delegation[] = [];

    for (const validator of validators) {
      try {
        const delegation = await this.getDelegation(delegator, validator.address);
        if (delegation.amount > 0n) {
          delegations.push(delegation);
        }
      } catch {
        // Ignore errors for validators without delegation
      }
    }

    return delegations;
  }

  /**
   * Get list of validators
   *
   * @returns Array of validator summaries
   */
  async getValidators(): Promise<ValidatorSummary[]> {
    const qfcProvider = this._provider as QfcProvider;

    // Try QFC-specific RPC method first
    if (typeof qfcProvider.getValidators === 'function') {
      try {
        return await qfcProvider.getValidators();
      } catch {
        // Fall back to contract method
      }
    }

    // Fall back to contract method
    const getValidatorsFn = this._contract.getFunction('getValidators');
    const addresses: string[] = await getValidatorsFn();

    const validators: ValidatorSummary[] = [];
    const getValidatorFn = this._contract.getFunction('getValidator');

    for (const address of addresses) {
      try {
        const data = await getValidatorFn(address);
        validators.push({
          address,
          totalStake: data.totalStake,
          contributionScore: Number(data.contributionScore) / 10000, // Assuming 4 decimal precision
          commission: Number(data.commission),
          status: this._parseStatus(data.status),
          uptime: 100, // Would need additional data
          moniker: undefined,
        });
      } catch {
        // Skip validators that fail to load
      }
    }

    return validators;
  }

  /**
   * Get validator details
   *
   * @param address - Validator address
   * @returns Validator details or null if not found
   */
  async getValidator(address: string): Promise<Validator | null> {
    const qfcProvider = this._provider as QfcProvider;

    // Try QFC-specific RPC method first
    if (typeof qfcProvider.getValidator === 'function') {
      try {
        return await qfcProvider.getValidator(address);
      } catch {
        // Fall back to contract method
      }
    }

    try {
      const getValidatorFn = this._contract.getFunction('getValidator');
      const data = await getValidatorFn(address);
      return {
        address,
        operatorAddress: data.operatorAddress || address,
        totalStake: data.totalStake,
        selfStake: data.selfStake,
        delegatedStake: data.delegatedStake,
        delegatorCount: 0, // Would need additional query
        contributionScore: Number(data.contributionScore) / 10000,
        commission: Number(data.commission),
        status: this._parseStatus(data.status),
        uptime: 100,
        blocksProduced: 0n,
        blocksMissed: 0n,
        totalRewards: 0n,
        registeredAt: 0n,
        lastActiveAt: BigInt(Date.now()),
      };
    } catch {
      return null;
    }
  }

  /**
   * Get total staked amount across the network
   *
   * @returns Total staked amount in wei
   */
  async getTotalStaked(): Promise<bigint> {
    const validators = await this.getValidators();
    return validators.reduce((sum, v) => sum + v.totalStake, 0n);
  }

  /**
   * Get estimated APY for staking
   *
   * @returns Estimated annual percentage yield
   */
  async getEstimatedAPY(): Promise<number> {
    // This would require more complex calculation based on:
    // - Block rewards
    // - Total staked
    // - Fee distribution
    // For now, return a placeholder
    return 0.1; // 10% APY placeholder
  }

  /**
   * Check if an address is a validator
   *
   * @param address - Address to check
   * @returns True if address is an active validator
   */
  async isValidator(address: string): Promise<boolean> {
    const validator = await this.getValidator(address);
    return validator !== null && validator.status === ValidatorStatus.Active;
  }

  /**
   * Parse validator status from contract
   */
  private _parseStatus(status: number | string): ValidatorStatus {
    const statusMap: Record<number, ValidatorStatus> = {
      0: ValidatorStatus.Pending,
      1: ValidatorStatus.Active,
      2: ValidatorStatus.Jailed,
      3: ValidatorStatus.Exiting,
      4: ValidatorStatus.Exited,
      5: ValidatorStatus.Slashed,
    };

    if (typeof status === 'string') {
      // Check if it's already a valid status string
      const validStatuses = Object.values(ValidatorStatus) as string[];
      if (validStatuses.includes(status)) {
        return status as ValidatorStatus;
      }
      return ValidatorStatus.Pending;
    }

    return statusMap[status] || ValidatorStatus.Pending;
  }
}

/**
 * Create a staking client
 *
 * @param provider - Provider to use
 * @param stakingAddress - Optional custom staking address
 * @returns StakingClient instance
 */
export function createStakingClient(
  provider: Provider,
  stakingAddress?: string
): StakingClient {
  return new StakingClient(provider, stakingAddress);
}
