// 检查特定交易的详情
import { AptosClient } from 'aptos'

const TESTNET_URL = 'https://fullnode.testnet.aptoslabs.com/v1'
const TRANSACTION_HASH = '0x955bbe700f42cfcf8e87160c1aaa056ff51a8f7fcf900a8ebe86cb8b96add403'

async function checkTransaction() {
    const client = new AptosClient(TESTNET_URL)

    try {
        console.log('🔍 检查交易详情...')
        console.log('📋 交易哈希:', TRANSACTION_HASH)

        // 获取交易详情
        const transaction = await client.getTransactionByHash(TRANSACTION_HASH)

        console.log('✅ 交易信息:')
        console.log('  - 成功:', transaction.success)
        console.log('  - VM状态:', transaction.vm_status)
        console.log('  - Gas使用:', transaction.gas_used)
        console.log('  - 发送者:', transaction.sender)
        console.log('  - 类型:', transaction.type)

        if (transaction.payload) {
            console.log('📦 交易载荷:')
            console.log('  - 类型:', transaction.payload.type)
            if (transaction.payload.type === 'entry_function_payload') {
                console.log('  - 函数:', transaction.payload.function)
                console.log('  - 参数:', transaction.payload.arguments)
            }
        }

        if (transaction.events && transaction.events.length > 0) {
            console.log('📋 事件:')
            transaction.events.forEach((event, index) => {
                console.log(`  ${index + 1}. 类型: ${event.type}`)
                console.log(`     数据: ${JSON.stringify(event.data)}`)
            })
        }

        // 检查是否部署了合约
        if (transaction.payload && transaction.payload.type === 'entry_function_payload') {
            const functionName = transaction.payload.function
            if (functionName.includes('code::publish_package')) {
                console.log('\n🎉 这是一个合约部署交易!')
                console.log('💡 合约应该已经部署，可能需要等待几秒钟让区块链同步')
            }
        }

    } catch (error) {
        console.error('❌ 检查失败:', error.message)
    }
}

checkTransaction() 