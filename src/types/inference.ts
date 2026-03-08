/**
 * Inference task result storage type.
 * - `inline`: result is embedded directly in the response (small results)
 * - `ipfs`: result is stored on IPFS and must be fetched separately (large results >1MB)
 */
export type InferenceResultType = 'inline' | 'ipfs';

/**
 * Public inference task status returned by `qfc_getPublicTaskStatus`
 */
export interface PublicTaskStatus {
  /** Task identifier (hex) */
  taskId: string;
  /** Current task state */
  status: 'Pending' | 'Assigned' | 'Completed' | 'Failed' | 'Expired';
  /** Address that submitted the task */
  submitter: string;
  /** Task type (e.g. "TextEmbedding", "TextGeneration") */
  taskType: string;
  /** Model identifier */
  modelId: string;
  /** Submission timestamp (unix ms) */
  createdAt: number;
  /** Deadline timestamp (unix ms) */
  deadline: number;
  /** Maximum fee in wei (string) */
  maxFee: string;

  /** How the result is stored: inline (in `result`) or on IPFS (via `resultCid`) */
  resultType?: InferenceResultType;
  /** Base64-encoded result data (present when resultType is 'inline') */
  result?: string;
  /** IPFS CID of the result (present when resultType is 'ipfs') */
  resultCid?: string;
  /** Base64-encoded preview of the first ~1KB (present when resultType is 'ipfs') */
  resultPreview?: string;
  /** Result payload size in bytes */
  resultSize?: number;

  /** Address of the miner that executed the task */
  minerAddress?: string;
  /** Execution wall-clock time in milliseconds */
  executionTimeMs?: number;
}

/**
 * Supported inference model from the registry
 */
export interface InferenceModel {
  name: string;
  version: string;
  minMemoryMb: number;
  minTier: string;
  approved: boolean;
}

/**
 * Fee estimate for an inference task
 */
export interface InferenceFeeEstimate {
  baseFee: string;
  model: string;
  gpuTier: string;
  estimatedTimeMs: number;
}

/**
 * Decoded inference result envelope
 */
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

/**
 * Aggregate inference statistics
 */
export interface InferenceStats {
  tasksCompleted: number;
  avgTimeMs: number;
  flopsTotal: string;
  passRate: number;
}
