// 任务大厅竞标功能测试脚本 - 修复版
// 在浏览器控制台中运行此脚本

// 主测试函数
async function testTasksBiddingFixed() {
    try {
        console.log('🚀 开始测试任务大厅竞标功能...')

        // 检查是否在任务页面
        if (!window.location.pathname.includes('/tasks')) {
            console.log('⚠️ 请在任务大厅页面运行此测试')
            return false
        }

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

// 检查任务大厅页面功能 - 修复版
function checkTasksPageFeaturesFixed() {
    console.log('\n🔍 检查任务大厅页面功能...')

    // 检查是否存在任务列表
    const taskCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div')
    console.log(`📋 找到 ${taskCards.length} 个任务卡片`)

    // 检查竞标按钮 - 更精确的查找
    const allButtons = document.querySelectorAll('button')
    const bidButtons = Array.from(allButtons).filter(btn => {
        const text = btn.textContent.trim()
        return text.includes('立即竞标') || text.includes('竞标') || text.includes('Bid')
    })
    console.log(`🎯 找到 ${bidButtons.length} 个竞标按钮`)

    // 显示竞标按钮详情
    bidButtons.forEach((btn, index) => {
        console.log(`  - 按钮 ${index + 1}: "${btn.textContent.trim()}" (${btn.disabled ? '禁用' : '可用'})`)
    })

    // 检查筛选功能
    const filters = document.querySelectorAll('input[type="radio"], input[type="checkbox"], select')
    console.log(`🔍 找到 ${filters.length} 个筛选控件`)

    // 检查搜索功能
    const searchInput = document.querySelector('input[placeholder*="搜索"]')
    console.log(`🔎 搜索框: ${searchInput ? '已找到' : '未找到'}`)

    // 检查任务状态显示
    const statusBadges = document.querySelectorAll('[class*="px-3 py-1 rounded-full"]')
    console.log(`🏷️ 找到 ${statusBadges.length} 个状态标签`)

    return {
        taskCards: taskCards.length,
        bidButtons: bidButtons.length,
        filters: filters.length,
        hasSearch: !!searchInput,
        statusBadges: statusBadges.length
    }
}

// 模拟竞标操作 - 修复版
function simulateBiddingFixed() {
    console.log('\n🎮 模拟竞标操作...')

    // 查找竞标按钮 - 更精确的查找
    const allButtons = document.querySelectorAll('button')
    const bidButtons = Array.from(allButtons).filter(btn => {
        const text = btn.textContent.trim()
        return text.includes('立即竞标') || text.includes('竞标') || text.includes('Bid')
    })

    if (bidButtons.length === 0) {
        console.log('⚠️ 没有找到竞标按钮')
        console.log('🔍 所有按钮文本:')
        allButtons.forEach((btn, index) => {
            console.log(`  ${index + 1}: "${btn.textContent.trim()}"`)
        })
        return false
    }

    console.log(`🎯 找到 ${bidButtons.length} 个竞标按钮`)

    // 点击第一个可用的竞标按钮
    const firstBidButton = bidButtons.find(btn => !btn.disabled)
    if (firstBidButton) {
        console.log('🖱️ 点击竞标按钮...')
        console.log(`  - 按钮文本: "${firstBidButton.textContent.trim()}"`)
        console.log(`  - 按钮类名: "${firstBidButton.className}"`)
        firstBidButton.click()
        return true
    } else {
        console.log('⚠️ 所有竞标按钮都不可用')
        bidButtons.forEach((btn, index) => {
            console.log(`  - 按钮 ${index + 1}: "${btn.textContent.trim()}" (禁用原因: ${btn.disabled})`)
        })
        return false
    }
}

// 测试特定任务的竞标功能
async function testSpecificTaskBidding(taskId) {
    try {
        console.log(`\n🎯 测试特定任务竞标，任务ID: ${taskId}...`)

        const web3Store = window.web3Store || window.useWeb3Store?.()
        if (!web3Store?.isConnected || !web3Store?.aptosContractService) {
            console.error('❌ 钱包未连接或合约服务未初始化')
            return false
        }

        // 获取任务详情
        const task = await web3Store.aptosContractService.getTask(taskId)
        console.log('📄 任务详情:', task)

        if (!task) {
            console.log('❌ 任务不存在')
            return false
        }

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

// 检查页面上的任务数据
function checkPageTasks() {
    console.log('\n📋 检查页面上的任务数据...')

    // 查找任务卡片
    const taskCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div')
    console.log(`📄 找到 ${taskCards.length} 个任务卡片`)

    taskCards.forEach((card, index) => {
        console.log(`\n📄 任务卡片 ${index + 1}:`)

        // 获取任务标题
        const title = card.querySelector('h3')
        if (title) {
            console.log(`  - 标题: ${title.textContent.trim()}`)
        }

        // 获取任务状态
        const statusBadges = card.querySelectorAll('[class*="px-3 py-1 rounded-full"]')
        statusBadges.forEach(badge => {
            console.log(`  - 状态: ${badge.textContent.trim()}`)
        })

        // 获取奖励信息
        const rewardElement = card.querySelector('.text-lg.font-bold.text-green-700')
        if (rewardElement) {
            console.log(`  - 奖励: ${rewardElement.textContent.trim()}`)
        }

        // 获取竞标按钮
        const bidButton = Array.from(card.querySelectorAll('button')).find(btn =>
            btn.textContent.includes('立即竞标') || btn.textContent.includes('竞标')
        )
        if (bidButton) {
            console.log(`  - 竞标按钮: "${bidButton.textContent.trim()}" (${bidButton.disabled ? '禁用' : '可用'})`)
        } else {
            console.log(`  - 竞标按钮: 未找到`)
        }
    })
}

// 导出函数
window.testTasksBiddingFixed = testTasksBiddingFixed
window.checkTasksPageFeaturesFixed = checkTasksPageFeaturesFixed
window.simulateBiddingFixed = simulateBiddingFixed
window.testSpecificTaskBidding = testSpecificTaskBidding
window.checkPageTasks = checkPageTasks

console.log('🔧 任务大厅竞标测试脚本(修复版)加载完成')
console.log('💡 可用的测试函数:')
console.log('  - testTasksBiddingFixed() - 测试任务大厅竞标功能')
console.log('  - checkTasksPageFeaturesFixed() - 检查页面功能(修复版)')
console.log('  - simulateBiddingFixed() - 模拟竞标操作(修复版)')
console.log('  - testSpecificTaskBidding(taskId) - 测试特定任务竞标')
console.log('  - checkPageTasks() - 检查页面上的任务数据') 