// 测试前端配置更新
console.log('测试前端配置更新...');

// 模拟导入配置
const CONTRACT_ADDRESS = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b';

console.log('✅ 合约地址已更新为:', CONTRACT_ADDRESS);

// 测试合约调用
async function testFrontendContractCall() {
    try {
        console.log('\n测试前端合约调用...');

        // 测试 view_get_all_tasks
        const response = await fetch('https://fullnode.testnet.aptoslabs.com/v1/view', {
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

        if (response.ok) {
            const result = await response.json();
            console.log('✅ 前端合约调用成功!');
            console.log('任务数量:', result.length);

            if (result.length > 0) {
                console.log('第一个任务:', result[0]);
            }
        } else {
            const errorText = await response.text();
            console.error('❌ 前端合约调用失败:', errorText);
        }

    } catch (error) {
        console.error('测试失败:', error);
    }
}

testFrontendContractCall(); 