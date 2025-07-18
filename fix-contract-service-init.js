// 修复合约服务初始化问题
console.log('🔧 修复合约服务初始化问题...');

// 检查web3Store状态
function checkWeb3StoreStatus() {
    console.log('\n📊 检查web3Store状态:');

    // 检查钱包连接状态
    console.log('钱包连接状态:', window.web3Store?.isConnected);
    console.log('账户地址:', window.web3Store?.account);
    console.log('Aptos合约服务:', !!window.web3Store?.aptosContractService);

    if (window.web3Store?.aptosContractService) {
        console.log('合约服务已连接:', window.web3Store.aptosContractService.connected);
        console.log('合约服务账户:', window.web3Store.aptosContractService.account);
    }
}

// 强制重新初始化合约服务
async function forceReinitializeContractService() {
    try {
        console.log('\n🔄 强制重新初始化合约服务...');

        if (!window.web3Store) {
            console.error('❌ web3Store未找到');
            return false;
        }

        if (!window.web3Store.account) {
            console.error('❌ 钱包未连接');
            return false;
        }

        // 清理现有合约服务
        if (window.web3Store.aptosContractService) {
            window.web3Store.aptosContractService = null;
            console.log('✅ 清理现有合约服务');
        }

        // 重新初始化合约服务
        const { AptosContractService } = await import('./src/utils/aptosContractService.js');
        window.web3Store.aptosContractService = new AptosContractService();
        window.web3Store.aptosContractService.setAccount({
            address: window.web3Store.account
        });

        console.log('✅ 合约服务重新初始化成功');
        console.log('合约地址:', window.web3Store.aptosContractService.contractAddress);
        console.log('服务连接状态:', window.web3Store.aptosContractService.connected);

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

        if (!window.web3Store?.aptosContractService) {
            console.error('❌ 合约服务未初始化');
            return false;
        }

        // 测试获取所有任务
        console.log('测试获取所有任务...');
        const tasks = await window.web3Store.aptosContractService.getAllTasks();
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
    console.log('🚀 开始修复合约服务初始化问题...');

    // 1. 检查当前状态
    checkWeb3StoreStatus();

    // 2. 强制重新初始化
    const initSuccess = await forceReinitializeContractService();

    if (initSuccess) {
        // 3. 测试合约服务
        const testSuccess = await testContractService();

        if (testSuccess) {
            console.log('\n🎉 修复成功！合约服务已正常工作');
        } else {
            console.log('\n⚠️ 合约服务初始化成功，但功能测试失败');
        }
    } else {
        console.log('\n❌ 修复失败，请检查钱包连接状态');
    }

    // 4. 最终状态检查
    console.log('\n📊 最终状态检查:');
    checkWeb3StoreStatus();
}

// 执行修复
main(); 