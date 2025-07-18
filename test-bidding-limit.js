// 测试竞标限制功能
console.log('🔧 测试竞标限制功能...');

async function testBiddingLimit() {
    try {
        // 检查store状态
        if (!window.web3Store || !window.dataStore) {
            console.error('❌ Store未初始化，请先运行complete-fix.js');
            return;
        }

        console.log('🔍 检查当前状态:');
        console.log('  - 钱包已连接:', window.web3Store.isConnected);
        console.log('  - 账户地址:', window.web3Store.account);
        console.log('  - 合约服务存在:', !!window.web3Store.aptosContractService);
        console.log('  - 任务数量:', window.dataStore.tasks.length);

        // 获取竞标中的任务
        const biddingTasks = window.dataStore.tasks.filter(task =>
            task.status === 1 &&
            task.creator.toLowerCase() !== window.web3Store.account.toLowerCase()
        );

        console.log(`📋 找到 ${biddingTasks.length} 个可以参与的任务`);

        if (biddingTasks.length === 0) {
            console.log('⚠️ 没有可参与的任务，请先创建一些任务');
            return;
        }

        // 测试第一个可参与的任务
        const testTask = biddingTasks[0];
        console.log(`\n🎯 测试任务: ${testTask.title} (ID: ${testTask.id})`);

        // 检查参与状态
        console.log('🔍 检查参与状态...');

        // 方法1: 使用前端检查
        const canParticipate = window.dataStore.tasks.find(t => t.id === testTask.id)?.participants?.some(p => {
            const participantAddress = typeof p === 'string' ? p : (p && p.address ? p.address : '')
            return participantAddress && participantAddress.toLowerCase() === window.web3Store.account.toLowerCase()
        }) || false;

        console.log('  - 前端检查 - 已参与:', canParticipate);

        // 方法2: 使用合约检查
        if (window.web3Store.aptosContractService) {
            try {
                const hasParticipated = await window.web3Store.aptosContractService.hasUserParticipated(testTask.id, window.web3Store.account);
                console.log('  - 合约检查 - 已参与:', hasParticipated);

                // 获取参与者列表
                const participants = await window.web3Store.aptosContractService.getTaskParticipants(testTask.id);
                console.log('  - 参与者列表:', participants);

            } catch (error) {
                console.error('  - 合约检查失败:', error);
            }
        }

        // 测试竞标功能
        console.log('\n🧪 测试竞标功能...');

        // 检查是否可以参与
        const canBid = !canParticipate && testTask.status === 1;
        console.log('  - 可以参与竞标:', canBid);

        if (canBid) {
            console.log('  - 准备参与竞标...');

            // 这里可以添加实际的竞标测试
            // 但为了安全，我们先不执行实际的竞标
            console.log('  - 竞标测试准备就绪（未执行实际竞标）');

        } else {
            console.log('  - 无法参与竞标，原因:', canParticipate ? '已参与' : '状态不允许');
        }

        // 显示所有任务的参与状态
        console.log('\n📊 所有任务的参与状态:');
        window.dataStore.tasks.forEach((task, index) => {
            const isCreator = task.creator.toLowerCase() === window.web3Store.account.toLowerCase();
            const isParticipant = task.participants?.some(p => {
                const participantAddress = typeof p === 'string' ? p : (p && p.address ? p.address : '')
                return participantAddress && participantAddress.toLowerCase() === window.web3Store.account.toLowerCase()
            }) || false;

            console.log(`  ${index + 1}. ${task.title} (ID: ${task.id}):`);
            console.log(`     - 状态: ${task.statusText} (${task.status})`);
            console.log(`     - 是创建者: ${isCreator}`);
            console.log(`     - 已参与: ${isParticipant}`);
            console.log(`     - 可以参与: ${!isCreator && !isParticipant && task.status === 1}`);
        });

        console.log('\n✅ 竞标限制测试完成');

    } catch (error) {
        console.error('❌ 测试竞标限制失败:', error);
    }
}

// 运行测试
testBiddingLimit(); 