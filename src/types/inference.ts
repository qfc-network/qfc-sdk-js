/**
 * QFC v2.0 AI Inference Types
 */

/** How the result is stored */
export type InferenceResultType = 'inline' | 'ipfs';

/** Approved model in the registry */
export interface InferenceModel {
  name: string;
  version: string;
  minMemoryMb: number;
  minTier: string;
  approved: boolean;
}

/** Network-wide inference statistics */
export interface InferenceStats {
  tasksCompleted: number;
  avgTimeMs: number;
  flopsTotal: string;
  passRate: number;
}

/** Node compute capability information */
export interface ComputeInfo {
  backend: string;
  supportedModels: string[];
  gpuMemoryMb: number;
  inferenceScore: bigint;
  gpuTier: string;
  providesCompute: boolean;
}

/** Inference task assigned to a miner */
export interface InferenceTask {
  taskId: string;
  epoch: bigint;
  taskType: string;
  modelName: string;
  modelVersion: string;
  inputData: string;
  deadline: bigint;
}

/** Request to fetch a task for a miner */
export interface InferenceTaskRequest {
  minerAddress: string;
  gpuTier: string;
  availableMemoryMb: number;
  backend: string;
}

/** Proof submission from a miner */
export interface InferenceProofSubmission {
  minerAddress: string;
  taskId: string;
  epoch: bigint;
  outputHash: string;
  executionTimeMs: number;
  flopsEstimated: bigint;
  backend: string;
  proofBytes: string;
}

/** Result of a proof submission */
export interface InferenceProofResult {
  accepted: boolean;
  spotChecked: boolean;
  message: string;
}

/** Public inference task status */
export interface PublicTaskStatus {
  taskId: string;
  status: 'Pending' | 'Assigned' | 'Completed' | 'Failed' | 'Expired';
  submitter: string;
  taskType: string;
  modelId: string;
  createdAt: number;
  deadline: number;
  maxFee: string;
  resultType?: InferenceResultType;
  result?: string;
  resultCid?: string;
  resultPreview?: string;
  resultSize?: number;
  minerAddress?: string;
  executionTimeMs?: number;
}

/** Alias for backward compat */
export type PublicTaskResult = PublicTaskStatus;

/** Request to submit a public inference task */
export interface SubmitInferenceRequest {
  taskType: string;
  modelId: string;
  inputData: string;
  maxFee: string;
  submitter: string;
  signature: string;
}

/** Fee estimate for an inference task */
export interface InferenceFeeEstimate {
  baseFee: string;
  model: string;
  gpuTier: string;
  estimatedTimeMs: number;
}

/** Filter for listing public tasks */
export interface TaskListFilter {
  submitter?: string;
  status?: PublicTaskStatus['status'];
  limit?: number;
  offset?: number;
}

/** Decoded inference result envelope */
export interface DecodedInferenceResult {
  model: string;
  submitter: string;
  miner: string;
  output: unknown;
  executionTimeMs: number;
  timestamps: {
    submitted: number;
    completed: number;
  };
}
