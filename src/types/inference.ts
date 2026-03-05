/**
 * QFC v2.0 AI Inference Types
 */

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
  tasksCompleted: bigint;
  avgTimeMs: number;
  flopsTotal: bigint;
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

/** Public inference task result */
export interface PublicTaskResult {
  taskId: string;
  status: string;
  resultData?: string;
  minerAddress?: string;
  executionTimeMs?: number;
  fee?: bigint;
}
