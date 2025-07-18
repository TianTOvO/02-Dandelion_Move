// 测试奖金显示修复
console.log('🔧 测试奖金显示修复...');

async function testRewardDisplay() {
    try {
        // 检查store状态
        if (!window.web3Store || !window.dataStore) {
            console.error('❌ Store未初始化，请先运行complete-fix.js');
            return;
        }

        console.log('🔍 检查当前状态:');
        console.log('  - 钱包已连接:', window.web3Store.isConnected);
        console.log('  - 账户地址:', window.web3Store.account);
        console.log('  - 合约服务存在:', !!window.web3Store.aptosContractService);
        console.log('  - 任务数量:', window.dataStore.tasks.length);

        // 重新加载任务数据
        console.log('\n🔄 重新加载任务数据...');
        await window.dataStore.loadTasksFromContract();

        // 检查任务奖金显示
        console.log('\n📊 任务奖金显示检查:');
        window.dataStore.tasks.forEach((task, index) => {
            console.log(`\n📋 任务 ${index + 1}: ${task.title} (ID: ${task.id})`);
            console.log('  - 原始budget字段:', task.budget);
            console.log('  - 原始reward字段:', task.reward);
            console.log('  - 显示奖金:', task.reward, 'APT');
            console.log('  - 奖金类型:', typeof task.reward);

            // 检查奖金是否合理
            const rewardNum = parseFloat(task.reward);
            if (rewardNum > 1000) {
                console.log('  ⚠️ 奖金数值异常，可能未正确转换');
            } else if (rewardNum > 0) {
                console.log('  ✅ 奖金数值正常');
            } else {
                console.log('  ⚠️ 奖金为0或无效');
            }
        });

        // 测试特定任务的奖金
        if (window.dataStore.tasks.length > 0) {
            const testTask = window.dataStore.tasks[0];
            console.log(`\n🎯 测试任务详情: ${testTask.title}`);

            // 检查合约原始数据
            if (window.web3Store.aptosContractService) {
                try {
                    const contractTask = await window.web3Store.aptosContractService.getTask(testTask.id);
                    console.log('  - 合约原始budget:', contractTask.budget);
                    console.log('  - 合约原始reward:', contractTask.reward);

                    // 手动转换验证
                    const manualConversion = (parseFloat(contractTask.budget || contractTask.reward) / 100000000).toFixed(8);
                    console.log('  - 手动转换结果:', manualConversion, 'APT');
                    console.log('  - 前端显示结果:', testTask.reward, 'APT');
                    console.log('  - 转换是否正确:', manualConversion === testTask.reward ? '✅' : '❌');

                } catch (error) {
                    console.error('  - 获取合约数据失败:', error);
                }
            }
        }

        // 检查统计信息
        console.log('\n📈 统计信息检查:');
        console.log('  - 总任务数:', window.dataStore.stats.totalTasks);
        console.log('  - 活跃任务数:', window.dataStore.stats.activeTasks);
        console.log('  - 已完成任务数:', window.dataStore.stats.completedTasks);
        console.log('  - 总奖金池:', window.dataStore.stats.totalRewards, 'APT');

        console.log('\n✅ 奖金显示测试完成');

        // 提供修复建议
        console.log('\n💡 修复建议:');
        console.log('1. 如果奖金显示异常，请刷新页面');
        console.log('2. 检查合约中的budget字段是否正确');
        console.log('3. 确认金额单位转换逻辑');

    } catch (error) {
        console.error('❌ 测试奖金显示失败:', error);
    }
}

// 运行测试
testRewardDisplay(); 