/**
 * SDK Error codes
 */
export const SDK_ERRORS = {
  // Connection errors
  CONNECTION_FAILED: {
    code: 'SDK_CONNECTION_FAILED',
    message: 'Failed to connect to RPC endpoint',
  },
  CONNECTION_TIMEOUT: {
    code: 'SDK_CONNECTION_TIMEOUT',
    message: 'Connection to RPC endpoint timed out',
  },

  // Transaction errors
  TRANSACTION_FAILED: {
    code: 'SDK_TRANSACTION_FAILED',
    message: 'Transaction execution failed',
  },
  TRANSACTION_REJECTED: {
    code: 'SDK_TRANSACTION_REJECTED',
    message: 'Transaction was rejected',
  },
  TRANSACTION_TIMEOUT: {
    code: 'SDK_TRANSACTION_TIMEOUT',
    message: 'Transaction confirmation timed out',
  },
  INSUFFICIENT_FUNDS: {
    code: 'SDK_INSUFFICIENT_FUNDS',
    message: 'Insufficient funds for transaction',
  },
  NONCE_TOO_LOW: {
    code: 'SDK_NONCE_TOO_LOW',
    message: 'Transaction nonce too low',
  },
  GAS_TOO_LOW: {
    code: 'SDK_GAS_TOO_LOW',
    message: 'Gas limit too low for transaction',
  },

  // Validation errors
  INVALID_ADDRESS: {
    code: 'SDK_INVALID_ADDRESS',
    message: 'Invalid address format',
  },
  INVALID_PRIVATE_KEY: {
    code: 'SDK_INVALID_PRIVATE_KEY',
    message: 'Invalid private key format',
  },
  INVALID_MNEMONIC: {
    code: 'SDK_INVALID_MNEMONIC',
    message: 'Invalid mnemonic phrase',
  },
  INVALID_AMOUNT: {
    code: 'SDK_INVALID_AMOUNT',
    message: 'Invalid amount value',
  },
  INVALID_HEX: {
    code: 'SDK_INVALID_HEX',
    message: 'Invalid hexadecimal string',
  },

  // Staking errors
  STAKE_TOO_LOW: {
    code: 'SDK_STAKE_TOO_LOW',
    message: 'Stake amount is below minimum requirement',
  },
  ALREADY_VALIDATOR: {
    code: 'SDK_ALREADY_VALIDATOR',
    message: 'Address is already registered as a validator',
  },
  NOT_VALIDATOR: {
    code: 'SDK_NOT_VALIDATOR',
    message: 'Address is not a validator',
  },
  VALIDATOR_JAILED: {
    code: 'SDK_VALIDATOR_JAILED',
    message: 'Validator is currently jailed',
  },
  UNSTAKING_IN_PROGRESS: {
    code: 'SDK_UNSTAKING_IN_PROGRESS',
    message: 'Unstaking is already in progress',
  },
  NO_REWARDS: {
    code: 'SDK_NO_REWARDS',
    message: 'No rewards available to claim',
  },

  // Contract errors
  CONTRACT_NOT_FOUND: {
    code: 'SDK_CONTRACT_NOT_FOUND',
    message: 'Contract not found at address',
  },
  CONTRACT_EXECUTION_FAILED: {
    code: 'SDK_CONTRACT_EXECUTION_FAILED',
    message: 'Contract execution failed',
  },
  CONTRACT_REVERTED: {
    code: 'SDK_CONTRACT_REVERTED',
    message: 'Contract execution reverted',
  },

  // Provider errors
  PROVIDER_NOT_CONNECTED: {
    code: 'SDK_PROVIDER_NOT_CONNECTED',
    message: 'Provider is not connected',
  },
  UNSUPPORTED_NETWORK: {
    code: 'SDK_UNSUPPORTED_NETWORK',
    message: 'Network is not supported',
  },

  // Wallet errors
  WALLET_NOT_FOUND: {
    code: 'SDK_WALLET_NOT_FOUND',
    message: 'Wallet not found',
  },
  WALLET_LOCKED: {
    code: 'SDK_WALLET_LOCKED',
    message: 'Wallet is locked',
  },
} as const;

/**
 * SDK Error class
 */
export class QfcError extends Error {
  public readonly code: string;
  public readonly data?: unknown;

  constructor(
    codeOrError: (typeof SDK_ERRORS)[keyof typeof SDK_ERRORS] | string,
    message?: string,
    data?: unknown
  ) {
    const errorDef =
      typeof codeOrError === 'string'
        ? { code: codeOrError, message: message || 'Unknown error' }
        : codeOrError;

    super(message || errorDef.message);
    this.name = 'QfcError';
    this.code = typeof codeOrError === 'string' ? codeOrError : errorDef.code;
    this.data = data;
  }
}

/**
 * Create a typed error
 */
export function createError(
  error: (typeof SDK_ERRORS)[keyof typeof SDK_ERRORS],
  data?: unknown
): QfcError {
  return new QfcError(error, undefined, data);
}
