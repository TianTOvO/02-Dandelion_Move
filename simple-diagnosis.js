// 简单诊断脚本
console.log('🔍 简单诊断页面状态...');

// 检查基本对象
console.log('📊 基本对象检查:');
console.log('  - window.pinia:', !!window.pinia);
console.log('  - window.Vue:', !!window.Vue);
console.log('  - document.readyState:', document.readyState);

// 检查是否有Vue应用
const vueApp = document.querySelector('#app');
console.log('  - Vue应用元素:', !!vueApp);

// 检查页面内容
console.log('\n📄 页面内容检查:');
const taskElements = document.querySelectorAll('[class*="task"], [class*="reward"]');
console.log('  - 任务相关元素数量:', taskElements.length);

// 检查控制台错误
console.log('\n⚠️ 控制台错误检查:');
if (window.console && window.console.error) {
    console.log('  - 控制台错误函数可用');
} else {
    console.log('  - 控制台错误函数不可用');
}

// 等待页面加载
console.log('\n⏳ 等待页面完全加载...');
setTimeout(() => {
    console.log('🔄 重新检查Pinia实例...');
    console.log('  - window.pinia:', !!window.pinia);

    if (window.pinia) {
        console.log('✅ Pinia实例已找到，可以运行修复脚本');
    } else {
        console.log('❌ Pinia实例仍未找到');
        console.log('💡 建议：');
        console.log('  1. 确保页面完全加载');
        console.log('  2. 确保钱包已连接');
        console.log('  3. 刷新页面后重试');
    }
}, 2000); 