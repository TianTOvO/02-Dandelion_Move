// 修复Aptos合约服务问题脚本
console.log('🔧 开始修复Aptos合约服务问题...')

// 修复Aptos合约服务
async function fixAptosContract() {
    try {
        console.log('🔍 步骤1: 检查Aptos钱包状态...')

        if (!window.aptos) {
            throw new Error('未检测到Aptos钱包')
        }

        const isConnected = await window.aptos.isConnected()
        if (!isConnected) {
            throw new Error('Aptos钱包未连接')
        }

        const account = await window.aptos.account()
        console.log('Aptos账户:', account.address)

        console.log('🔍 步骤2: 检查Vue应用状态...')

        // 获取Vue应用实例
        let vueApp = null
        let web3Store = null
        let dataStore = null

        if (window.__VUE_APP__) {
            vueApp = window.__VUE_APP__
        } else {
            const appElement = document.querySelector('#app')
            if (appElement && appElement.__vue_app__) {
                vueApp = appElement.__vue_app__
            }
        }

        if (vueApp && vueApp.config.globalProperties.$pinia) {
            const pinia = vueApp.config.globalProperties.$pinia
            web3Store = pinia.state.value.web3
            dataStore = pinia.state.value.data
            console.log('✅ 找到Pinia存储')
        }

        if (!web3Store) {
            throw new Error('无法找到web3Store')
        }

        console.log('🔍 步骤3: 修复web3Store状态...')

        // 修复钱包连接状态
        if (!web3Store.isConnected || web3Store.account !== account.address) {
            console.log('⚠️ 修复钱包连接状态...')
            web3Store.isConnected = true
            web3Store.account = account.address
            console.log('✅ 钱包连接状态已修复')
        }

        console.log('🔍 步骤4: 重新初始化Aptos合约服务...')

        // 清理现有的合约服务
        if (web3Store.aptosContractService) {
            console.log('🔄 清理现有合约服务...')
            web3Store.aptosContractService = null
        }

        // 重新创建Aptos合约服务
        try {
            console.log('🔄 创建新的Aptos合约服务...')

            // 动态导入AptosContractService
            const AptosContractService = (await import('/src/utils/aptosContractService.js')).default

            // 创建新的合约服务实例
            web3Store.aptosContractService = new AptosContractService()
            web3Store.aptosContractService.setAccount({ address: account.address })

            console.log('✅ Aptos合约服务创建成功')

        } catch (importError) {
            console.error('❌ 导入AptosContractService失败:', importError)

            // 尝试直接创建合约服务
            console.log('🔄 尝试直接创建合约服务...')

            const CONTRACT_ADDRESS = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b'
            const NODE_URL = 'https://fullnode.testnet.aptoslabs.com'

            // 创建一个简单的合约服务对象
            web3Store.aptosContractService = {
                account: { address: account.address },
                contractAddress: CONTRACT_ADDRESS,
                nodeUrl: NODE_URL,

                // 获取所有任务的方法
                async getAllTasks() {
                    try {
                        const response = await fetch(`${this.nodeUrl}/view`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                function: `${this.contractAddress}::TaskFactory::view_get_all_tasks`,
                                type_arguments: [],
                                arguments: []
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP错误: ${response.status}`)
                        }

                        const result = await response.json()
                        console.log('📋 合约返回结果:', result)

                        if (!result || !Array.isArray(result)) {
                            return []
                        }

                        let tasks = result
                        if (Array.isArray(result[0])) {
                            tasks = result[0]
                        }

                        return tasks.map((task, index) => ({
                            id: index,
                            title: task.title || '未命名任务',
                            status: task.status,
                            reward: task.budget,
                            creator: task.creator,
                            description: task.description,
                            deadline: task.deadline,
                            participants: task.participants || [],
                            winner: task.winner,
                            locked: task.locked || false
                        }));
                    } catch (error) {
                        console.error('❌ 获取任务失败:', error)
                        return []
                    }
                },

                // 获取余额的方法
                async getBalance(address = null) {
                    try {
                        const targetAddress = address || this.account.address
                        const response = await fetch(`${this.nodeUrl}/accounts/${targetAddress}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`)

                        if (!response.ok) {
                            return '0'
                        }

                        const result = await response.json()
                        return result.data.coin.value || '0'
                    } catch (error) {
                        console.error('❌ 获取余额失败:', error)
                        return '0'
                    }
                }
            }

            console.log('✅ 直接创建合约服务成功')
        }

        console.log('🔍 步骤5: 测试合约服务...')

        try {
            const allTasks = await web3Store.aptosContractService.getAllTasks()
            console.log('✅ 合约服务测试成功，任务数量:', allTasks.length)

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

                // 检查用户任务
                const userTasks = allTasks.filter(task =>
                    task.creator && task.creator.toLowerCase() === account.address.toLowerCase()
                )
                console.log('👤 当前用户的任务数量:', userTasks.length)
            }

        } catch (testError) {
            console.error('❌ 合约服务测试失败:', testError)
            throw new Error('合约服务测试失败: ' + testError.message)
        }

        console.log('🔍 步骤6: 更新dataStore...')

        if (dataStore) {
            try {
                // 清空现有任务
                dataStore.tasks = []

                // 重新加载任务
                await dataStore.loadTasksFromContract()

                console.log('✅ dataStore更新成功，任务数量:', dataStore.tasks.length)

            } catch (dataStoreError) {
                console.error('❌ dataStore更新失败:', dataStoreError)
            }
        }

        console.log('✅ Aptos合约服务修复完成')
        return { success: true, message: '修复完成' }

    } catch (error) {
        console.error('❌ 修复失败:', error)
        return { success: false, error: error.message }
    }
}

// 执行修复
fixAptosContract().then(result => {
    if (result.success) {
        console.log('✅ 修复成功:', result.message)
        console.log('💡 请刷新页面查看效果')
    } else {
        console.log('❌ 修复失败:', result.error)
    }
})

// 提供手动修复函数
window.fixAptosContract = fixAptosContract

console.log('✅ Aptos合约服务修复脚本加载完成')
console.log('💡 使用方法:')
console.log('- 自动执行: 脚本已自动运行')
console.log('- 手动修复: 运行 fixAptosContract() 来重新执行修复') 