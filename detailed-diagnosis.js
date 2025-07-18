// 详细诊断脚本 - 检查合约服务初始化和任务获取问题
console.log('🔍 开始详细诊断合约服务问题...')

// 详细诊断函数
async function detailedDiagnosis() {
    try {
        console.log('🔍 步骤1: 检查Aptos钱包状态...')

        // 检查Aptos钱包
        if (!window.aptos) {
            console.log('❌ 未检测到Aptos钱包')
            return { success: false, error: '未检测到Aptos钱包' }
        }

        const isConnected = await window.aptos.isConnected()
        console.log('Aptos钱包连接状态:', isConnected)

        if (!isConnected) {
            console.log('❌ Aptos钱包未连接')
            return { success: false, error: 'Aptos钱包未连接' }
        }

        const account = await window.aptos.account()
        console.log('Aptos账户:', account.address)

        console.log('🔍 步骤2: 检查Vue应用和存储状态...')

        // 尝试获取Vue应用实例
        let vueApp = null
        let web3Store = null
        let dataStore = null

        // 方法1: 通过全局变量
        if (window.__VUE_APP__) {
            vueApp = window.__VUE_APP__
            console.log('✅ 找到Vue应用实例')
        }

        // 方法2: 通过document查找
        if (!vueApp) {
            const appElement = document.querySelector('#app')
            if (appElement && appElement.__vue_app__) {
                vueApp = appElement.__vue_app__
                console.log('✅ 通过DOM找到Vue应用实例')
            }
        }

        if (vueApp) {
            // 尝试获取Pinia存储
            const pinia = vueApp.config.globalProperties.$pinia
            if (pinia && pinia.state.value) {
                web3Store = pinia.state.value.web3
                dataStore = pinia.state.value.data
                console.log('✅ 找到Pinia存储')

                console.log('web3Store状态:', {
                    isConnected: web3Store?.isConnected,
                    account: web3Store?.account,
                    hasAptosContractService: !!web3Store?.aptosContractService,
                    hasContractService: !!web3Store?.contractService,
                    loading: web3Store?.loading,
                    error: web3Store?.error
                })

                console.log('dataStore状态:', {
                    tasks: dataStore?.tasks?.length || 0,
                    initialized: dataStore?.initialized,
                    error: dataStore?.error
                })
            }
        }

        console.log('🔍 步骤3: 检查合约服务初始化...')

        if (!web3Store) {
            console.log('❌ 无法找到web3Store')
            return { success: false, error: '无法找到web3Store' }
        }

        // 检查钱包连接状态
        if (!web3Store.isConnected || web3Store.account !== account.address) {
            console.log('⚠️ 修复钱包连接状态...')
            web3Store.isConnected = true
            web3Store.account = account.address
            console.log('✅ 钱包连接状态已修复')
        }

        // 检查Aptos合约服务
        if (!web3Store.aptosContractService) {
            console.log('⚠️ 初始化Aptos合约服务...')

            try {
                // 动态导入AptosContractService
                const AptosContractService = (await import('/src/utils/aptosContractService.js')).default

                // 创建新的合约服务实例
                web3Store.aptosContractService = new AptosContractService()
                web3Store.aptosContractService.setAccount({ address: account.address })

                console.log('✅ Aptos合约服务初始化成功')
            } catch (importError) {
                console.error('❌ 导入AptosContractService失败:', importError)
                return { success: false, error: 'Aptos合约服务初始化失败: ' + importError.message }
            }
        } else {
            console.log('✅ Aptos合约服务已存在')
        }

        console.log('🔍 步骤4: 测试合约服务功能...')

        try {
            // 测试获取所有任务
            console.log('📋 测试获取所有任务...')
            const allTasks = await web3Store.aptosContractService.getAllTasks()
            console.log('✅ 获取所有任务成功，数量:', allTasks.length)

            // 显示任务详情
            if (allTasks.length > 0) {
                console.log('📋 任务列表:')
                allTasks.forEach((task, index) => {
                    console.log(`  任务${index + 1}:`, {
                        id: task.id,
                        title: task.title,
                        creator: task.creator,
                        status: task.status,
                        reward: task.reward
                    })
                })

                // 检查是否有当前用户的任务
                const userTasks = allTasks.filter(task =>
                    task.creator.toLowerCase() === account.address.toLowerCase()
                )
                console.log('👤 当前用户的任务数量:', userTasks.length)

                if (userTasks.length > 0) {
                    console.log('👤 用户任务详情:')
                    userTasks.forEach((task, index) => {
                        console.log(`  用户任务${index + 1}:`, {
                            id: task.id,
                            title: task.title,
                            status: task.status,
                            reward: task.reward
                        })
                    })
                }
            } else {
                console.log('📋 合约中没有任务')
            }

        } catch (taskError) {
            console.error('❌ 获取任务失败:', taskError)
            return { success: false, error: '获取任务失败: ' + taskError.message }
        }

        console.log('🔍 步骤5: 检查dataStore任务加载...')

        if (dataStore) {
            try {
                console.log('📋 测试dataStore.getAllTasks()...')
                const dataStoreTasks = await dataStore.getAllTasks()
                console.log('✅ dataStore.getAllTasks()成功，数量:', dataStoreTasks.length)

                // 检查用户任务筛选
                const userDataStoreTasks = dataStoreTasks.filter(task =>
                    task.creator && task.creator.toLowerCase() === account.address.toLowerCase()
                )
                console.log('👤 dataStore中用户任务数量:', userDataStoreTasks.length)

            } catch (dataStoreError) {
                console.error('❌ dataStore.getAllTasks()失败:', dataStoreError)
                return { success: false, error: 'dataStore任务加载失败: ' + dataStoreError.message }
            }
        } else {
            console.log('⚠️ 无法找到dataStore')
        }

        console.log('🔍 步骤6: 检查合约配置...')

        try {
            // 检查合约地址配置
            const contractConfig = await import('/src/utils/contractConfig.js')
            console.log('📋 合约配置:', {
                contractAddress: contractConfig.CONTRACT_ADDRESS,
                modules: contractConfig.CONTRACT_MODULES,
                defaultNetwork: contractConfig.DEFAULT_NETWORK
            })

            // 检查网络配置
            const aptosConfig = await import('/src/utils/aptosConfig.js')
            console.log('📋 网络配置:', {
                networks: aptosConfig.NETWORKS,
                defaultNetwork: aptosConfig.DEFAULT_NETWORK
            })

        } catch (configError) {
            console.error('❌ 检查合约配置失败:', configError)
        }

        console.log('✅ 详细诊断完成')
        return { success: true, message: '诊断完成，所有检查通过' }

    } catch (error) {
        console.error('❌ 详细诊断失败:', error)
        return { success: false, error: error.message }
    }
}

// 执行详细诊断
detailedDiagnosis().then(result => {
    if (result.success) {
        console.log('✅ 详细诊断成功:', result.message)
    } else {
        console.log('❌ 详细诊断失败:', result.error)
    }
})

// 提供手动测试函数
window.testContractService = async function () {
    console.log('🧪 手动测试合约服务...')

    try {
        // 检查Aptos钱包
        if (!window.aptos) {
            throw new Error('未检测到Aptos钱包')
        }

        const isConnected = await window.aptos.isConnected()
        if (!isConnected) {
            throw new Error('Aptos钱包未连接')
        }

        const account = await window.aptos.account()
        console.log('Aptos账户:', account.address)

        // 尝试直接创建AptosContractService
        const AptosContractService = (await import('/src/utils/aptosContractService.js')).default
        const contractService = new AptosContractService()
        contractService.setAccount({ address: account.address })

        console.log('✅ 合约服务创建成功')

        // 测试获取任务
        const tasks = await contractService.getAllTasks()
        console.log('✅ 获取任务成功，数量:', tasks.length)

        return { success: true, tasks: tasks }

    } catch (error) {
        console.error('❌ 测试失败:', error)
        return { success: false, error: error.message }
    }
}

console.log('✅ 详细诊断脚本加载完成')
console.log('💡 使用方法:')
console.log('- 自动执行: 脚本已自动运行')
console.log('- 手动测试: 运行 testContractService() 来测试合约服务')
console.log('- 重新诊断: 运行 detailedDiagnosis() 来重新执行诊断') 