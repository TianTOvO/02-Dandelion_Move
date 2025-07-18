// 修复任务详情页面
console.log('🔧 修复任务详情页面...');

(async function () {
    try {
        // 等待Pinia实例加载
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
        const { useWeb3Store } = await import('/src/stores/web3.js');

        const dataStore = useDataStore();
        const web3Store = useWeb3Store();

        console.log('📊 当前状态检查:');
        console.log('  - 钱包连接状态:', web3Store.isConnected);
        console.log('  - 账户地址:', web3Store.account);
        console.log('  - 任务数量:', dataStore.tasks.length);

        // 检查当前URL
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/');
        const taskId = urlParts[urlParts.length - 1];
        console.log('  - 当前任务ID:', taskId);

        if (taskId === 'unknown' && dataStore.tasks.length > 0) {
            console.log('🔄 修复任务ID为unknown的问题...');

            // 获取第一个有效任务
            const firstTask = dataStore.tasks[0];
            console.log('  - 第一个任务:', firstTask);

            if (firstTask && firstTask.id !== undefined) {
                console.log(`✅ 找到有效任务ID: ${firstTask.id}`);
                const newUrl = currentUrl.replace('/unknown', `/${firstTask.id}`);
                console.log(`🔄 重定向到: ${newUrl}`);
                window.location.href = newUrl;
                return;
            }
        }

        // 如果当前在任务详情页面但任务ID无效，重定向到任务大厅
        if (currentUrl.includes('/task/') && (taskId === 'unknown' || !taskId)) {
            console.log('🔄 重定向到任务大厅...');
            window.location.href = '/tasks';
            return;
        }

        // 如果当前在任务大厅，检查任务列表
        if (currentUrl.includes('/tasks')) {
            console.log('📋 检查任务大厅状态...');

            if (dataStore.tasks.length === 0) {
                console.log('🔄 重新加载任务数据...');
                await dataStore.loadTasksFromContract();
                console.log('  - 重新加载后任务数量:', dataStore.tasks.length);
            }

            // 显示任务列表
            console.log('\n📋 当前任务列表:');
            dataStore.tasks.forEach((task, index) => {
                console.log(`  ${index + 1}. ID: ${task.id}, 标题: ${task.title}, 状态: ${task.status}`);
            });

            // 如果有任务，提供点击链接
            if (dataStore.tasks.length > 0) {
                const firstTask = dataStore.tasks[0];
                console.log(`\n💡 可以点击第一个任务查看详情: /task/${firstTask.id}`);
            }
        }

        // 如果当前在任务详情页面且任务ID有效
        if (currentUrl.includes('/task/') && taskId !== 'unknown' && taskId) {
            console.log(`📋 检查任务 ${taskId} 的详情...`);

            try {
                // 尝试从合约获取任务详情
                if (web3Store.aptosContractService) {
                    const taskDetail = await web3Store.aptosContractService.getTask(parseInt(taskId));
                    console.log('  - 合约任务详情:', taskDetail);

                    // 检查任务是否存在
                    if (taskDetail) {
                        console.log('✅ 任务详情获取成功');

                        // 更新dataStore中的任务数据
                        const existingTaskIndex = dataStore.tasks.findIndex(t => t.id === parseInt(taskId));
                        if (existingTaskIndex >= 0) {
                            dataStore.tasks[existingTaskIndex] = {
                                ...dataStore.tasks[existingTaskIndex],
                                ...taskDetail
                            };
                            console.log('✅ 任务数据已更新');
                        } else {
                            // 如果任务不在列表中，添加到列表
                            dataStore.tasks.push(taskDetail);
                            console.log('✅ 任务已添加到列表');
                        }
                    } else {
                        console.log('❌ 任务不存在');
                        console.log('🔄 重定向到任务大厅...');
                        window.location.href = '/tasks';
                    }
                }
            } catch (error) {
                console.error('❌ 获取任务详情失败:', error);
                console.log('🔄 重定向到任务大厅...');
                window.location.href = '/tasks';
            }
        }

        console.log('\n✅ 任务详情页面修复完成');

    } catch (error) {
        console.error('❌ 修复失败:', error);
    }
})(); 