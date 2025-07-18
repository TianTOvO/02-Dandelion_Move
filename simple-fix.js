// 简单修复脚本
console.log('🔧 简单修复脚本...');

async function simpleFix() {
    try {
        // 检查dataStore
        console.log('🔍 检查dataStore状态:');
        console.log('  - dataStore存在:', !!window.dataStore);
        console.log('  - 任务数量:', window.dataStore?.tasks?.length);

        if (!window.dataStore) {
            console.error('❌ dataStore不存在，请先运行fix-store-exposure-v2.js');
            return;
        }

        // 直接调用dataStore的方法重新加载任务
        console.log('🔄 重新加载任务数据...');
        if (window.dataStore.loadTasksFromContract) {
            await window.dataStore.loadTasksFromContract();
            console.log('✅ 任务数据重新加载成功');

            // 检查更新后的数据
            console.log('\n🔍 检查更新后的任务数据:');
            window.dataStore.tasks.forEach((task, index) => {
                console.log(`📋 任务 ${index} (ID: ${task.id}):`);
                console.log('  - 标题:', task.title);
                console.log('  - 状态(数字):', task.status, typeof task.status);
                console.log('  - 状态(文本):', task.statusText);
                console.log('  - 创建者:', task.creator);

                // 检查竞标按钮显示条件
                const currentUser = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b'; // 你的地址
                const isCreator = task.creator && task.creator.toLowerCase() === currentUser.toLowerCase();
                const isCorrectStatus = task.status === 1;

                console.log('  - 竞标条件:');
                console.log('    * 状态是竞标中:', isCorrectStatus);
                console.log('    * 是创建者:', isCreator);
                console.log('    * 可以参与:', !isCreator && isCorrectStatus);
            });

            // 刷新页面显示
            console.log('\n🔄 刷新页面显示...');
            window.location.reload();

        } else {
            console.error('❌ loadTasksFromContract方法不存在');

            // 尝试手动更新任务数据
            console.log('🔄 尝试手动更新任务数据...');

            // 直接调用合约API
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
                const result = await response.json();
                console.log('📋 合约返回的原始数据:', result);

                // 处理数据
                let tasks = result;
                if (Array.isArray(result[0])) {
                    tasks = result[0];
                }

                // 格式化任务数据
                const formattedTasks = tasks.map((task, index) => ({
                    id: index,
                    title: task.title || '未命名任务',
                    status: parseInt(task.status), // 保持数字状态
                    statusText: getStatusText(parseInt(task.status)), // 添加文本状态
                    reward: parseInt(task.budget) / 100000000, // 转换Octa到APT
                    creator: task.creator,
                    description: task.description,
                    deadline: task.deadline,
                    participants: task.participants || [],
                    winner: task.winner,
                    locked: task.locked || false
                }));

                // 更新dataStore
                window.dataStore.tasks = formattedTasks;
                console.log('✅ 手动更新任务数据成功');

                // 检查更新后的数据
                console.log('\n🔍 检查手动更新的任务数据:');
                formattedTasks.forEach((task, index) => {
                    console.log(`📋 任务 ${index} (ID: ${task.id}):`);
                    console.log('  - 标题:', task.title);
                    console.log('  - 状态(数字):', task.status, typeof task.status);
                    console.log('  - 状态(文本):', task.statusText);
                    console.log('  - 创建者:', task.creator);

                    // 检查竞标按钮显示条件
                    const currentUser = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b';
                    const isCreator = task.creator && task.creator.toLowerCase() === currentUser.toLowerCase();
                    const isCorrectStatus = task.status === 1;

                    console.log('  - 竞标条件:');
                    console.log('    * 状态是竞标中:', isCorrectStatus);
                    console.log('    * 是创建者:', isCreator);
                    console.log('    * 可以参与:', !isCreator && isCorrectStatus);
                });

                // 刷新页面
                window.location.reload();

            } else {
                console.error('❌ 调用合约API失败:', response.status);
            }
        }

    } catch (error) {
        console.error('❌ 简单修复失败:', error);
    }
}

// 状态文本映射函数
function getStatusText(status) {
    const statusMap = {
        0: 'Open',
        1: 'In Progress',
        2: 'Completed',
        3: 'Disputed',
        4: 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
}

// 运行修复
simpleFix(); 