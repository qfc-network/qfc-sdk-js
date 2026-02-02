import { ethers } from 'ethers';
import type { LogFilter, Block, Log } from '../types';

/**
 * QFC WebSocket Provider
 *
 * Extends ethers.js WebSocketProvider with subscription helpers.
 *
 * @example
 * ```ts
 * import { QfcWebSocketProvider, NETWORKS } from '@qfc/sdk';
 *
 * const provider = new QfcWebSocketProvider(NETWORKS.testnet.wsUrl);
 *
 * // Subscribe to new blocks
 * provider.on("block", (blockNumber) => {
 *   console.log("New block:", blockNumber);
 * });
 *
 * // Subscribe to pending transactions
 * const sub = await provider.subscribePendingTransactions((hash) => {
 *   console.log("Pending tx:", hash);
 * });
 *
 * // Unsubscribe
 * await sub.unsubscribe();
 * ```
 */
export class QfcWebSocketProvider extends ethers.WebSocketProvider {
  private _subscriptions: Map<string, () => Promise<void>> = new Map();

  /**
   * Create a new QFC WebSocket provider
   *
   * @param url - WebSocket endpoint URL
   * @param network - Optional network
   */
  constructor(url: string, network?: ethers.Networkish) {
    super(url, network);
  }

  /**
   * Subscribe to new block headers
   *
   * @param callback - Callback for each new block
   * @returns Subscription object with unsubscribe method
   */
  async subscribeNewHeads(
    callback: (block: Block) => void
  ): Promise<{ id: string; unsubscribe: () => Promise<void> }> {
    const id = await this.send('eth_subscribe', ['newHeads']);

    const handler = (message: { params: { result: unknown } }) => {
      const block = this._parseBlockHeader(message.params.result as Record<string, string>);
      callback(block);
    };

    this.on(id, handler);

    const unsubscribe = async () => {
      this.off(id, handler);
      await this.send('eth_unsubscribe', [id]);
      this._subscriptions.delete(id);
    };

    this._subscriptions.set(id, unsubscribe);
    return { id, unsubscribe };
  }

  /**
   * Subscribe to pending transactions
   *
   * @param callback - Callback for each pending transaction hash
   * @returns Subscription object with unsubscribe method
   */
  async subscribePendingTransactions(
    callback: (hash: string) => void
  ): Promise<{ id: string; unsubscribe: () => Promise<void> }> {
    const id = await this.send('eth_subscribe', ['newPendingTransactions']);

    const handler = (hash: string) => {
      callback(hash);
    };

    this.on(id, handler);

    const unsubscribe = async () => {
      this.off(id, handler);
      await this.send('eth_unsubscribe', [id]);
      this._subscriptions.delete(id);
    };

    this._subscriptions.set(id, unsubscribe);
    return { id, unsubscribe };
  }

  /**
   * Subscribe to logs
   *
   * @param filter - Log filter
   * @param callback - Callback for each log
   * @returns Subscription object with unsubscribe method
   */
  async subscribeLogs(
    filter: LogFilter,
    callback: (log: Log) => void
  ): Promise<{ id: string; unsubscribe: () => Promise<void> }> {
    const id = await this.send('eth_subscribe', ['logs', filter]);

    const handler = (logData: Record<string, unknown>) => {
      const log = this._parseLog(logData);
      callback(log);
    };

    this.on(id, handler);

    const unsubscribe = async () => {
      this.off(id, handler);
      await this.send('eth_unsubscribe', [id]);
      this._subscriptions.delete(id);
    };

    this._subscriptions.set(id, unsubscribe);
    return { id, unsubscribe };
  }

  /**
   * Subscribe to sync status changes
   *
   * @param callback - Callback for sync status
   * @returns Subscription object with unsubscribe method
   */
  async subscribeSyncing(
    callback: (syncing: boolean | { startingBlock: bigint; currentBlock: bigint; highestBlock: bigint }) => void
  ): Promise<{ id: string; unsubscribe: () => Promise<void> }> {
    const id = await this.send('eth_subscribe', ['syncing']);

    const handler = (data: boolean | Record<string, string>) => {
      if (typeof data === 'boolean') {
        callback(data);
      } else {
        callback({
          startingBlock: BigInt(data.startingBlock || '0'),
          currentBlock: BigInt(data.currentBlock || '0'),
          highestBlock: BigInt(data.highestBlock || '0'),
        });
      }
    };

    this.on(id, handler);

    const unsubscribe = async () => {
      this.off(id, handler);
      await this.send('eth_unsubscribe', [id]);
      this._subscriptions.delete(id);
    };

    this._subscriptions.set(id, unsubscribe);
    return { id, unsubscribe };
  }

  /**
   * Unsubscribe all active subscriptions
   */
  async unsubscribeAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const unsubscribe of this._subscriptions.values()) {
      promises.push(unsubscribe());
    }
    await Promise.all(promises);
    this._subscriptions.clear();
  }

  /**
   * Get number of active subscriptions
   */
  get activeSubscriptions(): number {
    return this._subscriptions.size;
  }

  /**
   * Close the connection and cleanup
   */
  override async destroy(): Promise<void> {
    await this.unsubscribeAll();
    await super.destroy();
  }

  // ========== Internal Helpers ==========

  private _parseBlockHeader(data: Record<string, string>): Block {
    return {
      version: 1,
      number: BigInt(data.number || '0'),
      hash: data.hash || '',
      parentHash: data.parentHash || '',
      stateRoot: data.stateRoot || '',
      transactionsRoot: data.transactionsRoot || '',
      receiptsRoot: data.receiptsRoot || '',
      producer: data.miner || '',
      contributionScore: 0n,
      timestamp: BigInt(parseInt(data.timestamp || '0', 16) * 1000),
      gasLimit: BigInt(data.gasLimit || '0'),
      gasUsed: BigInt(data.gasUsed || '0'),
      extraData: data.extraData || '',
      transactionCount: 0,
    };
  }

  private _parseLog(data: Record<string, unknown>): Log {
    return {
      address: String(data.address || ''),
      topics: (data.topics as string[]) || [],
      data: String(data.data || '0x'),
      blockHash: String(data.blockHash || ''),
      blockNumber: BigInt(String(data.blockNumber || '0')),
      transactionHash: String(data.transactionHash || ''),
      transactionIndex: Number(data.transactionIndex || 0),
      logIndex: Number(data.logIndex || 0),
      removed: Boolean(data.removed),
    };
  }
}

/**
 * Create a QFC WebSocket provider
 *
 * @param url - WebSocket endpoint URL
 * @param network - Optional network
 * @returns QfcWebSocketProvider instance
 */
export function createWebSocketProvider(
  url: string,
  network?: ethers.Networkish
): QfcWebSocketProvider {
  return new QfcWebSocketProvider(url, network);
}
