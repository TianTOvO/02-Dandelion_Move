// 测试竞标按钮
console.log('🔍 检查任务大厅竞标按钮...');

// 检查当前页面
const currentPath = window.location.pathname;
console.log('📍 当前页面:', currentPath);

// 检查任务列表元素
const taskCards = document.querySelectorAll('.task-card, .task-item, [data-task-id]');
console.log('📋 找到任务卡片数量:', taskCards.length);

// 检查竞标按钮
const bidButtons = document.querySelectorAll('button, .btn, [class*="bid"], [class*="竞标"]');
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

// 检查Vue组件状态
if (window.app) {
    console.log('🔍 检查Vue组件状态...');

    // 尝试获取当前路由组件
    const currentRoute = window.app.config.globalProperties.$route;
    if (currentRoute) {
        console.log('📍 当前路由:', currentRoute.path);
        console.log('📋 路由组件:', currentRoute.matched);
    }
}

console.log('✅ 竞标按钮检查完成'); 