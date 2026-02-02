import { ethers } from 'ethers';
import type { Provider } from 'ethers';
import {
  CONTRACTS,
  GAS_LIMITS,
  MIN_STAKE,
  MIN_DELEGATION,
  QFC_STAKING_ABI,
} from '../constants';
import type { QfcProvider } from '../provider';

/**
 * QFC Wallet
 *
 * Extends ethers.js Wallet with QFC-specific staking operations.
 *
 * @example
 * ```ts
 * import { QfcWallet, QfcProvider, parseQfc, NETWORKS } from '@qfc/sdk';
 *
 * const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);
 * const wallet = new QfcWallet(privateKey, provider);
 *
 * // Send QFC
 * const tx = await wallet.sendTransaction({
 *   to: "0x...",
 *   value: parseQfc("10")
 * });
 *
 * // Stake QFC
 * const stakeTx = await wallet.stake(parseQfc("1000"));
 *
 * // Delegate to validator
 * const delegateTx = await wallet.delegate("0xvalidator...", parseQfc("500"));
 * ```
 */
export class QfcWallet extends ethers.Wallet {
  private _stakingContract: ethers.Contract | null = null;

  /**
   * Create a new QFC wallet
   *
   * @param privateKey - Private key (hex string or bytes)
   * @param provider - Optional provider
   */
  constructor(
    privateKey: string | ethers.SigningKey,
    provider?: Provider | null
  ) {
    super(privateKey, provider);
  }

  /**
   * Create wallet from mnemonic phrase
   *
   * @param phrase - 12 or 24 word mnemonic
   * @param provider - Optional provider
   * @returns QfcWallet instance
   */
  static fromMnemonic(
    phrase: string,
    provider?: Provider | null
  ): QfcWallet {
    const wallet = ethers.Wallet.fromPhrase(phrase, provider ?? undefined);
    return new QfcWallet(wallet.privateKey, provider);
  }

  /**
   * Create a random wallet with mnemonic
   *
   * @param provider - Optional provider
   * @returns Object containing wallet and mnemonic
   */
  static createRandomWithMnemonic(provider?: Provider | null): {
    wallet: QfcWallet;
    mnemonic: string;
  } {
    const ethersWallet = ethers.Wallet.createRandom(provider ?? undefined);
    const wallet = new QfcWallet(ethersWallet.privateKey, provider);
    return {
      wallet,
      mnemonic: ethersWallet.mnemonic?.phrase || '',
    };
  }

  /**
   * Connect to a new provider
   *
   * @param provider - Provider to connect to
   * @returns New wallet connected to provider
   */
  override connect(provider: Provider | null): QfcWallet {
    return new QfcWallet(this.privateKey, provider);
  }

  /**
   * Get the staking contract instance
   */
  private _getStakingContract(): ethers.Contract {
    if (!this._stakingContract) {
      if (!this.provider) {
        throw new Error('Wallet is not connected to a provider');
      }
      const stakingAddress =
        (this.provider as QfcProvider).networkConfig?.chainId === 9001
          ? CONTRACTS.STAKING_MAINNET
          : CONTRACTS.STAKING_TESTNET;

      this._stakingContract = new ethers.Contract(
        stakingAddress,
        QFC_STAKING_ABI,
        this
      );
    }
    return this._stakingContract;
  }

  // ========== Staking Operations ==========

  /**
   * Stake QFC tokens
   *
   * @param amount - Amount to stake (in wei)
   * @param overrides - Optional transaction overrides
   * @returns Transaction response
   */
  async stake(
    amount: bigint,
    overrides?: ethers.Overrides
  ): Promise<ethers.TransactionResponse> {
    if (amount < MIN_STAKE) {
      throw new Error(
        `Minimum stake is ${MIN_STAKE / 10n ** 18n} QFC`
      );
    }

    const contract = this._getStakingContract();
    const stakeFn = contract.getFunction('stake');
    return stakeFn({
      value: amount,
      gasLimit: GAS_LIMITS.STAKE,
      ...overrides,
    });
  }

  /**
   * Unstake QFC tokens
   *
   * @param amount - Amount to unstake (in wei)
   * @param overrides - Optional transaction overrides
   * @returns Transaction response
   */
  async unstake(
    amount: bigint,
    overrides?: ethers.Overrides
  ): Promise<ethers.TransactionResponse> {
    const contract = this._getStakingContract();
    const unstakeFn = contract.getFunction('unstake');
    return unstakeFn(amount, {
      gasLimit: GAS_LIMITS.UNSTAKE,
      ...overrides,
    });
  }

  /**
   * Claim pending rewards
   *
   * @param overrides - Optional transaction overrides
   * @returns Transaction response
   */
  async claimRewards(
    overrides?: ethers.Overrides
  ): Promise<ethers.TransactionResponse> {
    const contract = this._getStakingContract();
    const claimRewardsFn = contract.getFunction('claimRewards');
    return claimRewardsFn({
      gasLimit: GAS_LIMITS.CLAIM_REWARDS,
      ...overrides,
    });
  }

  /**
   * Delegate tokens to a validator
   *
   * @param validator - Validator address
   * @param amount - Amount to delegate (in wei)
   * @param overrides - Optional transaction overrides
   * @returns Transaction response
   */
  async delegate(
    validator: string,
    amount: bigint,
    overrides?: ethers.Overrides
  ): Promise<ethers.TransactionResponse> {
    if (amount < MIN_DELEGATION) {
      throw new Error(
        `Minimum delegation is ${MIN_DELEGATION / 10n ** 18n} QFC`
      );
    }

    const contract = this._getStakingContract();
    const delegateFn = contract.getFunction('delegate');
    return delegateFn(validator, {
      value: amount,
      gasLimit: GAS_LIMITS.DELEGATE,
      ...overrides,
    });
  }

  /**
   * Undelegate tokens from a validator
   *
   * @param validator - Validator address
   * @param amount - Amount to undelegate (in wei)
   * @param overrides - Optional transaction overrides
   * @returns Transaction response
   */
  async undelegate(
    validator: string,
    amount: bigint,
    overrides?: ethers.Overrides
  ): Promise<ethers.TransactionResponse> {
    const contract = this._getStakingContract();
    const undelegateFn = contract.getFunction('undelegate');
    return undelegateFn(validator, amount, {
      gasLimit: GAS_LIMITS.DELEGATE,
      ...overrides,
    });
  }

  /**
   * Register as a validator
   *
   * @param commission - Commission rate (0-100)
   * @param moniker - Validator name/moniker
   * @param stakeAmount - Initial stake amount (in wei)
   * @param overrides - Optional transaction overrides
   * @returns Transaction response
   */
  async registerValidator(
    commission: number,
    moniker: string,
    stakeAmount: bigint,
    overrides?: ethers.Overrides
  ): Promise<ethers.TransactionResponse> {
    if (commission < 0 || commission > 100) {
      throw new Error('Commission must be between 0 and 100');
    }
    if (stakeAmount < MIN_STAKE) {
      throw new Error(
        `Minimum stake is ${MIN_STAKE / 10n ** 18n} QFC`
      );
    }

    const contract = this._getStakingContract();
    const registerValidatorFn = contract.getFunction('registerValidator');
    return registerValidatorFn(commission, moniker, {
      value: stakeAmount,
      gasLimit: GAS_LIMITS.REGISTER_VALIDATOR,
      ...overrides,
    });
  }

  /**
   * Update validator settings
   *
   * @param commission - New commission rate (0-100)
   * @param moniker - New moniker
   * @param overrides - Optional transaction overrides
   * @returns Transaction response
   */
  async updateValidator(
    commission: number,
    moniker: string,
    overrides?: ethers.Overrides
  ): Promise<ethers.TransactionResponse> {
    if (commission < 0 || commission > 100) {
      throw new Error('Commission must be between 0 and 100');
    }

    const contract = this._getStakingContract();
    const updateValidatorFn = contract.getFunction('updateValidator');
    return updateValidatorFn(commission, moniker, {
      gasLimit: 100000n,
      ...overrides,
    });
  }

  /**
   * Exit as a validator
   *
   * @param overrides - Optional transaction overrides
   * @returns Transaction response
   */
  async exitValidator(
    overrides?: ethers.Overrides
  ): Promise<ethers.TransactionResponse> {
    const contract = this._getStakingContract();
    const exitValidatorFn = contract.getFunction('exitValidator');
    return exitValidatorFn({
      gasLimit: 150000n,
      ...overrides,
    });
  }

  // ========== Query Methods ==========

  /**
   * Get staking info for this wallet
   *
   * @returns Staking information
   */
  async getStakeInfo(): Promise<{
    stakedAmount: bigint;
    unstakingAmount: bigint;
    unstakingCompletesAt: bigint;
    pendingRewards: bigint;
  }> {
    const contract = this._getStakingContract();
    const getStakeInfoFn = contract.getFunction('getStakeInfo');
    const [stakedAmount, unstakingAmount, unstakingCompletesAt, pendingRewards] =
      await getStakeInfoFn(this.address);
    return {
      stakedAmount,
      unstakingAmount,
      unstakingCompletesAt,
      pendingRewards,
    };
  }

  /**
   * Get delegation info for this wallet
   *
   * @param validator - Validator address
   * @returns Delegation information
   */
  async getDelegation(validator: string): Promise<{
    amount: bigint;
    pendingRewards: bigint;
  }> {
    const contract = this._getStakingContract();
    const getDelegationFn = contract.getFunction('getDelegation');
    const [amount, pendingRewards] = await getDelegationFn(
      this.address,
      validator
    );
    return { amount, pendingRewards };
  }
}

/**
 * Create a QFC wallet from various inputs
 *
 * @param input - Private key, mnemonic, or "random"
 * @param provider - Optional provider
 * @returns QfcWallet instance (and mnemonic if random)
 */
export function createWallet(
  input: string,
  provider?: Provider | null
): QfcWallet | { wallet: QfcWallet; mnemonic: string } {
  if (input === 'random') {
    return QfcWallet.createRandomWithMnemonic(provider);
  }

  // Check if it's a mnemonic (contains spaces)
  if (input.includes(' ')) {
    return QfcWallet.fromMnemonic(input, provider);
  }

  // Otherwise treat as private key
  return new QfcWallet(input, provider);
}
