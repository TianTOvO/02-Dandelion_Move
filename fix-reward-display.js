// 完整修复奖金显示问题
console.log('🔧 完整修复奖金显示问题...');

async function fixRewardDisplay() {
    try {
        // 步骤1: 暴露store到全局
        console.log('🔄 步骤1: 暴露store到全局...');

        // 检查Pinia实例
        if (window.pinia) {
            console.log('✅ Pinia实例已找到');

            // 动态导入store
            const { useWeb3Store } = await import('/src/stores/web3.js');
            const { useDataStore } = await import('/src/stores/data.js');
            const { useWalletStore } = await import('/src/stores/wallet.js');
            const { useIpfsStore } = await import('/src/stores/ipfs.js');

            // 创建store实例
            const web3Store = useWeb3Store();
            const dataStore = useDataStore();
            const walletStore = useWalletStore();
            const ipfsStore = useIpfsStore();

            // 暴露到全局
            window.web3Store = web3Store;
            window.dataStore = dataStore;
            window.walletStore = walletStore;
            window.ipfsStore = ipfsStore;

            console.log('✅ Store已暴露到全局');
        } else {
            console.error('❌ Pinia实例未找到');
            return;
        }

        // 步骤2: 修复dataStore中的formatTaskFromContract方法
        console.log('🔄 步骤2: 修复奖金转换逻辑...');

        // 保存原始方法
        const originalFormatTaskFromContract = window.dataStore.formatTaskFromContract;

        // 重写formatTaskFromContract方法，添加奖金转换
        window.dataStore.formatTaskFromContract = async function (contractTask) {
            console.log(`📄 格式化合约任务数据:`, contractTask);

            // 解码 Move 字符串
            const decodedTitle = this.decodeMoveString(contractTask.title);
            const decodedDescription = this.decodeMoveString(contractTask.description);

            console.log(`🔍 解码后的标题: "${decodedTitle}"`);
            console.log(`🔍 解码后的描述: "${decodedDescription}"`);

            // 处理IPFS数据
            let ipfsData = null;

            if (contractTask.ipfsHash && contractTask.ipfsHash !== '0' && contractTask.ipfsHash !== '') {
                console.log(`🔍 获取任务 ${contractTask.id} 的IPFS数据:`, contractTask.ipfsHash);

                if (useIpfsStore().isValidIPFSHash && useIpfsStore().isValidIPFSHash(contractTask.ipfsHash)) {
                    try {
                        ipfsData = await useIpfsStore().getTaskData(contractTask.ipfsHash);
                        console.log(`✅ 任务 ${contractTask.id} IPFS数据获取成功`);
                    } catch (ipfsError) {
                        console.warn(`⚠️ 任务 ${contractTask.id} IPFS数据获取失败:`, ipfsError.message);
                    }
                }
            }

            // 如果没有IPFS数据，创建基本结构
            if (!ipfsData) {
                ipfsData = {
                    title: decodedTitle || '未命名任务',
                    description: decodedDescription || (contractTask.ipfsHash ? '此任务的详细信息无法加载' : '此任务没有详细描述信息'),
                    taskType: 'web',
                    requirements: '',
                    skillsRequired: [],
                    githubRequired: false,
                    githubRepo: '',
                    chainlinkVerification: false,
                    attachments: [],
                    employer: {
                        address: contractTask.creator || '',
                        name: '',
                        email: '',
                        company: '',
                        avatar: '',
                        bio: '',
                        website: '',
                        socialLinks: {}
                    },
                    biddingPeriod: contractTask.biddingPeriod || 72,
                    developmentPeriod: contractTask.developmentPeriod || 14,
                    createdAt: Date.now(),
                    version: '1.0'
                }
            }

            // 🔧 修复奖金转换 - 将Octa转换为APT
            let convertedReward = '0';
            if (contractTask.reward) {
                const rewardInOcta = parseFloat(contractTask.reward);
                const rewardInAPT = rewardInOcta / 100000000; // 1 APT = 100,000,000 Octa
                convertedReward = rewardInAPT.toFixed(8);
                console.log(`💰 奖金转换: ${contractTask.reward} Octa -> ${convertedReward} APT`);
            }

            // 合并合约数据和IPFS数据
            const mergedTask = {
                // 基本信息优先使用IPFS数据，如果没有则使用解码后的合约数据
                title: ipfsData?.title || decodedTitle || '未命名任务',
                description: ipfsData?.description || decodedDescription || '暂无描述',
                requirements: ipfsData?.requirements || '',
                taskType: ipfsData?.taskType || 'web',
                skillsRequired: Array.isArray(ipfsData?.skillsRequired) ? ipfsData.skillsRequired : [],

                // 合约数据（权威数据）
                id: contractTask.id,
                employer: contractTask.creator,
                creator: contractTask.creator,
                reward: convertedReward, // 🔧 使用转换后的奖金
                deadline: contractTask.deadline,
                status: contractTask.status,
                ipfsHash: contractTask.ipfsHash,

                // 竞标者数据
                bidders: Array.isArray(contractTask.bidders) ? contractTask.bidders : [],
                participants: Array.isArray(contractTask.participants) ? contractTask.participants : [],

                // IPFS扩展数据
                githubRequired: ipfsData?.githubRequired || false,
                githubRepo: ipfsData?.githubRepo || '',
                chainlinkVerification: ipfsData?.chainlinkVerification || false,
                attachments: Array.isArray(ipfsData?.attachments) ? ipfsData.attachments : [],

                // 时间规划数据
                biddingPeriod: contractTask.biddingPeriod || ipfsData?.biddingPeriod || 72,
                developmentPeriod: contractTask.developmentPeriod || ipfsData?.developmentPeriod || 14,

                // 雇主信息
                employerInfo: ipfsData?.employer || {
                    address: contractTask.creator || '',
                    name: '',
                    email: '',
                    company: '',
                    avatar: '',
                    bio: '',
                    website: '',
                    socialLinks: {}
                },

                // 元数据
                createdAt: ipfsData?.createdAt || Date.now(),
                version: ipfsData?.version || '1.0',
                source: 'contract+ipfs'
            }

            console.log(`✅ 格式化后的任务:`, mergedTask);
            return mergedTask;
        };

        console.log('✅ 奖金转换逻辑已修复');

        // 步骤3: 重新加载任务数据
        console.log('🔄 步骤3: 重新加载任务数据...');
        await window.dataStore.loadTasksFromContract();

        // 步骤4: 检查奖金显示
        console.log('\n📊 步骤4: 检查奖金显示...');
        window.dataStore.tasks.forEach((task, index) => {
            console.log(`\n📋 任务 ${index + 1}: ${task.title} (ID: ${task.id})`);
            console.log('  - 显示奖金:', task.reward, 'APT');
            console.log('  - 奖金类型:', typeof task.reward);

            // 检查奖金是否合理
            const rewardNum = parseFloat(task.reward);
            if (rewardNum > 1000) {
                console.log('  ⚠️ 奖金数值异常，可能未正确转换');
            } else if (rewardNum > 0) {
                console.log('  ✅ 奖金数值正常');
            } else {
                console.log('  ⚠️ 奖金为0或无效');
            }
        });

        // 步骤5: 测试特定任务的奖金
        if (window.dataStore.tasks.length > 0) {
            const testTask = window.dataStore.tasks[0];
            console.log(`\n🎯 步骤5: 测试任务详情: ${testTask.title}`);

            // 检查合约原始数据
            if (window.web3Store.aptosContractService) {
                try {
                    const contractTask = await window.web3Store.aptosContractService.getTask(testTask.id);
                    console.log('  - 合约原始budget:', contractTask.budget);
                    console.log('  - 合约原始reward:', contractTask.reward);

                    // 手动转换验证
                    const manualConversion = (parseFloat(contractTask.budget || contractTask.reward) / 100000000).toFixed(8);
                    console.log('  - 手动转换结果:', manualConversion, 'APT');
                    console.log('  - 前端显示结果:', testTask.reward, 'APT');
                    console.log('  - 转换是否正确:', manualConversion === testTask.reward ? '✅' : '❌');

                } catch (error) {
                    console.error('  - 获取合约数据失败:', error);
                }
            }
        }

        // 步骤6: 检查统计信息
        console.log('\n📈 步骤6: 统计信息检查:');
        console.log('  - 总任务数:', window.dataStore.stats.totalTasks);
        console.log('  - 活跃任务数:', window.dataStore.stats.activeTasks);
        console.log('  - 已完成任务数:', window.dataStore.stats.completedTasks);
        console.log('  - 总奖金池:', window.dataStore.stats.totalRewards, 'APT');

        // 步骤7: 修复TaskDetail.vue中的AVAX显示
        console.log('\n🔄 步骤7: 修复TaskDetail.vue中的货币显示...');

        // 查找并修复页面中的AVAX显示
        const avaxElements = document.querySelectorAll('span:contains("AVAX")');
        avaxElements.forEach(element => {
            if (element.textContent.includes('AVAX')) {
                element.textContent = element.textContent.replace('AVAX', 'APT');
                console.log('✅ 修复AVAX显示为APT');
            }
        });

        // 步骤8: 刷新页面应用修复
        console.log('\n🔄 步骤8: 刷新页面应用修复...');
        console.log('✅ 奖金显示修复完成，页面即将刷新');

        // 延迟刷新，让用户看到结果
        setTimeout(() => {
            window.location.reload();
        }, 3000);

    } catch (error) {
        console.error('❌ 修复奖金显示失败:', error);

        // 尝试备用方法
        console.log('🔄 尝试备用方法...');
        try {
            // 直接刷新页面，让Vue重新初始化
            console.log('🔄 直接刷新页面...');
            window.location.reload();
        } catch (backupError) {
            console.error('❌ 备用方法也失败:', backupError);
        }
    }
}

// 运行完整修复
fixRewardDisplay(); 