<template>
  <div class="tasks-page min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20">
    <!-- 页面头部 -->
    <div class="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden dark-section">
      <div class="absolute inset-0 bg-hero-pattern opacity-10"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold mb-2 text-on-dark-bright animate-fade-in-up">
            任务大厅
          </h1>
          <span class="block text-2xl md:text-3xl font-medium mt-2 text-on-dark-secondary animate-fade-in-up" style="animation-delay: 0.2s;">
            发现机会，实现价值
          </span>
        </div>

        <!-- 统计数据 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div class="text-center animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="text-3xl font-bold text-on-dark-bright mb-2">{{ stats.totalTasks }}</div>
            <div class="text-sm text-on-dark-muted">总任务数</div>
          </div>
          <div class="text-center animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="text-3xl font-bold text-on-dark-bright mb-2">{{ stats.activeTasks }}</div>
            <div class="text-sm text-on-dark-muted">进行中</div>
          </div>
          <div class="text-center animate-fade-in-up" style="animation-delay: 0.5s;">
            <div class="text-3xl font-bold text-on-dark-bright mb-2">{{ stats.completedTasks }}</div>
            <div class="text-sm text-on-dark-muted">已完成</div>
          </div>
          <div class="text-center animate-fade-in-up" style="animation-delay: 0.6s;">
            <div class="text-3xl font-bold text-gradient-gold-light mb-2">{{ stats.totalRewards }}</div>
            <div class="text-sm text-on-dark-muted">总奖金池</div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <h3 class="text-xl font-semibold text-neutral-900 mb-2">正在从合约获取任务数据...</h3>
        <p class="text-neutral-600">请稍候，这可能需要几秒钟</p>
      </div>

      <!-- 无任务数据时的刷新界面 -->
      <div v-else-if="dataStore.tasks.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="w-32 h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg class="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-neutral-900 mb-4">暂无任务数据</h3>
        <p class="text-neutral-600 mb-8 max-w-md mx-auto text-center">
          系统正在从智能合约获取最新任务数据，如果长时间没有数据，请点击下方按钮刷新。
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            @click="refreshTasks"
            :disabled="refreshing"
            class="btn-primary px-8 py-3 text-lg flex items-center gap-2"
          >
            <svg v-if="refreshing" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ refreshing ? '刷新中...' : '刷新任务' }}
          </button>
          <router-link to="/create-task" class="btn-outline px-8 py-3 text-lg">
            发布新任务
          </router-link>
        </div>
      </div>

      <!-- 有任务数据时显示任务列表 -->
      <div v-else class="flex gap-8">
        <!-- 左侧筛选器 -->
        <div class="w-80 flex-shrink-0">
          <div class="card-business rounded-2xl p-6 shadow-business-lg sticky top-24">
            <h3 class="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              筛选条件
            </h3>

            <!-- 搜索和筛选区域 -->
            <div class="glass-effect rounded-2xl p-6 border border-neutral-200/50 mb-8">
              <!-- 刷新按钮 -->
              <div class="mb-6">
                <button
                  @click="refreshTasks"
                  :disabled="refreshing"
                  class="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <svg v-if="refreshing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  {{ refreshing ? '刷新中...' : '刷新任务' }}
                </button>
              </div>
              
              <!-- 搜索框 -->
              <div class="relative mb-6">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索任务..."
                  class="input-business pl-10 text-sm"
                />
              </div>
              
              <!-- 任务状态 -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-3">任务状态</label>
                <div class="space-y-2">
                  <label v-for="status in statusOptions" :key="status.value" class="flex items-center">
                    <input
                      v-model="selectedStatus"
                      :value="status.value"
                      type="radio"
                      class="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                    />
                    <span class="ml-2 text-sm text-neutral-700">{{ status.label }}</span>
                  </label>
                </div>
              </div>

              <!-- 任务类型 -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-3">任务类型</label>
                <div class="space-y-2">
                  <label v-for="type in typeOptions" :key="type.value" class="flex items-center">
                    <input
                      v-model="selectedTypes"
                      :value="type.value"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500 rounded"
                    />
                    <span class="ml-2 text-sm text-neutral-700">{{ type.label }}</span>
                  </label>
                </div>
              </div>

              <!-- 奖金范围 -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-3">奖金范围 (AVAX)</label>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    v-model="rewardRange.min"
                    type="number"
                    placeholder="最小"
                    class="input-business text-sm"
                  />
                  <input
                    v-model="rewardRange.max"
                    type="number"
                    placeholder="最大"
                    class="input-business text-sm"
                  />
                </div>
              </div>

              <!-- 排序 -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-3">排序方式</label>
                <select v-model="sortBy" class="input-business text-sm w-full">
                  <option value="latest">最新发布</option>
                  <option value="reward_high">奖金最高</option>
                  <option value="reward_low">奖金最低</option>
                  <option value="participants">参与人数</option>
                </select>
              </div>

              <!-- 清空筛选 -->
              <button
                @click="clearFilters"
                class="w-full btn-outline text-sm py-2"
              >
                清空筛选
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧任务列表 -->
        <div class="flex-1">
          <!-- 结果统计 -->
          <div class="mb-6 flex items-center justify-between">
            <div class="text-neutral-600">
              找到 <span class="font-semibold text-neutral-900">{{ filteredTasksCount }}</span> 个任务
            </div>
            <div class="text-sm text-neutral-500">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="task in paginatedTasks" :key="task.id" 
                 class="bg-white rounded-xl shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                 @click="$router.push(`/task/${task.id}`)">
              
              <!-- 任务头部：状态和类型 -->
              <div class="p-6 pb-4">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span :class="getStatusClass(task.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                      {{ getStatusText(task.status) }}
                    </span>
                    <span :class="getTypeClass(task.taskType)" class="px-3 py-1 rounded-full text-sm font-medium">
                      {{ getTypeText(task.taskType) }}
                    </span>
                  </div>
                </div>
                
                <!-- 任务标题 -->
                <h3 class="text-lg font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                  {{ task.title }}
                </h3>
                
                <!-- 任务描述 -->
                <p class="text-neutral-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                  {{ task.description }}
                </p>
              </div>
              
              <!-- 关键信息区域 -->
              <div class="px-6 pb-4">
                <!-- 奖励信息 -->
                <div class="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    <div>
                      <div class="text-lg font-bold text-green-700">{{ task.reward }} AVAX</div>
                      <div class="text-xs text-green-600">任务奖励</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-green-700">{{ task.depositAmount }} AVAX</div>
                    <div class="text-xs text-green-600">押金要求</div>
                  </div>
                </div>
                
                <!-- 参与情况 -->
                <div class="mb-4">
                  <div class="flex items-center justify-between text-sm text-neutral-600 mb-2">
                    <span class="font-medium">参与情况</span>
                    <span class="font-semibold">{{ task.participants || 0 }}{{ task.maxParticipants ? `/${task.maxParticipants}` : '' }} 人</span>
                  </div>
                  <div class="w-full bg-neutral-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300" 
                         :style="`width: ${getParticipationPercentage(task)}%`"></div>
                  </div>
                </div>
                
                <!-- 技术要求标签 -->
                <div v-if="getRequirementTags(task.requirements).length > 0" class="mb-4">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="requirement in getRequirementTags(task.requirements).slice(0, 3)" :key="requirement"
                          class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {{ requirement }}
                    </span>
                    <span v-if="getRequirementTags(task.requirements).length > 3" 
                          class="bg-neutral-100 text-neutral-600 px-2 py-1 rounded text-xs">
                      +{{ getRequirementTags(task.requirements).length - 3 }}
                    </span>
                  </div>
                </div>
                
                <!-- 特殊要求标识 -->
                <div v-if="task.githubRequired || task.chainlinkVerification" class="flex items-center gap-3 mb-4 text-xs">
                  <div v-if="task.githubRequired" class="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span class="font-medium">GitHub</span>
                  </div>
                  <div v-if="task.chainlinkVerification" class="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="font-medium">智能验证</span>
                  </div>
                </div>

                <!-- 数据来源标识（仅在开发模式或调试时显示） -->
                <div v-if="$route.query.debug" class="mb-4">
                  <div class="flex items-center gap-2">
                    <span :class="getTaskDataSource(task).class" class="px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <span>{{ getTaskDataSource(task).icon }}</span>
                      {{ getTaskDataSource(task).text }}
                    </span>
                    <span v-if="!shouldShowIPFSInfo(task) && task.ipfsHash" 
                          class="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium"
                          title="IPFS哈希无效或数据损坏">
                      ⚠️ 数据受限
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 底部操作区域 -->
              <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                <div class="flex items-center justify-between">
                  <!-- 雇主信息 -->
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs font-bold">
                        {{ (task.employer || task.creator || '').slice(-2).toUpperCase() || '??' }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-neutral-800">{{ formatAddress(task.employer || task.creator) }}</p>
                      <p class="text-xs text-neutral-500">{{ formatDate(task.createdAt) }}</p>
                    </div>
                  </div>
                  
                  <!-- 操作按钮 -->
                  <div class="flex items-center gap-2">
                    <button v-if="task.status === 1 && canParticipate(task)"
                            @click.stop="quickBid(task)"
                            class="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                      立即竞标
                    </button>
                    <button v-else-if="task.status === 1 && !canParticipate(task)"
                            disabled
                            class="bg-neutral-300 text-neutral-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                      {{ getDisabledReason(task) }}
                    </button>
                    <button @click.stop="$router.push(`/task/${task.id}`)"
                            class="bg-white text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors">
                      查看详情
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页器 -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                currentPage === 1 
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                  : 'bg-white text-neutral-700 hover:bg-primary-50 hover:text-primary-700 shadow-sm'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            
            <div class="flex gap-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  page === currentPage
                    ? 'business-gradient text-white shadow-business'
                    : 'bg-white text-neutral-700 hover:bg-primary-50 hover:text-primary-700 shadow-sm'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                currentPage === totalPages 
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                  : 'bg-white text-neutral-700 hover:bg-primary-50 hover:text-primary-700 shadow-sm'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          
          <!-- 筛选后无结果 -->
          <div v-if="filteredTasksCount === 0 && dataStore.tasks.length > 0" class="text-center py-20 animate-fade-in">
            <div class="w-32 h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg class="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-neutral-900 mb-4">暂无匹配的任务</h3>
            <p class="text-neutral-600 mb-8 max-w-md mx-auto">
              尝试调整筛选条件或搜索关键词，或者
              <router-link to="/create-task" class="text-primary-600 hover:text-primary-700 font-medium">
                发布一个新任务
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useWeb3Store } from '@/stores/web3'
import { useIpfsStore } from '@/stores/ipfs'

const router = useRouter()
const dataStore = useDataStore()
const web3Store = useWeb3Store()
const ipfsStore = useIpfsStore()

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedTypes = ref([])
const rewardRange = ref({ min: '', max: '' })
const sortBy = ref('latest')

// 分页相关
const currentPage = ref(1)
const pageSize = 15

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 0, label: '已创建' },
  { value: 1, label: '竞标中' },
  { value: 2, label: '开发中' },
  { value: 3, label: '待雇主确认' },
  { value: 4, label: '已完成' },
  { value: 5, label: '争议中' },
  { value: 6, label: '争议期' }
]

// 类型选项
const typeOptions = [
  { value: 'all', label: '全部类型' },
  { value: 0, label: '其他' },
  { value: 1, label: 'Web3开发' },
  { value: 2, label: 'UI/UX设计' },
  { value: 3, label: '市场推广' },
  { value: 4, label: '内容创作' },
  { value: 5, label: '数据分析' }
]

// 计算属性 - 从dataStore获取过滤后的任务
const filteredTasks = computed(() => {
  let tasks = [...dataStore.tasks]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      (task.requirements && task.requirements.toLowerCase().includes(query))
    )
  }

  // 状态过滤
  if (selectedStatus.value !== 'all') {
    tasks = tasks.filter(task => task.status === parseInt(selectedStatus.value))
  }

  // 类型过滤
  if (selectedTypes.value.length > 0 && !selectedTypes.value.includes('all')) {
    tasks = tasks.filter(task => selectedTypes.value.includes(task.taskType.toString()))
  }

  // 奖金范围过滤
  if (rewardRange.value.min) {
    tasks = tasks.filter(task => parseFloat(task.reward) >= parseFloat(rewardRange.value.min))
  }
  if (rewardRange.value.max) {
    tasks = tasks.filter(task => parseFloat(task.reward) <= parseFloat(rewardRange.value.max))
  }

  // 排序
  switch (sortBy.value) {
    case 'reward_high':
      tasks.sort((a, b) => parseFloat(b.reward) - parseFloat(a.reward))
      break
    case 'reward_low':
      tasks.sort((a, b) => parseFloat(a.reward) - parseFloat(b.reward))
      break
    case 'participants':
      tasks.sort((a, b) => (b.participants || 0) - (a.participants || 0))
      break
    case 'latest':
    default:
      tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }

  return tasks
})

// 分页相关计算属性
const filteredTasksCount = computed(() => filteredTasks.value.length)
const totalPages = computed(() => Math.ceil(filteredTasksCount.value / pageSize))

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredTasks.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }
  
  return pages.filter(p => p !== '...' || pages.indexOf(p) === pages.lastIndexOf(p))
})

// 统计数据 - 从dataStore获取
const stats = computed(() => dataStore.stats)

// 方法
const loadTasks = async () => {
  loading.value = true
  try {
    console.log('🔄 从合约加载任务列表...')
    // 强制从合约获取数据，不使用本地数据
    await dataStore.loadTasksFromContract()
    console.log('✅ 任务列表加载成功，任务数量:', dataStore.tasks.length)
  } catch (error) {
    console.error('❌ 加载任务失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshTasks = async () => {
  refreshing.value = true
  try {
    console.log('🔄 刷新任务数据...')
    // 清除当前数据并重新从合约获取
    dataStore.clearLocalData()
    await dataStore.loadTasksFromContract()
    console.log('✅ 任务数据刷新成功，任务数量:', dataStore.tasks.length)
  } catch (error) {
    console.error('❌ 刷新任务失败:', error)
  } finally {
    refreshing.value = false
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusTexts = {
    0: '已创建',
    1: '竞标中',
    2: '开发中', 
    3: '待雇主确认',
    4: '已完成',
    5: '争议中',
    6: '争议期'
  }
  return statusTexts[status] || '未知'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const statusClasses = {
    0: 'bg-gray-100 text-gray-800',      // 已创建 - 灰色
    1: 'bg-green-100 text-green-800',    // 竞标中 - 绿色
    2: 'bg-blue-100 text-blue-800',      // 开发中 - 蓝色
    3: 'bg-yellow-100 text-yellow-800',  // 待雇主确认 - 黄色
    4: 'bg-purple-100 text-purple-800',  // 已完成 - 紫色
    5: 'bg-red-100 text-red-800',        // 争议中 - 红色
    6: 'bg-orange-100 text-orange-800'   // 争议期 - 橙色
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

// 获取类型文本
const getTypeText = (type) => {
  const typeTexts = {
    0: '其他',
    1: 'Web3开发',
    2: 'UI/UX设计',
    3: '市场推广',
    4: '内容创作',
    5: '数据分析'
  }
  return typeTexts[type] || '其他'
}

// 获取类型样式类
const getTypeClass = (type) => {
  const typeClasses = {
    0: 'bg-gray-100 text-gray-800',       // 其他
    1: 'bg-purple-100 text-purple-800',   // Web3开发
    2: 'bg-pink-100 text-pink-800',       // UI/UX设计
    3: 'bg-cyan-100 text-cyan-800',       // 市场推广
    4: 'bg-orange-100 text-orange-800',   // 内容创作
    5: 'bg-indigo-100 text-indigo-800'    // 数据分析
  }
  return typeClasses[type] || 'bg-gray-100 text-gray-800'
}

// 检查任务是否紧急
const isUrgent = (task) => {
  // 已移除时间截止功能，任务不再标记为紧急
  return false
}

// 检查是否显示IPFS哈希信息
const shouldShowIPFSInfo = (task) => {
  // 如果没有IPFS哈希，不显示
  if (!task.ipfsHash || task.ipfsHash === '0' || task.ipfsHash === '') {
    return false
  }
  
  // 检查是否为无效哈希
  if (ipfsStore.isValidIPFSHash && !ipfsStore.isValidIPFSHash(task.ipfsHash)) {
    return false
  }
  
  // 检查是否有错误标记
  if (task.metadata && task.metadata.error === 'Invalid IPFS hash') {
    return false
  }
  
  return true
}

// 获取任务数据来源标识
const getTaskDataSource = (task) => {
  if (!shouldShowIPFSInfo(task)) {
    return {
      text: '基础信息',
      class: 'bg-gray-100 text-gray-600',
      icon: '📄'
    }
  }
  
  if (task.source === 'contract+ipfs') {
    return {
      text: '完整信息',
      class: 'bg-green-100 text-green-600', 
      icon: '✅'
    }
  }
  
  return {
    text: '链上数据',
    class: 'bg-blue-100 text-blue-600',
    icon: '⛓️'
  }
}

// 检查用户是否可以参与任务
const canParticipate = (task) => {
  const web3Store = useWeb3Store()
  const currentUser = web3Store.account
  
  // 未连接钱包
  if (!currentUser) return false
  
  // 不能参与自己发布的任务
  if (task.creator && task.creator.toLowerCase() === currentUser.toLowerCase()) return false
  if (task.employer && task.employer.toLowerCase() === currentUser.toLowerCase()) return false
  
  // 任务状态必须是竞标中
  if (task.status !== 1) return false
  
  // 检查是否已经竞标
  const taskBids = getBidsByTask(task.id)
  const hasAlreadyBid = taskBids.some(bid => 
    bid.bidder && bid.bidder.toLowerCase() === currentUser.toLowerCase()
  )
  
  return !hasAlreadyBid
}

// 获取禁用原因
const getDisabledReason = (task) => {
  const web3Store = useWeb3Store()
  const currentUser = web3Store.account
  
  if (!currentUser) return '请连接钱包'
  
  if (task.creator && task.creator.toLowerCase() === currentUser.toLowerCase()) return '自己的任务'
  if (task.employer && task.employer.toLowerCase() === currentUser.toLowerCase()) return '自己的任务'
  
  if (task.status !== 1) return '不在竞标期'
  
  const taskBids = getBidsByTask(task.id)
  const hasAlreadyBid = taskBids.some(bid => 
    bid.bidder && bid.bidder.toLowerCase() === currentUser.toLowerCase()
  )
  
  if (hasAlreadyBid) return '已竞标'
  
  return '无法参与'
}

// 获取任务的竞标列表
const getBidsByTask = (taskId) => {
  const dataStore = useDataStore()
  return dataStore.getBidsByTaskId(taskId) || []
}

// 快速竞标
const quickBid = (task) => {
  // 跳转到任务详情页面的竞标部分
  router.push(`/task/${task.id}?action=bid`)
}

// 格式化地址
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = 'all'
  selectedTypes.value = []
  rewardRange.value = { min: '', max: '' }
  sortBy.value = 'latest'
  currentPage.value = 1
}

// 监听筛选条件变化，重置到第一页
const resetToFirstPage = () => {
  currentPage.value = 1
}

// 监听筛选条件变化
watch([searchQuery, selectedStatus, selectedTypes, rewardRange, sortBy], resetToFirstPage, { deep: true })

// 获取竞标者唯一键
const getBidderKey = (bidder, index) => {
  // 如果bidder是对象且有address属性
  if (bidder && typeof bidder === 'object' && bidder.address) {
    return bidder.address
  }
  // 如果bidder是字符串地址
  if (typeof bidder === 'string') {
    return bidder
  }
  // 兜底使用索引
  return `bidder-${index}`
}

// 获取竞标者显示文本
const getBidderDisplayText = (bidder) => {
  try {
    // 如果bidder是对象且有address属性
    if (bidder && typeof bidder === 'object' && bidder.address) {
      return bidder.address.slice(-2).toUpperCase()
    }
    // 如果bidder是字符串地址
    if (typeof bidder === 'string' && bidder.length >= 2) {
      return bidder.slice(-2).toUpperCase()
    }
    // 兜底显示
    return '??'
  } catch (error) {
    console.warn('获取竞标者显示文本失败:', error, bidder)
    return '??'
  }
}

// 获取参与度百分比
const getParticipationPercentage = (task) => {
  const participants = task.participants || 0
  const maxParticipants = task.maxParticipants || 100
  return Math.min((participants / maxParticipants) * 100, 100)
}

// 获取技术要求标签
const getRequirementTags = (requirements) => {
  if (!requirements) return []
  
  const commonTags = [
    'Vue.js', 'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
    'Solidity', 'Web3', 'DeFi', 'NFT', 'Smart Contract', 'Blockchain',
    'UI/UX', 'Design', 'Figma', 'Photoshop', 'HTML', 'CSS', 'Tailwind',
    'API', 'Database', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis'
  ]
  
  return commonTags.filter(tag => 
    requirements.toLowerCase().includes(tag.toLowerCase())
  ).slice(0, 3) // 最多显示3个标签
}

// 组件挂载时加载任务
onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
/* 任务列表页面特定样式 */
.tasks-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 75%, #ffffff 100%);
}

.filter-sidebar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.3);
  box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.1), 0 4px 6px -2px rgba(30, 58, 138, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.filter-input:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  border-color: transparent;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.task-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.task-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(30, 58, 138, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.05);
}

.task-card:hover::before {
  transform: scaleX(1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滚动条样式 */
.sticky {
  position: sticky;
}

/* 确保卡片网格在不同屏幕尺寸下的响应式 */
@media (max-width: 1024px) {
  .xl\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style> 