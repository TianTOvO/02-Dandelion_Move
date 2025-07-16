// Web3连接测试工具
import { ethers } from 'ethers'

const { providers, utils } = ethers

export class Web3Tester {
  constructor() {
    this.provider = null
    this.signer = null
    this.account = null
    this.chainId = null
  }

  // 测试MetaMask是否可用
  testMetaMaskAvailability() {
    const result = {
      available: !!window.ethereum,
      isMetaMask: window.ethereum?.isMetaMask || false,
      version: window.ethereum?.version || 'unknown'
    }
    console.log('MetaMask可用性测试:', result)
    return result
  }

  // 测试ethers导入
  testEthersImport() {
    const result = {
      ethers_available: !!ethers,
      providers_available: !!providers,
      utils_available: !!utils,
      Web3Provider_available: !!providers.Web3Provider,
      formatEther_available: !!utils.formatEther,
      parseEther_available: !!utils.parseEther
    }
    console.log('Ethers导入测试:', result)
    return result
  }

  // 测试网络获取（使用多种方法）
  async testNetworkDetection() {
    const results = {
      method1_direct: null,
      method2_provider: null,
      method3_ethereum: null,
      errors: []
    }

    // 方法1: 直接从ethereum对象获取
    try {
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
      results.method1_direct = {
        chainIdHex,
        chainId: parseInt(chainIdHex, 16),
        success: true
      }
    } catch (error) {
      results.errors.push(`方法1失败: ${error.message}`)
    }

    // 方法2: 创建provider并获取网络
    try {
      if (window.ethereum) {
        const tempProvider = new providers.Web3Provider(window.ethereum)
        const network = await tempProvider.getNetwork()
        results.method2_provider = {
          network,
          chainId: network.chainId,
          name: network.name,
          success: true
        }
      }
    } catch (error) {
      results.errors.push(`方法2失败: ${error.message}`)
    }

    // 方法3: 使用ethereum.networkVersion（如果可用）
    try {
      if (window.ethereum.networkVersion) {
        results.method3_ethereum = {
          networkVersion: window.ethereum.networkVersion,
          chainId: parseInt(window.ethereum.networkVersion),
          success: true
        }
      }
    } catch (error) {
      results.errors.push(`方法3失败: ${error.message}`)
    }

    console.log('网络检测测试:', results)
    return results
  }

  // 测试账户获取
  async testAccountAccess() {
    const results = {
      existing_accounts: null,
      request_accounts: null,
      errors: []
    }

    // 检查现有账户
    try {
      const existingAccounts = await window.ethereum.request({
        method: 'eth_accounts'
      })
      results.existing_accounts = {
        accounts: existingAccounts,
        count: existingAccounts.length,
        success: true
      }
    } catch (error) {
      results.errors.push(`获取现有账户失败: ${error.message}`)
    }

    // 请求账户访问（如果没有现有账户）
    if (!results.existing_accounts?.accounts?.length) {
      try {
        const requestedAccounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        results.request_accounts = {
          accounts: requestedAccounts,
          count: requestedAccounts.length,
          success: true
        }
      } catch (error) {
        results.errors.push(`请求账户访问失败: ${error.message}`)
      }
    }

    console.log('账户访问测试:', results)
    return results
  }

  // 测试余额获取
  async testBalanceRetrieval(account) {
    if (!account) return { error: '未提供账户地址' }

    const results = {
      method1_direct: null,
      method2_provider: null,
      errors: []
    }

    // 方法1: 直接使用ethereum.request
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      })
      
      const balanceWei = BigInt(balanceHex)
      const balanceEther = utils.formatEther(balanceWei.toString())

      results.method1_direct = {
        balance_hex: balanceHex,
        balance_wei: balanceWei.toString(),
        balance_ether: balanceEther,
        success: true
      }
    } catch (error) {
      results.errors.push(`方法1 (直接请求) 失败: ${error.message}`)
    }

    // 方法2: 使用provider (可能有代理问题)
    try {
      const provider = new providers.Web3Provider(window.ethereum)
      const balanceWei = await provider.getBalance(account)
      const balanceEther = utils.formatEther(balanceWei)

      results.method2_provider = {
        balance_wei: balanceWei.toString(),
        balance_ether: balanceEther,
        success: true
      }
    } catch (error) {
      results.errors.push(`方法2 (provider) 失败: ${error.message}`)
    }

    console.log('余额获取测试:', results)
    return results
  }

  // 综合测试
  async runFullTest() {
    console.log('🧪 开始Web3综合测试...')
    
    const testResults = {
      metamask: this.testMetaMaskAvailability(),
      ethers: this.testEthersImport(),
      network: await this.testNetworkDetection(),
      accounts: await this.testAccountAccess(),
      balance: null,
      timestamp: new Date().toISOString()
    }

    // 如果有账户，测试余额获取
    const account = testResults.accounts.existing_accounts?.accounts?.[0] || 
                   testResults.accounts.request_accounts?.accounts?.[0]
    
    if (account) {
      testResults.balance = await this.testBalanceRetrieval(account)
    }

    console.log('🎉 Web3综合测试完成:', testResults)
    return testResults
  }
}

// 导出单例实例
export const web3Tester = new Web3Tester() 