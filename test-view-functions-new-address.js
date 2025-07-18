// 测试view函数 - 使用新地址
async function testViewFunctions() {
    const address = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b';

    try {
        console.log('测试view函数...');
        console.log('使用地址:', address);

        // 测试 view_get_all_tasks
        console.log('\n1. 测试 view_get_all_tasks...');
        const response1 = await fetch('https://fullnode.testnet.aptoslabs.com/v1/view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                function: `${address}::TaskFactory::view_get_all_tasks`,
                type_arguments: [],
                arguments: []
            })
        });

        if (response1.ok) {
            const result1 = await response1.json();
            console.log('✅ view_get_all_tasks 调用成功!');
            console.log('返回结果:', result1);

            if (Array.isArray(result1) && result1.length > 0) {
                console.log('任务数量:', result1.length);
                console.log('第一个任务:', result1[0]);
            } else {
                console.log('任务列表为空');
            }
        } else {
            const errorText1 = await response1.text();
            console.error('❌ view_get_all_tasks 调用失败:', errorText1);
        }

        // 测试 view_get_task
        console.log('\n2. 测试 view_get_task...');
        const response2 = await fetch('https://fullnode.testnet.aptoslabs.com/v1/view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                function: `${address}::TaskFactory::view_get_task`,
                type_arguments: [],
                arguments: ['0']
            })
        });

        if (response2.ok) {
            const result2 = await response2.json();
            console.log('✅ view_get_task 调用成功!');
            console.log('返回结果:', result2);
        } else {
            const errorText2 = await response2.text();
            console.error('❌ view_get_task 调用失败:', errorText2);
        }

    } catch (error) {
        console.error('测试失败:', error);
    }
}

testViewFunctions(); 