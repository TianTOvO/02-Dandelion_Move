<template>
  <div class="task-status-flow">
    <!-- 任务状态进度条 -->
    <div class="status-progress mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">任务进度</h3>
        <div class="text-sm text-gray-600">
          {{ progress.step }}/{{ progress.total }} - {{ progress.label }}
        </div>
      </div>
      
      <div class="relative">
        <!-- 进度条背景 -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-500"
            :style="{ width: progress.percentage + '%' }"
          ></div>
        </div>
        
        <!-- 状态节点 -->
        <div class="flex justify-between mt-3">
          <div 
            v-for="(step, index) in statusSteps" 
            :key="index"
            class="flex flex-col items-center"
          >
            <div 
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                getStepClass(index, progress.step - 1)
              ]"
            >
              {{ index + 1 }}
            </div>
            <div class="text-xs text-gray-600 mt-1 text-center max-w-16">
              {{ step.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前状态信息 -->
    <div class="status-info bg-gray-50 rounded-lg p-4 mb-6">
      <div class="flex items-center mb-3">
        <div 
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            web3Store.contractService?.getStatusClass(task.status) || 'bg-gray-100 text-gray-800'
          ]"
        >
          {{ task.statusText }}
        </div>
        <div v-if="task.isExpired" class="ml-2 text-red-600 text-xs">
          ⏰ 已过期
        </div>
        <div v-if="task.isInDisputePeriod" class="ml-2 text-orange-600 text-xs">
          ⚖️ 争议期
        </div>
      </div>
      
      <div class="text-sm text-gray-600 space-y-1">
        <div v-if="task.deadline">
          <span class="font-medium">截止时间：</span>
          {{ formatDate(task.deadlineDate) }}
        </div>
        <div v-if="task.disputeDeadlineDate">
          <span class="font-medium">争议期限：</span>
          {{ formatDate(task.disputeDeadlineDate) }}
        </div>
        <div v-if="task.winner && task.winner !== '0x0000000000000000000000000000000000000000'">
          <span class="font-medium">中标者：</span>
          {{ formatAddress(task.winner) }}
        </div>
        <div v-if="task.participants && task.participants.length > 0">
          <span class="font-medium">参与者：</span>
          {{ task.participants.length }} 人
        </div>
      </div>
    </div>

    <!-- 可执行操作 -->
    <div v-if="availableActions.length > 0" class="available-actions">
      <h4 class="text-md font-semibold text-gray-800 mb-4">可执行操作</h4>
      <div class="space-y-3">
        <button
          v-for="action in availableActions"
          :key="action.type"
          @click="handleAction(action.type)"
          :disabled="loading || web3Store.loading"
          :class="[
            'w-full px-4 py-2 rounded-lg font-medium transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            getActionButtonClass(action.style)
          ]"
        >
          <span v-if="loading && currentAction === action.type" class="mr-2">
            <svg class="animate-spin h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- 操作历史 -->
    <div v-if="showHistory && taskHistory.length > 0" class="task-history mt-6">
      <h4 class="text-md font-semibold text-gray-800 mb-4">操作历史</h4>
      <div class="space-y-2">
        <div 
          v-for="(history, index) in taskHistory"
          :key="index"
          class="bg-white border rounded-lg p-3"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-medium text-sm">{{ history.action }}</div>
              <div class="text-xs text-gray-600">{{ formatDate(history.timestamp) }}</div>
            </div>
            <a 
              v-if="history.txHash"
              :href="getExplorerUrl(history.txHash)"
              target="_blank"
              class="text-blue-600 text-xs hover:underline"
            >
              查看交易 ↗
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作确认对话框 -->
    <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ dialogTitle }}</h3>
        <p class="text-gray-600 mb-6">{{ confirmMessage }}</p>
        
        <!-- 特殊输入字段 -->
        <div v-if="actionInputs.length > 0" class="space-y-4 mb-6">
          <div v-for="input in actionInputs" :key="input.key">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ input.label }}
            </label>
            <input
              v-if="input.type === 'text'"
              v-model="actionData[input.key]"
              type="text"
              :placeholder="input.placeholder"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              v-else-if="input.type === 'select'"
              v-model="actionData[input.key]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="option in input.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <textarea
              v-else-if="input.type === 'textarea'"
              v-model="actionData[input.key]"
              :placeholder="input.placeholder"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <!-- 文件上传组件 -->
            <div v-else-if="input.type === 'file'" class="space-y-3">
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  @change="handleFileUpload"
                  class="hidden"
                  accept=".js,.jsx,.ts,.tsx,.vue,.py,.java,.cpp,.c,.go,.rs,.sol,.md,.txt,.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif,.svg,.webp,.mp4,.avi,.mov,.wmv,.webm,.zip,.rar,.7z,.tar,.gz"
                />
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="text-gray-600">
                  <button
                    type="button"
                    @click="$refs.fileInput.click()"
                    class="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    点击上传文件
                  </button>
                  或拖拽文件到此处
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  支持代码文件、文档、图片、视频等多种格式
                </p>
              </div>
              
              <!-- 已选择的文件列表 -->
              <div v-if="selectedFiles.length > 0" class="space-y-2">
                <h4 class="text-sm font-medium text-gray-700">已选择的文件：</h4>
                <div class="max-h-40 overflow-y-auto space-y-2">
                  <div
                    v-for="(file, index) in selectedFiles"
                    :key="index"
                    class="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                      </div>
                    </div>
                    <button
                      @click="removeFile(index)"
                      class="text-red-500 hover:text-red-700"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 上传进度 -->
              <div v-if="uploadProgress > 0" class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">上传进度</span>
                  <span class="text-gray-600">{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500">{{ uploadStatus }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- NFT化选项（仅在项目提交完成后显示） -->
        <div v-if="currentAction === 'requestVerification' && selectedFiles.length > 0" class="mb-6">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-purple-800 mb-1">🎨 NFT化您的作品</h4>
                <p class="text-sm text-purple-600">将您的项目成果转化为NFT，确保创作权益和收藏价值</p>
              </div>
              <div class="flex-shrink-0">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="actionData.createNFT"
                    class="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span class="ml-2 text-sm text-purple-700">创建NFT</span>
                </label>
              </div>
            </div>
            
            <div v-if="actionData.createNFT" class="mt-3 pt-3 border-t border-purple-200">
              <div class="text-xs text-purple-600 space-y-1">
                <div>✨ 自动生成项目元数据和属性</div>
                <div>🔒 链上确认创作者所有权</div>
                <div>💎 基于项目复杂度计算稀有度</div>
                <div>🌐 永久存储在IPFS网络</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button
            @click="cancelAction"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmAction"
            :disabled="!canConfirm || isUploading"
            :class="[
              'flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50',
              actionData.createNFT 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            ]"
          >
            {{ isUploading ? '上传中...' : actionData.createNFT ? '🎨 提交并创建NFT' : '确认提交' }}
          </button>
        </div>
      </div>
    </div>

    <!-- NFT创建模态框 -->
    <NFTCreationModal
      v-if="showNFTModal && lastSubmissionData"
      :show="showNFTModal"
      :task-id="props.task.id"
      :submission-data="lastSubmissionData"
      :project-files="lastUploadedFiles"
      @close="showNFTModal = false"
      @nft-created="handleNFTCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWeb3Store } from '@/stores/web3.js'
import { useIpfsStore } from '@/stores/ipfs.js'
import { useRouter } from 'vue-router'
import NFTCreationModal from './NFTCreationModal.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  showHistory: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['actionCompleted', 'taskUpdated', 'nft-created'])

const web3Store = useWeb3Store()
const ipfsStore = useIpfsStore()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const currentAction = ref('')
const showConfirmDialog = ref(false)
const confirmMessage = ref('')
const dialogTitle = ref('')
const actionInputs = ref([])
const actionData = ref({})

// 文件上传相关
const selectedFiles = ref([])
const uploadProgress = ref(0)
const uploadStatus = ref('')
const isUploading = ref(false)

// NFT相关
const showNFTModal = ref(false)
const lastSubmissionData = ref(null)
const lastUploadedFiles = ref([])

// 状态步骤定义
const statusSteps = computed(() => {
  return [
    { label: '创建' },
    { label: '竞标' },
    { label: '开发' },
    { label: '审核' },
    { label: '完成' }
  ]
})

// 计算属性
const progress = computed(() => {
  const status = props.task?.status || 0
  const steps = statusSteps.value.length
  
  let step = Math.min(status + 1, steps)
  let label = statusSteps.value[Math.min(status, steps - 1)]?.label || '未知'
  
  // 特殊状态处理
  if (props.task?.isExpired) {
    label = '已过期'
  } else if (props.task?.isInDisputePeriod) {
    label = '争议中'
  }
  
  return {
    step,
    total: steps,
    percentage: (step / steps) * 100,
    label
  }
})

const availableActions = computed(() => {
  if (!web3Store.contractService || !props.task) return []
  return web3Store.contractService.getAvailableActions(props.task, web3Store.account)
})

const taskHistory = computed(() => {
  // 这里可以从props.task或其他地方获取任务历史
  return props.task?.history || []
})

const canConfirm = computed(() => {
  // 检查必填字段是否已填写
  const requiredInputs = actionInputs.value.filter(input => input.required)
  return requiredInputs.every(input => {
    const value = actionData.value[input.key]
    return value && value.toString().trim() !== ''
  })
})

// 方法
const getStepClass = (stepIndex, currentStep) => {
  if (stepIndex < currentStep) {
    return 'bg-green-500 text-white'
  } else if (stepIndex === currentStep) {
    return 'bg-blue-500 text-white'
  } else {
    return 'bg-gray-300 text-gray-600'
  }
}

const getActionButtonClass = (style) => {
  const classes = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700'
  }
  return classes[style] || classes.primary
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const formatAddress = (address) => {
  if (!address || address === '0x0000000000000000000000000000000000000000') return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getExplorerUrl = (txHash) => {
  // 根据网络返回区块链浏览器URL
  return `https://testnet.snowtrace.io/tx/${txHash}`
}

const handleAction = async (actionType) => {
  currentAction.value = actionType
  
  // 设置确认对话框
  setupActionDialog(actionType)
  
  if (actionInputs.value.length === 0) {
    // 无需输入，直接执行
    await executeAction(actionType)
  } else {
    // 需要输入，显示对话框
    showConfirmDialog.value = true
  }
}

// 文件上传处理
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 设置确认对话框
const setupActionDialog = (actionType) => {
  actionData.value = {}
  actionInputs.value = []
  selectedFiles.value = []
  uploadProgress.value = 0
  uploadStatus.value = ''
  isUploading.value = false
  
  switch (actionType) {
    case 'startBidding':
      dialogTitle.value = '开始竞标'
      confirmMessage.value = '确认开始竞标？开始后其他用户可以参与竞标。'
      break
      
    case 'participateInTask':
      dialogTitle.value = '参与任务竞标'
      confirmMessage.value = '确认参与此任务竞标？'
      actionInputs.value = [
        {
          key: 'demoUrl',
          label: '演示URL或计划书',
          type: 'textarea',
          placeholder: '请输入您的作品演示链接或项目计划书...',
          required: true
        }
      ]
      break
      
    case 'selectWinner':
      dialogTitle.value = '选择中标者'
      confirmMessage.value = '请选择中标者：'
      actionInputs.value = [
        {
          key: 'winnerAddress',
          label: '中标者',
          type: 'select',
          options: props.task.participants?.map(addr => ({
            value: addr,
            label: formatAddress(addr)
          })) || [],
          required: true
        }
      ]
      break
      
    case 'requestVerification':
      dialogTitle.value = '提交项目成果'
      confirmMessage.value = '请上传您的项目成果文件和相关信息：'
      actionInputs.value = [
        {
          key: 'submissionTitle',
          label: '提交标题',
          type: 'text',
          placeholder: '例如：Web3任务管理平台开发完成',
          required: true
        },
        {
          key: 'description',
          label: '项目描述',
          type: 'textarea',
          placeholder: '请详细描述您完成的工作内容、实现的功能和技术要点...',
          required: true
        },
        {
          key: 'demoUrl',
          label: '演示链接',
          type: 'text',
          placeholder: '项目演示地址（可选）',
          required: false
        },
        {
          key: 'repositoryUrl',
          label: '代码仓库',
          type: 'text',
          placeholder: 'GitHub/GitLab仓库地址（可选）',
          required: false
        },
        {
          key: 'technologies',
          label: '使用技术',
          type: 'text',
          placeholder: '例如：Vue.js, Node.js, Solidity, IPFS',
          required: false
        },
        {
          key: 'features',
          label: '主要功能',
          type: 'textarea',
          placeholder: '请列出项目的主要功能特性...',
          required: false
        },
        {
          key: 'instructions',
          label: '使用说明',
          type: 'textarea',
          placeholder: '如何安装、运行和使用您的项目...',
          required: false
        },
        {
          key: 'files',
          label: '项目文件',
          type: 'file',
          placeholder: '上传项目相关文件',
          required: false
        }
      ]
      break
      
    case 'confirmTask':
      dialogTitle.value = '确认任务完成'
      confirmMessage.value = '确认任务已完成？确认后将释放奖励给中标者。'
      break
      
    case 'rejectTask':
      dialogTitle.value = '拒绝任务成果'
      confirmMessage.value = '拒绝任务完成？拒绝后可能会进入争议流程。'
      break
      
    case 'disputeTask':
      dialogTitle.value = '发起争议'
      confirmMessage.value = '确认发起争议？争议将由DAO成员投票决定。'
      break
      
    case 'settleTask':
      dialogTitle.value = '结算任务'
      confirmMessage.value = '确认结算任务？结算后任务将最终完成。'
      break
      
    case 'cancelTask':
      dialogTitle.value = '取消任务'
      confirmMessage.value = '确认取消任务？取消后奖励将退还给您。'
      break
      
    default:
      dialogTitle.value = '确认操作'
      confirmMessage.value = '确认执行此操作？'
  }
}

const executeAction = async (actionType) => {
  try {
    loading.value = true
    let result
    
    switch (actionType) {
      case 'startBidding':
        result = await web3Store.startBidding(props.task.id)
        break
        
      case 'participateInTask':
        result = await web3Store.participateInTask(
          props.task.id,
          actionData.value.demoUrl
        )
        break
        
      case 'selectWinner':
        result = await web3Store.selectWinner(
          props.task.id,
          actionData.value.winnerAddress
        )
        break
        
      case 'requestVerification':
        // 上传项目成果到IPFS
        isUploading.value = true
        uploadStatus.value = '准备上传文件到IPFS...'
        
        let submissionHash
        try {
          // 1. 先上传项目文件
          let uploadedFiles = []
          if (selectedFiles.value.length > 0) {
            uploadStatus.value = '上传项目文件到IPFS...'
            uploadProgress.value = 10
            
            uploadedFiles = await ipfsStore.uploadProjectFiles(selectedFiles.value)
            
            uploadProgress.value = 60
            uploadStatus.value = '文件上传完成，正在创建项目数据...'
          }
          
          // 2. 构建项目提交数据
          const submissionData = {
            taskId: props.task.id,
            submitterAddress: web3Store.account,
            submissionTitle: actionData.value.submissionTitle,
            description: actionData.value.description,
            demoUrl: actionData.value.demoUrl,
            repositoryUrl: actionData.value.repositoryUrl,
            technologies: actionData.value.technologies ? actionData.value.technologies.split(',').map(t => t.trim()) : [],
            features: actionData.value.features ? actionData.value.features.split('\n').filter(f => f.trim()) : [],
            instructions: actionData.value.instructions,
            files: uploadedFiles
          }
          
          uploadProgress.value = 80
          uploadStatus.value = '上传项目数据到IPFS...'
          
          // 3. 上传完整的项目提交数据到IPFS
          submissionHash = await ipfsStore.uploadProjectSubmission(submissionData)
          
          uploadProgress.value = 90
          uploadStatus.value = '准备上链...'
          
          console.log('项目提交数据上传完成，IPFS哈希:', submissionHash)
          
        } catch (uploadError) {
          console.error('IPFS上传失败:', uploadError)
          throw new Error('文件上传失败：' + uploadError.message)
        }
        
        // 4. 调用智能合约，将IPFS hash作为URL参数
        uploadStatus.value = '提交到区块链...'
        result = await web3Store.requestTaskVerification(
          props.task.id,
          `ipfs://${submissionHash}`
        )
        
        uploadProgress.value = 100
        uploadStatus.value = '提交完成！'
        
        console.log('项目成果提交成功！IPFS Hash:', submissionHash)
        
        break
        
      case 'confirmTask':
        result = await web3Store.employerConfirmTask(props.task.id, true)
        break
        
      case 'rejectTask':
        result = await web3Store.employerConfirmTask(props.task.id, false)
        break
        
      case 'disputeTask':
        result = await web3Store.disputeTask(props.task.id)
        break
        
      case 'settleTask':
        result = await web3Store.settleTask(props.task.id)
        break
        
      case 'cancelTask':
        result = await web3Store.cancelTask(props.task.id)
        break
        
      default:
        throw new Error('未知操作类型')
    }
    
    // 通知父组件
    emit('actionCompleted', { action: actionType, result })
    emit('taskUpdated')
    
    // 显示成功消息
    console.log(`✅ ${actionType} 执行成功:`, result)
    
  } catch (error) {
    console.error(`❌ ${actionType} 执行失败:`, error)
    // 这里可以添加错误提示
    alert(`操作失败：${error.message}`)
  } finally {
    loading.value = false
    isUploading.value = false
    currentAction.value = ''
    showConfirmDialog.value = false
    uploadProgress.value = 0
    uploadStatus.value = ''
  }
}

const confirmAction = async () => {
  const shouldCreateNFT = actionData.value.createNFT && currentAction.value === 'requestVerification'
  
  // 执行原有的操作
  await executeAction(currentAction.value)
  
  // 如果选择了创建NFT且是项目提交操作，则在操作完成后显示NFT创建模态框
  if (shouldCreateNFT && selectedFiles.value.length > 0) {
    // 保存提交数据供NFT创建使用
    lastSubmissionData.value = {
      taskId: props.task.id,
      submitterAddress: web3Store.account,
      submissionTitle: actionData.value.submissionTitle,
      description: actionData.value.description,
      demoUrl: actionData.value.demoUrl,
      repositoryUrl: actionData.value.repositoryUrl,
      technologies: actionData.value.technologies ? actionData.value.technologies.split(',').map(t => t.trim()) : [],
      features: actionData.value.features ? actionData.value.features.split('\n').filter(f => f.trim()) : [],
      instructions: actionData.value.instructions,
      submittedAt: Date.now(),
      taskType: props.task.taskType || 'development'
    }
    
    // 保存上传的文件信息
    lastUploadedFiles.value = [...selectedFiles.value].map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      category: ipfsStore.categorizeFile(file.name, file.type),
      uploadedAt: Date.now()
    }))
    
    // 延迟显示NFT模态框，确保主操作完成
    setTimeout(() => {
      showNFTModal.value = true
    }, 1000)
  }
}

const handleNFTCreated = (nftData) => {
  console.log('NFT创建成功:', nftData)
  emit('nft-created', {
    taskId: props.task.id,
    nftData: nftData,
    submissionData: lastSubmissionData.value
  })
  
  // 显示成功提示
  alert(`🎉 NFT创建成功！\nToken ID: ${nftData.tokenId}\nIPFS Hash: ${nftData.ipfsHash}`)
}

const cancelAction = () => {
  showConfirmDialog.value = false
  currentAction.value = ''
  actionData.value = {}
  actionInputs.value = []
  selectedFiles.value = []
  uploadProgress.value = 0
  uploadStatus.value = ''
  isUploading.value = false
}

// 监听任务变化
watch(() => props.task, () => {
  // 任务更新时可以执行一些操作
}, { deep: true })

onMounted(() => {
  // 组件挂载时的初始化操作
})
</script>

<style scoped>
.task-status-flow {
  @apply bg-white rounded-lg border p-6;
}

.status-progress {
  @apply relative;
}

.available-actions button {
  @apply transition-all duration-200;
}

.available-actions button:hover:not(:disabled) {
  @apply transform scale-105 shadow-md;
}

.task-history {
  @apply border-t pt-6;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .task-status-flow {
    @apply p-4;
  }
  
  .status-progress .flex {
    @apply flex-wrap gap-2;
  }
  
  .available-actions button {
    @apply text-sm py-3;
  }
}
</style> 