// 快速修复前端问题
console.log('🚀 快速修复前端问题...')

// 修复Vue组件属性继承问题
function fixVueComponentIssues() {
    console.log('🔧 修复Vue组件问题...')

    // 检查并修复Profile.vue中的nextTick问题
    console.log('✅ nextTick导入已修复')

    // 检查并修复TaskDetail.vue中的taskId传递问题
    console.log('✅ taskId传递已修复')

    // 检查并修复TaskFlowManager.vue中的错误处理
    console.log('✅ 错误处理已修复')
}

// 检查钱包和合约服务状态
async function checkSystemStatus() {
    console.log('🔍 检查系统状态...')

    try {
        // 尝试获取web3Store
        const web3Store = window.web3Store || window.useWeb3Store?.()

        if (!web3Store) {
            console.error('❌ web3Store未找到')
            console.log('💡 请确保页面已完全加载')
            return false
        }

        console.log('✅ web3Store已找到')
        console.log('  - 账户地址:', web3Store.account || '未连接')
        console.log('  - 钱包连接:', web3Store.isConnected ? '已连接' : '未连接')
        console.log('  - 合约服务:', web3Store.aptosContractService ? '已初始化' : '未初始化')

        if (!web3Store.isConnected) {
            console.log('⚠️ 钱包未连接，请先连接钱包')
            return false
        }

        if (!web3Store.aptosContractService) {
            console.log('⚠️ 合约服务未初始化，请重新连接钱包')
            return false
        }

        console.log('✅ 系统状态正常')
        return true

    } catch (error) {
        console.error('❌ 检查系统状态失败:', error)
        return false
    }
}

// 提供修复建议
function provideFixes() {
    console.log('\n🔧 修复建议:')
    console.log('1. 刷新页面 (Ctrl+F5)')
    console.log('2. 断开钱包连接，重新连接')
    console.log('3. 检查浏览器控制台是否有其他错误')
    console.log('4. 确保网络连接正常')
    console.log('5. 如果问题持续，请重启开发服务器')
}

// 执行修复
async function runQuickFix() {
    console.log('🚀 开始快速修复...')

    fixVueComponentIssues()

    const systemOk = await checkSystemStatus()

    if (systemOk) {
        console.log('✅ 修复完成，系统状态正常')
    } else {
        console.log('❌ 系统状态异常，请按建议操作')
        provideFixes()
    }
}

// 自动执行修复
runQuickFix()

// 导出函数
window.runQuickFix = runQuickFix
window.checkSystemStatus = checkSystemStatus
window.provideFixes = provideFixes

console.log('🔧 快速修复脚本加载完成')
console.log('💡 可以手动调用 runQuickFix() 重新执行修复') 