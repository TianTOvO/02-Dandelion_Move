// 调试合约返回的原始数据结构
console.log('🔍 调试合约返回的原始数据结构...');

(async function () {
    try {
        // 等待页面加载完成
        if (!window.pinia) {
            console.log('⏳ 等待Pinia实例加载...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        if (!window.pinia) {
            console.error('❌ Pinia实例未找到');
            return;
        }

        console.log('✅ Pinia实例已找到');

        // 动态导入store
        const { useWeb3Store } = await import('/src/stores/web3.js');
        const web3Store = useWeb3Store();

        console.log('🔄 获取合约原始数据...');

        // 直接从合约获取原始数据
        if (web3Store.aptosContractService) {
            try {
                // 直接调用合约API，不经过aptosContractService的处理
                const response = await fetch(`${web3Store.aptosContractService.nodeUrl}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        function: `${web3Store.aptosContractService.contractAddress}::TaskFactory::view_get_all_tasks`,
                        type_arguments: [],
                        arguments: []
                    })
                });

                if (!response.ok) {
                    throw new Error(`获取任务失败: ${response.status}`);
                }

                const result = await response.json();
                console.log('📄 合约返回的原始数据:', result);

                if (!result || !Array.isArray(result)) {
                    console.log('⚠️ 合约返回的数据格式异常');
                    return;
                }

                // 处理返回的数据结构
                let tasks = result;
                if (Array.isArray(result[0])) {
                    tasks = result[0];
                }

                console.log(`✅ 从合约获取到 ${tasks.length} 个任务`);

                // 详细分析第一个任务的数据结构
                if (tasks.length > 0) {
                    const firstTask = tasks[0];
                    console.log('\n🎯 第一个任务的详细数据结构:');
                    console.log('  - 完整对象:', firstTask);
                    console.log('  - 所有字段:', Object.keys(firstTask));

                    // 检查每个字段
                    Object.keys(firstTask).forEach(key => {
                        const value = firstTask[key];
                        console.log(`  - ${key}:`, value, `(类型: ${typeof value})`);

                        // 如果是字符串，检查是否是Move字符串格式
                        if (typeof value === 'object' && value !== null) {
                            console.log(`    - ${key} 是对象:`, value);
                            if (value.bytes && Array.isArray(value.bytes)) {
                                console.log(`    - ${key} 是Move字符串格式`);
                            }
                        }
                    });

                    // 测试aptosContractService的处理
                    console.log('\n🔧 测试aptosContractService处理:');
                    const processedTasks = await web3Store.aptosContractService.getAllTasks();
                    if (processedTasks.length > 0) {
                        const processedTask = processedTasks[0];
                        console.log('  - 处理后的任务:', processedTask);
                        console.log('  - 处理后的字段:', Object.keys(processedTask));
                    }
                }

            } catch (error) {
                console.error('❌ 获取合约数据失败:', error);
            }
        } else {
            console.error('❌ 合约服务未初始化');
        }

    } catch (error) {
        console.error('❌ 调试失败:', error);
    }
})(); 