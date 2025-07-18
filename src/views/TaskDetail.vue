<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-neutral-600">加载任务详情中...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-neutral-800 mb-2">加载失败</h2>
        <p class="text-neutral-600 mb-4">{{ error }}</p>
        <button @click="loadTask" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          重新加载
        </button>
      </div>
    </div>

    <!-- 任务详情内容 -->
    <div v-else>
      <!-- 任务详情头部 -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-4 mb-4">
                <span :class="getStatusClass(task.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusText(task.status) }}
                </span>
                <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {{ getTypeText(task.taskType) }}
                </span>
              </div>
              <h1 class="text-3xl font-bold mb-4">{{ task.title }}</h1>
              <div class="flex items-center space-x-6 text-primary-100">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                  <span class="text-2xl font-bold">{{ task.reward }} AVAX</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>{{ task.participants }}/{{ task.maxParticipants || '∞' }} 参与者</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ formatDeadline() }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <!-- 竞标按钮 -->
              <button
                v-if="task.status === 1 && canBid"
                @click="showBidModal = true"
                class="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                参与竞标
              </button>
              <!-- 雇主操作按钮 -->
              <div v-if="isCreator" class="flex space-x-2">
                <button
                  v-if="task.status === 0"
                  @click="startBidding"
                  class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  开始竞标
                </button>
                <button
                  v-if="task.status === 1 && task.bidders && task.bidders.length > 0"
                  @click="showSelectWinnerModal = true"
                  class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  选择中标者
                </button>
                <button
                  v-if="task.status === 3"
                  @click="showReviewModal = true"
                  class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  评审成果
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务详细信息 -->
      <div class="task-details-grid">
        <div class="detail-card">
          <h4>创建信息</h4>
          <div class="detail-item">
            <span class="label">创建者:</span>
            <span class="value">{{ formatAddress(task.creator) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatDate(task.createdAt) }}</span>
          </div>
          <div class="detail-item" v-if="task.deadline">
            <span class="label">截止时间:</span>
            <span class="value">{{ formatDate(task.deadline) }}</span>
          </div>
        </div>

        <div class="detail-card">
          <h4>区块链信息</h4>
          <div class="detail-item">
            <span class="label">合约地址:</span>
            <span class="value contract-address">{{ contractAddress }}</span>
          </div>
          <div class="detail-item" v-if="task.txHash">
            <span class="label">交易哈希:</span>
            <a :href="getExplorerUrl(task.txHash)" target="_blank" class="tx-link">
              {{ formatAddress(task.txHash) }}
            </a>
          </div>
          <div class="detail-item" v-if="task.ipfsHash">
            <span class="label">IPFS哈希:</span>
            <span class="value ipfs-hash">{{ task.ipfsHash }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="action-buttons" v-if="availableActions.length > 0">
        <h3>可执行操作</h3>
        <div class="buttons-grid">
          <button
            v-for="action in availableActions"
            :key="action.type"
            @click="executeAction(action)"
            :class="['action-btn', action.type]"
            :disabled="actionLoading"
          >
            <span v-if="actionLoading && currentAction === action.type" class="loading-spinner small"></span>
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- 调试信息 -->
      <div class="debug-section" v-if="showDebug">
        <h3>调试信息</h3>
        <div class="debug-content">
          <pre>{{ JSON.stringify(task, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- 任务不存在 -->
    <div v-else class="not-found">
      <h2>任务不存在</h2>
      <p>请检查任务ID是否正确</p>
      <router-link to="/tasks" class="back-btn">返回任务大厅</router-link>
    </div>

    <!-- 操作确认对话框 -->
    <div v-if="showActionDialog" class="dialog-overlay" @click="closeActionDialog">
      <div class="dialog-content" @click.stop>
        <h3>{{ actionDialog.title }}</h3>
        <p>{{ actionDialog.message }}</p>
        
        <!-- 输入字段 -->
        <div v-if="actionDialog.inputs" class="dialog-inputs">
          <div v-for="input in actionDialog.inputs" :key="input.key" class="input-group">
            <label>{{ input.label }}</label>
            <input
              v-if="input.type === 'text' || input.type === 'number'"
              :type="input.type"
              v-model="actionInputs[input.key]"
              :placeholder="input.placeholder"
              :required="input.required"
            />
            <select v-else-if="input.type === 'select'" v-model="actionInputs[input.key]">
              <option v-for="option in input.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="dialog-buttons">
          <button @click="closeActionDialog" class="cancel-btn">取消</button>
          <button @click="confirmAction" class="confirm-btn" :disabled="!canConfirmAction">
            确认
>>>>>>> ee6116c (chore: push all project files for Move链版本)
          </button>
        </div>
      </div>
    </div>
=
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWeb3Store } from '@/stores/web3'
import { storeToRefs } from 'pinia'
import TaskStatusFlow from '@/components/TaskStatusFlow.vue'
import { TASK_STATUS } from '@/stores/data'

export default {
  name: 'TaskDetail',
  components: {
    TaskStatusFlow
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const web3Store = useWeb3Store()
    const { account: currentUser, isConnected } = storeToRefs(web3Store)

    // 响应式数据
    const task = ref(null)
    const participants = ref([])
    const loading = ref(false)
    const error = ref('')
    const platformFee = ref(0)
    const availableActions = ref([])
    const actionLoading = ref(false)
    const currentAction = ref('')
    const showDebug = ref(false)
    
    // 对话框状态
    const showActionDialog = ref(false)
    const actionDialog = reactive({
      title: '',
      message: '',
      action: null,
      inputs: null
    })
    const actionInputs = reactive({})

    // 计算属性
    const contractAddress = computed(() => web3Store.contractAddress)
    const taskId = computed(() => route.params.id)

    // 方法
    const loadTask = async () => {
      if (!taskId.value) {
        error.value = '无效的任务ID'
        return
      }

      loading.value = true
      error.value = ''

      try {
        console.log('加载任务详情:', taskId.value)
        
        // 从合约获取任务
        const taskData = await web3Store.getTaskById(taskId.value)
        if (!taskData) {
          error.value = '任务不存在'
          return
        }

        task.value = taskData
        console.log('任务详情加载成功:', taskData)

        // 加载参与者
        await loadParticipants()
        
        // 计算平台费用
        if (taskData.reward) {
          platformFee.value = await web3Store.calculatePlatformFee(taskData.reward)
        }

        // 获取可用操作
        await updateAvailableActions()

      } catch (err) {
        console.error('加载任务详情失败:', err)
        error.value = err.message || '加载任务详情失败'
      } finally {
        loading.value = false
      }
    }

    const loadParticipants = async () => {
      if (!task.value) return

      try {
        const participantList = await web3Store.getTaskParticipants(task.value.id)
        participants.value = participantList || []
        console.log('参与者列表:', participants.value)
      } catch (err) {
        console.error('加载参与者失败:', err)
      }
    }

    const updateAvailableActions = async () => {
      if (!task.value || !currentUser.value) {
        availableActions.value = []
        return
      }

      try {
        const actions = await web3Store.getAvailableActions(task.value.id, currentUser.value)
        availableActions.value = actions || []
        console.log('可用操作:', actions)
      } catch (err) {
        console.error('获取可用操作失败:', err)
        availableActions.value = []
      }
    }

    const executeAction = async (action) => {
      if (!action || actionLoading.value) return

      // 检查是否需要输入
      if (action.inputs && action.inputs.length > 0) {
        showActionConfirmDialog(action)
        return
      }

      // 直接执行操作
      await performAction(action)
    }

    const showActionConfirmDialog = (action) => {
      actionDialog.title = action.label
      actionDialog.message = action.description || `确认要执行 ${action.label} 操作吗？`
      actionDialog.action = action
      actionDialog.inputs = action.inputs

      // 清空输入
      Object.keys(actionInputs).forEach(key => {
        delete actionInputs[key]
      })

      // 初始化输入字段
      if (action.inputs) {
        action.inputs.forEach(input => {
          actionInputs[input.key] = input.default || ''
        })
      }

      showActionDialog.value = true
    }

    const closeActionDialog = () => {
      showActionDialog.value = false
      actionDialog.action = null
      actionDialog.inputs = null
    }

    const confirmAction = async () => {
      if (!actionDialog.action) return

      // 验证输入
      if (actionDialog.inputs) {
        for (const input of actionDialog.inputs) {
          if (input.required && !actionInputs[input.key]) {
            alert(`请填写 ${input.label}`)
            return
          }
        }
      }

      closeActionDialog()
      await performAction(actionDialog.action, actionInputs)
    }

    const performAction = async (action, inputs = {}) => {
      actionLoading.value = true
      currentAction.value = action.type

      try {
        console.log('执行操作:', action.type, inputs)
        
        const result = await web3Store.executeTaskAction(task.value.id, action.type, inputs)
        
        if (result.success) {
          // 操作成功，重新加载任务
          await loadTask()
          
          // 显示成功消息
          alert(`${action.label} 操作成功！`)
        } else {
          throw new Error(result.error || '操作失败')
        }

      } catch (err) {
        console.error('执行操作失败:', err)
        alert(`${action.label} 失败: ${err.message}`)
      } finally {
        actionLoading.value = false
        currentAction.value = ''
      }
    }

    const handleActionExecuted = async (actionType) => {
      console.log('操作执行完成:', actionType)
      await loadTask()
    }

    const handleStatusUpdated = async (newStatus) => {
      console.log('任务状态更新:', newStatus)
      if (task.value) {
        task.value.status = newStatus
        await updateAvailableActions()
      }
    }

    // 格式化方法
    const formatAddress = (address) => {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN')
    }

    const formatDescription = (description) => {
      if (!description) return ''
      return description.replace(/\n/g, '<br>')
    }

    const getStatusClass = (status) => {
      const statusMap = {
        [TASK_STATUS.CREATED]: 'status-created',
        [TASK_STATUS.BIDDING]: 'status-bidding',
        [TASK_STATUS.IN_PROGRESS]: 'status-progress',
        [TASK_STATUS.SUBMITTED]: 'status-submitted',
        [TASK_STATUS.COMPLETED]: 'status-completed',
        [TASK_STATUS.CANCELLED]: 'status-cancelled',
        [TASK_STATUS.DISPUTED]: 'status-disputed'
      }
      return statusMap[status] || 'status-unknown'
    }

    const getStatusText = (status) => {
      const statusMap = {
        [TASK_STATUS.CREATED]: '已创建',
        [TASK_STATUS.BIDDING]: '竞标中',
        [TASK_STATUS.IN_PROGRESS]: '进行中',
        [TASK_STATUS.SUBMITTED]: '已提交',
        [TASK_STATUS.COMPLETED]: '已完成',
        [TASK_STATUS.CANCELLED]: '已取消',
        [TASK_STATUS.DISPUTED]: '争议中'
      }
      return statusMap[status] || '未知状态'
    }

    const getExplorerUrl = (txHash) => {
      return `https://testnet.snowtrace.io/tx/${txHash}`
    }

    const canConfirmAction = computed(() => {
      if (!actionDialog.inputs) return true
      
      return actionDialog.inputs.every(input => {
        if (input.required) {
          return actionInputs[input.key] && actionInputs[input.key].toString().trim()
        }
        return true
      })
    })

    // 监听路由变化
    watch(() => route.params.id, (newId) => {
      if (newId) {
        loadTask()
      }
    })

    // 监听用户连接状态
    watch(isConnected, (connected) => {
      if (connected) {
        updateAvailableActions()
      }
    })

    // 生命周期
    onMounted(() => {
      loadTask()
      
      // 开发模式显示调试信息
      showDebug.value = process.env.NODE_ENV === 'development'
    })

    return {
      // 数据
      task,
      participants,
      loading,
      error,
      platformFee,
      availableActions,
      actionLoading,
      currentAction,
      showDebug,
      currentUser,
      contractAddress,
      
      // 对话框
      showActionDialog,
      actionDialog,
      actionInputs,
      canConfirmAction,
      
      // 方法
      loadTask,
      executeAction,
      closeActionDialog,
      confirmAction,
      handleActionExecuted,
      handleStatusUpdated,
      formatAddress,
      formatDate,
      formatDescription,
      getStatusClass,
      getStatusText,
      getExplorerUrl
    }
  }
}
</script>

<style scoped>
.task-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container, .error-container, .not-found {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0 8px 0 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 20px;
  color: #c53030;
}

.retry-btn, .back-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin-top: 10px;
}

.retry-btn:hover, .back-btn:hover {
  background: #0056b3;
}

.task-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.task-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.task-title-section h1 {
  margin: 0 0 15px 0;
  font-size: 2rem;
  font-weight: 600;
}

.task-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.task-meta span {
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.task-status {
  font-weight: 600;
}

.status-created { background-color: #e2e8f0 !important; color: #4a5568 !important; }
.status-bidding { background-color: #fef5e7 !important; color: #d69e2e !important; }
.status-progress { background-color: #e6fffa !important; color: #319795 !important; }
.status-submitted { background-color: #e6f3ff !important; color: #3182ce !important; }
.status-completed { background-color: #f0fff4 !important; color: #38a169 !important; }
.status-cancelled { background-color: #fed7d7 !important; color: #e53e3e !important; }
.status-disputed { background-color: #ffeaa7 !important; color: #d63031 !important; }

.task-reward {
  text-align: right;
}

.reward-amount {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.currency {
  font-size: 1rem;
  opacity: 0.9;
}

.platform-fee {
  opacity: 0.8;
}

.task-description, .task-requirements, .task-status-section, 
.participants-section, .action-buttons {
  padding: 30px;
  border-bottom: 1px solid #e2e8f0;
}

.task-description h3, .task-requirements h3, .task-status-section h3,
.participants-section h3, .action-buttons h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 1.3rem;
}

.description-content {
  line-height: 1.8;
  color: #4a5568;
}

.task-requirements ul {
  list-style: none;
  padding: 0;
}

.task-requirements li {
  padding: 8px 0;
  border-bottom: 1px solid #f7fafc;
  position: relative;
  padding-left: 20px;
}

.task-requirements li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #38a169;
  font-weight: bold;
}

.participants-list {
  display: grid;
  gap: 15px;
}

.participant-card {
  background: #f7fafc;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.participant-card:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.participant-card.winner {
  background: linear-gradient(135deg, #fef5e7, #f6e05e);
  border: 2px solid #d69e2e;
}

.participant-info {
  flex: 1;
}

.participant-address {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.participant-bid, .participant-time {
  font-size: 0.9rem;
  color: #718096;
}

.winner-badge, .bidding-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.winner-badge {
  background: #38a169;
  color: white;
}

.bidding-badge {
  background: #3182ce;
  color: white;
}

.task-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 30px;
}

.detail-card {
  background: #f7fafc;
  border-radius: 8px;
  padding: 20px;
}

.detail-card h4 {
  margin: 0 0 15px 0;
  color: #2d3748;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #4a5568;
}

.value {
  color: #2d3748;
  word-break: break-all;
}

.contract-address, .ipfs-hash {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.tx-link {
  color: #3182ce;
  text-decoration: none;
}

.tx-link:hover {
  text-decoration: underline;
}

.buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.participate {
  background: #3182ce;
  color: white;
}

.action-btn.start-bidding {
  background: #d69e2e;
  color: white;
}

.action-btn.select-winner {
  background: #38a169;
  color: white;
}

.action-btn.submit-work {
  background: #805ad5;
  color: white;
}

.action-btn.confirm {
  background: #38a169;
  color: white;
}

.action-btn.dispute {
  background: #e53e3e;
  color: white;
}

.action-btn.cancel {
  background: #718096;
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.debug-section {
  padding: 30px;
  background: #1a202c;
  color: #e2e8f0;
}

.debug-content pre {
  background: #2d3748;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.9rem;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-content h3 {
  margin: 0 0 15px 0;
  color: #2d3748;
}

.dialog-inputs {
  margin: 20px 0;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #4a5568;
}

.input-group input, .input-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
}

.input-group input:focus, .input-group select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49,130,206,0.1);
}

.dialog-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn, .confirm-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.confirm-btn {
  background: #3182ce;
  color: white;
}

.confirm-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

.confirm-btn:hover:not(:disabled) {
  background: #2c5282;
}

@media (max-width: 768px) {
  .task-detail {
    padding: 10px;
  }
  
  .task-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .task-meta {
    justify-content: flex-start;
  }
  
  .task-reward {
    text-align: left;
  }
  
  .task-details-grid {
    grid-template-columns: 1fr;
  }
  
  .buttons-grid {
    grid-template-columns: 1fr;
  }
  
  .participant-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 
>>>>>>> ee6116c (chore: push all project files for Move链版本)
