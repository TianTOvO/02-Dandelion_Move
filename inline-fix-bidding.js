// 内联竞标按钮修复脚本 - 直接复制到浏览器控制台运行

(function () {
    console.log('🔧 开始修复竞标按钮显示问题...')

    // 获取web3Store
    const web3Store = window.web3Store || window.useWeb3Store?.()
    if (!web3Store) {
        console.error('❌ web3Store未找到')
        return
    }

    // 获取dataStore
    const dataStore = window.dataStore || window.useDataStore?.()
    if (!dataStore) {
        console.error('❌ dataStore未找到')
        return
    }

    console.log('✅ 环境检查通过')
    console.log('  - 钱包地址:', web3Store.account)
    console.log('  - 任务数量:', dataStore.tasks.length)

    // 获取可以竞标的任务
    const tasks = dataStore.tasks.filter(task => task.status === 1)
    const canBidTasks = tasks.filter(task => checkCanBid(task, web3Store).canBid)

    if (canBidTasks.length === 0) {
        console.log('⚠️ 没有可以竞标的任务')
        return
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
                const newBidButton = createBidButton(index, canBidTasks)
                actionArea.appendChild(newBidButton)
                fixedCount++
                console.log(`✅ 为任务卡片 ${index + 1} 添加竞标按钮`)
            }
        } else {
            console.log(`ℹ️ 任务卡片 ${index + 1} 已有竞标按钮`)
        }
    })

    if (fixedCount > 0) {
        console.log(`🎉 成功修复 ${fixedCount} 个竞标按钮`)
    } else {
        console.log('ℹ️ 所有竞标按钮都已存在')
    }

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

    function createBidButton(cardIndex, canBidTasks) {
        const button = document.createElement('button')
        button.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors'
        button.textContent = '立即竞标'
        button.setAttribute('data-bid-button', 'true')
        button.setAttribute('data-card-index', cardIndex)

        button.onclick = async (e) => {
            e.stopPropagation()
            console.log(`🎯 点击竞标按钮，任务卡片 ${cardIndex + 1}`)

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

    console.log('\n🎯 修复完成！')
})(); 