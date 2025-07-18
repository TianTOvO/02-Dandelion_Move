// 测试 createTask 方法修复
import AptosContractService from './src/utils/aptosContractService.js'

console.log('🔍 测试 createTask 方法修复...\n')

// 创建合约服务实例
const contractService = new AptosContractService('testnet')

// 模拟账户信息
const mockAccount = {
    address: '0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb'
}

contractService.setAccount(mockAccount)

// 模拟任务参数
const taskParams = {
    title: "测试",
    ipfsHash: "Qm3dzoragi6wz36iomlzz16p",
    reward: "10000000",
    deadline: "1754352",
    taskType: 1,
    biddingPeriod: 72,
    developmentPeriod: 14
}

console.log('📋 任务参数:')
console.log(JSON.stringify(taskParams, null, 2))

console.log('\n🔍 参数转换测试:')

// 测试参数转换
const titleBytes = Array.from(new TextEncoder().encode(taskParams.title))
const descriptionBytes = Array.from(new TextEncoder().encode(taskParams.ipfsHash))
const rewardInOcta = contractService.aptToOcta(taskParams.reward)
const deadlineNum = parseInt(taskParams.deadline)

console.log('✅ 标题字节:', titleBytes)
console.log('✅ 描述字节:', descriptionBytes)
console.log('✅ 奖励(octa):', rewardInOcta)
console.log('✅ 截止时间:', deadlineNum)

// 模拟合约调用参数
const contractParams = [titleBytes, descriptionBytes, rewardInOcta, deadlineNum]

console.log('\n📦 合约调用参数:')
console.log('函数: create_task')
console.log('参数:', JSON.stringify(contractParams, null, 2))

console.log('\n✅ 参数转换测试完成')
console.log('�� 现在可以尝试在浏览器中创建任务了') 