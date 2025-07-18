# Dandelion 交易确认指南

## 概述

在使用Dandelion平台时，您需要与Aptos区块链进行交互，这需要通过Petra钱包确认交易。本指南将帮助您顺利完成交易。

## 交易流程

### 1. 连接钱包
- 确保已安装Petra钱包
- 在Dandelion平台点击"连接钱包"
- 在Petra钱包中确认连接请求

### 2. 确认交易
当您执行以下操作时，需要确认交易：
- 创建任务
- 参与竞标
- 选择中标者
- 确认任务完成

### 3. 交易确认步骤
1. **点击操作按钮**（如"创建任务"）
2. **等待钱包弹出** - Petra钱包会显示交易详情
3. **检查交易信息**：
   - 交易类型
   - 费用估算
   - 目标地址
4. **点击"确认"** - 批准交易
5. **等待确认** - 交易将在区块链上处理

## 常见错误及解决方案

### 错误代码 4001 - 用户拒绝交易
**原因**: 您在Petra钱包中点击了"拒绝"按钮
**解决方案**:
1. 重新尝试操作
2. 在钱包弹出时点击"确认"
3. 检查钱包是否已连接

### 错误代码 4001 - 钱包未弹出
**原因**: Petra钱包没有显示交易确认对话框
**解决方案**:
1. 检查Petra钱包是否已安装并运行
2. 确认钱包已连接到Dandelion平台
3. 检查浏览器是否阻止了弹窗
4. 尝试刷新页面并重新连接钱包

### 余额不足错误
**原因**: 账户APT余额不足以支付交易费用
**解决方案**:
1. 从Aptos测试网水龙头获取测试币
2. 确保余额至少为0.01 APT
3. 检查网络设置是否为测试网

### 网络连接错误
**原因**: 无法连接到Aptos网络
**解决方案**:
1. 检查网络连接
2. 确认Petra钱包网络设置为测试网
3. 尝试切换网络后重试

## 测试网设置

### 获取测试币
1. 访问 [Aptos测试网水龙头](https://faucet.testnet.aptoslabs.com/)
2. 输入您的钱包地址
3. 点击"Request"获取测试币

### 网络配置
确保Petra钱包设置为：
- **网络**: Testnet
- **RPC URL**: https://fullnode.testnet.aptoslabs.com
- **Chain ID**: 2

## 故障排除

### 钱包连接问题
```javascript
// 检查钱包连接状态
if (window.aptos) {
  console.log('Petra钱包已安装')
  window.aptos.isConnected().then(connected => {
    console.log('连接状态:', connected)
  })
} else {
  console.log('Petra钱包未安装')
}
```

### 交易状态检查
```javascript
// 检查交易状态
const txHash = 'your_transaction_hash'
const result = await client.waitForTransaction(txHash)
console.log('交易状态:', result.success)
```

### 余额检查
```javascript
// 检查账户余额
const balance = await client.getBalance(address)
console.log('账户余额:', balance, 'APT')
```

## 最佳实践

### 1. 交易前检查
- ✅ 钱包已连接
- ✅ 网络设置为测试网
- ✅ 账户有足够余额
- ✅ 浏览器允许弹窗

### 2. 交易确认
- ✅ 仔细检查交易详情
- ✅ 确认费用合理
- ✅ 点击"确认"按钮

### 3. 交易后验证
- ✅ 等待交易确认
- ✅ 检查交易状态
- ✅ 验证操作结果

## 联系支持

如果遇到无法解决的问题：
1. 检查浏览器控制台错误信息
2. 截图错误详情
3. 联系技术支持团队

## 相关链接

- [Petra钱包官网](https://petra.app/)
- [Aptos测试网水龙头](https://faucet.testnet.aptoslabs.com/)
- [Aptos开发者文档](https://aptos.dev/)
- [Dandelion项目文档](https://github.com/TianTOvO/Dandelion_Move) 