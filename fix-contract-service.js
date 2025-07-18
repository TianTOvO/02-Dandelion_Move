// 修复合约服务初始化
console.log('🔧 修复合约服务初始化...');

async function fixContractService() {
    try {
        // 检查web3Store状态
        console.log('🔍 检查web3Store状态:');
        console.log('  - web3Store存在:', !!window.web3Store);
        console.log('  - 已连接:', window.web3Store?.isConnected);
        console.log('  - 账户地址:', window.web3Store?.account);
        console.log('  - aptosContractService存在:', !!window.web3Store?.aptosContractService);

        if (!window.web3Store?.isConnected) {
            console.error('❌ 钱包未连接，请先连接钱包');
            return;
        }

        if (!window.web3Store?.aptosContractService) {
            console.log('🔄 合约服务未初始化，尝试重新初始化...');

            // 重新初始化合约服务
            const { AptosContractService } = await import('/src/utils/aptosContractService.js');
            const aptosContractService = new AptosContractService();

            // 设置账户
            aptosContractService.setAccount({
                address: window.web3Store.account,
                publicKey: window.web3Store.account // 临时使用地址作为公钥
            });

            // 初始化合约
            await aptosContractService.initializeContracts(window.web3Store.account);

            // 更新web3Store
            window.web3Store.aptosContractService = aptosContractService;

            console.log('✅ 合约服务初始化成功');
        }

        // 现在重新获取任务数据
        console.log('🔄 重新获取任务数据...');
        const tasks = await window.web3Store.aptosContractService.getAllTasks();
        console.log('📋 重新获取的任务数据:', tasks);

        // 更新dataStore
        if (window.dataStore) {
            window.dataStore.tasks = tasks;
            console.log('✅ 任务数据已更新');

            // 检查状态修复效果
            console.log('\n🔍 检查状态修复效果:');
            tasks.forEach((task, index) => {
                console.log(`📋 任务 ${index} (ID: ${task.id}):`);
                console.log('  - 标题:', task.title);
                console.log('  - 状态(数字):', task.status, typeof task.status);
                console.log('  - 状态(文本):', task.statusText);
                console.log('  - 创建者:', task.creator);

                // 检查竞标按钮显示条件
                const currentUser = window.web3Store.account;
                const isCreator = task.creator && task.creator.toLowerCase() === currentUser.toLowerCase();
                const isCorrectStatus = task.status === 1;

                console.log('  - 竞标条件:');
                console.log('    * 状态是竞标中:', isCorrectStatus);
                console.log('    * 是创建者:', isCreator);
                console.log('    * 可以参与:', !isCreator && isCorrectStatus);
            });

            // 刷新页面显示
            console.log('\n🔄 刷新页面显示...');
            window.location.reload();

        } else {
            console.error('❌ dataStore不存在');
        }

    } catch (error) {
        console.error('❌ 修复合约服务失败:', error);

        // 尝试备用方法
        console.log('🔄 尝试备用方法...');
        try {
            // 直接调用dataStore的方法
            if (window.dataStore && window.dataStore.loadTasksFromContract) {
                console.log('🔄 使用dataStore.loadTasksFromContract...');
                await window.dataStore.loadTasksFromContract();
                console.log('✅ 使用备用方法更新任务数据成功');

                // 检查更新后的数据
                console.log('📋 更新后的任务数据:', window.dataStore.tasks);

                // 刷新页面
                window.location.reload();
            } else {
                console.error('❌ 备用方法也不可用');
            }
        } catch (backupError) {
            console.error('❌ 备用方法也失败:', backupError);
        }
    }
}

// 运行修复
fixContractService(); 