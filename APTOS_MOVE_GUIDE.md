# 🌻 Dandelion Aptos Move 支持指南

## 📋 概述

Dandelion 平台现已完全支持 **Aptos Move 语言**，提供去中心化任务悬赏的完整解决方案。

## 🏗️ 架构组件

### Move 智能合约

| 合约 | 功能 | 状态 |
|------|------|------|
| `TaskFactory.move` | 任务创建和管理 | ✅ 已完成 |
| `BiddingSystem.move` | 竞标系统 | ✅ 已完成 |
| `Escrow.move` | 资金托管 | ✅ 已完成 |
| `DisputeDAO.move` | 争议仲裁 | ✅ 已完成 |
| `TaskStorage.move` | 任务存储 | ✅ 已完成 |

### 前端集成

| 组件 | 功能 | 状态 |
|------|------|------|
| `aptosConfig.js` | Aptos 配置和工具 | ✅ 已完成 |
| `aptosContractService.js` | 合约交互服务 | ✅ 已完成 |
| `wallet.js` | 钱包连接管理 | ✅ 已完成 |

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装 Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# 验证安装
aptos --version
```

### 2. 部署合约

```bash
# 运行部署脚本
./deploy-aptos-contracts.bat

# 或手动部署
cd MoveContracts
aptos init --profile dandelion --network testnet
aptos move compile --profile dandelion
aptos move publish --profile dandelion --named-addresses dandelion=0x1
```

### 3. 启动前端

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🔧 配置说明

### Move.toml 配置

```toml
[package]
name = "MoveContracts"
version = "0.0.1"
authors = ["Zaydon"]
upgrade_policy = "compatible"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "main" }

[addresses]
mainnet = "0x1"
testnet = "0x1"
devnet = "0x1"
dandelion = "0x1"
```

### 网络配置

```javascript
// aptosConfig.js
export const APTOS_NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    url: 'https://fullnode.mainnet.aptoslabs.com/v1',
    chainId: 1
  },
  testnet: {
    name: 'Testnet', 
    url: 'https://fullnode.testnet.aptoslabs.com/v1',
    chainId: 2,
    faucet: 'https://faucet.testnet.aptoslabs.com'
  },
  devnet: {
    name: 'Devnet',
    url: 'https://fullnode.devnet.aptoslabs.com/v1', 
    chainId: 0,
    faucet: 'https://faucet.devnet.aptoslabs.com'
  }
}
```

## 💰 获取测试币

### 测试网 APT

1. 访问 [Aptos 测试网水龙头](https://faucet.testnet.aptoslabs.com/)
2. 输入您的钱包地址
3. 点击 "Request APT"
4. 等待几分钟到账

### 开发网 APT

1. 访问 [Aptos 开发网水龙头](https://faucet.devnet.aptoslabs.com/)
2. 输入您的钱包地址
3. 点击 "Request APT"

## 🔌 钱包连接

### 支持的钱包

- **Petra Wallet** (推荐)
- **Martian Wallet**
- **Pontem Wallet**

### 连接步骤

1. 安装钱包扩展
2. 创建或导入账户
3. 切换到测试网
4. 在 Dandelion 平台点击"连接钱包"

## 📝 合约交互

### 创建任务

```javascript
import AptosContractService from './utils/aptosContractService.js'

const aptosService = new AptosContractService('testnet')
aptosService.setAccount(walletAccount)

const result = await aptosService.createTask({
  title: "开发一个 Web3 应用",
  ipfsHash: "QmHash...",
  reward: 1000000, // 1 APT
  deadline: Math.floor(Date.now() / 1000) + 86400, // 24小时后
  taskType: "development"
})
```

### 参与竞标

```javascript
// 开启竞标
await aptosService.openBidding(taskId)

// 参与竞标
await aptosService.placeBid(taskId, 1000000) // 1 APT 保证金
```

### 资金管理

```javascript
// 存入资金
await aptosService.depositFunds(taskId, 1000000)

// 释放资金给中标者
await aptosService.releaseFunds(taskId, winnerAddress)
```

## 🔍 查询数据

### 获取任务信息

```javascript
const task = await aptosService.getTask(taskId)
console.log('任务信息:', task)
```

### 获取竞标信息

```javascript
const bids = await aptosService.getBids(taskId)
console.log('竞标信息:', bids)
```

### 获取账户余额

```javascript
const balance = await aptosService.getBalance()
console.log('账户余额:', balance / 1e8, 'APT')
```

## 🛠️ 开发工具

### Aptos CLI 命令

```bash
# 编译合约
aptos move compile

# 运行测试
aptos move test

# 查看账户信息
aptos account list

# 查看账户资源
aptos account list --account 0x1

# 查看交易
aptos transaction show --hash <tx_hash>
```

### 调试技巧

1. **查看交易日志**
   ```bash
   aptos transaction show --hash <tx_hash> --verbose
   ```

2. **检查合约状态**
   ```bash
   aptos account list --account <account_address>
   ```

3. **模拟交易**
   ```bash
   aptos move run --function-id <function_id> --args <args>
   ```

## 🔒 安全注意事项

### 私钥管理

- 永远不要在代码中硬编码私钥
- 使用环境变量存储敏感信息
- 测试时使用专门的测试账户

### 合约安全

- 部署前充分测试合约逻辑
- 使用形式化验证工具
- 定期审计合约代码

### 网络安全

- 确认连接到正确的网络
- 验证合约地址的正确性
- 检查交易参数的有效性

## 📚 学习资源

### 官方文档

- [Aptos 官方文档](https://aptos.dev/)
- [Move 语言文档](https://move-language.github.io/move/)
- [Aptos SDK 文档](https://aptos.dev/sdks/ts-sdk/)

### 开发工具

- [Aptos Explorer](https://explorer.aptoslabs.com/)
- [Aptos Playground](https://playground.aptoslabs.com/)
- [Move Analyzer](https://move-analyzer.aptoslabs.com/)

### 社区资源

- [Aptos Discord](https://discord.gg/aptos)
- [Aptos GitHub](https://github.com/aptos-labs)
- [Move GitHub](https://github.com/move-language/move)

## 🐛 常见问题

### Q: 如何切换网络？

A: 在 `aptosConfig.js` 中修改 `DEFAULT_NETWORK` 变量，或在创建 `AptosContractService` 时指定网络参数。

### Q: 交易失败怎么办？

A: 检查以下几点：
1. 账户余额是否充足
2. 网络连接是否正常
3. 交易参数是否正确
4. 合约是否已正确部署

### Q: 如何获取测试币？

A: 访问对应网络的水龙头网站，输入您的钱包地址即可获取测试币。

### Q: 合约部署失败？

A: 检查以下几点：
1. Aptos CLI 是否正确安装
2. 账户是否有足够的 APT
3. Move.toml 配置是否正确
4. 合约代码是否有语法错误

## 📞 技术支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的常见问题部分
2. 检查控制台错误信息
3. 查看 Aptos Explorer 中的交易状态
4. 在项目 GitHub 仓库提交 Issue

---

**祝您使用愉快！** 🌻 