import { ethers } from 'ethers';
import type {
  InferenceFeeEstimate,
  InferenceModel,
  PublicTaskStatus,
  TaskListFilter,
} from '../types';
import type { QfcProvider } from '../provider/QfcProvider';

/**
 * Parameters for submitting an inference task
 */
export interface SubmitTaskParams {
  /** Model identifier (e.g. "llama3-8b") */
  modelId: string;
  /** Task type (e.g. "text-generation", "image-classification") */
  taskType: string;
  /** Input data — strings are auto-base64-encoded */
  inputData: string;
  /** Maximum fee in wei (hex string) */
  maxFee: string;
}

/**
 * High-level client for QFC AI inference tasks
 *
 * Wraps the low-level QFC inference RPC methods with convenience
 * features: automatic signing, base64 encoding, and polling.
 *
 * @example
 * ```ts
 * import { InferenceClient, QfcProvider, QfcWallet, NETWORKS, parseQfc } from '@qfc/sdk';
 *
 * const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);
 * const wallet = new QfcWallet(privateKey, provider);
 * const inference = new InferenceClient(provider);
 *
 * // Submit a task
 * const taskId = await inference.submitTask({
 *   modelId: 'llama3-8b',
 *   taskType: 'text-generation',
 *   inputData: 'Explain quantum computing',
 *   maxFee: parseQfc('0.1').toString(16),
 * }, wallet);
 *
 * // Wait for result
 * const result = await inference.waitForResult(taskId);
 * console.log(result.status, result.result);
 * ```
 */
export class InferenceClient {
  private readonly _provider: QfcProvider;

  /**
   * Create a new InferenceClient
   *
   * @param provider - QfcProvider instance for RPC calls
   */
  constructor(provider: QfcProvider) {
    this._provider = provider;
  }

  /**
   * Submit an inference task to the network
   *
   * Signs the task payload with the provided signer and submits via
   * `qfc_submitPublicTask`. String inputData is automatically base64-encoded.
   *
   * @param params - Task parameters
   * @param signer - ethers Signer to sign the submission
   * @returns Task ID (hex string)
   */
  async submitTask(
    params: SubmitTaskParams,
    signer: ethers.Signer,
  ): Promise<string> {
    const submitter = await signer.getAddress();

    // Auto-base64-encode string input that isn't already base64
    const inputData = this._isBase64(params.inputData)
      ? params.inputData
      : Buffer.from(params.inputData, 'utf-8').toString('base64');

    // Build the payload to sign
    const payload = ethers.solidityPackedKeccak256(
      ['string', 'string', 'string', 'string', 'address'],
      [params.taskType, params.modelId, inputData, params.maxFee, submitter],
    );
    const signature = await signer.signMessage(ethers.getBytes(payload));

    return this._provider.submitPublicTask({
      taskType: params.taskType,
      modelId: params.modelId,
      inputData,
      maxFee: params.maxFee,
      submitter,
      signature,
    });
  }

  /**
   * Get the status of an inference task
   *
   * @param taskId - Task ID (hex string)
   * @returns Full task status object
   */
  async getTaskStatus(taskId: string): Promise<PublicTaskStatus> {
    return this._provider.getPublicTaskStatus(taskId);
  }

  /**
   * Poll until a task reaches a terminal state (Completed, Failed, or Expired)
   *
   * @param taskId - Task ID (hex string)
   * @param timeoutMs - Maximum wait time in ms (default: 120000)
   * @param intervalMs - Poll interval in ms (default: 2000)
   * @returns Final task status
   * @throws Error if timeout is exceeded and task is still pending
   */
  async waitForResult(
    taskId: string,
    timeoutMs: number = 120_000,
    intervalMs: number = 2_000,
  ): Promise<PublicTaskStatus> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const status = await this._provider.getPublicTaskStatus(taskId);
      if (
        status.status === 'Completed' ||
        status.status === 'Failed' ||
        status.status === 'Expired'
      ) {
        return status;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    // Final check after timeout
    const finalStatus = await this._provider.getPublicTaskStatus(taskId);
    if (
      finalStatus.status === 'Completed' ||
      finalStatus.status === 'Failed' ||
      finalStatus.status === 'Expired'
    ) {
      return finalStatus;
    }

    throw new Error(
      `Inference task ${taskId} did not complete within ${timeoutMs}ms (status: ${finalStatus.status})`,
    );
  }

  /**
   * List inference tasks with optional filtering
   *
   * @param filter - Optional filter (submitter, status, limit, offset)
   * @returns Array of task statuses
   */
  async listTasks(filter?: TaskListFilter): Promise<PublicTaskStatus[]> {
    return this._provider.listPublicTasks(filter);
  }

  /**
   * Estimate the fee for an inference task
   *
   * @param modelId - Model identifier
   * @param taskType - Task type
   * @param inputSize - Optional input size in bytes
   * @returns Fee estimate
   */
  async estimateFee(
    modelId: string,
    taskType: string,
    inputSize?: number,
  ): Promise<InferenceFeeEstimate> {
    return this._provider.estimateInferenceFee(modelId, taskType, inputSize);
  }

  /**
   * Get the list of supported models on the network
   *
   * @returns Array of supported inference models
   */
  async getModels(): Promise<InferenceModel[]> {
    return this._provider.getSupportedModels();
  }

  /**
   * Check if a string looks like base64
   */
  private _isBase64(str: string): boolean {
    if (str.length === 0) return false;
    return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0;
  }
}

/**
 * Create an inference client
 *
 * @param provider - QfcProvider instance
 * @returns InferenceClient instance
 */
export function createInferenceClient(provider: QfcProvider): InferenceClient {
  return new InferenceClient(provider);
}
