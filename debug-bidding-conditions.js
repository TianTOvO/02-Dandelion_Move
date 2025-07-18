// 调试竞标按钮显示条件
console.log('🔍 调试竞标按钮显示条件...');

// 检查当前用户
const web3Store = window.web3Store;
const dataStore = window.dataStore;

console.log('👤 当前用户信息:');
console.log('  - 已连接:', web3Store.isConnected);
console.log('  - 账户地址:', web3Store.account);

// 检查任务数据
console.log('📋 任务数据检查:');
dataStore.tasks.forEach((task, index) => {
    console.log(`\n📋 任务 ${index} (ID: ${task.id}):`);
    console.log('  - 标题:', task.title);
    console.log('  - 状态:', task.status);
    console.log('  - 状态文本:', task.statusText);
    console.log('  - 创建者:', task.creator);
    console.log('  - 雇主:', task.employer);

    // 检查竞标按钮显示条件
    const currentUser = web3Store.account;
    const isCreator = task.creator && task.creator.toLowerCase() === currentUser.toLowerCase();
    const isEmployer = task.employer && task.employer.toLowerCase() === currentUser.toLowerCase();
    const isCorrectStatus = task.status === 1;

    console.log('  - 状态检查:');
    console.log('    * 状态是竞标中:', isCorrectStatus);
    console.log('    * 是创建者:', isCreator);
    console.log('    * 是雇主:', isEmployer);

    // 检查是否已经竞标
    const taskBids = dataStore.getBidsByTaskId ? dataStore.getBidsByTaskId(task.id) : [];
    const hasAlreadyBid = taskBids.some(bid =>
        bid.bidder && bid.bidder.toLowerCase() === currentUser.toLowerCase()
    );

    console.log('  - 竞标检查:');
    console.log('    * 竞标数量:', taskBids.length);
    console.log('    * 已竞标:', hasAlreadyBid);

    // 最终判断
    const canParticipate = currentUser && !isCreator && !isEmployer && isCorrectStatus && !hasAlreadyBid;
    console.log('  - 可以参与:', canParticipate);

    if (!canParticipate) {
        if (!currentUser) console.log('    ❌ 原因: 未连接钱包');
        if (isCreator) console.log('    ❌ 原因: 是自己的任务');
        if (isEmployer) console.log('    ❌ 原因: 是自己的任务');
        if (!isCorrectStatus) console.log('    ❌ 原因: 任务状态不是竞标中');
        if (hasAlreadyBid) console.log('    ❌ 原因: 已经竞标过');
    }
});

// 检查页面上的按钮
console.log('\n🔘 页面按钮检查:');
const allButtons = document.querySelectorAll('button');
allButtons.forEach((button, index) => {
    const text = button.textContent.trim();
    if (text.includes('竞标') || text.includes('参与') || text.includes('立即')) {
        console.log(`🔘 竞标相关按钮 ${index}:`, {
            text: text,
            visible: button.offsetParent !== null,
            className: button.className
        });
    }
});

console.log('✅ 竞标按钮条件调试完成'); 