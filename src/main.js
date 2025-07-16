// 首先加载polyfills
import './polyfills.js'

// 在开发环境中测试Buffer
if (import.meta.env.DEV) {
  import('./test-buffer.js').then(() => {
    console.log('🧪 Buffer测试完成')
  }).catch(error => {
    console.error('❌ Buffer测试失败:', error)
  })
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 开发环境下添加全局调试方法
if (import.meta.env.DEV) {
  // 等待应用挂载后添加全局调试方法
  app.mount('#app')
  
  // 添加全局IPFS调试方法
  window.dandelionDebug = {
    async testIPFS() {
      const { useDataStore } = await import('./stores/data')
      const { useIpfsStore } = await import('./stores/ipfs')
      
      const dataStore = useDataStore()
      const ipfsStore = useIpfsStore()
      
      console.log('🧪 开始IPFS连接测试...')
      const result = await dataStore.testIPFSConnection()
      
      if (result.success) {
        console.log('✅ IPFS测试成功！', result)
      } else {
        console.error('❌ IPFS测试失败:', result.error)
      }
      
      return result
    },
    
    async viewAllHashes() {
      const { useIpfsStore } = await import('./stores/ipfs')
      const ipfsStore = useIpfsStore()
      
      console.log('🔍 查看所有IPFS哈希...')
      return await ipfsStore.listAllHashes()
    },
    
    async forceSync() {
      const { useDataStore } = await import('./stores/data')
      const dataStore = useDataStore()
      
      console.log('🔄 强制同步数据...')
      return await dataStore.forceSync()
    },
    
    async quickOverview() {
      const { useIpfsStore } = await import('./stores/ipfs')
      const ipfsStore = useIpfsStore()
      
      console.log('📊 IPFS节点快速概览...')
      return await ipfsStore.quickHashOverview()
    },
    
    testBuffer() {
      return import('./test-buffer.js')
    }
  }
  
  console.log(`
🌻 蒲公英任务平台 - IPFS调试工具已加载

可用的调试命令：
• dandelionDebug.testIPFS() - 测试IPFS连接
• dandelionDebug.viewAllHashes() - 查看所有哈希
• dandelionDebug.forceSync() - 强制同步数据
• dandelionDebug.quickOverview() - 快速概览
• dandelionDebug.testBuffer() - 测试Buffer功能

示例：
dandelionDebug.testIPFS().then(result => console.log(result))
  `)

  // IPFS调试工具
  window.ipfsDebug = {
    // 查看所有IPFS哈希
    listAllHashes: async () => {
      const ipfsStore = useIpfsStore()
      return await ipfsStore.listAllHashes()
    },
    
    // 快速概览
    quickOverview: async () => {
      const ipfsStore = useIpfsStore()
      return await ipfsStore.quickHashOverview()
    },
    
    // 搜索特定哈希
    searchHash: async (hash) => {
      const ipfsStore = useIpfsStore()
      return await ipfsStore.searchHashDetails(hash)
    },
    
    // 测试IPFS连接
    testConnection: async () => {
      const ipfsStore = useIpfsStore()
      try {
        await ipfsStore.initIPFS()
        console.log('✅ IPFS连接测试成功')
        return true
      } catch (error) {
        console.error('❌ IPFS连接测试失败:', error)
        return false
      }
    }
  }

  // 合约调试工具
  window.contractDebug = {
    // 调试任务状态
    debugTask: async (taskId) => {
      const contractService = (await import('./utils/contractService.js')).default
      return await contractService.debugTaskStatus(taskId)
    },
    
    // 调试Gas估算
    debugGas: async (taskId) => {
      const web3Store = useWeb3Store()
      if (!web3Store.contractService) {
        console.log('⚠️ 合约服务未初始化')
        return
      }
      return await web3Store.contractService.debugGas(taskId)
    },
    
    // 测试Gas配置
    testGasConfig: () => {
      console.log('🧪 测试Gas配置:')
      console.log('  - 创建任务:', 500000)
      console.log('  - 开始竞标:', 300000)
      console.log('  - 参与任务:', 250000)
      console.log('  - 选择中标者:', 200000)
      console.log('  - 申请验证:', 150000)
      console.log('  - 确认任务:', 150000)
      console.log('  - 发起争议:', 200000)
      console.log('  - 结算任务:', 300000)
      console.log('  - 取消任务:', 150000)
      console.log('💡 所有操作现在使用固定Gas限制，避免estimateGas代理对象问题')
    },
    
    // 获取任务详情
    getTask: async (taskId) => {
      const contractService = (await import('./utils/contractService.js')).default
      return await contractService.getTaskById(taskId)
    },
    
    // 获取所有任务
    getAllTasks: async () => {
      const contractService = (await import('./utils/contractService.js')).default
      return await contractService.getAllTasks()
    },
    
    // 检查连接状态
    checkConnection: async () => {
      const web3Store = useWeb3Store()
      console.log('🔗 Web3连接状态:')
      console.log('  - 已连接:', web3Store.isConnected)
      console.log('  - 账户地址:', web3Store.account)
      console.log('  - 网络:', web3Store.network)
      console.log('  - 合约地址:', web3Store.contractAddresses)
      return {
        connected: web3Store.isConnected,
        account: web3Store.account,
        network: web3Store.network,
        contracts: web3Store.contractAddresses
      }
    },
    
    // 测试解析事件
    testParseEvents: () => {
      console.log('🧪 测试事件解析功能')
      
      // 创建一个模拟的交易收据
      const mockReceipt = {
        events: [
          {
            event: 'TaskCreated',
            address: '0x123...',
            blockNumber: 12345,
            transactionHash: '0xabc...',
            args: {
              taskId: { toString: () => '1' },
              creator: '0x456...',
              title: '测试任务'
            }
          }
        ]
      }
      
      // 模拟ContractService实例
      const mockService = {
        parseTransactionEvents: (receipt) => {
          try {
            const events = []
            
            if (!receipt || !receipt.events) {
              console.log('📋 交易收据中没有事件')
              return events
            }
            
            for (const event of receipt.events) {
              if (event.event && event.args) {
                const parsedEvent = {
                  name: event.event,
                  address: event.address,
                  blockNumber: event.blockNumber,
                  transactionHash: event.transactionHash,
                  args: {}
                }
                
                for (const [key, value] of Object.entries(event.args)) {
                  if (isNaN(key)) {
                    if (value && typeof value.toString === 'function') {
                      parsedEvent.args[key] = value.toString()
                    } else {
                      parsedEvent.args[key] = value
                    }
                  }
                }
                
                events.push(parsedEvent)
                console.log('📡 解析到事件:', parsedEvent)
              }
            }
            
            return events
          } catch (error) {
            console.error('❌ 解析交易事件失败:', error)
            return []
          }
        }
      }
      
      const result = mockService.parseTransactionEvents(mockReceipt)
      console.log('✅ 事件解析测试完成，结果:', result)
      return result
    }
  }

  // 将调试工具添加到全局对象（仅在开发环境）
  window.debugContract = {
    // 调试合约状态
    async checkContractState() {
      const { useWeb3Store } = await import('./stores/web3')
      const web3Store = useWeb3Store()
      if (!web3Store.contractService) {
        console.error('❌ 合约服务未初始化')
        return
      }
      return await web3Store.contractService.debugContractState()
    },
    
    // 获取所有任务ID
    async getAllTaskIds() {
      const { useWeb3Store } = await import('./stores/web3')
      const web3Store = useWeb3Store()
      if (!web3Store.contractService) {
        console.error('❌ 合约服务未初始化')
        return
      }
      return await web3Store.contractService.getAllExistingTaskIds()
    },
    
    // 检查特定任务
    async checkTask(taskId) {
      const { useWeb3Store } = await import('./stores/web3')
      const web3Store = useWeb3Store()
      if (!web3Store.contractService) {
        console.error('❌ 合约服务未初始化')
        return
      }
      
      try {
        console.log('🔍 检查任务:', taskId)
        
        // 直接访问tasks映射
        const taskData = await web3Store.contractService.contracts.taskFactory.tasks(taskId)
        console.log('📋 任务原始数据:', taskData)
        
        if (taskData.id.toNumber() === 0) {
          console.log('❌ 任务不存在')
          return { exists: false, taskId }
        }
        
        // 获取完整任务信息
        const fullTask = await web3Store.contractService.getTaskById(taskId)
        console.log('📋 完整任务信息:', fullTask)
        
        return { exists: true, taskId, data: fullTask }
      } catch (error) {
        console.error('❌ 检查任务失败:', error)
        return { exists: false, taskId, error: error.message }
      }
    },
    
    // 检查参与任务的条件
    async checkParticipateConditions(taskId) {
      const { useWeb3Store } = await import('./stores/web3')
      const web3Store = useWeb3Store()
      if (!web3Store.contractService) {
        console.error('❌ 合约服务未初始化')
        return
      }
      
      try {
        console.log('🔍 检查参与任务条件，任务ID:', taskId)
        
        const conditions = {
          taskId: taskId,
          taskExists: false,
          taskStatus: null,
          isCorrectStatus: false,
          isLocked: false,
          isExpired: false,
          userAddress: null,
          isCreator: false,
          alreadyParticipant: false,
          canParticipate: false,
          reasons: []
        }
        
        // 获取用户地址
        conditions.userAddress = await web3Store.contractService.signer.getAddress()
        console.log('👤 用户地址:', conditions.userAddress)
        
        // 检查任务是否存在
        try {
          const taskData = await web3Store.contractService.contracts.taskFactory.tasks(taskId)
          if (taskData.id.toNumber() === 0) {
            conditions.reasons.push('任务不存在')
            console.log('❌ 任务不存在')
            return conditions
          }
          conditions.taskExists = true
        } catch (error) {
          conditions.reasons.push('无法获取任务信息')
          console.log('❌ 无法获取任务信息:', error.message)
          return conditions
        }
        
        // 获取完整任务信息
        const task = await web3Store.contractService.getTaskById(taskId)
        conditions.taskStatus = task.status
        
        console.log('📋 任务详情:', {
          id: task.id,
          title: task.title,
          status: task.status,
          statusText: task.statusText,
          creator: task.creator,
          locked: task.locked,
          isExpired: task.isExpired,
          participants: task.participants
        })
        
        // 检查任务状态（必须是竞标中 = 1）
        conditions.isCorrectStatus = task.status === 1
        if (!conditions.isCorrectStatus) {
          conditions.reasons.push(`任务状态不正确：${task.statusText}，需要：竞标中`)
        }
        
        // 检查是否锁定
        conditions.isLocked = task.locked
        if (conditions.isLocked) {
          conditions.reasons.push('任务已被锁定')
        }
        
        // 检查是否过期
        conditions.isExpired = task.isExpired
        if (conditions.isExpired) {
          conditions.reasons.push('任务已过期')
        }
        
        // 检查是否是创建者
        conditions.isCreator = task.creator.toLowerCase() === conditions.userAddress.toLowerCase()
        if (conditions.isCreator) {
          conditions.reasons.push('创建者不能参与自己的任务')
        }
        
        // 检查是否已经参与
        const participants = Array.isArray(task.participants) ? task.participants : []
        conditions.alreadyParticipant = participants.some(p => {
          const participantAddress = typeof p === 'string' ? p : (p && p.address ? p.address : '')
          return participantAddress && participantAddress.toLowerCase() === conditions.userAddress.toLowerCase()
        })
        
        if (conditions.alreadyParticipant) {
          conditions.reasons.push('已经参与了此任务')
        }
        
        // 最终判断是否可以参与
        conditions.canParticipate = 
          conditions.taskExists &&
          conditions.isCorrectStatus &&
          !conditions.isLocked &&
          !conditions.isExpired &&
          !conditions.isCreator &&
          !conditions.alreadyParticipant
        
        console.log('📊 参与条件检查结果:')
        console.log('  ✅ 任务存在:', conditions.taskExists)
        console.log('  ✅ 状态正确:', conditions.isCorrectStatus)
        console.log('  ✅ 未锁定:', !conditions.isLocked)
        console.log('  ✅ 未过期:', !conditions.isExpired)
        console.log('  ✅ 非创建者:', !conditions.isCreator)
        console.log('  ✅ 未参与:', !conditions.alreadyParticipant)
        console.log('  🎯 可以参与:', conditions.canParticipate)
        
        if (!conditions.canParticipate) {
          console.log('❌ 无法参与的原因:', conditions.reasons)
        }
        
        return conditions
      } catch (error) {
        console.error('❌ 检查参与条件失败:', error)
        return {
          taskId: taskId,
          error: error.message,
          canParticipate: false
        }
      }
    },
    
    // 同步数据
    async syncData() {
      const { useDataStore } = await import('./stores/data')
      const dataStore = useDataStore()
      console.log('🔄 开始同步数据...')
      await dataStore.loadTasksFromContract()
      console.log('✅ 数据同步完成')
    }
  }

  console.log('🔧 调试工具已加载到浏览器控制台:')
  console.log('📋 IPFS调试: window.ipfsDebug')
  console.log('  - ipfsDebug.listAllHashes() - 查看所有IPFS哈希')
  console.log('  - ipfsDebug.quickOverview() - 快速概览')
  console.log('  - ipfsDebug.searchHash(hash) - 搜索特定哈希')
  console.log('  - ipfsDebug.testConnection() - 测试IPFS连接')
  console.log('')
  console.log('📋 合约调试: window.contractDebug')
  console.log('  - contractDebug.debugTask(taskId) - 调试任务状态')
  console.log('  - contractDebug.debugGas(taskId) - 调试Gas估算')
  console.log('  - contractDebug.getTask(taskId) - 获取任务详情')
  console.log('  - contractDebug.getAllTasks() - 获取所有任务')
  console.log('  - contractDebug.checkConnection() - 检查连接状态')
  console.log('  - contractDebug.testParseEvents() - 测试事件解析功能')
  console.log('')
  console.log('💡 使用示例:')
  console.log('  await contractDebug.debugTask(1) // 调试任务ID为1的任务')
  console.log('  await contractDebug.debugGas(1) // 调试任务ID为1的Gas估算')
  console.log('🔧 调试工具已加载到 window.debugContract')
  console.log('💡 使用方法:')
  console.log('  - window.debugContract.checkContractState() // 检查合约状态')
  console.log('  - window.debugContract.getAllTaskIds() // 获取所有任务ID')
  console.log('  - window.debugContract.checkTask(taskId) // 检查特定任务')
  console.log('  - window.debugContract.checkParticipateConditions(taskId) // 检查参与任务的条件')
  console.log('  - window.debugContract.syncData() // 同步数据')
} else {
  app.mount('#app')
}
