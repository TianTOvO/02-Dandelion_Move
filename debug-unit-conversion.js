// 详细调试单位转换问题
console.log('🔍 详细调试单位转换问题...');

async function debugUnitConversion() {
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
                    console.log('\n🎯 第一个任务的详细分析:');
                    console.log('  - ID:', firstTask.id);
                    console.log('  - 原始budget:', firstTask.budget);
                    console.log('  - 原始reward:', firstTask.reward);
                    console.log('  - budget类型:', typeof firstTask.budget);
                    console.log('  - reward类型:', typeof firstTask.reward);

                    // 分析aptosContractService的转换
                    console.log('\n🔧 aptosContractService转换分析:');
                    const aptosReward = web3Store.aptosContractService.convertOctaToApt(firstTask.budget);
                    console.log('  - convertOctaToApt结果:', aptosReward);
                    console.log('  - 转换后类型:', typeof aptosReward);

                    // 分析dataStore的转换
                    console.log('\n🔧 dataStore转换分析:');
                    const contractTask = {
                        budget: firstTask.budget,
                        reward: firstTask.reward,
                        title: firstTask.title,
                        description: firstTask.description,
                        creator: firstTask.creator,
                        deadline: firstTask.deadline,
                        status: firstTask.status,
                        participants: firstTask.participants || []
                    };

                    // 模拟dataStore的转换逻辑
                    let convertedReward = '0';
                    if (contractTask.budget) {
                        const rewardInOcta = parseFloat(contractTask.budget);
                        const rewardInAPT = rewardInOcta / 100000000;
                        convertedReward = rewardInAPT.toFixed(8);
                        console.log('  - dataStore转换结果:', convertedReward);
                        console.log('  - 转换后类型:', typeof convertedReward);
                    }

                    // 检查转换是否一致
                    console.log('\n📊 转换一致性检查:');
                    console.log('  - aptosContractService:', aptosReward);
                    console.log('  - dataStore:', convertedReward);
                    console.log('  - 是否一致:', aptosReward === convertedReward ? '✅' : '❌');

                    // 检查最终显示
                    console.log('\n🔄 重新加载前端数据...');
                    await dataStore.loadTasksFromContract();

                    console.log('\n📊 前端最终显示:');
                    dataStore.tasks.forEach((task, index) => {
                        console.log(`\n📋 任务 ${index + 1}: ${task.title}`);
                        console.log('  - 最终reward:', task.reward);
                        console.log('  - reward类型:', typeof task.reward);

                        const rewardNum = parseFloat(task.reward);
                        console.log('  - 数值:', rewardNum);

                        if (rewardNum > 1000) {
                            console.log('  ❌ 奖金数值异常 (>1000 APT)');
                        } else if (rewardNum > 0) {
                            console.log('  ✅ 奖金数值正常');
                        } else {
                            console.log('  ⚠️ 奖金为0或无效');
                        }
                    });

                    // 测试不同的转换方法
                    console.log('\n🧮 测试不同的转换方法:');
                    const rawBudget = firstTask.budget;
                    console.log('  - 原始budget:', rawBudget);

                    // 方法1: 直接除法
                    const method1 = parseFloat(rawBudget) / 100000000;
                    console.log('  方法1 (直接除法):', method1);

                    // 方法2: 字符串处理
                    const method2 = parseFloat(rawBudget.toString()) / 100000000;
                    console.log('  方法2 (字符串处理):', method2);

                    // 方法3: 检查是否已经是APT
                    const method3 = parseFloat(rawBudget);
                    console.log('  方法3 (直接使用):', method3);

                    // 方法4: 使用BigInt处理大数
                    const method4 = Number(BigInt(rawBudget)) / 100000000;
                    console.log('  方法4 (BigInt):', method4);

                    // 判断哪个方法最合理
                    console.log('\n📊 合理性分析:');
                    [method1, method2, method3, method4].forEach((method, index) => {
                        if (method > 0 && method < 1000) {
                            console.log(`  ✅ 方法${index + 1}合理 (${method} APT)`);
                        } else {
                            console.log(`  ❌ 方法${index + 1}不合理 (${method} APT)`);
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
debugUnitConversion(); 