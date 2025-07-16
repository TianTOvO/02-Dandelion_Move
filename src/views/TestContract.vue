<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">🧪 智能合约测试</h1>
        
        <!-- 连接状态 -->
        <div class="mb-8 p-4 rounded-lg" :class="web3Store.isConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold" :class="web3Store.isConnected ? 'text-green-800' : 'text-red-800'">
                {{ web3Store.isConnected ? '✅ 钱包已连接' : '❌ 钱包未连接' }}
              </h3>
              <p class="text-sm mt-1" :class="web3Store.isConnected ? 'text-green-600' : 'text-red-600'">
                {{ web3Store.isConnected ? `地址: ${web3Store.formatAddress(web3Store.account)}` : '请连接MetaMask钱包' }}
              </p>
              <p v-if="web3Store.isConnected" class="text-sm text-green-600">
                余额: {{ web3Store.formattedBalance }} AVAX
              </p>
              <p v-if="web3Store.isConnected" class="text-sm text-green-600">
                网络: {{ web3Store.networkName }} ({{ web3Store.chainId }})
              </p>
              <p v-if="web3Store.isConnected" class="text-sm text-green-600">
                Provider状态: {{ web3Store.provider ? '✅ 正常' : '❌ 异常' }}
              </p>
            </div>
            <div class="flex flex-col space-y-2">
              <button 
                @click="web3Store.isConnected ? web3Store.disconnectWallet() : web3Store.connectWallet()"
                :disabled="web3Store.loading"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
                :class="web3Store.isConnected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'"
              >
                {{ web3Store.loading ? '处理中...' : (web3Store.isConnected ? '断开连接' : '连接钱包') }}
              </button>
              <button 
                v-if="web3Store.isConnected && !web3Store.provider"
                @click="reconnectProvider"
                :disabled="loading.reconnect"
                class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
              >
                {{ loading.reconnect ? '重连中...' : '重新连接Provider' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 错误显示 -->
        <div v-if="web3Store.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800">❌ {{ web3Store.error }}</p>
          <button @click="web3Store.clearError()" class="mt-2 text-sm text-red-600 hover:text-red-800">
            清除错误
          </button>
        </div>

        <!-- 网络检查 -->
        <div v-if="web3Store.isConnected && !web3Store.isCorrectNetwork" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-yellow-800">⚠️ 请切换到Avalanche Fuji测试网</p>
          <button @click="web3Store.switchToAvalanche()" class="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
            切换网络
          </button>
        </div>

        <!-- 合约状态 -->
        <div class="mb-8 p-4 rounded-lg border border-gray-200">
          <h3 class="font-semibold text-gray-800 mb-4">📋 合约状态</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <p class="text-sm">
                <span class="font-medium">TaskFactory:</span>
                <span :class="web3Store.contracts.taskFactory ? 'text-green-600' : 'text-red-600'">
                  {{ web3Store.contracts.taskFactory ? '✅ 已连接' : '❌ 未连接' }}
                </span>
              </p>
              <p class="text-sm">
                <span class="font-medium">BiddingSystem:</span>
                <span :class="web3Store.contracts.biddingSystem ? 'text-green-600' : 'text-red-600'">
                  {{ web3Store.contracts.biddingSystem ? '✅ 已连接' : '❌ 未连接' }}
                </span>
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-sm">
                <span class="font-medium">Escrow:</span>
                <span :class="web3Store.contracts.escrow ? 'text-green-600' : 'text-red-600'">
                  {{ web3Store.contracts.escrow ? '✅ 已连接' : '❌ 未连接' }}
                </span>
              </p>
              <p class="text-sm">
                <span class="font-medium">DisputeDAO:</span>
                <span :class="web3Store.contracts.disputeDAO ? 'text-green-600' : 'text-red-600'">
                  {{ web3Store.contracts.disputeDAO ? '✅ 已连接' : '❌ 未连接' }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- 测试功能 -->
        <div class="space-y-6">
          <h3 class="text-xl font-semibold text-gray-800">🧪 测试功能</h3>
          
          <!-- 读取合约数据 -->
          <div class="p-4 border border-gray-200 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-3">📖 读取合约数据</h4>
            <div class="flex flex-wrap gap-3">
              <button 
                @click="getTaskCount"
                :disabled="!canCallContract || loading.taskCount"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading.taskCount ? '获取中...' : '获取任务数量' }}
              </button>
              <button 
                @click="getAllTasks"
                :disabled="!canCallContract || loading.allTasks"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading.allTasks ? '获取中...' : '获取所有任务' }}
              </button>
            </div>
            
            <!-- 结果显示 -->
            <div v-if="testResults.taskCount !== null" class="mt-3 p-3 bg-gray-50 rounded">
              <p class="text-sm"><strong>任务数量:</strong> {{ testResults.taskCount }}</p>
            </div>
            <div v-if="testResults.allTasks.length > 0" class="mt-3 p-3 bg-gray-50 rounded">
              <p class="text-sm"><strong>任务列表:</strong></p>
              <pre class="text-xs mt-2 overflow-x-auto">{{ JSON.stringify(testResults.allTasks, null, 2) }}</pre>
            </div>
          </div>

          <!-- 创建测试任务 -->
          <div class="p-4 border border-gray-200 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-3">✍️ 创建测试任务</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                v-model="testTask.title"
                placeholder="任务标题"
                class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <input 
                v-model="testTask.reward"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="奖励金额 (AVAX)"
                class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <input 
                v-model="testTask.deadline"
                type="date"
                :min="minDate"
                class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <select 
                v-model="testTask.taskType"
                class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择任务类型</option>
                <option value="0">Web3开发</option>
                <option value="1">UI/UX设计</option>
                <option value="2">数据分析</option>
                <option value="3">内容创作</option>
                <option value="4">市场推广</option>
                <option value="5">其他</option>
              </select>
            </div>
            <textarea 
              v-model="testTask.description"
              placeholder="任务描述"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            ></textarea>
            <button 
              @click="createTestTask"
              :disabled="!canCreateTask || loading.createTask"
              class="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading.createTask ? '创建中...' : '创建测试任务' }}
            </button>
          </div>
        </div>

        <!-- 交易历史 -->
        <div v-if="web3Store.txHistory.length > 0" class="mt-8 p-4 border border-gray-200 rounded-lg">
          <h4 class="font-medium text-gray-800 mb-3">📜 交易历史</h4>
          <div class="space-y-2">
            <div v-for="tx in web3Store.txHistory.slice(0, 5)" :key="tx.hash" class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <span class="font-mono">{{ tx.hash.slice(0, 10) }}...{{ tx.hash.slice(-8) }}</span>
              <span :class="tx.status === 'success' ? 'text-green-600' : 'text-red-600'">
                {{ tx.status === 'success' ? '✅ 成功' : '❌ 失败' }}
              </span>
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
import { useIpfsStore } from '@/stores/ipfs'

const web3Store = useWeb3Store()
const ipfsStore = useIpfsStore()

// 测试数据
const testResults = ref({
  taskCount: null,
  allTasks: []
})

const loading = ref({
  taskCount: false,
  allTasks: false,
  createTask: false,
  reconnect: false
})

const testTask = ref({
  title: '测试任务 - ' + new Date().toLocaleString(),
  description: '这是一个用于测试智能合约功能的任务',
  reward: '0.1',
  deadline: '',
  taskType: '0'
})

// 计算属性
const canCallContract = computed(() => {
  return web3Store.isConnected && 
         web3Store.isCorrectNetwork && 
         web3Store.contracts.taskFactory
})

const canCreateTask = computed(() => {
  return canCallContract.value &&
         testTask.value.title.trim() &&
         testTask.value.description.trim() &&
         testTask.value.reward &&
         parseFloat(testTask.value.reward) >= 0.1 &&
         testTask.value.deadline &&
         testTask.value.taskType !== ''
})

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// 方法
const getTaskCount = async () => {
  if (!canCallContract.value) return
  
  loading.value.taskCount = true
  try {
    const count = await web3Store.contracts.taskFactory.taskCount()
    testResults.value.taskCount = count.toString()
    console.log('任务数量:', count.toString())
  } catch (error) {
    console.error('获取任务数量失败:', error)
    web3Store.error = '获取任务数量失败: ' + error.message
  } finally {
    loading.value.taskCount = false
  }
}

const getAllTasks = async () => {
  if (!canCallContract.value) return
  
  loading.value.allTasks = true
  try {
    const tasks = await web3Store.contracts.taskFactory.getAllTasks()
    testResults.value.allTasks = tasks.map(task => ({
      id: task.id.toString(),
      title: task.title,
      creator: task.creator,
      reward: web3Store.formatEther ? web3Store.formatEther(task.reward) : task.reward.toString(),
      status: task.status,
      deadline: new Date(task.deadline.toNumber() * 1000).toLocaleString()
    }))
    console.log('所有任务:', testResults.value.allTasks)
  } catch (error) {
    console.error('获取任务列表失败:', error)
    web3Store.error = '获取任务列表失败: ' + error.message
  } finally {
    loading.value.allTasks = false
  }
}

const createTestTask = async () => {
  if (!canCreateTask.value) return
  
  loading.value.createTask = true
  try {
    // 1. 上传任务数据到IPFS
    const taskData = {
      title: testTask.value.title,
      description: testTask.value.description,
      taskType: parseInt(testTask.value.taskType),
      creator: web3Store.account,
      createdAt: new Date().toISOString(),
      attachments: []
    }
    
    console.log('正在上传任务数据到IPFS...')
    const taskDataHash = await ipfsStore.uploadJSON(taskData)
    console.log('任务数据IPFS哈希:', taskDataHash)
    
    // 2. 调用智能合约创建任务
    console.log('正在调用智能合约创建任务...')
    const receipt = await web3Store.createTask(
      testTask.value.title,
      taskDataHash,
      testTask.value.reward,
      testTask.value.deadline,
      parseInt(testTask.value.taskType)
    )
    
    console.log('✅ 测试任务创建成功!', receipt)
    
    // 3. 刷新任务列表
    await getAllTasks()
    await getTaskCount()
    
    // 4. 重置表单
    testTask.value = {
      title: '测试任务 - ' + new Date().toLocaleString(),
      description: '这是一个用于测试智能合约功能的任务',
      reward: '0.1',
      deadline: '',
      taskType: '0'
    }
    
  } catch (error) {
    console.error('创建测试任务失败:', error)
    if (error.code === 4001) {
      web3Store.error = '用户取消了交易'
    } else {
      web3Store.error = '创建任务失败: ' + error.message
    }
  } finally {
    loading.value.createTask = false
  }
}

const reconnectProvider = async () => {
  loading.value.reconnect = true
  try {
    await web3Store.reconnectProvider()
    console.log('✅ Provider重新连接成功!')
  } catch (error) {
    console.error('重新连接Provider失败:', error)
    web3Store.error = '重新连接Provider失败: ' + error.message
  } finally {
    loading.value.reconnect = false
  }
}

// 初始化
onMounted(() => {
  // 设置默认截止时间（明天）
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  testTask.value.deadline = tomorrow.toISOString().split('T')[0]
  
  // 如果已经连接钱包，获取初始数据
  if (canCallContract.value) {
    getTaskCount()
    getAllTasks()
  }
})
</script> 