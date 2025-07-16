// 智能合约配置文件
import TaskFactoryABI from '../../../contracts/contracts/ContractsABI/TaskFactoryABI.json'
import BiddingSystemABI from '../../../contracts/contracts/ContractsABI/BiddingSystemABI.json'
import EscrowABI from '../../../contracts/contracts/ContractsABI/EscrowABI.json'
import DisputeDAO_ABI from '../../../contracts/contracts/ContractsABI/DisputeDAO_ABI.json'

// 调试：检查ABI导入
console.log('🔍 ABI导入检查:')
console.log('TaskFactoryABI类型:', typeof TaskFactoryABI, '长度:', Array.isArray(TaskFactoryABI) ? TaskFactoryABI.length : 'N/A')
console.log('BiddingSystemABI类型:', typeof BiddingSystemABI, '长度:', Array.isArray(BiddingSystemABI) ? BiddingSystemABI.length : 'N/A')
console.log('EscrowABI类型:', typeof EscrowABI, '长度:', Array.isArray(EscrowABI) ? EscrowABI.length : 'N/A')
console.log('DisputeDAO_ABI类型:', typeof DisputeDAO_ABI, '长度:', Array.isArray(DisputeDAO_ABI) ? DisputeDAO_ABI.length : 'N/A')

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

// Avalanche Fuji测试网配置
export const AVALANCHE_FUJI = {
  chainId: '0xA869', // 43113
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/']
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
    if (!abi || !Array.isArray(abi) || abi.length === 0) {
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
    network: AVALANCHE_FUJI,
    validation
  }
} 