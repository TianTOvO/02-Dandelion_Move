<template>
  <div class="create-task min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面头部 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-neutral-900 mb-4">发布新任务</h1>
        <p class="text-xl text-neutral-600">
          创建您的任务需求，通过IPFS存储完整信息，吸引全球优秀的雇佣兵参与协作
        </p>
      </div>

      <!-- 发布流程指示器 -->
      <div class="mb-8">
        <nav aria-label="Progress">
          <ol class="flex items-center justify-center space-x-5">
            <li v-for="(step, stepIdx) in steps" :key="step.name" class="flex items-center">
              <div
                :class="[
                  stepIdx < currentStep ? 'bg-primary-600 text-white' : 
                  stepIdx === currentStep ? 'bg-primary-100 text-primary-600 border-2 border-primary-600' : 
                  'bg-gray-100 text-gray-400',
                  'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium'
                ]"
              >
                {{ stepIdx + 1 }}
              </div>
              <span
                :class="[
                  stepIdx < currentStep ? 'text-primary-600' : 'text-gray-500',
                  'ml-2 text-sm font-medium'
                ]"
              >
                {{ step.name }}
              </span>
              <svg
                v-if="stepIdx < steps.length - 1"
                class="w-5 h-5 text-gray-300 ml-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </li>
          </ol>
        </nav>
      </div>

      <!-- 表单内容 -->
      <div class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
        <form @submit.prevent="handleSubmit">
          <!-- 步骤1: 基本信息 -->
          <div v-show="currentStep === 0" class="space-y-8">
            <div class="max-w-4xl mx-auto">
              <!-- 任务基本信息 -->
              <div class="space-y-6">
                <h3 class="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">任务基本信息</h3>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    任务标题 *
                  </label>
                  <input
                    v-model="taskForm.title"
                    type="text"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请输入简洁明确的任务标题"
                    required
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    任务类型 *
                  </label>
                  <select
                    v-model="taskForm.taskType"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">请选择任务类型</option>
                    <option v-for="type in taskTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    任务描述 *
                  </label>
                  <textarea
                    v-model="taskForm.description"
                    rows="6"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请详细描述任务需求、背景、目标等..."
                    required
                  ></textarea>
                  <p class="mt-2 text-sm text-neutral-500">
                    建议包含：任务背景、具体需求、预期目标、验收标准等
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    技术要求
                  </label>
                  <textarea
                    v-model="taskForm.requirements"
                    rows="4"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请描述技术要求、开发环境、使用的技术栈等..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    所需技能标签
                  </label>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span
                      v-for="skill in taskForm.skillsRequired"
                      :key="skill"
                      class="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {{ skill }}
                      <button
                        type="button"
                        @click="removeSkill(skill)"
                        class="text-primary-500 hover:text-primary-700"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <input
                      v-model="newSkill"
                      type="text"
                      class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="输入技能标签，如：Vue.js, Python, 设计等"
                      @keyup.enter="addSkill"
                    >
                    <button
                      type="button"
                      @click="addSkill"
                      class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤2: 项目设置 -->
          <div v-show="currentStep === 1" class="space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- 奖励和时间设置 -->
              <div class="space-y-6">
                <h3 class="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">奖励和时间</h3>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    任务奖金 (APT) *
                  </label>
                  <input
                    v-model="taskForm.reward"
                    type="number"
                    step="0.1"
                    min="0.1"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.0"
                    required
                  >
                  <div class="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-700">
                      <strong>费用明细：</strong><br>
                      任务奖金: {{ taskForm.reward || 0 }} APT<br>
                      平台费用 (0.5%): {{ calculatePlatformFee() }} APT<br>
                      <strong>总计: {{ calculateTotal() }} APT</strong>
                    </p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    竞标期 *
                  </label>
                  <select
                    v-model="taskForm.biddingPeriod"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">请选择竞标期</option>
                    <option value="24">24小时</option>
                    <option value="48">48小时</option>
                    <option value="72">72小时 (推荐)</option>
                    <option value="120">5天</option>
                    <option value="168">7天</option>
                  </select>
                  <p class="mt-2 text-sm text-neutral-500">
                    竞标期内雇佣兵可以提交竞标申请，期满后将开始开发阶段
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    开发周期 *
                  </label>
                  <select
                    v-model="taskForm.developmentPeriod"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">请选择开发周期</option>
                    <option value="3">3天 (快速任务)</option>
                    <option value="7">7天</option>
                    <option value="14">14天 (推荐)</option>
                    <option value="21">21天</option>
                    <option value="30">30天</option>
                    <option value="45">45天</option>
                    <option value="60">60天 (大型项目)</option>
                  </select>
                  <p class="mt-2 text-sm text-neutral-500">
                    开发周期是雇佣兵完成任务的预期时间，影响项目进度安排
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    最终截止时间 *
                  </label>
                  <input
                    v-model="taskForm.deadline"
                    type="date"
                    :min="minDate"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                  
                  <!-- 实时时间计算提示 -->
                  <div class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div v-if="taskForm.biddingPeriod && taskForm.developmentPeriod">
                      <div v-if="getTimelinePlan().valid">
                        <h6 class="text-sm font-medium text-blue-800 mb-2">📅 实时时间规划</h6>
                        <div class="text-xs text-blue-700 space-y-1">
                          <div class="flex justify-between">
                            <span>🚀 任务发布:</span>
                            <span class="font-medium">{{ getTimelinePlan().formatted?.createdAt || '现在' }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span>📢 竞标截止:</span>
                            <span class="font-medium">{{ getTimelinePlan().formatted?.biddingEnd || '未计算' }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span>💡 建议完成:</span>
                            <span class="font-medium">{{ getTimelinePlan().formatted?.developmentEnd || '未计算' }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span>⏰ 建议截止:</span>
                            <span class="font-medium text-green-600">{{ getTimelinePlan().formatted?.minDeadline || '未计算' }}</span>
                          </div>
                          <div v-if="taskForm.deadline" class="flex justify-between border-t border-blue-200 pt-1">
                            <span>✅ 您的截止:</span>
                            <span class="font-medium" :class="getTimelinePlan().warning ? 'text-orange-600' : 'text-purple-600'">
                              {{ getTimelinePlan().formatted?.userDeadline || '未设置' }}
                            </span>
                          </div>
                          <div v-if="getTimelinePlan().status" class="text-center text-green-600 font-medium">
                            ✅ {{ getTimelinePlan().status }}
                          </div>
                          <div v-if="getTimelinePlan().warning" class="text-center text-orange-600 font-medium">
                            ⚠️ {{ getTimelinePlan().warning }}
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-sm text-gray-500">
                        {{ getTimelinePlan().message }}
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-500">
                      请先设置竞标期和开发周期以查看时间规划
                    </div>
                  </div>
                </div>
              </div>

              <!-- 项目特殊设置 -->
              <div class="space-y-6">
                <h3 class="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">项目设置</h3>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">GitHub集成</h4>
                      <p class="text-sm text-neutral-600">要求雇佣兵定期提交代码到GitHub仓库</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="taskForm.githubRequired"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div v-if="taskForm.githubRequired" class="ml-4">
                    <label class="block text-sm font-medium text-neutral-700 mb-2">
                      GitHub仓库链接
                    </label>
                    <input
                      v-model="taskForm.githubRepo"
                      type="url"
                      class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://github.com/username/repository"
                    >
                  </div>

                  <div class="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">智能验证</h4>
                      <p class="text-sm text-neutral-600">使用Chainlink预言机自动验证项目完成状态</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="taskForm.chainlinkVerification"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤3: 附件上传 -->
          <div v-show="currentStep === 2" class="space-y-6">
            <h3 class="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">任务附件</h3>
            
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                上传相关文件 (可选)
              </label>
              <div
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                class="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
              >
                <svg class="mx-auto h-16 w-16 text-neutral-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="mt-4">
                  <label class="cursor-pointer">
                    <span class="text-primary-600 hover:text-primary-500 font-medium text-lg">
                      点击上传文件
                    </span>
                    <span class="text-neutral-500"> 或拖拽文件到此处</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip,.rar"
                      class="hidden"
                      @change="handleFileSelect"
                    >
                  </label>
                </div>
                <p class="text-sm text-neutral-500 mt-2">
                  支持 PDF、Word、图片、压缩包等格式，单个文件最大 10MB
                </p>
              </div>
            </div>

            <!-- 已上传文件列表 -->
            <div v-if="uploadedFiles.length > 0" class="space-y-4">
              <h4 class="text-lg font-medium text-neutral-900">已上传文件 ({{ uploadedFiles.length }})</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(file, index) in uploadedFiles"
                  :key="index"
                  class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-neutral-900">{{ file.name }}</div>
                      <div class="text-xs text-neutral-500">{{ formatFileSize(file.size) }}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeFile(index)"
                    class="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤4: 确认发布 -->
          <div v-show="currentStep === 3" class="space-y-6">
            <h3 class="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">确认发布</h3>
            
            <!-- 任务预览 -->
            <div class="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
              <h4 class="text-lg font-semibold text-neutral-800 mb-4">任务预览</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 class="font-medium text-neutral-700 mb-2">基本信息</h5>
                  <ul class="space-y-1 text-sm text-neutral-600">
                    <li><strong>标题:</strong> {{ taskForm.title }}</li>
                    <li><strong>类型:</strong> {{ getTaskTypeLabel(taskForm.taskType) }}</li>
                    <li><strong>奖金:</strong> {{ taskForm.reward }} APT</li>
                    <li><strong>截止:</strong> {{ taskForm.deadline }}</li>
                  </ul>
                </div>
                <div>
                  <h5 class="font-medium text-neutral-700 mb-2">时间安排</h5>
                  <ul class="space-y-1 text-sm text-neutral-600">
                    <li><strong>竞标期:</strong> {{ taskForm.biddingPeriod }}小时</li>
                    <li><strong>开发周期:</strong> {{ taskForm.developmentPeriod }}天</li>
                    <li v-if="getTimelinePlan().valid" class="text-blue-600">
                      <strong>竞标截止:</strong> {{ getTimelinePlan().formatted?.biddingEnd }}
                    </li>
                    <li v-if="getTimelinePlan().valid" class="text-green-600">
                      <strong>建议完成:</strong> {{ getTimelinePlan().formatted?.developmentEnd }}
                    </li>
                    <li v-if="taskForm.deadline" class="text-purple-600">
                      <strong>最终截止:</strong> {{ getTimelinePlan().formatted?.userDeadline }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="mt-4">
                <h5 class="font-medium text-neutral-700 mb-2">描述</h5>
                <p class="text-sm text-neutral-600 line-clamp-3">{{ taskForm.description }}</p>
              </div>
              <div v-if="taskForm.skillsRequired.length > 0" class="mt-4">
                <h5 class="font-medium text-neutral-700 mb-2">所需技能</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="skill in taskForm.skillsRequired"
                    :key="skill"
                    class="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 费用明细 -->
            <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 class="text-lg font-semibold text-blue-800 mb-4">费用明细</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>任务奖金:</span>
                  <span>{{ taskForm.reward }} APT</span>
                </div>
                <div class="flex justify-between">
                  <span>平台费用 (0.5%):</span>
                  <span>{{ calculatePlatformFee() }} APT</span>
                </div>
                <div class="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                  <span>总计:</span>
                  <span>{{ calculateTotal() }} APT</span>
                </div>
              </div>
            </div>

            <!-- 确认条款 -->
            <div class="space-y-3">
              <label class="flex items-start space-x-3">
                <input
                  v-model="agreementChecked"
                  type="checkbox"
                  class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                >
                <span class="text-sm text-neutral-700">
                  我确认已仔细阅读任务信息，同意平台服务条款，并承诺按时支付奖金。
                </span>
              </label>
            </div>
          </div>

          <!-- 导航按钮 -->
          <div class="flex justify-between pt-8 border-t border-neutral-200">
            <button
              v-if="currentStep > 0"
              type="button"
              @click="currentStep--"
              class="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
            >
              上一步
            </button>
            <div v-else></div>
            
            <div class="flex space-x-4">
              <button
                v-if="currentStep < steps.length - 1"
                type="button"
                @click="nextStep"
                class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                下一步
              </button>
              <button
                v-else
                type="submit"
                :disabled="!canSubmit || submitting"
                class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg v-if="submitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ submitting ? '发布中...' : '发布任务' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 加载提示 -->
    <div v-if="submitting" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md mx-4">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-neutral-800 mb-2">正在发布任务</h3>
          <p class="text-sm text-neutral-600">{{ uploadProgress }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWeb3Store } from '@/stores/web3'
import { useIpfsStore } from '@/stores/ipfs'
import { TASK_TYPES } from '@/stores/data'
import { useDataStore } from '@/stores/data'
import { getTaskTimeline } from '@/utils/timeUtils'

const router = useRouter()
const web3Store = useWeb3Store()
const ipfsStore = useIpfsStore()
const dataStore = useDataStore()

// 表单步骤
const steps = [
  { name: '基本信息' },
  { name: '项目设置' },
  { name: '附件上传' },
  { name: '确认发布' }
]

const currentStep = ref(0)
const submitting = ref(false)
const uploadProgress = ref('')
const agreementChecked = ref(false)
const newSkill = ref('')

// 任务类型选项
const taskTypes = TASK_TYPES

// 表单数据
const taskForm = ref({
  title: '',
  description: '',
  requirements: '',
  taskType: '',
  skillsRequired: [],
  reward: '',
  deadline: '',
  biddingPeriod: '72', // 默认72小时
  developmentPeriod: '14', // 默认14天
  githubRequired: false,
  githubRepo: '',
  chainlinkVerification: false,
  employer: {
    address: '' // 只保留地址，其他信息在发布时自动获取
  },
  attachments: []
})

// 文件上传
const uploadedFiles = ref([])

// 计算属性
const minDate = computed(() => {
  // 如果已设置竞标期和开发周期，则基于时间规划计算最小日期
  const minDeadline = calculateMinDeadline()
  if (minDeadline) {
    return minDeadline
  }
  
  // 否则默认为明天
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const canSubmit = computed(() => {
  return agreementChecked.value && 
         taskForm.value.title && 
         taskForm.value.description && 
         taskForm.value.taskType && 
         taskForm.value.reward && 
         taskForm.value.deadline
})

const calculatePlatformFee = () => {
  const reward = parseFloat(taskForm.value.reward) || 0
  return (reward * 0.005).toFixed(3)
}

const calculateTotal = () => {
  const reward = parseFloat(taskForm.value.reward) || 0
  const fee = parseFloat(calculatePlatformFee())
  return (reward + fee).toFixed(3)
}

const calculateBiddingEndDate = () => {
  const timeline = getTaskTimeline({
    biddingPeriodHours: taskForm.value.biddingPeriod,
    developmentPeriodDays: taskForm.value.developmentPeriod
  })
  
  return timeline.valid ? timeline.formatted.biddingEndDate : '未设置'
}

const calculateDevelopmentEndDate = () => {
  const timeline = getTaskTimeline({
    biddingPeriodHours: taskForm.value.biddingPeriod,
    developmentPeriodDays: taskForm.value.developmentPeriod
  })
  
  return timeline.valid ? timeline.formatted.developmentEndDate : '未设置'
}

// 新增：计算建议的最小截止时间
const calculateMinDeadline = () => {
  const timeline = getTaskTimeline({
    biddingPeriodHours: taskForm.value.biddingPeriod,
    developmentPeriodDays: taskForm.value.developmentPeriod
  })
  
  return timeline.valid ? timeline.minDeadlineTime.toISOString().split('T')[0] : ''
}

// 新增：获取时间规划的详细信息
const getTimelinePlan = () => {
  return getTaskTimeline({
    biddingPeriodHours: taskForm.value.biddingPeriod,
    developmentPeriodDays: taskForm.value.developmentPeriod,
    userDeadline: taskForm.value.deadline
  })
}

// 方法
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const addSkill = () => {
  if (newSkill.value.trim() && !taskForm.value.skillsRequired.includes(newSkill.value.trim())) {
    taskForm.value.skillsRequired.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

const removeSkill = (skill) => {
  const index = taskForm.value.skillsRequired.indexOf(skill)
  if (index > -1) {
    taskForm.value.skillsRequired.splice(index, 1)
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  files.forEach(file => {
    if (file.size <= 10 * 1024 * 1024) { // 10MB limit
      uploadedFiles.value.push(file)
    } else {
      alert(`文件 ${file.name} 超过 10MB 限制`)
    }
  })
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getTaskTypeLabel = (value) => {
  const type = taskTypes.find(t => t.value === value)
  return type ? type.label : value
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  uploadProgress.value = '准备上传数据...'

  try {
    // 确保连接钱包
    if (!web3Store.isConnected) {
      await web3Store.connectWallet()
    }

    // 自动获取雇主地址
    taskForm.value.employer.address = web3Store.account
    console.log('雇主地址:', taskForm.value.employer.address)

    uploadProgress.value = '上传附件到IPFS...'
    
    // 上传附件到IPFS
    if (uploadedFiles.value.length > 0) {
      console.log('开始上传附件，文件数量:', uploadedFiles.value.length)
      const attachments = await ipfsStore.uploadAttachments(uploadedFiles.value)
      taskForm.value.attachments = attachments
      console.log('附件上传完成，IPFS哈希:', attachments)
    } else {
      console.log('无附件需要上传')
    }

    uploadProgress.value = '上传任务数据到IPFS...'
    
    // 准备任务数据，包含完整信息
    const taskData = {
      ...taskForm.value,
      createdAt: new Date().toISOString(),
      version: '1.0'
    }
    
    console.log('准备上传的任务数据:', taskData)
    
    // 上传完整任务数据到IPFS
    const ipfsHash = await ipfsStore.uploadTaskData(taskData)
    console.log('任务数据IPFS哈希:', ipfsHash)
    
    uploadProgress.value = '创建区块链交易...'
    
    // 调用智能合约创建任务
    console.log('调用智能合约，参数:', {
      title: taskForm.value.title,
      ipfsHash: ipfsHash,
      reward: taskForm.value.reward,
      deadline: Math.floor(new Date(taskForm.value.deadline).getTime() / 1000),
      taskType: parseInt(taskForm.value.taskType),
      biddingPeriod: parseInt(taskForm.value.biddingPeriod),
      developmentPeriod: parseInt(taskForm.value.developmentPeriod)
    })
    
    const result = await web3Store.createTask(
      taskForm.value.title,
      ipfsHash,
      taskForm.value.reward,
      Math.floor(new Date(taskForm.value.deadline).getTime() / 1000),
      parseInt(taskForm.value.taskType),
      parseInt(taskForm.value.biddingPeriod),
      parseInt(taskForm.value.developmentPeriod)
    )

    console.log('智能合约调用结果:', result)
    uploadProgress.value = '任务创建成功！正在同步数据...'
    
    // 确保数据同步到本地存储
    try {
      // 重新加载任务数据以确保同步
      await dataStore.getAllTasks()
      
      // 等待一小段时间确保数据完全同步
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 验证任务是否存在
      try {
        if (result.taskId) {
          const createdTask = await dataStore.fetchTaskById(result.taskId)
          if (createdTask) {
            console.log('✅ 任务创建并同步成功:', createdTask.title)
            uploadProgress.value = '任务创建成功！正在跳转...'
          } else {
            console.warn('⚠️ 任务验证失败，但仍将跳转')
            uploadProgress.value = '任务创建成功！正在跳转...'
          }
        } else {
          console.warn('⚠️ 未获取到任务ID，但仍将跳转')
          uploadProgress.value = '任务创建成功！正在跳转...'
        }
      } catch (verifyError) {
        console.warn('⚠️ 任务验证失败，但仍将跳转:', verifyError.message)
        uploadProgress.value = '任务创建成功！正在跳转...'
      }
    } catch (syncError) {
      console.warn('⚠️ 数据同步失败，但任务已创建:', syncError.message)
      uploadProgress.value = '任务创建成功！正在跳转...'
    }
    
    // 跳转到任务详情页
    setTimeout(() => {
      if (result.taskId) {
        router.push(`/task/${result.taskId}`)
      } else {
        // 如果没有任务ID，跳转到任务列表页
        router.push('/tasks')
      }
    }, 1500)

  } catch (error) {
    console.error('创建任务失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    alert('创建任务失败: ' + error.message)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 初始化IPFS
  ipfsStore.initIPFS()
  
  // 如果已连接钱包，自动获取雇主地址
  if (web3Store.isConnected) {
    taskForm.value.employer.address = web3Store.account
  }
})

// 表单验证
const validateForm = () => {
  const errors = []
  
  if (!taskForm.value.title.trim()) {
    errors.push('任务标题不能为空')
  }
  
  if (!taskForm.value.description.trim()) {
    errors.push('任务描述不能为空')
  }
  
  if (!taskForm.value.taskType) {
    errors.push('请选择任务类型')
  }
  
  if (!taskForm.value.reward || parseFloat(taskForm.value.reward) <= 0) {
    errors.push('请输入有效的任务奖金')
  }
  
  if (!taskForm.value.deadline) {
    errors.push('请选择截止时间')
  }
  
  if (!taskForm.value.biddingPeriod) {
    errors.push('请选择竞标期')
  }
  
  if (!taskForm.value.developmentPeriod) {
    errors.push('请选择开发周期')
  }
  
  // 验证时间逻辑
  if (taskForm.value.deadline && taskForm.value.biddingPeriod && taskForm.value.developmentPeriod) {
    try {
      const timeline = getTimelinePlan()
      
      if (!timeline.valid) {
        errors.push('时间规划计算失败，请检查竞标期和开发周期设置')
        return errors
      }
      
      if (timeline.warning) {
        errors.push(timeline.warning)
      }
      
      // 检查截止时间不能早于当前时间
      const deadline = new Date(taskForm.value.deadline)
      const now = new Date()
      
      if (deadline < now) {
        errors.push('截止时间不能早于当前时间')
      }
      
    } catch (timeError) {
      console.warn('时间验证失败:', timeError)
      errors.push('时间设置验证失败，请检查输入')
    }
  }
  
  return errors
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 设置所有输入框的文字颜色为黑色 */
input[type="text"],
input[type="number"],
input[type="url"],
input[type="date"],
input[type="email"],
textarea,
select {
  color: #000 !important;
}

/* 设置输入框placeholder的颜色 */
input::placeholder,
textarea::placeholder {
  color: #666 !important;
}

/* 设置选择框选中项的文字颜色 */
select option {
  color: #000 !important;
}

/* 确保焦点状态下的文字颜色也是黑色 */
input:focus,
textarea:focus,
select:focus {
  color: #000 !important;
}
</style> 