<template>
  <div class="contract-debug-panel">
    <!-- 调试面板触发按钮 -->
    <button 
      @click="showDebug = !showDebug"
      class="debug-toggle-btn"
      :class="{ 'active': showDebug }"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
      合约调试
    </button>

    <!-- 调试面板 -->
    <div v-if="showDebug" class="debug-panel">
      <div class="debug-header">
        <h3>智能合约任务数据调试</h3>
        <button @click="showDebug = false" class="close-btn">×</button>
      </div>

      <div class="debug-content">
        <!-- Web3连接状态 -->
        <div class="debug-section">
          <h4>🔗 Web3连接状态</h4>
          <div class="status-grid">
            <div class="status-item">
              <span class="label">钱包连接:</span>
              <span :class="['status', web3Store.isConnected ? 'success' : 'error']">
                {{ web3Store.isConnected ? '已连接' : '未连接' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">账户地址:</span>
              <span class="value">{{ web3Store.account || '未获取' }}</span>
            </div>
            <div class="status-item">
              <span class="label">网络ID:</span>
              <span class="value">{{ web3Store.chainId || '未知' }}</span>
            </div>
            <div class="status-item">
              <span class="label">合约服务:</span>
              <span :class="['status', web3Store.contractService ? 'success' : 'error']">
                {{ web3Store.contractService ? '已初始化' : '未初始化' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 数据状态 -->
        <div class="debug-section">
          <h4>📊 数据状态</h4>
          <div class="status-grid">
            <div class="status-item">
              <span class="label">总任务数:</span>
              <span class="value">{{ dataStore.tasks.length }}</span>
            </div>
            <div class="status-item">
              <span class="label">数据初始化:</span>
              <span :class="['status', dataStore.initialized ? 'success' : 'warning']">
                {{ dataStore.initialized ? '已完成' : '未完成' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">加载状态:</span>
              <span :class="['status', dataStore.loading ? 'warning' : 'success']">
                {{ dataStore.loading ? '加载中' : '已完成' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">IPFS索引:</span>
              <span class="value">{{ dataStore.dataIndexHash ? '有' : '无' }}</span>
            </div>
          </div>
        </div>

        <!-- 任务来源分析 -->
        <div class="debug-section">
          <h4>📋 任务来源分析</h4>
          <div class="source-stats">
            <div v-for="(count, source) in taskSourceStats" :key="source" class="source-item">
              <span class="source-label">{{ getSourceLabel(source) }}:</span>
              <span class="source-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- 合约配置检查 -->
        <div class="debug-section">
          <h4>⚙️ 合约配置检查</h4>
          <div class="config-check">
            <div class="config-item">
              <span class="label">TaskFactory地址:</span>
              <span :class="['value', contractAddresses.TaskFactory ? 'valid' : 'invalid']">
                {{ contractAddresses.TaskFactory || '未配置' }}
              </span>
            </div>
            <div class="config-item">
              <span class="label">网络要求:</span>
              <span class="value">Avalanche Fuji (43113)</span>
            </div>
            <div class="config-item">
              <span class="label">当前网络:</span>
              <span :class="['value', isCorrectNetwork ? 'valid' : 'invalid']">
                {{ networkName }} ({{ web3Store.chainId || '未知' }})
              </span>
            </div>
          </div>
        </div>

        <!-- 合约初始化详细诊断 -->
        <div class="debug-section">
          <h4>🔧 合约初始化诊断</h4>
          <div class="diagnosis-grid">
            <div class="diagnosis-item">
              <span class="label">Step 1 - MetaMask检测:</span>
              <span :class="['status', hasMetaMask ? 'success' : 'error']">
                {{ hasMetaMask ? '✅ 已安装' : '❌ 未安装' }}
              </span>
            </div>
            <div class="diagnosis-item">
              <span class="label">Step 2 - 钱包连接:</span>
              <span :class="['status', web3Store.isConnected ? 'success' : 'error']">
                {{ web3Store.isConnected ? '✅ 已连接' : '❌ 未连接' }}
              </span>
            </div>
            <div class="diagnosis-item">
              <span class="label">Step 3 - 网络检查:</span>
              <span :class="['status', isCorrectNetwork ? 'success' : 'error']">
                {{ isCorrectNetwork ? '✅ Fuji网络' : '❌ 错误网络' }}
              </span>
            </div>
            <div class="diagnosis-item">
              <span class="label">Step 4 - Provider初始化:</span>
              <span :class="['status', web3Store.provider ? 'success' : 'error']">
                {{ web3Store.provider ? '✅ 已初始化' : '❌ 未初始化' }}
              </span>
            </div>
            <div class="diagnosis-item">
              <span class="label">Step 5 - Signer初始化:</span>
              <span :class="['status', web3Store.signer ? 'success' : 'error']">
                {{ web3Store.signer ? '✅ 已初始化' : '❌ 未初始化' }}
              </span>
            </div>
            <div class="diagnosis-item">
              <span class="label">Step 6 - 合约服务:</span>
              <span :class="['status', web3Store.contractService ? 'success' : 'error']">
                {{ web3Store.contractService ? '✅ 已初始化' : '❌ 未初始化' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 合约地址验证 -->
        <div class="debug-section">
          <h4>📋 合约地址验证</h4>
          <div class="contract-addresses">
            <div v-for="(address, name) in contractAddresses" :key="name" class="address-item">
              <span class="contract-name">{{ name }}:</span>
              <span :class="['address-value', isValidAddress(address) ? 'valid' : 'invalid']">
                {{ address || '未配置' }}
              </span>
              <button 
                v-if="isValidAddress(address)" 
                @click="verifyContract(name, address)"
                :disabled="loading"
                class="verify-btn"
              >
                验证
              </button>
            </div>
          </div>
        </div>

        <!-- 实时状态监控 -->
        <div class="debug-section">
          <h4>📡 实时状态监控</h4>
          <div class="status-monitor">
            <div class="monitor-item">
              <span class="label">连接状态:</span>
              <span :class="['value', getConnectionStatus().class]">
                {{ getConnectionStatus().text }}
              </span>
            </div>
            <div class="monitor-item">
              <span class="label">合约状态:</span>
              <span :class="['value', getContractStatus().class]">
                {{ getContractStatus().text }}
              </span>
            </div>
            <div class="monitor-item">
              <span class="label">数据状态:</span>
              <span :class="['value', getDataStatus().class]">
                {{ getDataStatus().text }}
              </span>
            </div>
          </div>
        </div>

        <!-- 一键修复按钮 -->
        <div class="debug-section">
          <h4>🚀 一键修复</h4>
          <div class="fix-buttons">
            <button 
              @click="performFullDiagnosis"
              :disabled="loading"
              class="action-btn primary full-width"
            >
              {{ loading ? '诊断中...' : '🔍 完整诊断' }}
            </button>
            
            <button 
              @click="autoFixAll"
              :disabled="loading"
              class="action-btn success full-width"
            >
              {{ loading ? '修复中...' : '🔧 一键修复所有问题' }}
            </button>
            
            <button 
              @click="reinitializeEverything"
              :disabled="loading"
              class="action-btn warning full-width"
            >
              {{ loading ? '重置中...' : '🔄 完全重新初始化' }}
            </button>
          </div>
        </div>

        <!-- 详细错误信息 -->
        <div v-if="error" class="debug-section">
          <h4>❌ 错误详情</h4>
          <div class="error-details">
            <div class="error-message">{{ error }}</div>
            <div v-if="errorSuggestions.length > 0" class="error-suggestions">
              <h5>💡 建议解决方案：</h5>
              <ul>
                <li v-for="(suggestion, index) in errorSuggestions" :key="index">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="debug-section">
          <h4>🔧 调试操作</h4>
          <div class="action-buttons">
            <button 
              v-if="!web3Store.isConnected" 
              @click="connectWallet"
              :disabled="loading"
              class="action-btn primary"
            >
              {{ loading ? '连接中...' : '🔗 连接钱包' }}
            </button>
            
            <button 
              v-if="web3Store.isConnected && !isCorrectNetwork"
              @click="switchNetwork"
              :disabled="loading"
              class="action-btn warning"
            >
              {{ loading ? '切换中...' : '🌐 切换到Fuji网络' }}
            </button>
            
            <button 
              @click="initializeContractService"
              :disabled="loading || !web3Store.isConnected"
              class="action-btn info"
            >
              {{ loading ? '初始化中...' : '🔧 初始化合约服务' }}
            </button>
            
            <button 
              @click="refreshContractData"
              :disabled="loading || !web3Store.contractService"
              class="action-btn success"
            >
              {{ loading ? '刷新中...' : '🔄 从合约刷新数据' }}
            </button>
            
            <button 
              @click="testContractConnection"
              :disabled="loading || !web3Store.contractService"
              class="action-btn info"
            >
              {{ loading ? '测试中...' : '🧪 测试合约连接' }}
            </button>
            
            <button 
              @click="autoFix"
              :disabled="loading"
              class="action-btn primary"
            >
              {{ loading ? '修复中...' : '🔧 自动修复' }}
            </button>
            
            <button 
              @click="clearLocalData"
              :disabled="loading"
              class="action-btn warning"
            >
              🗑️ 清除本地缓存
            </button>
            
            <button 
              @click="forceReload"
              :disabled="loading"
              class="action-btn secondary"
            >
              {{ loading ? '重新加载中...' : '🔄 强制重新加载' }}
            </button>
          </div>
        </div>

        <!-- 操作日志 -->
        <div class="debug-section">
          <h4>📝 操作日志</h4>
          <div class="log-container">
            <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-message">{{ log.message }}</span>
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
import { CONTRACT_ADDRESSES, AVALANCHE_FUJI } from '@/utils/contracts'

const web3Store = useWeb3Store()
const dataStore = useDataStore()

const showDebug = ref(false)
const loading = ref(false)
const error = ref('')
const logs = ref([])

// 计算任务来源统计
const taskSourceStats = computed(() => {
  return dataStore.getTaskSourceStats()
})

// 合约地址配置
const contractAddresses = computed(() => {
  return CONTRACT_ADDRESSES
})

// 网络检查
const isCorrectNetwork = computed(() => {
  return web3Store.chainId === parseInt(AVALANCHE_FUJI.chainId, 16)
})

// 网络名称
const networkName = computed(() => {
  const chainId = web3Store.chainId
  const networks = {
    43113: 'Avalanche Fuji',
    43114: 'Avalanche Mainnet',
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet'
  }
  return networks[chainId] || '未知网络'
})

// 错误建议
const errorSuggestions = computed(() => {
  const suggestions = []
  
  if (!web3Store.isConnected) {
    suggestions.push('请先连接MetaMask钱包')
  }
  
  if (web3Store.isConnected && !isCorrectNetwork.value) {
    suggestions.push('请切换到Avalanche Fuji测试网络 (Chain ID: 43113)')
  }
  
  if (!contractAddresses.value.TaskFactory) {
    suggestions.push('合约地址未配置，请检查contracts.js文件')
  }
  
  if (web3Store.isConnected && isCorrectNetwork.value && !web3Store.contractService) {
    suggestions.push('尝试手动初始化合约服务')
  }
  
  if (error.value.includes('MetaMask')) {
    suggestions.push('确保MetaMask已安装并已解锁')
  }
  
  if (error.value.includes('网络')) {
    suggestions.push('检查网络连接或尝试切换RPC端点')
  }
  
  return suggestions
})

// 添加日志
const addLog = (message, type = 'info') => {
  logs.value.unshift({
    timestamp: Date.now(),
    message,
    type
  })
  
  // 保持日志数量不超过50条
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 获取来源标签
const getSourceLabel = (source) => {
  const labels = {
    'contract+ipfs': '合约+IPFS',
    'contract-only': '仅合约',
    'sample': '本地示例',
    'local': '本地数据',
    'unknown': '未知'
  }
  return labels[source] || source
}

// 连接钱包
const connectWallet = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('开始连接钱包...', 'info')
    
    await web3Store.connectWallet()
    addLog('钱包连接成功', 'success')
    
    // 连接成功后自动检查网络
    if (!isCorrectNetwork.value) {
      addLog('检测到错误网络，建议切换到Avalanche Fuji', 'warning')
    } else {
      // 网络正确，尝试刷新数据
      await refreshContractData()
    }
    
  } catch (err) {
    error.value = err.message
    addLog(`钱包连接失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 切换网络
const switchNetwork = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('切换到Avalanche Fuji网络...', 'info')
    
    await web3Store.switchToAvalanche()
    addLog('网络切换成功', 'success')
    
    // 网络切换后重新初始化合约
    await initializeContractService()
    
  } catch (err) {
    error.value = err.message
    addLog(`网络切换失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 初始化合约服务
const initializeContractService = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('初始化合约服务...', 'info')
    
    if (!web3Store.isConnected) {
      throw new Error('钱包未连接')
    }
    
    if (!isCorrectNetwork.value) {
      throw new Error('请先切换到Avalanche Fuji网络')
    }
    
    const success = await web3Store.initializeContracts()
    
    if (success) {
      addLog('合约服务初始化成功', 'success')
      // 初始化成功后自动刷新数据
      await refreshContractData()
    } else {
      throw new Error('合约服务初始化失败')
    }
    
  } catch (err) {
    error.value = err.message
    addLog(`合约服务初始化失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 从合约刷新数据
const refreshContractData = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('开始从合约刷新数据...', 'info')
    
    if (!web3Store.contractService) {
      throw new Error('合约服务未初始化')
    }
    
    // 直接调用合约获取任务
    const contractTasks = await web3Store.contractService.getAllTasks()
    addLog(`从合约获取到 ${contractTasks.length} 个任务`, 'success')
    
    // 重新加载数据存储中的任务
    await dataStore.loadTasksFromContract()
    addLog('数据刷新完成', 'success')
    
  } catch (err) {
    error.value = err.message
    addLog(`刷新数据失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 测试合约连接
const testContractConnection = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('测试合约连接...', 'info')
    
    if (!web3Store.contractService) {
      throw new Error('合约服务未初始化')
    }
    
    // 测试获取平台费用信息
    const feeInfo = await web3Store.contractService.getPlatformFeeInfo()
    addLog(`合约连接正常，平台费率: ${feeInfo.feeRate}`, 'success')
    
    // 测试获取任务数量
    const tasks = await web3Store.contractService.getAllTasks()
    addLog(`合约中共有 ${tasks.length} 个任务`, 'success')
    
  } catch (err) {
    error.value = err.message
    addLog(`合约连接测试失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 自动修复
const autoFix = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('开始自动修复...', 'info')
    
    // 1. 检查钱包连接
    if (!web3Store.isConnected) {
      addLog('步骤1: 连接钱包', 'info')
      await web3Store.connectWallet()
      addLog('钱包连接成功', 'success')
    }
    
    // 2. 检查网络
    if (!isCorrectNetwork.value) {
      addLog('步骤2: 切换到Avalanche Fuji网络', 'info')
      try {
        await web3Store.switchToAvalanche()
        addLog('网络切换成功', 'success')
      } catch (networkError) {
        addLog('自动网络切换失败，请手动切换', 'warning')
      }
    }
    
    // 3. 初始化合约服务
    if (!web3Store.contractService) {
      addLog('步骤3: 初始化合约服务', 'info')
      const success = await web3Store.initializeContracts()
      if (success) {
        addLog('合约服务初始化成功', 'success')
      } else {
        throw new Error('合约服务初始化失败')
      }
    }
    
    // 4. 刷新数据
    addLog('步骤4: 刷新合约数据', 'info')
    await dataStore.loadTasksFromContract()
    addLog('数据刷新完成', 'success')
    
    addLog('✅ 自动修复完成', 'success')
    
  } catch (err) {
    error.value = err.message
    addLog(`自动修复失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 清除本地数据
const clearLocalData = () => {
  try {
    addLog('清除本地缓存数据...', 'info')
    dataStore.clearLocalData()
    addLog('本地缓存已清除', 'success')
  } catch (err) {
    error.value = err.message
    addLog(`清除缓存失败: ${err.message}`, 'error')
  }
}

// 强制重新加载
const forceReload = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('强制重新加载数据...', 'info')
    
    // 重置数据存储状态
    dataStore.resetData()
    
    // 重新初始化数据
    await dataStore.initializeData()
    addLog('数据重新加载完成', 'success')
    
  } catch (err) {
    error.value = err.message
    addLog(`重新加载失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// MetaMask检测
const hasMetaMask = computed(() => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
})

// 地址验证
const isValidAddress = (address) => {
  if (!address) return false
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// 连接状态
const getConnectionStatus = () => {
  if (!hasMetaMask.value) {
    return { text: '❌ MetaMask未安装', class: 'error' }
  }
  if (!web3Store.isConnected) {
    return { text: '⚠️ 钱包未连接', class: 'warning' }
  }
  if (!isCorrectNetwork.value) {
    return { text: '⚠️ 网络错误', class: 'warning' }
  }
  return { text: '✅ 连接正常', class: 'success' }
}

// 合约状态
const getContractStatus = () => {
  if (!web3Store.provider) {
    return { text: '❌ Provider未初始化', class: 'error' }
  }
  if (!web3Store.signer) {
    return { text: '❌ Signer未初始化', class: 'error' }
  }
  if (!web3Store.contractService) {
    return { text: '❌ 合约服务未初始化', class: 'error' }
  }
  return { text: '✅ 合约服务正常', class: 'success' }
}

// 数据状态
const getDataStatus = () => {
  if (!dataStore.initialized) {
    return { text: '⚠️ 数据未初始化', class: 'warning' }
  }
  if (dataStore.loading) {
    return { text: '🔄 数据加载中', class: 'info' }
  }
  const stats = taskSourceStats.value
  const contractTasks = (stats['contract+ipfs'] || 0) + (stats['contract-only'] || 0)
  if (contractTasks === 0) {
    return { text: '⚠️ 无合约数据', class: 'warning' }
  }
  return { text: `✅ 已加载${contractTasks}个合约任务`, class: 'success' }
}

// 验证合约
const verifyContract = async (name, address) => {
  try {
    loading.value = true
    addLog(`验证合约 ${name}: ${address}`, 'info')
    
    if (!web3Store.provider) {
      throw new Error('Provider未初始化')
    }
    
    // 检查地址是否为合约
    const code = await web3Store.provider.getCode(address)
    if (code === '0x') {
      throw new Error('地址不是合约地址')
    }
    
    addLog(`✅ ${name} 合约验证成功`, 'success')
    
  } catch (err) {
    addLog(`❌ ${name} 合约验证失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 完整诊断
const performFullDiagnosis = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('🔍 开始完整诊断...', 'info')
    
    const diagnosis = {
      metaMask: hasMetaMask.value,
      walletConnected: web3Store.isConnected,
      correctNetwork: isCorrectNetwork.value,
      provider: !!web3Store.provider,
      signer: !!web3Store.signer,
      contractService: !!web3Store.contractService,
      contractAddresses: {},
      issues: [],
      recommendations: []
    }
    
    // 检查MetaMask
    if (!diagnosis.metaMask) {
      diagnosis.issues.push('MetaMask未安装')
      diagnosis.recommendations.push('请安装MetaMask浏览器扩展')
    }
    
    // 检查钱包连接
    if (!diagnosis.walletConnected) {
      diagnosis.issues.push('钱包未连接')
      diagnosis.recommendations.push('点击"连接钱包"按钮')
    }
    
    // 检查网络
    if (diagnosis.walletConnected && !diagnosis.correctNetwork) {
      diagnosis.issues.push('网络错误')
      diagnosis.recommendations.push('切换到Avalanche Fuji测试网')
    }
    
    // 检查Provider和Signer
    if (diagnosis.walletConnected && (!diagnosis.provider || !diagnosis.signer)) {
      diagnosis.issues.push('Web3组件未正确初始化')
      diagnosis.recommendations.push('重新连接钱包')
    }
    
    // 检查合约服务
    if (diagnosis.provider && diagnosis.signer && !diagnosis.contractService) {
      diagnosis.issues.push('合约服务初始化失败')
      diagnosis.recommendations.push('手动初始化合约服务')
    }
    
    // 检查合约地址
    for (const [name, address] of Object.entries(contractAddresses.value)) {
      if (!isValidAddress(address)) {
        diagnosis.contractAddresses[name] = '无效'
        diagnosis.issues.push(`${name}合约地址无效`)
      } else {
        diagnosis.contractAddresses[name] = '有效'
      }
    }
    
    addLog(`📊 诊断完成，发现 ${diagnosis.issues.length} 个问题`, 
           diagnosis.issues.length === 0 ? 'success' : 'warning')
    
    if (diagnosis.issues.length > 0) {
      addLog('❌ 发现的问题:', 'error')
      diagnosis.issues.forEach(issue => addLog(`  • ${issue}`, 'error'))
      
      addLog('💡 建议修复方案:', 'info')
      diagnosis.recommendations.forEach(rec => addLog(`  • ${rec}`, 'info'))
    } else {
      addLog('✅ 所有检查通过，系统状态正常', 'success')
    }
    
    return diagnosis
    
  } catch (err) {
    error.value = err.message
    addLog(`❌ 诊断失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 一键修复所有问题
const autoFixAll = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('🚀 开始一键修复所有问题...', 'info')
    
    let fixCount = 0
    
    // 1. 检查并连接钱包
    if (!hasMetaMask.value) {
      addLog('❌ MetaMask未安装，无法自动修复', 'error')
      return
    }
    
    if (!web3Store.isConnected) {
      addLog('步骤1: 连接钱包', 'info')
      await web3Store.connectWallet()
      addLog('✅ 钱包连接成功', 'success')
      fixCount++
    }
    
    // 2. 检查并切换网络
    if (!isCorrectNetwork.value) {
      addLog('步骤2: 切换到Avalanche Fuji网络', 'info')
      try {
        await web3Store.switchToAvalanche()
        addLog('✅ 网络切换成功', 'success')
        fixCount++
      } catch (networkError) {
        addLog('⚠️ 自动网络切换失败，请手动切换', 'warning')
      }
    }
    
    // 3. 强制重新初始化Web3组件
    if (web3Store.isConnected && isCorrectNetwork.value) {
      addLog('步骤3: 重新初始化Web3组件', 'info')
      
      // 强制重新获取provider和signer
      if (window.ethereum) {
        const { ethers } = await import('ethers')
        web3Store.provider = new ethers.providers.Web3Provider(window.ethereum)
        web3Store.signer = web3Store.provider.getSigner()
        addLog('✅ Web3组件重新初始化成功', 'success')
        fixCount++
      }
    }
    
    // 4. 重新初始化合约服务
    if (web3Store.provider && web3Store.signer && !web3Store.contractService) {
      addLog('步骤4: 重新初始化合约服务', 'info')
      const success = await web3Store.initializeContracts()
      if (success) {
        addLog('✅ 合约服务初始化成功', 'success')
        fixCount++
      } else {
        addLog('❌ 合约服务初始化失败', 'error')
      }
    }
    
    // 5. 重新加载数据
    if (web3Store.contractService) {
      addLog('步骤5: 重新加载合约数据', 'info')
      await dataStore.loadTasksFromContract()
      addLog('✅ 数据重新加载完成', 'success')
      fixCount++
    }
    
    addLog(`🎉 修复完成！共修复了 ${fixCount} 个问题`, 'success')
    
  } catch (err) {
    error.value = err.message
    addLog(`❌ 自动修复失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 完全重新初始化
const reinitializeEverything = async () => {
  try {
    loading.value = true
    error.value = ''
    addLog('🔄 开始完全重新初始化...', 'info')
    
    // 1. 清理所有状态
    addLog('步骤1: 清理所有状态', 'info')
    web3Store.disconnectWallet()
    dataStore.resetData()
    addLog('✅ 状态清理完成', 'success')
    
    // 2. 重新连接钱包
    addLog('步骤2: 重新连接钱包', 'info')
    await web3Store.connectWallet()
    addLog('✅ 钱包重新连接成功', 'success')
    
    // 3. 验证网络
    if (!isCorrectNetwork.value) {
      addLog('步骤3: 切换网络', 'info')
      try {
        await web3Store.switchToAvalanche()
        addLog('✅ 网络切换成功', 'success')
      } catch (networkError) {
        addLog('⚠️ 请手动切换到Avalanche Fuji网络', 'warning')
      }
    }
    
    // 4. 重新初始化合约
    addLog('步骤4: 重新初始化合约服务', 'info')
    const success = await web3Store.initializeContracts()
    if (success) {
      addLog('✅ 合约服务重新初始化成功', 'success')
    } else {
      throw new Error('合约服务重新初始化失败')
    }
    
    // 5. 重新初始化数据
    addLog('步骤5: 重新初始化数据', 'info')
    await dataStore.initializeData()
    addLog('✅ 数据重新初始化完成', 'success')
    
    addLog('🎉 完全重新初始化成功！', 'success')
    
  } catch (err) {
    error.value = err.message
    addLog(`❌ 重新初始化失败: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  addLog('合约调试工具已加载', 'info')
})
</script>

<style scoped>
.contract-debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.debug-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.debug-toggle-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.debug-toggle-btn.active {
  background: #1d4ed8;
}

.debug-panel {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 500px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.debug-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.debug-content {
  max-height: 520px;
  overflow-y: auto;
  padding: 0;
}

.debug-section {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.debug-section:last-child {
  border-bottom: none;
}

.debug-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
}

.label {
  color: #6b7280;
  font-weight: 500;
}

.value {
  color: #374151;
  font-family: monospace;
  font-size: 12px;
}

.status.success {
  color: #059669;
  font-weight: 600;
}

.status.error {
  color: #dc2626;
  font-weight: 600;
}

.status.warning {
  color: #d97706;
  font-weight: 600;
}

.source-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.source-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
}

.source-label {
  color: #6b7280;
}

.source-count {
  color: #374151;
  font-weight: 600;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.action-btn.success {
  background: #10b981;
  color: white;
}

.action-btn.success:hover:not(:disabled) {
  background: #059669;
}

.action-btn.info {
  background: #06b6d4;
  color: white;
}

.action-btn.info:hover:not(:disabled) {
  background: #0891b2;
}

.action-btn.warning {
  background: #f59e0b;
  color: white;
}

.action-btn.warning:hover:not(:disabled) {
  background: #d97706;
}

.action-btn.secondary {
  background: #6b7280;
  color: white;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #4b5563;
}

.error-message {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
  word-break: break-word;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f9fafb;
  border-radius: 6px;
  padding: 8px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  margin-bottom: 2px;
}

.log-item.info {
  background: #eff6ff;
  color: #1d4ed8;
}

.log-item.success {
  background: #f0fdf4;
  color: #166534;
}

.log-item.error {
  background: #fef2f2;
  color: #dc2626;
}

.log-time {
  color: #6b7280;
  font-family: monospace;
  flex-shrink: 0;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.config-check {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
}

.config-item .value.valid {
  color: #059669;
  font-weight: 600;
}

.config-item .value.invalid {
  color: #dc2626;
  font-weight: 600;
}

.error-details {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.error-message {
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 12px;
  word-break: break-word;
}

.error-suggestions {
  margin-top: 12px;
}

.error-suggestions h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #6b7280;
}

.error-suggestions li {
  margin-bottom: 4px;
}

.diagnosis-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.diagnosis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
  border-left: 3px solid transparent;
}

.diagnosis-item:has(.status.success) {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.diagnosis-item:has(.status.error) {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.contract-addresses {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 12px;
  gap: 8px;
}

.contract-name {
  color: #6b7280;
  font-weight: 500;
  min-width: 120px;
}

.address-value {
  color: #374151;
  font-family: monospace;
  font-size: 11px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-value.valid {
  color: #059669;
}

.address-value.invalid {
  color: #dc2626;
}

.verify-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #06b6d4;
  color: white;
  min-width: 40px;
}

.verify-btn:hover:not(:disabled) {
  background: #0891b2;
}

.verify-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-monitor {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.monitor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
  border-left: 3px solid #e5e7eb;
}

.monitor-item .value.success {
  color: #059669;
  font-weight: 600;
}

.monitor-item .value.error {
  color: #dc2626;
  font-weight: 600;
}

.monitor-item .value.warning {
  color: #d97706;
  font-weight: 600;
}

.monitor-item .value.info {
  color: #2563eb;
  font-weight: 600;
}

.fix-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.fix-buttons .action-btn {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.fix-buttons .action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.log-item.warning {
  background: #fef3c7;
  color: #92400e;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .debug-panel {
    width: 90vw;
    max-width: 400px;
  }
  
  .diagnosis-grid,
  .contract-addresses,
  .status-monitor,
  .fix-buttons {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style> 