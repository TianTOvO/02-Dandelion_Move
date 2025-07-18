// 修复store全局访问并检查竞标按钮
// 直接复制到浏览器控制台运行

(function () {
    console.log('🔧 开始修复store全局访问...')

    // 等待Vue应用完全加载
    function waitForVue() {
        return new Promise((resolve) => {
            const checkVue = () => {
                const appElement = document.querySelector('#app') || document.querySelector('[data-v-app]')
                if (appElement && appElement.__vue_app__) {
                    console.log('✅ Vue应用已加载')
                    resolve(appElement.__vue_app__)
                } else {
                    console.log('⏳ 等待Vue应用加载...')
                    setTimeout(checkVue, 100)
                }
            }
            checkVue()
        })
    }

    // 获取store实例
    async function getStores() {
        try {
            // 等待Vue应用加载
            const vueApp = await waitForVue()

            // 尝试获取Pinia实例
            const pinia = vueApp._context.provides.pinia
            if (!pinia) {
                console.error('❌ Pinia未找到')
                return null
            }

            console.log('✅ Pinia实例已找到')

            // 获取store实例
            const web3Store = pinia._s.get('web3')
            const dataStore = pinia._s.get('data')

            if (web3Store) {
                console.log('✅ web3Store已找到')
                window.web3Store = web3Store
            } else {
                console.error('❌ web3Store未找到')
            }

            if (dataStore) {
                console.log('✅ dataStore已找到')
                window.dataStore = dataStore
            } else {
                console.error('❌ dataStore未找到')
            }

            return { web3Store, dataStore }
        } catch (error) {
            console.error('❌ 获取store失败:', error)
            return null
        }
    }

    // 检查竞标按钮
    function checkBiddingButtons() {
        console.log('\n🔍 检查竞标按钮...')

        // 检查任务卡片
        const taskCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div')
        console.log(`📋 找到 ${taskCards.length} 个任务卡片`)

        if (taskCards.length === 0) {
            console.log('⚠️ 没有找到任务卡片')
            return
        }

        // 检查每个任务卡片的按钮
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

            // 获取所有按钮
            const buttons = card.querySelectorAll('button')
            console.log(`  - 按钮数量: ${buttons.length}`)

            buttons.forEach((btn, btnIndex) => {
                const text = btn.textContent.trim()
                console.log(`    - 按钮 ${btnIndex + 1}: "${text}" (${btn.disabled ? '禁用' : '可用'})`)

                if (text.includes('竞标') || text.includes('Bid')) {
                    console.log(`    🎯 找到竞标按钮: "${text}"`)
                }
            })

            // 检查操作按钮区域
            const actionArea = card.querySelector('.flex.items-center.gap-2')
            if (actionArea) {
                console.log(`  - 操作区域: 已找到`)
                const actionButtons = actionArea.querySelectorAll('button')
                console.log(`    - 操作按钮数量: ${actionButtons.length}`)
            } else {
                console.log(`  - 操作区域: 未找到`)
            }
        })
    }

    // 分析竞标按钮显示条件
    function analyzeBiddingConditions(stores) {
        if (!stores || !stores.web3Store || !stores.dataStore) {
            console.log('⚠️ 无法分析竞标条件，store未找到')
            return
        }

        console.log('\n🔍 分析竞标按钮显示条件...')

        const web3Store = stores.web3Store
        const dataStore = stores.dataStore

        console.log('📊 环境状态:')
        console.log(`  - 钱包连接: ${web3Store.isConnected ? '✅ 已连接' : '❌ 未连接'}`)
        console.log(`  - 账户地址: ${web3Store.account || '未设置'}`)
        console.log(`  - 合约服务: ${web3Store.aptosContractService ? '✅ 已初始化' : '❌ 未初始化'}`)
        console.log(`  - 任务数量: ${dataStore.tasks.length}`)

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

        // 检查竞标中的任务
        const biddingTasks = dataStore.tasks.filter(task => task.status === 1)
        console.log(`\n🎯 竞标中任务: ${biddingTasks.length} 个`)

        if (biddingTasks.length === 0) {
            console.log('⚠️ 没有竞标中的任务，这是竞标按钮不显示的主要原因')
            return
        }

        // 检查每个竞标中任务的竞标条件
        biddingTasks.forEach((task, index) => {
            console.log(`\n📄 竞标任务 ${index + 1} (ID: ${task.id}):`)
            console.log(`  - 标题: ${task.title}`)
            console.log(`  - 创建者: ${task.creator}`)
            console.log(`  - 当前用户: ${web3Store.account}`)

            const canBid = checkCanBid(task, web3Store)
            console.log(`  - 可以竞标: ${canBid.canBid ? '✅ 是' : '❌ 否'}`)
            if (!canBid.canBid) {
                console.log(`    - 原因: ${canBid.reason}`)
            }
        })
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

        // 检查是否已经竞标（简化检查）
        const participants = task.participants || []
        const hasAlreadyBid = participants.some(p =>
            p.toLowerCase() === currentUser.toLowerCase()
        )

        if (hasAlreadyBid) {
            return { canBid: false, reason: '已经竞标过' }
        }

        return { canBid: true, reason: '可以竞标' }
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

    // 主执行函数
    async function main() {
        console.log('🚀 开始修复和诊断...')

        // 获取store
        const stores = await getStores()

        // 检查竞标按钮
        checkBiddingButtons()

        // 分析竞标条件
        analyzeBiddingConditions(stores)

        console.log('\n🎯 修复和诊断完成！')
        console.log('💡 现在可以通过以下方式访问store:')
        console.log('  - window.web3Store')
        console.log('  - window.dataStore')
    }

    // 执行主函数
    main().catch(error => {
        console.error('❌ 执行失败:', error)
    })
})(); 