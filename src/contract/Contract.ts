import { ethers } from 'ethers';
import type { Provider, Signer } from 'ethers';
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI, MULTICALL3_ABI, CONTRACTS } from '../constants';

/**
 * ERC-20 Token interface
 */
export interface ERC20Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  contract: ethers.Contract;

  balanceOf(address: string): Promise<bigint>;
  allowance(owner: string, spender: string): Promise<bigint>;
  totalSupply(): Promise<bigint>;
  transfer(to: string, amount: bigint): Promise<ethers.TransactionResponse>;
  approve(spender: string, amount: bigint): Promise<ethers.TransactionResponse>;
  transferFrom(from: string, to: string, amount: bigint): Promise<ethers.TransactionResponse>;
}

/**
 * Get an ERC-20 token contract
 *
 * @param address - Token contract address
 * @param signerOrProvider - Signer or provider
 * @returns ERC20Token instance
 *
 * @example
 * ```ts
 * const token = await getERC20("0x...", provider);
 * console.log(token.name, token.symbol);
 *
 * const balance = await token.balanceOf("0xmyaddress...");
 * ```
 */
export async function getERC20(
  address: string,
  signerOrProvider: Signer | Provider
): Promise<ERC20Token> {
  const contract = new ethers.Contract(address, ERC20_ABI, signerOrProvider);

  const nameFn = contract.getFunction('name');
  const symbolFn = contract.getFunction('symbol');
  const decimalsFn = contract.getFunction('decimals');

  const [name, symbol, decimals] = await Promise.all([
    nameFn() as Promise<string>,
    symbolFn() as Promise<string>,
    decimalsFn() as Promise<number>,
  ]);

  const balanceOfFn = contract.getFunction('balanceOf');
  const allowanceFn = contract.getFunction('allowance');
  const totalSupplyFn = contract.getFunction('totalSupply');
  const transferFn = contract.getFunction('transfer');
  const approveFn = contract.getFunction('approve');
  const transferFromFn = contract.getFunction('transferFrom');

  return {
    address,
    name,
    symbol,
    decimals,
    contract,

    balanceOf: (addr: string) => balanceOfFn(addr),
    allowance: (owner: string, spender: string) => allowanceFn(owner, spender),
    totalSupply: () => totalSupplyFn(),
    transfer: (to: string, amount: bigint) => transferFn(to, amount),
    approve: (spender: string, amount: bigint) => approveFn(spender, amount),
    transferFrom: (from: string, to: string, amount: bigint) =>
      transferFromFn(from, to, amount),
  };
}

/**
 * ERC-721 NFT interface
 */
export interface ERC721NFT {
  address: string;
  name: string;
  symbol: string;
  contract: ethers.Contract;

  balanceOf(address: string): Promise<bigint>;
  ownerOf(tokenId: bigint): Promise<string>;
  tokenURI(tokenId: bigint): Promise<string>;
  approve(to: string, tokenId: bigint): Promise<ethers.TransactionResponse>;
  setApprovalForAll(operator: string, approved: boolean): Promise<ethers.TransactionResponse>;
  transferFrom(from: string, to: string, tokenId: bigint): Promise<ethers.TransactionResponse>;
  safeTransferFrom(from: string, to: string, tokenId: bigint): Promise<ethers.TransactionResponse>;
}

/**
 * Get an ERC-721 NFT contract
 *
 * @param address - NFT contract address
 * @param signerOrProvider - Signer or provider
 * @returns ERC721NFT instance
 */
export async function getERC721(
  address: string,
  signerOrProvider: Signer | Provider
): Promise<ERC721NFT> {
  const contract = new ethers.Contract(address, ERC721_ABI, signerOrProvider);

  const nameFn = contract.getFunction('name');
  const symbolFn = contract.getFunction('symbol');

  const [name, symbol] = await Promise.all([
    nameFn() as Promise<string>,
    symbolFn() as Promise<string>,
  ]);

  const balanceOfFn = contract.getFunction('balanceOf');
  const ownerOfFn = contract.getFunction('ownerOf');
  const tokenURIFn = contract.getFunction('tokenURI');
  const approveFn = contract.getFunction('approve');
  const setApprovalForAllFn = contract.getFunction('setApprovalForAll');
  const transferFromFn = contract.getFunction('transferFrom');
  const safeTransferFromFn = contract.getFunction('safeTransferFrom(address,address,uint256)');

  return {
    address,
    name,
    symbol,
    contract,

    balanceOf: (addr: string) => balanceOfFn(addr),
    ownerOf: (tokenId: bigint) => ownerOfFn(tokenId),
    tokenURI: (tokenId: bigint) => tokenURIFn(tokenId),
    approve: (to: string, tokenId: bigint) => approveFn(to, tokenId),
    setApprovalForAll: (operator: string, approved: boolean) =>
      setApprovalForAllFn(operator, approved),
    transferFrom: (from: string, to: string, tokenId: bigint) =>
      transferFromFn(from, to, tokenId),
    safeTransferFrom: (from: string, to: string, tokenId: bigint) =>
      safeTransferFromFn(from, to, tokenId),
  };
}

/**
 * ERC-1155 Multi-Token interface
 */
export interface ERC1155Token {
  address: string;
  contract: ethers.Contract;

  balanceOf(account: string, id: bigint): Promise<bigint>;
  balanceOfBatch(accounts: string[], ids: bigint[]): Promise<bigint[]>;
  uri(id: bigint): Promise<string>;
  setApprovalForAll(operator: string, approved: boolean): Promise<ethers.TransactionResponse>;
  safeTransferFrom(from: string, to: string, id: bigint, amount: bigint, data?: string): Promise<ethers.TransactionResponse>;
}

/**
 * Get an ERC-1155 multi-token contract
 *
 * @param address - Contract address
 * @param signerOrProvider - Signer or provider
 * @returns ERC1155Token instance
 */
export function getERC1155(
  address: string,
  signerOrProvider: Signer | Provider
): ERC1155Token {
  const contract = new ethers.Contract(address, ERC1155_ABI, signerOrProvider);

  const balanceOfFn = contract.getFunction('balanceOf');
  const balanceOfBatchFn = contract.getFunction('balanceOfBatch');
  const uriFn = contract.getFunction('uri');
  const setApprovalForAllFn = contract.getFunction('setApprovalForAll');
  const safeTransferFromFn = contract.getFunction('safeTransferFrom');

  return {
    address,
    contract,

    balanceOf: (account: string, id: bigint) => balanceOfFn(account, id),
    balanceOfBatch: (accounts: string[], ids: bigint[]) => balanceOfBatchFn(accounts, ids),
    uri: (id: bigint) => uriFn(id),
    setApprovalForAll: (operator: string, approved: boolean) =>
      setApprovalForAllFn(operator, approved),
    safeTransferFrom: (from: string, to: string, id: bigint, amount: bigint, data = '0x') =>
      safeTransferFromFn(from, to, id, amount, data),
  };
}

/**
 * Multicall3 interface for batching calls
 */
export interface Multicall3 {
  address: string;
  contract: ethers.Contract;

  /**
   * Aggregate multiple calls
   */
  aggregate(
    calls: Array<{ target: string; callData: string }>
  ): Promise<{ blockNumber: bigint; returnData: string[] }>;

  /**
   * Aggregate with failure handling
   */
  aggregate3(
    calls: Array<{ target: string; allowFailure: boolean; callData: string }>
  ): Promise<Array<{ success: boolean; returnData: string }>>;

  /**
   * Get ETH balance of an address
   */
  getEthBalance(address: string): Promise<bigint>;

  /**
   * Get current block number
   */
  getBlockNumber(): Promise<bigint>;

  /**
   * Get current block timestamp
   */
  getCurrentBlockTimestamp(): Promise<bigint>;
}

/**
 * Get Multicall3 contract
 *
 * @param signerOrProvider - Signer or provider
 * @param address - Optional custom address
 * @returns Multicall3 instance
 */
export function getMulticall3(
  signerOrProvider: Signer | Provider,
  address: string = CONTRACTS.MULTICALL3
): Multicall3 {
  const contract = new ethers.Contract(address, MULTICALL3_ABI, signerOrProvider);

  const aggregateFn = contract.getFunction('aggregate');
  const aggregate3Fn = contract.getFunction('aggregate3');
  const getEthBalanceFn = contract.getFunction('getEthBalance');
  const getBlockNumberFn = contract.getFunction('getBlockNumber');
  const getCurrentBlockTimestampFn = contract.getFunction('getCurrentBlockTimestamp');

  return {
    address,
    contract,

    aggregate: async (calls) => {
      const result = await aggregateFn(calls);
      return {
        blockNumber: result[0],
        returnData: result[1],
      };
    },

    aggregate3: (calls) => aggregate3Fn(calls),

    getEthBalance: (addr: string) => getEthBalanceFn(addr),

    getBlockNumber: () => getBlockNumberFn(),

    getCurrentBlockTimestamp: () => getCurrentBlockTimestampFn(),
  };
}

/**
 * Create a contract instance with type safety
 *
 * @param address - Contract address
 * @param abi - Contract ABI
 * @param signerOrProvider - Signer or provider
 * @returns Contract instance
 */
export function createContract(
  address: string,
  abi: ethers.InterfaceAbi,
  signerOrProvider: Signer | Provider
): ethers.Contract {
  return new ethers.Contract(address, abi, signerOrProvider);
}

/**
 * Check if an address is a contract
 *
 * @param address - Address to check
 * @param provider - Provider
 * @returns True if address is a contract
 */
export async function isContract(
  address: string,
  provider: Provider
): Promise<boolean> {
  const code = await provider.getCode(address);
  return code !== '0x' && code !== '0x0';
}
