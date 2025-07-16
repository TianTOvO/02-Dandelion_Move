
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts.js'
import { contractTypeToFrontend, frontendTypeToContract, TASK_STATUS } from '@/stores/data.js'
// 引入Aptos SDK
import { AptosClient, AptosAccount, TxnBuilderTypes, BCS, HexString } from 'aptos'

const { utils } = ethers

/**
 * Gas限制配置（避免estimateGas的代理对象问题）
 * 
 * 说明：在某些ethers.js版本中，使用contract.estimateGas.methodName()可能会遇到
 * 代理对象兼容性问题，导致 "'get' on proxy: property 'estimateGas' is a read-only 
 * and non-configurable data property" 错误。
 * 
 * 解决方案：使用预设的Gas限制值替代动态估算，这些值基于合约方法的复杂度
 * 和历史Gas使用情况确定，提供足够的Gas限制同时避免过度消耗。
 */
const GAS_LIMITS = {
  CREATE_TASK: 500000,           // 创建任务：涉及IPFS哈希存储和资金托管
  START_BIDDING: 300000,         // 开始竞标：状态变更和事件发出
  PARTICIPATE_IN_TASK: 250000,   // 参与任务：数组操作和状态检查
  SELECT_WINNER: 200000,         // 选择中标者：简单状态变更
  REQUEST_VERIFICATION: 150000,  // 申请验证：状态变更和URL存储
  CONFIRM_TASK: 150000,          // 确认任务：简单状态变更
  DISPUTE_TASK: 200000,          // 发起争议：涉及DAO交互
  SETTLE_TASK: 300000,           // 结算任务：资金转移和状态变更
  CANCEL_TASK: 150000,           // 取消任务：状态变更和退款
  DEFAULT: 200000                // 默认Gas限制：适用于大多数操作
}

/**
 * 获取操作对应的Gas限制
 * @param {string} operation - 操作名称
 * @returns {number} Gas限制
 */
function getGasLimit(operation) {
  return GAS_LIMITS[operation.toUpperCase()] || GAS_LIMITS.DEFAULT
}

/**
 * 合约服务类 - 处理所有与智能合约的交互
 * 完全匹配 TaskFactory.sol 合约功能
 */

class ContractService {
  constructor(provider, signer, opts = {}) {
    this.provider = provider
    this.signer = signer
    this.contracts = {}
    this.eventListeners = new Map()
    // Move链相关
    this.aptosClient = opts.aptosClient || null
    this.aptosAccount = opts.aptosAccount || null
    this.isAptos = !!opts.isAptos
    if (!this.isAptos) {
      this.initializeContracts()
    }
  }

  /**
   * 初始化所有合约实例
   */
  initializeContracts() {
    if (this.isAptos) return;
    try {
      console.log('🔗 开始初始化合约实例...')
      console.log('📋 合约地址配置:', CONTRACT_ADDRESSES)
      this.contracts.taskFactory = new ethers.Contract(
        CONTRACT_ADDRESSES.TaskFactory,
        CONTRACT_ABIS.TaskFactory,
        this.signer
      )
      this.contracts.biddingSystem = new ethers.Contract(
        CONTRACT_ADDRESSES.BiddingSystem,
        CONTRACT_ABIS.BiddingSystem,
        this.signer
      )
      this.contracts.escrow = new ethers.Contract(
        CONTRACT_ADDRESSES.Escrow,
        CONTRACT_ABIS.Escrow,
        this.signer
      )
      this.contracts.disputeDAO = new ethers.Contract(
        CONTRACT_ADDRESSES.DisputeDAO,
        CONTRACT_ABIS.DisputeDAO,
        this.signer
      )
      console.log('🔗 合约实例初始化成功')
      console.log('📋 TaskFactory地址:', CONTRACT_ADDRESSES.TaskFactory)
      console.log('📋 BiddingSystem地址:', CONTRACT_ADDRESSES.BiddingSystem)
      console.log('📋 Escrow地址:', CONTRACT_ADDRESSES.Escrow)
      console.log('📋 DisputeDAO地址:', CONTRACT_ADDRESSES.DisputeDAO)
    } catch (error) {
      console.error('❌ 合约初始化失败:', error)
      console.error('❌ 错误详情:', {
        message: error.message,
        code: error.code,
        addresses: CONTRACT_ADDRESSES,
        abis: Object.keys(CONTRACT_ABIS)
      })
      throw error
    }
  }

  // ========== Move链相关 ========== //
  setAptosClient(aptosClient, aptosAccount) {
    this.aptosClient = aptosClient;
    this.aptosAccount = aptosAccount;
    this.isAptos = true;
  }

  // 示例：调用Move合约的通用方法
  async aptosSubmitEntryFunction(payload) {
    if (!this.aptosClient || !this.aptosAccount) throw new Error('Aptos未初始化');
    // 这里假设window.aptos钱包已注入
    try {
      const tx = await window.aptos.signAndSubmitTransaction(payload);
      await this.aptosClient.waitForTransaction(tx.hash);
      return tx;
    } catch (e) {
      throw new Error('Aptos合约调用失败: ' + (e.message || e));
    }
  }

  // 示例：Aptos链上创建任务（需根据Move合约实际方法名和参数调整）
  async aptosCreateTask({title, ipfsHash, reward, deadline, taskType}) {
    // 这里以Move合约的entry_function为例
    const payload = {
      type: 'entry_function_payload',
      function: '0xYourModuleAddress::task_factory::create_task', // 替换为实际Move合约方法
      type_arguments: [],
      arguments: [title, ipfsHash, reward, deadline, taskType]
    };
    return await this.aptosSubmitEntryFunction(payload);
  }

  /**
   * 更新provider和signer
   */
  updateProvider(provider, signer) {
    this.provider = provider
    this.signer = signer
    this.initializeContracts()
  }

  // ==================== TaskFactory 合约交互 ====================

  /**
   * 创建新任务 (匹配合约的createTask函数)
   * @param {string} title - 任务标题
   * @param {string} ipfsHash - IPFS哈希
   * @param {string} reward - 奖励金额 (AVAX)
   * @param {number} deadline - 截止时间戳 (Unix timestamp)
   * @param {number} taskType - 任务类型 (0-5)
   * @param {number} biddingPeriod - 竞标期（小时）
   * @param {number} developmentPeriod - 开发周期（天）
   * @returns {Promise<Object>} 交易结果
   */
  async createTask(title, ipfsHash, reward, deadline, taskType, biddingPeriod = 72, developmentPeriod = 14) {
    try {
      console.log('🚀 创建任务开始...')
      
      // 计算总费用 (奖励 + 平台费用)
      const rewardWei = ethers.utils.parseEther(reward.toString())
      const totalAmountData = await this.contracts.taskFactory.calculateTotalAmount(rewardWei)
      const totalAmount = totalAmountData[0] // totalAmount
      const rewardAmount = totalAmountData[1] // reward
      const platformFee = totalAmountData[2] // platformFee

      console.log('💰 费用计算:', {
        奖励: ethers.utils.formatEther(rewardAmount) + ' AVAX',
        平台费: ethers.utils.formatEther(platformFee) + ' AVAX',
        总计: ethers.utils.formatEther(totalAmount) + ' AVAX'
      })

      console.log('📝 任务参数:', {
        title,
        ipfsHash,
        reward: reward.toString(),
        deadline: new Date(deadline * 1000).toLocaleString(),
        taskType,
        biddingPeriod: biddingPeriod + '小时',
        developmentPeriod: developmentPeriod + '天'
      })

      // 调用合约创建任务
      const tx = await this.contracts.taskFactory.createTask(
        title,
        ipfsHash,
        rewardWei,
        deadline,
        taskType,
        {
          value: totalAmount,
          gasLimit: getGasLimit('CREATE_TASK')
        }
      )

      console.log('📤 任务创建交易已发送:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ 任务创建交易确认:', receipt.transactionHash)

      // 解析事件获取任务ID
      const taskCreatedEvent = receipt.events?.find(
        event => event.event === 'TaskCreated'
      )
      
      const taskId = taskCreatedEvent?.args?.taskId?.toNumber()
      console.log('🎯 新任务ID:', taskId)

      return {
        success: true,
        txHash: tx.hash,
        taskId,
        receipt,
        platformFee: ethers.utils.formatEther(platformFee),
        biddingPeriod,
        developmentPeriod
      }
    } catch (error) {
      console.error('❌ 创建任务失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 开始竞标 (匹配合约的startBidding函数)
   * @param {number} taskId - 任务ID
   * @returns {Promise<Object>} 交易结果
   */
  async startBidding(taskId) {
    try {
      console.log('🏁 开始竞标，任务ID:', taskId)
      
      // 首先检查任务是否存在于合约中
      console.log('🔍 检查任务是否存在于合约中...')
      try {
        // 直接调用合约的tasks映射来检查任务是否存在
        const taskExists = await this.contracts.taskFactory.tasks(taskId)
        console.log('📋 合约中的任务原始数据:', taskExists)
        
        // 检查任务ID是否为0（表示任务不存在）
        if (taskExists.id.toNumber() === 0) {
          console.log('❌ 任务不存在，任务ID:', taskId)
          
          // 获取所有存在的任务ID进行调试
          const allTaskIds = await this.getAllExistingTaskIds()
          console.log('📋 合约中存在的任务ID列表:', allTaskIds)
          
          throw new Error(`任务ID ${taskId} 不存在。合约中存在的任务ID: ${allTaskIds.join(', ')}`)
        }
        
        console.log('✅ 任务存在，继续执行...')
      } catch (error) {
        console.error('❌ 检查任务存在性失败:', error)
        
        // 如果直接访问tasks映射失败，尝试获取所有任务来调试
        try {
          console.log('🔍 尝试获取所有任务进行调试...')
          const allTasks = await this.contracts.taskFactory.getAllTasks()
          console.log('📋 合约中所有任务:', allTasks.map(t => ({
            id: t.id.toNumber(),
            title: t.title,
            creator: t.creator,
            status: t.status
          })))
          
          const existingIds = allTasks.filter(t => t.id.toNumber() !== 0).map(t => t.id.toNumber())
          console.log('📋 存在的任务ID:', existingIds)
          
          if (!existingIds.includes(taskId)) {
            throw new Error(`任务ID ${taskId} 不存在。存在的任务ID: ${existingIds.join(', ')}`)
          }
        } catch (debugError) {
          console.error('❌ 调试获取任务列表也失败:', debugError)
          throw new Error(`无法验证任务 ${taskId} 是否存在：${error.message}`)
        }
      }
      
      // 现在获取完整的任务详情
      const task = await this.getTaskById(taskId)
      console.log('📋 当前任务状态:', {
        id: task.id,
        status: task.status,
        statusText: task.statusText,
        creator: task.creator,
        locked: task.locked,
        deadline: task.deadlineDate
      })
      
      // 检查任务是否处于正确状态
      if (task.status !== 0) {
        throw new Error(`任务状态不正确。当前状态: ${task.statusText}，需要状态: 已创建`)
      }
      
      if (task.locked) {
        throw new Error('任务已被锁定，无法开始竞标')
      }
      
      // 检查是否过期
      if (task.isExpired) {
        throw new Error('任务已过期，无法开始竞标')
      }
      
      // 检查调用者权限
      const currentAddress = await this.signer.getAddress()
      if (task.creator.toLowerCase() !== currentAddress.toLowerCase()) {
        throw new Error('只有任务创建者可以开始竞标')
      }
      
      console.log('✅ 任务状态检查通过，开始执行合约调用')
      
      // 使用固定的Gas限制而不是估算
      const gasLimit = getGasLimit('START_BIDDING')
      
      console.log('⛽ 使用固定Gas限制:', gasLimit)
      
      // 调用合约方法
      const tx = await this.contracts.taskFactory.startBidding(taskId, {
        gasLimit: gasLimit
      })
      
      console.log('📤 交易已发送，哈希:', tx.hash)
      console.log('⏳ 等待交易确认...')
      
      const receipt = await tx.wait()
      console.log('✅ 交易确认成功:', receipt)
      
      // 解析事件
      const events = this.parseTransactionEvents(receipt)
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        events: events,
        message: '竞标开始成功'
      }
      
    } catch (error) {
      console.error('❌ 开始竞标失败:', error)
      
      // 检查是否是Gas相关错误
      if (error.message.includes('insufficient funds') || 
          error.message.includes('gas required exceeds allowance') ||
          error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Gas费用不足或Gas限制过低，请检查账户余额')
      }
      
      // 检查是否是合约执行错误
      if (error.code === 'CALL_EXCEPTION') {
        throw new Error('合约执行失败，请检查任务状态和权限')
      }
      
      throw this.parseContractError(error)
    }
  }

  /**
   * 获取所有存在的任务ID（调试用）
   * @returns {Promise<Array>} 存在的任务ID列表
   */
  async getAllExistingTaskIds() {
    try {
      console.log('🔍 获取所有存在的任务ID...')
      
      const allTasks = await this.contracts.taskFactory.getAllTasks()
      const existingIds = allTasks
        .filter(task => task.id.toNumber() !== 0) // 过滤掉ID为0的无效任务
        .map(task => task.id.toNumber())
      
      console.log('📋 找到的任务ID:', existingIds)
      return existingIds
    } catch (error) {
      console.error('❌ 获取任务ID列表失败:', error)
      return []
    }
  }

  /**
   * 调试合约状态
   * @returns {Promise<Object>} 合约状态信息
   */
  async debugContractState() {
    try {
      console.log('🔧 开始调试合约状态...')
      
      const debugInfo = {
        contractAddress: CONTRACT_ADDRESSES.TaskFactory,
        signerAddress: await this.signer.getAddress(),
        networkInfo: await this.signer.provider.getNetwork(),
        blockNumber: await this.signer.provider.getBlockNumber(),
        balance: ethers.utils.formatEther(await this.signer.getBalance()),
        allTasks: [],
        taskCount: 0
      }
      
      console.log('📋 基本信息:', {
        合约地址: debugInfo.contractAddress,
        用户地址: debugInfo.signerAddress,
        网络: debugInfo.networkInfo.name,
        链ID: debugInfo.networkInfo.chainId,
        区块高度: debugInfo.blockNumber,
        余额: debugInfo.balance + ' AVAX'
      })
      
      // 获取所有任务
      try {
        const allTasks = await this.contracts.taskFactory.getAllTasks()
        debugInfo.allTasks = allTasks.map(task => ({
          id: task.id.toNumber(),
          title: task.title,
          creator: task.creator,
          status: task.status,
          statusText: this.getStatusText(task.status),
          reward: ethers.utils.formatEther(task.reward),
          deadline: new Date(task.deadline.toNumber() * 1000).toLocaleString(),
          locked: task.locked
        }))
        
        debugInfo.taskCount = debugInfo.allTasks.filter(t => t.id !== 0).length
        
        console.log('📋 所有任务详情:')
        debugInfo.allTasks.forEach(task => {
          if (task.id !== 0) {
            console.log(`  任务${task.id}: ${task.title} - ${task.statusText} - 创建者: ${task.creator}`)
          }
        })
        
        console.log(`✅ 总共找到 ${debugInfo.taskCount} 个有效任务`)
        
      } catch (error) {
        console.error('❌ 获取任务列表失败:', error)
        debugInfo.error = error.message
      }
      
      return debugInfo
    } catch (error) {
      console.error('❌ 调试合约状态失败:', error)
      throw error
    }
  }

  /**
   * 参与任务 (匹配合约的participateInTask函数)
   * @param {number} taskId - 任务ID
   * @param {string} demoUrl - 演示URL或任务计划书
   * @returns {Promise<Object>} 交易结果
   */
  async participateInTask(taskId, demoUrl) {
    try {
      console.log('🙋‍♂️ 参与任务开始:', { taskId, demoUrl })
      
      // 首先检查任务是否存在于合约中
      console.log('🔍 检查任务是否存在于合约中...')
      try {
        // 直接调用合约的tasks映射来检查任务是否存在
        const taskExists = await this.contracts.taskFactory.tasks(taskId)
        console.log('📋 合约中的任务原始数据:', taskExists)
        
        // 检查任务ID是否为0（表示任务不存在）
        if (taskExists.id.toNumber() === 0) {
          console.log('❌ 任务不存在，任务ID:', taskId)
          
          // 获取所有存在的任务ID进行调试
          const allTaskIds = await this.getAllExistingTaskIds()
          console.log('📋 合约中存在的任务ID列表:', allTaskIds)
          
          throw new Error(`任务ID ${taskId} 不存在。合约中存在的任务ID: ${allTaskIds.join(', ')}`)
        }
        
        console.log('✅ 任务存在，继续执行...')
      } catch (error) {
        console.error('❌ 检查任务存在性失败:', error)
        
        // 如果直接访问tasks映射失败，尝试获取所有任务来调试
        try {
          console.log('🔍 尝试获取所有任务进行调试...')
          const allTasks = await this.contracts.taskFactory.getAllTasks()
          console.log('📋 合约中所有任务:', allTasks.map(t => ({
            id: t.id.toNumber(),
            title: t.title,
            creator: t.creator,
            status: t.status
          })))
          
          const existingIds = allTasks.filter(t => t.id.toNumber() !== 0).map(t => t.id.toNumber())
          console.log('📋 存在的任务ID:', existingIds)
          
          if (!existingIds.includes(taskId)) {
            throw new Error(`任务ID ${taskId} 不存在。存在的任务ID: ${existingIds.join(', ')}`)
          }
        } catch (debugError) {
          console.error('❌ 调试获取任务列表也失败:', debugError)
          throw new Error(`无法验证任务 ${taskId} 是否存在：${error.message}`)
        }
      }
      
      // 获取完整的任务详情
      const task = await this.getTaskById(taskId)
      console.log('📋 当前任务状态:', {
        id: task.id,
        status: task.status,
        statusText: task.statusText,
        creator: task.creator,
        locked: task.locked,
        deadline: task.deadlineDate,
        participants: task.participants
      })
      
      // 检查任务是否处于正确状态（必须是竞标中）
      if (task.status !== 1) {
        throw new Error(`任务状态不正确。当前状态: ${task.statusText}，需要状态: 竞标中`)
      }
      
      if (task.locked) {
        throw new Error('任务已被锁定，无法参与')
      }
      
      // 检查是否过期
      if (task.isExpired) {
        throw new Error('任务已过期，无法参与')
      }
      
      // 检查调用者权限
      const currentAddress = await this.signer.getAddress()
      console.log('👤 当前用户地址:', currentAddress)
      
      // 检查是否是任务创建者（创建者不能参与自己的任务）
      if (task.creator.toLowerCase() === currentAddress.toLowerCase()) {
        throw new Error('任务创建者不能参与自己的任务')
      }
      
      // 检查是否已经参与过
      const participants = Array.isArray(task.participants) ? task.participants : []
      const isAlreadyParticipant = participants.some(p => {
        const participantAddress = typeof p === 'string' ? p : (p && p.address ? p.address : '')
        return participantAddress && participantAddress.toLowerCase() === currentAddress.toLowerCase()
      })
      
      if (isAlreadyParticipant) {
        throw new Error('您已经参与了此任务，不能重复参与')
      }
      
      console.log('✅ 参与条件检查通过:')
      console.log('  - 任务状态: 竞标中')
      console.log('  - 任务未锁定')
      console.log('  - 任务未过期')
      console.log('  - 用户不是创建者')
      console.log('  - 用户未参与过')
      console.log('  - 演示URL:', demoUrl)
      
      // 验证演示URL
      if (!demoUrl || demoUrl.trim() === '') {
        throw new Error('演示URL不能为空')
      }
      
      console.log('🚀 开始执行合约调用...')
      
      // 使用固定的Gas限制
      const gasLimit = getGasLimit('PARTICIPATE_IN_TASK')
      console.log('⛽ 使用固定Gas限制:', gasLimit)
      
      const tx = await this.contracts.taskFactory.participateInTask(
        taskId,
        demoUrl,
        {
          gasLimit: gasLimit
        }
      )
      
      console.log('📤 参与任务交易已发送:', tx.hash)
      console.log('⏳ 等待交易确认...')
      
      const receipt = await tx.wait()
      console.log('✅ 参与任务交易确认成功:', receipt)
      
      // 解析事件
      const events = this.parseTransactionEvents(receipt)
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        events: events,
        message: '成功参与任务'
      }
    } catch (error) {
      console.error('❌ 参与任务失败:', error)
      
      // 检查是否是Gas相关错误
      if (error.message.includes('insufficient funds') || 
          error.message.includes('gas required exceeds allowance') ||
          error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Gas费用不足或Gas限制过低，请检查账户余额')
      }
      
      // 检查是否是合约执行错误
      if (error.code === 'CALL_EXCEPTION') {
        // 尝试提取更具体的错误信息
        if (error.reason) {
          throw new Error(`合约执行失败: ${error.reason}`)
        } else if (error.message.includes('Already participated')) {
          throw new Error('您已经参与了此任务')
        } else if (error.message.includes('Task is not in Bidding status')) {
          throw new Error('任务不处于竞标状态')
        } else if (error.message.includes('Task does not exist')) {
          throw new Error('任务不存在')
        } else {
          throw new Error('合约执行失败，请检查任务状态和权限')
        }
      }
      
      throw this.parseContractError(error)
    }
  }

  /**
   * 检查selectWinner的前置条件
   * @param {number} taskId - 任务ID
   * @param {string} winnerAddress - 中标者地址
   * @returns {Promise<Object>} 检查结果
   */
  async checkSelectWinnerConditions(taskId, winnerAddress) {
    try {
      console.log('🔍 检查selectWinner前置条件...')
      
      // 获取任务详情
      const task = await this.getTaskById(taskId)
      console.log('📋 任务当前状态:', {
        id: task.id.toString(),
        status: task.status,
        statusText: this.getStatusText(task.status),
        creator: task.creator,
        currentWinner: task.winner,
        locked: task.locked
      })
      
      // 获取参与者列表
      const participants = await this.getTaskParticipants(taskId)
      console.log('👥 参与者列表:', participants)
      
      // 获取当前用户
      const currentUser = await this.signer.getAddress()
      console.log('👤 当前用户:', currentUser)
      
      const conditions = {
        isCreator: task.creator.toLowerCase() === currentUser.toLowerCase(),
        isCorrectStatus: task.status === 1, // 应该是竞标状态
        hasParticipants: participants.length > 0,
        winnerIsParticipant: participants.some(p => p.toLowerCase() === winnerAddress.toLowerCase()),
        taskNotLocked: !task.locked,
        winnerAddressValid: winnerAddress && winnerAddress.length === 42 && winnerAddress.startsWith('0x'),
        winnerNotZeroAddress: winnerAddress !== '0x0000000000000000000000000000000000000000'
      }
      
      console.log('✅ 前置条件检查结果:', conditions)
      
      // 检查所有条件
      const errors = []
      if (!conditions.isCreator) {
        errors.push('只有任务创建者可以选择中标者')
      }
      if (!conditions.isCorrectStatus) {
        errors.push(`任务状态错误，当前状态: ${this.getStatusText(task.status)}，需要状态: ${this.getStatusText(1)}`)
      }
      if (!conditions.hasParticipants) {
        errors.push('任务没有参与者')
      }
      if (!conditions.winnerIsParticipant) {
        errors.push('选择的中标者不在参与者列表中')
      }
      if (!conditions.taskNotLocked) {
        errors.push('任务已被锁定')
      }
      if (!conditions.winnerAddressValid) {
        errors.push('中标者地址格式无效')
      }
      if (!conditions.winnerNotZeroAddress) {
        errors.push('中标者地址不能是零地址')
      }
      
      const isValid = errors.length === 0
      
      if (!isValid) {
        console.log('❌ 前置条件检查失败:', errors)
      } else {
        console.log('✅ 所有前置条件检查通过')
      }
      
      return {
        isValid,
        errors,
        conditions,
        task,
        participants,
        currentUser
      }
    } catch (error) {
      console.error('❌ 前置条件检查失败:', error)
      throw error
    }
  }

  /**
   * 选择中标者 (增强版，包含前置条件检查)
   * @param {number} taskId - 任务ID
   * @param {string} winnerAddress - 中标者地址
   * @returns {Promise<Object>} 交易结果
   */
  async selectWinner(taskId, winnerAddress) {
    try {
      console.log('🏆 开始选择中标者流程:', { taskId, winnerAddress })
      
      // 1. 前置条件检查
      const conditionCheck = await this.checkSelectWinnerConditions(taskId, winnerAddress)
      
      if (!conditionCheck.isValid) {
        const errorMessage = `前置条件检查失败: ${conditionCheck.errors.join(', ')}`
        console.error('❌', errorMessage)
        throw new Error(errorMessage)
      }
      
      // 2. 估算Gas费用
      try {
        const gasEstimate = await this.contracts.taskFactory.estimateGas.selectWinner(taskId, winnerAddress)
        console.log('⛽ Gas估算:', gasEstimate.toString())
        
        // 增加20%的Gas余量
        const gasLimit = gasEstimate.mul(120).div(100)
        console.log('⛽ 使用Gas限制:', gasLimit.toString())
        
        // 3. 执行交易
        console.log('📤 发送selectWinner交易...')
      const tx = await this.contracts.taskFactory.selectWinner(
        taskId,
        winnerAddress,
          { gasLimit }
        )
        
        console.log('📤 交易已发送:', tx.hash)
        console.log('⏳ 等待交易确认...')
        
        const receipt = await tx.wait()
        console.log('✅ 交易确认成功')
        console.log('📋 交易收据:', receipt)
        
        // 4. 验证结果
        console.log('🔍 验证选择结果...')
        const updatedTask = await this.getTaskById(taskId)
        console.log('📋 更新后的任务状态:', {
          status: updatedTask.status,
          statusText: this.getStatusText(updatedTask.status),
          winner: updatedTask.winner,
          winnerMatches: updatedTask.winner.toLowerCase() === winnerAddress.toLowerCase()
        })
        
        if (updatedTask.winner.toLowerCase() === winnerAddress.toLowerCase()) {
          console.log('✅ 中标者设置成功验证')
        } else {
          console.warn('⚠️ 中标者设置可能未生效，请检查')
        }
        
        return {
          success: true,
          txHash: tx.hash,
          receipt,
          updatedTask
        }
      } catch (gasError) {
        console.error('❌ Gas估算失败:', gasError)
        // 如果Gas估算失败，使用默认值重试
        console.log('🔄 使用默认Gas限制重试...')
        
        const tx = await this.contracts.taskFactory.selectWinner(
          taskId,
          winnerAddress,
          { gasLimit: getGasLimit('SELECT_WINNER') }
        )
        
        console.log('📤 重试交易已发送:', tx.hash)
      const receipt = await tx.wait()
        console.log('✅ 重试交易成功')
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
        }
      }
    } catch (error) {
      console.error('❌ 选择中标者失败:', error)
      
      // 如果是合约错误，提供更详细的信息
      if (error.transaction) {
        console.log('🔗 失败的交易信息:', {
          hash: error.transaction.hash,
          to: error.transaction.to,
          data: error.transaction.data,
          gasLimit: error.transaction.gasLimit?.toString(),
          gasPrice: error.transaction.gasPrice?.toString()
        })
        
        if (error.receipt) {
          console.log('📋 交易收据:', {
            status: error.receipt.status,
            gasUsed: error.receipt.gasUsed?.toString(),
            blockNumber: error.receipt.blockNumber
          })
        }
      }
      
      throw this.parseContractError(error)
    }
  }

  /**
   * 申请任务完成验证 (匹配合约的requestTaskVerification函数)
   * @param {number} taskId - 任务ID
   * @param {string} completeUrl - 完成任务的URL
   * @returns {Promise<Object>} 交易结果
   */
  async requestTaskVerification(taskId, completeUrl) {
    try {
      console.log('📋 申请任务验证:', { taskId, completeUrl })
      
      const tx = await this.contracts.taskFactory.requestTaskVerification(
        taskId,
        completeUrl,
        {
          gasLimit: getGasLimit('REQUEST_VERIFICATION')
        }
      )
      
      console.log('📤 申请验证交易已发送:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ 验证申请提交成功')
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      }
    } catch (error) {
      console.error('❌ 申请验证失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 雇主确认任务 (匹配合约的employerConfirmTask函数)
   * @param {number} taskId - 任务ID
   * @param {boolean} isConfirm - 是否确认完成
   * @returns {Promise<Object>} 交易结果
   */
  async employerConfirmTask(taskId, isConfirm) {
    try {
      console.log('👨‍💼 雇主确认任务:', { taskId, isConfirm })
      
      const tx = await this.contracts.taskFactory.employerConfirmTask(
        taskId,
        isConfirm,
        {
          gasLimit: getGasLimit('CONFIRM_TASK')
        }
      )
      
      console.log('📤 雇主确认交易已发送:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ 雇主确认完成')
      
      return {
        success: true,
        txHash: tx.hash,
        receipt,
        confirmed: isConfirm
      }
    } catch (error) {
      console.error('❌ 雇主确认失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 发起争议 (匹配合约的disputeTask函数)
   * @param {number} taskId - 任务ID
   * @returns {Promise<Object>} 交易结果
   */
  async disputeTask(taskId) {
    try {
      console.log('⚖️ 发起争议，任务ID:', taskId)
      
      const tx = await this.contracts.taskFactory.disputeTask(taskId, {
        gasLimit: getGasLimit('DISPUTE_TASK')
      })
      
      console.log('📤 争议交易已发送:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ 争议发起成功')
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      }
    } catch (error) {
      console.error('❌ 发起争议失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 结算任务 (匹配合约的settleTask函数)
   * @param {number} taskId - 任务ID
   * @returns {Promise<Object>} 交易结果
   */
  async settleTask(taskId) {
    try {
      console.log('⚖️ 结算任务，任务ID:', taskId)
      
      const tx = await this.contracts.taskFactory.settleTask(taskId, {
        gasLimit: getGasLimit('SETTLE_TASK')
      })
      
      console.log('📤 结算交易已发送:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ 任务结算完成')
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      }
    } catch (error) {
      console.error('❌ 任务结算失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 取消任务 (匹配合约的cancelTask函数)
   * @param {number} taskId - 任务ID
   * @returns {Promise<Object>} 交易结果
   */
  async cancelTask(taskId) {
    try {
      console.log('❌ 取消任务，任务ID:', taskId)
      
      const tx = await this.contracts.taskFactory.cancelTask(taskId, {
        gasLimit: getGasLimit('CANCEL_TASK')
      })
      
      console.log('📤 取消任务交易已发送:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ 任务取消成功')
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      }
    } catch (error) {
      console.error('❌ 取消任务失败:', error)
      throw this.parseContractError(error)
    }
  }

  // ==================== 查询方法 ====================

  /**
   * 获取任务详情 (匹配合约的getTaskById函数)
   * @param {number} taskId - 任务ID
   * @returns {Promise<Object>} 任务详情
   */
  async getTaskById(taskId) {
    try {
      console.log('🔍 获取任务详情，ID:', taskId)
      
      const rawTask = await this.contracts.taskFactory.getTaskById(taskId)
      
      // 添加详细的原始数据调试
      console.log('📋 合约返回的原始任务数据:', {
        id: rawTask.id.toString(),
        title: rawTask.title,
        creator: rawTask.creator,
        winner: rawTask.winner,
        winnerType: typeof rawTask.winner,
        winnerLength: rawTask.winner ? rawTask.winner.length : 'N/A',
        status: rawTask.status,
        reward: rawTask.reward.toString(),
        deadline: rawTask.deadline.toString(),
        ipfsHash: rawTask.ipfsHash,
        completeUrl: rawTask.completeUrl,
        firstDemoUrl: rawTask.firstDemoUrl,
        locked: rawTask.locked,
        taskType: rawTask.taskType,
        disputeDeadline: rawTask.disputeDeadline.toString()
      })
      
      const participants = await this.contracts.taskFactory.getTaskParticipants(taskId)
      
      const task = this.formatTaskData(rawTask)
      task.participants = participants
      
      console.log('📋 格式化后的任务详情:', task)
      return task
    } catch (error) {
      console.error('❌ 获取任务详情失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 获取所有任务 (匹配合约的getAllTasks函数)
   * @returns {Promise<Array>} 任务列表
   */
  async getAllTasks() {
    try {
      console.log('📋 获取所有任务...')
      
      const rawTasks = await this.contracts.taskFactory.getAllTasks()
      const tasks = []
      
      for (let i = 0; i < rawTasks.length; i++) {
        if (rawTasks[i].id.toNumber() !== 0 || i === 0) { // 排除被删除的任务
          const task = this.formatTaskData(rawTasks[i])
          
          // 获取参与者列表
          try {
            const participants = await this.contracts.taskFactory.getTaskParticipants(task.id)
            task.participants = participants
    } catch (error) {
            console.warn(`获取任务${task.id}参与者失败:`, error.message)
            task.participants = []
          }
          
          tasks.push(task)
        }
      }
      
      console.log(`✅ 获取到 ${tasks.length} 个任务`)
      return tasks
    } catch (error) {
      console.error('❌ 获取任务列表失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 根据创建者获取任务 (匹配合约的getTaskByOwner函数)
   * @param {string} ownerAddress - 创建者地址
   * @returns {Promise<Array>} 任务列表
   */
  async getTasksByOwner(ownerAddress) {
    try {
      console.log('👤 获取用户任务，地址:', ownerAddress)
      
      const rawTasks = await this.contracts.taskFactory.getTaskByOwner(ownerAddress)
      const tasks = rawTasks.map(task => this.formatTaskData(task))
      
      console.log(`✅ 获取到 ${tasks.length} 个用户任务`)
      return tasks
    } catch (error) {
      console.error('❌ 获取用户任务失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 获取任务参与者 (匹配合约的getTaskParticipants函数)
   * @param {number} taskId - 任务ID
   * @returns {Promise<Array>} 参与者地址列表
   */
  async getTaskParticipants(taskId) {
    try {
      const participants = await this.contracts.taskFactory.getTaskParticipants(taskId)
      console.log(`📋 任务${taskId}参与者:`, participants)
      return participants
    } catch (error) {
      console.error('❌ 获取任务参与者失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 获取平台费用信息 (匹配合约的getPlatformFeeInfo函数)
   * @returns {Promise<Object>} 平台费用信息
   */
  async getPlatformFeeInfo() {
    try {
      const feeInfo = await this.contracts.taskFactory.getPlatformFeeInfo()
      return {
        platformAddress: feeInfo.platformAddr,
        feeRate: feeInfo.feeRate.toNumber(), // 基点
        totalFees: ethers.utils.formatEther(feeInfo.totalFees)
      }
    } catch (error) {
      console.error('❌ 获取平台费用信息失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 计算平台费用 (匹配合约的calculatePlatformFee函数)
   * @param {string} rewardAmount - 奖励金额
   * @returns {Promise<string>} 平台费用
   */
  async calculatePlatformFee(rewardAmount) {
    try {
      const rewardWei = ethers.utils.parseEther(rewardAmount.toString())
      const feeWei = await this.contracts.taskFactory.calculatePlatformFee(rewardWei)
      return ethers.utils.formatEther(feeWei)
    } catch (error) {
      console.error('❌ 计算平台费用失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 计算总金额 (匹配合约的calculateTotalAmount函数)
   * @param {string} rewardAmount - 奖励金额
   * @returns {Promise<Object>} 总金额信息
   */
  async calculateTotalAmount(rewardAmount) {
    try {
      const rewardWei = ethers.utils.parseEther(rewardAmount.toString())
      const result = await this.contracts.taskFactory.calculateTotalAmount(rewardWei)
      
      return {
        totalAmount: ethers.utils.formatEther(result[0]),
        reward: ethers.utils.formatEther(result[1]),
        platformFee: ethers.utils.formatEther(result[2])
      }
    } catch (error) {
      console.error('❌ 计算总金额失败:', error)
      throw this.parseContractError(error)
    }
  }

  // ==================== DisputeDAO 合约交互 ====================

  /**
   * 成为仲裁员
   * @param {string} stakeAmount - 质押金额 (ETH)
   * @returns {Promise<Object>} 交易结果
   */
  async becomeArbitrator(stakeAmount) {
    try {
      console.log('📋 开始成为仲裁员流程...')
      console.log('💰 质押金额:', stakeAmount, 'ETH')
      
      // 前置条件检查
      const minStake = await this.getMinStake()
      const minStakeEth = ethers.utils.formatEther(minStake)
      console.log('📏 合约最小质押金额:', minStakeEth, 'ETH')
      
      if (parseFloat(stakeAmount) < parseFloat(minStakeEth)) {
        throw new Error(`质押金额不足，最少需要 ${minStakeEth} ETH`)
      }
      
      // 检查用户是否已经是仲裁员
      try {
        const userAddress = await this.signer.getAddress()
        const jurorInfo = await this.getJurorInfo(userAddress)
        if (jurorInfo.isActive) {
          throw new Error('您已经是活跃的仲裁员')
        }
        console.log('✅ 用户不是仲裁员，可以质押')
      } catch (error) {
        if (error.message.includes('已经是活跃的仲裁员')) {
          throw error
        }
        console.log('ℹ️ 获取仲裁员信息失败，继续执行质押')
      }
      
      // 检查用户余额
      const userAddress = await this.signer.getAddress()
      const balance = await this.provider.getBalance(userAddress)
      const balanceEth = ethers.utils.formatEther(balance)
      console.log('💳 用户余额:', balanceEth, 'ETH')
      
      if (parseFloat(balanceEth) < parseFloat(stakeAmount)) {
        throw new Error(`余额不足，当前余额 ${balanceEth} ETH，需要 ${stakeAmount} ETH`)
      }
      
      const stakeAmountWei = ethers.utils.parseEther(stakeAmount.toString())
      console.log('🔢 质押金额 (wei):', stakeAmountWei.toString())
      
      console.log('📤 发送质押交易...')
      const tx = await this.contracts.disputeDAO.stake({
        value: stakeAmountWei,
        gasLimit: 300000  // 增加gas限制
      })
      
      console.log('⏳ 等待交易确认...', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ 交易成功确认:', receipt)
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      }
    } catch (error) {
      console.error('❌ 成为仲裁员失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 退出仲裁员
   * @returns {Promise<Object>} 交易结果
   */
  async quitArbitrator() {
    try {
      const tx = await this.contracts.disputeDAO.unstake({
        gasLimit: 200000
      })
      
      const receipt = await tx.wait()
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      }
    } catch (error) {
      console.error('退出仲裁员失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 仲裁员投票
   * @param {number} disputeId - 争议ID
   * @param {string} winner - 投票选择的获胜者地址
   * @returns {Promise<Object>} 交易结果
   */
  async vote(disputeId, winner) {
    try {
      const tx = await this.contracts.disputeDAO.vote(disputeId, winner, {
        gasLimit: 200000
      })
      
      const receipt = await tx.wait()
      
      return {
        success: true,
        txHash: tx.hash,
        receipt
      }
    } catch (error) {
      console.error('仲裁投票失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 获取争议的仲裁员列表
   * @param {number} disputeId - 争议ID
   * @returns {Promise<Array>} 仲裁员地址列表
   */
  async getDisputeJurors(disputeId) {
    try {
      return await this.contracts.disputeDAO.getDisputeJurors(disputeId)
    } catch (error) {
      console.error('获取争议仲裁员失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 获取仲裁员信息
   * @param {string} jurorAddress - 仲裁员地址
   * @returns {Promise<Object>} 仲裁员信息
   */
  async getJurorInfo(jurorAddress) {
    try {
      const info = await this.contracts.disputeDAO.getJurorInfo(jurorAddress)
      return {
        stakeAmount: ethers.utils.formatEther(info.stakeAmount),
        isActive: info.isActive,
        lastDisputeId: info.lastDisputeId.toNumber()
      }
    } catch (error) {
      console.error('获取仲裁员信息失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 获取最小质押金额
   * @returns {Promise<BigNumber>} 最小质押金额 (wei)
   */
  async getMinStake() {
    try {
      const minStake = await this.contracts.disputeDAO.minStake()
      return minStake
    } catch (error) {
      console.error('获取最小质押金额失败:', error)
      throw this.parseContractError(error)
    }
  }

  /**
   * 格式化以太币金额
   * @param {BigNumber} amount - 金额 (wei)
   * @returns {string} 格式化后的金额 (ETH)
   */
  formatEther(amount) {
    try {
      return ethers.utils.formatEther(amount)
    } catch (error) {
      console.error('格式化以太币金额失败:', error)
      return '0'
    }
  }

  // ==================== 事件处理 ====================

  /**
   * 解析交易事件
   * @param {Object} receipt - 交易收据
   * @returns {Array} 解析后的事件列表
   */
  parseTransactionEvents(receipt) {
    try {
      const events = []
      
      if (!receipt || !receipt.events) {
        console.log('📋 交易收据中没有事件')
        return events
      }
      
      // 遍历所有事件
      for (const event of receipt.events) {
        if (event.event && event.args) {
          const parsedEvent = {
            name: event.event,
            address: event.address,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            args: {}
          }
          
          // 解析事件参数
          for (const [key, value] of Object.entries(event.args)) {
            if (isNaN(key)) { // 跳过数字索引，只保留命名参数
              if (ethers.BigNumber.isBigNumber(value)) {
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

  // ==================== 事件监听 ====================

  /**
   * 设置任务状态变更事件监听
   * @param {Function} callback - 回调函数
   */
  setupTaskEventListeners(callback) {
    try {
      console.log('🔗 尝试设置事件监听器...')
      
      // 检查合约是否初始化
      if (!this.contracts.taskFactory) {
        throw new Error('TaskFactory合约未初始化')
      }

      // 由于ethers.js代理对象的兼容性问题，暂时禁用事件监听
      console.warn('⚠️ 由于ethers.js兼容性问题，暂时禁用事件监听功能')
      console.log('📋 应用将使用手动刷新方式获取最新数据')
      
      // 设置一个标志表示事件监听器未激活
      this.eventListenersActive = false
      
      // 可以在这里实现定期轮询作为替代方案
      this.setupPollingAsAlternative(callback)
      
    } catch (error) {
      console.error('❌ 设置事件监听器失败:', error)
      console.warn('⚠️ 事件监听器设置失败，应用将继续运行但需要手动刷新数据')
      this.eventListenersActive = false
    }
  }

  /**
   * 设置轮询作为事件监听的替代方案
   * @param {Function} callback - 回调函数
   */
  setupPollingAsAlternative(callback) {
    console.log('🔄 设置轮询机制作为事件监听的替代方案')
    
    // 这里可以实现定期轮询逻辑
    // 但为了避免过度请求，我们暂时只记录状态
    console.log('💡 提示：请手动刷新页面或重新加载数据以获取最新状态')
    
    // 可以在未来版本中实现智能轮询
    // setInterval(() => {
    //   // 定期检查任务状态变化
    // }, 30000) // 每30秒检查一次
  }

  /**
   * 标准事件监听器设置（已禁用）
   * @param {Function} callback - 回调函数
   */
  setupStandardEventListeners(callback) {
    throw new Error('标准事件监听器已禁用，使用轮询替代方案')
  }

  /**
   * 简化事件监听器设置（已禁用）
   * @param {Function} callback - 回调函数
   */
  setupSimpleEventListeners(callback) {
    console.log('🔗 使用简化事件监听器（无操作版本）')
    console.log('⚠️ 事件监听功能暂时禁用，请手动刷新获取最新数据')
    this.eventListenersActive = false
  }

  /**
   * 移除事件监听器
   */
  removeTaskEventListeners() {
    try {
      console.log('🔌 开始移除事件监听器...')
      
      if (this.contracts.taskFactory) {
        // 移除所有事件监听器
        this.contracts.taskFactory.removeAllListeners()
        console.log('✅ 任务事件监听器已移除')
      } else {
        console.warn('⚠️ TaskFactory合约不存在，无需移除监听器')
      }
    } catch (error) {
      console.error('❌ 移除事件监听器失败:', error)
      console.warn('⚠️ 移除事件监听器失败，但应用将继续运行')
    }
  }

  // ==================== 数据格式化 ====================

  /**
   * 格式化任务数据 (匹配合约Task结构体)
   * @param {Object} rawTask - 合约返回的原始任务数据
   * @returns {Object} 格式化后的任务数据
   */
  formatTaskData(rawTask) {
    try {
      // 特殊处理winner字段
      let winner = rawTask.winner
      const isZeroAddress = winner === '0x0000000000000000000000000000000000000000'
      
      console.log('🔍 处理winner字段:', {
        originalWinner: winner,
        winnerType: typeof winner,
        isZeroAddress: isZeroAddress,
        isUndefined: winner === undefined,
        isNull: winner === null,
        isEmpty: winner === ''
      })
      
      // 如果winner是零地址，设置为null以便后续判断
      if (isZeroAddress) {
        winner = null
        console.log('⚠️ Winner是零地址，设置为null')
      }
      
      return {
        id: rawTask.id.toNumber(),
        title: rawTask.title,
        ipfsHash: rawTask.ipfsHash,
        completeUrl: rawTask.completeUrl,
        firstDemoUrl: rawTask.firstDemoUrl,
        creator: rawTask.creator,
        reward: ethers.utils.formatEther(rawTask.reward),
        rewardWei: rawTask.reward,
        status: rawTask.status,
        statusText: this.getStatusText(rawTask.status),
        winner: winner, // 使用处理后的winner
        deadline: rawTask.deadline.toNumber(),
        deadlineDate: new Date(rawTask.deadline.toNumber() * 1000),
        disputeDeadline: rawTask.disputeDeadline.toNumber(),
        disputeDeadlineDate: rawTask.disputeDeadline.toNumber() > 0 ? new Date(rawTask.disputeDeadline.toNumber() * 1000) : null,
        locked: rawTask.locked,
        taskType: rawTask.taskType,
        taskTypeText: this.getTaskTypeText(rawTask.taskType),
        participants: [], // 需要单独获取
        // 计算状态
        isExpired: rawTask.deadline.toNumber() * 1000 < Date.now(),
        isInDisputePeriod: rawTask.disputeDeadline.toNumber() > 0 && rawTask.disputeDeadline.toNumber() * 1000 > Date.now(),
        canSettle: rawTask.disputeDeadline.toNumber() > 0 && rawTask.disputeDeadline.toNumber() * 1000 < Date.now() && !rawTask.locked
      }
    } catch (error) {
      console.error('❌ 格式化任务数据失败:', error)
      throw error
    }
  }

  /**
   * 获取状态文本
   * @param {number} status - 状态码
   * @returns {string} 状态文本
   */
  getStatusText(status) {
    const statusTexts = {
      0: '已创建',
      1: '竞标中',
      2: '开发中',
      3: '待雇主确认',
      4: '已完成',
      5: '争议中',
      6: '争议期'
    }
    return statusTexts[status] || '未知状态'
  }

  /**
   * 获取任务类型文本
   * @param {string} taskType - 任务类型
   * @returns {string} 类型文本
   */
  getTaskTypeText(taskType) {
    const typeTexts = {
      'Other': '其他',
      'web3': 'Web3开发',
      'UI/UX': 'UI/UX设计',
      'Market Promotion': '市场推广',
      'Content Production': '内容创作',
      'Data Analytics': '数据分析'
    }
    return typeTexts[taskType] || taskType
  }

  /**
   * 获取状态样式类
   * @param {number} status - 状态码
   * @returns {string} CSS类名
   */
  getStatusClass(status) {
    const statusClasses = {
      0: 'bg-gray-100 text-gray-800',      // 已创建
      1: 'bg-green-100 text-green-800',    // 竞标中
      2: 'bg-blue-100 text-blue-800',      // 开发中
      3: 'bg-yellow-100 text-yellow-800',  // 待雇主确认
      4: 'bg-purple-100 text-purple-800',  // 已完成
      5: 'bg-red-100 text-red-800',        // 争议中
      6: 'bg-orange-100 text-orange-800'   // 争议期
    }
    return statusClasses[status] || 'bg-gray-100 text-gray-800'
  }

  // ==================== 任务状态流程管理 ====================

  /**
   * 获取任务可执行操作
   * @param {Object} task - 任务对象
   * @param {string} currentUser - 当前用户地址
   * @returns {Array} 可执行操作列表
   */
  getAvailableActions(task, currentUser) {
    if (!task || !currentUser) {
      return []
    }

    const actions = []
    const isCreator = task.creator && task.creator.toLowerCase() === currentUser.toLowerCase()
    const participants = task.participants || []
    const isParticipant = participants.some(p => p.toLowerCase() === currentUser.toLowerCase())
    
    // 改进winner判断逻辑
    const hasValidWinner = task.winner && 
                          task.winner !== null && 
                          task.winner !== undefined && 
                          task.winner !== '' && 
                          task.winner !== '0x0000000000000000000000000000000000000000'

    const isWinner = hasValidWinner && task.winner.toLowerCase() === currentUser.toLowerCase()

    // 数据一致性检查
    const isDataInconsistent = task.status === 2 && !hasValidWinner
    
    console.log('检查用户权限:', {
      taskId: task.id,
      currentUser,
      isCreator,
      isWinner,
      isParticipant,
      participants,
      taskStatus: task.status,
      taskWinner: task.winner,
      hasValidWinner,
      isDataInconsistent
    })

    switch (task.status) {
      case 0: // Created
        if (isCreator) {
          actions.push({ type: 'startBidding', label: '开始竞标', style: 'primary' })
          actions.push({ type: 'cancelTask', label: '取消任务', style: 'danger' })
        }
        break

      case 1: // Bidding
        if (!isCreator && !isParticipant) {
          actions.push({ type: 'participateInTask', label: '参与竞标', style: 'primary' })
        }
        if (isCreator && participants.length > 0) {
          actions.push({ type: 'selectWinner', label: '选择中标者', style: 'warning' })
        }
        if (isCreator) {
          actions.push({ type: 'cancelTask', label: '取消任务', style: 'danger' })
        }
        break

      case 2: // InProgress
        // 正常情况：有有效winner且用户是winner
        if (hasValidWinner && isWinner) {
          actions.push({ type: 'requestVerification', label: '提交完成作品', style: 'success' })
        }
        // 数据不一致情况的处理
        else if (isDataInconsistent) {
          console.log('⚠️ 检测到数据不一致：任务状态为开发中但没有有效winner')
          
          if (isCreator) {
            actions.push({ type: 'selectWinner', label: '重新选择中标者', style: 'warning' })
            actions.push({ type: 'repairData', label: '修复任务数据', style: 'info' })
          }
          
          if (isParticipant) {
            // 为参与者提供临时的提交选项
            actions.push({ type: 'requestVerification', label: '提交完成作品 ', style: 'warning' })
            console.log('🛠️ 数据修复模式：为参与者提供提交选项')
          }
        }
        // 临时调试：如果是参与者且任务状态为开发中，也显示提交按钮
        else if (isParticipant && task.status === 2) {
          console.log('🐛 调试模式：参与者可以提交作品（临时功能）')
          actions.push({ type: 'requestVerification', label: '提交完成作品 (调试)', style: 'warning' })
        }
        
        if (isCreator) {
          actions.push({ type: 'cancelTask', label: '取消任务', style: 'danger' })
            }
            break
            
      case 3: // PendingConfirmation
        if (isCreator) {
          actions.push({ type: 'confirmTask', label: '确认完成', style: 'success' })
          actions.push({ type: 'rejectTask', label: '拒绝确认', style: 'warning' })
          actions.push({ type: 'disputeTask', label: '发起争议', style: 'danger' })
        }
        if (isWinner) {
          actions.push({ type: 'disputeTask', label: '发起争议', style: 'danger' })
            }
            break
            
      case 4: // Completed
        // 已完成的任务通常不需要额外操作
            break
            
      case 5: // Cancelled
        // 已取消的任务不需要操作
            break
            
      case 6: // Disputed
        if (isCreator || isWinner) {
          actions.push({ type: 'settleTask', label: '解决争议', style: 'info' })
            }
            break
            
      default:
        console.warn('未知任务状态:', task.status)
    }

    console.log('✅ 可执行操作:', actions.map(a => `${a.label} (${a.type})`))
    return actions
  }

  /**
   * 获取任务状态进度
   * @param {number} status - 任务状态
   * @returns {Object} 进度信息
   */
  getTaskProgress(status) {
    const progressMap = {
      0: { step: 1, total: 6, percentage: 16, label: '任务创建' },
      1: { step: 2, total: 6, percentage: 33, label: '竞标阶段' },
      2: { step: 3, total: 6, percentage: 50, label: '开发阶段' },
      3: { step: 4, total: 6, percentage: 66, label: '待确认' },
      4: { step: 6, total: 6, percentage: 100, label: '已完成' },
      5: { step: 5, total: 6, percentage: 83, label: '争议处理' },
      6: { step: 5, total: 6, percentage: 83, label: '争议期' }
    }
    return progressMap[status] || { step: 1, total: 6, percentage: 16, label: '未知' }
  }

  /**
   * 检查用户权限
   * @param {Object} task - 任务对象
   * @param {string} action - 操作类型
   * @param {string} userAddress - 用户地址
   * @returns {boolean} 是否有权限
   */
  checkPermission(task, action, userAddress) {
    const isCreator = task.creator.toLowerCase() === userAddress.toLowerCase()
    const isWinner = task.winner && task.winner.toLowerCase() === userAddress.toLowerCase()
    
    // 安全检查participants是否为数组
    const participants = Array.isArray(task.participants) ? task.participants : []
    const isParticipant = participants.some(p => {
      // 处理participants中的不同数据格式
      const participantAddress = typeof p === 'string' ? p : (p && p.address ? p.address : '')
      return participantAddress && participantAddress.toLowerCase() === userAddress.toLowerCase()
    })

    const permissions = {
      startBidding: isCreator && task.status === 0,
      participateInTask: !isParticipant && task.status === 1,
      selectWinner: isCreator && task.status === 1 && participants.length > 0,
      requestVerification: isWinner && task.status === 2,
      confirmTask: isCreator && task.status === 3,
      rejectTask: isCreator && task.status === 3,
      disputeTask: (
        (task.status === 2 && (isCreator || isWinner)) ||
        (task.status === 4 && isWinner && task.isInDisputePeriod) ||
        (task.status === 6 && isWinner && task.isInDisputePeriod)
      ),
      settleTask: task.canSettle,
      cancelTask: isCreator && (task.status === 0 || task.status === 1),
      removeExpiredTask: task.isExpired && (task.status === 0 || task.status === 1)
    }

    return permissions[action] || false
  }

  // ==================== 错误处理 ====================

  /**
   * 解析合约错误
   * @param {Error} error - 原始错误
   * @returns {Error} 格式化后的错误
   */
  parseContractError(error) {
    console.error('合约错误详情:', error)

    // 提取错误信息
    let message = error.message || '未知错误'
    let code = error.code || 'UNKNOWN_ERROR'

    // 解析常见的合约错误
    if (error.reason) {
      message = error.reason
    } else if (error.data && error.data.message) {
      message = error.data.message
    } else if (message.includes('execution reverted:')) {
      message = message.split('execution reverted:')[1].trim()
    }

    // 处理特殊的错误代码
    if (error.code === 'CALL_EXCEPTION') {
      // 检查是否有具体的revert原因
      if (error.error && error.error.reason) {
        message = error.error.reason
      } else if (error.error && error.error.data) {
        message = '合约执行失败，可能是状态检查未通过'
      } else {
        message = '合约调用失败，请检查参数和合约状态'
      }
    }

    // 翻译常见错误
    const errorTranslations = {
      'Only creator can operate': '只有任务创建者可以执行此操作',
      'Task does not exist': '任务不存在',
      'Task is not in Created status': '任务不处于"已创建"状态',
      'Task is not in Bidding status': '任务不处于"竞标中"状态',
      'Task is not in InProgress status': '任务不处于"开发中"状态',
      'Task not pending employer confirm': '任务不处于"待雇主确认"状态',
      'Already participated': '您已经参与了此任务',
      'Winner must be a participant': '中标者必须是参与者之一',
      'Only winner can request verification': '只有中标者可以申请验证',
      'Only winner can dispute after employer confirm/deny': '只有中标者可以在雇主确认/拒绝后发起争议',
      'Dispute period expired': '争议期已过',
      'Task cannot be cancelled': '任务无法取消',
      'Task not expired': '任务未过期',
      'Reward must be greater than zero': '奖励金额必须大于零',
      'Task title cannot be empty': '任务标题不能为空',
      'IPFS hash cannot be empty': 'IPFS哈希不能为空',
      'Deadline must be in the future': '截止时间必须是将来的时间',
      'Must send reward + platform fee': '必须发送奖励金额加平台费用',
      'user rejected transaction': '用户拒绝了交易',
      'insufficient funds': '余额不足',
      'gas required exceeds allowance': 'Gas费用不足',
      'execution reverted': '合约执行被撤销',
      'transaction failed': '交易执行失败',
      'nonce too low': '交易序号过低，请重试',
      'nonce too high': '交易序号过高，请重试',
      'replacement transaction underpriced': '替换交易的Gas价格过低',
      'already known': '交易已存在',
      'invalid sender': '发送者地址无效',
      'invalid signature': '签名无效'
    }

    // 查找匹配的翻译
    for (const [english, chinese] of Object.entries(errorTranslations)) {
      if (message.toLowerCase().includes(english.toLowerCase())) {
        message = chinese
            break
        }
    }

    // 如果没有找到翻译，提供通用的错误提示
    if (message === error.message && error.code === 'CALL_EXCEPTION') {
      message = '合约调用失败。可能的原因：\n' +
                '1. 任务状态不符合操作要求\n' +
                '2. 权限不足（非任务创建者）\n' +
                '3. 任务已过期或被锁定\n' +
                '4. Gas费用不足\n' +
                '请检查任务状态和账户权限'
    }

    // 创建新的错误对象
    const formattedError = new Error(message)
    formattedError.code = code
    formattedError.originalError = error

    // 添加交易哈希信息（如果有）
    if (error.transactionHash) {
      formattedError.transactionHash = error.transactionHash
      console.log('🔗 失败的交易哈希:', error.transactionHash)
      console.log('🌐 查看交易详情:', `https://testnet.snowtrace.io/tx/${error.transactionHash}`)
    }

    return formattedError
  }

  // ==================== 清理方法 ====================

  /**
   * 清理资源
   */
  cleanup() {
    try {
      this.removeTaskEventListeners()
      this.eventListeners.clear()
      console.log('✅ 合约服务清理完成')
    } catch (error) {
      console.error('❌ 清理合约服务失败:', error)
    }
  }

  /**
   * 调试工具：检查合约连接和任务状态
   * @param {number} taskId - 任务ID
   * @returns {Promise<Object>} 调试信息
   */
  async debugTaskStatus(taskId) {
    try {
      console.log('🔍 开始调试任务状态...')
      console.log('=' .repeat(80))
      
      // 获取原始任务数据
      const rawTask = await this.getTaskById(taskId)
      console.log('📋 原始任务数据:', rawTask)
      
      // 格式化任务数据
      const task = this.formatTaskData(rawTask)
      console.log('📋 格式化后任务数据:', task)
      
      // 获取当前用户
      const currentUser = this.signer ? await this.signer.getAddress() : null
      console.log('👤 当前用户地址:', currentUser)
      
      // 获取参与者列表
      const participants = await this.getTaskParticipants(taskId)
      console.log('👥 参与者列表:', participants)
      
      // 详细的winner字段分析
      console.log('\n🎯 Winner字段详细分析:')
      console.log('=' .repeat(50))
      console.log('原始winner值:', rawTask.winner)
      console.log('原始winner类型:', typeof rawTask.winner)
      console.log('格式化winner值:', task.winner)
      console.log('格式化winner类型:', typeof task.winner)
      
      // 检查各种可能的winner状态
      const winnerAnalysis = {
        isUndefined: task.winner === undefined,
        isNull: task.winner === null,
        isEmpty: task.winner === '',
        isZeroAddress: task.winner === '0x0000000000000000000000000000000000000000',
        length: task.winner ? task.winner.length : 'N/A',
        isValidAddress: task.winner && task.winner.length === 42 && task.winner.startsWith('0x')
      }
      
      console.log('Winner状态分析:', winnerAnalysis)
      
      // 检查任务状态与winner的一致性
      console.log('\n⚠️ 数据一致性检查:')
      console.log('=' .repeat(50))
      
      if (task.status === 2 && !winnerAnalysis.isValidAddress) {
        console.log('❌ 数据不一致：任务状态为开发中(2)，但没有有效的winner')
        console.log('💡 可能的原因：')
        console.log('   1. selectWinner交易失败或未完成')
        console.log('   2. 智能合约状态更新有问题')
        console.log('   3. 数据同步延迟')
        console.log('   4. 前端数据格式化错误')
        
        // 尝试直接从合约读取winner
        console.log('\n🔄 尝试直接从合约读取winner...')
        try {
          const contractWinner = await this.taskFactory.tasks(taskId)
          console.log('📋 合约中的完整任务数据:', contractWinner)
          console.log('🎯 合约中的winner字段:', contractWinner.winner)
          console.log('🎯 合约winner类型:', typeof contractWinner.winner)
          
          if (contractWinner.winner && contractWinner.winner !== '0x0000000000000000000000000000000000000000') {
            console.log('✅ 合约中有有效的winner，前端数据可能有问题')
            console.log('🔧 建议：刷新页面或重新获取任务数据')
          } else {
            console.log('❌ 合约中也没有有效的winner')
            console.log('🔧 建议：检查selectWinner交易是否成功执行')
          }
        } catch (error) {
          console.error('❌ 直接读取合约失败:', error.message)
        }
      }
      
      // 权限分析
      console.log('\n👤 用户权限分析:')
      console.log('=' .repeat(50))
      
      if (currentUser) {
        const isCreator = task.creator && task.creator.toLowerCase() === currentUser.toLowerCase()
        const isParticipant = participants.some(p => p.toLowerCase() === currentUser.toLowerCase())
        const isWinner = task.winner && task.winner.toLowerCase() === currentUser.toLowerCase()
        
        const permissionAnalysis = {
          currentUser,
          taskId,
          taskStatus: task.status,
          taskCreator: task.creator,
          taskWinner: task.winner,
          taskWinnerType: typeof task.winner,
          taskWinnerLength: task.winner ? task.winner.length : 'N/A',
          isCreator,
          isParticipant,
          isWinner,
          participants,
          participantsLength: participants.length,
          hasValidWinner: winnerAnalysis.isValidAddress,
          isWinnerUndefined: winnerAnalysis.isUndefined,
          isWinnerNull: winnerAnalysis.isNull,
          isWinnerEmpty: winnerAnalysis.isEmpty
        }
        
        console.log('权限分析结果:', permissionAnalysis)
        
        // 获取可执行操作
        const actions = this.getAvailableActions(task, currentUser)
        console.log('✅ 可执行操作:', actions.map(a => `${a.label} (${a.type})`))
        
        // 修复建议
        console.log('\n🔧 修复建议:')
        console.log('=' .repeat(50))
        
        if (task.status === 2 && !winnerAnalysis.isValidAddress) {
          if (isCreator) {
            console.log('👑 作为任务创建者，您可以：')
            console.log('   1. 检查是否已经选择了中标者')
            console.log('   2. 如果未选择，请重新选择中标者')
            console.log('   3. 检查selectWinner交易是否成功')
          }
          
          if (isParticipant) {
            console.log('👷 作为参与者，您可以：')
            console.log('   1. 联系任务发布者确认中标状态')
            console.log('   2. 使用调试模式的提交按钮（临时功能）')
            console.log('   3. 等待发布者重新选择中标者')
          }
        }
        
        // 数据修复操作
        if (task.status === 2 && !winnerAnalysis.isValidAddress && isParticipant) {
          console.log('\n🛠️ 数据修复操作:')
          console.log('=' .repeat(50))
          console.log('检测到可能的数据不一致问题，将在getAvailableActions中提供修复选项')
        }
      }
      
      console.log('=' .repeat(80))
      console.log('🔍 调试完成')
      
      return {
        task,
        currentUser,
        participants,
        winnerAnalysis,
        actions: currentUser ? this.getAvailableActions(task, currentUser) : []
      }
    } catch (error) {
      console.error('❌ 调试任务状态失败:', error)
      throw error
    }
  }

  /**
   * 尝试修复winner字段问题
   * @param {number} taskId - 任务ID
   */
  async repairWinnerField(taskId) {
    try {
      console.log('🔧 开始修复winner字段...')
      
      // 直接从合约读取数据
      const contractTask = await this.taskFactory.tasks(taskId)
      console.log('📋 合约任务数据:', contractTask)
      
      const contractWinner = contractTask.winner
      console.log('🎯 合约winner:', contractWinner)
      
      if (contractWinner && contractWinner !== '0x0000000000000000000000000000000000000000') {
        console.log('✅ 合约中有有效winner，问题可能在前端数据处理')
        
        // 重新格式化数据
        const repairedTask = this.formatTaskData(contractTask)
        console.log('🔄 重新格式化的任务数据:', repairedTask)
        
        if (repairedTask.winner && repairedTask.winner !== contractWinner) {
          console.log('⚠️ 格式化后winner发生变化')
          console.log('原始:', contractWinner)
          console.log('格式化后:', repairedTask.winner)
        }
        
        return repairedTask
      } else {
        console.log('❌ 合约中也没有有效winner，需要重新选择中标者')
        return null
      }
          } catch (error) {
      console.error('❌ 修复winner字段失败:', error)
      throw error
    }
  }

  /**
   * 调试Gas估算
   * @param {number} taskId - 任务ID
   * @returns {Promise<Object>} Gas信息
   */
  async debugGas(taskId) {
    try {
      console.log('⛽ 开始调试Gas估算，任务ID:', taskId)
      
      const gasInfo = {
        taskId: taskId,
        gasEstimate: null,
        gasPrice: null,
        balance: null,
        estimated: false,
        error: null
      }
      
      // 获取当前Gas价格
      try {
        const gasPrice = await this.signer.getGasPrice()
        gasInfo.gasPrice = gasPrice.toString()
        console.log('💰 当前Gas价格:', gasPrice.toString())
        } catch (error) {
        console.warn('⚠️ 获取Gas价格失败:', error.message)
      }
      
      // 获取账户余额
      try {
        const address = await this.signer.getAddress()
        const balance = await this.signer.getBalance()
        gasInfo.balance = balance.toString()
        console.log('💳 账户余额:', balance.toString())
      } catch (error) {
        console.warn('⚠️ 获取账户余额失败:', error.message)
      }
      
      // 使用固定Gas限制而不是估算（避免代理对象问题）
      try {
        // 为startBidding操作使用预设的Gas限制
        const fixedGasLimit = getGasLimit('START_BIDDING')
        gasInfo.gasEstimate = fixedGasLimit.toString()
        gasInfo.estimated = false // 标记为固定值而非估算值
        
        console.log('⛽ 使用固定Gas限制:', fixedGasLimit)
        console.log('💡 注意：由于ethers.js代理对象兼容性问题，使用固定Gas限制')
        
        // 计算预估费用
        if (gasInfo.gasPrice) {
          const estimatedCost = (fixedGasLimit * parseInt(gasInfo.gasPrice)).toString()
          gasInfo.estimatedCost = estimatedCost
          console.log('💰 预估Gas费用:', estimatedCost, 'wei')
        }
        
      } catch (error) {
        gasInfo.error = error.message
        console.error('❌ Gas处理失败:', error.message)
      }
      
      console.log('📊 Gas调试信息:', gasInfo)
      return gasInfo
      
    } catch (error) {
      console.error('❌ Gas调试失败:', error)
      return {
        taskId: taskId,
        error: error.message,
        estimated: false
      }
    }
  }

  /**
   * 调试仲裁员状态
   * @param {string} userAddress - 用户地址
   * @returns {Promise<Object>} 详细的调试信息
   */
  async debugArbitratorStatus(userAddress) {
    try {
      console.log('🔍 开始调试仲裁员状态...')
      console.log('👤 用户地址:', userAddress)
      
      // 1. 检查合约是否存在
      const code = await this.provider.getCode(this.contracts.disputeDAO.address)
      console.log('📋 合约代码存在:', code !== '0x')
      
      // 2. 获取最小质押金额
      const minStake = await this.contracts.disputeDAO.minStake()
      console.log('💰 最小质押金额:', ethers.utils.formatEther(minStake), 'ETH')
      
      // 3. 检查用户的仲裁员信息
      const jurorInfo = await this.contracts.disputeDAO.getJurorInfo(userAddress)
      console.log('👨‍⚖️ 仲裁员信息:', {
        stakeAmount: ethers.utils.formatEther(jurorInfo.stakeAmount),
        isActive: jurorInfo.isActive,
        lastDisputeId: jurorInfo.lastDisputeId.toNumber()
      })
      
      // 4. 检查用户余额
      const balance = await this.provider.getBalance(userAddress)
      console.log('💳 用户余额:', ethers.utils.formatEther(balance), 'ETH')
      
      // 5. 获取仲裁员总数
      const jurorList = []
      try {
        let index = 0
        while (true) {
          try {
            const juror = await this.contracts.disputeDAO.jurorList(index)
            jurorList.push(juror)
            index++
          } catch (error) {
            break
          }
        }
      } catch (error) {
        console.log('获取仲裁员列表时出错:', error.message)
      }
      console.log('📊 仲裁员总数:', jurorList.length)
      
      return {
        contractExists: code !== '0x',
        minStake: ethers.utils.formatEther(minStake),
        userInfo: {
          stakeAmount: ethers.utils.formatEther(jurorInfo.stakeAmount),
          isActive: jurorInfo.isActive,
          lastDisputeId: jurorInfo.lastDisputeId.toNumber()
        },
        userBalance: ethers.utils.formatEther(balance),
        totalJurors: jurorList.length
      }
    } catch (error) {
      console.error('❌ 调试仲裁员状态失败:', error)
      throw error
    }
  }
}

// 导出合约服务类
export default ContractService

// 全局调试函数 - 方便在浏览器控制台使用
window.debugTask = async function(taskId) {
  try {
    console.log('🔍 开始调试任务...')
    
    // 尝试从不同的可能位置获取contractService
    let contractService = null
    
    // 方法1: 从Vue应用实例获取
    if (window.app && window.app.config && window.app.config.globalProperties) {
      contractService = window.app.config.globalProperties.$contractService
    }
    
    // 方法2: 从Pinia store获取
    if (!contractService && window.pinia) {
      try {
        const { useWeb3Store } = await import('@/stores/web3')
        const web3Store = useWeb3Store()
        contractService = web3Store.contractService
      } catch (error) {
        console.log('无法从Pinia获取contractService:', error.message)
      }
    }
    
    // 方法3: 从全局变量获取
    if (!contractService && window.contractService) {
      contractService = window.contractService
    }
    
    // 方法4: 从web3Store获取
    if (!contractService && window.web3Store) {
      contractService = window.web3Store.contractService
    }
    
    if (!contractService) {
      console.error('❌ 无法找到contractService实例')
      console.log('💡 请确保应用已正确初始化')
      return
    }
    
    console.log('✅ 找到contractService实例')
    await contractService.debugTaskStatus(taskId)
  } catch (error) {
    console.error('❌ 调试失败:', error)
  }
}

// 检查selectWinner前置条件的全局函数
window.checkSelectWinner = async function(taskId, winnerAddress) {
  try {
    console.log('🔍 检查selectWinner前置条件...')
    
    // 获取contractService
    let contractService = null
    
    if (window.app && window.app.config && window.app.config.globalProperties) {
      contractService = window.app.config.globalProperties.$contractService
    }
    
    if (!contractService && window.pinia) {
      try {
        const { useWeb3Store } = await import('@/stores/web3')
        const web3Store = useWeb3Store()
        contractService = web3Store.contractService
      } catch (error) {
        console.log('无法从Pinia获取contractService:', error.message)
      }
    }
    
    if (!contractService && window.contractService) {
      contractService = window.contractService
    }
    
    if (!contractService && window.web3Store) {
      contractService = window.web3Store.contractService
    }
    
    if (!contractService) {
      console.error('❌ 无法找到contractService实例')
      return
    }
    
    console.log('✅ 找到contractService实例')
    const result = await contractService.checkSelectWinnerConditions(taskId, winnerAddress)
    
    if (result.isValid) {
      console.log('✅ 所有前置条件满足，可以选择中标者')
    } else {
      console.log('❌ 前置条件不满足，无法选择中标者')
      console.log('📋 错误列表:', result.errors)
    }
    
    return result
  } catch (error) {
    console.error('❌ 检查失败:', error)
  }
}

// 修复任务数据的全局函数
window.repairTask = async function(taskId) {
  try {
    console.log('🔧 开始修复任务数据...')
    
    let contractService = null
    
    if (window.app && window.app.config && window.app.config.globalProperties) {
      contractService = window.app.config.globalProperties.$contractService
    }
    
    if (!contractService && window.pinia) {
      try {
        const { useWeb3Store } = await import('@/stores/web3')
        const web3Store = useWeb3Store()
        contractService = web3Store.contractService
      } catch (error) {
        console.log('无法从Pinia获取contractService:', error.message)
      }
    }
    
    if (!contractService && window.contractService) {
      contractService = window.contractService
    }
    
    if (!contractService && window.web3Store) {
      contractService = web3Store.contractService
    }
    
    if (!contractService) {
      console.error('❌ 无法找到contractService实例')
      return
    }
    
    console.log('✅ 找到contractService实例')
    await contractService.repairWinnerField(taskId)
  } catch (error) {
    console.error('❌ 修复失败:', error)
  }
}

// 显示调试帮助信息
window.taskDebugHelp = function() {
  console.log(`
🔧 任务调试工具帮助
==================

可用命令:
1. debugTask(taskId) - 调试任务详情和状态
2. checkSelectWinner(taskId, winnerAddress) - 检查selectWinner前置条件
3. repairTask(taskId) - 尝试修复任务数据
4. taskDebugHelp() - 显示此帮助信息

示例:
debugTask(12)
checkSelectWinner(12, '0x295e7e12c8E7997a6Eb4d981973EDcF07D7F592A')
repairTask(12)
`)
}