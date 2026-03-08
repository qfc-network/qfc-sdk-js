import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QfcProvider } from '../src/provider/QfcProvider';

describe('Inference Methods', () => {
  let provider: QfcProvider;
  let sendSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    provider = new QfcProvider('http://localhost:8545', { chainId: 9000, name: 'test' });
    sendSpy = vi.spyOn(provider, 'send');

    sendSpy.mockImplementation(async (method: string, params: unknown[]) => {
      switch (method) {
        case 'qfc_getInferenceStats':
          return {
            tasksCompleted: '42000',
            avgTimeMs: '150',
            flopsTotal: '9876543210',
            passRate: '98.5',
          };
        case 'qfc_getComputeInfo':
          return {
            backend: 'Metal',
            supportedModels: ['qfc-embed-small', 'qfc-embed-medium'],
            gpuMemoryMb: 16384,
            inferenceScore: '0x1a2b',
            gpuTier: 'Warm',
            providesCompute: true,
          };
        case 'qfc_getSupportedModels':
          return [
            { name: 'qfc-embed-small', version: 'v1.0', minMemoryMb: 512, minTier: 'Cold', approved: true },
            { name: 'qfc-embed-medium', version: 'v1.0', minMemoryMb: 2048, minTier: 'Warm', approved: true },
          ];
        case 'qfc_getInferenceTask':
          return {
            taskId: '0x' + 'ab'.repeat(32),
            epoch: '100',
            taskType: 'embedding',
            modelName: 'qfc-embed-small',
            modelVersion: 'v1.0',
            inputData: '0xdeadbeef',
            deadline: '1704153600000',
          };
        case 'qfc_submitInferenceProof':
          return {
            accepted: true,
            spotChecked: false,
            message: 'Proof accepted',
          };
        case 'qfc_submitPublicTask':
          return '0x' + 'cd'.repeat(32);
        case 'qfc_getPublicTaskStatus':
          return {
            taskId: params[0],
            status: 'Completed',
            submitter: '0x' + '2'.repeat(40),
            taskType: 'embedding',
            modelId: 'qfc-embed-small:v1.0',
            createdAt: 1704153500000,
            deadline: 1704153560000,
            maxFee: '0x38d7ea4c68000',
            result: 'SGVsbG8gV29ybGQ=',
            resultSize: 11,
            minerAddress: '0x' + '1'.repeat(40),
            executionTimeMs: 120,
          };
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInferenceStats', () => {
    it('should return inference statistics', async () => {
      const stats = await provider.getInferenceStats();
      expect(stats.tasksCompleted).toBe(42000n);
      expect(stats.avgTimeMs).toBe(150);
      expect(stats.flopsTotal).toBe(9876543210n);
      expect(stats.passRate).toBe(98.5);
      expect(sendSpy).toHaveBeenCalledWith('qfc_getInferenceStats', []);
    });
  });

  describe('getComputeInfo', () => {
    it('should return compute info', async () => {
      const info = await provider.getComputeInfo();
      expect(info.backend).toBe('Metal');
      expect(info.supportedModels).toEqual(['qfc-embed-small', 'qfc-embed-medium']);
      expect(info.gpuMemoryMb).toBe(16384);
      expect(info.gpuTier).toBe('Warm');
      expect(info.providesCompute).toBe(true);
      expect(sendSpy).toHaveBeenCalledWith('qfc_getComputeInfo', []);
    });
  });

  describe('getSupportedModels', () => {
    it('should return list of models', async () => {
      const models = await provider.getSupportedModels();
      expect(models).toHaveLength(2);
      expect(models[0].name).toBe('qfc-embed-small');
      expect(models[0].minTier).toBe('Cold');
      expect(models[1].minMemoryMb).toBe(2048);
      expect(sendSpy).toHaveBeenCalledWith('qfc_getSupportedModels', []);
    });
  });

  describe('getInferenceTask', () => {
    it('should return a task for the miner', async () => {
      const task = await provider.getInferenceTask({
        minerAddress: '0x' + '1'.repeat(40),
        gpuTier: 'Warm',
        availableMemoryMb: 8192,
        backend: 'Metal',
      });
      expect(task).not.toBeNull();
      expect(task!.taskType).toBe('embedding');
      expect(task!.modelName).toBe('qfc-embed-small');
      expect(typeof task!.epoch).toBe('bigint');
      expect(sendSpy).toHaveBeenCalledWith('qfc_getInferenceTask', [
        { minerAddress: '0x' + '1'.repeat(40), gpuTier: 'Warm', availableMemoryMb: 8192, backend: 'Metal' },
      ]);
    });
  });

  describe('submitInferenceProof', () => {
    it('should return proof result', async () => {
      const result = await provider.submitInferenceProof({
        minerAddress: '0x' + '1'.repeat(40),
        taskId: '0x' + 'ab'.repeat(32),
        epoch: 100n,
        outputHash: '0x' + 'ff'.repeat(32),
        executionTimeMs: 120,
        flopsEstimated: 1000000n,
        backend: 'Metal',
        proofBytes: '0xproof',
      });
      expect(result.accepted).toBe(true);
      expect(result.spotChecked).toBe(false);
      expect(result.message).toBe('Proof accepted');
    });
  });

  describe('submitPublicTask', () => {
    it('should return task ID', async () => {
      const taskId = await provider.submitPublicTask({
        taskType: 'embedding',
        modelId: 'qfc-embed-small',
        inputData: '0xdeadbeef',
        maxFee: '1000000000000000',
        submitter: '0x' + '2'.repeat(40),
        signature: '0x' + 'ab'.repeat(64),
      });
      expect(taskId).toBe('0x' + 'cd'.repeat(32));
    });
  });

  describe('getPublicTaskStatus', () => {
    it('should return structured task status', async () => {
      const taskId = '0x' + 'cd'.repeat(32);
      const result = await provider.getPublicTaskStatus(taskId);
      expect(result.taskId).toBe(taskId);
      expect(result.status).toBe('Completed');
      expect(result.submitter).toBe('0x' + '2'.repeat(40));
      expect(result.taskType).toBe('embedding');
      expect(result.modelId).toBe('qfc-embed-small:v1.0');
      expect(result.result).toBe('SGVsbG8gV29ybGQ=');
      expect(result.resultSize).toBe(11);
      expect(result.minerAddress).toBe('0x' + '1'.repeat(40));
      expect(result.executionTimeMs).toBe(120);
      expect(sendSpy).toHaveBeenCalledWith('qfc_getPublicTaskStatus', [taskId]);
    });
  });
});
