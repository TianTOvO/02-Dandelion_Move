// 智能合约配置文件 - Move 链版本
// 由于这是 Move 项目，我们使用简化的 ABI 结构

// 简化的 ABI 结构用于 Move 合约
const createMoveABI = (moduleName) => ({
  module: moduleName,
  functions: [],
  structs: []
})

// 智能合约 ABI 配置
const TaskFactoryABI = createMoveABI('TaskFactory')
const BiddingSystemABI = createMoveABI('BiddingSystem')
const EscrowABI = createMoveABI('Escrow')
const DisputeDAO_ABI = createMoveABI('DisputeDAO')

// 调试：检查ABI导入
console.log('🔍 Move ABI配置检查:')
console.log('TaskFactoryABI:', TaskFactoryABI)
console.log('BiddingSystemABI:', BiddingSystemABI)
console.log('EscrowABI:', EscrowABI)
console.log('DisputeDAO_ABI:', DisputeDAO_ABI)

// 智能合约地址配置 - 部署后需要更新这些地址
export const CONTRACT_ADDRESSES = {
  TaskFactory: '0xEeE38935cfc450Fe1e5dfF85205212fe7AB711eE',
  BiddingSystem: '0x015dbce5389dd0CD60e0d6F459e89761Fb2465B5',
  Escrow: '0x737C76EE516b2597511Bf2364681859fD321a2cb',
  DisputeDAO: '0xbCe0D7E1807b096671d1ed2551EB8f3Ac762714b'
}

// 调试：检查地址配置
console.log('🔍 合约地址配置检查:', CONTRACT_ADDRESSES)

// 智能合约ABI配置
export const CONTRACT_ABIS = {
  TaskFactory: TaskFactoryABI,
  BiddingSystem: BiddingSystemABI,
  Escrow: EscrowABI,
  DisputeDAO: DisputeDAO_ABI
}

// 调试：检查ABI配置
console.log('🔍 ABI配置检查:', {
  TaskFactory: CONTRACT_ABIS.TaskFactory ? '✅' : '❌',
  BiddingSystem: CONTRACT_ABIS.BiddingSystem ? '✅' : '❌',
  Escrow: CONTRACT_ABIS.Escrow ? '✅' : '❌',
  DisputeDAO: CONTRACT_ABIS.DisputeDAO ? '✅' : '❌'
})

// Aptos 测试网配置
export const APTOS_TESTNET = {
  chainId: 2,
  chainName: 'Aptos Testnet',
  nativeCurrency: {
    name: 'APT',
    symbol: 'APT',
    decimals: 8
  },
  rpcUrls: ['https://fullnode.testnet.aptoslabs.com/v1'],
  blockExplorerUrls: ['https://explorer.aptoslabs.com/']
}

// 合约配置验证
export const validateContractConfig = () => {
  const errors = []

  // 检查地址配置
  for (const [key, address] of Object.entries(CONTRACT_ADDRESSES)) {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      errors.push(`${key} 地址未配置或无效`)
    }
  }

  // 检查ABI配置
  for (const [key, abi] of Object.entries(CONTRACT_ABIS)) {
    if (!abi || !abi.module) {
      errors.push(`${key} ABI未配置或无效`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 导出配置信息
export const getContractInfo = () => {
  const validation = validateContractConfig()

  return {
    addresses: CONTRACT_ADDRESSES,
    abis: CONTRACT_ABIS,
    network: APTOS_TESTNET,
    validation
  }
} 