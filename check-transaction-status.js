const { AptosClient } = require('@aptos-labs/ts-sdk');

// 配置
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com';
const client = new AptosClient(NODE_URL);

async function checkTransactionStatus(txHash) {
    try {
        console.log('🔍 检查交易状态...');
        console.log('📋 交易哈希:', txHash);
        console.log('🌐 网络:', NODE_URL);

        // 获取交易详情
        const transaction = await client.getTransactionByHash(txHash);

        console.log('\n📊 交易详情:');
        console.log('  状态:', transaction.success ? '✅ 成功' : '❌ 失败');
        console.log('  版本:', transaction.version);
        console.log('  时间戳:', new Date(parseInt(transaction.timestamp) / 1000).toLocaleString());
        console.log('  发送者:', transaction.sender);
        console.log('  序列号:', transaction.sequence_number);
        console.log('  最大Gas:', transaction.max_gas_amount);
        console.log('  Gas价格:', transaction.gas_unit_price);
        console.log('  实际Gas:', transaction.gas_used);

        if (transaction.success) {
            console.log('\n✅ 交易执行成功!');

            // 显示事件
            if (transaction.events && transaction.events.length > 0) {
                console.log('\n📋 交易事件:');
                transaction.events.forEach((event, index) => {
                    console.log(`  ${index + 1}. 类型: ${event.type}`);
                    console.log(`     数据:`, JSON.stringify(event.data, null, 2));
                });
            }
        } else {
            console.log('\n❌ 交易执行失败!');
            console.log('  错误信息:', transaction.vm_status);
        }

        return transaction;
    } catch (error) {
        console.error('❌ 检查交易状态失败:', error.message);

        if (error.message.includes('Transaction not found')) {
            console.log('💡 交易可能还在处理中，请稍后重试');
        } else if (error.message.includes('Invalid transaction hash')) {
            console.log('💡 交易哈希格式不正确');
        }

        throw error;
    }
}

async function checkAccountBalance(address) {
    try {
        console.log('\n💰 检查账户余额...');
        console.log('📋 账户地址:', address);

        const resources = await client.getAccountResources(address);
        const coinResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');

        if (coinResource) {
            const balance = parseInt(coinResource.data.coin.value) / 100000000; // 转换为APT
            console.log(`✅ 账户余额: ${balance} APT`);
            return balance;
        } else {
            console.log('⚠️ 未找到APT余额信息');
            return 0;
        }
    } catch (error) {
        console.error('❌ 检查账户余额失败:', error.message);
        return 0;
    }
}

async function checkAccountResources(address) {
    try {
        console.log('\n📦 检查账户资源...');
        console.log('📋 账户地址:', address);

        const resources = await client.getAccountResources(address);
        console.log(`📊 资源数量: ${resources.length}`);

        // 查找Dandelion相关资源
        const dandelionResources = resources.filter(r =>
            r.type.includes('0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb')
        );

        if (dandelionResources.length > 0) {
            console.log('\n🌼 Dandelion相关资源:');
            dandelionResources.forEach((resource, index) => {
                console.log(`  ${index + 1}. 类型: ${resource.type}`);
                console.log(`     数据:`, JSON.stringify(resource.data, null, 2));
            });
        } else {
            console.log('⚠️ 未找到Dandelion相关资源');
        }

        return resources;
    } catch (error) {
        console.error('❌ 检查账户资源失败:', error.message);
        return [];
    }
}

// 主函数
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('📖 使用方法:');
        console.log('  node check-transaction-status.js <交易哈希>');
        console.log('  node check-transaction-status.js <交易哈希> <账户地址>');
        console.log('\n💡 示例:');
        console.log('  node check-transaction-status.js 0x1234...');
        console.log('  node check-transaction-status.js 0x1234... 0xabcd...');
        return;
    }

    const txHash = args[0];
    const address = args[1];

    try {
        // 检查交易状态
        await checkTransactionStatus(txHash);

        // 如果提供了地址，检查账户信息
        if (address) {
            await checkAccountBalance(address);
            await checkAccountResources(address);
        }
    } catch (error) {
        console.error('❌ 操作失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    checkTransactionStatus,
    checkAccountBalance,
    checkAccountResources
}; 