import { defineStore } from 'pinia'
import { useIpfsStore } from './ipfs'
import { useWeb3Store } from './web3'

// 任务状态映射 - 完全匹配合约TaskStatus枚举
export const TASK_STATUS = {
  CREATED: 0,              // 已创建
  BIDDING: 1,              // 竞标中
  IN_PROGRESS: 2,          // 开发中
  PENDING_EMPLOYER_CONFIRM: 3,  // 待雇主确认
  COMPLETED: 4,            // 已完成
  DISPUTED: 5,             // 争议中
  PENDING_DISPUTE_PERIOD: 6     // 争议期
}

// 任务类型映射 - 完全匹配合约TaskType映射
export const TASK_TYPE = {
  OTHER: 0,               // 其他
  WEB3: 1,                // web3
  UI_UX: 2,               // UI/UX
  MARKET_PROMOTION: 3,    // Market Promotion
  CONTENT_PRODUCTION: 4,  // Content Production
  DATA_ANALYTICS: 5       // Data Analytics
}

// 任务类型选项 - 用于表单下拉框
export const TASK_TYPES = [
  { value: '1', label: 'Web3开发' },
  { value: '2', label: 'UI/UX设计' },
  { value: '3', label: '市场推广' },
  { value: '4', label: '内容创作' },
  { value: '5', label: '数据分析' },
  { value: '0', label: '其他' }
]

// 竞标配置
export const BIDDING_CONFIG = {
  MIN_DEPOSIT_RATIO: 0.1,      // 最小押金比例 (10%)
  PLATFORM_FEE_RATIO: 0.005,   // 平台费用比例 (0.5%)
  DEFAULT_BIDDING_PERIOD: 72,  // 默认竞标期(小时)
  DEFAULT_DEV_PERIOD: 14,      // 默认开发期(天)
  REVIEW_PERIOD: 7,            // 评审期(天)
  DISPUTE_PERIOD: 3,           // 争议期(天)
  ARBITRATION_PERIOD: 3        // 仲裁期(天)
}

export const getStatusText = (status) => {
  const statusTexts = {
    0: '已创建',
    1: '竞标中',
    2: '开发中',
    3: '待雇主确认',
    4: '已完成',
    5: '争议中',
    6: '争议期'
  }
  return statusTexts[status] || '未知'
}

export const getStatusClass = (status) => {
  const statusClasses = {
    0: 'bg-gray-100 text-gray-800',      // 已创建 - 灰色
    1: 'bg-green-100 text-green-800',    // 竞标中 - 绿色
    2: 'bg-blue-100 text-blue-800',      // 开发中 - 蓝色
    3: 'bg-yellow-100 text-yellow-800',  // 待雇主确认 - 黄色
    4: 'bg-purple-100 text-purple-800',  // 已完成 - 紫色
    5: 'bg-red-100 text-red-800',        // 争议中 - 红色
    6: 'bg-orange-100 text-orange-800'   // 争议期 - 橙色
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

// 任务类型文本映射 - 匹配合约
export const getTypeText = (type) => {
  const typeTexts = {
    0: '其他',
    1: 'Web3开发',
    2: 'UI/UX设计',
    3: '市场推广',
    4: '内容创作',
    5: '数据分析'
  }
  return typeTexts[type] || '其他'
}

// 任务类型样式类
export const getTypeClass = (type) => {
  const typeClasses = {
    0: 'bg-gray-100 text-gray-800',       // 其他
    1: 'bg-purple-100 text-purple-800',   // Web3开发
    2: 'bg-pink-100 text-pink-800',       // UI/UX设计
    3: 'bg-cyan-100 text-cyan-800',       // 市场推广
    4: 'bg-orange-100 text-orange-800',   // 内容创作
    5: 'bg-indigo-100 text-indigo-800'    // 数据分析
  }
  return typeClasses[type] || 'bg-gray-100 text-gray-800'
}

// 合约类型到前端类型的转换
export const contractTypeToFrontend = (contractType) => {
  const mapping = {
    'Other': 0,
    'web3': 1,
    'UI/UX': 2,
    'Market Promotion': 3,
    'Content Production': 4,
    'Data Analytics': 5
  }
  return mapping[contractType] ?? 0
}

// 前端类型到合约类型的转换
export const frontendTypeToContract = (frontendType) => {
  const mapping = {
    0: 'Other',
    1: 'web3',
    2: 'UI/UX',
    3: 'Market Promotion',
    4: 'Content Production',
    5: 'Data Analytics'
  }
  return mapping[frontendType] ?? 'Other'
}

export const useDataStore = defineStore('data', {
  state: () => ({
    // 数据缓存
    tasks: [],
    users: {},
    disputes: [],
    bids: {},
    userProfiles: {},

    // 加载状态
    loading: false,
    error: null,

    // 数据统计
    stats: {
      totalTasks: 0,
      activeTasks: 0,
      completedTasks: 0,
      totalRewards: '0'
    },
    arbitrators: [],
    initialized: false
  }),

  getters: {
    // 根据状态过滤任务
    tasksByStatus: (state) => (status) => {
      return state.tasks.filter(task => task.status === status)
    },

    // 根据类型过滤任务
    tasksByType: (state) => (type) => {
      return state.tasks.filter(task => task.taskType === type)
    },

    // 根据ID获取单个任务
    getTaskById: (state) => (taskId) => {
      return state.tasks.find(task => task.id === parseInt(taskId))
    },

    // 获取用户发布的任务
    tasksByCreator: (state) => (creator) => {
      return state.tasks.filter(task => task.creator.toLowerCase() === creator.toLowerCase())
    },

    // 获取用户参与的任务
    tasksByParticipant: (state) => (participant) => {
      return state.tasks.filter(task => {
        const taskBids = state.bids[task.id] || []
        return taskBids.some(bid => bid.bidder.toLowerCase() === participant.toLowerCase())
      })
    },

    // 获取任务的竞标
    getBidsByTaskId: (state) => (taskId) => {
      return state.bids[taskId] || []
    },

    // 获取用户资料
    getUserProfile: (state) => (address) => {
      return state.userProfiles[address.toLowerCase()] || null
    },

    // 获取用户发布的任务
    getTasksByCreator: (state) => (creatorAddress) => {
      if (!creatorAddress) return []
      return state.tasks.filter(task =>
        task.creator.toLowerCase() === creatorAddress.toLowerCase()
      )
    },

    // 获取用户参与的任务
    getTasksByParticipant: (state) => (participantAddress) => {
      if (!participantAddress) return []
      return state.tasks.filter(task => {
        // 检查是否在竞标者列表中
        const isBidder = task.bidders && task.bidders.some(bidder =>
          bidder.address.toLowerCase() === participantAddress.toLowerCase()
        )

        // 检查是否是中标者
        const isWinner = task.winner &&
          task.winner.toLowerCase() === participantAddress.toLowerCase()

        return isBidder || isWinner
      })
    },

    // 按状态获取任务
    getTasksByStatus: (state) => (status) => {
      return state.tasks.filter(task => task.status === status)
    },

    // 获取竞标中的任务
    getBiddingTasks: (state) => {
      return state.tasks.filter(task => task.status === TASK_STATUS.BIDDING)
    },

    // 获取需要仲裁的任务
    getDisputedTasks: (state) => {
      return state.tasks.filter(task =>
        task.status === TASK_STATUS.DISPUTED || task.status === TASK_STATUS.PENDING_DISPUTE_PERIOD
      )
    }
  },

  actions: {
    // 初始化数据 - 优先从合约加载，然后从IPFS补充
    async initializeData() {
      if (this.initialized) return

      console.log('🚀 开始初始化数据存储...')

      try {
        // 1. 检查Web3连接状态
        const web3Store = useWeb3Store()

        if (web3Store.isConnected && !web3Store.contractService) {
          console.log('🔗 钱包已连接但合约服务未初始化，正在初始化...')
          await web3Store.initializeContracts()
        } else if (!web3Store.isConnected) {
          console.log('🔗 钱包未连接，跳过合约初始化')
        }

        // 2. 如果有合约服务，从合约加载任务数据
        if (web3Store.contractService) {
          console.log('📡 从智能合约加载任务数据...')
          await this.loadTasksFromContract()
        } else {
          console.log('📝 合约服务不可用，初始化为空数据')
          this.tasks = []
        }

        this.initialized = true
        this.updateStats()

        console.log('✅ 数据初始化完成:', {
          tasks: this.tasks.length,
          users: Object.keys(this.users).length,
          arbitrators: this.arbitrators?.length || 0,
          contractService: !!web3Store.contractService
        })

      } catch (error) {
        console.error('❌ 数据初始化失败:', error)
        this.error = '数据初始化失败: ' + error.message
        // 即使初始化失败，也标记为已初始化，避免重复尝试
        this.initialized = true
        this.tasks = []
        this.updateStats()
      }
    },

    // 获取所有任务 - 只从合约获取
    async getAllTasks() {
      console.log('📋 获取所有任务数据...')

      // 检查合约服务是否可用
      const web3Store = useWeb3Store()
      if (!web3Store.aptosContractService) {
        console.log('⚠️ Aptos合约服务不可用，返回空任务列表')
        this.tasks = []
        return this.tasks
      }

      // 直接从合约获取任务数据
      await this.loadTasksFromContract()

      console.log(`✅ 返回 ${this.tasks.length} 个任务`)
      return this.tasks
    },

    // 根据ID获取单个任务数据
    async fetchTaskById(taskId) {
      try {
        console.log('🔍 获取任务详情，ID:', taskId)

        // 首先从本地缓存查找
        let task = this.tasks.find(t => t.id === parseInt(taskId))

        if (task) {
          console.log('✅ 从本地缓存获取任务:', task.title)
          return task
        }

        // 如果本地没有，从合约获取
        console.log('📡 本地缓存未找到，从合约获取任务数据...')

        if (!useWeb3Store().aptosContractService) {
          console.warn('⚠️ Aptos合约服务未初始化')
          return null
        }

        // 从合约获取单个任务
        const contractTask = await useWeb3Store().aptosContractService.getTask(taskId)

        if (!contractTask) {
          console.warn('⚠️ 合约中未找到任务:', taskId)
          return null
        }

        // 格式化任务数据
        const formattedTask = await this.formatTaskFromContract(contractTask)

        // 添加到本地缓存
        const existingIndex = this.tasks.findIndex(t => t.id === formattedTask.id)
        if (existingIndex >= 0) {
          this.tasks[existingIndex] = formattedTask
        } else {
          this.tasks.push(formattedTask)
        }

        console.log('✅ 任务数据获取并缓存成功:', formattedTask.title)
        this.updateStats()

        return formattedTask
      } catch (error) {
        console.error('❌ 获取任务详情失败:', error)
        this.error = `获取任务详情失败: ${error.message}`
        return null
      }
    },

    // 从合约加载任务数据
    async loadTasksFromContract() {
      try {
        console.log('🔄 从合约加载任务数据...')

        if (!useWeb3Store().aptosContractService) {
          console.warn('⚠️ Aptos合约服务未初始化，跳过任务加载')
          this.tasks = []
          this.updateStats()
          return []
        }

        const contractTasks = await useWeb3Store().aptosContractService.getAllTasks()
        console.log('📄 从合约获取的任务:', contractTasks.length, '个')

        const contractTasksWithIPFS = []

        for (const contractTask of contractTasks) {
          try {
            console.log(`📝 处理任务 ${contractTask.id}:`, {
              title: contractTask.title,
              ipfsHash: contractTask.ipfsHash,
              status: contractTask.status,
              creator: contractTask.creator,
              employer: contractTask.employer,
              rawTask: contractTask // 显示完整的合约任务数据
            })

            // 确保合约数据有必要的字段
            const normalizedContractTask = {
              id: contractTask.id || 'unknown',
              title: contractTask.title || '未命名任务',
              description: contractTask.description || '',
              status: contractTask.status || 0,
              creator: contractTask.creator || '',
              reward: contractTask.reward || '0',
              deadline: contractTask.deadline || Math.floor(Date.now() / 1000) + 86400,
              taskType: contractTask.taskType || 1,
              biddingPeriod: contractTask.biddingPeriod || 72,
              developmentPeriod: contractTask.developmentPeriod || 14,
              ipfsHash: contractTask.ipfsHash || '',
              bidders: Array.isArray(contractTask.bidders) ? contractTask.bidders : [],
              participants: Array.isArray(contractTask.participants) ? contractTask.participants : []
            }

            let ipfsData = null

            // 检查IPFS哈希是否有效
            if (normalizedContractTask.ipfsHash && normalizedContractTask.ipfsHash !== '0' && normalizedContractTask.ipfsHash !== '') {
              console.log(`🔍 获取任务 ${normalizedContractTask.id} 的IPFS数据:`, normalizedContractTask.ipfsHash)

              // 验证IPFS哈希格式
              if (useIpfsStore().isValidIPFSHash && useIpfsStore().isValidIPFSHash(normalizedContractTask.ipfsHash)) {
                try {
                  ipfsData = await useIpfsStore().getTaskData(normalizedContractTask.ipfsHash)
                  console.log(`✅ 任务 ${normalizedContractTask.id} IPFS数据获取成功`)
                } catch (ipfsError) {
                  console.warn(`⚠️ 任务 ${normalizedContractTask.id} IPFS数据获取失败:`, ipfsError.message)
                  // 继续处理，使用合约数据
                }
              } else {
                console.warn(`⚠️ 任务 ${normalizedContractTask.id} 包含无效的IPFS哈希:`, normalizedContractTask.ipfsHash)
                // 创建默认的IPFS数据结构
                ipfsData = {
                  title: normalizedContractTask.title || '未命名任务',
                  description: '此任务的详细信息无法加载（无效的IPFS哈希）',
                  taskType: 'web',
                  requirements: '',
                  skillsRequired: [],
                  githubRequired: false,
                  githubRepo: '',
                  chainlinkVerification: false,
                  attachments: [],
                  employer: {
                    address: normalizedContractTask.creator || '',
                    name: '',
                    email: '',
                    company: '',
                    avatar: '',
                    bio: '',
                    website: '',
                    socialLinks: {}
                  },
                  biddingPeriod: normalizedContractTask.biddingPeriod || 72,
                  developmentPeriod: normalizedContractTask.developmentPeriod || 14,
                  createdAt: Date.now(),
                  version: '1.0',
                  metadata: {
                    platform: 'Dandelion',
                    error: 'Invalid IPFS hash',
                    invalidHash: normalizedContractTask.ipfsHash
                  }
                }
              }
            } else {
              console.log(`📝 任务 ${normalizedContractTask.id} 没有IPFS数据，使用合约数据`)
              // 创建基本的任务数据结构
              ipfsData = {
                title: normalizedContractTask.title || '未命名任务',
                description: '此任务没有详细描述信息',
                taskType: 'web',
                requirements: '',
                skillsRequired: [],
                githubRequired: false,
                githubRepo: '',
                chainlinkVerification: false,
                attachments: [],
                employer: {
                  address: normalizedContractTask.creator || '',
                  name: '',
                  email: '',
                  company: '',
                  avatar: '',
                  bio: '',
                  website: '',
                  socialLinks: {}
                },
                biddingPeriod: normalizedContractTask.biddingPeriod || 72,
                developmentPeriod: normalizedContractTask.developmentPeriod || 14,
                createdAt: Date.now(),
                version: '1.0',
                metadata: {
                  platform: 'Dandelion',
                  note: 'No IPFS data available'
                }
              }
            }

            // 合并合约数据和IPFS数据
            const mergedTask = {
              // 基本信息优先使用IPFS数据
              title: ipfsData?.title || normalizedContractTask.title || '未命名任务',
              description: ipfsData?.description || '暂无描述',
              requirements: ipfsData?.requirements || '',
              taskType: ipfsData?.taskType || 'web',
              skillsRequired: Array.isArray(ipfsData?.skillsRequired) ? ipfsData.skillsRequired : [],

              // 合约数据（权威数据）
              id: normalizedContractTask.id,
              employer: normalizedContractTask.creator, // 使用creator字段
              creator: normalizedContractTask.creator, // 向后兼容：creator字段
              reward: normalizedContractTask.reward,
              deadline: normalizedContractTask.deadline,
              status: normalizedContractTask.status,
              ipfsHash: normalizedContractTask.ipfsHash,

              // 竞标者数据（确保是数组）
              bidders: Array.isArray(normalizedContractTask.bidders) ? normalizedContractTask.bidders : [],
              participants: Array.isArray(normalizedContractTask.participants) ? normalizedContractTask.participants : [],

              // IPFS扩展数据
              githubRequired: ipfsData?.githubRequired || false,
              githubRepo: ipfsData?.githubRepo || '',
              chainlinkVerification: ipfsData?.chainlinkVerification || false,
              attachments: Array.isArray(ipfsData?.attachments) ? ipfsData.attachments : [],

              // 时间规划数据
              biddingPeriod: normalizedContractTask.biddingPeriod || ipfsData?.biddingPeriod || 72,
              developmentPeriod: normalizedContractTask.developmentPeriod || ipfsData?.developmentPeriod || 14,

              // 雇主信息
              employerInfo: ipfsData?.employer || {
                address: normalizedContractTask.creator || '',
                name: '',
                email: '',
                company: '',
                avatar: '',
                bio: '',
                website: '',
                socialLinks: {}
              },

              // 元数据
              createdAt: ipfsData?.createdAt || Date.now(),
              version: ipfsData?.version || '1.0',
              source: 'contract+ipfs'
            }

            contractTasksWithIPFS.push(mergedTask)
            console.log(`✅ 任务 ${contractTask.id} 处理完成:`, mergedTask.title)

          } catch (taskError) {
            console.error(`❌ 处理任务 ${normalizedContractTask.id} 失败:`, taskError)

            // 即使出错也要保留基本的任务信息
            const fallbackTask = {
              id: normalizedContractTask.id,
              title: normalizedContractTask.title || '数据加载失败',
              description: `任务数据处理失败: ${taskError.message}`,
              taskType: 'web',
              requirements: '',
              skillsRequired: [],
              employer: normalizedContractTask.creator, // 使用creator字段
              creator: normalizedContractTask.creator, // 向后兼容：creator字段
              reward: normalizedContractTask.reward,
              deadline: normalizedContractTask.deadline,
              status: normalizedContractTask.status,
              ipfsHash: normalizedContractTask.ipfsHash,
              bidders: Array.isArray(normalizedContractTask.bidders) ? normalizedContractTask.bidders : [],
              participants: Array.isArray(normalizedContractTask.participants) ? normalizedContractTask.participants : [],
              githubRequired: false,
              githubRepo: '',
              chainlinkVerification: false,
              attachments: [],
              biddingPeriod: normalizedContractTask.biddingPeriod || 72,
              developmentPeriod: normalizedContractTask.developmentPeriod || 14,
              employerInfo: {
                address: normalizedContractTask.creator || '',
                name: '',
                email: '',
                company: '',
                avatar: '',
                bio: '',
                website: '',
                socialLinks: {}
              },
              createdAt: Date.now(),
              version: '1.0',
              source: 'contract-only',
              error: taskError.message
            }

            contractTasksWithIPFS.push(fallbackTask)
            console.log(`⚠️ 任务 ${contractTask.id} 使用后备数据`)
          }
        }

        console.log(`✅ 合约任务处理完成，共 ${contractTasksWithIPFS.length} 个任务`)

        // 直接替换任务列表，不合并本地数据
        this.tasks = contractTasksWithIPFS
        console.log(`📋 任务列表已更新，共 ${this.tasks.length} 个任务（仅来自合约）`)

        // 更新统计信息
        this.updateStats()

        return contractTasksWithIPFS

      } catch (error) {
        console.error('❌ 从合约加载任务失败:', error)
        return []
      }
    },

    // 清除本地数据缓存
    clearLocalData() {
      console.log('🧹 清除数据缓存')
      this.tasks = []
      this.disputes = []
      this.userProfiles = {}
      this.initialized = false
      this.updateStats()
    },

    // 更新任务数据
    updateTask(taskId, updates) {
      console.log('📝 更新任务数据:', taskId, updates)

      const taskIndex = this.tasks.findIndex(task => task.id === parseInt(taskId))
      if (taskIndex >= 0) {
        // 合并更新数据
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          ...updates,
          updatedAt: Date.now()
        }
        console.log('✅ 任务数据已更新:', this.tasks[taskIndex].title)
        this.updateStats()
        return this.tasks[taskIndex]
      } else {
        console.warn('⚠️ 未找到要更新的任务:', taskId)
        return null
      }
    },

    // 更新统计数据
    updateStats() {
      this.stats.totalTasks = this.tasks.length
      this.stats.activeTasks = this.tasks.filter(task => task.status === 0 || task.status === 1).length
      this.stats.completedTasks = this.tasks.filter(task => task.status === 4).length

      const totalRewards = this.tasks.reduce((sum, task) => {
        return sum + parseFloat(task.reward || 0)
      }, 0)
      this.stats.totalRewards = totalRewards.toFixed(1)
    },

    // 重置数据
    resetData() {
      this.tasks = []
      this.users = []
      this.arbitrators = []
      this.initialized = false
    },

    // 格式化从合约获取的任务数据
    async formatTaskFromContract(contractTask) {
      console.log(`📄 格式化合约任务数据:`, contractTask.title)

      // 处理IPFS数据
      let ipfsData = null

      if (contractTask.ipfsHash && contractTask.ipfsHash !== '0' && contractTask.ipfsHash !== '') {
        console.log(`🔍 获取任务 ${contractTask.id} 的IPFS数据:`, contractTask.ipfsHash)

        if (useIpfsStore().isValidIPFSHash && useIpfsStore().isValidIPFSHash(contractTask.ipfsHash)) {
          try {
            ipfsData = await useIpfsStore().getTaskData(contractTask.ipfsHash)
            console.log(`✅ 任务 ${contractTask.id} IPFS数据获取成功`)
          } catch (ipfsError) {
            console.warn(`⚠️ 任务 ${contractTask.id} IPFS数据获取失败:`, ipfsError.message)
          }
        }
      }

      // 如果没有IPFS数据，创建基本结构
      if (!ipfsData) {
        ipfsData = {
          title: contractTask.title || '未命名任务',
          description: contractTask.ipfsHash ? '此任务的详细信息无法加载' : '此任务没有详细描述信息',
          taskType: 'web',
          requirements: '',
          skillsRequired: [],
          githubRequired: false,
          githubRepo: '',
          chainlinkVerification: false,
          attachments: [],
          employer: {
            address: contractTask.creator || '',
            name: '',
            email: '',
            company: '',
            avatar: '',
            bio: '',
            website: '',
            socialLinks: {}
          },
          biddingPeriod: contractTask.biddingPeriod || 72,
          developmentPeriod: contractTask.developmentPeriod || 14,
          createdAt: Date.now(),
          version: '1.0'
        }
      }

      // 合并合约数据和IPFS数据
      const mergedTask = {
        // 基本信息优先使用IPFS数据
        title: ipfsData?.title || contractTask.title || '未命名任务',
        description: ipfsData?.description || '暂无描述',
        requirements: ipfsData?.requirements || '',
        taskType: ipfsData?.taskType || 'web',
        skillsRequired: Array.isArray(ipfsData?.skillsRequired) ? ipfsData.skillsRequired : [],

        // 合约数据（权威数据）
        id: contractTask.id,
        employer: contractTask.creator,
        creator: contractTask.creator,
        reward: contractTask.reward,
        deadline: contractTask.deadline,
        status: contractTask.status,
        ipfsHash: contractTask.ipfsHash,

        // 竞标者数据
        bidders: Array.isArray(contractTask.bidders) ? contractTask.bidders : [],
        participants: Array.isArray(contractTask.participants) ? contractTask.participants : [],

        // IPFS扩展数据
        githubRequired: ipfsData?.githubRequired || false,
        githubRepo: ipfsData?.githubRepo || '',
        chainlinkVerification: ipfsData?.chainlinkVerification || false,
        attachments: Array.isArray(ipfsData?.attachments) ? ipfsData.attachments : [],

        // 时间规划数据
        biddingPeriod: contractTask.biddingPeriod || ipfsData?.biddingPeriod || 72,
        developmentPeriod: contractTask.developmentPeriod || ipfsData?.developmentPeriod || 14,

        // 雇主信息
        employerInfo: ipfsData?.employer || {
          address: contractTask.creator || '',
          name: '',
          email: '',
          company: '',
          avatar: '',
          bio: '',
          website: '',
          socialLinks: {}
        },

        // 元数据
        createdAt: ipfsData?.createdAt || Date.now(),
        version: ipfsData?.version || '1.0',
        source: 'contract+ipfs'
      }

      return mergedTask
    }
  }
}) 