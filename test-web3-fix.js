// Web3修复测试脚本
console.log('🧪 开始Web3修复测试...')

// 检查基本环境
console.log('📋 环境检查:')
console.log('- MetaMask可用:', !!window.ethereum)
console.log('- 当前URL:', window.location.href)

// 测试ethers导入
console.log('\n📦 Ethers导入测试:')
try {
  const { ethers } = await import('./frontend/src/stores/web3.js')
  console.log('- Ethers导入: ✅')
} catch (error) {
  console.log('- Ethers导入: ❌', error.message)
}

// 测试余额获取方法
async function testBalanceMethod() {
  console.log('\n💰 余额获取方法测试:')
  
  if (!window.ethereum) {
    console.log('- 跳过: MetaMask未安装')
    return
  }

  try {
    // 获取账户
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    })
    
    if (accounts.length === 0) {
      console.log('- 跳过: 无已连接账户')
      return
    }

    const account = accounts[0]
    console.log('- 测试账户:', account.slice(0, 10) + '...')

    // 测试直接方法
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      })
      
      const balanceWei = BigInt(balanceHex)
      console.log('- 直接方法: ✅', balanceWei.toString().slice(0, 10) + '... wei')
    } catch (error) {
      console.log('- 直接方法: ❌', error.message)
    }

  } catch (error) {
    console.log('- 测试失败:', error.message)
  }
}

// 运行测试
testBalanceMethod()

console.log('\n✅ 测试完成!')
console.log('📝 如需详细测试，请访问: http://localhost:3000/test') 