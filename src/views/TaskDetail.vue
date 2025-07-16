<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-neutral-600">加载任务详情中...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-neutral-800 mb-2">加载失败</h2>
        <p class="text-neutral-600 mb-4">{{ error }}</p>
        <button @click="loadTask" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          重新加载
        </button>
      </div>
    </div>

    <!-- 任务详情内容 -->
    <div v-else>
    <!-- 任务详情头部 -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex items-start justify-between">
            <div class="flex-1">
            <div class="flex items-center space-x-4 mb-4">
                <span :class="getStatusClass(task.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusText(task.status) }}
                </span>
              <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {{ getTypeText(task.taskType) }}
                </span>
              </div>
            <h1 class="text-3xl font-bold mb-4">{{ task.title }}</h1>
            <div class="flex items-center space-x-6 text-primary-100">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                <span class="text-2xl font-bold">{{ task.reward }} AVAX</span>
                  </div>
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                <span>{{ task.participants }}/{{ task.maxParticipants || '∞' }} 参与者</span>
                  </div>
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                <span>{{ formatDeadline() }}</span>
                  </div>
                  </div>
                </div>
          <div class="flex items-center space-x-4">
              <!-- 竞标按钮 -->
                <button
              v-if="task.status === 1 && canBid"
                  @click="showBidModal = true"
              class="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
              参与竞标
                </button>
            <!-- 雇主操作按钮 -->
            <div v-if="isCreator" class="flex space-x-2">
                <button
                v-if="task.status === 0"
                @click="startBidding"
                class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                开始竞标
                </button>
                <button
                  v-if="task.status === 1 && task.bidders && task.bidders.length > 0"
                @click="showSelectWinnerModal = true"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                选择中标者
                </button>
                <button
                v-if="task.status === 3"
                @click="showReviewModal = true"
                class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                评审成果
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 主内容区域 -->
        <div class="lg:col-span-2 space-y-8">
          <!-- 任务描述 -->
          <div class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
            <h2 class="text-2xl font-bold text-neutral-800 mb-6">任务描述</h2>
            <div class="prose prose-neutral max-w-none">
              <p class="text-neutral-700 whitespace-pre-line">{{ task.description }}</p>
            </div>
            
            <!-- 技术要求 -->
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 class="font-semibold text-blue-800 mb-2">技术要求</h3>
              <p class="text-blue-700">{{ task.requirements }}</p>
            </div>

            <!-- GitHub要求 -->
            <div v-if="task.githubRequired" class="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 class="font-semibold text-green-800 mb-2">GitHub要求</h3>
              <p class="text-green-700">需要定期提交开发进度到GitHub仓库</p>
              <div v-if="task.githubRepo" class="mt-2">
                <a :href="task.githubRepo" target="_blank" class="text-green-600 hover:text-green-800 underline">
                  查看项目仓库
                </a>
              </div>
            </div>

            <!-- Chainlink验证 -->
            <div v-if="task.chainlinkVerification" class="mt-4 p-4 bg-purple-50 rounded-lg">
              <h3 class="font-semibold text-purple-800 mb-2">智能验证</h3>
              <p class="text-purple-700">项目完成状态将通过Chainlink预言机进行自动验证</p>
            </div>

            <!-- 提交成果预览（待雇主确认阶段显示） -->
            <div v-if="task.status === 3 && submissionData" class="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 class="text-xl font-bold text-blue-800 mb-4">提交成果预览</h3>
              <p class="text-neutral-700 mb-2"><strong>标题：</strong> {{ submissionData.submissionTitle }}</p>
              <p class="text-neutral-700 whitespace-pre-line mb-4">{{ submissionData.description }}</p>
              <button
                @click="showProjectSubmission"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                查看完整成果
              </button>
            </div>
            </div>
            
            <!-- 附件 -->
          <div v-if="task.attachments && task.attachments.length > 0" class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
            <h2 class="text-2xl font-bold text-neutral-800 mb-6">相关附件</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="file in task.attachments" :key="file.name" 
                   class="flex items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-medium text-neutral-800">{{ file.name }}</h3>
                  <p class="text-sm text-neutral-600">{{ file.type.toUpperCase() }}</p>
                </div>
                <button class="text-primary-600 hover:text-primary-800">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

            <!-- 竞标者列表 -->
          <div v-if="task.status === 1" class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
              <h2 class="text-2xl font-bold text-neutral-800 mb-6">竞标者 ({{ task.bidders ? task.bidders.length : 0 }})</h2>
              <div v-if="!task.bidders || task.bidders.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                      </div>
              <p class="text-gray-600">暂无竞标者</p>
            </div>
            <div v-else class="space-y-6">
              <div v-for="bidder in task.bidders" :key="bidder.address" 
                   class="border border-neutral-200 rounded-xl p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold">{{ bidder.address ? bidder.address.slice(-2).toUpperCase() : '?' }}</span>
                    </div>
                        <div>
                      <h3 class="font-semibold text-neutral-800">{{ bidder.address ? formatAddress(bidder.address) : '未知用户' }}</h3>
                      <p class="text-sm text-neutral-600">{{ bidder.timestamp ? formatDate(bidder.timestamp) : '时间未知' }}</p>
                        </div>
                        </div>
                  <div class="text-right">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-neutral-600">押金状态:</span>
                      <span :class="bidder.depositPaid ? 'text-green-600' : 'text-red-600'" class="font-medium">
                        {{ bidder.depositPaid ? '已支付' : '未支付' }}
                      </span>
                      </div>
                    <div class="text-sm text-neutral-600 mt-1">
                      押金: {{ bidder.depositAmount || 0 }} AVAX
                    </div>
                  </div>
            </div>
                
                <div class="mb-4">
                  <h4 class="font-medium text-neutral-800 mb-2">竞标提案</h4>
                  <p class="text-neutral-700 bg-neutral-50 p-3 rounded-lg">{{ bidder.proposal ? bidder.proposal.slice(0, 100) + '...' : '暂无提案' }}</p>
          </div>

                <div class="flex items-center justify-between">
                  <div class="flex space-x-4">
                    <a v-if="bidder.demoUrl" :href="bidder.demoUrl" target="_blank" 
                       class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                      查看演示
                    </a>
                    <a v-if="bidder.githubProfile" :href="bidder.githubProfile" target="_blank" 
                       class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                      GitHub资料
                    </a>
            </div>
                  <button v-if="isCreator && bidder.depositPaid" 
                          @click="selectWinner(bidder.address)"
                          class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">
                    选择此人
                  </button>
                </div>
              </div>
            </div>
          </div>

            <!-- 任务状态流程管理 -->
            <TaskStatusFlow 
              :task="task" 
              @taskUpdated="loadTask"
              @actionCompleted="handleActionCompleted"
            />
          </div>

        <!-- 侧边栏 -->
        <div class="space-y-6">
          <!-- 任务信息卡片 -->
          <div class="glass-effect rounded-2xl p-6 border border-neutral-200/50">
            <h3 class="text-lg font-semibold text-neutral-800 mb-4">任务信息</h3>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-neutral-600">奖励金额</span>
                <span class="font-semibold text-green-600">{{ task.reward }} AVAX</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-600">平台费用</span>
                <span class="text-neutral-800">{{ task.platformFee }} AVAX</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-600">竞标押金</span>
                <span class="text-neutral-800">{{ task.depositAmount }} AVAX</span>
              </div>
              <hr class="border-neutral-200">
              <div class="flex justify-between">
                <span class="text-neutral-600">竞标期</span>
                <span class="text-neutral-800">{{ task.biddingPeriod }}小时</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-600">开发期</span>
                <span class="text-neutral-800">{{ task.developmentPeriod }}天</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-600">最大参与者</span>
                <span class="text-neutral-800">{{ task.maxParticipants || '无限制' }}</span>
              </div>
            </div>
          </div>

          <!-- 雇主信息 -->
          <div class="glass-effect rounded-2xl p-6 border border-neutral-200/50">
            <h3 class="text-lg font-semibold text-neutral-800 mb-4">雇主信息</h3>
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ (task.employer || task.creator || '').slice(-2).toUpperCase() || '?' }}</span>
                  </div>
              <div>
                <h4 class="font-medium text-neutral-800">{{ formatAddress(task.employer || task.creator) || '加载中...' }}</h4>
                <p class="text-sm text-neutral-600">发布于 {{ task.createdAt ? formatDate(task.createdAt) : '加载中...' }}</p>
              </div>
            </div>
          </div>

          <!-- 时间线 -->
          <div class="glass-effect rounded-2xl p-6 border border-neutral-200/50">
            <h3 class="text-lg font-semibold text-neutral-800 mb-4">时间线</h3>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p class="font-medium text-neutral-800">任务创建</p>
                  <p class="text-sm text-neutral-600">{{ formatDate(task.createdAt) }}</p>
                </div>
              </div>
              <div v-if="task.status >= 1" class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p class="font-medium text-neutral-800">竞标截止</p>
                  <p class="text-sm text-neutral-600">{{ getBiddingEndDate() }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :class="task.status >= 2 ? 'bg-yellow-500' : 'bg-gray-300'"></div>
                <div>
                  <p class="font-medium text-neutral-800">项目截止</p>
                  <p class="text-sm text-neutral-600">{{ formatDate(task.deadline) }}</p>
                </div>
              </div>
              <div v-if="task.developmentDeadline" class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :class="task.status >= 3 ? 'bg-yellow-500' : 'bg-gray-300'"></div>
                <div>
                  <p class="font-medium text-neutral-800">开发截止</p>
                  <p class="text-sm text-neutral-600">{{ formatDate(task.developmentDeadline) }}</p>
                </div>
              </div>
              <div v-if="task.reviewDeadline" class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :class="task.status >= 4 ? 'bg-purple-500' : 'bg-gray-300'"></div>
                <div>
                  <p class="font-medium text-neutral-800">评审截止</p>
                  <p class="text-sm text-neutral-600">{{ formatDate(task.reviewDeadline) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 竞标模态框 -->
    <div v-if="showBidModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold text-neutral-800 mb-6">参与竞标</h3>
        
        <div class="mb-6">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p class="text-yellow-800 text-sm">
              <strong>注意:</strong> 参与竞标需要支付 {{ task.depositAmount }} AVAX 押金，竞标成功后押金将被退还。
            </p>
          </div>
          
            <div class="mb-4">
            <label class="block text-sm font-medium text-neutral-700 mb-2">竞标提案</label>
              <textarea
              v-model="bidProposal"
                rows="4"
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请详细描述您的实施方案、经验背景和预期交付成果...">
            </textarea>
            </div>
            
            <div class="mb-4">
            <label class="block text-sm font-medium text-neutral-700 mb-2">演示链接 (可选)</label>
              <input
              v-model="bidDemoUrl"
                type="url"
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://your-demo-url.com">
            </div>
            
          <div class="mb-4">
            <label class="block text-sm font-medium text-neutral-700 mb-2">GitHub资料 (可选)</label>
            <input 
              v-model="bidGithubProfile"
              type="url"
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://github.com/your-username">
                    </div>
                  </div>
        
        <div class="flex space-x-4">
          <button 
            @click="showBidModal = false"
            class="flex-1 bg-neutral-200 text-neutral-800 py-3 rounded-lg font-semibold hover:bg-neutral-300">
            取消
          </button>
          <button 
            @click="submitBid"
            :disabled="!bidProposal.trim()"
            class="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
            支付押金并竞标
          </button>
                </div>
              </div>
            </div>
            
    <!-- 选择中标者模态框 -->
    <div v-if="showSelectWinnerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-neutral-800 mb-6">选择中标者</h3>
        
        <div class="space-y-4 mb-6">
          <div v-for="bidder in task.bidders.filter(b => b.depositPaid)" :key="bidder.address" 
               class="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 cursor-pointer"
               :class="selectedWinner === bidder.address ? 'border-primary-500 bg-primary-50' : ''"
               @click="selectedWinner = bidder.address">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <input 
                  type="radio" 
                  :value="bidder.address" 
                  v-model="selectedWinner"
                  class="text-primary-600">
                <div>
                  <h4 class="font-medium text-neutral-800">{{ formatAddress(bidder.address) }}</h4>
                  <p class="text-sm text-neutral-600">{{ formatDate(bidder.timestamp) }}</p>
                </div>
              </div>
            </div>
            <p class="text-neutral-700 text-sm mt-2">{{ bidder.proposal ? bidder.proposal.slice(0, 100) + '...' : '暂无提案' }}</p>
          </div>
        </div>
        
        <div class="flex space-x-4">
              <button
            @click="showSelectWinnerModal = false"
            class="flex-1 bg-neutral-200 text-neutral-800 py-3 rounded-lg font-semibold hover:bg-neutral-300">
                取消
              </button>
              <button
            @click="confirmSelectWinner"
            :disabled="!selectedWinner"
            class="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50">
            确认选择
              </button>
            </div>
      </div>
    </div>

    <!-- 评审模态框 -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold text-neutral-800 mb-6">评审成果</h3>
        
        <div class="mb-6">
          <p class="text-neutral-600 mb-4">请仔细评审提交的成果，确认是否符合任务要求。</p>
          
          <!-- 项目成果查看按钮 -->
          <div v-if="task.completeUrl && task.completeUrl.startsWith('ipfs://')" class="mb-4">
            <button
              @click="showProjectSubmission"
              class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>📋 查看项目成果</span>
            </button>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-neutral-700 mb-2">评审意见 (可选)</label>
            <textarea 
              v-model="reviewComment"
              rows="3"
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入您的评审意见...">
            </textarea>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button 
            @click="showReviewModal = false"
            class="flex-1 bg-neutral-200 text-neutral-800 py-3 rounded-lg font-semibold hover:bg-neutral-300">
            取消
          </button>
          <button 
            @click="rejectSubmission"
            class="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">
            拒绝
          </button>
          <button 
            @click="approveSubmission"
            class="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600">
            通过
          </button>
        </div>
      </div>
    </div>

    <!-- 项目提交查看器 -->
    <ProjectSubmissionViewer
      v-if="task.id && showSubmissionViewer"
      :show="showSubmissionViewer"
      :task-id="task.id"
      :submission-hash="submissionHash"
      @close="showSubmissionViewer = false"
      @approve="handleSubmissionApprove"
      @reject="handleSubmissionReject"
      @nft-created="handleNFTCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useDataStore, TASK_STATUS, getStatusText, getStatusClass, BIDDING_CONFIG } from '@/stores/data'
import { useIpfsStore } from '@/stores/ipfs'
import TaskStatusFlow from '@/components/TaskStatusFlow.vue'
import ProjectSubmissionViewer from '@/components/ProjectSubmissionViewer.vue'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const dataStore = useDataStore()
const ipfsStore = useIpfsStore()

// 响应式数据
const task = ref({
  bidders: [],
  workSubmissions: [],
  creator: '',
  winner: '',
  title: '',
  description: '',
  reward: 0,
  depositAmount: 0,
  platformFee: 0,
  status: 0,
  taskType: 0,
  requirements: '',
  githubRequired: false,
  githubRepo: '',
  chainlinkVerification: false,
  attachments: [],
  participants: 0,
  maxParticipants: 0,
  biddingPeriod: 0,
  developmentPeriod: 0,
  createdAt: '',
  deadline: '',
  developmentDeadline: '',
  reviewDeadline: '',
  completeUrl: ''
})
const loading = ref(true)
const error = ref('')

// 模态框状态
const showBidModal = ref(false)
const showSelectWinnerModal = ref(false)
const showReviewModal = ref(false)

// 竞标相关数据
const bidProposal = ref('')
const bidDemoUrl = ref('')
const bidGithubProfile = ref('')

// 选择中标者
const selectedWinner = ref('')

// 评审相关
const reviewComment = ref('')

// 项目提交查看相关
const showSubmissionViewer = ref(false)
const submissionHash = ref('')

// 项目提交数据
const submissionData = ref(null)

// 计算属性
const isCreator = computed(() => {
  return walletStore.account && task.value.creator && 
         walletStore.account.toLowerCase() === task.value.creator.toLowerCase()
})

const canBid = computed(() => {
  if (!walletStore.account || !task.value.bidders) return false
  
  // 检查是否已经竞标
  const alreadyBidded = task.value.bidders.some(bidder => 
    bidder.address.toLowerCase() === walletStore.account.toLowerCase()
  )
  
  // 检查是否达到最大参与人数
  const maxReached = task.value.maxParticipants && 
                     task.value.participants >= task.value.maxParticipants
  
  // 检查是否过了竞标截止时间
  const deadlinePassed = new Date() > new Date(task.value.deadline)
  
  return !alreadyBidded && !maxReached && !deadlinePassed && !isCreator.value
})

// 方法
const loadTask = async () => {
  try {
    loading.value = true
    const taskId = parseInt(route.params.id)
    
    console.log('🔍 加载任务详情，ID:', taskId)
    
    // 使用新的fetchTaskById方法，优先从IPFS获取
    const foundTask = await dataStore.fetchTaskById(taskId)
    
    if (!foundTask) {
      error.value = '任务不存在'
      return
    }
    
    task.value = foundTask
    console.log('✅ 任务详情加载成功:', task.value.title)
    
    // 加载项目提交数据（如果有）
    await loadSubmissionData()
  } catch (err) {
    console.error('❌ 加载任务失败:', err)
    error.value = err.message || '加载任务失败'
  } finally {
    loading.value = false
  }
}

const startBidding = async () => {
  try {
    if (!walletStore.account) {
      await walletStore.connectWallet()
    }
    
    // 模拟调用智能合约开始竞标
    console.log('开始竞标，任务ID:', task.value.id)
    
    // 更新任务状态
    task.value.status = TASK_STATUS.BIDDING
    await dataStore.updateTask(task.value.id, { status: TASK_STATUS.BIDDING })
    
    // 显示成功消息
    alert('竞标已开始！')
    
  } catch (err) {
    console.error('开始竞标失败:', err)
    alert('开始竞标失败: ' + err.message)
  }
}

const submitBid = async () => {
  try {
    if (!walletStore.account) {
      await walletStore.connectWallet()
    }
    
    if (!bidProposal.value.trim()) {
      alert('请填写竞标提案')
    return
  }

    // 模拟支付押金和提交竞标
    console.log('提交竞标:', {
      taskId: task.value.id,
      bidder: walletStore.account,
      proposal: bidProposal.value,
      demoUrl: bidDemoUrl.value,
      githubProfile: bidGithubProfile.value,
      depositAmount: task.value.depositAmount
    })
    
    // 添加竞标者到任务
    const newBidder = {
      address: walletStore.account,
      proposal: bidProposal.value,
      demoUrl: bidDemoUrl.value,
      githubProfile: bidGithubProfile.value,
      timestamp: new Date().toISOString(),
      depositPaid: true,
      depositAmount: task.value.depositAmount
    }
    
    // 确保bidders数组存在
    if (!task.value.bidders) {
      task.value.bidders = []
    }
    
    task.value.bidders.push(newBidder)
    task.value.participants = task.value.bidders.length
    
    await dataStore.updateTask(task.value.id, {
      bidders: task.value.bidders,
      participants: task.value.participants
    })
    
    // 重置表单
    bidProposal.value = ''
    bidDemoUrl.value = ''
    bidGithubProfile.value = ''
    showBidModal.value = false
    
    alert('竞标提交成功！押金已支付。')
    
  } catch (err) {
    console.error('提交竞标失败:', err)
    alert('提交竞标失败: ' + err.message)
  }
}

const selectWinner = async (winnerAddress) => {
  selectedWinner.value = winnerAddress
  showSelectWinnerModal.value = true
}

const confirmSelectWinner = async () => {
  try {
    if (!selectedWinner.value) {
      alert('请选择中标者')
      return
    }
    
    // 模拟调用智能合约选择中标者
    console.log('选择中标者:', selectedWinner.value)
    
    // 更新任务状态和中标者
    task.value.status = TASK_STATUS.IN_PROGRESS
    task.value.winner = selectedWinner.value
    
    // 标记中标者
    task.value.bidders.forEach(bidder => {
      bidder.selected = bidder.address === selectedWinner.value
    })
    
    await dataStore.updateTask(task.value.id, {
      status: TASK_STATUS.IN_PROGRESS,
      winner: selectedWinner.value,
      bidders: task.value.bidders
    })
    
    showSelectWinnerModal.value = false
    selectedWinner.value = ''
    
    alert('中标者选择成功！任务进入开发阶段。')
    
  } catch (err) {
    console.error('选择中标者失败:', err)
    alert('选择中标者失败: ' + err.message)
  }
}

const approveSubmission = async () => {
  try {
    // 模拟雇主确认任务完成
    console.log('批准任务完成')
    
    task.value.status = TASK_STATUS.COMPLETED
    task.value.completedAt = new Date().toISOString()
    
    await dataStore.updateTask(task.value.id, {
      status: TASK_STATUS.COMPLETED,
      completedAt: task.value.completedAt
    })
    
    showReviewModal.value = false
    reviewComment.value = ''
    
    alert('任务已完成！奖励将发放给中标者。')
    
  } catch (err) {
    console.error('批准任务失败:', err)
    alert('批准任务失败: ' + err.message)
  }
}

const rejectSubmission = async () => {
  try {
    // 模拟雇主拒绝任务，进入争议期
    console.log('拒绝任务成果')
    
    task.value.status = TASK_STATUS.PENDING_DISPUTE
    task.value.disputeDeadline = new Date(Date.now() + BIDDING_CONFIG.DISPUTE_PERIOD * 24 * 60 * 60 * 1000).toISOString()
    
    await dataStore.updateTask(task.value.id, {
      status: TASK_STATUS.PENDING_DISPUTE,
      disputeDeadline: task.value.disputeDeadline
    })
    
    showReviewModal.value = false
    reviewComment.value = ''
    
    alert('任务成果已拒绝，进入争议期。中标者可以申请仲裁。')
    
  } catch (err) {
    console.error('拒绝任务失败:', err)
    alert('拒绝任务失败: ' + err.message)
  }
}

const handleActionCompleted = (event) => {
  console.log('任务操作完成:', event)
  // 刷新任务数据
  loadTask()
}

const showProjectSubmission = () => {
  if (task.value.completeUrl && task.value.completeUrl.startsWith('ipfs://')) {
    submissionHash.value = task.value.completeUrl.replace('ipfs://', '')
    showSubmissionViewer.value = true
  } else {
    alert('暂无项目成果数据或数据格式不正确')
  }
}

const handleSubmissionApprove = (data) => {
  console.log('雇主通过项目成果:', data)
  showSubmissionViewer.value = false
  showReviewModal.value = false
  
  // 调用原有的通过逻辑
  approveSubmission()
}

const handleSubmissionReject = (data) => {
  console.log('雇主拒绝项目成果:', data)
  showSubmissionViewer.value = false
  showReviewModal.value = false
  
  // 调用原有的拒绝逻辑
  rejectSubmission()
}

const handleNFTCreated = (nftData) => {
  console.log('NFT创建成功（从雇主端）:', nftData)
  alert(`🎉 项目已成功NFT化！\nToken ID: ${nftData.tokenId}\nIPFS Hash: ${nftData.ipfsHash}`)
}

// 加载项目提交数据
const loadSubmissionData = async () => {
  try {
    submissionData.value = null
    if (task.value.completeUrl && task.value.completeUrl.startsWith('ipfs://')) {
      const hash = task.value.completeUrl.replace('ipfs://', '')
      console.log('🔍 获取项目提交数据，hash:', hash)
      submissionData.value = await ipfsStore.getProjectSubmission(hash)
      console.log('✅ 提交数据获取成功')
    }
  } catch (err) {
    console.error('获取提交数据失败:', err)
  }
}

// 监听completeUrl变化
watch(() => task.value.completeUrl, () => {
  loadSubmissionData()
})

// 工具方法
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatDeadline = () => {
  if (!task.value.deadline) return '未设置'
  const deadline = new Date(task.value.deadline)
  const now = new Date()
  const diff = deadline - now
  
  if (diff < 0) return '已截止'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}天${hours}小时`
  return `${hours}小时`
}

const getTypeText = (taskType) => {
  const types = {
    0: '开发任务',
    1: '设计任务',
    2: '测试任务',
    3: '其他任务'
  }
  return types[taskType] || '未知类型'
}

const getBiddingEndDate = () => {
  if (!task.value.createdAt || !task.value.biddingPeriod) return '未设置'
  
  try {
    const createdAt = new Date(task.value.createdAt)
    const biddingPeriodHours = parseInt(task.value.biddingPeriod) || 72
    const biddingEndTime = new Date(createdAt.getTime() + biddingPeriodHours * 60 * 60 * 1000)
    
    return biddingEndTime.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.warn('计算竞标截止时间失败:', error)
    return '计算失败'
  }
}

// 生命周期
onMounted(() => {
  loadTask()
})
</script>

<style scoped>
.glass-effect {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.prose {
  max-width: none;
}

.prose p {
    margin-bottom: 1rem;
}
</style>