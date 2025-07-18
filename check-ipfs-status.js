const fetch = require('node-fetch');

async function checkIPFSStatus() {
    console.log('🔍 检查IPFS节点状态...\n');

    try {
        // 检查IPFS API版本
        console.log('📡 检查IPFS API连接...');
        const response = await fetch('http://127.0.0.1:5001/api/v0/version', {
            method: 'POST',
            timeout: 5000
        });

        if (response.ok) {
            const version = await response.json();
            console.log('✅ IPFS节点运行正常');
            console.log(`📋 版本: ${version.Version}`);
            console.log(`🔧 提交: ${version.Commit}`);
            console.log(`🌐 API地址: http://127.0.0.1:5001`);
            console.log(`🌍 Web界面: http://127.0.0.1:8080`);
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 检查节点ID
        console.log('\n🆔 获取节点信息...');
        const idResponse = await fetch('http://127.0.0.1:5001/api/v0/id', {
            method: 'POST',
            timeout: 5000
        });

        if (idResponse.ok) {
            const nodeInfo = await idResponse.json();
            console.log('✅ 节点信息获取成功');
            console.log(`🆔 节点ID: ${nodeInfo.ID}`);
            console.log(`🌐 地址: ${nodeInfo.Addresses.join(', ')}`);
        }

        // 检查存储库状态
        console.log('\n💾 检查存储库状态...');
        const repoResponse = await fetch('http://127.0.0.1:5001/api/v0/repo/stat', {
            method: 'POST',
            timeout: 5000
        });

        if (repoResponse.ok) {
            const repoStats = await repoResponse.json();
            console.log('✅ 存储库状态正常');
            console.log(`📦 存储库大小: ${formatBytes(repoStats.RepoSize)}`);
            console.log(`🗂️ 对象数量: ${repoStats.NumObjects}`);
            console.log(`📈 版本: ${repoStats.Version}`);
        }

        console.log('\n🎉 IPFS节点完全正常！');
        console.log('💡 现在可以启动Dandelion前端应用了');

    } catch (error) {
        console.log('❌ IPFS节点连接失败');
        console.log(`🔍 错误详情: ${error.message}`);
        console.log('\n💡 解决方案:');
        console.log('1. 确保IPFS Desktop已启动');
        console.log('2. 或者运行 start-ipfs.bat 启动IPFS');
        console.log('3. 检查端口5001是否被占用');
        console.log('4. Dandelion会自动启用模拟模式，功能不受影响');
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 运行检查
checkIPFSStatus().catch(console.error); 