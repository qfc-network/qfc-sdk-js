import { ethers } from 'ethers';
import type {
  Block,
  BlockWithTransactions,
  ComputeInfo,
  EpochInfo,
  InferenceFeeEstimate,
  InferenceModel,
  InferenceProofResult,
  InferenceProofSubmission,
  InferenceStats,
  InferenceTask,
  InferenceTaskRequest,
  NetworkConfig,
  NetworkStats,
  NodeInfo,
  PublicTaskResult,
  TaskListFilter,
  Validator,
  ValidatorSummary,
} from '../types';
import { getNetworkByChainId } from '../constants';

/**
 * QFC JSON-RPC Provider
 *
 * Extends ethers.js JsonRpcProvider with QFC-specific methods for
 * validators, staking, and network information.
 *
 * @example
 * ```ts
 * import { QfcProvider, NETWORKS } from '@qfc/sdk';
 *
 * const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);
 *
 * // Standard methods
 * const balance = await provider.getBalance("0x...");
 * const block = await provider.getBlock("latest");
 *
 * // QFC-specific methods
 * const validators = await provider.getValidators();
 * const epoch = await provider.getEpoch();
 * ```
 */
export class QfcProvider extends ethers.JsonRpcProvider {
  /**
   * Network configuration (if known)
   */
  public networkConfig?: NetworkConfig;

  /**
   * Create a new QFC provider
   *
   * @param url - RPC endpoint URL
   * @param network - Optional network config or chain ID
   */
  constructor(
    url: string,
    network?: ethers.Networkish | NetworkConfig
  ) {
    // If it's our NetworkConfig, extract chain ID
    if (network && typeof network === 'object' && 'chainIdHex' in network) {
      super(url, network.chainId);
      this.networkConfig = network;
    } else {
      super(url, network);
    }
  }

  /**
   * Detect and cache network configuration
   */
  override async _detectNetwork(): Promise<ethers.Network> {
    const network = await super._detectNetwork();
    if (!this.networkConfig) {
      this.networkConfig = getNetworkByChainId(Number(network.chainId));
    }
    return network;
  }

  // ========== QFC-Specific Methods ==========

  /**
   * Get list of active validators
   *
   * @returns Array of validator summaries
   */
  async getValidators(): Promise<ValidatorSummary[]> {
    const result = await this.send('qfc_getValidators', []);
    return this._parseValidatorList(result);
  }

  /**
   * Get detailed validator information
   *
   * @param address - Validator address
   * @returns Validator details or null if not found
   */
  async getValidator(address: string): Promise<Validator | null> {
    try {
      const result = await this.send('qfc_getValidator', [address]);
      return this._parseValidator(result);
    } catch (error) {
      // Return null if validator not found
      if (this._isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get contribution score for an address
   *
   * @param address - Address to check
   * @returns Contribution score (0-1) or null if not a validator
   */
  async getContributionScore(address: string): Promise<number | null> {
    try {
      const result = await this.send('qfc_getContributionScore', [address]);
      return typeof result === 'number' ? result : parseFloat(result);
    } catch (error) {
      if (this._isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get current epoch information
   *
   * @returns Current epoch info
   */
  async getEpoch(): Promise<EpochInfo> {
    const result = await this.send('qfc_getEpoch', []);
    return {
      number: BigInt(result.number),
      startTime: BigInt(result.startTime),
      durationMs: BigInt(result.durationMs),
      slot: result.slot,
    };
  }

  /**
   * Get network statistics
   *
   * @returns Network statistics
   */
  async getNetworkStats(): Promise<NetworkStats> {
    const result = await this.send('qfc_getNetworkStats', []);
    return {
      latestBlock: BigInt(result.latestBlock),
      latestTimestamp: BigInt(result.latestTimestamp),
      avgBlockTimeMs: result.avgBlockTimeMs,
      tps: result.tps,
      activeAddresses: result.activeAddresses,
      totalValidators: result.totalValidators,
      activeValidators: result.activeValidators,
      totalStaked: BigInt(result.totalStaked),
    };
  }

  /**
   * Get node information
   *
   * @returns Node information
   */
  async getNodeInfo(): Promise<NodeInfo> {
    const result = await this.send('qfc_getNodeInfo', []);
    return {
      version: result.version,
      chainId: result.chainId,
      peerCount: result.peerCount,
      isValidator: result.isValidator,
      syncStatus: {
        syncing: result.syncing,
        startingBlock: result.startingBlock ? BigInt(result.startingBlock) : undefined,
        currentBlock: result.currentBlock ? BigInt(result.currentBlock) : undefined,
        highestBlock: result.highestBlock ? BigInt(result.highestBlock) : undefined,
      },
    };
  }

  /**
   * Get pending transactions in the mempool
   *
   * @returns Array of pending transaction hashes
   */
  async getPendingTransactions(): Promise<string[]> {
    return this.send('qfc_getPendingTransactions', []);
  }

  /**
   * Get validator set for an epoch
   *
   * @param epochNumber - Epoch number (default: current)
   * @returns Validator set for the epoch
   */
  async getValidatorSet(epochNumber?: bigint): Promise<{
    epoch: bigint;
    validators: ValidatorSummary[];
    totalStake: bigint;
  }> {
    const params = epochNumber !== undefined ? [epochNumber.toString()] : [];
    const result = await this.send('qfc_getValidatorSet', params);
    return {
      epoch: BigInt(result.epoch),
      validators: this._parseValidatorList(result.validators),
      totalStake: BigInt(result.totalStake),
    };
  }

  // ========== v2.0 AI Inference Methods ==========

  async getInferenceStats(): Promise<InferenceStats> {
    const result = await this.send('qfc_getInferenceStats', []);
    return {
      tasksCompleted: Number(result.tasksCompleted),
      avgTimeMs: Number(result.avgTimeMs),
      flopsTotal: String(result.flopsTotal),
      passRate: Number(result.passRate),
    };
  }

  async getComputeInfo(): Promise<ComputeInfo> {
    const result = await this.send('qfc_getComputeInfo', []);
    return {
      backend: String(result.backend),
      supportedModels: result.supportedModels || [],
      gpuMemoryMb: Number(result.gpuMemoryMb),
      inferenceScore: BigInt(result.inferenceScore || '0'),
      gpuTier: String(result.gpuTier),
      providesCompute: Boolean(result.providesCompute),
    };
  }

  async getSupportedModels(): Promise<InferenceModel[]> {
    const result = await this.send('qfc_getSupportedModels', []);
    if (!Array.isArray(result)) return [];
    return result.map((m: Record<string, unknown>) => ({
      name: String(m.name),
      version: String(m.version),
      minMemoryMb: Number(m.minMemoryMb),
      minTier: String(m.minTier),
      approved: Boolean(m.approved),
    }));
  }

  async getInferenceTask(request: InferenceTaskRequest): Promise<InferenceTask | null> {
    const result = await this.send('qfc_getInferenceTask', [request]);
    if (!result) return null;
    return {
      taskId: String(result.taskId),
      epoch: BigInt(result.epoch),
      taskType: String(result.taskType),
      modelName: String(result.modelName),
      modelVersion: String(result.modelVersion),
      inputData: String(result.inputData),
      deadline: BigInt(result.deadline),
    };
  }

  async submitInferenceProof(submission: InferenceProofSubmission): Promise<InferenceProofResult> {
    const payload = {
      minerAddress: submission.minerAddress,
      taskId: submission.taskId,
      epoch: submission.epoch.toString(),
      outputHash: submission.outputHash,
      executionTimeMs: submission.executionTimeMs,
      flopsEstimated: submission.flopsEstimated.toString(),
      backend: submission.backend,
      proofBytes: submission.proofBytes,
    };
    const result = await this.send('qfc_submitInferenceProof', [payload]);
    return {
      accepted: Boolean(result.accepted),
      spotChecked: Boolean(result.spotChecked),
      message: String(result.message),
    };
  }

  async submitPublicTask(params: {
    taskType: string;
    modelId: string;
    inputData: string;
    maxFee: string;
    submitter: string;
    signature: string;
  }): Promise<string> {
    const result = await this.send('qfc_submitPublicTask', [params]);
    return String(result);
  }

  async listPublicTasks(filter?: TaskListFilter): Promise<PublicTaskResult[]> {
    const result = await this.send('qfc_listPublicTasks', [filter || {}]);
    if (!Array.isArray(result)) return [];
    return result.map((r: Record<string, unknown>) => this._parseTaskStatus(r));
  }

  async estimateInferenceFee(
    modelId: string,
    taskType: string,
    inputSize?: number,
  ): Promise<InferenceFeeEstimate> {
    const params: Record<string, unknown> = { modelId, taskType };
    if (inputSize !== undefined) params.inputSize = inputSize;
    const result = await this.send('qfc_estimateInferenceFee', [params]);
    return {
      baseFee: String(result.baseFee || '0x0'),
      model: String(result.model || modelId),
      gpuTier: String(result.gpuTier || ''),
      estimatedTimeMs: Number(result.estimatedTimeMs || 0),
    };
  }

  async getPublicTaskStatus(taskId: string): Promise<PublicTaskResult> {
    const result = await this.send('qfc_getPublicTaskStatus', [taskId]);
    return this._parseTaskStatus(result);
  }

  /**
   * Wait for an inference task to reach a terminal state.
   * Polls getPublicTaskStatus every `intervalMs` until Completed/Failed/Expired or timeout.
   *
   * @param taskId - Task ID (hex)
   * @param timeoutMs - Maximum wait time in ms (default: 120000)
   * @param intervalMs - Poll interval in ms (default: 1000)
   * @returns Final task status
   */
  async waitForInferenceResult(
    taskId: string,
    timeoutMs: number = 120000,
    intervalMs: number = 1000,
  ): Promise<PublicTaskResult> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const status = await this.getPublicTaskStatus(taskId);
      if (status.status === 'Completed' || status.status === 'Failed' || status.status === 'Expired') {
        return status;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    // One final check
    return this.getPublicTaskStatus(taskId);
  }

  /**
   * Fetch a full inference result stored on IPFS.
   *
   * @param cid - IPFS content identifier (e.g. "QmXYZ...")
   * @returns Base64-encoded result payload
   */
  async getInferenceResult(cid: string): Promise<string> {
    return this.send('qfc_getInferenceResult', [cid]);
  }

  // ========== Enhanced Standard Methods ==========

  /**
   * Get block with full transaction objects
   *
   * @param blockHashOrNumber - Block hash or number
   * @returns Block with transactions
   */
  async getBlockWithTransactions(
    blockHashOrNumber: string | number | bigint
  ): Promise<BlockWithTransactions | null> {
    const block = await this.getBlock(blockHashOrNumber, true);
    if (!block) return null;

    return {
      ...this._parseBlock(block),
      transactions: block.prefetchedTransactions.map((tx) => ({
        hash: tx.hash,
        type: tx.type || 0,
        chainId: Number(tx.chainId),
        nonce: tx.nonce,
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice || 0n,
        maxFeePerGas: tx.maxFeePerGas || undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        data: tx.data,
        v: tx.signature.v,
        r: tx.signature.r,
        s: tx.signature.s,
        blockHash: tx.blockHash,
        blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : null,
        transactionIndex: tx.index,
      })),
    };
  }

  /**
   * Wait for transaction with timeout
   *
   * @param hash - Transaction hash
   * @param confirmations - Number of confirmations (default: 1)
   * @param timeout - Timeout in milliseconds (default: 60000)
   * @returns Transaction receipt
   */
  async waitForTransactionWithTimeout(
    hash: string,
    confirmations: number = 1,
    timeout: number = 60000
  ): Promise<ethers.TransactionReceipt | null> {
    const receipt = await this.waitForTransaction(hash, confirmations, timeout);
    return receipt;
  }

  // ========== Internal Helper Methods ==========

  private _parseBlock(block: ethers.Block): Block {
    return {
      version: 1,
      number: BigInt(block.number),
      hash: block.hash || '',
      parentHash: block.parentHash,
      stateRoot: block.stateRoot || '',
      transactionsRoot: '',
      receiptsRoot: '',
      producer: block.miner,
      contributionScore: 0n,
      timestamp: BigInt(block.timestamp * 1000),
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      extraData: block.extraData,
      transactionCount: block.transactions.length,
      size: undefined,
    };
  }

  private _parseValidatorList(data: unknown): ValidatorSummary[] {
    if (!Array.isArray(data)) return [];
    return data.map((item: unknown) => {
      const v = item as Record<string, unknown>;
      return {
        address: String(v.address || ''),
        totalStake: BigInt(String(v.totalStake || v.stake || '0')),
        contributionScore: Number(v.contributionScore || v.score || 0),
        commission: Number(v.commission || 0),
        status: String(v.status || 'active') as ValidatorSummary['status'],
        uptime: Number(v.uptime || 100),
        moniker: v.moniker ? String(v.moniker) : undefined,
      };
    });
  }

  private _parseValidator(data: Record<string, unknown>): Validator {
    return {
      address: String(data.address || ''),
      operatorAddress: String(data.operatorAddress || data.address || ''),
      totalStake: BigInt(String(data.totalStake || '0')),
      selfStake: BigInt(String(data.selfStake || '0')),
      delegatedStake: BigInt(String(data.delegatedStake || '0')),
      delegatorCount: Number(data.delegatorCount || 0),
      contributionScore: Number(data.contributionScore || 0),
      scoreBreakdown: data.scoreBreakdown as Validator['scoreBreakdown'],
      commission: Number(data.commission || 0),
      status: String(data.status || 'active') as Validator['status'],
      uptime: Number(data.uptime || 100),
      blocksProduced: BigInt(String(data.blocksProduced || '0')),
      blocksMissed: BigInt(String(data.blocksMissed || '0')),
      totalRewards: BigInt(String(data.totalRewards || '0')),
      registeredAt: BigInt(String(data.registeredAt || '0')),
      lastActiveAt: BigInt(String(data.lastActiveAt || '0')),
      jailEndTime: data.jailEndTime ? BigInt(String(data.jailEndTime)) : undefined,
      moniker: data.moniker ? String(data.moniker) : undefined,
      website: data.website ? String(data.website) : undefined,
      description: data.description ? String(data.description) : undefined,
    };
  }

  private _parseTaskStatus(result: Record<string, unknown>): PublicTaskResult {
    return {
      taskId: String(result.taskId),
      status: String(result.status) as PublicTaskResult['status'],
      submitter: String(result.submitter || ''),
      taskType: String(result.taskType || ''),
      modelId: String(result.modelId || ''),
      createdAt: Number(result.createdAt || 0),
      deadline: Number(result.deadline || 0),
      maxFee: String(result.maxFee || '0x0'),
      result: result.result ? String(result.result) : undefined,
      resultSize: result.resultSize != null ? Number(result.resultSize) : undefined,
      minerAddress: result.minerAddress ? String(result.minerAddress) : undefined,
      executionTimeMs: result.executionTimeMs != null ? Number(result.executionTimeMs) : undefined,
    };
  }

  private _isNotFoundError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('not found') ||
        error.message.includes('does not exist')
      );
    }
    return false;
  }
}

/**
 * Create a QFC provider connected to a network
 *
 * @param networkOrUrl - Network config, network name, or RPC URL
 * @returns QfcProvider instance
 */
export function createProvider(
  networkOrUrl: NetworkConfig | string
): QfcProvider {
  if (typeof networkOrUrl === 'string') {
    // Check if it's a URL
    if (networkOrUrl.startsWith('http') || networkOrUrl.startsWith('ws')) {
      return new QfcProvider(networkOrUrl);
    }
    // Otherwise treat as network name
    const { NETWORKS } = require('../constants');
    const network = NETWORKS[networkOrUrl];
    if (!network) {
      throw new Error(`Unknown network: ${networkOrUrl}`);
    }
    return new QfcProvider(network.rpcUrl, network);
  }
  return new QfcProvider(networkOrUrl.rpcUrl, networkOrUrl);
}
