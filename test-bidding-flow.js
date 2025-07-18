// 测试竞标流程脚本
console.log('🎯 开始测试竞标流程...')

// 导入必要的模块
import { AptosClient, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'
import { CONTRACT_ADDRESS, DEFAULT_NETWORK } from './frontend/src/utils/aptosConfig.js'

// 配置
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com'
const client = new AptosClient(NODE_URL)

// 测试账户（请替换为您的私钥）
const PRIVATE_KEY = 'your_private_key_here' // 请替换为您的私钥
const account = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(PRIVATE_KEY) })

console.log('🔑 测试账户地址:', account.accountAddress.toString())

// 构建交易载荷
function buildTransactionPayload(contractAddress, moduleName, functionName, typeArgs, args) {
    return {
        function: `${contractAddress}::${moduleName}::${functionName}`,
        type_arguments: typeArgs,
        arguments: args
    }
}

// 签名并提交交易
async function signAndSubmitTransaction(payload) {
    const transaction = await client.generateTransaction(account.accountAddress, payload)
    const signedTxn = await client.signTransaction(account, transaction)
    const result = await client.submitTransaction(signedTxn)
    return result
}

// 等待交易确认
async function waitForTransaction(hash) {
    await client.waitForTransaction(hash)
    console.log('✅ 交易确认:', hash)
}

// 1. 创建任务
async function createTask() {
    console.log('\n📝 创建新任务...')

    const payload = buildTransactionPayload(
        CONTRACT_ADDRESS,
        'TaskFactory',
        'create_task',
        [],
        [
            '测试任务', // title
            '这是一个测试任务，用于演示竞标流程', // description
            '100000000', // budget (1 APT in Octa)
            Math.floor(Date.now() / 1000) + 86400 // deadline (24小时后)
        ]
    )

    const result = await signAndSubmitTransaction(payload)
    await waitForTransaction(result.hash)

    console.log('✅ 任务创建成功')
    return result.hash
}

// 2. 获取任务列表
async function getAllTasks() {
    console.log('\n📋 获取所有任务...')

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
    })

    if (!response.ok) {
        throw new Error(`获取任务失败: ${response.status}`)
    }

    const result = await response.json()
    console.log('📄 任务列表:', result)

    return result
}

// 3. 参与竞标
async function participateTask(taskId) {
    console.log(`\n🎯 参与任务竞标，任务ID: ${taskId}...`)

    const payload = buildTransactionPayload(
        CONTRACT_ADDRESS,
        'TaskFactory',
        'participate_task',
        [],
        [taskId.toString()]
    )

    const result = await signAndSubmitTransaction(payload)
    await waitForTransaction(result.hash)

    console.log('✅ 参与竞标成功')
    return result.hash
}

// 4. 选择中标者
async function selectWinner(taskId, winnerAddress) {
    console.log(`\n👑 选择中标者，任务ID: ${taskId}，中标者: ${winnerAddress}...`)

    const payload = buildTransactionPayload(
        CONTRACT_ADDRESS,
        'TaskFactory',
        'select_winner',
        [],
        [taskId.toString(), winnerAddress]
    )

    const result = await signAndSubmitTransaction(payload)
    await waitForTransaction(result.hash)

    console.log('✅ 选择中标者成功')
    return result.hash
}

// 5. 完成任务
async function completeTask(taskId) {
    console.log(`\n✅ 完成任务，任务ID: ${taskId}...`)

    const payload = buildTransactionPayload(
        CONTRACT_ADDRESS,
        'TaskFactory',
        'complete_task',
        [],
        [taskId.toString()]
    )

    const result = await signAndSubmitTransaction(payload)
    await waitForTransaction(result.hash)

    console.log('✅ 任务完成成功')
    return result.hash
}

// 6. 获取单个任务详情
async function getTask(taskId) {
    console.log(`\n🔍 获取任务详情，任务ID: ${taskId}...`)

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
    })

    if (!response.ok) {
        throw new Error(`获取任务失败: ${response.status}`)
    }

    const result = await response.json()
    console.log('📄 任务详情:', result)

    return result[0]
}

// 7. 显示任务状态
function displayTaskStatus(task) {
    const statusMap = {
        0: '开放中',
        1: '进行中',
        2: '已完成',
        3: '争议中',
        4: '已取消'
    }

    console.log('\n📊 任务状态:')
    console.log(`  - 标题: ${task.title}`)
    console.log(`  - 状态: ${statusMap[task.status] || '未知'}`)
    console.log(`  - 创建者: ${task.creator}`)
    console.log(`  - 预算: ${task.budget / 100000000} APT`)
    console.log(`  - 参与者数量: ${task.participants.length}`)
    console.log(`  - 中标者: ${task.winner === '0x0000000000000000000000000000000000000000000000000000000000000000' ? '未选择' : task.winner}`)
    console.log(`  - 参与者: ${task.participants.join(', ') || '无'}`)
}

// 完整的竞标流程测试
async function testBiddingFlow() {
    try {
        console.log('🚀 开始完整的竞标流程测试...')

        // 步骤1: 创建任务
        await createTask()

        // 步骤2: 获取任务列表
        const tasks = await getAllTasks()
        const taskId = tasks.length - 1 // 最新创建的任务

        // 步骤3: 查看任务详情
        const task = await getTask(taskId)
        displayTaskStatus(task)

        // 步骤4: 参与竞标
        await participateTask(taskId)

        // 步骤5: 再次查看任务详情
        const updatedTask = await getTask(taskId)
        displayTaskStatus(updatedTask)

        // 步骤6: 选择中标者（这里选择自己作为中标者进行演示）
        await selectWinner(taskId, account.accountAddress.toString())

        // 步骤7: 查看任务状态变化
        const finalTask = await getTask(taskId)
        displayTaskStatus(finalTask)

        console.log('\n🎉 竞标流程测试完成！')

    } catch (error) {
        console.error('❌ 竞标流程测试失败:', error)
    }
}

// 导出函数供手动调用
window.testBiddingFlow = testBiddingFlow
window.createTask = createTask
window.participateTask = participateTask
window.selectWinner = selectWinner
window.completeTask = completeTask
window.getAllTasks = getAllTasks
window.getTask = getTask

console.log('🔧 竞标流程测试脚本加载完成')
console.log('💡 请先设置您的私钥，然后调用 testBiddingFlow() 开始测试') 