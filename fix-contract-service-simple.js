// 简单修复合约服务初始化问题
console.log('🔧 简单修复合约服务初始化问题...');

// 获取Vue应用实例和store
function getVueApp() {
    // 尝试多种方式获取Vue应用
    const app = window.__VUE_APP__ ||
        document.querySelector('#app').__vue_app__ ||
        document.querySelector('#app').__vueParentComponent?.ctx?.app ||
        window.app;

    if (app) {
        console.log('✅ 找到Vue应用实例');
        return app;
    }

    console.log('❌ 未找到Vue应用实例，尝试其他方法...');
    return null;
}

// 获取web3Store
function getWeb3Store() {
    const app = getVueApp();
    if (app) {
        try {
            // 尝试通过Pinia获取store
            const { useWeb3Store } = app._context.provides.pinia._s.get('web3');
            if (useWeb3Store) {
                console.log('✅ 通过Pinia获取到web3Store');
                return useWeb3Store();
            }
        } catch (error) {
            console.log('通过Pinia获取失败:', error.message);
        }
    }

    // 尝试直接从全局获取
    if (window.web3Store) {
        console.log('✅ 从全局获取到web3Store');
        return window.web3Store;
    }

    console.log('❌ 无法获取web3Store');
    return null;
}

// 检查当前状态
function checkStatus() {
    console.log('\n📊 检查当前状态:');

    const store = getWeb3Store();
    if (store) {
        console.log('钱包连接状态:', store.isConnected);
        console.log('账户地址:', store.account);
        console.log('Aptos合约服务:', !!store.aptosContractService);

        if (store.aptosContractService) {
            console.log('合约服务已连接:', store.aptosContractService.connected);
            console.log('合约服务账户:', store.aptosContractService.account);
        }
    } else {
        console.log('❌ 无法获取store');
    }
}

// 强制重新初始化合约服务
async function forceReinitialize() {
    try {
        console.log('\n🔄 强制重新初始化合约服务...');

        const store = getWeb3Store();
        if (!store) {
            console.error('❌ 无法获取web3Store');
            return false;
        }

        if (!store.account) {
            console.error('❌ 钱包未连接，请先连接钱包');
            return false;
        }

        // 清理现有合约服务
        if (store.aptosContractService) {
            store.aptosContractService = null;
            console.log('✅ 清理现有合约服务');
        }

        // 重新初始化合约服务
        console.log('正在导入AptosContractService...');
        const { default: AptosContractService } = await import('./src/utils/aptosContractService.js');

        store.aptosContractService = new AptosContractService();
        store.aptosContractService.setAccount({
            address: store.account
        });

        console.log('✅ 合约服务重新初始化成功');
        console.log('合约地址:', store.aptosContractService.contractAddress);
        console.log('服务连接状态:', store.aptosContractService.connected);

        return true;
    } catch (error) {
        console.error('❌ 重新初始化失败:', error);
        return false;
    }
}

// 测试合约服务功能
async function testContractService() {
    try {
        console.log('\n🧪 测试合约服务功能...');

        const store = getWeb3Store();
        if (!store?.aptosContractService) {
            console.error('❌ 合约服务未初始化');
            return false;
        }

        // 测试获取所有任务
        console.log('测试获取所有任务...');
        const tasks = await store.aptosContractService.getAllTasks();
        console.log('✅ 获取任务成功，任务数量:', tasks.length);

        if (tasks.length > 0) {
            console.log('第一个任务:', tasks[0]);
        }

        return true;
    } catch (error) {
        console.error('❌ 合约服务测试失败:', error);
        return false;
    }
}

// 主修复流程
async function main() {
    console.log('🚀 开始简单修复合约服务初始化问题...');

    // 1. 检查当前状态
    checkStatus();

    // 2. 强制重新初始化
    const initSuccess = await forceReinitialize();

    if (initSuccess) {
        // 3. 测试合约服务
        const testSuccess = await testContractService();

        if (testSuccess) {
            console.log('\n🎉 修复成功！合约服务已正常工作');
            console.log('现在可以刷新个人中心页面测试任务显示功能');
        } else {
            console.log('\n⚠️ 合约服务初始化成功，但功能测试失败');
        }
    } else {
        console.log('\n❌ 修复失败，请确保：');
        console.log('1. 钱包已连接');
        console.log('2. 页面已完全加载');
        console.log('3. 重新刷新页面后重试');
    }

    // 4. 最终状态检查
    console.log('\n📊 最终状态检查:');
    checkStatus();
}

// 执行修复
main(); 