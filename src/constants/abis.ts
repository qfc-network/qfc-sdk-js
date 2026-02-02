/**
 * Common ABI fragments for frequently used functions
 */

/**
 * ERC-20 Token Standard ABI
 */
export const ERC20_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',

  // Write functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const;

/**
 * ERC-721 NFT Standard ABI
 */
export const ERC721_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',

  // Write functions
  'function approve(address to, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool approved)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
] as const;

/**
 * ERC-1155 Multi-Token Standard ABI
 */
export const ERC1155_ABI = [
  // Read functions
  'function uri(uint256 id) view returns (string)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function isApprovedForAll(address account, address operator) view returns (bool)',

  // Write functions
  'function setApprovalForAll(address operator, bool approved)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',

  // Events
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
  'event ApprovalForAll(address indexed account, address indexed operator, bool approved)',
  'event URI(string value, uint256 indexed id)',
] as const;

/**
 * QFC Staking Contract ABI
 */
export const QFC_STAKING_ABI = [
  // Read functions
  'function getStakeInfo(address staker) view returns (uint256 stakedAmount, uint256 unstakingAmount, uint256 unstakingCompletesAt, uint256 pendingRewards)',
  'function getValidator(address validator) view returns (address operatorAddress, uint256 totalStake, uint256 selfStake, uint256 delegatedStake, uint256 contributionScore, uint8 status, uint256 commission)',
  'function getValidators() view returns (address[] validators)',
  'function getDelegation(address delegator, address validator) view returns (uint256 amount, uint256 pendingRewards)',
  'function getMinStake() view returns (uint256)',
  'function getUnstakeDelay() view returns (uint256)',

  // Write functions
  'function stake() payable',
  'function unstake(uint256 amount)',
  'function claimRewards()',
  'function delegate(address validator) payable',
  'function undelegate(address validator, uint256 amount)',
  'function registerValidator(uint256 commission, string moniker)',
  'function updateValidator(uint256 commission, string moniker)',
  'function exitValidator()',

  // Events
  'event Staked(address indexed staker, uint256 amount)',
  'event Unstaked(address indexed staker, uint256 amount)',
  'event UnstakeCompleted(address indexed staker, uint256 amount)',
  'event RewardsClaimed(address indexed staker, uint256 amount)',
  'event Delegated(address indexed delegator, address indexed validator, uint256 amount)',
  'event Undelegated(address indexed delegator, address indexed validator, uint256 amount)',
  'event ValidatorRegistered(address indexed validator, uint256 commission)',
  'event ValidatorUpdated(address indexed validator, uint256 commission)',
  'event ValidatorExited(address indexed validator)',
  'event Slashed(address indexed validator, uint256 amount, string reason)',
] as const;

/**
 * WETH-like wrapped token ABI
 */
export const WRAPPED_TOKEN_ABI = [
  ...ERC20_ABI,
  'function deposit() payable',
  'function withdraw(uint256 amount)',
  'event Deposit(address indexed dst, uint256 wad)',
  'event Withdrawal(address indexed src, uint256 wad)',
] as const;

/**
 * Multicall3 ABI for batching calls
 */
export const MULTICALL3_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)',
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function aggregate3Value(tuple(address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function blockAndAggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
  'function getBasefee() view returns (uint256 basefee)',
  'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
  'function getBlockNumber() view returns (uint256 blockNumber)',
  'function getChainId() view returns (uint256 chainid)',
  'function getCurrentBlockCoinbase() view returns (address coinbase)',
  'function getCurrentBlockDifficulty() view returns (uint256 difficulty)',
  'function getCurrentBlockGasLimit() view returns (uint256 gaslimit)',
  'function getCurrentBlockTimestamp() view returns (uint256 timestamp)',
  'function getEthBalance(address addr) view returns (uint256 balance)',
  'function getLastBlockHash() view returns (bytes32 blockHash)',
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
] as const;
