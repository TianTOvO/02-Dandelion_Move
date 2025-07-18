// 检查合约部署状态
import { AptosClient } from 'aptos'

const TESTNET_URL = 'https://fullnode.testnet.aptoslabs.com/v1'
const CONTRACT_ADDRESS = '0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb'

async function checkContract() {
    const client = new AptosClient(TESTNET_URL)

    try {
        console.log('🔍 检查合约部署状态...')
        console.log('📋 合约地址:', CONTRACT_ADDRESS)

        // 获取账户信息
        const accountInfo = await client.getAccount(CONTRACT_ADDRESS)
        console.log('✅ 账户存在')

        // 获取账户资源
        const resources = await client.getAccountResources(CONTRACT_ADDRESS)
        console.log('📦 账户资源数量:', resources.length)

        // 查找dandelion模块
        const dandelionModules = resources.filter(r =>
            r.type.includes('dandelion')
        )

        if (dandelionModules.length > 0) {
            console.log('✅ 找到dandelion模块:')
            dandelionModules.forEach(module => {
                console.log('  -', module.type)
            })
            console.log('\n🎉 合约已部署！可以切换到真实模式')
            console.log('💡 重新启动前端，合约将自动检测并切换到真实模式')
        } else {
            console.log('❌ 未找到dandelion模块')
            console.log('💡 需要先部署合约:')
            console.log('   1. 运行 deploy-contracts.bat')
            console.log('   2. 或者手动部署Move合约')
        }

    } catch (error) {
        console.error('❌ 检查失败:', error.message)
        console.log('💡 合约尚未部署，请先部署合约')
    }
}

checkContract() 