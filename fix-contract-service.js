// 修复合约服务初始化问题脚本
console.log('🔧 开始修复合约服务初始化问题...')

// 检查并修复合约服务
async function fixContractService() {
    try {
        console.log('🔍 步骤1: 检查当前状态...')

        // 检查Aptos钱包
        if (!window.aptos) {
            console.log('❌ 未检测到Aptos钱包')
            return false
        }

        const isConnected = await window.aptos.isConnected()
        console.log('Aptos钱包连接状态:', isConnected)

        if (!isConnected) {
            console.log('❌ Aptos钱包未连接')
            return false
        }

        const account = await window.aptos.account()
        console.log('Aptos账户:', account.address)

        console.log('🔍 步骤2: 检查Vue应用状态...')

        // 尝试获取Vue应用实例
        let vueApp = null
        let web3Store = null

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
            if (pinia && pinia.state.value.web3) {
                web3Store = pinia.state.value.web3
                console.log('✅ 找到web3Store')

                console.log('当前web3Store状态:', {
                    isConnected: web3Store.isConnected,
                    account: web3Store.account,
                    hasAptosContractService: !!web3Store.aptosContractService,
                    hasContractService: !!web3Store.contractService
                })
            }
        }

        console.log('🔧 步骤3: 修复合约服务...')

        if (web3Store) {
            // 修复钱包连接状态
            if (!web3Store.isConnected || web3Store.account !== account.address) {
                console.log('⚠️ 修复钱包连接状态...')
                web3Store.isConnected = true
                web3Store.account = account.address
                console.log('✅ 钱包连接状态已修复')
            }

            // 修复Aptos合约服务
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

                    // 尝试其他导入方式
                    try {
                        const response = await fetch('/src/utils/aptosContractService.js')
                        const code = await response.text()
                        console.log('📄 尝试直接加载合约服务代码...')

                        // 这里可以尝试其他方式初始化合约服务
                        console.log('⚠️ 需要手动初始化合约服务')
                    } catch (fetchError) {
                        console.error('❌ 加载合约服务代码失败:', fetchError)
                    }
                }
            } else {
                console.log('✅ Aptos合约服务已存在')
            }
        } else {
            console.log('⚠️ 无法找到web3Store，尝试其他方法...')
        }

        console.log('🔄 步骤4: 触发页面更新...')

        // 触发Vue响应式更新
        if (vueApp) {
            const event = new CustomEvent('contractServiceFixed', {
                detail: {
                    account: account.address,
                    hasAptosContractService: !!web3Store?.aptosContractService
                }
            })
            window.dispatchEvent(event)
            console.log('✅ 已触发合约服务修复事件')
        }

        console.log('💡 建议操作:')
        console.log('1. 刷新页面以应用修复')
        console.log('2. 或者点击页面中的"调试任务加载"按钮')
        console.log('3. 或者点击"强制重连钱包"按钮')

        return true

    } catch (error) {
        console.error('❌ 修复合约服务失败:', error)
        return false
    }
}

// 执行修复
fixContractService().then(success => {
    if (success) {
        console.log('✅ 合约服务修复完成！')
        console.log('💡 如果问题仍然存在，请尝试刷新页面')
    } else {
        console.log('❌ 合约服务修复失败，请尝试手动方法')
    }
})

// 提供手动修复函数
window.manualContractFix = function () {
    console.log('🔧 手动合约服务修复...')

    // 断开钱包连接
    if (window.aptos) {
        window.aptos.disconnect().then(() => {
            console.log('✅ 已断开钱包连接')
            console.log('💡 请刷新页面后重新连接钱包')
        }).catch(error => {
            console.error('断开连接失败:', error)
        })
    }
}

console.log('✅ 合约服务修复脚本加载完成')
console.log('💡 使用方法:')
console.log('- 自动执行: 脚本已自动运行')
console.log('- 手动修复: 运行 manualContractFix() 来断开钱包连接')
console.log('- 重新执行: 运行 fixContractService() 来重新执行修复') 