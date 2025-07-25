# 🎯 竞标功能使用指南

## 📋 概述

竞标功能允许用户参与任务竞标，雇主选择中标者，以及完成任务的完整流程。

## 🔄 竞标流程

### 1. 任务创建阶段
- **状态**: `TASK_OPEN (0)` - 开放中
- **操作**: 任何用户都可以参与竞标
- **合约函数**: `participate_task(task_id)`

### 2. 竞标参与阶段
- **参与者**: 任何用户都可以参与
- **限制**: 任务状态必须为 `TASK_OPEN`
- **结果**: 参与者地址被添加到任务的 `participants` 数组中

### 3. 选择中标者阶段
- **操作者**: 只有任务创建者可以选择中标者
- **限制**: 任务状态必须为 `TASK_OPEN`
- **合约函数**: `select_winner(task_id, winner_address)`
- **结果**: 任务状态变为 `TASK_IN_PROGRESS (1)`

### 4. 任务执行阶段
- **状态**: `TASK_IN_PROGRESS (1)` - 进行中
- **中标者**: 开始执行任务
- **雇主**: 等待任务完成

### 5. 任务完成阶段
- **操作者**: 中标者完成任务
- **合约函数**: `complete_task(task_id)`
- **结果**: 任务状态变为 `TASK_COMPLETED (2)`

## 🖥️ 前端操作步骤

### 步骤1: 连接钱包
1. 打开前端应用
2. 点击"连接钱包"按钮
3. 选择您的钱包（如Petra、Martian等）
4. 确认连接

### 步骤2: 查看任务
1. 进入"任务大厅"页面
2. 浏览可用的任务
3. 点击任务查看详情

### 步骤3: 参与竞标
1. 在任务详情页面，找到"参与竞标"按钮
2. 点击按钮开始竞标
3. 确认钱包交易
4. 等待交易确认

### 步骤4: 选择中标者（仅任务创建者）
1. 在任务详情页面，查看参与者列表
2. 点击"选择为中标者"按钮
3. 确认选择
4. 等待交易确认

### 步骤5: 完成任务（仅中标者）
1. 执行任务内容
2. 在任务详情页面，点击"提交完成"按钮
3. 填写完成证明和说明
4. 确认提交
5. 等待交易确认

## 🔧 合约函数详解

### participate_task
```move
public entry fun participate_task(owner: &signer, task_id: u64)
```
- **功能**: 参与任务竞标
- **参数**: 
  - `owner`: 参与者签名者
  - `task_id`: 任务ID
- **限制**: 任务状态必须为 `TASK_OPEN`

### select_winner
```move
public entry fun select_winner(owner: &signer, task_id: u64, winner: address)
```
- **功能**: 选择中标者
- **参数**:
  - `owner`: 任务创建者签名者
  - `task_id`: 任务ID
  - `winner`: 中标者地址
- **限制**: 
  - 任务状态必须为 `TASK_OPEN`
  - 只有任务创建者可以调用

### complete_task
```move
public entry fun complete_task(owner: &signer, task_id: u64)
```
- **功能**: 完成任务
- **参数**:
  - `owner`: 中标者签名者
  - `task_id`: 任务ID
- **限制**: 
  - 任务状态必须为 `TASK_IN_PROGRESS`
  - 只有中标者可以调用

## 🎮 测试竞标流程

### 使用测试脚本
1. 打开浏览器控制台
2. 运行测试脚本：
```javascript
// 加载测试脚本
await import('./test-bidding-flow.js')

// 设置您的私钥
// 注意：请使用测试网私钥，不要使用主网私钥

// 运行完整测试
await testBiddingFlow()
```

### 手动测试步骤
1. **创建任务**:
```javascript
await createTask()
```

2. **参与竞标**:
```javascript
await participateTask(0) // 参与任务ID为0的竞标
```

3. **选择中标者**:
```javascript
await selectWinner(0, 'your_address_here')
```

4. **完成任务**:
```javascript
await completeTask(0)
```

## ⚠️ 注意事项

### 安全提醒
- 请使用测试网进行测试
- 不要在主网使用测试私钥
- 确保钱包有足够的测试网APT代币

### 常见问题
1. **交易失败**: 检查钱包余额是否足够
2. **权限错误**: 确认操作者身份（创建者/中标者）
3. **状态错误**: 确认任务当前状态是否允许该操作

### 状态转换规则
```
TASK_OPEN (0) 
    ↓ [participate_task] 
TASK_OPEN (0) + 参与者
    ↓ [select_winner] 
TASK_IN_PROGRESS (1)
    ↓ [complete_task] 
TASK_COMPLETED (2)
```

## 🎯 竞标策略建议

### 对于竞标者
1. **仔细阅读任务描述**: 确保理解任务要求
2. **评估自己的能力**: 不要参与超出能力范围的任务
3. **合理报价**: 考虑任务复杂度和时间成本
4. **及时沟通**: 与雇主保持良好沟通

### 对于雇主
1. **详细描述任务**: 提供清晰的任务要求和期望
2. **合理设置预算**: 根据任务复杂度设置合理预算
3. **及时选择中标者**: 避免竞标期过长
4. **公平评价**: 客观评价中标者的工作

## 📞 技术支持

如果遇到问题，请：
1. 检查浏览器控制台错误信息
2. 确认钱包连接状态
3. 验证合约部署状态
4. 联系技术支持团队

---

**祝您竞标顺利！** 🚀 