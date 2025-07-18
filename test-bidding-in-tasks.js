// 测试任务大厅竞标功能
console.log('🎯 测试任务大厅竞标功能...')

// 检查任务大厅竞标功能
async function testTasksBidding() {
    try {
        console.log('🔍 检查任务大厅竞标功能...')

        // 获取web3Store
        const web3Store = window.web3Store || window.useWeb3Store?.()
        if (!web3Store) {
            console.error('❌ web3Store未找到')
            return false
        }

        console.log('✅ web3Store已找到')
        console.log('  - 账户地址:', web3Store.account || '未连接')
        console.log('  - 钱包连接:', web3Store.isConnected ? '已连接' : '未连接')
        console.log('  - 合约服务:', web3Store.aptosContractService ? '已初始化' : '未初始化')

        if (!web3Store.isConnected) {
            console.log('⚠️ 请先连接钱包')
            return false
        }

        if (!web3Store.aptosContractService) {
            console.log('⚠️ 合约服务未初始化')
            return false
        }

        // 获取任务列表
        console.log('\n📋 获取任务列表...')
        const tasks = await web3Store.aptosContractService.getAllTasks()
        console.log(`✅ 获取到 ${tasks.length} 个任务`)

        if (tasks.length === 0) {
            console.log('📝 没有任务，请先创建任务')
            return false
        }

        // 查找可以竞标的任务
        const availableTasks = tasks.filter(task => {
            // 状态为竞标中
            if (task.status !== 1) return false

            // 不是自己创建的任务
            if (task.creator && task.creator.toLowerCase() === web3Store.account?.toLowerCase()) return false

            // 检查是否已经参与
            const participants = task.participants || []
            const hasParticipated = participants.some(p =>
                p.toLowerCase() === web3Store.account?.toLowerCase()
            )

            return !hasParticipated
        })

        console.log(`🎯 找到 ${availableTasks.length} 个可以竞标的任务`)

        if (availableTasks.length === 0) {
            console.log('⚠️ 没有可以竞标的任务')
            return false
        }

        // 显示可竞标任务
        availableTasks.forEach((task, index) => {
            console.log(`\n📄 任务 ${index + 1}:`)
            console.log(`  - ID: ${task.id}`)
            console.log(`  - 标题: ${task.title}`)
            console.log(`  - 奖励: ${task.reward} APT`)
            console.log(`  - 创建者: ${task.creator}`)
            console.log(`  - 参与者: ${task.participants?.length || 0}`)
        })

        return true

    } catch (error) {
        console.error('❌ 测试失败:', error)
        return false
    }
}

// 测试竞标功能
async function testBiddingFunction(taskId) {
    try {
        console.log(`\n🎯 测试竞标功能，任务ID: ${taskId}...`)

        const web3Store = window.web3Store || window.useWeb3Store?.()
        if (!web3Store?.isConnected || !web3Store?.aptosContractService) {
            console.error('❌ 钱包未连接或合约服务未初始化')
            return false
        }

        // 获取任务详情
        const task = await web3Store.aptosContractService.getTask(taskId)
        console.log('📄 任务详情:', task)

        // 检查是否可以参与
        const participants = task.participants || []
        const hasParticipated = participants.some(p =>
            p.toLowerCase() === web3Store.account?.toLowerCase()
        )

        if (hasParticipated) {
            console.log('⚠️ 已经参与过此任务')
            return false
        }

        if (task.creator && task.creator.toLowerCase() === web3Store.account?.toLowerCase()) {
            console.log('⚠️ 不能参与自己创建的任务')
            return false
        }

        if (task.status !== 1) {
            console.log('⚠️ 任务不在竞标期')
            return false
        }

        console.log('✅ 可以参与竞标，开始竞标...')

        // 参与竞标
        const result = await web3Store.aptosContractService.participateTask(taskId)
        console.log('✅ 竞标成功:', result)

        // 重新获取任务详情
        const updatedTask = await web3Store.aptosContractService.getTask(taskId)
        console.log('📄 更新后的任务详情:', updatedTask)

        return true

    } catch (error) {
        console.error('❌ 竞标失败:', error)
        return false
    }
}

// 检查任务大厅页面功能
function checkTasksPageFeatures() {
    console.log('\n🔍 检查任务大厅页面功能...')

    // 检查是否存在任务列表
    const taskCards = document.querySelectorAll('[class*="task"]')
    console.log(`📋 找到 ${taskCards.length} 个任务卡片`)

    // 检查竞标按钮
    const bidButtons = document.querySelectorAll('button')
    const bidButtonCount = Array.from(bidButtons).filter(btn =>
        btn.textContent.includes('竞标') || btn.textContent.includes('立即竞标') || btn.textContent.includes('Bid')
    ).length
    console.log(`🎯 找到 ${bidButtonCount} 个竞标按钮`)

    // 检查筛选功能
    const filters = document.querySelectorAll('input[type="radio"], input[type="checkbox"], select')
    console.log(`🔍 找到 ${filters.length} 个筛选控件`)

    // 检查搜索功能
    const searchInput = document.querySelector('input[placeholder*="搜索"]')
    console.log(`🔎 搜索框: ${searchInput ? '已找到' : '未找到'}`)

    return {
        taskCards: taskCards.length,
        bidButtons: bidButtonCount,
        filters: filters.length,
        hasSearch: !!searchInput
    }
}

// 模拟竞标操作
function simulateBidding() {
    console.log('\n🎮 模拟竞标操作...')

    // 查找竞标按钮
    const bidButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
        btn.textContent.includes('竞标') || btn.textContent.includes('立即竞标') || btn.textContent.includes('Bid')
    )

    if (bidButtons.length === 0) {
        console.log('⚠️ 没有找到竞标按钮')
        return false
    }

    console.log(`🎯 找到 ${bidButtons.length} 个竞标按钮`)

    // 点击第一个可用的竞标按钮
    const firstBidButton = bidButtons.find(btn => !btn.disabled)
    if (firstBidButton) {
        console.log('🖱️ 点击竞标按钮...')
        firstBidButton.click()
        return true
    } else {
        console.log('⚠️ 所有竞标按钮都不可用')
        return false
    }
}

// 导出函数
window.testTasksBidding = testTasksBidding
window.testBiddingFunction = testBiddingFunction
window.checkTasksPageFeatures = checkTasksPageFeatures
window.simulateBidding = simulateBidding

console.log('🔧 任务大厅竞标测试脚本加载完成')
console.log('💡 可用的测试函数:')
console.log('  - testTasksBidding() - 测试任务大厅竞标功能')
console.log('  - testBiddingFunction(taskId) - 测试特定任务竞标')
console.log('  - checkTasksPageFeatures() - 检查页面功能')
console.log('  - simulateBidding() - 模拟竞标操作') 