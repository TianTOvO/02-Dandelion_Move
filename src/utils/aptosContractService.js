// Aptos 合约服务类
import {
  createAptosClient,
  buildTransactionPayload,
  signAndSubmitTransaction,
  waitForTransaction,
  getAptBalance,
  formatAptosAddress,
  CONTRACT_MODULES,
  DEFAULT_NETWORK
} from './aptosConfig.js'

// 合约地址配置
const CONTRACT_ADDRESSES = {
  testnet: '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b',
  mainnet: '0x1',
  devnet: '0x1'
}

/**
 * Aptos 合约服务类
 * 处理所有与 Move 智能合约的交互
 */
class AptosContractService {
  constructor(network = DEFAULT_NETWORK) {
    this.network = network
    this.client = createAptosClient(network)
    this.account = null
    this.connected = false
    this.contractAddress = '0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b'
    this.simulationMode = false // 关闭模拟模式，启用链上真实调用
  }

  /**
   * 设置账户信息
   */
  setAccount(account) {
    this.account = account
    this.connected = !!account
  }

  /**
   * 切换模拟模式
   */
  setSimulationMode(enabled) {
    this.simulationMode = enabled
    console.log(`🎭 模拟模式已${enabled ? '启用' : '禁用'}`)
  }

  /**
   * 检查合约是否已部署
   */
  async checkContractDeployed() {
    try {
      const response = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/accounts/${this.contractAddress}/resources`)
      if (!response.ok) {
        console.error('获取账户资源失败:', response.status)
        return false
      }

      const resources = await response.json()
      const packageRegistry = resources.find(r => r.type === "0x1::code::PackageRegistry")

      if (packageRegistry) {
        const packages = packageRegistry.data.packages
        const moveContractsPackage = packages.find(pkg => pkg.name === "MoveContracts")
        if (moveContractsPackage && moveContractsPackage.modules.length > 0) {
          console.log('✅ 检测到已部署的合约包:', moveContractsPackage.name)
          console.log('📦 包含模块:', moveContractsPackage.modules.map(m => m.name).join(', '))
          return true
        }
      }

      return false
    } catch (error) {
      console.error('检查合约部署状态失败:', error)
      return false
    }
  }

  /**
   * 自动检测并设置模式
   */
  async autoDetectMode() {
    const isDeployed = await this.checkContractDeployed()
    // 默认关闭模拟模式，因为合约已部署
    this.simulationMode = false
    console.log(`🔍 自动检测: 合约${isDeployed ? '已部署' : '未部署'}，${this.simulationMode ? '启用' : '禁用'}模拟模式`)
    return isDeployed
  }

  /**
   * 模拟交易结果
   */
  simulateTransaction(action, data = {}) {
    if (!this.simulationMode) return null

    console.log(`🎭 模拟模式: ${action}`)
    console.log('📋 参数:', data)

    const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)

    console.log('✅ 模拟交易成功')
    console.log('🔗 交易哈希:', mockTxHash)

    return {
      hash: mockTxHash,
      ...data
    }
  }

  /**
   * 获取账户余额
   */
  async getBalance(address = null) {
    const targetAddress = address || this.account?.address
    if (!targetAddress) {
      throw new Error('未提供地址且未连接钱包')
    }
    return await getAptBalance(this.client, targetAddress)
  }

  /**
   * 初始化合约
   */
  async initializeContracts(ownerAddress) {
    const initPromises = []

    // 初始化 TaskFactory
    initPromises.push(this.initTaskFactory(ownerAddress))

    // 初始化 BiddingSystem
    initPromises.push(this.initBiddingSystem(ownerAddress, 1000000)) // 1 APT 保证金

    // 初始化 Escrow
    initPromises.push(this.initEscrow(ownerAddress))

    // 初始化 DisputeDAO
    initPromises.push(this.initDisputeDAO(ownerAddress, 1000000, 3, 86400))

    try {
      const results = await Promise.all(initPromises)
      console.log('✅ 所有合约初始化成功:', results)
      return results
    } catch (error) {
      console.error('❌ 合约初始化失败:', error)
      throw error
    }
  }

  /**
   * 初始化 TaskFactory
   */
  async initTaskFactory(ownerAddress) {
    try {
      console.log('🚀 开始初始化 TaskFactory...')
      console.log('📋 初始化参数:', { ownerAddress, contractAddress: this.contractAddress })

      // 检查账户状态
      if (!ownerAddress) {
        throw new Error('所有者地址不能为空')
      }

      // 检查合约地址
      if (!this.contractAddress) {
        throw new Error('合约地址未设置')
      }

      // 检查网络连接
      try {
        await this.client.getLedgerInfo()
        console.log('✅ 网络连接正常')
      } catch (networkError) {
        console.error('❌ 网络连接失败:', networkError)
        throw new Error('网络连接失败，请检查网络设置')
      }

      // 检查账户余额
      try {
        const balance = await this.getBalance(ownerAddress)
        console.log(`💰 账户余额: ${balance} APT`)
        if (balance < 0.01) {
          console.warn('⚠️ 账户余额较低，可能不足以支付交易费用')
        }
      } catch (balanceError) {
        console.warn('⚠️ 无法获取账户余额:', balanceError.message)
      }

      const payload = buildTransactionPayload(
        this.contractAddress,
        'TaskFactory',
        'init',
        [],
        []
      )

      console.log('📦 交易载荷:', JSON.stringify(payload, null, 2))

      // 提交交易
      console.log('📤 正在提交交易...')
      console.log('💡 请在Petra钱包中确认交易')
      console.log('📱 如果钱包没有弹出，请检查钱包是否已连接')

      const tx = await signAndSubmitTransaction(payload)
      console.log('✅ 交易已提交:', tx.hash)

      // 等待交易确认
      console.log('⏳ 等待交易确认...')
      const result = await waitForTransaction(this.client, tx.hash)
      console.log('✅ 交易已确认:', result)

      return { contract: 'TaskFactory', hash: tx.hash, success: true }
    } catch (error) {
      console.error('❌ TaskFactory 初始化失败:', error)

      // 提供更详细的错误信息
      let errorMessage = error.message || '未知错误'

      if (errorMessage.includes('insufficient balance')) {
        errorMessage = '账户余额不足，请确保有足够的APT支付交易费用'
      } else if (errorMessage.includes('network')) {
        errorMessage = '网络连接问题，请检查网络设置'
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('4001')) {
        errorMessage = '用户拒绝了交易。请在Petra钱包中点击"确认"按钮来批准交易。如果钱包没有弹出，请检查钱包连接状态。'
      } else if (errorMessage.includes('invalid function')) {
        errorMessage = '合约函数调用错误，请检查合约地址和函数名'
      } else if (errorMessage.includes('Resource not found')) {
        errorMessage = '合约资源未找到，请确认合约已正确部署'
      } else if (errorMessage.includes('Account not found')) {
        errorMessage = '账户未找到，请检查账户地址'
      } else if (errorMessage.includes('PetraApiError')) {
        errorMessage = 'Petra钱包API错误。请确保：1) Petra钱包已安装并连接 2) 网络设置为Aptos测试网 3) 账户有足够余额'
      }

      throw new Error(`TaskFactory 初始化失败: ${errorMessage}`)
    }
  }

  /**
   * 初始化 BiddingSystem
   */
  async initBiddingSystem(ownerAddress, depositAmount) {
    // 将 APT 转换为 octa
    const depositInOcta = this.aptToOcta(depositAmount)
    console.log(`💰 初始化保证金转换: ${depositAmount} APT = ${depositInOcta} octa`)

    const payload = buildTransactionPayload(
      this.contractAddress,
      'BiddingSystem',
      'init',
      [],
      [depositInOcta]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { contract: 'BiddingSystem', hash: tx.hash }
  }

  /**
   * 初始化 Escrow
   */
  async initEscrow(ownerAddress) {
    const payload = buildTransactionPayload(
      this.contractAddress,
      'Escrow',
      'init',
      [],
      []
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { contract: 'Escrow', hash: tx.hash }
  }

  /**
   * 初始化 DisputeDAO
   */
  async initDisputeDAO(ownerAddress, minStake, jurorsPerDispute, jurorCooldown) {
    // 将 APT 转换为 octa
    const minStakeInOcta = this.aptToOcta(minStake)
    console.log(`💰 最小质押转换: ${minStake} APT = ${minStakeInOcta} octa`)

    const payload = buildTransactionPayload(
      this.contractAddress,
      'DisputeDAO',
      'init',
      [],
      [minStakeInOcta, jurorsPerDispute.toString(), jurorCooldown.toString()]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { contract: 'DisputeDAO', hash: tx.hash }
  }

  /**
   * 将 APT 转换为 octa（最小单位）
   */
  aptToOcta(aptAmount) {
    // 1 APT = 100,000,000 octa
    const OCTA_PER_APT = 100000000
    const octaAmount = Math.floor(parseFloat(aptAmount) * OCTA_PER_APT)
    return octaAmount.toString()
  }

  /**
   * 确保 TaskFactory 已初始化（只检查，不自动初始化）
   */
  async ensureTaskFactoryInitialized() {
    try {
      console.log('🔍 检查 TaskFactory 初始化状态...')

      // 检查当前账户是否有 TaskFactoryState 资源
      const resources = await this.client.getAccountResources(this.account.address)
      console.log('📋 账户资源数量:', resources.length)

      const taskFactoryState = resources.find(r =>
        r.type === `${this.contractAddress}::TaskFactory::TaskFactoryState`
      )

      if (!taskFactoryState) {
        console.error('❌ TaskFactory 未初始化')
        throw new Error('TaskFactory 未初始化，请联系合约部署者进行初始化')
      } else {
        console.log('✅ TaskFactory 已初始化')
        console.log('📋 TaskFactoryState 资源:', taskFactoryState)
      }
    } catch (error) {
      console.error('❌ TaskFactory 初始化检查失败:', error)
      throw new Error(`TaskFactory 检查失败: ${error.message}`)
    }
  }

  /**
   * 创建任务
   */
  async createTask({ title, ipfsHash, reward, deadline, taskType, biddingPeriod, developmentPeriod }) {
    if (this.simulationMode) {
      console.log('🎭 模拟模式: 创建任务')
      console.log('📋 任务参数:', { title, ipfsHash, reward, deadline, taskType, biddingPeriod, developmentPeriod })

      // 模拟交易结果
      const mockTaskId = Date.now().toString()
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)

      console.log('✅ 模拟任务创建成功')
      console.log('�� 任务ID:', mockTaskId)
      console.log('🔗 交易哈希:', mockTxHash)

      return {
        hash: mockTxHash,
        taskId: mockTaskId
      }
    }

    // TaskFactory已初始化，直接创建任务
    console.log('📝 开始创建任务...')

    // 将 APT 转换为 octa
    const rewardInOcta = this.aptToOcta(reward)
    console.log(`💰 奖励转换: ${reward} APT = ${rewardInOcta} octa`)

    // 将字符串转换为字节数组
    const titleBytes = Array.from(new TextEncoder().encode(title))
    const descriptionBytes = Array.from(new TextEncoder().encode(ipfsHash))

    console.log('📝 参数转换:')
    console.log('  标题字节:', titleBytes)
    console.log('  描述字节:', descriptionBytes)
    console.log('  奖励(octa):', rewardInOcta)
    console.log('  截止时间:', deadline)

    // 构建交易载荷 - 只传递Move合约需要的参数
    const payload = buildTransactionPayload(
      this.contractAddress,
      'TaskFactory',
      'create_task',
      [],
      [titleBytes, descriptionBytes, rewardInOcta, deadline]
    )

    console.log('📦 交易载荷:', JSON.stringify(payload, null, 2))

    const tx = await signAndSubmitTransaction(payload)
    const result = await waitForTransaction(this.client, tx.hash)

    // 从事件中提取任务ID（如果合约有事件的话）
    const events = result.events || []
    const taskEvent = events.find(e => e.type.includes('TaskEvent'))

    // 如果没有事件，尝试从交易结果中获取任务ID
    let taskId = null
    if (taskEvent && taskEvent.data && taskEvent.data.task_id) {
      taskId = taskEvent.data.task_id
    } else {
      // 尝试从交易结果中获取任务数量，新任务的ID就是当前任务数量减1
      try {
        const allTasks = await this.getAllTasks()
        taskId = allTasks.length.toString()
      } catch (error) {
        console.warn('无法获取任务ID，使用时间戳作为临时ID:', error.message)
        taskId = Date.now().toString()
      }
    }

    return {
      hash: tx.hash,
      taskId: taskId
    }
  }

  /**
   * 开启竞标
   */
  async openBidding(taskId) {
    const mockResult = this.simulateTransaction('openBidding', { taskId })
    if (mockResult) return mockResult

    const payload = buildTransactionPayload(
      this.contractAddress,
      'TaskFactory',
      'open_bidding',
      [],
      [taskId.toString()]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { hash: tx.hash }
  }

  /**
   * 参与竞标
   */
  async placeBid(taskId, deposit) {
    const mockResult = this.simulateTransaction('placeBid', { taskId, deposit })
    if (mockResult) return mockResult

    // 将 APT 转换为 octa
    const depositInOcta = this.aptToOcta(deposit)
    console.log(`💰 保证金转换: ${deposit} APT = ${depositInOcta} octa`)

    const payload = buildTransactionPayload(
      this.contractAddress,
      'BiddingSystem',
      'place_bid',
      [],
      [taskId.toString(), depositInOcta]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { hash: tx.hash }
  }

  /**
   * 选择中标者
   */
  async selectWinner(taskId, bidIndex) {
    const payload = buildTransactionPayload(
      this.contractAddress,
      'BiddingSystem',
      'select_winner',
      [],
      [taskId.toString(), bidIndex.toString()]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { hash: tx.hash }
  }

  /**
   * 存入资金
   */
  async depositFunds(taskId, amount) {
    // 将 APT 转换为 octa
    const amountInOcta = this.aptToOcta(amount)
    console.log(`💰 存款转换: ${amount} APT = ${amountInOcta} octa`)

    const payload = buildTransactionPayload(
      this.contractAddress,
      'Escrow',
      'deposit_funds',
      [],
      [taskId.toString(), amountInOcta]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { hash: tx.hash }
  }

  /**
   * 释放资金
   */
  async releaseFunds(taskId, winner) {
    const payload = buildTransactionPayload(
      this.contractAddress,
      'Escrow',
      'release_funds',
      [],
      [taskId.toString(), formatAptosAddress(winner)]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { hash: tx.hash }
  }

  /**
 * 获取任务信息
 */
  async getTask(taskId) {
    if (this.simulationMode) {
      console.log('🎭 模拟模式: 获取任务', taskId)
      // 返回模拟任务数据
      return {
        id: taskId,
        title: '模拟任务',
        description: '这是一个模拟任务',
        status: 'open',
        creator: this.account?.address || '0x123...',
        reward: '1.0',
        deadline: Math.floor(Date.now() / 1000) + 86400,
        taskType: 1,
        biddingPeriod: 72,
        developmentPeriod: 14,
        ipfsHash: 'QmSimulatedHash'
      }
    }

    try {
      console.log(`🔍 获取任务详情: ${taskId}`)

      // 检查 taskId 是否有效
      if (taskId === null || taskId === undefined) {
        throw new Error('任务ID不能为空')
      }

      // 调用 Move 合约的 view_get_task view 函数
      const payload = {
        function: `${this.contractAddress}::TaskFactory::view_get_task`,
        type_arguments: [],
        arguments: [taskId.toString()]
      }

      const response = await this.client.view(payload)
      console.log(`✅ 任务详情获取成功:`, response)

      if (response && response.length > 0) {
        const taskData = response[0]
        return {
          id: taskId,
          title: taskData.title,
          description: taskData.description,
          creator: taskData.creator,
          reward: taskData.budget,
          deadline: taskData.deadline,
          status: taskData.status,
          participants: taskData.participants || [],
          winner: taskData.winner,
          dispute_deadline: taskData.dispute_deadline,
          locked: taskData.locked,
          ipfsHash: taskData.description // 使用description作为IPFS哈希
        }
      } else {
        throw new Error('任务不存在')
      }
    } catch (error) {
      console.error('获取任务信息失败:', error)
      throw error
    }
  }

  /**
 * 获取所有任务
 */
  async getAllTasks() {
    if (this.simulationMode) {
      console.log('🎭 模拟模式: 获取所有任务')
      // 返回模拟任务列表
      return [
        {
          id: '1752758276806',
          title: '模拟任务 1',
          description: '这是一个模拟任务',
          status: 'open',
          creator: this.account?.address || '0x123...',
          reward: '1.0',
          deadline: Math.floor(Date.now() / 1000) + 86400,
          taskType: 1,
          biddingPeriod: 72,
          developmentPeriod: 14,
          ipfsHash: 'QmSimulatedHash1'
        },
        {
          id: '1752758276807',
          title: '模拟任务 2',
          description: '这是另一个模拟任务',
          status: 'bidding',
          creator: this.account?.address || '0x123...',
          reward: '2.0',
          deadline: Math.floor(Date.now() / 1000) + 172800,
          taskType: 2,
          biddingPeriod: 48,
          developmentPeriod: 7,
          ipfsHash: 'QmSimulatedHash2'
        }
      ]
    }

    try {
      console.log('🔍 获取所有任务')

      // 调用 Move 合约的 view_get_all_tasks view 函数
      const payload = {
        function: `${this.contractAddress}::TaskFactory::view_get_all_tasks`,
        type_arguments: [],
        arguments: []
      }

      const response = await this.client.view(payload)
      console.log(`✅ 所有任务获取成功:`, response)

      if (response && Array.isArray(response)) {
        return response.map((taskData, index) => ({
          id: index, // 使用索引作为任务ID
          title: taskData.title,
          description: taskData.description,
          creator: taskData.creator,
          reward: taskData.budget,
          deadline: taskData.deadline,
          status: taskData.status,
          participants: taskData.participants || [],
          winner: taskData.winner,
          dispute_deadline: taskData.dispute_deadline,
          locked: taskData.locked,
          ipfsHash: taskData.description // 使用description作为IPFS哈希
        }))
      } else {
        console.warn('未获取到任务数据')
        return []
      }
    } catch (error) {
      console.error('获取所有任务失败:', error)
      return []
    }
  }

  /**
   * 获取竞标信息
   */
  async getBids(taskId) {
    try {
      const resources = await this.client.getAccountResources(this.account.address)
      const biddingResource = resources.find(r =>
        r.type.includes('BiddingSystemState')
      )

      if (!biddingResource) {
        throw new Error('未找到竞标系统资源')
      }

      return biddingResource.data
    } catch (error) {
      console.error('获取竞标信息失败:', error)
      throw error
    }
  }

  /**
   * 参与争议仲裁
   */
  async stakeAsJuror(amount) {
    const payload = buildTransactionPayload(
      this.contractAddress,
      'dandelion',
      'stake_as_juror',
      [],
      [amount.toString()]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { hash: tx.hash }
  }

  /**
   * 投票
   */
  async vote(disputeId, candidate) {
    const payload = buildTransactionPayload(
      this.contractAddress,
      'dandelion',
      'vote',
      [],
      [disputeId.toString(), formatAptosAddress(candidate)]
    )

    const tx = await signAndSubmitTransaction(payload)
    await waitForTransaction(this.client, tx.hash)
    return { hash: tx.hash }
  }

  /**
   * 获取网络状态
   */
  async getNetworkStatus() {
    try {
      const ledgerInfo = await this.client.getLedgerInfo()
      return {
        chainId: ledgerInfo.chain_id,
        epoch: ledgerInfo.epoch,
        ledgerVersion: ledgerInfo.ledger_version,
        ledgerTimestamp: ledgerInfo.ledger_timestamp
      }
    } catch (error) {
      console.error('获取网络状态失败:', error)
      throw error
    }
  }

  /**
   * 检查合约是否已部署
   */
  async checkContractDeployment(moduleName) {
    try {
      const resources = await this.client.getAccountResources(this.contractAddress)
      const moduleResource = resources.find(r =>
        r.type.includes(moduleName)
      )
      return !!moduleResource
    } catch (error) {
      console.error('检查合约部署状态失败:', error)
      return false
    }
  }
}

export default AptosContractService 