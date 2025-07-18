// Aptos 钱包服务 - 用于连接 Petra 钱包
import { AptosClient } from "aptos";

// Aptos 网络配置
const APTOS_NETWORKS = {
    testnet: {
        name: 'Aptos Testnet',
        nodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
        faucetUrl: 'https://faucet.testnet.aptoslabs.com',
        chainId: 2
    },
    mainnet: {
        name: 'Aptos Mainnet',
        nodeUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
        chainId: 1
    }
}

class AptosWalletService {
    constructor() {
        this.client = null
        this.account = null
        this.isConnected = false
        this.network = APTOS_NETWORKS.testnet // 默认使用测试网
        this.wallet = null
    }

    // 检查 Petra 钱包是否已安装
    isPetraInstalled() {
        return typeof window !== 'undefined' && window.petra !== undefined
    }

    // 连接 Petra 钱包
    async connectWallet() {
        try {
            if (!this.isPetraInstalled()) {
                throw new Error('请安装 Petra 钱包扩展程序')
            }

            console.log('🔗 正在连接 Petra 钱包...')

            // 请求连接钱包
            const response = await window.petra.connect()

            if (!response.address) {
                throw new Error('钱包连接失败')
            }

            this.account = response.address
            this.wallet = window.petra
            this.isConnected = true

            // 创建 Aptos 客户端
            this.client = new AptosClient(this.network.nodeUrl)

            // 获取实际网络信息
            const networkInfo = await this.getNetworkInfo()

            console.log('✅ Petra 钱包连接成功:', this.account)
            console.log('🌐 实际网络 Chain ID:', networkInfo.chainId)

            return {
                success: true,
                address: this.account,
                network: {
                    ...this.network,
                    chainId: networkInfo.chainId // 使用实际的 chainId
                }
            }

        } catch (error) {
            console.error('❌ Petra 钱包连接失败:', error)
            throw error
        }
    }

    // 断开钱包连接
    async disconnectWallet() {
        try {
            if (this.wallet && this.wallet.disconnect) {
                await this.wallet.disconnect()
            }

            this.account = null
            this.wallet = null
            this.isConnected = false
            this.client = null

            console.log('✅ Petra 钱包已断开连接')
        } catch (error) {
            console.error('❌ 断开钱包连接失败:', error)
        }
    }

    // 获取账户信息
    async getAccountInfo() {
        if (!this.client || !this.account) {
            throw new Error('钱包未连接')
        }

        try {
            const accountInfo = await this.client.getAccount(this.account)
            return accountInfo
        } catch (error) {
            console.error('❌ 获取账户信息失败:', error)
            throw error
        }
    }

    // 获取账户余额
    async getBalance() {
        if (!this.client || !this.account) {
            throw new Error('钱包未连接')
        }

        try {
            const resources = await this.client.getAccountResources(this.account)
            const coinResource = resources.find(resource =>
                resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
            )

            if (coinResource) {
                return coinResource.data.coin.value
            }
            return '0'
        } catch (error) {
            console.error('❌ 获取余额失败:', error)
            return '0'
        }
    }

    // 获取网络信息
    async getNetworkInfo() {
        if (!this.client) {
            throw new Error('客户端未初始化')
        }

        try {
            const ledgerInfo = await this.client.getLedgerInfo()
            return {
                chainId: ledgerInfo.chain_id,
                epoch: ledgerInfo.epoch,
                version: ledgerInfo.version,
                timestamp: ledgerInfo.timestamp_usecs
            }
        } catch (error) {
            console.error('❌ 获取网络信息失败:', error)
            throw error
        }
    }

    // 检查网络是否正确
    isCorrectNetwork() {
        return this.network.chainId === 2 // 测试网
    }

    // 切换网络
    async switchNetwork(networkName) {
        if (!this.wallet) {
            throw new Error('钱包未连接')
        }

        try {
            const newNetwork = APTOS_NETWORKS[networkName]
            if (!newNetwork) {
                throw new Error('不支持的网络')
            }

            // 更新网络配置
            this.network = newNetwork
            this.client = new AptosClient(this.network.nodeUrl)

            console.log(`✅ 已切换到 ${newNetwork.name}`)
            return true
        } catch (error) {
            console.error('❌ 切换网络失败:', error)
            throw error
        }
    }

    // 签名消息
    async signMessage(message) {
        if (!this.wallet || !this.account) {
            throw new Error('钱包未连接')
        }

        try {
            const response = await this.wallet.signMessage({
                message: message,
                nonce: Date.now().toString()
            })

            return response
        } catch (error) {
            console.error('❌ 签名消息失败:', error)
            throw error
        }
    }

    // 发送交易
    async sendTransaction(transaction) {
        if (!this.wallet || !this.account) {
            throw new Error('钱包未连接')
        }

        try {
            const response = await this.wallet.signAndSubmitTransaction(transaction)
            return response
        } catch (error) {
            console.error('❌ 发送交易失败:', error)
            throw error
        }
    }

    // 等待交易确认
    async waitForTransaction(hash, options = {}) {
        if (!this.client) {
            throw new Error('客户端未初始化')
        }

        try {
            const result = await this.client.waitForTransaction(hash, options)
            return result
        } catch (error) {
            console.error('❌ 等待交易确认失败:', error)
            throw error
        }
    }

    // 获取交易详情
    async getTransaction(hash) {
        if (!this.client) {
            throw new Error('客户端未初始化')
        }

        try {
            const transaction = await this.client.getTransaction(hash)
            return transaction
        } catch (error) {
            console.error('❌ 获取交易详情失败:', error)
            throw error
        }
    }

    // 设置事件监听器
    setupEventListeners(callbacks = {}) {
        if (!this.wallet) return

        // 账户变更
        if (callbacks.onAccountChange) {
            this.wallet.onAccountChange(callbacks.onAccountChange)
        }

        // 网络变更
        if (callbacks.onNetworkChange) {
            this.wallet.onNetworkChange(callbacks.onNetworkChange)
        }

        // 断开连接
        if (callbacks.onDisconnect) {
            this.wallet.onDisconnect(callbacks.onDisconnect)
        }
    }

    // 移除事件监听器
    removeEventListeners() {
        if (!this.wallet) return

        this.wallet.removeAllListeners()
    }

    // 获取钱包状态
    getWalletState() {
        return {
            isConnected: this.isConnected,
            account: this.account,
            network: this.network,
            isPetraInstalled: this.isPetraInstalled()
        }
    }

    // 清理资源
    cleanup() {
        this.removeEventListeners()
        this.disconnectWallet()
    }
}

// 创建单例实例
const aptosWalletService = new AptosWalletService()

export default aptosWalletService
export { APTOS_NETWORKS } 