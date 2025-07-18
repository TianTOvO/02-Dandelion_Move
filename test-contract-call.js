// 直接测试合约调用脚本
console.log('🧪 开始直接测试合约调用...')

// 测试合约调用
async function testContractCall() {
    try {
        console.log('🔍 步骤1: 检查Aptos钱包...')

        if (!window.aptos) {
            throw new Error('未检测到Aptos钱包')
        }

        const isConnected = await window.aptos.isConnected()
        if (!isConnected) {
            throw new Error('Aptos钱包未连接')
        }

        const account = await window.aptos.account()
        console.log('Aptos账户:', account.address)

        console.log('🔍 步骤2: 直接调用合约...')

        // 合约配置
        const CONTRACT_ADDRESS = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b'
        const NODE_URL = 'https://fullnode.testnet.aptoslabs.com'

        console.log('📋 合约配置:', {
            contractAddress: CONTRACT_ADDRESS,
            nodeUrl: NODE_URL,
            function: `${CONTRACT_ADDRESS}::TaskFactory::view_get_all_tasks`
        })

        // 直接调用合约
        const response = await fetch(`${NODE_URL}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                function: `${CONTRACT_ADDRESS}::TaskFactory::view_get_all_tasks`,
                type_arguments: [],
                arguments: []
            })
        });

        console.log('📋 HTTP响应状态:', response.status, response.statusText)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ HTTP错误:', errorText)
            throw new Error(`HTTP错误: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('📋 合约返回结果:', result)

        if (!result || !Array.isArray(result)) {
            console.log('⚠️ 返回结果不是数组，尝试解析...')
            console.log('结果类型:', typeof result)
            console.log('结果内容:', result)
            return { success: false, error: '返回结果格式异常' }
        }

        // 处理返回的数据结构
        let tasks = result
        if (Array.isArray(result[0])) {
            tasks = result[0]
            console.log('📋 检测到嵌套数组，提取内部数组')
        }

        console.log(`✅ 成功获取 ${tasks.length} 个任务`)

        // 显示任务详情
        if (tasks.length > 0) {
            console.log('📋 任务详情:')
            tasks.forEach((task, index) => {
                console.log(`  任务${index + 1}:`, {
                    creator: task.creator,
                    title: task.title,
                    description: task.description,
                    budget: task.budget,
                    deadline: task.deadline,
                    status: task.status,
                    participants: task.participants?.length || 0,
                    winner: task.winner,
                    locked: task.locked
                })
            })

            // 检查用户任务
            const userTasks = tasks.filter(task =>
                task.creator && task.creator.toLowerCase() === account.address.toLowerCase()
            )
            console.log('👤 当前用户的任务数量:', userTasks.length)

            if (userTasks.length > 0) {
                console.log('👤 用户任务详情:')
                userTasks.forEach((task, index) => {
                    console.log(`  用户任务${index + 1}:`, {
                        title: task.title,
                        budget: task.budget,
                        status: task.status,
                        deadline: new Date(task.deadline * 1000).toLocaleString()
                    })
                })
            }
        } else {
            console.log('📋 合约中没有任务')
        }

        return { success: true, tasks: tasks }

    } catch (error) {
        console.error('❌ 测试失败:', error)
        return { success: false, error: error.message }
    }
}

// 测试获取单个任务
async function testGetSingleTask(taskId = 0) {
    try {
        console.log(`🔍 测试获取单个任务，ID: ${taskId}`)

        const CONTRACT_ADDRESS = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b'
        const NODE_URL = 'https://fullnode.testnet.aptoslabs.com'

        const response = await fetch(`${NODE_URL}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                function: `${CONTRACT_ADDRESS}::TaskFactory::view_get_task`,
                type_arguments: [],
                arguments: [taskId.toString()]
            })
        });

        console.log('📋 HTTP响应状态:', response.status, response.statusText)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ HTTP错误:', errorText)
            throw new Error(`HTTP错误: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('📋 单个任务结果:', result)

        return { success: true, task: result }

    } catch (error) {
        console.error('❌ 获取单个任务失败:', error)
        return { success: false, error: error.message }
    }
}

// 测试合约部署状态
async function testContractDeployment() {
    try {
        console.log('🔍 测试合约部署状态...')

        const CONTRACT_ADDRESS = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b'
        const NODE_URL = 'https://fullnode.testnet.aptoslabs.com'

        // 检查账户资源
        const response = await fetch(`${NODE_URL}/accounts/${CONTRACT_ADDRESS}/resources`)

        if (!response.ok) {
            throw new Error(`检查账户资源失败: ${response.status}`)
        }

        const resources = await response.json()
        console.log('📋 账户资源:', resources)

        // 查找TaskFactoryState资源
        const taskFactoryResource = resources.find(r =>
            r.type.includes('TaskFactoryState')
        )

        if (taskFactoryResource) {
            console.log('✅ 找到TaskFactoryState资源')
            console.log('📋 资源数据:', taskFactoryResource.data)
        } else {
            console.log('❌ 未找到TaskFactoryState资源')
        }

        return { success: true, resources: resources }

    } catch (error) {
        console.error('❌ 检查合约部署状态失败:', error)
        return { success: false, error: error.message }
    }
}

// 执行测试
console.log('🚀 开始执行合约调用测试...')

// 测试1: 检查合约部署状态
testContractDeployment().then(result => {
    if (result.success) {
        console.log('✅ 合约部署状态检查完成')

        // 测试2: 获取所有任务
        return testContractCall()
    } else {
        console.log('❌ 合约部署状态检查失败:', result.error)
    }
}).then(result => {
    if (result && result.success) {
        console.log('✅ 获取所有任务测试完成')

        // 如果有任务，测试获取第一个任务
        if (result.tasks && result.tasks.length > 0) {
            return testGetSingleTask(0)
        }
    } else if (result) {
        console.log('❌ 获取所有任务测试失败:', result.error)
    }
}).then(result => {
    if (result && result.success) {
        console.log('✅ 获取单个任务测试完成')
    } else if (result) {
        console.log('❌ 获取单个任务测试失败:', result.error)
    }
}).catch(error => {
    console.error('❌ 测试过程出错:', error)
})

// 提供手动测试函数
window.testContractCall = testContractCall
window.testGetSingleTask = testGetSingleTask
window.testContractDeployment = testContractDeployment

console.log('✅ 合约调用测试脚本加载完成')
console.log('💡 使用方法:')
console.log('- 自动执行: 脚本已自动运行')
console.log('- 手动测试: 运行 testContractCall() 来测试获取所有任务')
console.log('- 单个任务: 运行 testGetSingleTask(0) 来测试获取单个任务')
console.log('- 部署状态: 运行 testContractDeployment() 来检查合约部署状态') 