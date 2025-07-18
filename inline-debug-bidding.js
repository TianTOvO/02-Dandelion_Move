// 内联竞标按钮调试脚本 - 直接复制到浏览器控制台运行

(function () {
    console.log('🔧 开始调试竞标按钮显示问题...')

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

    // 统计任务状态
    const statusCount = {}
    dataStore.tasks.forEach(task => {
        statusCount[task.status] = (statusCount[task.status] || 0) + 1
    })

    console.log('📊 任务状态统计:')
    Object.entries(statusCount).forEach(([status, count]) => {
        const statusText = getStatusText(parseInt(status))
        console.log(`  - 状态 ${status} (${statusText}): ${count} 个`)
    })

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

    // 辅助函数
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

    function getBidsByTask(taskId) {
        const dataStore = window.dataStore || window.useDataStore?.()
        return dataStore.getBidsByTaskId ? dataStore.getBidsByTaskId(taskId) || [] : []
    }

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

    console.log('\n🎯 调试完成！请查看上面的分析结果。')
})(); 