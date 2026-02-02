/**
 * QFC SDK - JavaScript/TypeScript SDK for QFC Blockchain
 *
 * @packageDocumentation
 *
 * @example
 * ```ts
 * import {
 *   QfcProvider,
 *   QfcWallet,
 *   parseQfc,
 *   formatQfc,
 *   NETWORKS
 * } from '@qfc/sdk';
 *
 * // Connect to testnet
 * const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);
 *
 * // Get balance
 * const balance = await provider.getBalance("0x...");
 * console.log('Balance:', formatQfc(balance), 'QFC');
 *
 * // Create wallet and send transaction
 * const wallet = new QfcWallet(privateKey, provider);
 * const tx = await wallet.sendTransaction({
 *   to: "0x...",
 *   value: parseQfc("10")
 * });
 * await tx.wait();
 *
 * // Stake tokens
 * const stakeTx = await wallet.stake(parseQfc("1000"));
 * await stakeTx.wait();
 * ```
 */

// ========== Provider ==========
export { QfcProvider, createProvider } from './provider/QfcProvider';
export { QfcWebSocketProvider, createWebSocketProvider } from './provider/WebSocketProvider';

// ========== Wallet ==========
export { QfcWallet, createWallet } from './wallet';

// ========== Staking ==========
export { StakingClient, createStakingClient } from './staking';

// ========== Contract ==========
export {
  getERC20,
  getERC721,
  getERC1155,
  getMulticall3,
  createContract,
  isContract,
} from './contract';

export type {
  ERC20Token,
  ERC721NFT,
  ERC1155Token,
  Multicall3,
} from './contract';

// ========== Types ==========
export * from './types';

// ========== Constants ==========
export {
  NETWORKS,
  DEFAULT_NETWORK,
  getNetwork,
  getNetworkByChainId,
  isQfcNetwork,
  SDK_ERRORS,
  QfcError,
  createError,
  ERC20_ABI,
  ERC721_ABI,
  ERC1155_ABI,
  QFC_STAKING_ABI,
  WRAPPED_TOKEN_ABI,
  MULTICALL3_ABI,
  QFC_DECIMALS,
  MIN_STAKE,
  MIN_DELEGATION,
  UNSTAKE_DELAY,
  BLOCK_TIME_MS,
  EPOCH_DURATION,
  MAX_VALIDATORS,
  GAS_LIMITS,
  CONTRACTS,
} from './constants';

// ========== Utilities ==========
export {
  // Unit conversions
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

  // Validation
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

  // Formatting
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

  // Encoding
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
} from './utils';

// ========== Re-exports from ethers ==========
export {
  // Commonly used ethers exports
  Contract,
  Interface,
  AbiCoder,
  // Signers
  Wallet,
  HDNodeWallet,
  // Utilities
  ethers,
} from 'ethers';
