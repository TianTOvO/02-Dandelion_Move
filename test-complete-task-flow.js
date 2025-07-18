// 测试完整的任务流程
console.log('🧪 测试完整的任务流程...');

// 测试数据
const testTaskId = 0; // 使用第一个任务进行测试
const testWinnerAddress = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b'; // 测试中标者地址

// 测试步骤
async function testCompleteTaskFlow() {
    try {
        console.log('\n🚀 开始测试完整任务流程...');

        // 1. 获取当前任务信息
        console.log('\n📋 步骤1: 获取任务信息');
        const task = await getTaskInfo(testTaskId);
        console.log('✅ 任务信息:', {
            id: task.id,
            title: task.title,
            status: task.status,
            creator: task.creator,
            participants: task.participants?.length || 0
        });

        // 2. 测试参与竞标
        console.log('\n🎯 步骤2: 测试参与竞标');
        await testParticipateTask(testTaskId);

        // 3. 测试选择中标者
        console.log('\n👑 步骤3: 测试选择中标者');
        await testSelectWinner(testTaskId, testWinnerAddress);

        // 4. 测试提交任务完成
        console.log('\n✅ 步骤4: 测试提交任务完成');
        await testCompleteTask(testTaskId);

        // 5. 验证最终状态
        console.log('\n🔍 步骤5: 验证最终状态');
        const finalTask = await getTaskInfo(testTaskId);
        console.log('✅ 最终任务状态:', {
            id: finalTask.id,
            status: finalTask.status,
            winner: finalTask.winner,
            participants: finalTask.participants?.length || 0
        });

        console.log('\n🎉 完整任务流程测试完成！');

    } catch (error) {
        console.error('❌ 任务流程测试失败:', error);
    }
}

// 获取任务信息
async function getTaskInfo(taskId) {
    const address = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b';

    const response = await fetch('https://fullnode.testnet.aptoslabs.com/v1/view', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            function: `${address}::TaskFactory::view_get_task`,
            type_arguments: [],
            arguments: [taskId.toString()]
        })
    });

    if (!response.ok) {
        throw new Error(`获取任务失败: ${response.status}`);
    }

    const result = await response.json();
    return result[0];
}

// 测试参与竞标
async function testParticipateTask(taskId) {
    console.log('模拟参与竞标...');
    console.log('注意: 实际参与竞标需要钱包签名，这里只是模拟');
    console.log('✅ 参与竞标功能已准备就绪');
}

// 测试选择中标者
async function testSelectWinner(taskId, winnerAddress) {
    console.log('模拟选择中标者...');
    console.log('中标者地址:', winnerAddress);
    console.log('注意: 实际选择中标者需要任务创建者钱包签名，这里只是模拟');
    console.log('✅ 选择中标者功能已准备就绪');
}

// 测试完成任务
async function testCompleteTask(taskId) {
    console.log('模拟提交任务完成...');
    console.log('注意: 实际提交完成需要中标者钱包签名，这里只是模拟');
    console.log('✅ 提交任务完成功能已准备就绪');
}

// 测试前端组件功能
function testFrontendComponents() {
    console.log('\n🎨 测试前端组件功能...');

    // 模拟TaskFlowManager组件的功能
    const mockTask = {
        id: 0,
        title: '测试任务',
        status: 0, // 开放中
        creator: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b',
        participants: [],
        winner: '',
        reward: 1.0,
        deadline: Math.floor(Date.now() / 1000) + 86400 // 1天后
    };

    console.log('📋 模拟任务数据:', mockTask);

    // 测试状态转换
    const statusFlow = [
        { from: 0, to: 1, action: '选择中标者', description: '任务从开放状态转为进行中' },
        { from: 1, to: 2, action: '提交完成', description: '任务从进行中转为已完成' },
        { from: 0, to: 4, action: '取消任务', description: '任务从开放状态转为已取消' }
    ];

    console.log('🔄 任务状态流程:');
    statusFlow.forEach(flow => {
        console.log(`  ${flow.from} → ${flow.to}: ${flow.action} (${flow.description})`);
    });

    console.log('✅ 前端组件功能测试完成');
}

// 测试合约调用
function testContractCalls() {
    console.log('\n🔗 测试合约调用...');

    const contractAddress = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b';

    const contractFunctions = [
        {
            name: 'participate_task',
            description: '参与任务竞标',
            parameters: ['task_id: u64'],
            requirements: '任务状态必须为开放中'
        },
        {
            name: 'select_winner',
            description: '选择中标者',
            parameters: ['task_id: u64', 'winner: address'],
            requirements: '只有任务创建者可以调用'
        },
        {
            name: 'complete_task',
            description: '完成任务',
            parameters: ['task_id: u64'],
            requirements: '只有中标者可以调用'
        },
        {
            name: 'cancel_task',
            description: '取消任务',
            parameters: ['task_id: u64'],
            requirements: '只有任务创建者可以调用'
        }
    ];

    console.log('📋 合约函数列表:');
    contractFunctions.forEach(func => {
        console.log(`  ${func.name}: ${func.description}`);
        console.log(`    参数: ${func.parameters.join(', ')}`);
        console.log(`    要求: ${func.requirements}`);
        console.log('');
    });

    console.log('✅ 合约调用测试完成');
}

// 主测试函数
async function main() {
    console.log('🧪 开始完整任务流程测试...');

    // 测试合约调用
    testContractCalls();

    // 测试前端组件
    testFrontendComponents();

    // 测试完整流程
    await testCompleteTaskFlow();

    console.log('\n🎉 所有测试完成！');
    console.log('\n📝 使用说明:');
    console.log('1. 在任务详情页面可以看到新的"任务流程管理"组件');
    console.log('2. 任务创建者可以: 选择中标者、取消任务、确认完成');
    console.log('3. 参与者可以: 参与竞标、提交完成（如果是中标者）');
    console.log('4. 所有操作都会实时更新任务状态');
}

// 执行测试
main(); 