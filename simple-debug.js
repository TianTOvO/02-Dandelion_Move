// 简单调试脚本 - 不依赖Pinia实例
console.log('🔍 简单调试页面状态...');

(async function () {
    try {
        // 检查页面状态
        console.log('📊 页面状态检查:');
        console.log('  - 当前URL:', window.location.href);
        console.log('  - 页面标题:', document.title);
        console.log('  - 页面状态:', document.readyState);

        // 检查Vue应用
        const app = document.querySelector('#app');
        console.log('  - Vue应用元素:', !!app);

        if (app) {
            console.log('  - Vue应用内容:', app.innerHTML.substring(0, 200) + '...');
        }

        // 检查是否有钱包连接
        const walletElements = document.querySelectorAll('[class*="wallet"], [class*="connect"]');
        console.log('  - 钱包相关元素数量:', walletElements.length);

        // 检查是否有任务相关元素
        const taskElements = document.querySelectorAll('[class*="task"], [class*="reward"]');
        console.log('  - 任务相关元素数量:', taskElements.length);

        // 尝试直接调用合约API
        console.log('\n🔄 尝试直接调用合约API...');

        // 使用默认的Aptos测试网节点
        const nodeUrl = 'https://fullnode.testnet.aptoslabs.com';
        const contractAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // 这里需要实际的合约地址

        try {
            const response = await fetch(`${nodeUrl}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function: `${contractAddress}::TaskFactory::view_get_all_tasks`,
                    type_arguments: [],
                    arguments: []
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ 合约API调用成功:', result);
            } else {
                console.log('❌ 合约API调用失败:', response.status, response.statusText);
            }
        } catch (error) {
            console.log('❌ 合约API调用异常:', error.message);
        }

        // 检查页面中的错误信息
        console.log('\n⚠️ 检查页面错误信息:');
        const errorElements = document.querySelectorAll('[class*="error"], [class*="fail"], [class*="load"]');
        errorElements.forEach((element, index) => {
            const text = element.textContent.trim();
            if (text) {
                console.log(`  - 错误 ${index + 1}: "${text}"`);
            }
        });

        // 检查控制台错误
        console.log('\n📋 控制台错误检查:');
        if (window.console && window.console.error) {
            console.log('  - 控制台错误函数可用');
        } else {
            console.log('  - 控制台错误函数不可用');
        }

        // 等待一段时间后重新检查
        console.log('\n⏳ 等待5秒后重新检查...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('🔄 重新检查Pinia实例...');
        console.log('  - window.pinia:', !!window.pinia);

        if (window.pinia) {
            console.log('✅ Pinia实例已找到，可以运行完整调试');
        } else {
            console.log('❌ Pinia实例仍未找到');
            console.log('💡 建议：');
            console.log('  1. 确保页面完全加载');
            console.log('  2. 确保钱包已连接');
            console.log('  3. 刷新页面后重试');
            console.log('  4. 检查浏览器控制台是否有JavaScript错误');
        }

    } catch (error) {
        console.error('❌ 调试失败:', error);
    }
})(); 