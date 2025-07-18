// 竞标按钮快速修复脚本
// 在浏览器控制台中运行此脚本

// 主修复函数
async function fixBiddingButtons() {
    console.log('🔧 开始修复竞标按钮显示问题...')

    // 步骤1: 检查环境
    const envCheck = await checkEnvironment()
    if (!envCheck.ok) {
        console.log('❌ 环境检查失败:', envCheck.reason)
        return false
    }

    // 步骤2: 检查任务数据
    const taskCheck = await checkTaskData()
    if (!taskCheck.ok) {
        console.log('❌ 任务数据检查失败:', taskCheck.reason)
        return false
    }

    // 步骤3: 分析竞标按钮显示条件
    const buttonAnalysis = analyzeBiddingButtons()
    console.log('📊 竞标按钮分析结果:', buttonAnalysis)

    // 步骤4: 尝试修复
    const fixResult = await tryFixBiddingButtons()

    return fixResult
}

// 检查环境
async function checkEnvironment() {
    console.log('\n🔍 检查环境...')

    // 检查web3Store
    const web3Store = window.web3Store || window.useWeb3Store?.()
    if (!web3Store) {
        return { ok: false, reason: 'web3Store未找到' }
    }

    // 检查钱包连接
    if (!web3Store.isConnected) {
        return { ok: false, reason: '钱包未连接' }
    }

    // 检查合约服务
    if (!web3Store.aptosContractService) {
        return { ok: false, reason: '合约服务未初始化' }
    }

    // 检查dataStore
    const dataStore = window.dataStore || window.useDataStore?.()
    if (!dataStore) {
        return { ok: false, reason: 'dataStore未找到' }
    }

    console.log('✅ 环境检查通过')
    console.log('  - 钱包地址:', web3Store.account)
    console.log('  - 合约服务:', '已初始化')
    console.log('  - 任务数量:', dataStore.tasks.length)

    return { ok: true }
}

// 检查任务数据
async function checkTaskData() {
    console.log('\n📋 检查任务数据...')

    const dataStore = window.dataStore || window.useDataStore?.()
    const tasks = dataStore.tasks || []

    if (tasks.length === 0) {
        return { ok: false, reason: '没有任务数据' }
    }

    // 统计任务状态
    const statusCount = {}
    tasks.forEach(task => {
        statusCount[task.status] = (statusCount[task.status] || 0) + 1
    })

    console.log('📊 任务状态统计:')
    Object.entries(statusCount).forEach(([status, count]) => {
        const statusText = getStatusText(parseInt(status))
        console.log(`  - 状态 ${status} (${statusText}): ${count} 个`)
    })

    // 检查是否有竞标中的任务
    const biddingTasks = tasks.filter(task => task.status === 1)
    if (biddingTasks.length === 0) {
        return { ok: false, reason: '没有竞标中的任务' }
    }

    console.log(`✅ 找到 ${biddingTasks.length} 个竞标中的任务`)
    return { ok: true, biddingTasks }
}

// 分析竞标按钮显示条件
function analyzeBiddingButtons() {
    console.log('\n🔍 分析竞标按钮显示条件...')

    const web3Store = window.web3Store || window.useWeb3Store?.()
    const dataStore = window.dataStore || window.useDataStore?.()
    const currentUser = web3Store.account

    const tasks = dataStore.tasks.filter(task => task.status === 1)
    const analysis = {
        totalBiddingTasks: tasks.length,
        canBidTasks: 0,
        cannotBidTasks: 0,
        reasons: {}
    }

    tasks.forEach(task => {
        const canBid = checkCanBid(task, web3Store)
        if (canBid.canBid) {
            analysis.canBidTasks++
        } else {
            analysis.cannotBidTasks++
            analysis.reasons[canBid.reason] = (analysis.reasons[canBid.reason] || 0) + 1
        }
    })

    console.log('📊 竞标条件分析:')
    console.log(`  - 竞标中任务: ${analysis.totalBiddingTasks}`)
    console.log(`  - 可以竞标: ${analysis.canBidTasks}`)
    console.log(`  - 不能竞标: ${analysis.cannotBidTasks}`)

    if (analysis.cannotBidTasks > 0) {
        console.log('  - 不能竞标的原因:')
        Object.entries(analysis.reasons).forEach(([reason, count]) => {
            console.log(`    * ${reason}: ${count} 个任务`)
        })
    }

    return analysis
}

// 尝试修复竞标按钮
async function tryFixBiddingButtons() {
    console.log('\n🔧 尝试修复竞标按钮...')

    const web3Store = window.web3Store || window.useWeb3Store?.()
    const dataStore = window.dataStore || window.useDataStore?.()

    // 获取可以竞标的任务
    const tasks = dataStore.tasks.filter(task => task.status === 1)
    const canBidTasks = tasks.filter(task => checkCanBid(task, web3Store).canBid)

    if (canBidTasks.length === 0) {
        console.log('⚠️ 没有可以竞标的任务')
        return false
    }

    console.log(`🎯 找到 ${canBidTasks.length} 个可以竞标的任务`)

    // 检查页面上的按钮
    const taskCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div')
    let fixedCount = 0

    taskCards.forEach((card, index) => {
        const buttons = card.querySelectorAll('button')
        const bidButton = Array.from(buttons).find(btn =>
            btn.textContent.includes('立即竞标') || btn.textContent.includes('竞标')
        )

        if (!bidButton) {
            // 尝试添加竞标按钮
            const actionArea = card.querySelector('.flex.items-center.gap-2')
            if (actionArea) {
                const newBidButton = createBidButton(index)
                actionArea.appendChild(newBidButton)
                fixedCount++
                console.log(`✅ 为任务卡片 ${index + 1} 添加竞标按钮`)
            }
        }
    })

    if (fixedCount > 0) {
        console.log(`🎉 成功修复 ${fixedCount} 个竞标按钮`)
        return true
    } else {
        console.log('ℹ️ 所有竞标按钮都已存在')
        return true
    }
}

// 创建竞标按钮
function createBidButton(cardIndex) {
    const button = document.createElement('button')
    button.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors'
    button.textContent = '立即竞标'
    button.setAttribute('data-bid-button', 'true')
    button.setAttribute('data-card-index', cardIndex)

    button.onclick = async (e) => {
        e.stopPropagation()
        console.log(`🎯 点击竞标按钮，任务卡片 ${cardIndex + 1}`)

        // 获取任务数据
        const dataStore = window.dataStore || window.useDataStore?.()
        const web3Store = window.web3Store || window.useWeb3Store?.()

        if (!dataStore || !web3Store) {
            alert('数据存储未找到')
            return
        }

        const tasks = dataStore.tasks.filter(task => task.status === 1)
        const canBidTasks = tasks.filter(task => checkCanBid(task, web3Store).canBid)

        if (cardIndex < canBidTasks.length) {
            const task = canBidTasks[cardIndex]
            console.log('📄 竞标任务:', task)

            try {
                // 调用竞标函数
                const result = await web3Store.aptosContractService.participateTask(task.id)
                console.log('✅ 竞标成功:', result)
                alert('🎉 竞标成功！')

                // 刷新页面
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            } catch (error) {
                console.error('❌ 竞标失败:', error)
                alert(`竞标失败: ${error.message}`)
            }
        } else {
            alert('任务数据不匹配')
        }
    }

    return button
}

// 检查是否可以竞标
function checkCanBid(task, web3Store) {
    const currentUser = web3Store.account

    if (!currentUser) {
        return { canBid: false, reason: '钱包未连接' }
    }

    if (task.creator && task.creator.toLowerCase() === currentUser.toLowerCase()) {
        return { canBid: false, reason: '自己的任务' }
    }
    if (task.employer && task.employer.toLowerCase() === currentUser.toLowerCase()) {
        return { canBid: false, reason: '自己的任务' }
    }

    if (task.status !== 1) {
        return { canBid: false, reason: `任务状态不是竞标中 (当前状态: ${task.status})` }
    }

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

// 导出函数
window.fixBiddingButtons = fixBiddingButtons

console.log('🔧 竞标按钮修复脚本加载完成')
console.log('💡 运行 fixBiddingButtons() 开始修复') 