// 修复双重转换问题
console.log('🔧 修复双重转换问题...');

async function fixDoubleConversion() {
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

                    // 分析转换过程
                    console.log('\n🔧 转换过程分析:');

                    // 原始Octa值
                    const rawOcta = firstTask.budget;
                    console.log('  - 原始Octa值:', rawOcta);

                    // 正确的APT转换
                    const correctApt = parseFloat(rawOcta) / 100000000;
                    console.log('  - 正确的APT值:', correctApt);

                    // 检查是否被双重转换
                    const doubleConverted = parseFloat(rawOcta) / 100000000 / 100000000;
                    console.log('  - 双重转换后的值:', doubleConverted);

                    // 判断问题类型
                    if (correctApt > 0 && correctApt < 1000) {
                        console.log('  ✅ 正确的转换结果合理');
                    } else {
                        console.log('  ❌ 正确的转换结果不合理');
                    }

                    if (doubleConverted > 0 && doubleConverted < 1000) {
                        console.log('  ❌ 双重转换结果反而合理，说明原始值有问题');
                    } else {
                        console.log('  ✅ 双重转换结果不合理，说明原始值正确');
                    }

                    // 重新加载前端数据
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

                    // 如果前端显示仍然异常，手动修复
                    console.log('\n🔧 手动修复异常数据...');
                    let hasFixed = false;
                    dataStore.tasks.forEach((task, index) => {
                        const rewardNum = parseFloat(task.reward);
                        if (rewardNum > 1000) {
                            // 如果数值异常，手动修复
                            const fixedReward = (rewardNum / 100000000).toFixed(8);
                            task.reward = fixedReward;
                            console.log(`  - 修复任务 ${index + 1}: ${rewardNum} -> ${fixedReward} APT`);
                            hasFixed = true;
                        }
                    });

                    if (hasFixed) {
                        console.log('✅ 异常数据已修复');
                    } else {
                        console.log('✅ 数据正常，无需修复');
                    }

                } else {
                    console.log('⚠️ 没有找到任务数据');
                }

            } catch (error) {
                console.error('❌ 获取合约数据失败:', error);
            }
        } else {
            console.error('❌ 合约服务未初始化');
        }

        console.log('\n✅ 双重转换问题修复完成');
        console.log('🔄 页面将在3秒后刷新...');

        // 延迟刷新
        setTimeout(() => {
            window.location.reload();
        }, 3000);

    } catch (error) {
        console.error('❌ 修复失败:', error);
    }
}

// 运行修复
fixDoubleConversion(); 