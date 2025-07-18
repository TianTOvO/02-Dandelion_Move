// 快速修复奖金显示问题
console.log('🔧 快速修复奖金显示问题...');

async function quickFixReward() {
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

        // 检查修复效果
        console.log('\n📊 修复效果检查:');
        dataStore.tasks.forEach((task, index) => {
            console.log(`\n📋 任务 ${index + 1}: ${task.title}`);
            console.log('  - 奖金:', task.reward, 'APT');

            const rewardNum = parseFloat(task.reward);
            if (rewardNum > 0 && rewardNum < 1000) {
                console.log('  ✅ 奖金显示正常');
            } else if (rewardNum === 0) {
                console.log('  ⚠️ 奖金为0');
            } else {
                console.log('  ❌ 奖金显示异常');
            }
        });

        console.log('\n✅ 奖金显示修复完成');
        console.log('🔄 页面将在3秒后刷新...');

        // 延迟刷新
        setTimeout(() => {
            window.location.reload();
        }, 3000);

    } catch (error) {
        console.error('❌ 修复失败:', error);
    }
}

// 运行快速修复
quickFixReward(); 