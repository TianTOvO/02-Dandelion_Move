// 导航到任务大厅页面
console.log('🧭 导航到任务大厅页面...');

// 检查当前页面
const currentPath = window.location.pathname;
console.log('📍 当前页面:', currentPath);

if (currentPath === '/tasks') {
    console.log('✅ 已经在任务大厅页面');
} else {
    console.log('🔄 需要导航到任务大厅页面');

    // 使用Vue Router导航
    if (window.app && window.app.config.globalProperties.$router) {
        console.log('🚀 使用Vue Router导航...');
        window.app.config.globalProperties.$router.push('/tasks');
    } else {
        console.log('🌐 使用浏览器导航...');
        window.location.href = '/tasks';
    }
}

// 等待页面加载完成后检查竞标按钮
setTimeout(() => {
    console.log('🔍 检查任务大厅竞标按钮...');

    // 检查当前页面
    const newPath = window.location.pathname;
    console.log('📍 导航后页面:', newPath);

    // 检查任务列表元素
    const taskCards = document.querySelectorAll('.task-card, .task-item, [data-task-id], .task-list-item');
    console.log('📋 找到任务卡片数量:', taskCards.length);

    // 检查竞标按钮
    const bidButtons = document.querySelectorAll('button, .btn, [class*="bid"], [class*="竞标"], [class*="参与"]');
    console.log('🔘 找到按钮数量:', bidButtons.length);

    // 详细检查每个按钮
    bidButtons.forEach((button, index) => {
        const text = button.textContent.trim();
        const className = button.className;
        const id = button.id;

        console.log(`🔘 按钮 ${index + 1}:`, {
            text: text,
            className: className,
            id: id,
            isVisible: button.offsetParent !== null
        });
    });

    // 检查任务数据
    if (window.dataStore && window.dataStore.tasks) {
        console.log('📊 任务数据状态:');
        console.log('  - 任务总数:', window.dataStore.tasks.length);

        // 检查每个任务的状态
        window.dataStore.tasks.forEach((task, index) => {
            console.log(`📋 任务 ${index}:`, {
                id: task.id,
                title: task.title,
                status: task.status,
                statusText: task.statusText,
                creator: task.creator,
                canParticipate: task.canParticipate
            });
        });
    }

    console.log('✅ 任务大厅竞标按钮检查完成');
}, 2000);

console.log('⏳ 等待页面导航和加载...'); 