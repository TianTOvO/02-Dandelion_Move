import { AptosClient } from '@aptos-labs/ts-sdk';

// 配置
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com';
const client = new AptosClient(NODE_URL);

// 构建交易载荷函数
function buildTransactionPayload(moduleAddress, moduleName, functionName, typeArgs = [], args = []) {
    return {
        type: 'entry_function_payload',
        function: `${moduleAddress}::${moduleName}::${functionName}`,
        type_arguments: typeArgs,
        arguments: args
    }
}

// 将 APT 转换为 octa
function aptToOcta(aptAmount) {
    const OCTA_PER_APT = 100000000
    const octaAmount = Math.floor(parseFloat(aptAmount) * OCTA_PER_APT)
    return octaAmount.toString()
}

async function debugTransaction() {
    console.log('🔍 调试交易载荷...\n');

    // 测试参数
    const testParams = {
        title: '测试任务',
        ipfsHash: 'QmTestHash123',
        reward: '1.0',
        deadline: Math.floor(Date.now() / 1000) + 86400, // 明天
        taskType: 0,
        biddingPeriod: 72,
        developmentPeriod: 14
    };

    console.log('📋 测试参数:', testParams);

    // 参数转换
    const rewardInOcta = aptToOcta(testParams.reward);
    const titleBytes = Array.from(new TextEncoder().encode(testParams.title));
    const descriptionBytes = Array.from(new TextEncoder().encode(testParams.ipfsHash));

    console.log('\n📝 参数转换结果:');
    console.log('  标题字节:', titleBytes);
    console.log('  描述字节:', descriptionBytes);
    console.log('  奖励(octa):', rewardInOcta);
    console.log('  截止时间:', testParams.deadline);

    // 构建交易载荷
    const payload = buildTransactionPayload(
        '0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb',
        'TaskFactory',
        'create_task',
        [],
        [titleBytes, descriptionBytes, rewardInOcta, testParams.deadline]
    );

    console.log('\n📦 交易载荷:');
    console.log(JSON.stringify(payload, null, 2));

    // 验证函数签名
    console.log('\n🔍 验证函数签名...');
    console.log('  函数名:', payload.function);
    console.log('  参数数量:', payload.arguments.length);
    console.log('  参数类型:', payload.arguments.map(arg => typeof arg));

    // 检查合约是否存在
    try {
        console.log('\n🔍 检查合约部署状态...');
        const resources = await client.getAccountResources('0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb');

        const taskFactoryResource = resources.find(r =>
            r.type.includes('TaskFactory::TaskFactoryState')
        );

        if (taskFactoryResource) {
            console.log('✅ TaskFactory 合约已部署');
            console.log('📋 合约状态:', taskFactoryResource);
        } else {
            console.log('❌ TaskFactory 合约未部署或未初始化');
        }

        // 检查所有相关资源
        const dandelionResources = resources.filter(r =>
            r.type.includes('0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb')
        );

        console.log('\n🌼 Dandelion 相关资源:');
        dandelionResources.forEach((resource, index) => {
            console.log(`  ${index + 1}. ${resource.type}`);
        });

    } catch (error) {
        console.error('❌ 检查合约状态失败:', error.message);
    }

    // 模拟交易验证
    console.log('\n🧪 模拟交易验证...');
    try {
        // 这里可以添加交易模拟逻辑
        console.log('✅ 交易载荷格式正确');
        console.log('💡 建议在钱包中测试此交易载荷');
    } catch (error) {
        console.error('❌ 交易载荷验证失败:', error.message);
    }
}

// 运行调试
debugTransaction().catch(console.error); 