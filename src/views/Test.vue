<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h1 class="text-3xl font-bold text-white mb-8 text-center">
          🧪 系统功能测试
        </h1>

        <!-- Web3测试 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-white mb-4">🔗 Web3钱包测试</h2>
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <span class="font-medium">MetaMask状态:</span>
                <span :class="hasMetaMask ? 'text-green-600' : 'text-red-600'">
                  {{ hasMetaMask ? '✅ 已安装' : '❌ 未安装' }}
                </span>
              </div>

              <div class="flex items-center space-x-2">
                <span class="font-medium">连接状态:</span>
                <span :class="web3Store.isConnected ? 'text-green-600' : 'text-gray-600'">
                  {{ web3Store.isConnected ? '✅ 已连接' : '⭕ 未连接' }}
                </span>
              </div>

              <div v-if="web3Store.account" class="text-sm text-gray-600">
                <span class="font-medium">账户地址:</span> {{ web3Store.account }}
              </div>

              <div v-if="web3Store.balance" class="text-sm text-gray-600">
                <span class="font-medium">余额:</span> {{ web3Store.balance }} AVAX
              </div>

              <div class="flex space-x-4">
                <button 
                  @click="testWalletConnection"
                  :disabled="web3Store.loading"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ web3Store.loading ? '连接中...' : '测试钱包连接' }}
                </button>

                <button 
                  @click="runDetailedWeb3Test"
                  :disabled="web3TestLoading"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ web3TestLoading ? '诊断中...' : '详细诊断' }}
                </button>

                <button 
                  v-if="web3Store.isConnected"
                  @click="disconnectWallet"
                  class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  断开连接
                </button>
              </div>

              <!-- 详细测试结果 -->
              <div v-if="web3TestResult" class="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 class="text-sm font-medium text-gray-800 mb-2">🔍 详细诊断结果</h4>
                <pre class="text-xs text-gray-700 bg-white p-2 rounded overflow-auto max-h-40">{{ web3TestResult }}</pre>
              </div>

              <!-- 改进的错误显示 -->
              <div v-if="walletError" class="bg-red-50 border border-red-200 rounded-md p-4">
                <div class="flex">
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">钱包连接错误</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>{{ walletError }}</p>
                      <div class="mt-2 text-xs text-red-600">
                        <p><strong>解决建议:</strong></p>
                        <ul class="list-disc list-inside mt-1">
                          <li v-if="walletError.includes('待处理')">请在MetaMask中处理待处理的请求，或等待几秒后重试</li>
                          <li v-if="walletError.includes('拒绝')">请在MetaMask中点击"连接"按钮</li>
                          <li v-if="walletError.includes('未安装')">请安装MetaMask浏览器扩展</li>
                          <li>刷新页面后重试</li>
                          <li>检查MetaMask是否已解锁</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- IPFS测试 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-white mb-4">🌐 IPFS连接测试</h2>
          <div class="bg-black/20 rounded-lg p-4 mb-4">
            <div class="flex flex-wrap gap-4 mb-4">
              <button
                @click="testIPFSConnection"
                :disabled="ipfsLoading"
                class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {{ ipfsLoading ? '测试中...' : '测试IPFS连接' }}
              </button>
              <button
                @click="testIPFSUpload"
                :disabled="ipfsLoading"
                class="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                测试文件上传
              </button>
            </div>
            <div v-if="ipfsResult" class="text-sm">
              <div class="text-green-400 mb-2">✅ IPFS测试结果:</div>
              <pre class="text-white bg-black/30 p-3 rounded text-xs overflow-auto">{{ ipfsResult }}</pre>
            </div>
            <div v-if="ipfsError" class="text-red-400 text-sm">
              ❌ {{ ipfsError }}
            </div>
          </div>
        </div>

        <!-- 系统状态 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-white mb-4">📊 系统状态</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-black/20 rounded-lg p-4">
              <div class="text-sm text-gray-300 mb-2">浏览器环境</div>
              <div class="text-white">
                <div>User Agent: {{ navigator.userAgent.substring(0, 50) }}...</div>
                <div>是否支持Web3: {{ !!window.ethereum ? '✅' : '❌' }}</div>
                <div>当前URL: {{ window.location.href }}</div>
              </div>
            </div>
            <div class="bg-black/20 rounded-lg p-4">
              <div class="text-sm text-gray-300 mb-2">依赖版本</div>
              <div class="text-white text-sm">
                <div>Vue: {{ vueVersion }}</div>
                <div>Ethers: 5.7.2</div>
                <div>IPFS Client: 60.0.1</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据初始化测试 -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">📊 数据初始化</h2>
          
          <div class="space-y-4">
            <!-- 数据状态 -->
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-700">数据状态:</span>
              <span v-if="dataInitialized" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已初始化
              </span>
              <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                未初始化
              </span>
            </div>

            <!-- 数据哈希 -->
            <div v-if="dataHash" class="space-y-2">
              <span class="text-sm font-medium text-gray-700">数据哈希:</span>
              <div class="bg-gray-50 rounded-lg p-3">
                <code class="text-sm text-gray-800 break-all">{{ dataHash }}</code>
              </div>
            </div>

            <!-- 数据统计 -->
            <div v-if="dataInitialized" class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="text-sm text-blue-600">任务数量</div>
                <div class="text-lg font-semibold text-blue-800">{{ dataStore.tasks.length }}</div>
              </div>
              <div class="bg-green-50 rounded-lg p-3">
                <div class="text-sm text-green-600">争议数量</div>
                <div class="text-lg font-semibold text-green-800">{{ dataStore.disputes.length }}</div>
              </div>
            </div>

            <!-- 说明文本 -->
            <div class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <p class="font-medium mb-2">说明:</p>
              <ul class="space-y-1 text-xs">
                <li>• 应用现在只从智能合约获取真实任务数据</li>
                <li>• 所有本地示例数据已被移除</li>
                <li>• 任务数据通过Web3连接从区块链获取</li>
                <li>• IPFS用于存储任务的详细描述和附件</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 清除按钮 -->
        <div class="text-center">
          <button
            @click="clearResults"
            class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            清除结果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useWeb3Store } from '@/stores/web3'
import { useIpfsStore } from '@/stores/ipfs'
import { web3Tester } from '@/utils/web3-test'
import { version } from 'vue'
import { useDataStore } from '@/stores/data'

export default {
  name: 'Test',
  setup() {
    const web3Store = useWeb3Store()
    const ipfsStore = useIpfsStore()
    const dataStore = useDataStore()

    const walletError = ref('')
    const web3TestLoading = ref(false)
    const web3TestResult = ref('')
    const ipfsLoading = ref(false)
    const ipfsResult = ref('')
    const ipfsError = ref('')
    const ipfsConnected = ref(false)
    const ipfsVersion = ref('')
    const uploadedHash = ref('')
    const uploadedContent = ref('')

    const vueVersion = version

    // 计算属性
    const hasMetaMask = computed(() => !!window.ethereum)

    // 测试钱包连接
    const testWalletConnection = async () => {
      try {
        walletError.value = ''
        await web3Store.connectWallet()
      } catch (error) {
        walletError.value = error.message
        console.error('钱包连接测试失败:', error)
      }
    }

    // 运行详细Web3测试
    const runDetailedWeb3Test = async () => {
      try {
        web3TestLoading.value = true
        web3TestResult.value = ''
        walletError.value = ''

        console.log('开始详细Web3诊断...')
        const testResults = await web3Tester.runFullTest()
        
        web3TestResult.value = JSON.stringify(testResults, null, 2)
        
        // 如果测试中发现错误，显示在错误区域
        const allErrors = [
          ...(testResults.network?.errors || []),
          ...(testResults.accounts?.errors || []),
          ...(testResults.balance?.errors || [])
        ]
        
        if (allErrors.length > 0) {
          walletError.value = `诊断发现问题: ${allErrors.join('; ')}`
        }

      } catch (error) {
        walletError.value = `详细诊断失败: ${error.message}`
        console.error('详细Web3测试失败:', error)
      } finally {
        web3TestLoading.value = false
      }
    }

    // 断开钱包连接
    const disconnectWallet = async () => {
      try {
        await web3Store.disconnectWallet()
        walletError.value = ''
        web3TestResult.value = ''
      } catch (error) {
        walletError.value = error.message
      }
    }

    // 测试IPFS连接
    const testIPFSConnection = async () => {
      try {
        ipfsLoading.value = true
        ipfsError.value = ''
        
        await ipfsStore.initIPFS()
        
        const result = {
          ipfs_initialized: !!ipfsStore.client,
          api_url: 'http://127.0.0.1:5001',
          status: 'connected',
          error: ipfsStore.error
        }
        
        ipfsResult.value = JSON.stringify(result, null, 2)
      } catch (error) {
        ipfsError.value = `IPFS连接失败: ${error.message}`
      } finally {
        ipfsLoading.value = false
      }
    }

    // 测试IPFS文件上传
    const testIPFSUpload = async () => {
      try {
        ipfsLoading.value = true
        ipfsError.value = ''
        
        const testData = {
          message: 'Hello IPFS from Dandelion!',
          timestamp: new Date().toISOString(),
          test: true,
          platform: 'Dandelion去中心化任务悬赏平台'
        }
        
        const hash = await ipfsStore.uploadJSON(testData)
        
        const result = {
          uploaded: true,
          hash: hash,
          ipfs_url: ipfsStore.getFileURL(hash),
          gateway_url: `http://127.0.0.1:8080/ipfs/${hash}`,
          data: testData
        }
        
        ipfsResult.value = JSON.stringify(result, null, 2)
      } catch (error) {
        ipfsError.value = `IPFS上传失败: ${error.message}`
      } finally {
        ipfsLoading.value = false
      }
    }

    // 清除结果
    const clearResults = () => {
      walletError.value = ''
      web3TestResult.value = ''
      ipfsResult.value = ''
      ipfsError.value = ''
    }

    onMounted(async () => {
      await testIPFSConnection()
    })

    return {
      // Stores
      web3Store,
      ipfsStore,
      dataStore,
      
      // Reactive data
      walletError,
      web3TestLoading,
      web3TestResult,
      ipfsLoading,
      ipfsResult,
      ipfsError,
      ipfsConnected,
      ipfsVersion,
      uploadedHash,
      uploadedContent,
      version,
      
      // Computed
      hasMetaMask,
      
      // Methods
      testWalletConnection,
      runDetailedWeb3Test,
      disconnectWallet,
      testIPFSConnection,
      testIPFSUpload,
      clearResults
    }
  }
}
</script> 