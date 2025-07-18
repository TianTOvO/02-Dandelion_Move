// 修复任务数据获取问题脚本
// 直接复制到浏览器控制台运行

(function () {
    console.log('🔧 开始修复任务数据获取问题...')

    // 等待Vue应用加载并获取store
    async function getStores() {
        return new Promise((resolve) => {
            const checkVue = () => {
                const appElement = document.querySelector('#app')
                if (appElement && appElement.__vue_app__) {
                    try {
                        const vueApp = appElement.__vue_app__
                        const pinia = vueApp._context.provides.pinia

                        if (pinia) {
                            const web3Store = pinia._s.get('web3')
                            const dataStore = pinia._s.get('data')

                            if (web3Store && dataStore) {
                                console.log('✅ 成功获取store实例')
                                resolve({ web3Store, dataStore })
                                return
                            }
                        }
                    } catch (error) {
                        console.log('⏳ 等待store初始化...')
                    }
                }
                setTimeout(checkVue, 100)
            }
            checkVue()
        })
    }

    // 诊断任务数据问题
    async function diagnoseTaskData(stores) {
        console.log('\n🔍 诊断任务数据问题...')

        const { web3Store, dataStore } = stores

        // 检查环境状态
        console.log('📊 环境状态:')
        console.log(`  - 钱包连接: ${web3Store.isConnected ? '✅ 已连接' : '❌ 未连接'}`)
        console.log(`  - 账户地址: ${web3Store.account || '未设置'}`)
        console.log(`  - 合约服务: ${web3Store.aptosContractService ? '✅ 已初始化' : '❌ 未初始化'}`)
        console.log(`  - 任务数量: ${dataStore.tasks.length}`)

        if (!web3Store.isConnected) {
            console.log('❌ 钱包未连接，无法获取任务数据')
            return false
        }

        if (!web3Store.aptosContractService) {
            console.log('❌ 合约服务未初始化')
            return false
        }

        // 尝试从合约获取任务数据
        console.log('\n📋 尝试从合约获取任务数据...')
        try {
            const tasks = await web3Store.aptosContractService.getAllTasks()
            console.log(`✅ 从合约获取到 ${tasks.length} 个任务`)

            if (tasks.length === 0) {
                console.log('⚠️ 合约中没有任务数据')
                console.log('💡 建议: 先创建一些测试任务')
                return false
            }

            // 显示任务详情
            tasks.forEach((task, index) => {
                console.log(`\n📄 任务 ${index + 1}:`)
                console.log(`  - ID: ${task.id}`)
                console.log(`  - 标题: ${task.title}`)
                console.log(`  - 状态: ${task.status}`)
                console.log(`  - 创建者: ${task.creator}`)
                console.log(`  - 奖励: ${task.reward} APT`)
            })

            return true
        } catch (error) {
            console.error('❌ 获取任务数据失败:', error)
            return false
        }
    }

    // 强制刷新任务数据
    async function forceRefreshTasks(stores) {
        console.log('\n🔄 强制刷新任务数据...')

        const { dataStore } = stores

        try {
            // 尝试调用dataStore的刷新方法
            if (dataStore.refreshTasks) {
                console.log('📋 调用dataStore.refreshTasks()...')
                await dataStore.refreshTasks()
            } else if (dataStore.loadTasks) {
                console.log('📋 调用dataStore.loadTasks()...')
                await dataStore.loadTasks()
            } else {
                console.log('⚠️ 未找到刷新方法，尝试手动刷新...')
                // 手动刷新页面
                window.location.reload()
                return
            }

            console.log('✅ 任务数据刷新完成')
        } catch (error) {
            console.error('❌ 刷新任务数据失败:', error)
        }
    }

    // 创建测试任务（如果需要）
    async function createTestTask(stores) {
        console.log('\n🧪 创建测试任务...')

        const { web3Store } = stores

        if (!web3Store.isConnected || !web3Store.aptosContractService) {
            console.log('❌ 无法创建测试任务，钱包未连接或合约服务未初始化')
            return false
        }

        try {
            console.log('📝 创建测试任务...')

            // 创建测试任务数据
            const testTask = {
                title: '测试任务 - 前端开发',
                description: '这是一个测试任务，用于验证任务创建和竞标功能。',
                reward: 1, // 1 APT
                deadline: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天后
                taskType: 1, // Web3开发
                biddingPeriod: 3 * 24 * 60 * 60, // 3天竞标期
                developmentPeriod: 7 * 24 * 60 * 60 // 7天开发期
            }

            console.log('📄 测试任务数据:', testTask)

            // 调用合约创建任务
            const result = await web3Store.aptosContractService.createTask(
                testTask.title,
                'test-ipfs-hash', // 模拟IPFS哈希
                testTask.reward * 100000000, // 转换为Octa
                testTask.deadline,
                testTask.taskType,
                testTask.biddingPeriod,
                testTask.developmentPeriod
            )

            console.log('✅ 测试任务创建成功:', result)
            return true
        } catch (error) {
            console.error('❌ 创建测试任务失败:', error)
            return false
        }
    }

    // 检查竞标按钮显示条件
    function checkBiddingConditions(stores) {
        console.log('\n🎯 检查竞标按钮显示条件...')

        const { web3Store, dataStore } = stores

        if (dataStore.tasks.length === 0) {
            console.log('⚠️ 没有任务数据，无法检查竞标条件')
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
            console.log('⚠️ 没有竞标中的任务，这是竞标按钮不显示的原因')
            console.log('💡 建议: 启动一些任务的竞标期')
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
        console.log('🚀 开始修复任务数据获取问题...')

        // 获取store
        const stores = await getStores()

        // 诊断问题
        const hasTasks = await diagnoseTaskData(stores)

        if (!hasTasks) {
            console.log('\n💡 没有任务数据，尝试创建测试任务...')
            const created = await createTestTask(stores)

            if (created) {
                console.log('✅ 测试任务创建成功，等待页面刷新...')
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
                return
            }
        }

        // 强制刷新任务数据
        await forceRefreshTasks(stores)

        // 检查竞标条件
        checkBiddingConditions(stores)

        console.log('\n🎯 修复完成！')
        console.log('💡 如果问题仍然存在，请:')
        console.log('  1. 检查网络连接')
        console.log('  2. 确认合约已正确部署')
        console.log('  3. 检查钱包余额是否充足')
        console.log('  4. 查看控制台是否有其他错误')
    }

    // 执行主函数
    main().catch(error => {
        console.error('❌ 执行失败:', error)
    })
})(); 