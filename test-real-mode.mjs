// 测试真实合约模式
import AptosContractService from './src/utils/aptosContractService.js'

async function testRealMode() {
    console.log('🧪 测试真实合约模式...')

    const service = new AptosContractService()

    console.log('📋 模拟模式状态:', service.simulationMode)
    console.log('🎯 合约地址:', service.contractAddress)

    // 检查合约部署状态
    const isDeployed = await service.checkContractDeployed()
    console.log('🔍 合约部署状态:', isDeployed)

    // 自动检测模式
    await service.autoDetectMode()
    console.log('🔄 自动检测后模拟模式状态:', service.simulationMode)

    if (!service.simulationMode) {
        console.log('✅ 真实合约模式已启用！')
        console.log('💡 所有合约调用将直接与链上合约交互')
    } else {
        console.log('⚠️ 仍在使用模拟模式')
    }
}

testRealMode().catch(console.error) 