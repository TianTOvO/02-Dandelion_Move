<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20">
    <!-- 导航栏 -->
    <nav class="glass-effect border-b border-neutral-200/50 sticky top-0 z-50 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <div class="flex items-center space-x-4">
            <router-link to="/" class="flex items-center space-x-3 group">
              <div class="w-12 h-12 business-gradient rounded-xl flex items-center justify-center shadow-business group-hover:shadow-business-lg transition-all duration-300 group-hover:scale-105">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                Dandelion
              </span>
            </router-link>
          </div>

          <!-- 导航菜单 -->
          <div class="hidden md:flex items-center space-x-1">
            <router-link 
              to="/" 
              class="nav-link px-4 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium relative overflow-hidden group"
            >
              <span class="relative z-10">首页</span>
              <div class="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </router-link>
            <router-link 
              to="/tasks" 
              class="nav-link px-4 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium relative overflow-hidden group"
            >
              <span class="relative z-10">任务大厅</span>
              <div class="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </router-link>
            <router-link 
              to="/create-task" 
              class="nav-link px-4 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium relative overflow-hidden group"
            >
              <span class="relative z-10">发布任务</span>
              <div class="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </router-link>
            <router-link 
              to="/arbitration" 
              class="nav-link px-4 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium relative overflow-hidden group"
            >
              <span class="relative z-10">仲裁中心</span>
              <div class="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </router-link>
            <router-link 
              to="/profile" 
              class="nav-link px-4 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium relative overflow-hidden group"
            >
              <span class="relative z-10">个人中心</span>
              <div class="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </router-link>
          </div>

          <!-- 钱包连接和用户信息 -->
          <div class="flex items-center space-x-4">
            <!-- 余额显示 -->
            <div v-if="web3Store.isConnected" class="hidden sm:flex items-center space-x-3">
              <div class="bg-gradient-to-r from-secondary-100 to-secondary-50 px-4 py-2 rounded-xl border border-secondary-200/50">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 gold-gradient rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                  <span class="font-semibold text-secondary-800">
                    {{ formatBalance(web3Store.balance) }} AVAX
                  </span>
                </div>
              </div>
            </div>

            <!-- 钱包按钮 -->
            <button
              v-if="!web3Store.isConnected"
              @click="connectWallet"
              class="btn-primary px-6 py-2.5 text-sm shadow-business hover:shadow-business-lg"
            >
              <span class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span>连接钱包</span>
              </span>
            </button>
            
            <!-- 已连接状态 -->
            <div v-else class="flex items-center space-x-3">
              <div class="relative group">
                <button class="flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 px-4 py-2.5 rounded-xl border border-primary-200/50 transition-all duration-300 shadow-sm hover:shadow-business">
                  <div class="w-8 h-8 business-gradient rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div class="text-left">
                    <div class="text-sm font-semibold text-neutral-800">
                      {{ formatAddress(web3Store.account) }}
                    </div>
                    <div class="text-xs text-neutral-600">已连接</div>
                  </div>
                  <svg class="w-4 h-4 text-neutral-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                
                <!-- 下拉菜单 -->
                <div class="absolute right-0 mt-2 w-56 glass-effect rounded-xl shadow-business-lg border border-neutral-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div class="p-3">
                    <div class="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 mb-2">
                      <div class="w-10 h-10 business-gradient rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
  <div>
                        <div class="font-semibold text-neutral-800 text-sm">
                          {{ formatAddress(web3Store.account) }}
                        </div>
                        <div class="text-xs text-neutral-600">钱包地址</div>
                      </div>
                    </div>
                    <button
                      @click="disconnectWallet"
                      class="w-full flex items-center space-x-2 px-3 py-2 text-left text-error-600 hover:bg-error-50 rounded-lg transition-colors duration-200"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span class="font-medium">断开连接</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 移动端菜单按钮 -->
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 移动端菜单 -->
        <div 
          v-show="mobileMenuOpen" 
          class="md:hidden py-4 border-t border-neutral-200/50 animate-slide-down"
        >
          <div class="flex flex-col space-y-2">
            <router-link 
              to="/" 
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium"
            >
              首页
            </router-link>
            <router-link 
              to="/tasks" 
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium"
            >
              任务大厅
            </router-link>
            <router-link 
              to="/create-task" 
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium"
            >
              发布任务
            </router-link>
            <router-link 
              to="/arbitration" 
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium"
            >
              仲裁中心
            </router-link>
            <router-link 
              to="/profile" 
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 transition-all duration-300 font-medium"
            >
              个人中心
            </router-link>
            
            <!-- 移动端余额显示 -->
            <div v-if="web3Store.isConnected" class="px-4 py-3 bg-gradient-to-r from-secondary-100 to-secondary-50 rounded-xl border border-secondary-200/50 mx-4 mt-4">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 gold-gradient rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <span class="font-semibold text-secondary-800">
                  余额: {{ formatBalance(web3Store.balance) }} AVAX
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 错误提示 -->
    <div v-if="web3Store.error" class="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded-r-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ web3Store.error }}</p>
        </div>
        <div class="ml-auto">
          <button @click="web3Store.error = null" class="text-red-400 hover:text-red-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="flex-1">
      <router-view class="animate-fade-in"/>
    </main>

    <!-- 页脚 -->
    <footer class="bg-gradient-to-r from-neutral-900 via-primary-900 to-neutral-900 text-white relative overflow-hidden dark-section">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-transparent"></div>
      <div class="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center shadow-gold">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="text-2xl font-bold text-on-dark-bright">Dandelion</span>
            </div>
            <p class="text-on-dark-secondary mb-6 leading-relaxed max-w-md">
              去中心化任务悬赏平台，通过区块链技术重构信任体系，让每一份价值创造都得到可靠的保障。
            </p>
            <div class="flex space-x-4">
              <a href="#" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-6 text-on-dark-bright">产品</h3>
            <ul class="space-y-3">
              <li><router-link to="/tasks" class="text-on-dark-muted hover:text-on-dark-bright transition-colors">任务大厅</router-link></li>
              <li><router-link to="/create-task" class="text-on-dark-muted hover:text-on-dark-bright transition-colors">发布任务</router-link></li>
              <li><router-link to="/arbitration" class="text-on-dark-muted hover:text-on-dark-bright transition-colors">仲裁中心</router-link></li>
              <li><router-link to="/profile" class="text-on-dark-muted hover:text-on-dark-bright transition-colors">个人中心</router-link></li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-6 text-on-dark-bright">支持</h3>
            <ul class="space-y-3">
              <li><a href="#" class="text-on-dark-muted hover:text-on-dark-bright transition-colors">帮助中心</a></li>
              <li><a href="#" class="text-on-dark-muted hover:text-on-dark-bright transition-colors">社区论坛</a></li>
              <li><a href="#" class="text-on-dark-muted hover:text-on-dark-bright transition-colors">开发者文档</a></li>
              <li><a href="#" class="text-on-dark-muted hover:text-on-dark-bright transition-colors">联系我们</a></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-on-dark-muted text-sm">
            © 2024 Dandelion. 基于 Avalanche 网络构建
          </p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a href="#" class="text-on-dark-muted hover:text-on-dark-bright text-sm transition-colors">隐私政策</a>
            <a href="#" class="text-on-dark-muted hover:text-on-dark-bright text-sm transition-colors">服务条款</a>
            <a href="#" class="text-on-dark-muted hover:text-on-dark-bright text-sm transition-colors">Cookie 政策</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWeb3Store } from '@/stores/web3'
import { useIpfsStore } from '@/stores/ipfs'
import { useDataStore } from '@/stores/data'

const web3Store = useWeb3Store()
const ipfsStore = useIpfsStore()
const dataStore = useDataStore()

// 添加移动端菜单状态
const mobileMenuOpen = ref(false)

// 格式化地址显示
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 格式化余额显示
const formatBalance = (balance) => {
  if (!balance || balance === '0') return '0.00'
  const num = parseFloat(balance)
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  } else if (num >= 1) {
    return num.toFixed(2)
  } else {
    return num.toFixed(4)
  }
}

// 连接钱包
const connectWallet = async () => {
  await web3Store.connectWallet()
}

// 断开钱包连接
const disconnectWallet = async () => {
  await web3Store.disconnectWallet()
  mobileMenuOpen.value = false // 断开连接时关闭移动端菜单
}

onMounted(async () => {
  // 初始化IPFS
  await ipfsStore.initIPFS()
  
  // 初始化数据 - 从IPFS加载数据
  await dataStore.initializeData()
  
  // 尝试自动连接钱包（如果之前已连接）
  if (window.ethereum && window.ethereum.selectedAddress) {
    await web3Store.connectWallet()
  }
})
</script> 