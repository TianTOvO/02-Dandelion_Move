# Dandelion Move 合约部署指南

## 📋 **部署前准备**

### 1. **环境要求**
- Node.js 16+ 
- Aptos CLI 最新版本
- 测试网 APT 代币（用于支付gas费）

### 2. **检查Aptos CLI**
```bash
# 检查Aptos CLI版本
aptos --version

# 如果未安装，请先安装Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### 3. **获取测试网APT**
访问 [Aptos测试网水龙头](https://faucet.testnet.aptoslabs.com/) 获取测试币

## 🚀 **部署步骤**

### 步骤1: 进入合约目录
```bash
cd MoveContracts
```

### 步骤2: 检查配置文件
确认以下文件配置正确：

#### Move.toml 配置
```toml
[package]
name = "MoveContracts"
version = "0.0.1"
authors = ["Zaydon"]
upgrade_policy = "compatible"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "main" }

[addresses]
# 测试网地址  
testnet = "0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9"
# 项目模块地址
dandelion = "0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9"
```

#### .aptos/config.yaml 配置
```yaml
profiles:
  newaddress:
    network: Testnet
    private_key: ed25519-priv-0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9
    public_key: ed25519-pub-0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9
    account: 87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9
    rest_url: "https://fullnode.testnet.aptoslabs.com"
```

### 步骤3: 编译合约
```bash
# 编译所有合约
aptos move compile --profile newaddress

# 检查编译结果
ls build/
```

### 步骤4: 发布合约
```bash
# 发布合约到测试网
aptos move publish --profile newaddress --named-addresses dandelion=0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9
```

### 步骤5: 验证部署
```bash
# 检查账户资源
aptos account list --profile newaddress

# 查看部署的模块
aptos account list --profile newaddress --query modules
```

### 步骤6: 初始化合约
```bash
# 初始化 TaskFactory
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskFactory::init'

# 初始化 BiddingSystem
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::BiddingSystem::init' \
  --args u64:1000000

# 初始化 Escrow
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::Escrow::init'

# 初始化 DisputeDAO
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::DisputeDAO::init' \
  --args u64:1000000 u64:3 u64:86400

# 初始化 TaskStorage
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskStorage::init'
```

## 🔍 **部署验证**

### 1. **检查模块是否部署成功**
```bash
# 查看所有模块
aptos account list --profile newaddress --query modules

# 应该看到以下模块：
# - TaskFactory
# - BiddingSystem  
# - Escrow
# - DisputeDAO
# - TaskStorage
```

### 2. **检查资源是否初始化成功**
```bash
# 查看账户资源
aptos account list --profile newaddress --query resources

# 应该看到以下资源：
# - TaskFactoryState
# - BiddingSystemState
# - EscrowState
# - DisputeDAOState
# - TaskStorageState
```

### 3. **测试合约功能**
```bash
# 测试创建任务
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskFactory::create_task' \
  --args vector<u8>:"测试任务" vector<u8>:"这是一个测试任务" u64:1000000 u64:1735689600

# 测试查看任务
aptos move view --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskFactory::view_get_all_tasks'
```

## 🛠️ **故障排除**

### 1. **编译错误**
```bash
# 清理编译缓存
aptos move clean

# 重新编译
aptos move compile --profile newaddress
```

### 2. **部署错误**
```bash
# 检查账户余额
aptos account list --profile newaddress --query resources

# 如果余额不足，从水龙头获取更多APT
```

### 3. **初始化错误**
```bash
# 检查是否已经初始化
aptos account list --profile newaddress --query resources

# 如果资源已存在，说明已经初始化过
```

### 4. **网络连接问题**
```bash
# 检查网络连接
curl https://fullnode.testnet.aptoslabs.com/v1

# 如果连接失败，检查网络设置
```

## 📝 **部署后配置**

### 1. **更新前端配置**
部署成功后，需要更新前端的合约地址配置：

```javascript
// src/utils/aptosConfig.js
export const CONTRACT_MODULES = {
  TaskFactory: '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::dandelion::TaskFactory',
  BiddingSystem: '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::dandelion::BiddingSystem',
  Escrow: '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::dandelion::Escrow',
  DisputeDAO: '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::dandelion::DisputeDAO',
  TaskStorage: '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::dandelion::TaskStorage'
}
```

### 2. **测试前端连接**
```bash
# 启动前端开发服务器
cd ..
npm run dev

# 在浏览器中测试合约连接
```

## 🎯 **部署检查清单**

- [ ] Aptos CLI 已安装并更新到最新版本
- [ ] 测试网账户有足够的APT余额
- [ ] Move.toml 配置正确
- [ ] .aptos/config.yaml 配置正确
- [ ] 合约编译成功
- [ ] 合约发布成功
- [ ] 所有模块初始化成功
- [ ] 前端配置已更新
- [ ] 功能测试通过

## 📞 **技术支持**

如果遇到问题，请检查：
1. 网络连接是否正常
2. 账户余额是否充足
3. 配置文件是否正确
4. 编译错误信息
5. 部署错误日志

部署成功后，您就可以在前端正常使用所有合约功能了！ 