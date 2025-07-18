// 详细错误诊断脚本
// 请在浏览器控制台中运行此脚本

console.log('🔍 详细错误诊断开始...\n')

// 收集系统信息
function collectSystemInfo() {
    console.log('📋 系统信息:')
    console.log('  浏览器:', navigator.userAgent)
    console.log('  平台:', navigator.platform)
    console.log('  语言:', navigator.language)
    console.log('  在线状态:', navigator.onLine)
    console.log('  时间:', new Date().toISOString())
    console.log('')
}

// 检查钱包状态
async function checkWalletStatus() {
    console.log('🔗 钱包状态检查:')

    if (typeof window === 'undefined') {
        console.log('❌ 非浏览器环境')
        return
    }

    // 检查 Petra 钱包
    if (window.petra) {
        console.log('✅ Petra 钱包已安装')
        console.log('  API 方法:', Object.keys(window.petra).filter(key => typeof window.petra[key] === 'function'))

        try {
            const account = await window.petra.account()
            console.log('  ✅ 账户信息:', account)

            const network = await window.petra.network()
            console.log('  ✅ 网络信息:', network)

            const isConnected = await window.petra.isConnected()
            console.log('  ✅ 连接状态:', isConnected)
        } catch (error) {
            console.log('  ❌ Petra 钱包检查失败:', error.message)
        }
    } else {
        console.log('❌ Petra 钱包未安装')
    }

    // 检查 Aptos 钱包
    if (window.aptos) {
        console.log('✅ Aptos 钱包已安装')
        console.log('  API 方法:', Object.keys(window.aptos).filter(key => typeof window.aptos[key] === 'function'))

        try {
            const account = await window.aptos.account()
            console.log('  ✅ 账户信息:', account)

            const network = await window.aptos.network()
            console.log('  ✅ 网络信息:', network)

            const isConnected = await window.aptos.isConnected()
            console.log('  ✅ 连接状态:', isConnected)
        } catch (error) {
            console.log('  ❌ Aptos 钱包检查失败:', error.message)
        }
    } else {
        console.log('❌ Aptos 钱包未安装')
    }

    console.log('')
}

// 测试网络连接
async function testNetworkConnection() {
    console.log('🌐 网络连接测试:')

    try {
        // 测试 Aptos 测试网连接
        const response = await fetch('https://fullnode.testnet.aptoslabs.com/v1')
        console.log('✅ Aptos 测试网连接正常')
    } catch (error) {
        console.log('❌ Aptos 测试网连接失败:', error.message)
    }

    try {
        // 测试 Aptos 主网连接
        const response = await fetch('https://fullnode.mainnet.aptoslabs.com/v1')
        console.log('✅ Aptos 主网连接正常')
    } catch (error) {
        console.log('❌ Aptos 主网连接失败:', error.message)
    }

    console.log('')
}

// 测试简单交易
async function testSimpleTransaction() {
    console.log('📤 简单交易测试:')

    let wallet = null
    let account = null

    // 获取可用的钱包
    if (window.petra) {
        try {
            account = await window.petra.account()
            if (account && account.address) {
                wallet = window.petra
                console.log('✅ 使用 Petra 钱包进行测试')
            }
        } catch (error) {
            console.log('❌ Petra 钱包获取账户失败:', error.message)
        }
    }

    if (!wallet && window.aptos) {
        try {
            account = await window.aptos.account()
            if (account && account.address) {
                wallet = window.aptos
                console.log('✅ 使用 Aptos 钱包进行测试')
            }
        } catch (error) {
            console.log('❌ Aptos 钱包获取账户失败:', error.message)
        }
    }

    if (!wallet || !account) {
        console.log('❌ 无法获取可用的钱包和账户')
        return
    }

    console.log('📋 测试账户:', account.address)

    try {
        // 构建一个简单的测试交易
        const testPayload = {
            type: 'entry_function_payload',
            function: '0x1::coin::transfer',
            type_arguments: ['0x1::aptos_coin::AptosCoin'],
            arguments: [account.address, '1'] // 转账1 octa给自己
        }

        console.log('📦 测试交易载荷:', JSON.stringify(testPayload, null, 2))

        // 尝试提交交易
        const transaction = await wallet.signAndSubmitTransaction(testPayload)
        console.log('✅ 测试交易成功:', transaction.hash)

    } catch (error) {
        console.log('❌ 测试交易失败:', error.message)
        console.log('🔍 错误详情:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        })
    }

    console.log('')
}

// 测试合约调用
async function testContractCall() {
    console.log('📋 合约调用测试:')

    let wallet = null
    let account = null

    // 获取可用的钱包
    if (window.petra) {
        try {
            account = await window.petra.account()
            if (account && account.address) {
                wallet = window.petra
            }
        } catch (error) {
            console.log('❌ Petra 钱包获取账户失败:', error.message)
        }
    }

    if (!wallet && window.aptos) {
        try {
            account = await window.aptos.account()
            if (account && account.address) {
                wallet = window.aptos
            }
        } catch (error) {
            console.log('❌ Aptos 钱包获取账户失败:', error.message)
        }
    }

    if (!wallet || !account) {
        console.log('❌ 无法获取可用的钱包和账户')
        return
    }

    try {
        // 测试 TaskFactory::init 调用
        const contractPayload = {
            type: 'entry_function_payload',
            function: '0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb::TaskFactory::init',
            type_arguments: [],
            arguments: []
        }

        console.log('📦 合约调用载荷:', JSON.stringify(contractPayload, null, 2))

        // 尝试提交交易
        const transaction = await wallet.signAndSubmitTransaction(contractPayload)
        console.log('✅ 合约调用成功:', transaction.hash)

    } catch (error) {
        console.log('❌ 合约调用失败:', error.message)
        console.log('🔍 错误详情:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        })
    }

    console.log('')
}

// 生成诊断报告
function generateDiagnosticReport() {
    console.log('📊 诊断报告:')
    console.log('请将以下信息提供给技术支持:')
    console.log('1. 浏览器控制台的所有日志')
    console.log('2. 钱包类型和版本')
    console.log('3. 网络设置')
    console.log('4. 账户地址（如果已连接）')
    console.log('5. 具体的错误信息')
    console.log('')
}

// 运行完整诊断
async function runFullDiagnosis() {
    try {
        collectSystemInfo()
        await checkWalletStatus()
        await testNetworkConnection()
        await testSimpleTransaction()
        await testContractCall()
        generateDiagnosticReport()

        console.log('✅ 诊断完成')
    } catch (error) {
        console.log('❌ 诊断过程中发生错误:', error.message)
    }
}

// 运行诊断
runFullDiagnosis() 