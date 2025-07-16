<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- 调试按钮 -->
    <button 
      @click="showDebugPanel = !showDebugPanel"
      class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
      title="任务数据调试"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    </button>

    <!-- 调试面板 -->
    <div 
      v-if="showDebugPanel"
      class="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-h-96 overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">任务数据调试</h3>
        <button 
          @click="showDebugPanel = false"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 状态检查 -->
      <div class="space-y-3">
        <!-- Web3连接状态 -->
        <div class="p-3 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">Web3连接状态</h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>钱包连接:</span>
              <span :class="web3Store.isConnected ? 'text-green-600' : 'text-red-600'">
                {{ web3Store.isConnected ? '已连接' : '未连接' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>合约服务:</span>
              <span :class="web3Store.contractService ? 'text-green-600' : 'text-red-600'">
                {{ web3Store.contractService ? '已初始化' : '未初始化' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>账户地址:</span>
              <span class="text-xs text-gray-600">
                {{ web3Store.account ? formatAddress(web3Store.account) : '无' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 数据状态 -->
        <div class="p-3 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">数据状态</h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>任务总数:</span>
              <span class="text-blue-600">{{ dataStore.tasks.length }}</span>
            </div>
            <div class="flex justify-between">
              <span>数据已初始化:</span>
              <span :class="dataStore.initialized ? 'text-green-600' : 'text-red-600'">
                {{ dataStore.initialized ? '是' : '否' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>IPFS索引:</span>
              <span :class="dataStore.dataIndexHash ? 'text-green-600' : 'text-red-600'">
                {{ dataStore.dataIndexHash ? '存在' : '无' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 任务来源分析 -->
        <div class="p-3 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">任务来源分析</h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>合约任务:</span>
              <span class="text-blue-600">{{ contractTasks }}</span>
            </div>
            <div class="flex justify-between">
              <span>本地示例:</span>
              <span class="text-orange-600">{{ sampleTasks }}</span>
            </div>
            <div class="flex justify-between">
              <span>用户发布:</span>
              <span class="text-green-600">{{ userTasks }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="space-y-2">
          <button 
            @click="connectWallet"
            :disabled="web3Store.isConnected || loading"
            class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
          >
            {{ web3Store.isConnected ? '钱包已连接' : '连接钱包' }}
          </button>
          
          <button 
            @click="refreshFromContract"
            :disabled="!web3Store.contractService || loading"
            class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
          >
            {{ loading ? '刷新中...' : '从合约刷新' }}
          </button>
          
          <button 
            @click="clearLocalData"
            class="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
          >
            清除本地缓存
          </button>
          
          <button 
            @click="forceReload"
            :disabled="loading"
            class="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
          >
            {{ loading ? '重新加载中...' : '强制重新加载' }}
          </button>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- 操作日志 -->
        <div v-if="logs.length > 0" class="p-3 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">操作日志</h4>
          <div class="space-y-1 text-xs text-gray-600 max-h-20 overflow-y-auto">
            <div v-for="(log, index) in logs.slice(-5)" :key="index">
              {{ log }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeb3Store } from '@/stores/web3'
import { useDataStore } from '@/stores/data'

const web3Store = useWeb3Store()
const dataStore = useDataStore()

const showDebugPanel = ref(false)
const loading = ref(false)
const error = ref('')
const logs = ref([])

// 添加日志
const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
  console.log(`[TaskDataDebug] ${message}`)
}

// 计算任务来源
const contractTasks = computed(() => {
  return dataStore.tasks.filter(task => 
    task.source === 'contract+ipfs' || task.source === 'contract-only'
  ).length
})

const sampleTasks = computed(() => {
  return dataStore.tasks.filter(task => 
    !task.source || task.source === 'sample'
  ).length
})

const userTasks = computed(() => {
  if (!web3Store.account) return 0
  return dataStore.tasks.filter(task => 
    task.creator?.toLowerCase() === web3Store.account?.toLowerCase() ||
    task.employer?.toLowerCase() === web3Store.account?.toLowerCase()
  ).length
})

// 格式化地址
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 连接钱包
const connectWallet = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('开始连接钱包...')
    
    await web3Store.connectWallet()
    addLog('钱包连接成功')
    
    // 连接成功后自动刷新数据
    await refreshFromContract()
  } catch (err) {
    error.value = err.message
    addLog(`钱包连接失败: ${err.message}`)
  } finally {
    loading.value = false
  }
}

// 从合约刷新数据
const refreshFromContract = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('开始从合约获取数据...')
    
    if (!web3Store.contractService) {
      throw new Error('合约服务未初始化')
    }
    
    // 清除任务缓存
    web3Store.clearTaskCache()
    addLog('已清除Web3缓存')
    
    // 从合约加载任务
    const contractTasks = await dataStore.loadTasksFromContract()
    addLog(`从合约获取到 ${contractTasks.length} 个任务`)
    
    // 更新统计
    dataStore.updateStats()
    addLog('数据刷新完成')
    
  } catch (err) {
    error.value = err.message
    addLog(`从合约刷新失败: ${err.message}`)
  } finally {
    loading.value = false
  }
}

// 清除本地缓存
const clearLocalData = () => {
  try {
    addLog('开始清除本地缓存...')
    
    // 清除localStorage
    localStorage.removeItem('dandelion_data_index')
    addLog('已清除localStorage中的数据索引')
    
    // 清除dataStore缓存
    dataStore.clearLocalData()
    addLog('已清除dataStore缓存')
    
    // 清除Web3缓存
    web3Store.clearTaskCache()
    addLog('已清除Web3缓存')
    
    addLog('本地缓存清除完成')
  } catch (err) {
    error.value = err.message
    addLog(`清除缓存失败: ${err.message}`)
  }
}

// 强制重新加载
const forceReload = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('开始强制重新加载...')
    
    // 清除所有缓存
    clearLocalData()
    
    // 重置数据状态
    dataStore.resetData()
    addLog('已重置数据状态')
    
    // 重新初始化数据
    await dataStore.initializeData()
    addLog('数据重新初始化完成')
    
    // 如果钱包已连接，从合约获取数据
    if (web3Store.isConnected && web3Store.contractService) {
      await refreshFromContract()
    }
    
  } catch (err) {
    error.value = err.message
    addLog(`强制重新加载失败: ${err.message}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  addLog('任务数据调试器已加载')
})
</script>

<style scoped>
/* 调试面板样式 */
</style> 