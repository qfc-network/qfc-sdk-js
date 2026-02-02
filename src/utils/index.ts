/**
 * QFC SDK Utilities
 */

// Unit conversion utilities
export {
  parseQfc,
  formatQfc,
  formatQfcWithCommas,
  parseTokenAmount,
  formatTokenAmount,
  convertDecimals,
  parseGwei,
  formatGwei,
  ONE_QFC,
  ONE_GWEI,
} from './units';

// Validation utilities
export {
  isValidAddress,
  isValidHex,
  isValidTxHash,
  isValidBlockHash,
  isValidAmount,
  isValidMnemonic,
  isValidPrivateKey,
  isValidChainId,
  normalizeAddress,
  addressesEqual,
  validatePassword,
} from './validation';

// Formatting utilities
export {
  shortenAddress,
  shortenHash,
  formatNumber,
  formatBigInt,
  formatTimestamp,
  formatRelativeTime,
  formatBlockNumber,
  formatGas,
  formatPercentage,
  padHex,
  stripHexLeadingZeros,
} from './format';

// Encoding utilities
export {
  encodeFunctionData,
  decodeFunctionResult,
  decodeError,
  decodeEventLog,
  encodePacked,
  keccak256,
  getFunctionSelector,
  getEventTopic,
  abiEncode,
  abiDecode,
  stringToBytes32,
  bytes32ToString,
  hexToBytes,
  bytesToHex,
  toUtf8Bytes,
  toUtf8String,
} from './encoding';
