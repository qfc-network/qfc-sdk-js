# QFC SDK - JavaScript/TypeScript

QFC 区块链的 JavaScript/TypeScript SDK。

## 项目结构

```
qfc-sdk-js/
├── src/
│   ├── index.ts                 # 主导出文件
│   ├── provider/
│   │   ├── QfcProvider.ts       # JSON-RPC Provider (扩展 ethers)
│   │   └── WebSocketProvider.ts # WebSocket 订阅支持
│   ├── wallet/
│   │   └── QfcWallet.ts         # 钱包 (含质押操作)
│   ├── staking/
│   │   └── StakingClient.ts     # 高级质押 API
│   ├── contract/
│   │   └── Contract.ts          # 合约辅助函数
│   ├── types/
│   │   ├── block.ts             # 区块类型
│   │   ├── transaction.ts       # 交易类型
│   │   ├── account.ts           # 账户类型
│   │   ├── validator.ts         # 验证者类型
│   │   ├── network.ts           # 网络类型
│   │   └── rpc.ts               # RPC 类型
│   ├── constants/
│   │   ├── networks.ts          # 网络配置
│   │   ├── errors.ts            # 错误码
│   │   └── abis.ts              # 常用 ABI
│   └── utils/
│       ├── units.ts             # 单位转换 (QFC/wei)
│       ├── validation.ts        # 验证函数
│       ├── format.ts            # 格式化函数
│       └── encoding.ts          # ABI 编码辅助
├── package.json
├── tsconfig.json
├── tsup.config.ts               # 构建配置
├── vitest.config.ts             # 测试配置
└── README.md
```

## 常用命令

```bash
# 安装依赖
npm install

# 开发模式 (watch)
npm run dev

# 构建
npm run build

# 运行测试
npm test

# 类型检查
npm run typecheck
```

## 核心模块

### QfcProvider

扩展 ethers.js JsonRpcProvider，添加 QFC 特有方法：

```typescript
// 标准方法 (继承自 ethers)
getBalance(address)
getBlock(blockHashOrNumber)
getTransaction(hash)
sendTransaction(tx)

// QFC 特有方法
getValidators()              // 获取验证者列表
getValidator(address)        // 获取验证者详情
getContributionScore(address) // 获取贡献分数
getEpoch()                   // 获取当前 epoch 信息
getNetworkStats()            // 获取网络统计
```

### QfcWallet

扩展 ethers.js Wallet，添加质押操作：

```typescript
// 标准方法 (继承自 ethers)
sendTransaction(tx)
signMessage(message)
signTypedData(domain, types, value)

// 质押操作
stake(amount)                           // 质押
unstake(amount)                         // 取消质押
claimRewards()                          // 领取奖励
delegate(validator, amount)             // 委托
undelegate(validator, amount)           // 取消委托
registerValidator(commission, moniker)  // 注册验证者
exitValidator()                         // 退出验证者
```

### StakingClient

高级质押查询 API（只读）：

```typescript
getStakeInfo(address)      // 获取质押信息
getDelegation(delegator, validator) // 获取委托信息
getDelegations(delegator)  // 获取所有委托
getValidators()            // 获取验证者列表
getValidator(address)      // 获取验证者详情
getTotalStaked()           // 获取总质押量
```

### 合约辅助

```typescript
getERC20(address, provider)     // ERC-20 代币
getERC721(address, provider)    // ERC-721 NFT
getERC1155(address, provider)   // ERC-1155 多代币
getMulticall3(provider)         // Multicall3 批量调用
isContract(address, provider)   // 检查是否合约
```

### 工具函数

```typescript
// 单位转换
parseQfc("1.5")      // 字符串 -> wei
formatQfc(wei)       // wei -> 字符串

// 验证
isValidAddress(addr)
isValidPrivateKey(key)
isValidMnemonic(phrase)

// 格式化
shortenAddress(addr)  // "0x1234...5678"
formatTimestamp(ts)
formatRelativeTime(ts) // "5 minutes ago"

// 编码
encodeFunctionData(abi, args)
decodeFunctionResult(abi, data)
keccak256(data)
getFunctionSelector(signature)
```

## 网络配置

| 网络 | Chain ID | RPC URL |
|------|----------|---------|
| 本地 | 9000 | http://127.0.0.1:8545 |
| 测试网 | 9000 | https://rpc.testnet.qfc.network |
| 主网 | 9001 | https://rpc.qfc.network |

## 常量

```typescript
MIN_STAKE         // 最小质押量 (10,000 QFC)
MIN_DELEGATION    // 最小委托量 (100 QFC)
UNSTAKE_DELAY     // 取消质押延迟 (7天)
GAS_LIMITS        // 预定义 gas 限制
CONTRACTS         // 已知合约地址
```

## 技术栈

- **语言**: TypeScript 5.3+
- **依赖**: ethers.js v6
- **构建**: tsup (ESM + CJS)
- **测试**: vitest
- **输出**: dist/index.js (ESM), dist/index.cjs (CJS), dist/index.d.ts (类型)

## 设计原则

1. **ethers.js 兼容** - 继承/扩展 ethers 类，保持 API 一致性
2. **类型安全** - 严格 TypeScript，完整类型定义
3. **Tree-shakeable** - ESM 模块，支持按需打包
4. **错误处理** - 自定义 QfcError 类，清晰错误码

## 使用示例

```typescript
import {
  QfcProvider,
  QfcWallet,
  parseQfc,
  formatQfc,
  NETWORKS
} from '@qfc/sdk';

// 连接测试网
const provider = new QfcProvider(NETWORKS.testnet.rpcUrl);

// 查询余额
const balance = await provider.getBalance("0x...");
console.log('余额:', formatQfc(balance), 'QFC');

// 创建钱包
const wallet = new QfcWallet(privateKey, provider);

// 发送交易
const tx = await wallet.sendTransaction({
  to: "0x...",
  value: parseQfc("10")
});

// 质押
await wallet.stake(parseQfc("1000"));

// 获取验证者
const validators = await provider.getValidators();
```

## 设计文档

参考 `../qfc-design/00-PROJECT-OVERVIEW.md` 和 `../qfc-design/01-BLOCKCHAIN-DESIGN.md`
