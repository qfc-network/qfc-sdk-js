# @qfc/sdk

JavaScript/TypeScript SDK for QFC Blockchain.

## Installation

```bash
npm install @qfc/sdk
# or
yarn add @qfc/sdk
# or
pnpm add @qfc/sdk
```

## Quick Start

```typescript
import {
  QfcProvider,
  QfcWallet,
  parseQfc,
  formatQfc,
  NETWORKS
} from '@qfc/sdk';

// Connect to testnet
const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);

// Get balance
const balance = await provider.getBalance("0x...");
console.log('Balance:', formatQfc(balance), 'QFC');

// Create wallet
const wallet = new QfcWallet(privateKey, provider);

// Send transaction
const tx = await wallet.sendTransaction({
  to: "0x...",
  value: parseQfc("10")
});
await tx.wait();
```

## Features

- **QfcProvider** - JSON-RPC provider with QFC-specific methods
- **QfcWallet** - Wallet with staking operations
- **StakingClient** - High-level staking API
- **Contract Helpers** - ERC-20, ERC-721, ERC-1155 utilities
- **Type Safety** - Full TypeScript support
- **ethers.js v6** - Compatible with existing tooling

## Modules

### Provider

```typescript
import { QfcProvider, NETWORKS } from '@qfc/sdk';

const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);

// Standard methods
const balance = await provider.getBalance("0x...");
const block = await provider.getBlock("latest");
const tx = await provider.getTransaction("0x...");

// QFC-specific methods
const validators = await provider.getValidators();
const epoch = await provider.getEpoch();
const stats = await provider.getNetworkStats();
const score = await provider.getContributionScore("0x...");
```

### Wallet

```typescript
import { QfcWallet, parseQfc } from '@qfc/sdk';

// Create from private key
const wallet = new QfcWallet(privateKey, provider);

// Create from mnemonic
const wallet2 = QfcWallet.fromMnemonic("your mnemonic phrase...", provider);

// Create random wallet
const { wallet: newWallet, mnemonic } = QfcWallet.createRandom(provider);

// Staking operations
await wallet.stake(parseQfc("1000"));
await wallet.unstake(parseQfc("500"));
await wallet.claimRewards();

// Delegation
await wallet.delegate("0xvalidator...", parseQfc("500"));
await wallet.undelegate("0xvalidator...", parseQfc("250"));
```

### Staking Client

```typescript
import { StakingClient, QfcProvider, NETWORKS } from '@qfc/sdk';

const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);
const staking = new StakingClient(provider);

// Query staking info
const stakeInfo = await staking.getStakeInfo("0x...");
console.log('Staked:', formatQfc(stakeInfo.stakedAmount));
console.log('Pending rewards:', formatQfc(stakeInfo.pendingRewards));

// Get validators
const validators = await staking.getValidators();
for (const v of validators) {
  console.log(v.address, v.contributionScore, v.uptime + '%');
}

// Get delegations
const delegations = await staking.getDelegations("0x...");
```

### Contract Helpers

```typescript
import { getERC20, getERC721, getMulticall3 } from '@qfc/sdk';

// ERC-20 Token
const token = await getERC20("0xtoken...", provider);
console.log(token.name, token.symbol, token.decimals);
const balance = await token.balanceOf("0x...");

// With signer for transfers
const tokenWithSigner = await getERC20("0xtoken...", wallet);
await tokenWithSigner.transfer("0xto...", parseTokenAmount("100", token.decimals));

// ERC-721 NFT
const nft = await getERC721("0xnft...", provider);
const owner = await nft.ownerOf(1n);

// Multicall for batching
const multicall = getMulticall3(provider);
const results = await multicall.aggregate3([
  { target: token.address, allowFailure: false, callData: "0x..." },
  // ... more calls
]);
```

### Utilities

```typescript
import {
  // Unit conversion
  parseQfc,
  formatQfc,
  formatQfcWithCommas,
  parseGwei,
  formatGwei,

  // Validation
  isValidAddress,
  isValidPrivateKey,
  isValidMnemonic,
  isValidTxHash,

  // Formatting
  shortenAddress,
  shortenHash,
  formatTimestamp,
  formatRelativeTime,

  // Encoding
  encodeFunctionData,
  decodeFunctionResult,
  keccak256,
  getFunctionSelector,
  abiEncode,
  abiDecode,
} from '@qfc/sdk';

// Unit conversion
const wei = parseQfc("1.5");        // 1500000000000000000n
const qfc = formatQfc(wei);         // "1.5000"
const display = formatQfcWithCommas(wei); // "1.5000"

// Validation
isValidAddress("0x1234...");        // true/false
isValidPrivateKey("0x...");         // true/false

// Formatting
shortenAddress("0x1234567890abcdef1234567890abcdef12345678");
// "0x1234...5678"

// Encoding
const selector = getFunctionSelector("transfer(address,uint256)");
// "0xa9059cbb"
```

### WebSocket Subscriptions

```typescript
import { QfcWebSocketProvider, NETWORKS } from '@qfc/sdk';

const wsProvider = new QfcWebSocketProvider(NETWORKS.testnet.wsUrl);

// Subscribe to new blocks
const blockSub = await wsProvider.subscribeNewHeads((block) => {
  console.log('New block:', block.number);
});

// Subscribe to pending transactions
const txSub = await wsProvider.subscribePendingTransactions((hash) => {
  console.log('Pending tx:', hash);
});

// Subscribe to logs
const logSub = await wsProvider.subscribeLogs(
  { address: "0xcontract..." },
  (log) => console.log('Log:', log)
);

// Unsubscribe
await blockSub.unsubscribe();
await wsProvider.unsubscribeAll();
```

## Networks

| Network   | Chain ID | RPC URL                           |
|-----------|----------|-----------------------------------|
| Localhost | 9000     | http://127.0.0.1:8545            |
| Testnet   | 9000     | https://rpc.testnet.qfc.network  |
| Mainnet   | 9001     | https://rpc.qfc.network          |

```typescript
import { NETWORKS, getNetwork, getNetworkByChainId } from '@qfc/sdk';

// Access network configs
console.log(NETWORKS.testnet.rpcUrl);
console.log(NETWORKS.testnet.explorerUrl);

// Get by name
const testnet = getNetwork('testnet');

// Get by chain ID
const network = getNetworkByChainId(9000);
```

## Constants

```typescript
import {
  MIN_STAKE,          // 10,000 QFC minimum stake
  MIN_DELEGATION,     // 100 QFC minimum delegation
  UNSTAKE_DELAY,      // 7 days unstake period
  GAS_LIMITS,         // Pre-defined gas limits
  CONTRACTS,          // Well-known contract addresses
} from '@qfc/sdk';
```

## Error Handling

```typescript
import { QfcError, SDK_ERRORS } from '@qfc/sdk';

try {
  await wallet.stake(parseQfc("100"));
} catch (error) {
  if (error instanceof QfcError) {
    console.log(error.code);    // "SDK_STAKE_TOO_LOW"
    console.log(error.message); // "Stake amount is below minimum requirement"
  }
}
```

## TypeScript

The SDK includes full TypeScript definitions:

```typescript
import type {
  Block,
  Transaction,
  TransactionReceipt,
  Validator,
  StakeInfo,
  NetworkConfig,
} from '@qfc/sdk';
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Watch mode
npm run dev
```

## License

MIT
