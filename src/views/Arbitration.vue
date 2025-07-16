<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20">
    <!-- 页面头部 -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <div class="flex items-center justify-center mb-6">
            <div class="w-16 h-16 business-gradient rounded-2xl flex items-center justify-center shadow-business">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
          </div>
          <h1 class="text-4xl font-bold mb-4">DAO治理仲裁中心</h1>
          <p class="text-xl text-primary-100 max-w-2xl mx-auto">
            去中心化自治组织治理，公平公正处理争议案例
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 仲裁员状态卡片 -->
      <div class="mb-8">
        <div class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <h2 class="text-2xl font-bold text-neutral-800">仲裁员状态</h2>
              <div v-if="isCheckingStatus" class="flex items-center text-sm text-neutral-500">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                检查中...
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full" :class="arbitratorStatus.isActive ? 'bg-green-500' : 'bg-gray-400'"></div>
              <span class="text-sm font-medium" :class="arbitratorStatus.isActive ? 'text-green-600' : 'text-gray-600'">
                {{ arbitratorStatus.isActive ? '活跃仲裁员' : '非仲裁员' }}
              </span>
            </div>
          </div>

          <div v-if="!arbitratorStatus.isArbitrator" class="text-center py-8">
            <div class="w-20 h-20 bg-gradient-to-r from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-5a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-800 mb-4">成为DAO仲裁员</h3>
            <p class="text-neutral-600 mb-6 max-w-md mx-auto">
              质押 {{ requiredStake }} AVAX 成为DAO治理仲裁员，参与争议案例的公正裁决
            </p>
            <div class="space-y-4">
              <div class="flex items-center justify-center space-x-4">
                <input 
                  v-model="stakeAmount" 
                  type="number" 
                  :min="requiredStake"
                  :placeholder="`最少质押 ${requiredStake} AVAX`"
                  class="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button 
                  @click="stakeToBeArbitrator"
                  :disabled="!canStake"
                  class="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  质押成为仲裁员
                </button>
                <button 
                  @click="debugArbitratorStatus"
                  class="btn-secondary px-4 py-2"
                >
                  调试状态
                </button>
              </div>
              <p class="text-sm text-neutral-500">
                质押资金将被锁定，恶意仲裁将面临资金损失风险
              </p>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-primary-600 mb-2">{{ arbitratorStatus.stakedAmount }}</div>
              <div class="text-sm text-neutral-600">已质押 AVAX</div>
        </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">{{ arbitratorStatus.casesHandled }}</div>
              <div class="text-sm text-neutral-600">处理案例数</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-600 mb-2">{{ arbitratorStatus.reputation }}</div>
              <div class="text-sm text-neutral-600">信誉评分</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 轮播状态 -->
      <div v-if="arbitratorStatus.isArbitrator" class="mb-8">
        <div class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
          <h2 class="text-2xl font-bold text-neutral-800 mb-6">轮播状态</h2>
          
          <div v-if="!isMyTurn" class="text-center py-8">
            <div class="w-20 h-20 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-800 mb-4">暂未轮到当前账户</h3>
            <p class="text-neutral-600 mb-4">请耐心等待轮到您处理仲裁案例</p>
            <div class="text-sm text-neutral-500">
              <p>当前轮播位置: {{ currentRotationPosition }} / {{ totalArbitrators }}</p>
              <p>预计等待时间: {{ estimatedWaitTime }}</p>
          </div>
        </div>

          <div v-else class="text-center py-4">
            <div class="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-green-800 mb-4">轮到您处理仲裁案例</h3>
            <p class="text-green-600">您现在可以处理待仲裁的争议案例</p>
          </div>
        </div>
      </div>

      <!-- 仲裁案例列表 -->
      <div v-if="arbitratorStatus.isArbitrator && isMyTurn" class="mb-8">
        <div class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
          <h2 class="text-2xl font-bold text-neutral-800 mb-6">待仲裁案例</h2>
          
          <div v-if="arbitrationCases.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
            <p class="text-neutral-600">暂无待仲裁案例</p>
                </div>
                
          <div v-else class="space-y-6">
            <div v-for="case_ in arbitrationCases" :key="case_.id" class="border border-neutral-200 rounded-xl p-6">
              <div class="flex items-start justify-between mb-4">
                  <div>
                  <h3 class="text-lg font-semibold text-neutral-800 mb-2">{{ case_.taskTitle }}</h3>
                  <div class="flex items-center space-x-4 text-sm text-neutral-600">
                    <span>案例ID: {{ case_.id }}</span>
                    <span>争议金额: {{ case_.disputeAmount }} AVAX</span>
                    <span>提交时间: {{ formatDate(case_.submittedAt) }}</span>
                  </div>
                </div>
                <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  待仲裁
                </span>
                  </div>

              <div class="mb-4">
                <h4 class="font-medium text-neutral-800 mb-2">争议描述:</h4>
                <p class="text-neutral-600 bg-neutral-50 p-3 rounded-lg">{{ case_.disputeReason }}</p>
                    </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 class="font-medium text-neutral-800 mb-2">雇主观点:</h4>
                  <p class="text-neutral-600 bg-blue-50 p-3 rounded-lg">{{ case_.employerStatement }}</p>
                    </div>
                <div>
                  <h4 class="font-medium text-neutral-800 mb-2">雇佣兵观点:</h4>
                  <p class="text-neutral-600 bg-green-50 p-3 rounded-lg">{{ case_.freelancerStatement }}</p>
                    </div>
                  </div>

              <div class="mb-4">
                <h4 class="font-medium text-neutral-800 mb-2">相关证据:</h4>
                <div class="flex flex-wrap gap-2">
                  <span v-for="evidence in case_.evidence" :key="evidence" class="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg text-sm">
                    {{ evidence }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between pt-4 border-t border-neutral-200">
                <div class="text-sm text-neutral-600">
                  仲裁截止时间: {{ formatDate(case_.deadline) }}
                </div>
                <div class="flex space-x-3">
                  <button
                    @click="openArbitrationModal(case_)"
                    class="btn-primary px-4 py-2 text-sm"
                  >
                    开始仲裁
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 仲裁历史 -->
      <div v-if="arbitratorStatus.isArbitrator" class="mb-8">
        <div class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
          <h2 class="text-2xl font-bold text-neutral-800 mb-6">仲裁历史</h2>
          
          <div v-if="arbitrationHistory.length === 0" class="text-center py-8">
            <p class="text-neutral-600">暂无仲裁历史记录</p>
        </div>

          <div v-else class="space-y-4">
            <div v-for="history in arbitrationHistory" :key="history.id" class="border border-neutral-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-neutral-800">{{ history.taskTitle }}</h3>
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getArbitrationResultClass(history.result)">
                  {{ history.result }}
                </span>
              </div>
              <div class="text-sm text-neutral-600">
                <p>仲裁时间: {{ formatDate(history.arbitratedAt) }}</p>
                <p>获得奖励: {{ history.reward }} AVAX</p>
              </div>
            </div>
          </div>
        </div>
      </div>
          </div>

    <!-- 仲裁模态框 -->
    <div v-if="showArbitrationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeArbitrationModal">
      <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-neutral-800">仲裁案例处理</h2>
          <button @click="closeArbitrationModal" class="text-neutral-500 hover:text-neutral-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
          </button>
                      </div>

        <div v-if="selectedCase" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-neutral-800 mb-2">{{ selectedCase.taskTitle }}</h3>
            <p class="text-neutral-600">{{ selectedCase.disputeReason }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-neutral-200 rounded-lg p-4">
              <h4 class="font-medium text-neutral-800 mb-2">雇主 ({{ formatAddress(selectedCase.employer) }})</h4>
              <p class="text-neutral-600 text-sm">{{ selectedCase.employerStatement }}</p>
        </div>
            <div class="border border-neutral-200 rounded-lg p-4">
              <h4 class="font-medium text-neutral-800 mb-2">雇佣兵 ({{ formatAddress(selectedCase.freelancer) }})</h4>
              <p class="text-neutral-600 text-sm">{{ selectedCase.freelancerStatement }}</p>
      </div>
            </div>
            
            <div>
            <h4 class="font-medium text-neutral-800 mb-3">仲裁决定</h4>
            <div class="space-y-3">
              <label class="flex items-center">
                <input v-model="arbitrationDecision" value="employer" type="radio" class="mr-3">
                <span>支持雇主 - 雇佣兵未完成任务要求</span>
              </label>
                <label class="flex items-center">
                <input v-model="arbitrationDecision" value="freelancer" type="radio" class="mr-3">
                <span>支持雇佣兵 - 任务已按要求完成</span>
                </label>
                <label class="flex items-center">
                <input v-model="arbitrationDecision" value="partial" type="radio" class="mr-3">
                <span>部分支持 - 需要协商解决</span>
                </label>
              </div>
            </div>
            
            <div>
            <h4 class="font-medium text-neutral-800 mb-2">仲裁理由</h4>
              <textarea
              v-model="arbitrationReason"
              placeholder="请详细说明您的仲裁理由..."
              class="w-full h-24 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              ></textarea>
          </div>
          
          <div class="flex justify-end space-x-4 pt-4 border-t border-neutral-200">
            <button @click="closeArbitrationModal" class="px-6 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50">
              取消
            </button>
            <button
              @click="submitArbitration"
              :disabled="!arbitrationDecision || !arbitrationReason.trim()"
              class="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交仲裁结果
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWeb3Store } from '@/stores/web3'
import { useDataStore } from '@/stores/data'

const web3Store = useWeb3Store()
const dataStore = useDataStore()

// 仲裁员状态
const arbitratorStatus = ref({
  isArbitrator: false,
  isActive: false,
  stakedAmount: '0',
  casesHandled: 0,
  reputation: 100
})

// 质押相关
const requiredStake = ref('0.1')
const stakeAmount = ref('')

// 轮播状态
const isMyTurn = ref(false)
const currentRotationPosition = ref(1)
const totalArbitrators = ref(12)
const estimatedWaitTime = ref('2小时30分钟')

// 仲裁案例
const arbitrationCases = ref([
  {
    id: 'ARB-001',
    taskTitle: '智能合约安全审计报告',
    taskId: 4,
    disputeAmount: '20.0',
    disputeReason: '雇主认为审计报告不够详细，缺少关键漏洞分析',
    employer: '0x4567890123456789012345678901234567890123',
    freelancer: '0xauditor1',
    employerStatement: '提交的审计报告过于简单，没有深入分析潜在的重入攻击和溢出漏洞，不符合我们的要求标准。',
    freelancerStatement: '我已经按照合约要求完成了全面的安全审计，报告中包含了所有发现的漏洞和修复建议，完全符合任务要求。',
    evidence: ['audit-report.pdf', 'code-analysis.xlsx', 'test-results.json'],
    submittedAt: '2024-02-21T10:30:00.000Z',
    deadline: '2024-02-28T23:59:59.000Z'
  }
])

// 仲裁历史
const arbitrationHistory = ref([
  {
    id: 'ARB-H-001',
    taskTitle: 'DeFi协议前端开发',
    result: '支持雇佣兵',
    arbitratedAt: '2024-01-20T14:30:00.000Z',
    reward: '0.5'
  },
  {
    id: 'ARB-H-002', 
    taskTitle: 'NFT市场UI设计',
    result: '支持雇主',
    arbitratedAt: '2024-01-15T09:15:00.000Z',
    reward: '0.3'
  }
])

// 仲裁模态框
const showArbitrationModal = ref(false)
const selectedCase = ref(null)
const arbitrationDecision = ref('')
const arbitrationReason = ref('')

// 状态管理
const isCheckingStatus = ref(false)

// 计算属性
const canStake = computed(() => {
  return web3Store.isConnected && 
         parseFloat(stakeAmount.value) >= parseFloat(requiredStake.value) &&
         parseFloat(web3Store.balance) >= parseFloat(stakeAmount.value)
})

// 监听钱包连接状态变化
watch(
  () => [web3Store.isConnected, web3Store.account],
  async ([isConnected, account], [oldIsConnected, oldAccount]) => {
    console.log('👀 钱包状态变化:', { 
      isConnected, 
      account, 
      oldIsConnected, 
      oldAccount 
    })
    
    // 如果钱包刚连接或账户发生变化
    if (isConnected && account && (account !== oldAccount || !oldIsConnected)) {
      console.log('🔄 重新检查仲裁员状态...')
      await checkArbitratorStatus()
    }
    
    // 如果钱包断开连接
    if (!isConnected && oldIsConnected) {
      console.log('📴 钱包断开连接，重置状态')
      resetArbitratorStatus()
    }
  },
  { immediate: false }
)

// 检查仲裁员状态的独立函数
const checkArbitratorStatus = async () => {
  if (!web3Store.isConnected || !web3Store.account || !web3Store.contractService) {
    console.log('⚠️ 钱包未连接或合约服务不可用')
    return
  }
  
  isCheckingStatus.value = true
  
  try {
    console.log('🔍 检查用户仲裁员状态...', web3Store.account)
    
    // 获取最小质押金额
    try {
      const minStake = await web3Store.contractService.getMinStake()
      requiredStake.value = web3Store.contractService.formatEther(minStake)
      console.log('✅ 最小质押金额:', requiredStake.value, 'AVAX')
    } catch (error) {
      console.error('❌ 获取最小质押金额失败:', error)
      requiredStake.value = '0.1'
    }
    
    // 查询仲裁员状态
    const jurorInfo = await web3Store.contractService.getJurorInfo(web3Store.account)
    console.log('👨‍⚖️ 仲裁员信息:', jurorInfo)
    
    if (jurorInfo.isActive && parseFloat(jurorInfo.stakeAmount) > 0) {
      // 用户是活跃的仲裁员
      arbitratorStatus.value = {
        isArbitrator: true,
        isActive: true,
        stakedAmount: jurorInfo.stakeAmount,
        casesHandled: arbitrationHistory.value.length,
        reputation: 100
      }
      
      console.log('✅ 用户是活跃仲裁员')
      
      // 检查轮播状态
      setTimeout(() => {
        isMyTurn.value = Math.random() > 0.5
        console.log('🎯 轮播状态:', isMyTurn.value ? '轮到用户' : '等待轮播')
      }, 1000)
      
      // 加载仲裁员数据
      await loadArbitratorData()
      
    } else {
      // 用户不是仲裁员
      arbitratorStatus.value = {
        isArbitrator: false,
        isActive: false,
        stakedAmount: '0',
        casesHandled: 0,
        reputation: 100
      }
      
      isMyTurn.value = false
      console.log('ℹ️ 用户不是仲裁员')
    }
    
  } catch (error) {
    console.error('❌ 检查仲裁员状态失败:', error)
    resetArbitratorStatus()
  } finally {
    isCheckingStatus.value = false
  }
}

// 重置仲裁员状态
const resetArbitratorStatus = () => {
  arbitratorStatus.value = {
    isArbitrator: false,
    isActive: false,
    stakedAmount: '0',
    casesHandled: 0,
    reputation: 100
  }
  isMyTurn.value = false
  requiredStake.value = '0.1'
  console.log('🔄 仲裁员状态已重置')
}

// 方法
const stakeToBeArbitrator = async () => {
  if (!canStake.value) {
    let errorMsg = '无法质押：'
    if (!web3Store.isConnected) {
      errorMsg += '请先连接钱包'
    } else if (parseFloat(stakeAmount.value) < parseFloat(requiredStake.value)) {
      errorMsg += `质押金额不足，最少需要 ${requiredStake.value} AVAX`
    } else if (parseFloat(web3Store.balance) < parseFloat(stakeAmount.value)) {
      errorMsg += `余额不足，当前余额 ${web3Store.balance} AVAX`
    }
    alert(errorMsg)
    return
  }
  
  try {
    console.log('开始质押成为仲裁员:', stakeAmount.value)
    
    // 调用智能合约进行质押
    if (web3Store.contractService) {
      // 显示加载状态
      const loadingMsg = `正在质押 ${stakeAmount.value} AVAX 成为仲裁员...`
      console.log(loadingMsg)
      
      const result = await web3Store.contractService.becomeArbitrator(stakeAmount.value)
      console.log('质押交易结果:', result)
      
      if (result.success) {
        alert(`质押成功！您已成为DAO仲裁员\n交易哈希: ${result.txHash}`)
        
        // 清空输入框
        stakeAmount.value = ''
        
        // 重新检查仲裁员状态
        console.log('🔄 质押成功，重新检查仲裁员状态...')
        await checkArbitratorStatus()
        
      } else {
        throw new Error('交易失败')
      }
    } else {
      throw new Error('合约服务未初始化，请刷新页面重试')
    }
  } catch (error) {
    console.error('质押失败:', error)
    
    let userFriendlyMessage = '质押失败'
    if (error.message.includes('质押金额不足')) {
      userFriendlyMessage = error.message
    } else if (error.message.includes('已经是活跃的仲裁员')) {
      userFriendlyMessage = '您已经是仲裁员了'
    } else if (error.message.includes('余额不足')) {
      userFriendlyMessage = error.message
    } else if (error.message.includes('用户拒绝')) {
      userFriendlyMessage = '交易被用户取消'
    } else if (error.message.includes('insufficient funds')) {
      userFriendlyMessage = '账户余额不足以支付交易费用'
    } else if (error.message.includes('合约服务未初始化')) {
      userFriendlyMessage = error.message
    } else {
      userFriendlyMessage = `质押失败: ${error.message}`
    }
    
    alert(userFriendlyMessage)
  }
}

const openArbitrationModal = (case_) => {
  selectedCase.value = case_
  showArbitrationModal.value = true
  arbitrationDecision.value = ''
  arbitrationReason.value = ''
}

const closeArbitrationModal = () => {
  showArbitrationModal.value = false
  selectedCase.value = null
  arbitrationDecision.value = ''
  arbitrationReason.value = ''
}

const submitArbitration = async () => {
  if (!arbitrationDecision.value || !arbitrationReason.value.trim()) return

  try {
    // 这里应该调用智能合约提交仲裁结果
    console.log('提交仲裁结果:', {
      caseId: selectedCase.value.id,
      decision: arbitrationDecision.value,
      reason: arbitrationReason.value
    })
    
    // 从待仲裁列表中移除
    const index = arbitrationCases.value.findIndex(c => c.id === selectedCase.value.id)
    if (index > -1) {
      arbitrationCases.value.splice(index, 1)
    }
    
    // 添加到历史记录
    arbitrationHistory.value.unshift({
      id: `ARB-H-${Date.now()}`,
      taskTitle: selectedCase.value.taskTitle,
      result: arbitrationDecision.value === 'employer' ? '支持雇主' : 
              arbitrationDecision.value === 'freelancer' ? '支持雇佣兵' : '部分支持',
      arbitratedAt: new Date().toISOString(),
      reward: '0.5'
    })
    
    // 更新统计
    arbitratorStatus.value.casesHandled++
    
    closeArbitrationModal()
    alert('仲裁结果已提交！')
  } catch (error) {
    console.error('提交仲裁失败:', error)
    alert('提交失败: ' + error.message)
  }
}

const getArbitrationResultClass = (result) => {
  const classes = {
    '支持雇主': 'bg-blue-100 text-blue-800',
    '支持雇佣兵': 'bg-green-100 text-green-800',
    '部分支持': 'bg-yellow-100 text-yellow-800'
  }
  return classes[result] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 加载仲裁员相关数据
const loadArbitratorData = async () => {
  try {
    console.log('📊 开始加载仲裁员数据...')
    
    // TODO: 从智能合约获取真实的仲裁案例数据
    // 这里先使用模拟数据，后续需要实现真正的合约调用
    
    // 1. 加载待仲裁案例
    // const pendingCases = await web3Store.contractService.getPendingArbitrationCases()
    // arbitrationCases.value = pendingCases
    
    // 2. 加载仲裁历史
    // const history = await web3Store.contractService.getArbitrationHistory(web3Store.account)
    // arbitrationHistory.value = history
    
    // 3. 更新统计信息
    // arbitratorStatus.value.casesHandled = history.length
    
    console.log('✅ 仲裁员数据加载完成')
    console.log('- 待仲裁案例数:', arbitrationCases.value.length)
    console.log('- 历史仲裁数:', arbitrationHistory.value.length)
    
  } catch (error) {
    console.error('❌ 加载仲裁员数据失败:', error)
  }
}

const debugArbitratorStatus = async () => {
  if (!web3Store.isConnected) {
    alert('请先连接钱包')
    return
  }
  
  try {
    console.log('🔍 开始调试仲裁员状态...')
    
    if (web3Store.contractService && web3Store.contractService.debugArbitratorStatus) {
      const debugInfo = await web3Store.contractService.debugArbitratorStatus(web3Store.account)
      
      const message = `
调试信息：
===================
合约存在: ${debugInfo.contractExists ? '✅' : '❌'}
最小质押金额: ${debugInfo.minStake} AVAX
用户余额: ${debugInfo.userBalance} AVAX
仲裁员总数: ${debugInfo.totalJurors}

用户状态:
- 已质押金额: ${debugInfo.userInfo.stakeAmount} AVAX
- 是否活跃: ${debugInfo.userInfo.isActive ? '✅ 是' : '❌ 否'}
- 最后争议ID: ${debugInfo.userInfo.lastDisputeId}

诊断结果:
${debugInfo.userInfo.isActive ? '⚠️ 用户已经是活跃仲裁员，无法重复质押' : '✅ 用户可以质押成为仲裁员'}
      `.trim()
      
      alert(message)
      console.log('📊 调试信息:', debugInfo)
    } else {
      alert('调试功能不可用，请检查合约服务')
    }
  } catch (error) {
    console.error('调试失败:', error)
    alert(`调试失败: ${error.message}`)
  }
}

// 初始化
onMounted(async () => {
  console.log('🚀 仲裁页面初始化...')
  
  // 检查用户仲裁员状态
  if (web3Store.isConnected && web3Store.account) {
    console.log('👤 已连接钱包，开始检查仲裁员状态')
    await checkArbitratorStatus()
  } else {
    console.log('⚠️ 钱包未连接，使用默认配置')
    requiredStake.value = '0.1'
  }
  
  console.log('✅ 页面初始化完成')
})
</script> 