// 钱包连接测试脚本
// 请在浏览器控制台中运行此脚本

console.log('🔍 钱包连接测试开始...\n')

// 检查浏览器环境
console.log('🌐 环境检查:')
console.log('  typeof window:', typeof window)
console.log('  window.petra:', !!window.petra)
console.log('  window.aptos:', !!window.aptos)
console.log('')

// 测试钱包连接
async function testWalletConnection() {
    try {
        console.log('🔗 测试钱包连接...')

        if (typeof window === 'undefined') {
            console.log('❌ 非浏览器环境，无法测试钱包连接')
            return
        }

        let wallet = null
        let walletName = ''

        // 测试 Petra 钱包
        if (window.petra) {
            console.log('✅ 检测到 Petra 钱包')
            try {
                const account = await window.petra.account()
                if (account && account.address) {
                    console.log('✅ Petra 钱包已连接:', account.address)
                    wallet = window.petra
                    walletName = 'Petra'
                } else {
                    console.log('⚠️ Petra 钱包未连接，尝试连接...')
                    const response = await window.petra.connect()
                    console.log('✅ Petra 钱包连接成功:', response.address)
                    wallet = window.petra
                    walletName = 'Petra'
                }
            } catch (error) {
                console.log('❌ Petra 钱包连接失败:', error.message)
            }
        } else {
            console.log('❌ Petra 钱包未安装')
        }

        // 测试 Aptos 钱包
        if (!wallet && window.aptos) {
            console.log('✅ 检测到 Aptos 钱包')
            try {
                const account = await window.aptos.account()
                if (account && account.address) {
                    console.log('✅ Aptos 钱包已连接:', account.address)
                    wallet = window.aptos
                    walletName = 'Aptos'
                } else {
                    console.log('⚠️ Aptos 钱包未连接，尝试连接...')
                    const response = await window.aptos.connect()
                    console.log('✅ Aptos 钱包连接成功:', response.address)
                    wallet = window.aptos
                    walletName = 'Aptos'
                }
            } catch (error) {
                console.log('❌ Aptos 钱包连接失败:', error.message)
            }
        } else if (!wallet) {
            console.log('❌ Aptos 钱包未安装')
        }

        if (!wallet) {
            console.log('❌ 未找到可用的钱包')
            return
        }

        // 测试网络信息
        try {
            const network = await wallet.network()
            console.log(`🌐 当前网络: ${network}`)
        } catch (error) {
            console.log('⚠️ 无法获取网络信息:', error.message)
        }

        // 测试简单交易
        console.log('\n📤 测试简单交易...')
        try {
            const testPayload = {
                type: 'entry_function_payload',
                function: '0x1::coin::transfer',
                type_arguments: ['0x1::aptos_coin::AptosCoin'],
                arguments: [account.address, '1'] // 转账1 octa给自己
            }

            console.log('📦 测试交易载荷:', JSON.stringify(testPayload, null, 2))

            const transaction = await wallet.signAndSubmitTransaction(testPayload)
            console.log('✅ 测试交易提交成功:', transaction.hash)
        } catch (error) {
            console.log('❌ 测试交易失败:', error.message)
        }

    } catch (error) {
        console.log('❌ 钱包连接测试失败:', error.message)
    }
}

// 运行测试
testWalletConnection()

console.log('\n💡 测试完成，请查看上面的结果')
console.log('如果遇到问题，请检查:')
console.log('1. 钱包是否已安装并启用')
console.log('2. 钱包是否已连接到正确的网络')
console.log('3. 账户是否有足够的余额')
console.log('4. 浏览器控制台是否有其他错误信息') 