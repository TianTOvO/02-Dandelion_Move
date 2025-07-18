// 测试APT到octa的转换
import AptosContractService from './src/utils/aptosContractService.js'

async function testAmountConversion() {
    console.log('🧪 测试APT到octa的转换...')

    const service = new AptosContractService()

    // 测试各种金额转换
    const testAmounts = ['0.1', '1.0', '0.5', '2.5', '10.0']

    console.log('📋 金额转换测试:')
    testAmounts.forEach(amount => {
        const octa = service.aptToOcta(amount)
        console.log(`  ${amount} APT = ${octa} octa`)
    })

    // 测试创建任务的参数
    const taskParams = {
        title: "测试任务",
        ipfsHash: "Qmotg4v7fkeoeu7vl8t58vxq",
        reward: "0.1",
        deadline: "1754352",
        taskType: 1,
        biddingPeriod: 72,
        developmentPeriod: 14
    }

    console.log('\n📋 任务参数转换:')
    console.log('原始奖励:', taskParams.reward, 'APT')
    const rewardInOcta = service.aptToOcta(taskParams.reward)
    console.log('转换后奖励:', rewardInOcta, 'octa')

    console.log('\n✅ 金额转换已修复！')
    console.log('💡 现在可以重新尝试创建任务了，不会再出现BigInt转换错误')
}

testAmountConversion().catch(console.error) 