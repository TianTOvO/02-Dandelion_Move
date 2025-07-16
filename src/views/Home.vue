<template>
  <div class="home">
    <!-- 英雄区域 -->
    <section class="hero relative overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
      <div class="absolute inset-0 bg-hero-pattern opacity-30"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-primary-900/10 via-transparent to-secondary-900/10"></div>
      
      <!-- 浮动装饰元素 -->
      <div class="absolute top-20 left-20 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-20 right-20 w-40 h-40 bg-secondary-200/20 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl md:text-7xl font-bold text-neutral-900 mb-8 animate-fade-in-up">
            去中心化任务悬赏平台
            <span class="block gradient-text-animated mt-4">重构信任体系</span>
          </h1>
          <p class="text-xl md:text-2xl text-neutral-600 mb-12 max-w-4xl mx-auto animate-fade-in-up" style="animation-delay: 0.2s;">
            通过区块链技术实现透明、高效、低成本的全球任务协作，
            让每一份价值创造都得到可靠的信任背书
          </p>
          <div class="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style="animation-delay: 0.4s;">
            <router-link to="/tasks" class="btn-primary text-lg px-10 py-4 shadow-business-lg">
              <span class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                探索任务
              </span>
            </router-link>
            <router-link to="/create-task" class="btn-secondary text-lg px-10 py-4 shadow-gold-lg">
              <span class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                发布任务
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="py-20 bg-white relative">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="text-center card-business rounded-2xl p-8 animate-fade-in-up" style="animation-delay: 0.1s;">
            <div class="text-4xl font-bold gradient-text mb-3">{{ stats.totalTasks }}</div>
            <div class="text-neutral-600 font-medium">总任务数</div>
            <div class="w-12 h-1 bg-primary-gradient rounded-full mx-auto mt-3"></div>
          </div>
          <div class="text-center card-business rounded-2xl p-8 animate-fade-in-up" style="animation-delay: 0.2s;">
            <div class="text-4xl font-bold gold-text mb-3">{{ stats.activeTasks }}</div>
            <div class="text-neutral-600 font-medium">进行中任务</div>
            <div class="w-12 h-1 bg-gold-gradient rounded-full mx-auto mt-3"></div>
          </div>
          <div class="text-center card-business rounded-2xl p-8 animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="text-4xl font-bold text-success-600 mb-3">{{ stats.completedTasks }}</div>
            <div class="text-neutral-600 font-medium">已完成任务</div>
            <div class="w-12 h-1 bg-gradient-to-r from-success-500 to-success-600 rounded-full mx-auto mt-3"></div>
          </div>
          <div class="text-center card-business rounded-2xl p-8 animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="text-4xl font-bold text-warning-600 mb-3">{{ stats.totalRewards }}</div>
            <div class="text-neutral-600 font-medium">总奖金池 (AVAX)</div>
            <div class="w-12 h-1 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full mx-auto mt-3"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色功能 -->
    <section class="py-24 bg-gradient-to-br from-neutral-50 to-primary-50/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20 animate-fade-in-up">
          <h2 class="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            平台特色
          </h2>
          <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
            基于区块链的创新解决方案，重新定义任务协作的未来
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card-business rounded-2xl p-8 card-hover animate-fade-in-up delay-300">
            <div class="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-neutral-900 mb-4">智能合约</h3>
            <p class="text-neutral-600 leading-relaxed">
              基于 Avalanche 网络的智能合约确保任务执行的透明性和资金安全，无需第三方担保
            </p>
          </div>

          <div class="card-business rounded-2xl p-8 card-hover animate-fade-in-up delay-400">
            <div class="w-16 h-16 bg-gradient-to-br from-info-500 to-info-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-neutral-900 mb-4">IPFS 存储</h3>
            <p class="text-neutral-600 leading-relaxed">
              任务文档、成果等数据存储在分布式网络中，确保数据永久保存和可访问性
            </p>
          </div>

          <div class="card-business rounded-2xl p-8 card-hover animate-fade-in-up delay-500">
            <div class="w-16 h-16 bg-gradient-to-br from-error-500 to-error-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-neutral-900 mb-4">全球协作</h3>
            <p class="text-neutral-600 leading-relaxed">
              基于 Avalanche 网络的跨链技术，打破地域限制，构建无边界任务协作网络
            </p>
          </div>

          <div class="card-business rounded-2xl p-8 card-hover animate-fade-in-up delay-600">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-neutral-900 mb-4">信用体系</h3>
            <p class="text-neutral-600 leading-relaxed">
              基于链上数据的去中心化信用档案，形成可移植的信誉体系，让优质服务者脱颖而出
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 任务类型 -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20 animate-fade-in-up">
          <h2 class="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            支持的任务类型
          </h2>
          <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
            覆盖多个领域的专业任务，满足不同行业的协作需求
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200/50 card-hover animate-fade-in-up delay-100">
            <div class="w-14 h-14 business-gradient rounded-xl flex items-center justify-center mb-6 shadow-business">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Web3 开发</h3>
            <p class="text-neutral-600">智能合约开发、DApp 构建、区块链集成</p>
          </div>

          <div class="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-8 border border-secondary-200/50 card-hover animate-fade-in-up delay-200">
            <div class="w-14 h-14 gold-gradient rounded-xl flex items-center justify-center mb-6 shadow-gold">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">UI/UX 设计</h3>
            <p class="text-neutral-600">界面设计、用户体验优化、原型制作</p>
          </div>

          <div class="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-8 border border-success-200/50 card-hover animate-fade-in-up delay-300">
            <div class="w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">数据分析</h3>
            <p class="text-neutral-600">数据挖掘、可视化分析、报告生成</p>
          </div>

          <div class="bg-gradient-to-br from-warning-50 to-warning-100 rounded-2xl p-8 border border-warning-200/50 card-hover animate-fade-in-up delay-400">
            <div class="w-14 h-14 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">内容创作</h3>
            <p class="text-neutral-600">文案撰写、视频制作、图形设计</p>
          </div>

          <div class="bg-gradient-to-br from-error-50 to-error-100 rounded-2xl p-8 border border-error-200/50 card-hover animate-fade-in-up delay-500">
            <div class="w-14 h-14 bg-gradient-to-br from-error-500 to-error-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">市场推广</h3>
            <p class="text-neutral-600">营销策划、社交媒体运营、品牌推广</p>
          </div>

          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200/50 card-hover animate-fade-in-up delay-600">
            <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">其他</h3>
            <p class="text-neutral-600">咨询服务、翻译、研究调研等</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="py-24 business-gradient text-white relative overflow-hidden dark-section">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-transparent"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-8 text-on-dark-bright animate-fade-in-up">
          准备开始了吗？
        </h2>
        <p class="text-xl mb-12 text-on-dark-secondary max-w-2xl mx-auto animate-fade-in-up" style="animation-delay: 0.2s;">
          加入 Dandelion 社区，体验去中心化任务协作的新时代，共同构建更加公平透明的数字经济
        </p>
        <div class="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-400">
          <button 
            v-if="!web3Store.isConnected"
            @click="connectWallet"
            class="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-on-dark-bright hover:bg-white hover:text-primary-700 font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              连接钱包开始
            </span>
          </button>
          <router-link 
            v-else
            to="/tasks" 
            class="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-on-dark-bright hover:bg-white hover:text-primary-700 font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              浏览任务
            </span>
          </router-link>
          <router-link 
            to="/create-task" 
            class="bg-secondary-500 hover:bg-secondary-600 text-on-dark-bright font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              发布任务
            </span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 调试信息面板 -->
    <div v-if="showDebugPanel" class="debug-panel">
      <div class="debug-header">
        <h4>🔧 调试信息面板</h4>
        <button @click="showDebugPanel = false" class="close-btn">×</button>
      </div>
      
      <div class="debug-content">
        <div class="debug-section">
          <h5>💰 钱包状态</h5>
          <div class="status-item">
            <span class="label">连接状态:</span>
            <span :class="web3Store.isConnected ? 'status-success' : 'status-error'">
              {{ web3Store.isConnected ? '已连接' : '未连接' }}
            </span>
          </div>
          <div v-if="web3Store.isConnected" class="status-item">
            <span class="label">账户地址:</span>
            <span class="value">{{ web3Store.formattedAccount }}</span>
          </div>
          <div v-if="web3Store.isConnected" class="status-item">
            <span class="label">账户余额:</span>
            <span class="value">{{ web3Store.formattedBalance }}</span>
          </div>
          <div v-if="web3Store.isConnected" class="status-item">
            <span class="label">网络状态:</span>
            <span :class="web3Store.isCorrectNetwork ? 'status-success' : 'status-warning'">
              {{ web3Store.isCorrectNetwork ? 'Avalanche Fuji' : '错误网络' }}
            </span>
          </div>
        </div>

        <div class="debug-section">
          <h5>🔗 合约状态</h5>
          <div class="status-item">
            <span class="label">合约服务:</span>
            <span :class="web3Store.contractService ? 'status-success' : 'status-error'">
              {{ web3Store.contractService ? '已初始化' : '未初始化' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">配置验证:</span>
            <span :class="web3Store.contractConfigValid ? 'status-success' : 'status-error'">
              {{ web3Store.contractConfigValid ? '有效' : '无效' }}
            </span>
          </div>
          <div v-if="!web3Store.contractConfigValid && web3Store.configErrors.length > 0" class="status-item">
            <span class="label">配置错误:</span>
            <ul class="error-list">
              <li v-for="error in web3Store.configErrors" :key="error" class="error-item">{{ error }}</li>
            </ul>
          </div>
        </div>

        <div class="debug-section">
          <h5>👂 事件监听器</h5>
          <div class="status-item">
            <span class="label">监听状态:</span>
            <span :class="web3Store.eventListenersActive ? 'status-success' : 'status-warning'">
              {{ web3Store.eventListenersActive ? '已激活' : '未激活（手动刷新模式）' }}
            </span>
          </div>
          <div v-if="!web3Store.eventListenersActive" class="status-item">
            <span class="label">说明:</span>
            <span class="value">由于ethers.js兼容性问题，事件监听功能已禁用。请手动刷新页面获取最新数据。</span>
          </div>
        </div>

        <div class="debug-section">
          <h5>🛠️ 操作工具</h5>
          <div class="debug-actions">
            <button @click="refreshWalletInfo" class="debug-btn">刷新钱包信息</button>
            <button @click="testContractConnection" class="debug-btn">测试合约连接</button>
            <button @click="clearError" class="debug-btn">清除错误</button>
            <button @click="showContractInfo" class="debug-btn">显示合约信息</button>
          </div>
        </div>

        <div v-if="web3Store.error" class="debug-section">
          <h5>❌ 错误信息</h5>
          <div class="error-message">{{ web3Store.error }}</div>
        </div>
      </div>
    </div>

    <!-- 调试面板切换按钮 -->
    <button v-if="!showDebugPanel" @click="showDebugPanel = true" class="debug-toggle">
      🔧 调试
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeb3Store } from '@/stores/web3'
import { useDataStore } from '@/stores/data'

const web3Store = useWeb3Store()
const dataStore = useDataStore()

// 从dataStore获取统计数据
const stats = computed(() => dataStore.stats)

const showDebugPanel = ref(false)

onMounted(async () => {
  // 数据已经在App.vue中初始化，这里无需额外加载
  // 如果需要刷新数据，可以调用 dataStore.initializeData()
})

const connectWallet = async () => {
  try {
    console.log('🔗 开始连接钱包...')
    
    // 检查MetaMask是否安装
    if (!window.ethereum) {
      throw new Error('请安装MetaMask钱包')
    }
    
    console.log('✅ MetaMask已检测到')
    
    // 连接钱包
    await web3Store.connectWallet()
    
    console.log('✅ 钱包连接成功')
    
    // 显示成功消息
    showNotification('钱包连接成功！', 'success')
    
  } catch (error) {
    console.error('❌ 连接钱包失败:', error)
    
    // 显示用户友好的错误消息
    let errorMessage = '连接钱包失败'
    
    if (error.message.includes('User rejected')) {
      errorMessage = '用户拒绝了连接请求'
    } else if (error.message.includes('MetaMask')) {
      errorMessage = '请安装MetaMask钱包'
    } else if (error.message.includes('network')) {
      errorMessage = '网络连接失败，请检查网络设置'
    } else if (error.message.includes('_network')) {
      errorMessage = '钱包初始化失败，请刷新页面重试'
    } else {
      errorMessage = error.message || '未知错误'
    }
    
    showNotification(errorMessage, 'error')
  }
}

// 调试工具方法
const refreshWalletInfo = async () => {
  try {
    if (web3Store.isConnected) {
      await web3Store.updateBalance()
      showNotification('钱包信息已刷新', 'success')
    } else {
      showNotification('请先连接钱包', 'warning')
    }
  } catch (error) {
    console.error('刷新钱包信息失败:', error)
    showNotification('刷新失败: ' + error.message, 'error')
  }
}

const testContractConnection = async () => {
  try {
    if (!web3Store.contractService) {
      showNotification('合约服务未初始化', 'warning')
      return
    }
    
    // 尝试获取平台费用信息作为连接测试
    await web3Store.loadPlatformFeeInfo()
    showNotification('合约连接正常', 'success')
  } catch (error) {
    console.error('合约连接测试失败:', error)
    showNotification('合约连接失败: ' + error.message, 'error')
  }
}

const clearError = () => {
  web3Store.clearError()
  showNotification('错误已清除', 'success')
}

const showContractInfo = () => {
  const info = web3Store.getContractInfo()
  console.log('📋 合约配置信息:', info)
  showNotification('合约信息已输出到控制台', 'info')
}
</script>

<style scoped>
.bg-grid-pattern {
  background-image: radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 调试面板样式 */
.debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  overflow-y: auto;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
}

.debug-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1a202c;
}

.debug-content {
  padding: 16px;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section:last-child {
  margin-bottom: 0;
}

.debug-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 4px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 13px;
}

.status-item .label {
  font-weight: 500;
  color: #6b7280;
  min-width: 80px;
}

.status-item .value {
  color: #374151;
  word-break: break-all;
  text-align: right;
  flex: 1;
  margin-left: 8px;
}

.status-success {
  color: #059669;
  font-weight: 500;
}

.status-error {
  color: #dc2626;
  font-weight: 500;
}

.status-warning {
  color: #d97706;
  font-weight: 500;
}

.error-list {
  margin: 0;
  padding-left: 16px;
  color: #dc2626;
  font-size: 12px;
}

.error-item {
  margin-bottom: 4px;
}

.debug-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.debug-btn {
  padding: 8px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.debug-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  word-break: break-word;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  z-index: 999;
}

.debug-toggle:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .debug-panel {
    position: fixed;
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-height: 70vh;
  }
  
  .debug-toggle {
    bottom: 10px;
    right: 10px;
  }
}
</style> 