// 钱包状态同步修复脚本
// 运行此脚本来修复钱包连接状态不一致的问题

console.log('🔧 开始修复钱包状态同步问题...')

// 检查全局状态
console.log('🔍 检查全局钱包状态...')
console.log('全局钱包变量:', {
    hasPetra: !!window.petra,
    hasAptos: !!window.aptos,
    hasWallet: !!window.ethereum
})

// 检查Vue应用状态
console.log('🔍 检查Vue应用状态...')
if (window.__VUE_APP__) {
    console.log('✅ Vue应用实例存在')

    // 尝试获取Pinia存储
    if (window.__VUE_APP__.config.globalProperties.$pinia) {
        console.log('✅ Pinia存储存在')

        // 获取web3Store
        const web3Store = window.__VUE_APP__.config.globalProperties.$pinia.state.value.web3
        if (web3Store) {
            console.log('📊 当前web3Store状态:', {
                isConnected: web3Store.isConnected,
                account: web3Store.account,
                hasContractService: !!web3Store.contractService,
                loading: web3Store.loading,
                error: web3Store.error
            })
        }
    }
}

// 检查Aptos钱包连接状态
async function checkAptosWallet() {
    try {
        if (window.aptos) {
            const isConnected = await window.aptos.isConnected()
            console.log('🔍 Aptos钱包连接状态:', isConnected)

            if (isConnected) {
                const account = await window.aptos.account()
                console.log('👤 Aptos账户:', account)

                // 如果钱包已连接但store状态不正确，提供修复建议
                if (!window.__VUE_APP__?.config.globalProperties.$pinia?.state.value?.web3?.isConnected) {
                    console.log('⚠️ 检测到状态不一致！')
                    console.log('💡 建议操作:')
                    console.log('1. 点击"强制重连钱包"按钮')
                    console.log('2. 或者刷新页面后重新连接钱包')
                    console.log('3. 或者断开钱包连接后重新连接')
                }
            } else {
                console.log('⚠️ Aptos钱包未连接')
                console.log('💡 建议操作: 连接Aptos钱包')
            }
        } else {
            console.log('❌ 未检测到Aptos钱包')
            console.log('💡 建议操作: 安装Petra或Martian钱包')
        }
    } catch (error) {
        console.error('❌ 检查Aptos钱包失败:', error)
    }
}

// 执行检查
checkAptosWallet()

// 提供手动修复函数
window.fixWalletState = async function () {
    console.log('🔧 手动修复钱包状态...')

    try {
        // 1. 检查Aptos钱包
        if (window.aptos) {
            const isConnected = await window.aptos.isConnected()
            if (isConnected) {
                const account = await window.aptos.account()
                console.log('✅ Aptos钱包已连接:', account.address)

                // 2. 尝试更新全局状态
                if (window.__VUE_APP__?.config.globalProperties?.$pinia?.state?.value?.web3) {
                    const web3Store = window.__VUE_APP__.config.globalProperties.$pinia.state.value.web3
                    web3Store.isConnected = true
                    web3Store.account = account.address
                    console.log('✅ 已更新web3Store状态')
                }

                // 3. 触发页面刷新
                console.log('🔄 建议刷新页面以应用修复...')
                return true
            }
        }

        console.log('❌ 无法修复，钱包未连接')
        return false
    } catch (error) {
        console.error('❌ 修复失败:', error)
        return false
    }
}

console.log('✅ 修复脚本加载完成')
console.log('💡 使用方法:')
console.log('1. 在控制台运行 fixWalletState() 来手动修复')
console.log('2. 或者在页面中点击"强制重连钱包"按钮')
console.log('3. 或者刷新页面后重新连接钱包') 