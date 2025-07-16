<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- 标题 -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-gray-800">🎨 NFT化交付</h3>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 进度指示器 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">NFT创建进度</span>
          <span class="text-sm text-gray-600">{{ currentStep }}/{{ totalSteps }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <div class="flex justify-between mt-2">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex flex-col items-center"
          >
            <div 
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                index < currentStep ? 'bg-green-500 text-white' : 
                index === currentStep - 1 ? 'bg-purple-500 text-white' : 
                'bg-gray-300 text-gray-600'
              ]"
            >
              <svg v-if="index < currentStep" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="text-xs text-gray-600 mt-1 text-center max-w-16">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- 当前状态显示 -->
      <div v-if="isProcessing" class="mb-6">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <div class="flex items-center space-x-4">
            <!-- 加载动画 -->
            <div class="relative">
              <div class="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin">
                <div class="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-purple-800">{{ currentStepTitle }}</h4>
              <p class="text-purple-600">{{ currentStepDescription }}</p>
            </div>
          </div>
          
          <!-- 详细进度 -->
          <div v-if="detailedProgress" class="mt-4">
            <div class="text-sm text-purple-700 mb-2">{{ detailedProgress }}</div>
            <div class="w-full bg-purple-200 rounded-full h-1">
              <div 
                class="bg-purple-500 h-1 rounded-full transition-all duration-300"
                :style="{ width: subProgressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- NFT预览 -->
      <div v-if="!isProcessing && nftData" class="mb-6">
        <h4 class="text-lg font-semibold text-gray-800 mb-4">🖼️ NFT预览</h4>
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-dashed border-purple-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- NFT图像区域 -->
            <div class="space-y-4">
              <div class="aspect-square bg-white rounded-lg border-2 border-purple-200 flex items-center justify-center">
                <div v-if="nftData.image" class="w-full h-full">
                  <img :src="nftData.image" :alt="nftData.name" class="w-full h-full object-cover rounded-lg"/>
                </div>
                <div v-else class="text-center text-gray-500">
                  <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p>NFT封面图</p>
                </div>
              </div>
              
              <!-- 稀有度指示器 -->
              <div class="flex items-center justify-center space-x-2">
                <div class="flex space-x-1">
                  <div v-for="i in 5" :key="i" 
                       :class="[
                         'w-3 h-3 rounded-full',
                         i <= nftData.rarity ? 'bg-yellow-400' : 'bg-gray-300'
                       ]">
                  </div>
                </div>
                <span class="text-sm text-gray-600">稀有度: {{ getRarityText(nftData.rarity) }}</span>
              </div>
            </div>

            <!-- NFT信息 -->
            <div class="space-y-4">
              <div>
                <h5 class="font-semibold text-purple-800 mb-2">{{ nftData.name }}</h5>
                <p class="text-gray-600 text-sm">{{ nftData.description }}</p>
              </div>

              <!-- 属性列表 -->
              <div>
                <h6 class="font-medium text-gray-800 mb-2">🏷️ 属性</h6>
                <div class="grid grid-cols-1 gap-2">
                  <div v-for="attr in nftData.attributes" :key="attr.trait_type" 
                       class="flex justify-between items-center bg-white rounded-lg p-2 border">
                    <span class="text-sm font-medium text-gray-700">{{ attr.trait_type }}</span>
                    <span class="text-sm text-purple-600">{{ attr.value }}</span>
                  </div>
                </div>
              </div>

              <!-- 版权信息 -->
              <div class="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <h6 class="font-medium text-yellow-800 mb-1">📜 版权声明</h6>
                <p class="text-xs text-yellow-700">
                  此NFT代表任务ID {{ taskId }} 的完成成果，创作者拥有完整版权。
                  创建时间：{{ formatDate(nftData.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex space-x-4">
        <button
          @click="closeModal"
          :disabled="isProcessing"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isProcessing ? '处理中...' : '取消' }}
        </button>
        <button
          v-if="!nftData && !isProcessing"
          @click="startNFTCreation"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold"
        >
          🚀 开始创建NFT
        </button>
        <button
          v-if="nftData && !isProcessing"
          @click="mintNFT"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 font-semibold"
        >
          ⛏️ 铸造NFT
        </button>
      </div>

      <!-- 成功状态 -->
      <div v-if="nftMinted" class="mt-6 bg-green-50 rounded-lg p-6 border border-green-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div>
            <h4 class="text-lg font-semibold text-green-800">🎉 NFT创建成功！</h4>
            <p class="text-green-600">您的作品已成功转化为NFT，所有权已上链确认</p>
          </div>
        </div>
        
        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-green-700">NFT Token ID:</span>
            <span class="font-mono text-green-800">{{ nftTokenId }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-green-700">IPFS Hash:</span>
            <span class="font-mono text-green-800">{{ nftIpfsHash }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-green-700">交易哈希:</span>
            <a :href="getExplorerUrl(nftTxHash)" target="_blank" 
               class="font-mono text-blue-600 hover:text-blue-800 underline">
              {{ formatTxHash(nftTxHash) }} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useIpfsStore } from '@/stores/ipfs.js'
import { useWeb3Store } from '@/stores/web3.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  taskId: {
    type: [String, Number],
    required: true
  },
  submissionData: {
    type: Object,
    required: true
  },
  projectFiles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'nft-created'])

const ipfsStore = useIpfsStore()
const web3Store = useWeb3Store()

// 状态管理
const isProcessing = ref(false)
const currentStep = ref(1)
const totalSteps = ref(6)
const currentStepTitle = ref('')
const currentStepDescription = ref('')
const detailedProgress = ref('')
const subProgressPercentage = ref(0)

// NFT数据
const nftData = ref(null)
const nftMinted = ref(false)
const nftTokenId = ref('')
const nftIpfsHash = ref('')
const nftTxHash = ref('')

// 步骤定义
const steps = ref([
  { label: '准备' },
  { label: '文件处理' },
  { label: '元数据' },
  { label: '上传IPFS' },
  { label: '生成NFT' },
  { label: '铸造' }
])

// 计算属性
const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps.value) * 100
})

// 方法
const closeModal = () => {
  if (!isProcessing.value) {
    resetState()
    emit('close')
  }
}

const resetState = () => {
  isProcessing.value = false
  currentStep.value = 1
  nftData.value = null
  nftMinted.value = false
  nftTokenId.value = ''
  nftIpfsHash.value = ''
  nftTxHash.value = ''
  detailedProgress.value = ''
  subProgressPercentage.value = 0
}

const startNFTCreation = async () => {
  try {
    isProcessing.value = true
    currentStep.value = 1
    
    await createNFTMetadata()
    
  } catch (error) {
    console.error('NFT创建失败:', error)
    alert('NFT创建失败: ' + error.message)
    isProcessing.value = false
  }
}

const createNFTMetadata = async () => {
  // 步骤1: 准备阶段
  currentStep.value = 1
  currentStepTitle.value = '🔄 准备创建NFT'
  currentStepDescription.value = '正在分析项目文件和提交数据...'
  subProgressPercentage.value = 20
  
  await sleep(1000)
  
  // 步骤2: 文件处理
  currentStep.value = 2
  currentStepTitle.value = '📁 处理项目文件'
  currentStepDescription.value = '正在分析和分类项目文件...'
  
  detailedProgress.value = '分析文件类型和内容...'
  subProgressPercentage.value = 30
  await sleep(800)
  
  detailedProgress.value = '生成文件摘要...'
  subProgressPercentage.value = 60
  await sleep(800)
  
  detailedProgress.value = '创建项目快照...'
  subProgressPercentage.value = 90
  await sleep(500)
  
  // 步骤3: 构建元数据
  currentStep.value = 3
  currentStepTitle.value = '📋 构建NFT元数据'
  currentStepDescription.value = '正在创建NFT的属性和描述信息...'
  
  const metadata = await buildNFTMetadata()
  subProgressPercentage.value = 100
  await sleep(500)
  
  // 步骤4: 上传到IPFS
  currentStep.value = 4
  currentStepTitle.value = '🌐 上传到IPFS'
  currentStepDescription.value = '正在将NFT数据上传到分布式存储网络...'
  
  detailedProgress.value = '上传NFT元数据到IPFS...'
  subProgressPercentage.value = 20
  await sleep(1000)
  
  const ipfsHash = await ipfsStore.uploadJSON(metadata)
  
  detailedProgress.value = '验证IPFS存储...'
  subProgressPercentage.value = 80
  await sleep(500)
  
  nftIpfsHash.value = ipfsHash
  
  // 步骤5: 生成NFT
  currentStep.value = 5
  currentStepTitle.value = '🎨 生成NFT'
  currentStepDescription.value = '正在创建最终的NFT数据结构...'
  
  nftData.value = {
    ...metadata,
    ipfsHash: ipfsHash,
    tokenURI: `ipfs://${ipfsHash}`
  }
  
  subProgressPercentage.value = 100
  await sleep(1000)
  
  // 完成
  currentStep.value = 6
  isProcessing.value = false
  
  console.log('NFT元数据创建完成:', nftData.value)
}

const buildNFTMetadata = async () => {
  const submission = props.submissionData
  const files = props.projectFiles
  
  // 分析文件类型统计
  const fileStats = analyzeFiles(files)
  
  // 计算项目复杂度和稀有度
  const complexity = calculateComplexity(submission, files)
  const rarity = calculateRarity(complexity, fileStats)
  
  // 生成NFT图像（这里使用占位符，实际可以生成缩略图）
  const nftImage = generateNFTImage(submission, fileStats)
  
  return {
    name: `${submission.submissionTitle} - 任务完成证明`,
    description: `这是任务ID ${props.taskId} 的完成成果NFT。${submission.description.substring(0, 100)}...`,
    image: nftImage,
    external_url: submission.demoUrl || '',
    
    attributes: [
      {
        trait_type: "任务类型",
        value: getTaskTypeText(submission.taskType || 'development')
      },
      {
        trait_type: "完成时间",
        value: formatDate(submission.submittedAt || Date.now())
      },
      {
        trait_type: "文件数量",
        value: files.length
      },
      {
        trait_type: "代码文件",
        value: fileStats.codeFiles
      },
      {
        trait_type: "文档文件",
        value: fileStats.docFiles
      },
      {
        trait_type: "项目复杂度",
        value: getComplexityText(complexity)
      },
      {
        trait_type: "技术栈",
        value: submission.technologies ? submission.technologies.join(', ') : '未指定'
      },
      {
        trait_type: "创作者",
        value: submission.submitterAddress
      }
    ],
    
    // 扩展属性
    properties: {
      taskId: props.taskId,
      submitter: submission.submitterAddress,
      submittedAt: submission.submittedAt,
      files: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        hash: f.hash
      })),
      technologies: submission.technologies || [],
      features: submission.features || [],
      repositoryUrl: submission.repositoryUrl,
      demoUrl: submission.demoUrl
    },
    
    // 版权和所有权信息
    rights: {
      creator: submission.submitterAddress,
      copyright: `© ${new Date().getFullYear()} ${submission.submitterAddress}`,
      license: "All rights reserved",
      platform: "Dandelion Web3 Platform"
    },
    
    // 稀有度和等级
    rarity: rarity,
    level: Math.floor(complexity / 20) + 1,
    
    // 时间戳
    timestamp: Date.now(),
    version: "1.0"
  }
}

const analyzeFiles = (files) => {
  const stats = {
    total: files.length,
    codeFiles: 0,
    docFiles: 0,
    imageFiles: 0,
    otherFiles: 0,
    totalSize: 0
  }
  
  files.forEach(file => {
    stats.totalSize += file.size || 0
    
    switch (file.category) {
      case 'code':
        stats.codeFiles++
        break
      case 'documentation':
        stats.docFiles++
        break
      case 'image':
        stats.imageFiles++
        break
      default:
        stats.otherFiles++
    }
  })
  
  return stats
}

const calculateComplexity = (submission, files) => {
  let complexity = 0
  
  // 基于文件数量
  complexity += Math.min(files.length * 5, 50)
  
  // 基于代码文件数量
  const codeFiles = files.filter(f => f.category === 'code').length
  complexity += codeFiles * 10
  
  // 基于技术栈数量
  if (submission.technologies) {
    complexity += submission.technologies.length * 8
  }
  
  // 基于功能特性数量
  if (submission.features) {
    complexity += submission.features.length * 5
  }
  
  // 基于描述长度
  complexity += Math.min(submission.description.length / 50, 20)
  
  return Math.min(complexity, 100)
}

const calculateRarity = (complexity, fileStats) => {
  if (complexity >= 80) return 5  // 传奇
  if (complexity >= 60) return 4  // 史诗
  if (complexity >= 40) return 3  // 稀有
  if (complexity >= 20) return 2  // 普通
  return 1  // 常见
}

const generateNFTImage = (submission, fileStats) => {
  // 这里可以实现实际的图像生成逻辑
  // 现在返回一个基于项目数据的占位符图像
  const colors = ['purple', 'blue', 'green', 'orange', 'red']
  const color = colors[fileStats.codeFiles % colors.length]
  
  return `https://via.placeholder.com/400x400/${color}/white?text=NFT+${props.taskId}`
}

const mintNFT = async () => {
  try {
    isProcessing.value = true
    currentStep.value = 6
    currentStepTitle.value = '⛏️ 铸造NFT'
    currentStepDescription.value = '正在将NFT写入区块链...'
    
    detailedProgress.value = '准备智能合约交易...'
    subProgressPercentage.value = 20
    await sleep(1000)
    
    detailedProgress.value = '调用NFT合约...'
    subProgressPercentage.value = 50
    await sleep(1500)
    
    // 模拟铸造NFT（实际需要调用智能合约）
    const tokenId = Math.floor(Math.random() * 1000000)
    const txHash = '0x' + Math.random().toString(16).substr(2, 64)
    
    detailedProgress.value = '确认交易...'
    subProgressPercentage.value = 80
    await sleep(2000)
    
    detailedProgress.value = 'NFT铸造完成！'
    subProgressPercentage.value = 100
    await sleep(500)
    
    nftTokenId.value = tokenId.toString()
    nftTxHash.value = txHash
    nftMinted.value = true
    isProcessing.value = false
    
    // 通知父组件
    emit('nft-created', {
      tokenId: nftTokenId.value,
      ipfsHash: nftIpfsHash.value,
      txHash: nftTxHash.value,
      metadata: nftData.value
    })
    
  } catch (error) {
    console.error('NFT铸造失败:', error)
    alert('NFT铸造失败: ' + error.message)
    isProcessing.value = false
  }
}

// 工具方法
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const getRarityText = (rarity) => {
  const rarityTexts = {
    1: '常见',
    2: '普通', 
    3: '稀有',
    4: '史诗',
    5: '传奇'
  }
  return rarityTexts[rarity] || '未知'
}

const getComplexityText = (complexity) => {
  if (complexity >= 80) return '极高'
  if (complexity >= 60) return '高'
  if (complexity >= 40) return '中等'
  if (complexity >= 20) return '低'
  return '很低'
}

const getTaskTypeText = (type) => {
  const types = {
    'development': '开发任务',
    'design': '设计任务',
    'testing': '测试任务',
    'other': '其他任务'
  }
  return types[type] || '开发任务'
}

const formatTxHash = (hash) => {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

const getExplorerUrl = (txHash) => {
  return `https://testnet.snowtrace.io/tx/${txHash}`
}

// 监听props变化
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetState()
  }
})
</script>

<style scoped>
/* 自定义动画 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(147, 51, 234, 0.6);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* 渐变文本 */
.gradient-text {
  background: linear-gradient(45deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 玻璃效果 */
.glass-effect {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style> 