// 修复任务详情页面 - 可靠版本
console.log('🔧 修复任务详情页面 - 可靠版本...');

// 等待页面完全加载和Pinia实例可用
function waitForPinia() {
    return new Promise((resolve) => {
        const checkPinia = () => {
            if (window.__PINIA__ && window.__PINIA__.state.value) {
                console.log('✅ Pinia实例已找到');
                resolve();
            } else {
                console.log('⏳ 等待Pinia实例加载...');
                setTimeout(checkPinia, 500);
            }
        };
        checkPinia();
    });
}

// 修复任务详情页面
async function fixTaskDetail() {
    try {
        await waitForPinia();

        // 获取当前路由信息
        const currentRoute = window.location.pathname;
        console.log('📍 当前路由:', currentRoute);

        // 检查是否在任务详情页面
        if (!currentRoute.includes('/task/')) {
            console.log('❌ 不在任务详情页面，重定向到任务大厅');
            window.location.href = '/tasks';
            return;
        }

        // 获取任务ID
        const taskId = currentRoute.split('/task/')[1];
        console.log('📋 任务ID:', taskId);

        if (!taskId || taskId === 'unknown') {
            console.log('❌ 无效的任务ID，尝试获取有效任务');

            // 尝试从合约获取任务列表
            try {
                const response = await fetch('https://fullnode.testnet.aptoslabs.com/v1/view', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        function: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b::TaskFactory::view_get_all_tasks',
                        type_arguments: [],
                        arguments: []
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('📋 合约任务数据:', data);

                    if (data && data.length > 0) {
                        const firstTask = data[0];
                        console.log('✅ 找到有效任务，重定向到:', `/task/${firstTask.id}`);
                        window.location.href = `/task/${firstTask.id}`;
                        return;
                    }
                }
            } catch (error) {
                console.log('❌ 获取任务列表失败:', error);
            }

            // 如果无法获取任务，重定向到任务大厅
            console.log('🔄 重定向到任务大厅');
            window.location.href = '/tasks';
            return;
        }

        // 验证任务是否存在
        try {
            const response = await fetch('https://fullnode.testnet.aptoslabs.com/v1/view', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b::TaskFactory::view_get_task',
                    type_arguments: [],
                    arguments: [taskId]
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ 任务存在:', data);

                // 更新页面显示
                updateTaskDisplay(data);
            } else {
                console.log('❌ 任务不存在，重定向到任务大厅');
                window.location.href = '/tasks';
            }
        } catch (error) {
            console.log('❌ 验证任务失败:', error);
            window.location.href = '/tasks';
        }

    } catch (error) {
        console.error('❌ 修复任务详情页面失败:', error);
    }
}

// 更新任务显示
function updateTaskDisplay(taskData) {
    console.log('🎨 更新任务显示...');

    // 更新任务标题
    const titleElement = document.querySelector('h1, .task-title, [data-testid="task-title"]');
    if (titleElement && taskData.title) {
        titleElement.textContent = taskData.title;
    }

    // 更新任务描述
    const descElement = document.querySelector('.task-description, [data-testid="task-description"]');
    if (descElement && taskData.description) {
        descElement.textContent = taskData.description;
    }

    // 更新任务奖励
    const rewardElement = document.querySelector('.task-reward, [data-testid="task-reward"]');
    if (rewardElement && taskData.budget) {
        const rewardInApt = (parseInt(taskData.budget) / 100000000).toFixed(2);
        rewardElement.textContent = `${rewardInApt} APT`;
    }

    // 更新任务状态
    const statusElement = document.querySelector('.task-status, [data-testid="task-status"]');
    if (statusElement && taskData.status !== undefined) {
        const statusText = getStatusText(taskData.status);
        statusElement.textContent = statusText;
    }

    console.log('✅ 任务显示更新完成');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        0: '开放',
        1: '进行中',
        2: '已完成',
        3: '已取消'
    };
    return statusMap[status] || '未知';
}

// 执行修复
fixTaskDetail(); 