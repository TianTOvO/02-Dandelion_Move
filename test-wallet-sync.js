// 测试钱包状态同步脚本
console.log('🧪 开始测试钱包状态同步...')

// 测试函数
async function testWalletSync() {
    console.log('🔍 测试1: 检查全局钱包状态')
    console.log('全局钱包变量:', {
        hasPetra: !!window.petra,
        hasAptos: !!window.aptos,
        hasWallet: !!window.ethereum
    })

    console.log('🔍 测试2: 检查Aptos钱包连接状态')
    if (window.aptos) {
        try {
            const isConnected = await window.aptos.isConnected()
            console.log('Aptos钱包连接状态:', isConnected)

            if (isConnected) {
                const account = await window.aptos.account()
                console.log('Aptos账户:', account.address)
            }
        } catch (error) {
            console.error('检查Aptos钱包失败:', error)
        }
    }

    console.log('🔍 测试3: 检查Vue应用状态')
    if (window.__VUE_APP__) {
        console.log('Vue应用实例存在')

        // 尝试获取Pinia存储
        const pinia = window.__VUE_APP__.config.globalProperties.$pinia
        if (pinia) {
            console.log('Pinia存储存在')

            // 获取web3Store
            const web3Store = pinia.state.value.web3
            if (web3Store) {
                console.log('web3Store状态:', {
                    isConnected: web3Store.isConnected,
                    account: web3Store.account,
                    hasContractService: !!web3Store.contractService,
                    loading: web3Store.loading,
                    error: web3Store.error
                })

                // 检查状态一致性
                if (window.aptos) {
                    window.aptos.isConnected().then(isConnected => {
                        if (isConnected && !web3Store.isConnected) {
                            console.log('⚠️ 状态不一致: 钱包已连接但store显示未连接')
                        } else if (!isConnected && web3Store.isConnected) {
                            console.log('⚠️ 状态不一致: store显示已连接但钱包未连接')
                        } else {
                            console.log('✅ 状态一致')
                        }
                    })
                }
            }
        }
    }

    console.log('🔍 测试4: 检查页面显示状态')
    // 检查页面上的钱包地址显示
    const walletAddressElements = document.querySelectorAll('[class*="wallet"], [class*="address"]')
    console.log('页面钱包地址元素数量:', walletAddressElements.length)

    // 检查连接状态显示
    const connectionElements = document.querySelectorAll('[class*="connect"], [class*="status"]')
    console.log('页面连接状态元素数量:', connectionElements.length)
}

// 执行测试
testWalletSync()

console.log('✅ 测试脚本加载完成')
console.log('💡 运行 testWalletSync() 来重新执行测试') 