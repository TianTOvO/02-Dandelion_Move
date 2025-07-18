// 调试合约调用问题
import AptosContractService from './src/utils/aptosContractService.js'

async function debugContractCall() {
    console.log('🔍 调试合约调用问题...')

    const service = new AptosContractService()

    console.log('📋 服务状态:')
    console.log('  - 模拟模式:', service.simulationMode)
    console.log('  - 合约地址:', service.contractAddress)
    console.log('  - 网络:', service.network)

    // 检查合约部署状态
    const isDeployed = await service.checkContractDeployed()
    console.log('🔍 合约部署状态:', isDeployed)

    if (!isDeployed) {
        console.log('❌ 合约未部署，无法测试')
        return
    }

    // 测试参数构建
    const taskParams = {
        title: "测试任务",
        ipfsHash: "Qmotg4v7fkeoeu7vl8t58vxq",
        reward: "0.1",
        deadline: "1754352",
        taskType: 1,
        biddingPeriod: 72,
        developmentPeriod: 14
    }

    console.log('\n📋 任务参数:')
    console.log('  原始参数:', taskParams)

    // 转换金额
    const rewardInOcta = service.aptToOcta(taskParams.reward)
    console.log('  转换后奖励:', rewardInOcta, 'octa')

    // 构建最终参数
    const finalParams = [
        taskParams.title,
        taskParams.ipfsHash,
        rewardInOcta,
        taskParams.deadline.toString()
    ]

    console.log('\n📋 最终合约参数:')
    console.log('  模块: TaskFactory')
    console.log('  函数: create_task')
    console.log('  参数:', finalParams)

    // 检查参数类型
    console.log('\n📋 参数类型检查:')
    finalParams.forEach((param, index) => {
        console.log(`  参数${index}: ${param} (类型: ${typeof param})`)
    })

    // 检查deadline是否为有效时间戳
    const deadline = parseInt(taskParams.deadline)
    const now = Math.floor(Date.now() / 1000)
    console.log('\n📋 时间戳检查:')
    console.log('  当前时间戳:', now)
    console.log('  任务截止时间戳:', deadline)
    console.log('  时间差(秒):', deadline - now)

    if (deadline <= now) {
        console.log('⚠️ 警告: 截止时间已过期！')
    }

    console.log('\n💡 建议:')
    console.log('1. 确保截止时间戳是未来的时间')
    console.log('2. 检查IPFS哈希是否有效')
    console.log('3. 确保钱包有足够的APT余额')
    console.log('4. 检查网络连接状态')
}

debugContractCall().catch(console.error) 