/**
 * QFC SDK Contract Helpers
 */

export {
  getERC20,
  getERC721,
  getERC1155,
  getMulticall3,
  createContract,
  isContract,
} from './Contract';

export type {
  ERC20Token,
  ERC721NFT,
  ERC1155Token,
  Multicall3,
} from './Contract';

// Re-export common contract types from ethers
export type { Contract, ContractRunner, ContractTransaction, ContractFactory } from 'ethers';
