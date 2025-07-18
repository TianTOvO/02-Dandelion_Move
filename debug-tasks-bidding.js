// 任务竞标按钮调试脚本
// 在浏览器控制台中运行此脚本

// 调试任务竞标按钮显示条件
function debugTasksBidding() {
    console.log('🔍 调试任务竞标按钮显示条件...')

    // 获取web3Store
    const web3Store = window.web3Store || window.useWeb3Store?.()
    if (!web3Store) {
        console.error('❌ web3Store未找到')
        return
    }

    console.log('✅ web3Store已找到')
    console.log('  - 账户地址:', web3Store.account || '未连接')
    console.log('  - 钱包连接:', web3Store.isConnected ? '已连接' : '未连接')
    console.log('  - 合约服务:', web3Store.aptosContractService ? '已初始化' : '未初始化')

    // 获取dataStore
    const dataStore = window.dataStore || window.useDataStore?.()
    if (!dataStore) {
        console.error('❌ dataStore未找到')
        return
    }

    console.log(`\n📋 任务数据检查:`)
    console.log(`  - 总任务数: ${dataStore.tasks.length}`)

    if (dataStore.tasks.length === 0) {
        console.log('⚠️ 没有任务数据')
        return
    }

    // 检查每个任务的状态和竞标条件
    dataStore.tasks.forEach((task, index) => {
        console.log(`\n📄 任务 ${index + 1} (ID: ${task.id}):`)
        console.log(`  - 标题: ${task.title}`)
        console.log(`  - 状态: ${task.status} (${getStatusText(task.status)})`)
        console.log(`  - 创建者: ${task.creator}`)
        console.log(`  - 雇主: ${task.employer}`)
        console.log(`  - 参与者: ${task.participants?.length || 0}`)

        // 检查竞标条件
        const canBid = checkCanBid(task, web3Store)
        console.log(`  - 可以竞标: ${canBid.canBid ? '✅ 是' : '❌ 否'}`)
        if (!canBid.canBid) {
            console.log(`    - 原因: ${canBid.reason}`)
        }

        // 检查是否应该显示竞标按钮
        const shouldShowButton = task.status === 1 && canBid.canBid
        console.log(`  - 应显示竞标按钮: ${shouldShowButton ? '✅ 是' : '❌ 否'}`)
    })

    // 检查页面上的实际按钮
    console.log(`\n🔍 页面按钮检查:`)
    const allButtons = document.querySelectorAll('button')
    const bidButtons = Array.from(allButtons).filter(btn => {
        const text = btn.textContent.trim()
        return text.includes('立即竞标') || text.includes('竞标') || text.includes('Bid')
    })

    console.log(`  - 总按钮数: ${allButtons.length}`)
    console.log(`  - 竞标按钮数: ${bidButtons.length}`)

    bidButtons.forEach((btn, index) => {
        console.log(`  - 竞标按钮 ${index + 1}: "${btn.textContent.trim()}" (${btn.disabled ? '禁用' : '可用'})`)
    })

    // 检查任务卡片
    console.log(`\n📋 任务卡片检查:`)
    const taskCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div')
    console.log(`  - 任务卡片数: ${taskCards.length}`)

    taskCards.forEach((card, index) => {
        const buttons = card.querySelectorAll('button')
        const bidButton = Array.from(buttons).find(btn =>
            btn.textContent.includes('立即竞标') || btn.textContent.includes('竞标')
        )

        console.log(`  - 卡片 ${index + 1}: ${bidButton ? '有竞标按钮' : '无竞标按钮'}`)
        if (bidButton) {
            console.log(`    - 按钮文本: "${bidButton.textContent.trim()}"`)
            console.log(`    - 按钮状态: ${bidButton.disabled ? '禁用' : '可用'}`)
        }
    })
}

// 检查是否可以竞标
function checkCanBid(task, web3Store) {
    const currentUser = web3Store.account

    // 未连接钱包
    if (!currentUser) {
        return { canBid: false, reason: '钱包未连接' }
    }

    // 不能参与自己发布的任务
    if (task.creator && task.creator.toLowerCase() === currentUser.toLowerCase()) {
        return { canBid: false, reason: '自己的任务' }
    }
    if (task.employer && task.employer.toLowerCase() === currentUser.toLowerCase()) {
        return { canBid: false, reason: '自己的任务' }
    }

    // 任务状态必须是竞标中
    if (task.status !== 1) {
        return { canBid: false, reason: `任务状态不是竞标中 (当前状态: ${task.status})` }
    }

    // 检查是否已经竞标
    const taskBids = getBidsByTask(task.id)
    const hasAlreadyBid = taskBids.some(bid =>
        bid.bidder && bid.bidder.toLowerCase() === currentUser.toLowerCase()
    )

    if (hasAlreadyBid) {
        return { canBid: false, reason: '已经竞标过' }
    }

    return { canBid: true, reason: '可以竞标' }
}

// 获取任务竞标列表
function getBidsByTask(taskId) {
    const dataStore = window.dataStore || window.useDataStore?.()
    return dataStore.getBidsByTaskId ? dataStore.getBidsByTaskId(taskId) || [] : []
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        0: '已创建',
        1: '竞标中',
        2: '开发中',
        3: '待雇主确认',
        4: '已完成',
        5: '争议中',
        6: '争议期',
        7: '已删除'
    }
    return statusMap[status] || `未知状态(${status})`
}

// 检查特定任务的竞标条件
function debugSpecificTask(taskId) {
    console.log(`\n🎯 调试特定任务 (ID: ${taskId})...`)

    const web3Store = window.web3Store || window.useWeb3Store?.()
    const dataStore = window.dataStore || window.useDataStore?.()

    if (!web3Store || !dataStore) {
        console.error('❌ Store未找到')
        return
    }

    const task = dataStore.tasks.find(t => t.id === taskId)
    if (!task) {
        console.error('❌ 任务未找到')
        return
    }

    console.log('📄 任务详情:', task)

    const canBid = checkCanBid(task, web3Store)
    console.log('🎯 竞标条件检查:', canBid)

    // 检查页面上的按钮
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`) ||
        document.querySelector(`[class*="task"][data-id="${taskId}"]`)

    if (taskCard) {
        const bidButton = taskCard.querySelector('button')
        if (bidButton) {
            console.log('🔘 页面按钮:', {
                text: bidButton.textContent.trim(),
                disabled: bidButton.disabled,
                visible: bidButton.offsetParent !== null
            })
        } else {
            console.log('❌ 页面未找到竞标按钮')
        }
    } else {
        console.log('❌ 页面未找到任务卡片')
    }
}

// 强制显示竞标按钮（用于测试）
function forceShowBidButtons() {
    console.log('🔧 强制显示竞标按钮...')

    const taskCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div')

    taskCards.forEach((card, index) => {
        // 查找或创建竞标按钮
        let bidButton = card.querySelector('button[data-bid-button]')

        if (!bidButton) {
            bidButton = document.createElement('button')
            bidButton.setAttribute('data-bid-button', 'true')
            bidButton.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors'
            bidButton.textContent = '立即竞标'
            bidButton.onclick = (e) => {
                e.stopPropagation()
                console.log(`🎯 点击竞标按钮，任务卡片 ${index + 1}`)
            }

            // 插入到操作按钮区域
            const actionArea = card.querySelector('.flex.items-center.gap-2')
            if (actionArea) {
                actionArea.appendChild(bidButton)
                console.log(`✅ 为任务卡片 ${index + 1} 添加竞标按钮`)
            }
        }
    })
}

// 导出函数
window.debugTasksBidding = debugTasksBidding
window.debugSpecificTask = debugSpecificTask
window.forceShowBidButtons = forceShowBidButtons

console.log('🔧 任务竞标调试脚本加载完成')
console.log('💡 可用的调试函数:')
console.log('  - debugTasksBidding() - 调试所有任务的竞标条件')
console.log('  - debugSpecificTask(taskId) - 调试特定任务')
console.log('  - forceShowBidButtons() - 强制显示竞标按钮(测试用)') 