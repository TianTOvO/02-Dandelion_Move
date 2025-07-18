// Aptos 配置文件
import { AptosClient } from 'aptos'

// 网络配置
export const APTOS_NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    url: 'https://fullnode.mainnet.aptoslabs.com/v1',
    chainId: 1,
    faucet: null
  },
  testnet: {
    name: 'Testnet',
    url: 'https://fullnode.testnet.aptoslabs.com/v1',
    chainId: 2,
    faucet: 'https://faucet.testnet.aptoslabs.com'
  },
  devnet: {
    name: 'Devnet',
    url: 'https://fullnode.devnet.aptoslabs.com/v1',
    chainId: 0,
    faucet: 'https://faucet.devnet.aptoslabs.com'
  }
}

// 默认网络
export const DEFAULT_NETWORK = 'testnet'

// 合约模块地址（部署后需要更新）
export const CONTRACT_MODULES = {
  TaskFactory: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b::dandelion::TaskFactory',
  BiddingSystem: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b::dandelion::BiddingSystem',
  Escrow: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b::dandelion::Escrow',
  DisputeDAO: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b::dandelion::DisputeDAO',
  TaskStorage: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b::dandelion::TaskStorage'
}

// 创建 Aptos 客户端
export function createAptosClient(network = DEFAULT_NETWORK) {
  const networkConfig = APTOS_NETWORKS[network]
  if (!networkConfig) {
    throw new Error(`不支持的网络: ${network}`)
  }
  return new AptosClient(networkConfig.url)
}

// 格式化 Aptos 地址
export function formatAptosAddress(address) {
  if (!address) return ''
  return address.startsWith('0x') ? address : `0x${address}`
}

// 解析 Aptos 资源类型
export function parseResourceType(type) {
  const parts = type.split('::')
  return {
    address: parts[0],
    module: parts[1],
    name: parts[2]
  }
}

// 获取账户资源
export async function getAccountResource(client, address, resourceType) {
  try {
    const resources = await client.getAccountResources(address)
    return resources.find(r => r.type === resourceType)
  } catch (error) {
    console.error('获取账户资源失败:', error)
    return null
  }
}

// 获取 APT 余额
export async function getAptBalance(client, address) {
  const coinStore = await getAccountResource(
    client,
    address,
    '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
  )
  return coinStore ? parseInt(coinStore.data.coin.value) : 0
}

// 构建交易载荷
export function buildTransactionPayload(moduleAddress, moduleName, functionName, typeArgs = [], args = []) {
  return {
    type: 'entry_function_payload',
    function: `${moduleAddress}::${moduleName}::${functionName}`,
    type_arguments: typeArgs,
    arguments: args
  }
}

// 估算交易 Gas
export async function estimateGas(client, payload) {
  try {
    const response = await client.estimateGasPrice()
    return response.gas_estimate
  } catch (error) {
    console.error('Gas 估算失败:', error)
    return 1000 // 默认值
  }
}

// 等待交易确认
export async function waitForTransaction(client, hash, timeout = 10000) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    try {
      const tx = await client.getTransactionByHash(hash)
      if (tx.success) {
        return tx
      }
      if (tx.vm_status !== 'Executed successfully') {
        throw new Error(`交易失败: ${tx.vm_status}`)
      }
    } catch (error) {
      if (error.message.includes('Transaction not found')) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }
      throw error
    }
  }
  throw new Error('交易确认超时')
}

// 验证钱包连接
export function validateWalletConnection() {
  if (typeof window === 'undefined') {
    throw new Error('浏览器环境不可用')
  }

  // 检查 Petra 钱包
  if (window.petra) {
    return true
  }

  // 检查 Aptos 钱包
  if (window.aptos) {
    return true
  }

  throw new Error('未检测到可用的 Aptos 钱包，请安装 Petra 或 Martian 钱包')
}

// 连接钱包
export async function connectWallet() {
  validateWalletConnection()

  try {
    // 优先使用 Petra 钱包
    if (window.petra && window.petra.connect) {
      const response = await window.petra.connect()
      return {
        address: response.address,
        publicKey: response.publicKey
      }
    }

    // 备用 Aptos 钱包
    if (window.aptos && window.aptos.connect) {
      const response = await window.aptos.connect()
      return {
        address: response.address,
        publicKey: response.publicKey
      }
    }

    throw new Error('钱包连接方法不可用')
  } catch (error) {
    throw new Error(`钱包连接失败: ${error.message}`)
  }
}

// 签名并提交交易
export async function signAndSubmitTransaction(payload, options = {}) {
  console.log('🚀 开始签名并提交交易...')
  console.log('📦 交易载荷:', payload)
  console.log('⚙️ 交易选项:', options)

  // 检查钱包连接
  if (typeof window === 'undefined') {
    throw new Error('浏览器环境不可用')
  }

  // 检查钱包是否已连接
  let wallet = null
  let walletName = ''

  // 优先使用 Petra 钱包
  if (window.petra) {
    console.log('🔍 检测到 Petra 钱包')
    try {
      // 检查是否已连接
      const account = await window.petra.account()
      if (account && account.address) {
        console.log('✅ Petra 钱包已连接:', account.address)
        wallet = window.petra
        walletName = 'Petra'
      } else {
        console.log('⚠️ Petra 钱包未连接，尝试连接...')
        const response = await window.petra.connect()
        console.log('✅ Petra 钱包连接成功:', response.address)
        wallet = window.petra
        walletName = 'Petra'
      }
    } catch (connectError) {
      console.error('❌ Petra 钱包连接失败:', connectError)
    }
  }

  // 备用 Aptos 钱包
  if (!wallet && window.aptos) {
    console.log('🔍 检测到 Aptos 钱包')
    try {
      // 检查是否已连接
      const account = await window.aptos.account()
      if (account && account.address) {
        console.log('✅ Aptos 钱包已连接:', account.address)
        wallet = window.aptos
        walletName = 'Aptos'
      } else {
        console.log('⚠️ Aptos 钱包未连接，尝试连接...')
        const response = await window.aptos.connect()
        console.log('✅ Aptos 钱包连接成功:', response.address)
        wallet = window.aptos
        walletName = 'Aptos'
      }
    } catch (connectError) {
      console.error('❌ Aptos 钱包连接失败:', connectError)
    }
  }

  if (!wallet) {
    throw new Error('未检测到可用的 Aptos 钱包，请安装并连接 Petra 或 Aptos 钱包')
  }

  // 检查网络
  try {
    const network = await wallet.network()
    console.log(`🌐 当前网络: ${network}`)

    if (network !== 'testnet') {
      console.warn(`⚠️ 当前网络是 ${network}，建议切换到 testnet`)
    }
  } catch (networkError) {
    console.warn('⚠️ 无法获取网络信息:', networkError.message)
  }

  // 提交交易
  try {
    console.log(`📤 使用 ${walletName} 钱包提交交易...`)
    console.log('📋 交易载荷详情:', JSON.stringify(payload, null, 2))

    const transaction = await wallet.signAndSubmitTransaction(payload, options)
    console.log('✅ 交易提交成功:', transaction)
    return transaction
  } catch (error) {
    console.error(`❌ ${walletName} 钱包交易提交失败:`, error)
    console.error('🔍 错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details
    })

    // 提供更详细的错误信息
    let errorMessage = error.message || '未知错误'
    let errorDetails = ''

    // 检查错误类型
    if (error.name === 'TypeError') {
      errorDetails = '类型错误，可能是钱包API调用方式不正确'
    } else if (error.name === 'ReferenceError') {
      errorDetails = '引用错误，可能是钱包对象未正确初始化'
    } else if (error.name === 'NetworkError') {
      errorDetails = '网络错误，请检查网络连接'
    }

    // 检查错误消息内容
    if (errorMessage.includes('insufficient balance')) {
      errorMessage = '账户余额不足，请确保有足够的APT支付交易费用'
    } else if (errorMessage.includes('network')) {
      errorMessage = '网络连接问题，请检查网络设置'
    } else if (errorMessage.includes('user rejected')) {
      errorMessage = '用户拒绝了交易，请在钱包中确认交易'
    } else if (errorMessage.includes('invalid function')) {
      errorMessage = '合约函数调用错误，请检查合约地址和函数名'
    } else if (errorMessage.includes('not connected')) {
      errorMessage = '钱包未连接，请先连接钱包'
    } else if (errorMessage.includes('wrong network')) {
      errorMessage = '网络不匹配，请切换到正确的网络'
    } else if (errorMessage.includes('transaction failed')) {
      errorMessage = '交易执行失败，请检查合约状态和参数'
    } else if (errorMessage.includes('gas')) {
      errorMessage = 'Gas费用问题，请检查账户余额和Gas设置'
    } else if (errorMessage.includes('timeout')) {
      errorMessage = '交易超时，请检查网络连接'
    } else if (errorMessage.includes('permission')) {
      errorMessage = '权限不足，请检查钱包权限设置'
    }

    // 如果没有匹配到具体错误，保留原始错误信息
    if (errorMessage === '未知错误') {
      errorMessage = `原始错误: ${error.message}`
      errorDetails = `错误类型: ${error.name}, 错误代码: ${error.code || '无'}`
    }

    const fullErrorMessage = errorDetails ?
      `${walletName} 钱包交易提交失败: ${errorMessage} (${errorDetails})` :
      `${walletName} 钱包交易提交失败: ${errorMessage}`

    throw new Error(fullErrorMessage)
  }
}

// 获取网络信息
export function getNetworkInfo() {
  return APTOS_NETWORKS[DEFAULT_NETWORK]
}

// 检查网络连接
export async function checkNetworkConnection(client) {
  try {
    await client.getLedgerInfo()
    return true
  } catch (error) {
    console.error('网络连接检查失败:', error)
    return false
  }
} 