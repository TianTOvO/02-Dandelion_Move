// 测试 TaskFactory 初始化
import AptosContractService from './src/utils/aptosContractService.js'

console.log('🔍 测试 TaskFactory 初始化...\n')

// 创建合约服务实例
const contractService = new AptosContractService('testnet')

// 模拟账户信息
const mockAccount = {
    address: '0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb'
}

contractService.setAccount(mockAccount)

console.log('📋 合约服务配置:')
console.log('  网络:', contractService.network)
console.log('  合约地址:', contractService.contractAddress)
console.log('  账户地址:', contractService.account?.address)
console.log('  模拟模式:', contractService.simulationMode)
console.log('')

// 测试初始化载荷构建
console.log('🧪 测试初始化载荷构建:')
const initPayload = {
    function: `${contractService.contractAddress}::TaskFactory::init`,
    type_arguments: [],
    arguments: []
}

console.log('init 函数载荷:')
console.log(JSON.stringify(initPayload, null, 2))
console.log('')

// 测试资源检查
console.log('🔍 测试资源检查逻辑:')
const resourceType = `${contractService.contractAddress}::TaskFactory::TaskFactoryState`
console.log('期望的资源类型:', resourceType)
console.log('')

// 测试错误处理
console.log('⚠️ 测试错误处理:')
const testErrors = [
    'Resource not found',
    'Account not found',
    'Module not found',
    'Generic error'
]

testErrors.forEach(error => {
    const shouldRetry = error.includes('Resource not found') || error.includes('Account not found')
    console.log(`错误: "${error}" -> ${shouldRetry ? '会重试初始化' : '不会重试'}`)
})

console.log('\n✅ 测试完成')
console.log('💡 现在可以在浏览器中测试 TaskFactory 初始化了') 