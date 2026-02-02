/**
 * JSON-RPC 2.0 request
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: unknown[];
}

/**
 * JSON-RPC 2.0 response
 */
export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number | string;
  result?: T;
  error?: JsonRpcError;
}

/**
 * JSON-RPC error object
 */
export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Standard JSON-RPC error codes
 */
export const JSON_RPC_ERRORS = {
  PARSE_ERROR: { code: -32700, message: 'Parse error' },
  INVALID_REQUEST: { code: -32600, message: 'Invalid Request' },
  METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
  INVALID_PARAMS: { code: -32602, message: 'Invalid params' },
  INTERNAL_ERROR: { code: -32603, message: 'Internal error' },
} as const;

/**
 * EIP-1193 Provider error codes
 */
export const PROVIDER_ERRORS = {
  USER_REJECTED: { code: 4001, message: 'User rejected the request' },
  UNAUTHORIZED: {
    code: 4100,
    message: 'The requested account has not been authorized',
  },
  UNSUPPORTED_METHOD: {
    code: 4200,
    message: 'The requested method is not supported',
  },
  DISCONNECTED: { code: 4900, message: 'The provider is disconnected' },
  CHAIN_DISCONNECTED: {
    code: 4901,
    message: 'The provider is not connected to the requested chain',
  },
} as const;

/**
 * Subscription types for WebSocket
 */
export type SubscriptionType =
  | 'newHeads'
  | 'newPendingTransactions'
  | 'logs'
  | 'syncing';

/**
 * Log filter for subscriptions
 */
export interface LogFilter {
  /** Contract address(es) to filter */
  address?: string | string[];
  /** Topics to filter */
  topics?: (string | string[] | null)[];
  /** From block */
  fromBlock?: string | number;
  /** To block */
  toBlock?: string | number;
}

/**
 * Subscription notification
 */
export interface SubscriptionNotification<T = unknown> {
  jsonrpc: '2.0';
  method: 'eth_subscription';
  params: {
    subscription: string;
    result: T;
  };
}

/**
 * Call request for eth_call
 */
export interface CallRequest {
  /** Sender address */
  from?: string;
  /** Recipient address */
  to: string;
  /** Gas limit */
  gas?: string;
  /** Gas price */
  gasPrice?: string;
  /** Max fee per gas */
  maxFeePerGas?: string;
  /** Max priority fee */
  maxPriorityFeePerGas?: string;
  /** Value */
  value?: string;
  /** Data */
  data?: string;
}

/**
 * Filter for getLogs
 */
export interface GetLogsFilter {
  /** From block (height or tag) */
  fromBlock?: string | number;
  /** To block (height or tag) */
  toBlock?: string | number;
  /** Contract address(es) */
  address?: string | string[];
  /** Topics filter */
  topics?: (string | string[] | null)[];
  /** Block hash (alternative to fromBlock/toBlock) */
  blockHash?: string;
}

/**
 * Trace options for debug methods
 */
export interface TraceOptions {
  /** Disable storage */
  disableStorage?: boolean;
  /** Disable memory */
  disableMemory?: boolean;
  /** Disable stack */
  disableStack?: boolean;
  /** Tracer to use */
  tracer?: string;
  /** Timeout for tracing */
  timeout?: string;
}

/**
 * Debug trace result
 */
export interface TraceResult {
  /** Gas used */
  gas: number;
  /** Failed */
  failed: boolean;
  /** Return value */
  returnValue: string;
  /** Struct logs */
  structLogs: Array<{
    pc: number;
    op: string;
    gas: number;
    gasCost: number;
    depth: number;
    stack?: string[];
    memory?: string[];
    storage?: Record<string, string>;
  }>;
}
