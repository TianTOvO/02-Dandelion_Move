#!/usr/bin/env node

/**
 * 合约部署状态检查脚本
 * 使用方法: node check-deployment.js
 */

const https = require('https');

// 配置
const CONFIG = {
    accountAddress: '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9',
    network: 'testnet',
    restUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
    expectedModules: [
        'TaskFactory',
        'BiddingSystem',
        'Escrow',
        'DisputeDAO',
        'TaskStorage'
    ],
    expectedResources: [
        'TaskFactoryState',
        'BiddingSystemState',
        'EscrowState',
        'DisputeDAOState',
        'TaskStorageState'
    ]
};

// 工具函数
function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const url = `${CONFIG.restUrl}${path}`;
        console.log(`🔍 请求: ${url}`);

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (error) {
                    reject(new Error(`JSON解析失败: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`请求失败: ${error.message}`));
        });
    });
}

// 检查账户信息
async function checkAccount() {
    try {
        console.log('📋 检查账户信息...');
        const account = await makeRequest(`/accounts/${CONFIG.accountAddress}`);

        console.log(`✅ 账户存在`);
        console.log(`   地址: ${account.address}`);
        console.log(`   序列号: ${account.sequence_number}`);
        console.log(`   认证密钥: ${account.authentication_key}`);

        return account;
    } catch (error) {
        console.error(`❌ 账户检查失败: ${error.message}`);
        return null;
    }
}

// 检查模块
async function checkModules() {
    try {
        console.log('\n📦 检查部署的模块...');
        const modules = await makeRequest(`/accounts/${CONFIG.accountAddress}/modules`);

        const moduleNames = modules.map(m => m.name);
        console.log(`✅ 找到 ${modules.length} 个模块:`);
        moduleNames.forEach(name => console.log(`   - ${name}`));

        // 检查是否包含所有预期模块
        const missingModules = CONFIG.expectedModules.filter(name =>
            !moduleNames.includes(name)
        );

        if (missingModules.length > 0) {
            console.log(`⚠️  缺少模块: ${missingModules.join(', ')}`);
        } else {
            console.log(`✅ 所有预期模块都已部署`);
        }

        return modules;
    } catch (error) {
        console.error(`❌ 模块检查失败: ${error.message}`);
        return [];
    }
}

// 检查资源
async function checkResources() {
    try {
        console.log('\n💾 检查账户资源...');
        const resources = await makeRequest(`/accounts/${CONFIG.accountAddress}/resources`);

        const resourceTypes = resources.map(r => {
            const parts = r.type.split('::');
            return parts[parts.length - 1]; // 获取资源名称
        });

        console.log(`✅ 找到 ${resources.length} 个资源:`);
        resourceTypes.forEach(type => console.log(`   - ${type}`));

        // 检查是否包含所有预期资源
        const missingResources = CONFIG.expectedResources.filter(name =>
            !resourceTypes.includes(name)
        );

        if (missingResources.length > 0) {
            console.log(`⚠️  缺少资源: ${missingResources.join(', ')}`);
        } else {
            console.log(`✅ 所有预期资源都已初始化`);
        }

        return resources;
    } catch (error) {
        console.error(`❌ 资源检查失败: ${error.message}`);
        return [];
    }
}

// 测试合约功能
async function testContractFunctions() {
    try {
        console.log('\n🧪 测试合约功能...');

        // 测试查看所有任务
        console.log('   测试 view_get_all_tasks...');
        const viewPayload = {
            function: `${CONFIG.accountAddress}::TaskFactory::view_get_all_tasks`,
            type_arguments: [],
            arguments: []
        };

        const viewResponse = await makeRequest('/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(viewPayload)
        });

        console.log(`✅ view_get_all_tasks 调用成功`);
        console.log(`   返回数据: ${JSON.stringify(viewResponse)}`);

    } catch (error) {
        console.error(`❌ 功能测试失败: ${error.message}`);
    }
}

// 主函数
async function main() {
    console.log('🚀 Dandelion 合约部署状态检查');
    console.log('='.repeat(50));
    console.log(`📋 检查配置:`);
    console.log(`   账户地址: ${CONFIG.accountAddress}`);
    console.log(`   网络: ${CONFIG.network}`);
    console.log(`   REST URL: ${CONFIG.restUrl}`);
    console.log('='.repeat(50));

    // 检查网络连接
    try {
        console.log('🌐 检查网络连接...');
        await makeRequest('/');
        console.log('✅ 网络连接正常');
    } catch (error) {
        console.error(`❌ 网络连接失败: ${error.message}`);
        return;
    }

    // 执行检查
    const account = await checkAccount();
    if (!account) return;

    const modules = await checkModules();
    const resources = await checkResources();

    // 总结
    console.log('\n📊 检查总结:');
    console.log('='.repeat(50));

    const moduleStatus = modules.length >= CONFIG.expectedModules.length ? '✅' : '❌';
    const resourceStatus = resources.length >= CONFIG.expectedResources.length ? '✅' : '❌';

    console.log(`${moduleStatus} 模块部署: ${modules.length}/${CONFIG.expectedModules.length}`);
    console.log(`${resourceStatus} 资源初始化: ${resources.length}/${CONFIG.expectedResources.length}`);

    if (modules.length >= CONFIG.expectedModules.length &&
        resources.length >= CONFIG.expectedResources.length) {
        console.log('\n🎉 合约部署状态良好！');
        console.log('💡 前端可以正常使用合约功能');
    } else {
        console.log('\n⚠️  合约部署不完整');
        console.log('💡 请重新运行部署脚本');
    }

    console.log('\n🔗 查看合约:');
    console.log(`   https://explorer.aptoslabs.com/account/${CONFIG.accountAddress}?network=${CONFIG.network}`);
}

// 运行检查
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { checkAccount, checkModules, checkResources }; 