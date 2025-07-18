// 详细调试奖金转换问题
console.log('🔍 详细调试奖金转换问题...');

async function debugRewardConversion() {
    try {
        // 等待页面加载完成
        if (!window.pinia) {
            console.log('⏳ 等待Pinia实例加载...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        if (!window.pinia) {
            console.error('❌ Pinia实例未找到');
            return;
        }

        console.log('✅ Pinia实例已找到');

        // 动态导入store
        const { useDataStore } = await import('/src/stores/data.js');
        const { useWeb3Store } = await import('/src/stores/web3.js');

        const dataStore = useDataStore();
        const web3Store = useWeb3Store();

        console.log('🔄 获取合约原始数据...');

        // 直接从合约获取原始数据
        if (web3Store.aptosContractService) {
            try {
                const allTasks = await web3Store.aptosContractService.getAllTasks();
                console.log('📊 合约原始任务数据:', allTasks);

                if (allTasks && allTasks.length > 0) {
                    const firstTask = allTasks[0];
                    console.log('\n🎯 第一个任务的原始数据:');
                    console.log('  - ID:', firstTask.id);
                    console.log('  - 原始reward:', firstTask.reward);
                    console.log('  - 原始budget:', firstTask.budget);
                    console.log('  - reward类型:', typeof firstTask.reward);
                    console.log('  - budget类型:', typeof firstTask.budget);

                    // 测试不同的转换方法
                    console.log('\n🧮 测试不同的转换方法:');

                    // 方法1: 直接除以100000000
                    const method1 = parseFloat(firstTask.reward || firstTask.budget || 0) / 100000000;
                    console.log('  方法1 (直接除法):', method1, 'APT');

                    // 方法2: 使用字符串处理
                    const rawValue = (firstTask.reward || firstTask.budget || 0).toString();
                    const method2 = parseFloat(rawValue) / 100000000;
                    console.log('  方法2 (字符串处理):', method2, 'APT');

                    // 方法3: 检查是否已经是APT单位
                    const method3 = parseFloat(firstTask.reward || firstTask.budget || 0);
                    console.log('  方法3 (直接使用):', method3, 'APT');

                    // 判断哪个方法更合理
                    console.log('\n📊 合理性分析:');
                    if (method1 > 0 && method1 < 1000) {
                        console.log('  ✅ 方法1合理 (0-1000 APT范围)');
                    } else {
                        console.log('  ❌ 方法1不合理');
                    }

                    if (method2 > 0 && method2 < 1000) {
                        console.log('  ✅ 方法2合理 (0-1000 APT范围)');
                    } else {
                        console.log('  ❌ 方法2不合理');
                    }

                    if (method3 > 0 && method3 < 1000) {
                        console.log('  ✅ 方法3合理 (0-1000 APT范围)');
                    } else {
                        console.log('  ❌ 方法3不合理');
                    }

                    // 检查当前前端显示的数据
                    console.log('\n🔄 重新加载前端数据...');
                    await dataStore.loadTasksFromContract();

                    console.log('\n📊 前端处理后的数据:');
                    dataStore.tasks.forEach((task, index) => {
                        console.log(`\n📋 任务 ${index + 1}: ${task.title}`);
                        console.log('  - 前端reward:', task.reward);
                        console.log('  - reward类型:', typeof task.reward);

                        const rewardNum = parseFloat(task.reward);
                        if (rewardNum > 1000) {
                            console.log('  ❌ 奖金数值异常 (>1000 APT)');
                        } else if (rewardNum > 0) {
                            console.log('  ✅ 奖金数值正常');
                        } else {
                            console.log('  ⚠️ 奖金为0或无效');
                        }
                    });

                } else {
                    console.log('⚠️ 没有找到任务数据');
                }

            } catch (error) {
                console.error('❌ 获取合约数据失败:', error);
            }
        } else {
            console.error('❌ 合约服务未初始化');
        }

    } catch (error) {
        console.error('❌ 调试失败:', error);
    }
}

// 运行调试
debugRewardConversion(); 