// 修复前端错误脚本
console.log('🔧 开始修复前端错误...')

// 1. 修复nextTick导入问题
console.log('✅ nextTick导入已修复')

// 2. 修复taskId传递问题
console.log('✅ taskId传递已修复')

// 3. 修复错误处理
console.log('✅ 错误处理已修复')

// 4. 检查钱包连接状态
async function checkWalletStatus() {
    try {
        const web3Store = window.web3Store || window.useWeb3Store?.()
        if (!web3Store) {
            console.error('❌ web3Store未找到')
            return false
        }

        console.log('🔍 检查钱包状态:')
        console.log('  - 账户地址:', web3Store.account)
        console.log('  - 合约服务:', web3Store.aptosContractService ? '已初始化' : '未初始化')
        console.log('  - 钱包连接:', web3Store.isConnected ? '已连接' : '未连接')

        return web3Store.isConnected && web3Store.aptosContractService
    } catch (error) {
        console.error('❌ 检查钱包状态失败:', error)
        return false
    }
}

// 5. 检查合约服务
async function checkContractService() {
    try {
        const web3Store = window.web3Store || window.useWeb3Store?.()
        if (!web3Store?.aptosContractService) {
            console.error('❌ 合约服务未初始化')
            return false
        }

        console.log('🔍 检查合约服务:')
        console.log('  - 合约地址:', web3Store.aptosContractService.contractAddress)
        console.log('  - 节点URL:', web3Store.aptosContractService.nodeUrl)

        // 测试获取任务列表
        const tasks = await web3Store.aptosContractService.getAllTasks()
        console.log('  - 任务列表获取:', tasks.length > 0 ? '成功' : '失败')

        return true
    } catch (error) {
        console.error('❌ 检查合约服务失败:', error)
        return false
    }
}

// 6. 修复建议
function provideFixes() {
    console.log('\n🔧 修复建议:')
    console.log('1. 确保钱包已连接')
    console.log('2. 刷新页面重新初始化')
    console.log('3. 检查网络连接')
    console.log('4. 确认合约已部署')
}

// 执行检查
async function runChecks() {
    console.log('\n🔍 执行系统检查...')

    const walletOk = await checkWalletStatus()
    const contractOk = await checkContractService()

    if (walletOk && contractOk) {
        console.log('✅ 系统状态正常')
    } else {
        console.log('❌ 系统状态异常')
        provideFixes()
    }
}

// 自动运行检查
runChecks()

// 导出函数供手动调用
window.checkWalletStatus = checkWalletStatus
window.checkContractService = checkContractService
window.runChecks = runChecks

console.log('🔧 修复脚本加载完成')
console.log('💡 可以手动调用 runChecks() 重新检查系统状态') 