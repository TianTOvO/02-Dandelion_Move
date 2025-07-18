// 快速修复钱包状态同步问题
// 在浏览器控制台中直接运行此脚本

console.log('🚀 开始快速修复钱包状态同步问题...')

// 检查并修复钱包状态
async function quickFix() {
    try {
        console.log('🔍 步骤1: 检查Aptos钱包状态...')

        if (!window.aptos) {
            console.log('❌ 未检测到Aptos钱包，请安装Petra或Martian钱包')
            return false
        }

        const isConnected = await window.aptos.isConnected()
        console.log('Aptos钱包连接状态:', isConnected)

        if (!isConnected) {
            console.log('❌ Aptos钱包未连接，请先连接钱包')
            return false
        }

        const account = await window.aptos.account()
        console.log('✅ Aptos钱包已连接，账户:', account.address)

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
                    hasContractService: !!web3Store.contractService
                })
            }
        }

        console.log('🔧 步骤3: 修复状态不一致...')

        if (web3Store) {
            // 修复状态不一致
            if (!web3Store.isConnected || web3Store.account !== account.address) {
                console.log('⚠️ 检测到状态不一致，正在修复...')

                web3Store.isConnected = true
                web3Store.account = account.address

                console.log('✅ 已修复web3Store状态')
            } else {
                console.log('✅ web3Store状态正常')
            }
        } else {
            console.log('⚠️ 无法找到web3Store，尝试其他方法...')
        }

        console.log('🔄 步骤4: 触发页面刷新...')

        // 尝试触发Vue响应式更新
        if (vueApp) {
            // 强制触发响应式更新
            const event = new CustomEvent('walletStateFixed', {
                detail: { account: account.address }
            })
            window.dispatchEvent(event)
            console.log('✅ 已触发状态更新事件')
        }

        console.log('💡 建议操作:')
        console.log('1. 刷新页面以应用修复')
        console.log('2. 或者点击页面中的"强制重连钱包"按钮')
        console.log('3. 或者断开钱包连接后重新连接')

        return true

    } catch (error) {
        console.error('❌ 快速修复失败:', error)
        return false
    }
}

// 执行快速修复
quickFix().then(success => {
    if (success) {
        console.log('✅ 快速修复完成！')
        console.log('💡 如果问题仍然存在，请尝试刷新页面')
    } else {
        console.log('❌ 快速修复失败，请尝试手动方法')
    }
})

// 提供手动修复函数
window.manualFix = function () {
    console.log('🔧 手动修复模式...')

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

console.log('✅ 快速修复脚本加载完成')
console.log('💡 使用方法:')
console.log('- 自动执行: 脚本已自动运行')
console.log('- 手动修复: 运行 manualFix() 来断开钱包连接')
console.log('- 重新执行: 运行 quickFix() 来重新执行修复') 