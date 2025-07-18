// 修复任务ID为unknown的问题
console.log('🔧 修复任务ID为unknown的问题...');

(async function () {
    try {
        // 检查当前URL
        const currentUrl = window.location.href;
        console.log('📊 当前URL分析:');
        console.log('  - 完整URL:', currentUrl);

        // 解析URL
        const urlParts = currentUrl.split('/');
        const taskId = urlParts[urlParts.length - 1];
        console.log('  - 解析的任务ID:', taskId);

        if (taskId === 'unknown') {
            console.log('❌ 发现任务ID为unknown，需要修复');

            // 尝试获取正确的任务ID
            console.log('🔄 尝试获取正确的任务ID...');

            // 方法1: 检查localStorage中是否有任务数据
            const storedTasks = localStorage.getItem('dandelion_tasks');
            if (storedTasks) {
                try {
                    const tasks = JSON.parse(storedTasks);
                    console.log('  - 本地存储的任务数量:', tasks.length);

                    if (tasks.length > 0) {
                        const firstTask = tasks[0];
                        console.log('  - 第一个任务:', firstTask);

                        if (firstTask.id) {
                            console.log(`✅ 找到有效任务ID: ${firstTask.id}`);
                            const newUrl = currentUrl.replace('/unknown', `/${firstTask.id}`);
                            console.log(`🔄 重定向到: ${newUrl}`);
                            window.location.href = newUrl;
                            return;
                        }
                    }
                } catch (error) {
                    console.log('  - 解析本地存储失败:', error.message);
                }
            }

            // 方法2: 重定向到任务大厅
            console.log('🔄 重定向到任务大厅...');
            window.location.href = '/tasks';
            return;
        }

        // 检查钱包连接状态
        console.log('\n🔗 检查钱包连接状态...');

        // 查找钱包连接按钮
        const connectButtons = document.querySelectorAll('button');
        let walletButton = null;

        connectButtons.forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes('连接') || text.includes('connect') || text.includes('钱包')) {
                walletButton = button;
                console.log('  - 找到钱包连接按钮:', button.textContent);
            }
        });

        if (walletButton) {
            console.log('🔄 尝试连接钱包...');
            walletButton.click();

            // 等待钱包连接
            console.log('⏳ 等待钱包连接...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 重新检查页面状态
            console.log('🔄 重新检查页面状态...');
            const walletElements = document.querySelectorAll('[class*="wallet"], [class*="connect"]');
            console.log('  - 钱包相关元素数量:', walletElements.length);

            if (walletElements.length > 0) {
                console.log('✅ 钱包连接成功');

                // 等待Pinia实例初始化
                console.log('⏳ 等待Pinia实例初始化...');
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (window.pinia) {
                    console.log('✅ Pinia实例已找到');

                    // 尝试加载任务数据
                    console.log('🔄 尝试加载任务数据...');
                    try {
                        const { useDataStore } = await import('/src/stores/data.js');
                        const dataStore = useDataStore();

                        await dataStore.loadTasksFromContract();
                        console.log('✅ 任务数据加载成功');

                        // 如果有任务，重定向到第一个任务
                        if (dataStore.tasks.length > 0) {
                            const firstTask = dataStore.tasks[0];
                            console.log(`🔄 重定向到第一个任务: ${firstTask.id}`);
                            window.location.href = `/task/${firstTask.id}`;
                        } else {
                            console.log('⚠️ 没有找到任务，重定向到任务大厅');
                            window.location.href = '/tasks';
                        }
                    } catch (error) {
                        console.error('❌ 加载任务数据失败:', error);
                        console.log('🔄 重定向到任务大厅');
                        window.location.href = '/tasks';
                    }
                } else {
                    console.log('❌ Pinia实例仍未找到');
                    console.log('🔄 重定向到任务大厅');
                    window.location.href = '/tasks';
                }
            } else {
                console.log('❌ 钱包连接失败');
                console.log('🔄 重定向到任务大厅');
                window.location.href = '/tasks';
            }
        } else {
            console.log('❌ 未找到钱包连接按钮');
            console.log('🔄 重定向到任务大厅');
            window.location.href = '/tasks';
        }

    } catch (error) {
        console.error('❌ 修复失败:', error);
        console.log('🔄 重定向到任务大厅');
        window.location.href = '/tasks';
    }
})(); 