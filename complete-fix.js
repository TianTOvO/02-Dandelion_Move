// 完整修复脚本
console.log('🔧 完整修复脚本...');

async function completeFix() {
    try {
        // 步骤1: 暴露store到全局
        console.log('🔄 步骤1: 暴露store到全局...');

        // 检查Pinia实例
        if (window.pinia) {
            console.log('✅ Pinia实例已找到');

            // 动态导入store
            const { useWeb3Store } = await import('/src/stores/web3.js');
            const { useDataStore } = await import('/src/stores/data.js');
            const { useWalletStore } = await import('/src/stores/wallet.js');
            const { useIpfsStore } = await import('/src/stores/ipfs.js');

            // 创建store实例
            const web3Store = useWeb3Store();
            const dataStore = useDataStore();
            const walletStore = useWalletStore();
            const ipfsStore = useIpfsStore();

            // 暴露到全局
            window.web3Store = web3Store;
            window.dataStore = dataStore;
            window.walletStore = walletStore;
            window.ipfsStore = ipfsStore;

            console.log('✅ Store已暴露到全局');
        } else {
            console.error('❌ Pinia实例未找到');
            return;
        }

        // 步骤2: 直接调用合约API获取任务数据
        console.log('🔄 步骤2: 直接调用合约API...');

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

        if (!response.ok) {
            throw new Error(`调用合约API失败: ${response.status}`);
        }

        const result = await response.json();
        console.log('📋 合约返回的原始数据:', result);

        // 处理数据
        let tasks = result;
        if (Array.isArray(result[0])) {
            tasks = result[0];
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

        console.log('✅ 任务数据格式化完成');

        // 步骤3: 更新dataStore
        console.log('🔄 步骤3: 更新dataStore...');
        if (window.dataStore) {
            window.dataStore.tasks = formattedTasks;
            console.log('✅ dataStore已更新');
        } else {
            console.error('❌ dataStore不存在');
            return;
        }

        // 步骤4: 检查修复效果
        console.log('\n🔍 步骤4: 检查修复效果:');
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

        // 步骤5: 刷新页面
        console.log('\n🔄 步骤5: 刷新页面...');
        console.log('✅ 修复完成，页面即将刷新');

        // 延迟刷新，让用户看到结果
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('❌ 完整修复失败:', error);

        // 尝试备用方法
        console.log('🔄 尝试备用方法...');
        try {
            // 直接刷新页面，让Vue重新初始化
            console.log('🔄 直接刷新页面...');
            window.location.reload();
        } catch (backupError) {
            console.error('❌ 备用方法也失败:', backupError);
        }
    }
}

// 运行完整修复
completeFix(); 