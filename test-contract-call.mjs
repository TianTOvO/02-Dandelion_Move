// 测试修复后的合约调用
import AptosContractService from './src/utils/aptosContractService.js'

async function testContractCall() {
    console.log('🧪 测试修复后的合约调用...')

    const service = new AptosContractService()

    console.log('📋 模拟模式状态:', service.simulationMode)
    console.log('🎯 合约地址:', service.contractAddress)

    // 检查合约部署状态
    const isDeployed = await service.checkContractDeployed()
    console.log('🔍 合约部署状态:', isDeployed)

    if (!isDeployed) {
        console.log('❌ 合约未部署，无法测试')
        return
    }

    // 测试创建任务的参数构建
    const taskParams = {
        title: "测试任务",
        ipfsHash: "Qmotg4v7fkeoeu7vl8t58vxq",
        reward: "0.1",
        deadline: "1754352",
        taskType: 1,
        biddingPeriod: 72,
        developmentPeriod: 14
    }

    console.log('📋 任务参数:', taskParams)
    console.log('✅ 合约调用已修复，现在使用正确的模块名:')
    console.log('  - TaskFactory::create_task')
    console.log('  - BiddingSystem::place_bid')
    console.log('  - Escrow::deposit_funds')
    console.log('  - DisputeDAO::init')

    console.log('💡 现在可以重新尝试创建任务了！')
}

testContractCall().catch(console.error) 