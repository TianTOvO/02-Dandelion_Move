// 测试状态修复效果
console.log('🔧 测试状态修复效果...');

// 刷新任务数据
async function testStatusFix() {
    try {
        console.log('🔄 刷新任务数据...');

        // 调用合约服务重新获取任务
        if (window.web3Store && window.web3Store.aptosContractService) {
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
        } else {
            console.error('❌ 合约服务未初始化');
        }
    } catch (error) {
        console.error('❌ 测试状态修复失败:', error);
    }
}

// 运行测试
testStatusFix(); 