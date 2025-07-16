import { defineStore } from 'pinia'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, AVALANCHE_FUJI, validateContractConfig } from '../utils/contracts.js'
import ContractService from '../utils/contractService.js'

// 确保ethers v5的正确导入
const { providers, utils } = ethers

export const useWeb3Store = defineStore('web3', {
  state: () => ({
    // 连接状态
    isConnected: false,
    account: null,
    balance: '0',
    chainId: null,

    // 合约实例
    provider: null,
    signer: null,
    contractService: null,
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
      return balance.toFixed(4) + ' AVAX'
    },

    // 检查是否为正确网络
    isCorrectNetwork: (state) => {
      return state.chainId === parseInt(AVALANCHE_FUJI.chainId, 16)
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

        // 检查是否安装了MetaMask
        if (!window.ethereum) {
          throw new Error('请安装MetaMask钱包')
        }

        console.log('🔗 正在连接钱包...')

          // 请求账户访问权限
        const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts'
            })

        if (accounts.length === 0) {
          throw new Error('未获取到账户权限')
        }

        // 创建provider - 修复ethers v5兼容性问题
        this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
        
        // 等待provider准备就绪
        await this.provider.ready

        // 获取网络信息
        const network = await this.provider.getNetwork()
        this.chainId = network.chainId
        console.log('🌐 当前网络:', network.name, 'Chain ID:', this.chainId)

        // 获取signer
          this.signer = this.provider.getSigner()
        this.account = await this.signer.getAddress()

        console.log('👤 连接的账户:', this.account)

        // 获取余额
        await this.updateBalance()

        // 检查网络
        if (!this.isCorrectNetwork) {
          console.warn('⚠️ 当前网络不是Avalanche Fuji测试网')
          try {
            await this.switchToAvalanche()
          } catch (switchError) {
            console.warn('⚠️ 自动切换网络失败，请手动切换到Avalanche Fuji测试网')
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
        console.log('✅ 钱包连接成功:', this.account)
        console.log('💰 账户余额:', this.formattedBalance)
        console.log('🔗 合约初始化:', contractsInitialized ? '成功' : '失败')
        console.log('👂 事件监听器:', this.eventListenersActive ? '已激活' : '未激活')

        return true

      } catch (error) {
        console.error('❌ 钱包连接失败:', error)
        this.error = error.message
        this.isConnected = false
        
        // 清理部分初始化的状态
        this.provider = null
        this.signer = null
        this.account = null
        this.chainId = null
        
        throw error
      } finally {
        this.loading = false
      }
    },

    async disconnectWallet() {
      try {
        console.log('🔌 断开钱包连接...')
        
        // 清理合约服务
      if (this.contractService) {
        this.contractService.cleanup()
        this.contractService = null
      }

        // 移除事件监听
        this.removeWalletEventListeners()

        // 重置状态
      this.isConnected = false
      this.account = null
      this.balance = '0'
      this.chainId = null
      this.provider = null
      this.signer = null
      this.contracts = {
        taskFactory: null,
        biddingSystem: null,
        escrow: null,
        disputeDAO: null
      }
        this.eventListenersActive = false
        this.taskCache.clear()
      this.error = null

        console.log('✅ 钱包连接已断开')
      } catch (error) {
        console.error('❌ 断开连接失败:', error)
      }
    },

    async updateBalance() {
      try {
        if (!this.provider || !this.account) return

        const balance = await this.provider.getBalance(this.account)
        this.balance = ethers.utils.formatEther(balance)
        console.log('💰 余额更新:', this.formattedBalance)
      } catch (error) {
        console.error('❌ 更新余额失败:', error)
      }
    },

    async switchToAvalanche() {
      try {
        console.log('🔄 切换到Avalanche Fuji测试网...')
        
        // 尝试切换到Avalanche Fuji网络
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AVALANCHE_FUJI.chainId }],
        })
        
        console.log('✅ 成功切换到Avalanche Fuji测试网')
      } catch (switchError) {
        // 如果网络不存在，尝试添加网络
        if (switchError.code === 4902) {
          try {
            console.log('📡 添加Avalanche Fuji网络配置...')
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
              params: [AVALANCHE_FUJI],
          })
            console.log('✅ 成功添加Avalanche Fuji网络')
          } catch (addError) {
            console.error('❌ 添加网络失败:', addError)
            throw new Error('无法添加Avalanche Fuji网络，请手动添加')
          }
        } else {
          console.error('❌ 切换网络失败:', switchError)
          throw new Error('网络切换失败，请手动切换到Avalanche Fuji测试网')
        }
      }
    },

    // ==================== 合约初始化 ====================

    async initializeContracts() {
      try {
        if (!this.provider || !this.signer) {
          throw new Error('Provider或Signer未初始化')
        }

        // 验证合约配置
        const validation = validateContractConfig()
        this.contractConfigValid = validation.valid
        this.configErrors = validation.errors

        if (!validation.valid) {
          console.warn('⚠️ 合约配置验证失败:', validation.errors)
        }

        // 清理旧的合约服务
        if (this.contractService) {
          this.contractService.cleanup()
          this.contractService = null
        }

        // 创建合约服务实例
        this.contractService = new ContractService(this.provider, this.signer)
        
        // 直接访问合约实例
        this.contracts = this.contractService.contracts
        
        console.log('✅ 合约服务初始化成功')
        return true
      } catch (error) {
        console.error('❌ 合约初始化失败:', error)
        this.error = error.message
        this.contractService = null
        return false
      }
    },

    // ==================== 事件监听管理 ====================

    setupWalletEventListeners() {
      if (!window.ethereum) return

      // 账户变更
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('👤 账户变更:', accounts)
        if (accounts.length === 0) {
          this.disconnectWallet()
        } else if (accounts[0] !== this.account) {
          this.account = accounts[0]
          this.updateBalance()
          this.initializeContracts()
        }
      })

      // 网络变更
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('🌐 网络变更:', chainId)
        this.chainId = parseInt(chainId, 16)
        if (!this.isCorrectNetwork) {
          console.warn('⚠️ 当前网络不是Avalanche Fuji测试网')
        }
        this.initializeContracts()
      })

      // 连接状态变更
      window.ethereum.on('connect', (connectInfo) => {
        console.log('🔗 钱包连接:', connectInfo)
      })

      // 断开连接
      window.ethereum.on('disconnect', (error) => {
        console.log('🔌 钱包断开:', error)
        this.disconnectWallet()
      })
    },

    removeWalletEventListeners() {
      if (!window.ethereum) return

        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      window.ethereum.removeAllListeners('connect')
      window.ethereum.removeAllListeners('disconnect')
    },

    setupContractEventListeners() {
      if (!this.contractService) {
        console.warn('⚠️ 合约服务未初始化，跳过事件监听器设置')
        this.eventListenersActive = false
        return
      }

      try {
        console.log('🔗 开始设置合约事件监听器...')
        
        this.contractService.setupTaskEventListeners((event) => {
          console.log('📋 合约事件:', event)
          this.handleContractEvent(event)
        })
        
        // 检查事件监听器是否真正激活
        this.eventListenersActive = this.contractService.eventListenersActive || false
        
        if (this.eventListenersActive) {
          console.log('✅ 合约事件监听器设置完成')
          } else {
          console.log('⚠️ 事件监听器未激活，将使用手动刷新模式')
          }
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

    async createTask(title, ipfsHash, reward, deadline, taskType) {
      try {
        this.loading = true
        this.error = null

        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        console.log('🚀 创建任务:', { title, ipfsHash, reward, deadline, taskType })

        // 转换deadline为时间戳
        const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)

        const result = await this.contractService.createTask(
          title,
          ipfsHash,
          reward.toString(),
          deadlineTimestamp,
          taskType
        )

        // 添加到交易历史
        this.addToTxHistory({
          hash: result.txHash,
          type: 'createTask',
          status: 'confirmed',
          timestamp: Date.now(),
          data: { 
            title, 
            reward, 
            taskId: result.taskId,
            platformFee: result.platformFee 
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

        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        console.log(`🎯 执行任务操作: ${action}`, { taskId, params })

        const result = await this.contractService[action](taskId, ...params)

        // 添加到交易历史
        this.addToTxHistory({
          hash: result.txHash,
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
        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        return await this.contractService.getAllTasks()
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

        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        const task = await this.contractService.getTaskById(taskId)
        
        // 缓存任务数据
        this.taskCache.set(taskId, task)
        
        return task
      } catch (error) {
        console.error('❌ 获取任务详情失败:', error)
        this.error = error.message
        throw error
      }
    },

    async getTasksByOwner(ownerAddress) {
      try {
        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        return await this.contractService.getTasksByOwner(ownerAddress)
      } catch (error) {
        console.error('❌ 获取用户任务失败:', error)
        this.error = error.message
        throw error
      }
    },

    async getTaskParticipants(taskId) {
      try {
        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        return await this.contractService.getTaskParticipants(taskId)
      } catch (error) {
        console.error('❌ 获取任务参与者失败:', error)
        this.error = error.message
        throw error
      }
    },

    async loadPlatformFeeInfo() {
      try {
        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        this.platformFeeInfo = await this.contractService.getPlatformFeeInfo()
        console.log('💰 平台费用信息:', this.platformFeeInfo)
      } catch (error) {
        console.error('❌ 获取平台费用信息失败:', error)
      }
    },

    async calculatePlatformFee(rewardAmount) {
      try {
        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        return await this.contractService.calculatePlatformFee(rewardAmount)
      } catch (error) {
        console.error('❌ 计算平台费用失败:', error)
        throw error
      }
    },

    async calculateTotalAmount(rewardAmount) {
      try {
        if (!this.contractService) {
          throw new Error('合约服务未初始化')
        }

        return await this.contractService.calculateTotalAmount(rewardAmount)
      } catch (error) {
        console.error('❌ 计算总金额失败:', error)
        throw error
      }
    },

    // ==================== 任务状态流程管理 ====================

    getAvailableActions(task) {
      if (!this.contractService || !this.account) {
        return []
      }

      return this.contractService.getAvailableActions(task, this.account)
    },

    getTaskProgress(status) {
      if (!this.contractService) {
        return { step: 1, total: 6, percentage: 16, label: '未知' }
      }

      return this.contractService.getTaskProgress(status)
    },

    checkPermission(task, action) {
      if (!this.contractService || !this.account) {
        return false
      }

      return this.contractService.checkPermission(task, action, this.account)
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
        network: AVALANCHE_FUJI,
        validation: this.validateConfig()
      }
    },

    // ==================== 清理方法 ====================

    cleanup() {
      try {
        this.removeWalletEventListeners()
        
        if (this.contractService) {
          this.contractService.cleanup()
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