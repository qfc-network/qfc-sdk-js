import { ethers } from 'ethers';

/**
 * Encode function call data
 *
 * @param abi - Function ABI fragment
 * @param args - Function arguments
 * @returns Encoded calldata
 *
 * @example
 * ```ts
 * const data = encodeFunctionData(
 *   "function transfer(address to, uint256 amount)",
 *   ["0x...", 1000n]
 * );
 * ```
 */
export function encodeFunctionData(
  abi: string | ethers.Fragment,
  args: unknown[]
): string {
  const iface = new ethers.Interface([abi]);
  const fragment = iface.fragments[0] as ethers.FunctionFragment;
  if (!fragment || fragment.type !== 'function') {
    throw new Error('Invalid function ABI');
  }
  return iface.encodeFunctionData(fragment.name, args);
}

/**
 * Decode function result data
 *
 * @param abi - Function ABI fragment
 * @param data - Result data to decode
 * @returns Decoded result
 */
export function decodeFunctionResult(
  abi: string | ethers.Fragment,
  data: string
): ethers.Result {
  const iface = new ethers.Interface([abi]);
  const fragment = iface.fragments[0] as ethers.FunctionFragment;
  if (!fragment || fragment.type !== 'function') {
    throw new Error('Invalid function ABI');
  }
  return iface.decodeFunctionResult(fragment.name, data);
}

/**
 * Decode error data
 *
 * @param abi - Error ABI or interface
 * @param data - Error data to decode
 * @returns Decoded error or null
 */
export function decodeError(
  abi: string | string[] | ethers.Interface,
  data: string
): { name: string; args: ethers.Result } | null {
  try {
    const iface = abi instanceof ethers.Interface
      ? abi
      : new ethers.Interface(Array.isArray(abi) ? abi : [abi]);
    const parsed = iface.parseError(data);
    if (parsed) {
      return { name: parsed.name, args: parsed.args };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Decode event log
 *
 * @param abi - Event ABI or interface
 * @param topics - Log topics
 * @param data - Log data
 * @returns Decoded event or null
 */
export function decodeEventLog(
  abi: string | string[] | ethers.Interface,
  topics: string[],
  data: string
): { name: string; args: ethers.Result } | null {
  try {
    const iface = abi instanceof ethers.Interface
      ? abi
      : new ethers.Interface(Array.isArray(abi) ? abi : [abi]);
    const parsed = iface.parseLog({ topics, data });
    if (parsed) {
      return { name: parsed.name, args: parsed.args };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Encode packed data (like abi.encodePacked in Solidity)
 *
 * @param types - Array of types
 * @param values - Array of values
 * @returns Encoded packed bytes
 */
export function encodePacked(types: string[], values: unknown[]): string {
  return ethers.solidityPacked(types, values);
}

/**
 * Compute keccak256 hash
 *
 * @param data - Data to hash (hex string or bytes)
 * @returns Keccak256 hash
 */
export function keccak256(data: string | Uint8Array): string {
  return ethers.keccak256(data);
}

/**
 * Compute function selector (first 4 bytes of keccak256)
 *
 * @param signature - Function signature (e.g., "transfer(address,uint256)")
 * @returns 4-byte selector as hex
 */
export function getFunctionSelector(signature: string): string {
  return ethers.id(signature).slice(0, 10);
}

/**
 * Compute event topic (full keccak256 hash)
 *
 * @param signature - Event signature (e.g., "Transfer(address,address,uint256)")
 * @returns 32-byte topic as hex
 */
export function getEventTopic(signature: string): string {
  return ethers.id(signature);
}

/**
 * ABI encode values
 *
 * @param types - Array of types
 * @param values - Array of values
 * @returns ABI encoded data
 */
export function abiEncode(types: string[], values: unknown[]): string {
  const coder = ethers.AbiCoder.defaultAbiCoder();
  return coder.encode(types, values);
}

/**
 * ABI decode data
 *
 * @param types - Array of types
 * @param data - Data to decode
 * @returns Decoded values
 */
export function abiDecode(types: string[], data: string): ethers.Result {
  const coder = ethers.AbiCoder.defaultAbiCoder();
  return coder.decode(types, data);
}

/**
 * Convert string to bytes32
 *
 * @param text - String to convert
 * @returns Bytes32 hex string
 */
export function stringToBytes32(text: string): string {
  return ethers.encodeBytes32String(text);
}

/**
 * Convert bytes32 to string
 *
 * @param bytes32 - Bytes32 hex string
 * @returns Decoded string
 */
export function bytes32ToString(bytes32: string): string {
  return ethers.decodeBytes32String(bytes32);
}

/**
 * Convert hex string to Uint8Array
 *
 * @param hex - Hex string
 * @returns Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  return ethers.getBytes(hex);
}

/**
 * Convert Uint8Array to hex string
 *
 * @param bytes - Uint8Array
 * @returns Hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return ethers.hexlify(bytes);
}

/**
 * Convert UTF-8 string to hex
 *
 * @param text - UTF-8 string
 * @returns Hex string
 */
export function toUtf8Bytes(text: string): string {
  return ethers.hexlify(ethers.toUtf8Bytes(text));
}

/**
 * Convert hex to UTF-8 string
 *
 * @param hex - Hex string
 * @returns UTF-8 string
 */
export function toUtf8String(hex: string): string {
  return ethers.toUtf8String(hex);
}
