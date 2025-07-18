// 测试未来时间戳生成
import AptosContractService from './src/utils/aptosContractService.js'

async function testFutureDeadline() {
    console.log('🧪 测试未来时间戳生成...')

    const service = new AptosContractService()

    // 测试不同的截止时间设置
    const testCases = [
        {
            name: '当前时间 + 1天',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        {
            name: '当前时间 + 7天',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
            name: '当前时间 + 30天',
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    ]

    console.log('📋 时间戳测试:')
    testCases.forEach(testCase => {
        const timestamp = Math.floor(testCase.date.getTime() / 1000)
        const now = Math.floor(Date.now() / 1000)
        const diff = timestamp - now

        console.log(`  ${testCase.name}:`)
        console.log(`    时间戳: ${timestamp}`)
        console.log(`    当前时间戳: ${now}`)
        console.log(`    时间差: ${diff} 秒 (${Math.floor(diff / 86400)} 天)`)
        console.log(`    是否未来: ${diff > 0 ? '✅ 是' : '❌ 否'}`)
        console.log('')
    })

    // 测试任务参数
    const futureDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7天后
    const taskParams = {
        title: "测试任务",
        ipfsHash: "Qmotg4v7fkeoeu7vl8t58vxq",
        reward: "0.1",
        deadline: futureDeadline.toString(),
        taskType: 1,
        biddingPeriod: 72,
        developmentPeriod: 14
    }

    console.log('📋 修复后的任务参数:')
    console.log('  原始参数:', taskParams)

    // 转换金额
    const rewardInOcta = service.aptToOcta(taskParams.reward)
    console.log('  转换后奖励:', rewardInOcta, 'octa')

    // 构建最终参数
    const finalParams = [
        taskParams.title,
        taskParams.ipfsHash,
        rewardInOcta,
        taskParams.deadline
    ]

    console.log('\n📋 最终合约参数:')
    console.log('  模块: TaskFactory')
    console.log('  函数: create_task')
    console.log('  参数:', finalParams)

    // 验证时间戳
    const deadline = parseInt(taskParams.deadline)
    const now = Math.floor(Date.now() / 1000)
    console.log('\n📋 时间戳验证:')
    console.log('  当前时间戳:', now)
    console.log('  任务截止时间戳:', deadline)
    console.log('  时间差(秒):', deadline - now)
    console.log('  是否有效:', deadline > now ? '✅ 是' : '❌ 否')

    console.log('\n💡 建议:')
    console.log('1. 在前端设置截止时间时，确保至少是当前时间 + 1天')
    console.log('2. 可以使用这个时间戳进行测试:', futureDeadline)
    console.log('3. 或者在前端添加时间验证，确保截止时间在未来')
}

testFutureDeadline().catch(console.error) 