// 直接修复奖金显示问题
console.log('🔧 直接修复奖金显示问题...');

(async function () {
    try {
        // 等待Vue应用加载
        console.log('⏳ 等待Vue应用加载...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 检查Vue应用
        const app = document.querySelector('#app');
        if (!app || !app.__vue_app__) {
            console.error('❌ Vue应用未找到');
            return;
        }

        console.log('✅ Vue应用已找到');

        // 尝试获取Pinia实例
        let pinia = null;
        if (window.pinia) {
            pinia = window.pinia;
            console.log('✅ 找到全局Pinia实例');
        } else if (app.__vue_app__ && app.__vue_app__.config && app.__vue_app__.config.globalProperties) {
            // 尝试从Vue应用配置中获取
            console.log('🔍 尝试从Vue应用配置中获取Pinia...');
        }

        if (!pinia) {
            console.log('⚠️ 无法获取Pinia实例，尝试直接修复页面显示...');

            // 直接修复页面中的奖金显示
            const rewardElements = document.querySelectorAll('[class*="reward"], [class*="budget"]');
            console.log(`🔍 找到 ${rewardElements.length} 个奖金相关元素`);

            rewardElements.forEach((element, index) => {
                const text = element.textContent;
                console.log(`  - 元素 ${index + 1}: "${text}"`);

                // 检查是否包含异常大的数值
                const match = text.match(/(\d+(?:\.\d+)?)\s*(APT|AVAX)/);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = match[2];

                    if (value > 1000) {
                        console.log(`    ❌ 发现异常数值: ${value} ${unit}`);

                        // 修复数值
                        const fixedValue = (value / 100000000).toFixed(8);
                        const newText = text.replace(match[0], `${fixedValue} APT`);
                        element.textContent = newText;

                        console.log(`    ✅ 修复为: ${fixedValue} APT`);
                    } else {
                        console.log(`    ✅ 数值正常: ${value} ${unit}`);
                    }
                }
            });

            console.log('✅ 页面显示修复完成');
            return;
        }

        // 如果有Pinia实例，使用正常流程
        console.log('🔄 使用Pinia实例修复...');

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

                    // 分析转换过程
                    console.log('\n🔧 转换过程分析:');

                    // 原始Octa值
                    const rawOcta = firstTask.budget;
                    console.log('  - 原始Octa值:', rawOcta);

                    // 正确的APT转换
                    const correctApt = parseFloat(rawOcta) / 100000000;
                    console.log('  - 正确的APT值:', correctApt);

                    // 重新加载前端数据
                    console.log('\n🔄 重新加载前端数据...');
                    await dataStore.loadTasksFromContract();

                    console.log('\n📊 前端最终显示:');
                    dataStore.tasks.forEach((task, index) => {
                        console.log(`\n📋 任务 ${index + 1}: ${task.title}`);
                        console.log('  - 最终reward:', task.reward);

                        const rewardNum = parseFloat(task.reward);
                        console.log('  - 数值:', rewardNum);

                        if (rewardNum > 1000) {
                            console.log('  ❌ 奖金数值异常 (>1000 APT)');
                            // 手动修复
                            const fixedReward = (rewardNum / 100000000).toFixed(8);
                            task.reward = fixedReward;
                            console.log(`  ✅ 修复为: ${fixedReward} APT`);
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

        console.log('\n✅ 奖金显示问题修复完成');

    } catch (error) {
        console.error('❌ 修复失败:', error);
    }
})(); 