// 测试钱包连接和交易提交
import { validateWalletConnection, signAndSubmitTransaction, buildTransactionPayload } from './src/utils/aptosConfig.js'

async function testWalletConnection() {
    console.log('🔍 测试钱包连接和交易提交...')

    try {
        // 检查钱包是否可用
        console.log('📋 检查钱包连接...')
        validateWalletConnection()
        console.log('✅ 钱包连接验证通过')

        // 检查可用的钱包
        console.log('\n📋 可用钱包检查:')
        if (typeof window !== 'undefined') {
            console.log('  - window.petra:', !!window.petra)
            console.log('  - window.aptos:', !!window.aptos)

            if (window.petra) {
                console.log('  - Petra 钱包已安装')
            }
            if (window.aptos) {
                console.log('  - Aptos 钱包已安装')
            }
        } else {
            console.log('  - 非浏览器环境')
        }

        // 测试交易载荷构建
        console.log('\n📋 测试交易载荷构建:')
        const payload = buildTransactionPayload(
            '0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb',
            'TaskFactory',
            'create_task',
            [],
            ['测试任务', 'Qmotg4v7fkeoeu7vl8t58vxq', '10000000', '1753366461']
        )

        console.log('  交易载荷:', JSON.stringify(payload, null, 2))

        console.log('\n💡 建议:')
        console.log('1. 确保 Petra 钱包已安装并连接')
        console.log('2. 确保钱包账户有足够的 APT 余额')
        console.log('3. 确保网络设置为 Aptos 测试网')
        console.log('4. 如果仍有问题，请检查浏览器控制台的详细错误信息')

    } catch (error) {
        console.error('❌ 钱包连接测试失败:', error.message)
        console.log('\n💡 解决方案:')
        console.log('1. 安装 Petra 钱包扩展程序')
        console.log('2. 刷新页面并重新连接钱包')
        console.log('3. 确保钱包已解锁并连接到正确的网络')
    }
}

testWalletConnection().catch(console.error) 