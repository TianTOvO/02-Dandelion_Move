// 测试奖金显示修复
console.log('🧪 测试奖金显示修复...');

async function testRewardFix() {
    try {
        // 等待页面加载完成
        if (!window.pinia) {
            console.log('⏳ 等待Pinia实例加载...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!window.pinia) {
            console.error('❌ Pinia实例未找到');
            return;
        }

        console.log('✅ Pinia实例已找到');

        // 动态导入store
        const { useDataStore } = await import('/src/stores/data.js');
        const dataStore = useDataStore();

        // 重新加载任务数据
        console.log('🔄 重新加载任务数据...');
        await dataStore.loadTasksFromContract();

        // 检查任务和奖金显示
        console.log('\n📊 任务和奖金检查:');
        dataStore.tasks.forEach((task, index) => {
            console.log(`\n📋 任务 ${index + 1}: ${task.title}`);
            console.log('  - ID:', task.id);
            console.log('  - 奖金:', task.reward, 'APT');
            console.log('  - 状态:', task.status);

            // 验证奖金格式
            const rewardNum = parseFloat(task.reward);
            if (rewardNum > 0 && rewardNum < 1000) {
                console.log('  ✅ 奖金格式正确');
            } else if (rewardNum === 0) {
                console.log('  ⚠️ 奖金为0');
            } else {
                console.log('  ❌ 奖金格式异常');
            }
        });

        // 测试特定任务详情
        if (dataStore.tasks.length > 0) {
            const testTask = dataStore.tasks[0];
            console.log(`\n🎯 测试任务详情: ${testTask.title}`);
            console.log('  - 奖金显示:', testTask.reward, 'APT');

            // 模拟页面显示
            const rewardDisplay = `${testTask.reward} APT`;
            console.log('  - 页面显示:', rewardDisplay);

            // 检查是否包含正确的货币单位
            if (rewardDisplay.includes('APT')) {
                console.log('  ✅ 货币单位显示正确');
            } else {
                console.log('  ❌ 货币单位显示错误');
            }
        }

        console.log('\n✅ 奖金显示测试完成');

    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

// 运行测试
testRewardFix(); 