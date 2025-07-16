<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-4">
          <h3 class="text-2xl font-bold text-gray-800">📋 项目成果审核</h3>
          <div v-if="submissionData" class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              任务ID: {{ taskId }}
            </span>
            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {{ submissionData.files ? submissionData.files.length : 0 }} 个文件
            </span>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">正在加载项目提交数据...</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">加载失败</h4>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button @click="loadSubmissionData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            重新加载
          </button>
        </div>
      </div>

      <!-- 主内容 -->
      <div v-else-if="submissionData" class="flex-1 flex overflow-hidden">
        <!-- 左侧：项目信息和文件列表 -->
        <div class="w-1/3 border-r border-gray-200 flex flex-col">
          <!-- 项目基本信息 -->
          <div class="p-6 border-b border-gray-200">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">📝 项目信息</h4>
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-600">提交标题</label>
                <p class="text-gray-800 font-medium">{{ submissionData.submissionTitle }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">项目描述</label>
                <p class="text-gray-700 text-sm leading-relaxed">{{ submissionData.description }}</p>
              </div>
              <div v-if="submissionData.demoUrl">
                <label class="text-sm font-medium text-gray-600">演示链接</label>
                <a :href="submissionData.demoUrl" target="_blank" 
                   class="text-blue-600 hover:text-blue-800 underline text-sm block">
                  {{ submissionData.demoUrl }} ↗
                </a>
              </div>
              <div v-if="submissionData.repositoryUrl">
                <label class="text-sm font-medium text-gray-600">代码仓库</label>
                <a :href="submissionData.repositoryUrl" target="_blank" 
                   class="text-blue-600 hover:text-blue-800 underline text-sm block">
                  {{ submissionData.repositoryUrl }} ↗
                </a>
              </div>
              <div v-if="submissionData.technologies && submissionData.technologies.length > 0">
                <label class="text-sm font-medium text-gray-600">使用技术</label>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="tech in submissionData.technologies" :key="tech"
                        class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {{ tech }}
                  </span>
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">提交时间</label>
                <p class="text-gray-700 text-sm">{{ formatDate(submissionData.submittedAt) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">提交者</label>
                <p class="text-gray-700 text-sm font-mono">{{ formatAddress(submissionData.submitterAddress) }}</p>
              </div>
            </div>
          </div>

          <!-- 文件列表 -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-semibold text-gray-800">📁 项目文件</h4>
                <div class="flex items-center space-x-2">
                  <button @click="downloadAllFiles" 
                          class="text-sm text-blue-600 hover:text-blue-800 underline">
                    下载全部
                  </button>
                  <span class="text-sm text-gray-500">|</span>
                  <span class="text-sm text-gray-600">{{ submissionData.files.length }} 个文件</span>
                </div>
              </div>

              <!-- 文件分类标签 -->
              <div class="flex space-x-2 mb-4">
                <button
                  v-for="category in fileCategories"
                  :key="category.key"
                  @click="selectedCategory = category.key"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  {{ category.label }} ({{ category.count }})
                </button>
              </div>

              <!-- 文件列表 -->
              <div class="space-y-2">
                <div
                  v-for="file in filteredFiles"
                  :key="file.hash"
                  @click="selectFile(file)"
                  :class="[
                    'flex items-center p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedFile && selectedFile.hash === file.hash
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex-shrink-0 mr-3">
                    <div :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      getFileIconClass(file.category)
                    ]">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path v-if="file.category === 'code'" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"/>
                        <path v-else-if="file.category === 'image'" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                        <path v-else d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                    <div class="flex items-center space-x-2 mt-1">
                      <span class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
                      <span class="text-xs text-gray-400">•</span>
                      <span class="text-xs text-gray-500">{{ getCategoryText(file.category) }}</span>
                    </div>
                  </div>
                  <div class="flex-shrink-0 ml-2">
                    <button @click.stop="downloadFile(file)" 
                            class="text-gray-400 hover:text-gray-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：文件预览区域 -->
        <div class="flex-1 flex flex-col">
          <!-- 预览头部 -->
          <div class="p-6 border-b border-gray-200">
            <div v-if="selectedFile" class="flex items-center justify-between">
              <div>
                <h4 class="text-lg font-semibold text-gray-800">{{ selectedFile.name }}</h4>
                <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>{{ formatFileSize(selectedFile.size) }}</span>
                  <span>{{ getCategoryText(selectedFile.category) }}</span>
                  <span>{{ formatDate(selectedFile.uploadedAt) }}</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button @click="downloadFile(selectedFile)" 
                        class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  下载文件
                </button>
                <button @click="viewInIPFS(selectedFile)" 
                        class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  IPFS查看
                </button>
              </div>
            </div>
            <div v-else class="text-center text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p>选择左侧文件进行预览</p>
            </div>
          </div>

          <!-- 预览内容 -->
          <div class="flex-1 overflow-auto">
            <div v-if="selectedFile" class="p-6">
              <!-- 代码文件预览 -->
              <div v-if="selectedFile.category === 'code' && fileContent" class="space-y-4">
                <div class="bg-gray-900 rounded-lg overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-2 bg-gray-800">
                    <span class="text-gray-300 text-sm">{{ selectedFile.name }}</span>
                    <button @click="copyToClipboard(fileContent)" 
                            class="text-gray-400 hover:text-gray-200 text-sm">
                      复制代码
                    </button>
                  </div>
                  <pre class="p-4 text-sm text-gray-100 overflow-x-auto"><code>{{ fileContent }}</code></pre>
                </div>
              </div>

              <!-- 图片文件预览 -->
              <div v-else-if="selectedFile.category === 'image'" class="text-center">
                <img :src="getFileURL(selectedFile.hash)" 
                     :alt="selectedFile.name"
                     class="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                     @error="handleImageError">
              </div>

              <!-- 文档文件预览 -->
              <div v-else-if="selectedFile.category === 'documentation' && fileContent" class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-6">
                  <div class="prose max-w-none">
                    <pre class="whitespace-pre-wrap text-sm text-gray-800">{{ fileContent }}</pre>
                  </div>
                </div>
              </div>

              <!-- 其他文件类型 -->
              <div v-else class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h4 class="text-lg font-medium text-gray-800 mb-2">{{ selectedFile.name }}</h4>
                <p class="text-gray-600 mb-4">此文件类型不支持预览</p>
                <button @click="downloadFile(selectedFile)" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  下载查看
                </button>
              </div>

              <!-- 文件加载中 -->
              <div v-if="loadingFileContent" class="text-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600">正在加载文件内容...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="p-6 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="showNFTModal = true" 
                    class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium">
              🎨 NFT化此项目
            </button>
            <span class="text-sm text-gray-600">将项目成果转化为NFT收藏品</span>
          </div>
          <div class="flex space-x-3">
            <button @click="rejectSubmission" 
                    class="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
              ❌ 拒绝
            </button>
            <button @click="approveSubmission" 
                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              ✅ 通过审核
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- NFT创建模态框 -->
    <NFTCreationModal
      :show="showNFTModal"
      :task-id="taskId"
      :submission-data="submissionData"
      :project-files="submissionData ? submissionData.files : []"
      @close="showNFTModal = false"
      @nft-created="handleNFTCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useIpfsStore } from '@/stores/ipfs.js'
import NFTCreationModal from './NFTCreationModal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  taskId: {
    type: [String, Number],
    required: true
  },
  submissionHash: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'approve', 'reject', 'nft-created'])

const ipfsStore = useIpfsStore()

// 状态管理
const loading = ref(false)
const error = ref('')
const submissionData = ref(null)
const selectedFile = ref(null)
const selectedCategory = ref('all')
const fileContent = ref('')
const loadingFileContent = ref(false)
const showNFTModal = ref(false)

// 计算属性
const fileCategories = computed(() => {
  if (!submissionData.value || !submissionData.value.files) return []
  
  const files = submissionData.value.files
  const categories = [
    { key: 'all', label: '全部', count: files.length },
    { key: 'code', label: '代码', count: files.filter(f => f.category === 'code').length },
    { key: 'documentation', label: '文档', count: files.filter(f => f.category === 'documentation').length },
    { key: 'image', label: '图片', count: files.filter(f => f.category === 'image').length },
    { key: 'other', label: '其他', count: files.filter(f => !['code', 'documentation', 'image'].includes(f.category)).length }
  ]
  
  return categories.filter(cat => cat.count > 0)
})

const filteredFiles = computed(() => {
  if (!submissionData.value || !submissionData.value.files) return []
  
  if (selectedCategory.value === 'all') {
    return submissionData.value.files
  }
  
  return submissionData.value.files.filter(file => file.category === selectedCategory.value)
})

// 方法
const closeModal = () => {
  emit('close')
}

const loadSubmissionData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('加载项目提交数据，IPFS Hash:', props.submissionHash)
    
    const data = await ipfsStore.getProjectSubmission(props.submissionHash)
    submissionData.value = data
    
    console.log('项目提交数据加载成功:', data)
    
  } catch (err) {
    console.error('加载项目提交数据失败:', err)
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const selectFile = async (file) => {
  selectedFile.value = file
  fileContent.value = ''
  
  // 对于可预览的文件类型，加载内容
  if (file.category === 'code' || file.category === 'documentation') {
    await loadFileContent(file)
  }
}

const loadFileContent = async (file) => {
  try {
    loadingFileContent.value = true
    console.log('加载文件内容:', file.name, file.hash)
    
    const content = await ipfsStore.getFile(file.hash)
    fileContent.value = content
    
  } catch (err) {
    console.error('加载文件内容失败:', err)
    fileContent.value = '文件内容加载失败: ' + err.message
  } finally {
    loadingFileContent.value = false
  }
}

const downloadFile = (file) => {
  const url = getFileURL(file.hash)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadAllFiles = () => {
  if (!submissionData.value || !submissionData.value.files) return
  
  submissionData.value.files.forEach(file => {
    setTimeout(() => downloadFile(file), 100)
  })
}

const viewInIPFS = (file) => {
  const url = getFileURL(file.hash)
  window.open(url, '_blank')
}

const getFileURL = (hash) => {
  return ipfsStore.getFileURL(hash)
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('代码已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const handleImageError = (event) => {
  console.error('图片加载失败:', event.target.src)
  event.target.style.display = 'none'
}

const approveSubmission = () => {
  emit('approve', {
    taskId: props.taskId,
    submissionData: submissionData.value
  })
}

const rejectSubmission = () => {
  emit('reject', {
    taskId: props.taskId,
    submissionData: submissionData.value
  })
}

const handleNFTCreated = (nftData) => {
  console.log('NFT创建成功:', nftData)
  emit('nft-created', nftData)
  showNFTModal.value = false
}

// 工具方法
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const formatAddress = (address) => {
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getCategoryText = (category) => {
  const categoryTexts = {
    'code': '代码文件',
    'documentation': '文档文件',
    'image': '图片文件',
    'video': '视频文件',
    'archive': '压缩文件',
    'other': '其他文件'
  }
  return categoryTexts[category] || '未知类型'
}

const getFileIconClass = (category) => {
  const iconClasses = {
    'code': 'bg-blue-100 text-blue-600',
    'documentation': 'bg-green-100 text-green-600',
    'image': 'bg-purple-100 text-purple-600',
    'video': 'bg-red-100 text-red-600',
    'archive': 'bg-yellow-100 text-yellow-600',
    'other': 'bg-gray-100 text-gray-600'
  }
  return iconClasses[category] || iconClasses.other
}

// 监听props变化
watch(() => props.show, (newValue) => {
  if (newValue && props.submissionHash) {
    loadSubmissionData()
  }
})

watch(() => props.submissionHash, (newValue) => {
  if (newValue && props.show) {
    loadSubmissionData()
  }
})

// 组件挂载时加载数据
onMounted(() => {
  if (props.show && props.submissionHash) {
    loadSubmissionData()
  }
})
</script>

<style scoped>
/* 代码高亮样式 */
pre code {
  font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 文件列表项hover效果 */
.file-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .fixed .bg-white {
    max-width: 95vw;
    max-height: 95vh;
  }
}
</style> 