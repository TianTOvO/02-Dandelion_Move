import { defineStore } from 'pinia'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, APTOS_TESTNET, validateContractConfig } from '../utils/contracts.js'
import aptosWalletService from '../utils/aptosWalletService.js'

// Aptos 钱包服务配置

export const useWeb3Store = defineStore('web3', {
  state: () => ({
    // 连接状态
    isConnected: false,
    account: null,
    balance: '0',
    chainId: null,

    // Aptos 钱包服务
    aptosWalletService: null,

    // 合约实例 (适配 Aptos)
    contracts: {
      taskFactory: null,
      biddingSystem: null,
      escrow: null,
      disputeDAO: null
    },

    // 错误和加载状态
    error: null,
    loading: false,

    // 交易状态
    pendingTx: null,
    txHistory: [],

    // 合约配置验证状态
    contractConfigValid: false,
    configErrors: [],

    // 任务状态缓存
    taskCache: new Map(),

    // 事件监听状态
    eventListenersActive: false,

    // 平台费用信息
    platformFeeInfo: {
      platformAddress: '',
      feeRate: 0,
      totalFees: '0'
    }
  }),

  getters: {
    // 格式化账户地址
    formattedAccount: (state) => {
      if (!state.account) return ''
      return `${state.account.slice(0, 6)}...${state.account.slice(-4)}`
    },

    // 格式化余额
    formattedBalance: (state) => {
      const balance = parseFloat(state.balance)
      return balance.toFixed(4) + ' APT'
    },

    // 检查是否为正确网络
    isCorrectNetwork: (state) => {
      // 确保类型比较正确，chainId 可能是字符串或数字
      const currentChainId = parseInt(state.chainId)
      const expectedChainId = parseInt(APTOS_TESTNET.chainId)
      return currentChainId === expectedChainId
    },

    // 获取最近的交易
    recentTransactions: (state) => {
      return state.txHistory.slice(0, 10)
    },

    // 检查是否有待处理交易
    hasPendingTx: (state) => {
      return state.pendingTx !== null
    },

    // 获取合约地址
    contractAddress: (state) => {
      return CONTRACT_ADDRESSES.TaskFactory || '未配置'
    }
  },

  actions: {
    // ==================== 钱包连接管理 ====================

    async connectWallet() {
      try {
        this.loading = true
        this.error = null

        console.log('🔗 正在连接 Petra 钱包...')

        // 使用 Aptos 钱包服务连接
        const result = await aptosWalletService.connectWallet()

        if (!result.success) {
          throw new Error('钱包连接失败')
        }

        // 更新状态
        this.account = result.address
        this.chainId = result.network.chainId
        this.aptosWalletService = aptosWalletService
        this.isConnected = true

        console.log('👤 连接的账户:', this.account)
        console.log('🌐 当前网络:', result.network.name, 'Chain ID:', this.chainId)

        // 获取余额
        await this.updateBalance()

        // 检查网络
        if (!this.isCorrectNetwork) {
          console.warn('⚠️ 当前网络不是 Aptos 测试网')
          try {
            await this.switchToAptosTestnet()
          } catch (switchError) {
            console.warn('⚠️ 自动切换网络失败，请手动切换到 Aptos 测试网')
          }
        }

        // 初始化合约
        const contractsInitialized = await this.initializeContracts()
        if (!contractsInitialized) {
          console.warn('⚠️ 合约初始化失败，但钱包连接成功')
        }

        // 设置事件监听
        this.setupWalletEventListeners()
        if (contractsInitialized) {
          this.setupContractEventListeners()
        }

        // 获取平台费用信息
        if (contractsInitialized) {
          try {
            await this.loadPlatformFeeInfo()
          } catch (feeError) {
            console.warn('⚠️ 获取平台费用信息失败:', feeError.message)
          }
        }

        this.isConnected = true
        console.log('✅ Petra 钱包连接成功:', this.account)
        console.log('💰 账户余额:', this.formattedBalance)
        console.log('🔗 合约初始化:', contractsInitialized ? '成功' : '失败')
        console.log('👂 事件监听器:', this.eventListenersActive ? '已激活' : '未激活')

        return true

      } catch (error) {
        console.error('❌ Petra 钱包连接失败:', error)
        this.error = error.message
        this.isConnected = false

        // 清理部分初始化的状态
        this.aptosWalletService = null
        this.account = null
        this.chainId = null

        throw error
      } finally {
        this.loading = false
      }
    },

    async disconnectWallet() {
      try {
        console.log('🔌 断开 Petra 钱包连接...')

        // 清理 Aptos 钱包服务
        if (this.aptosWalletService) {
          this.aptosWalletService.cleanup()
          this.aptosWalletService = null
        }

        // 移除事件监听
        this.removeWalletEventListeners()

        // 重置状态
        this.isConnected = false
        this.account = null
        this.balance = '0'
        this.chainId = null
        this.contracts = {
          taskFactory: null,
          biddingSystem: null,
          escrow: null,
          disputeDAO: null
        }
        this.eventListenersActive = false
        this.taskCache.clear()
        this.error = null

        console.log('✅ Petra 钱包连接已断开')
      } catch (error) {
        console.error('❌ 断开连接失败:', error)
      }
    },

    async updateBalance() {
      try {
        if (!this.aptosWalletService || !this.account) return

        const balance = await this.aptosWalletService.getBalance()
        this.balance = balance
        console.log('💰 余额更新:', this.formattedBalance)
      } catch (error) {
        console.error('❌ 更新余额失败:', error)
      }
    },

    async switchToAptosTestnet() {
      try {
        console.log('🔄 切换到 Aptos 测试网...')

        if (!this.aptosWalletService) {
          throw new Error('钱包服务未初始化')
        }

        await this.aptosWalletService.switchNetwork('testnet')
        this.chainId = APTOS_TESTNET.chainId

        console.log('✅ 成功切换到 Aptos 测试网')
      } catch (error) {
        console.error('❌ 切换网络失败:', error)
        throw new Error('网络切换失败，请手动切换到 Aptos 测试网')
      }
    },

    // ==================== 合约初始化 ====================

    async initializeContracts() {
      try {
        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        // 验证合约配置
        const validation = validateContractConfig()
        this.contractConfigValid = validation.valid
        this.configErrors = validation.errors

        if (!validation.valid) {
          console.warn('⚠️ 合约配置验证失败:', validation.errors)
        }

        // 初始化 Aptos 合约服务
        if (!this.aptosContractService) {
          const AptosContractService = (await import('../utils/aptosContractService.js')).default
          this.aptosContractService = new AptosContractService()
          this.aptosContractService.setAccount({ address: this.account })

          // 自动检测合约部署状态并设置模式
          await this.aptosContractService.autoDetectMode()
        }

        console.log('✅ Aptos 合约服务初始化成功')
        return true
      } catch (error) {
        console.error('❌ 合约初始化失败:', error)
        this.error = error.message
        return false
      }
    },

    // ==================== 事件监听管理 ====================

    setupWalletEventListeners() {
      if (!this.aptosWalletService) return

      // 设置 Aptos 钱包事件监听器
      this.aptosWalletService.setupEventListeners({
        onAccountChange: (account) => {
          console.log('👤 账户变更:', account)
          if (!account) {
            this.disconnectWallet()
          } else if (account !== this.account) {
            this.account = account
            this.updateBalance()
            this.initializeContracts()
          }
        },
        onNetworkChange: (network) => {
          console.log('🌐 网络变更:', network)
          this.chainId = network.chainId
          if (!this.isCorrectNetwork) {
            console.warn('⚠️ 当前网络不是 Aptos 测试网')
          }
          this.initializeContracts()
        },
        onDisconnect: (error) => {
          console.log('🔌 钱包断开:', error)
          this.disconnectWallet()
        }
      })
    },

    removeWalletEventListeners() {
      if (!this.aptosWalletService) return

      this.aptosWalletService.removeEventListeners()
    },

    setupContractEventListeners() {
      if (!this.aptosWalletService) {
        console.warn('⚠️ Aptos 钱包服务未初始化，跳过事件监听器设置')
        this.eventListenersActive = false
        return
      }

      try {
        console.log('🔗 开始设置 Aptos 合约事件监听器...')

        // 这里可以添加 Aptos 合约事件监听器设置
        // 暂时设置为手动刷新模式
        this.eventListenersActive = false
        console.log('⚠️ 事件监听器未激活，将使用手动刷新模式')
      } catch (error) {
        console.error('❌ 设置合约事件监听器失败:', error)
        console.warn('⚠️ 事件监听器设置失败，但不影响钱包连接')

        // 设置标志表示事件监听器未激活
        this.eventListenersActive = false

        // 不抛出错误，允许钱包连接继续
      }
    },

    handleContractEvent(event) {
      // 处理合约事件
      switch (event.type) {
        case 'TaskCreated':
          this.addToTxHistory({
            hash: event.transactionHash,
            type: 'taskCreated',
            status: 'confirmed',
            timestamp: Date.now(),
            data: {
              taskId: event.taskId,
              creator: event.creator,
              reward: event.reward
            }
          })
          break

        case 'TaskUpdated':
          this.addToTxHistory({
            hash: event.transactionHash,
            type: 'taskUpdated',
            status: 'confirmed',
            timestamp: Date.now(),
            data: {
              taskId: event.taskId,
              status: event.status,
              statusText: event.statusText,
              winner: event.winner
            }
          })
          break

        case 'TaskRemoved':
          this.addToTxHistory({
            hash: event.transactionHash,
            type: 'taskRemoved',
            status: 'confirmed',
            timestamp: Date.now(),
            data: {
              taskId: event.taskId
            }
          })
          break

        case 'PlatformFeeCollected':
          this.addToTxHistory({
            hash: event.transactionHash,
            type: 'platformFeeCollected',
            status: 'confirmed',
            timestamp: Date.now(),
            data: {
              taskId: event.taskId,
              feeAmount: event.feeAmount
            }
          })
          break
      }

      // 清除相关缓存
      this.taskCache.delete(event.taskId)
    },

    // ==================== TaskFactory 合约交互 ====================

    async createTask(title, ipfsHash, reward, deadline, taskType, biddingPeriod, developmentPeriod) {
      try {
        this.loading = true
        this.error = null

        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        console.log('🚀 创建任务:', { title, ipfsHash, reward, deadline, taskType, biddingPeriod, developmentPeriod })

        // 转换deadline为时间戳
        const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)

        // 使用 Aptos 合约服务创建任务
        if (!this.aptosContractService) {
          throw new Error('Aptos 合约服务未初始化')
        }

        const result = await this.aptosContractService.createTask({
          title,
          ipfsHash,
          reward: reward.toString(),
          deadline: deadlineTimestamp,
          taskType: parseInt(taskType),
          biddingPeriod: parseInt(biddingPeriod),
          developmentPeriod: parseInt(developmentPeriod)
        })

        // 添加到交易历史
        this.addToTxHistory({
          hash: result.hash,
          type: 'createTask',
          status: 'confirmed',
          timestamp: Date.now(),
          data: {
            title,
            reward,
            taskId: result.taskId
          }
        })

        // 更新余额
        await this.updateBalance()

        console.log('✅ 任务创建成功:', result)
        return result
      } catch (error) {
        console.error('❌ 创建任务失败:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async startBidding(taskId) {
      return this.executeTaskAction('startBidding', taskId)
    },

    async participateInTask(taskId, demoUrl) {
      return this.executeTaskAction('participateInTask', taskId, demoUrl)
    },

    async selectWinner(taskId, winnerAddress) {
      return this.executeTaskAction('selectWinner', taskId, winnerAddress)
    },

    async requestTaskVerification(taskId, completeUrl) {
      return this.executeTaskAction('requestTaskVerification', taskId, completeUrl)
    },

    async employerConfirmTask(taskId, isConfirm) {
      return this.executeTaskAction('employerConfirmTask', taskId, isConfirm)
    },

    async disputeTask(taskId) {
      return this.executeTaskAction('disputeTask', taskId)
    },

    async settleTask(taskId) {
      return this.executeTaskAction('settleTask', taskId)
    },

    async cancelTask(taskId) {
      return this.executeTaskAction('cancelTask', taskId)
    },

    // 通用任务操作执行器
    async executeTaskAction(action, taskId, ...params) {
      try {
        this.loading = true
        this.error = null

        if (!this.aptosContractService) {
          throw new Error('Aptos合约服务未初始化')
        }

        console.log(`🎯 执行任务操作: ${action}`, { taskId, params })

        // 使用aptosContractService执行操作
        const result = await this.aptosContractService[action](taskId, ...params)

        // 添加到交易历史
        this.addToTxHistory({
          hash: result.txHash || result.hash,
          type: action,
          status: 'confirmed',
          timestamp: Date.now(),
          data: { taskId, ...result }
        })

        // 清除任务缓存
        this.taskCache.delete(taskId)

        // 更新余额
        await this.updateBalance()

        console.log(`✅ ${action} 执行成功:`, result)
        return result
      } catch (error) {
        console.error(`❌ ${action} 执行失败:`, error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // ==================== 查询方法 ====================

    async getAllTasks() {
      try {
        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        // 这里可以添加从 Aptos 合约获取任务的逻辑
        console.log('📋 从 Aptos 合约获取任务列表')
        return []
      } catch (error) {
        console.error('❌ 获取任务列表失败:', error)
        this.error = error.message
        throw error
      }
    },

    async getTaskById(taskId) {
      try {
        // 检查缓存
        if (this.taskCache.has(taskId)) {
          return this.taskCache.get(taskId)
        }

        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        // 这里可以添加从 Aptos 合约获取任务详情的逻辑
        console.log('📋 从 Aptos 合约获取任务详情:', taskId)
        const task = null // 暂时返回 null

        // 缓存任务数据
        if (task) {
          this.taskCache.set(taskId, task)
        }

        return task
      } catch (error) {
        console.error('❌ 获取任务详情失败:', error)
        this.error = error.message
        throw error
      }
    },

    async getTasksByOwner(ownerAddress) {
      try {
        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        // 这里可以添加从 Aptos 合约获取用户任务的逻辑
        console.log('📋 从 Aptos 合约获取用户任务:', ownerAddress)
        return []
      } catch (error) {
        console.error('❌ 获取用户任务失败:', error)
        this.error = error.message
        throw error
      }
    },

    async getTaskParticipants(taskId) {
      try {
        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        // 这里可以添加从 Aptos 合约获取任务参与者的逻辑
        console.log('📋 从 Aptos 合约获取任务参与者:', taskId)
        return []
      } catch (error) {
        console.error('❌ 获取任务参与者失败:', error)
        this.error = error.message
        throw error
      }
    },

    async loadPlatformFeeInfo() {
      try {
        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        // 这里可以添加从 Aptos 合约获取平台费用信息的逻辑
        console.log('💰 从 Aptos 合约获取平台费用信息')
        this.platformFeeInfo = {
          platformAddress: '',
          feeRate: 0,
          totalFees: '0'
        }
      } catch (error) {
        console.error('❌ 获取平台费用信息失败:', error)
      }
    },

    async calculatePlatformFee(rewardAmount) {
      try {
        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        // 这里可以添加从 Aptos 合约计算平台费用的逻辑
        console.log('💰 计算平台费用:', rewardAmount)
        // 暂时返回 0
        return '0'
      } catch (error) {
        console.error('❌ 计算平台费用失败:', error)
        throw error
      }
    },

    async calculateTotalAmount(rewardAmount) {
      try {
        if (!this.aptosWalletService) {
          throw new Error('Aptos 钱包服务未初始化')
        }

        // 这里可以添加从 Aptos 合约计算总金额的逻辑
        console.log('💰 计算总金额:', rewardAmount)
        // 暂时返回奖励金额
        return rewardAmount
      } catch (error) {
        console.error('❌ 计算总金额失败:', error)
        throw error
      }
    },

    // ==================== 任务状态流程管理 ====================

    getAvailableActions(task) {
      if (!this.aptosWalletService || !this.account) {
        return []
      }

      // 这里可以添加获取可用操作的逻辑
      console.log('📋 获取可用操作:', task, this.account)
      return []
    },

    getTaskProgress(status) {
      if (!this.aptosWalletService) {
        return { step: 1, total: 6, percentage: 16, label: '未知' }
      }

      // 这里可以添加获取任务进度的逻辑
      console.log('📋 获取任务进度:', status)
      return { step: 1, total: 6, percentage: 16, label: '未知' }
    },

    checkPermission(task, action) {
      if (!this.aptosWalletService || !this.account) {
        return false
      }

      // 这里可以添加检查权限的逻辑
      console.log('📋 检查权限:', task, action, this.account)
      return false
    },

    // ==================== 工具方法 ====================

    addToTxHistory(tx) {
      this.txHistory.unshift(tx)

      // 保持历史记录不超过100条
      if (this.txHistory.length > 100) {
        this.txHistory = this.txHistory.slice(0, 100)
      }
    },

    clearError() {
      this.error = null
    },

    clearTxHistory() {
      this.txHistory = []
    },

    clearTaskCache() {
      this.taskCache.clear()
    },

    // 验证配置
    validateConfig() {
      return validateContractConfig()
    },

    // 获取合约信息
    getContractInfo() {
      return {
        addresses: CONTRACT_ADDRESSES,
        abis: CONTRACT_ABIS,
        network: APTOS_TESTNET,
        validation: this.validateConfig()
      }
    },

    // ==================== 清理方法 ====================

    cleanup() {
      try {
        this.removeWalletEventListeners()

        if (this.aptosWalletService) {
          this.aptosWalletService.cleanup()
        }

        this.taskCache.clear()
        this.txHistory = []

        console.log('✅ Web3 Store 清理完成')
      } catch (error) {
        console.error('❌ 清理 Web3 Store 失败:', error)
      }
    }
  }
}) 