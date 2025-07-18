<template>
  <div class="profile-page min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面头部 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-neutral-900 mb-4">个人中心</h1>
        <p class="text-xl text-neutral-600">
          管理您的个人资料和任务历史，所有数据通过IPFS分布式存储
        </p>
      </div>

      <!-- 角色切换 -->
      <div class="mb-8">
        <div class="flex space-x-1 bg-neutral-100 p-1 rounded-lg w-fit">
          <button
            v-for="role in availableRoles"
            :key="role.value"
            @click="currentRole = role.value"
            :class="[
              currentRole === role.value
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900',
              'px-4 py-2 rounded-md font-medium transition-colors'
            ]"
          >
            {{ role.label }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：个人信息 -->
        <div class="lg:col-span-1">
          <div class="glass-effect rounded-2xl p-6 border border-neutral-200/50 sticky top-8">
            <!-- 头像和基本信息 -->
            <div class="text-center mb-6">
              <div class="relative inline-block">
                <div class="w-24 h-24 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img
                    v-if="userProfile.avatar"
                    :src="getImageUrl(userProfile.avatar)"
                    alt="头像"
                    class="w-24 h-24 rounded-full object-cover"
                  />
                  <span v-else class="text-white text-2xl font-bold">
                    {{ getInitials(userProfile.name || web3Store.account) }}
                  </span>
                </div>
                <button
                  v-if="isEditing"
                  @click="$refs.avatarInput.click()"
                  class="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"
                />
              </div>
              
              <h2 class="text-xl font-bold text-neutral-900">
                {{ userProfile.name || '未设置昵称' }}
              </h2>
              <p class="text-sm text-neutral-600 font-mono">
                {{ formatAddress(web3Store.account) }}
              </p>
              
              <!-- 角色标签 -->
              <div class="flex flex-wrap justify-center gap-2 mt-3">
                <span
                  v-for="role in userProfile.roles"
                  :key="role"
                  :class="getRoleClass(role)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ getRoleLabel(role) }}
                </span>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center p-3 bg-neutral-50 rounded-lg">
                <div class="text-2xl font-bold text-primary-600">
                  {{ userProfile.stats?.tasksCreated || 0 }}
                </div>
                <div class="text-xs text-neutral-600">发布任务</div>
              </div>
              <div class="text-center p-3 bg-neutral-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">
                  {{ userProfile.stats?.tasksCompleted || 0 }}
                </div>
                <div class="text-xs text-neutral-600">完成任务</div>
              </div>
              <div class="text-center p-3 bg-neutral-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">
                  {{ userProfile.stats?.totalEarned || 0 }}
                </div>
                <div class="text-xs text-neutral-600">总收入 (AVAX)</div>
              </div>
              <div class="text-center p-3 bg-neutral-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">
                  {{ (userProfile.stats?.rating || 0).toFixed(1) }}
                </div>
                <div class="text-xs text-neutral-600">评分</div>
              </div>
            </div>

            <!-- 编辑按钮 -->
            <div class="flex space-x-3">
              <button
                v-if="!isEditing"
                @click="startEditing"
                class="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                编辑资料
              </button>
              <template v-else>
                <button
                  @click="saveProfile"
                  :disabled="saving"
                  class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {{ saving ? '保存中...' : '保存' }}
                </button>
                <button
                  @click="cancelEditing"
                  class="flex-1 bg-neutral-600 text-white py-2 px-4 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  取消
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- 右侧：详细信息和任务历史 -->
        <div class="lg:col-span-2 space-y-8">
          <!-- 用户统计概览 -->
          <div class="glass-effect rounded-2xl p-6 border border-neutral-200/50 mb-8">
            <!-- IPFS调试工具 -->
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-blue-800">🛠️ IPFS数据同步</span>
                <button
                  @click="refreshUserData"
                  class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  刷新用户数据
                </button>
              </div>
              
              <!-- 新增调试按钮 -->
              <div class="flex gap-2 mt-2">
                <button
                  @click="debugTaskLoading"
                  class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  调试任务加载
                </button>
                <button
                  @click="showContractTasks"
                  class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  显示合约任务
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 mb-2">{{ userStats?.totalTasks || 0 }}</div>
                <div class="text-xs text-neutral-600">总任务数</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600 mb-2">{{ userStats?.totalCompletedTasks || 0 }}</div>
                <div class="text-xs text-neutral-600">已完成任务</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-yellow-600 mb-2">{{ userStats?.totalEarned || 0 }}</div>
                <div class="text-xs text-neutral-600">总收入 (AVAX)</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 mb-2">{{ (userStats?.averageRating || 5.0).toFixed(2) }}</div>
                <div class="text-xs text-neutral-600">平均评分</div>
              </div>
            </div>
          </div>

          <!-- 个人详细信息 -->
          <div class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
            <h3 class="text-2xl font-bold text-neutral-900 mb-6">个人信息</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 基本信息 -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    显示名称
                  </label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.name"
                    type="text"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="您的姓名或昵称"
                  />
                  <p v-else class="text-neutral-900">{{ userProfile.name || '未设置' }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    邮箱地址
                  </label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.email"
                    type="email"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                  <p v-else class="text-neutral-900">{{ userProfile.email || '未设置' }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    网站链接
                  </label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.website"
                    type="url"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://your-website.com"
                  />
                  <a
                    v-else-if="userProfile.website"
                    :href="userProfile.website"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-800"
                  >
                    {{ userProfile.website }}
                  </a>
                  <p v-else class="text-neutral-500">未设置</p>
                </div>
              </div>

              <!-- 社交链接 -->
              <div class="space-y-4">
                <h4 class="font-medium text-neutral-800">社交媒体</h4>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    GitHub
                  </label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.socialLinks.github"
                    type="url"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://github.com/username"
                  />
                  <a
                    v-else-if="userProfile.socialLinks?.github"
                    :href="userProfile.socialLinks.github"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-800 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                  <p v-else class="text-neutral-500">未设置</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    Twitter
                  </label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.socialLinks.twitter"
                    type="url"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://twitter.com/username"
                  />
                  <a
                    v-else-if="userProfile.socialLinks?.twitter"
                    :href="userProfile.socialLinks.twitter"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-800 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </a>
                  <p v-else class="text-neutral-500">未设置</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.socialLinks.linkedin"
                    type="url"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                  <a
                    v-else-if="userProfile.socialLinks?.linkedin"
                    :href="userProfile.socialLinks.linkedin"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-800 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                  <p v-else class="text-neutral-500">未设置</p>
                </div>
              </div>
            </div>

            <!-- 个人简介 -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                个人简介
              </label>
              <textarea
                v-if="isEditing"
                v-model="editForm.bio"
                rows="4"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="介绍一下您的专业背景和经验..."
              ></textarea>
              <p v-else class="text-neutral-900 whitespace-pre-line">
                {{ userProfile.bio || '这个人很懒，什么都没写...' }}
              </p>
            </div>

            <!-- 技能标签 -->
            <div v-if="currentRole === 'freelancer'" class="mt-6">
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                专业技能
              </label>
              <div v-if="isEditing" class="space-y-3">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="skill in editForm.skills"
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
                    placeholder="输入技能标签"
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
              <div v-else class="flex flex-wrap gap-2">
                <span
                  v-for="skill in userProfile.skills"
                  :key="skill"
                  class="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                >
                  {{ skill }}
                </span>
                <span v-if="!userProfile.skills?.length" class="text-neutral-500">
                  暂未添加技能标签
                </span>
              </div>
            </div>
          </div>

          <!-- 任务历史 -->
          <div class="glass-effect rounded-2xl p-8 border border-neutral-200/50">
            <h3 class="text-2xl font-bold text-neutral-900 mb-6">
              {{ currentRole === 'employer' ? '发布的任务' : '参与的任务' }}
            </h3>
            
            <!-- 任务筛选 -->
            <div class="flex space-x-4 mb-6">
              <button
                v-for="status in taskStatuses"
                :key="status.value"
                @click="selectedStatus = status.value"
                :class="[
                  selectedStatus === status.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                  'px-4 py-2 rounded-lg transition-colors'
                ]"
              >
                {{ status.label }}
              </button>
            </div>

            <!-- 任务列表 -->
            <div v-if="filteredTasks.length > 0" class="space-y-4">
              <div
                v-for="task in filteredTasks"
                :key="task.id"
                class="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                @click="$router.push(`/task/${task.id}`)"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-neutral-900 mb-2">{{ task.title }}</h4>
                    <p class="text-neutral-600 line-clamp-2">{{ task.description }}</p>
                  </div>
                  <div class="ml-4 text-right">
                    <span :class="getTaskStatusClass(task.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                      {{ getTaskStatusText(task.status) }}
                    </span>
                    <div class="text-lg font-bold text-primary-600 mt-2">
                      {{ task.reward }} AVAX
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between text-sm text-neutral-500">
                  <div class="flex items-center space-x-4">
                    <span>{{ formatDate(task.createdAt) }}</span>
                    <span>{{ getTaskTypeLabel(task.taskType) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>{{ task.participants || 0 }} 参与者</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-12">
              <div class="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p class="text-neutral-600">暂无相关任务</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载提示 -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md mx-4">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-neutral-800 mb-2">{{ loadingText }}</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWeb3Store } from '@/stores/web3'
import { useIpfsStore } from '@/stores/ipfs'
import { useDataStore, TASK_TYPES, TASK_STATUS } from '@/stores/data'

const router = useRouter()
const web3Store = useWeb3Store()
const ipfsStore = useIpfsStore()
const dataStore = useDataStore()

// 响应式数据
const loading = ref(true)
const loadingText = ref('加载用户资料...')
const saving = ref(false)
const isEditing = ref(false)
const currentRole = ref('employer') // 当前查看的角色
const selectedStatus = ref('all')
const newSkill = ref('')

// 用户资料数据
const userProfile = ref({
  address: '',
  name: '',
  email: '',
  bio: '',
  avatar: '',
  website: '',
  socialLinks: {
    github: '',
    twitter: '',
    linkedin: ''
  },
  skills: [],
  roles: ['employer', 'freelancer'],
  stats: {
    tasksCreated: 0,
    tasksCompleted: 0,
    totalEarned: 0,
    successRate: 0,
    rating: 0,
    reviews: []
  }
})

// 编辑表单数据
const editForm = ref({})

// 用户任务数据
const userTasks = ref([])

// 用户统计数据
const userStats = ref({
  totalTasks: 0,
  totalCreatedTasks: 0,
  totalCompletedTasks: 0,
  totalEarned: 0,
  averageRating: 5.0
})

// 可用角色
const availableRoles = [
  { value: 'employer', label: '雇主' },
  { value: 'freelancer', label: '雇佣兵' }
]

// 任务状态选项
const taskStatuses = [
  { value: 'all', label: '全部' },
  { value: '0', label: '开放中' },
  { value: '1', label: '竞标中' },
  { value: '2', label: '进行中' },
  { value: '3', label: '待审核' },
  { value: '4', label: '已完成' },
  { value: '5', label: '已取消' }
]

// 计算属性
const filteredTasks = computed(() => {
  let tasks = userTasks.value

  console.log('🔍 筛选任务，总任务数:', tasks.length)
  console.log('🔍 当前用户地址:', web3Store.account)
  console.log('🔍 当前角色:', currentRole.value)

  // 根据角色筛选任务
  if (currentRole.value === 'employer') {
    // 雇主：显示自己创建的任务
    tasks = tasks.filter(task => {
      const isCreator = task.creator && task.creator.toLowerCase() === web3Store.account?.toLowerCase()
      if (isCreator) {
        console.log('✅ 找到雇主任务:', task.id, task.title)
      }
      return isCreator
    })
    console.log('📋 雇主任务数量:', tasks.length)
  } else {
    // 雇佣兵：显示参与的任务（确保类型安全）
    tasks = tasks.filter(task => {
      const userAddress = web3Store.account?.toLowerCase()
      if (!userAddress) return false
      
      const isParticipant = (
        // 检查bidders数组
        (Array.isArray(task.bidders) && task.bidders.some(bidder => {
          const bidderAddress = typeof bidder === 'string' ? bidder : bidder.address
          return bidderAddress && bidderAddress.toLowerCase() === userAddress
        })) ||
        // 检查participants数组（确保是数组）
        (Array.isArray(task.participants) && task.participants.some(participant => 
          participant && participant.toLowerCase() === userAddress
        )) ||
        // 检查是否是中标者
        (task.winner && task.winner.toLowerCase() === userAddress)
      )
      
      if (isParticipant) {
        console.log('✅ 找到参与任务:', task.id, task.title)
      }
      return isParticipant
    })
    console.log('📋 参与任务数量:', tasks.length)
  }

  // 根据状态筛选
  if (selectedStatus.value !== 'all') {
    const statusFilter = parseInt(selectedStatus.value)
    tasks = tasks.filter(task => {
      const taskStatus = typeof task.status === 'number' ? task.status : parseInt(task.status)
      return taskStatus === statusFilter
    })
    console.log('📋 状态筛选后任务数量:', tasks.length, '状态:', selectedStatus.value)
  }

  // 按创建时间排序（最新的在前）
  const sortedTasks = tasks.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.deadlineDate || 0)
    const dateB = new Date(b.createdAt || b.deadlineDate || 0)
    return dateB - dateA
  })

  console.log('📋 最终筛选结果:', sortedTasks.length, '个任务')
  return sortedTasks
})

// 方法
const loadUserProfile = async () => {
  try {
    loading.value = true
    loadingText.value = '从IPFS加载用户资料...'

    // 首先尝试从链上获取用户的IPFS哈希
    // 这里假设有一个方法可以获取用户资料的IPFS哈希
    let profileHash = null
    
    try {
      // 尝试从合约获取用户资料哈希
      if (web3Store.contractService) {
        profileHash = await web3Store.contractService.getUserProfileHash(web3Store.account)
      }
    } catch (error) {
      console.log('用户尚未设置资料')
    }

    if (profileHash) {
      // 从IPFS加载用户资料
      const profile = await ipfsStore.getUserProfile(profileHash)
      userProfile.value = { ...userProfile.value, ...profile }
    } else {
      // 初始化默认资料
      userProfile.value.address = web3Store.account
    }

    // 加载用户任务历史
    loadingText.value = '加载任务历史...'
    await loadUserTasks()
    
    // 确保统计数据正确初始化
    updateUserStats()

  } catch (error) {
    console.error('加载用户资料失败:', error)
  } finally {
    loading.value = false
  }
}

const loadUserTasks = async () => {
  try {
    console.log('🔄 加载用户任务历史...')
    console.log('👤 当前用户地址:', web3Store.account)
    
    // 从数据存储加载所有任务，确保从IPFS和合约获取最新数据
    await dataStore.getAllTasks()
    const allTasks = dataStore.tasks
    
    console.log('📋 所有任务数量:', allTasks.length)
    console.log('📋 任务列表预览:', allTasks.map(task => ({
      id: task.id,
      title: task.title,
      creator: task.creator,
      fromContract: task.fromContract
    })))
    
    // 筛选与当前用户相关的任务
    userTasks.value = allTasks.filter(task => {
      const userAddress = web3Store.account?.toLowerCase()
      if (!userAddress) return false
      
      // 检查是否是任务创建者
      const isCreator = task.creator && task.creator.toLowerCase() === userAddress
      
      // 检查是否是参与者（支持多种格式，确保类型安全）
      const isParticipant = (
        // 检查bidders数组
        (Array.isArray(task.bidders) && task.bidders.some(bidder => {
          const bidderAddress = typeof bidder === 'string' ? bidder : bidder.address
          return bidderAddress && bidderAddress.toLowerCase() === userAddress
        })) ||
        // 检查participants数组（确保是数组）
        (Array.isArray(task.participants) && task.participants.some(participant => 
          participant && participant.toLowerCase() === userAddress
        ))
      )
      
      // 检查是否是中标者
      const isWinner = task.winner && task.winner.toLowerCase() === userAddress
      
      const isRelated = isCreator || isParticipant || isWinner
      
      if (isRelated) {
        console.log('✅ 找到相关任务:', {
          id: task.id,
          title: task.title,
          isCreator,
          isParticipant,
          isWinner,
          fromContract: task.fromContract,
          participantsType: typeof task.participants,
          participantsIsArray: Array.isArray(task.participants),
          biddersType: typeof task.bidders,
          biddersIsArray: Array.isArray(task.bidders)
        })
      }
      
      return isRelated
    })

    console.log('✅ 用户任务加载成功，相关任务数:', userTasks.value.length)
    console.log('📋 用户相关任务:', userTasks.value.map(task => ({
      id: task.id,
      title: task.title,
      creator: task.creator,
      status: task.status,
      fromContract: task.fromContract
    })))
    
    // 更新统计信息
    updateUserStats()

  } catch (error) {
    console.error('❌ 加载用户任务失败:', error)
  }
}

const updateUserStats = () => {
  const createdTasks = userTasks.value.filter(task => task.creator === web3Store.account)
  const completedTasks = userTasks.value.filter(task => 
    (task.creator === web3Store.account || task.winner === web3Store.account) && 
    task.status === TASK_STATUS.COMPLETED
  )
  
  const totalEarned = completedTasks
    .filter(task => task.winner === web3Store.account)
    .reduce((sum, task) => sum + (task.reward || 0), 0)
  
  userStats.value = {
    totalTasks: userTasks.value.length,
    totalCreatedTasks: createdTasks.length,
    totalCompletedTasks: completedTasks.length,
    totalEarned: totalEarned,
    averageRating: userProfile.value.rating || 5.0
  }
}

const startEditing = () => {
  editForm.value = JSON.parse(JSON.stringify(userProfile.value))
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  editForm.value = {}
}

const saveProfile = async () => {
  try {
    saving.value = true

    // 上传更新的资料到IPFS
    const profileHash = await ipfsStore.uploadUserProfile(editForm.value)

    // 更新链上的资料哈希（如果有相关合约方法）
    try {
      if (web3Store.contractService && web3Store.contractService.updateUserProfile) {
        await web3Store.contractService.updateUserProfile(profileHash)
      }
    } catch (error) {
      console.warn('更新链上资料哈希失败:', error)
    }

    // 更新本地数据
    userProfile.value = { ...editForm.value }
    isEditing.value = false

    console.log('用户资料保存成功，IPFS哈希:', profileHash)

  } catch (error) {
    console.error('保存用户资料失败:', error)
    alert('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    // 上传头像到IPFS
    const avatarHash = await ipfsStore.uploadFile(file)
    editForm.value.avatar = avatarHash
  } catch (error) {
    console.error('上传头像失败:', error)
    alert('上传头像失败: ' + error.message)
  }
}

const addSkill = () => {
  if (newSkill.value.trim() && !editForm.value.skills.includes(newSkill.value.trim())) {
    editForm.value.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

const removeSkill = (skill) => {
  const index = editForm.value.skills.indexOf(skill)
  if (index > -1) {
    editForm.value.skills.splice(index, 1)
  }
}

// 工具方法
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.slice(0, 2).toUpperCase()
}

const getImageUrl = (hash) => {
  return ipfsStore.getFileURL(hash)
}

const getRoleClass = (role) => {
  const classes = {
    employer: 'bg-blue-100 text-blue-700',
    freelancer: 'bg-green-100 text-green-700',
    arbitrator: 'bg-purple-100 text-purple-700'
  }
  return classes[role] || 'bg-gray-100 text-gray-700'
}

const getRoleLabel = (role) => {
  const labels = {
    employer: '雇主',
    freelancer: '雇佣兵',
    arbitrator: '仲裁员'
  }
  return labels[role] || role
}

const getTaskStatusClass = (status) => {
  const classes = {
    0: 'bg-gray-100 text-gray-700',
    1: 'bg-blue-100 text-blue-700',
    2: 'bg-yellow-100 text-yellow-700',
    3: 'bg-orange-100 text-orange-700',
    4: 'bg-green-100 text-green-700',
    5: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getTaskStatusText = (status) => {
  const texts = {
    0: '开放中',
    1: '竞标中',
    2: '进行中',
    3: '待审核',
    4: '已完成',
    5: '已取消'
  }
  return texts[status] || '未知'
}

const getTaskTypeLabel = (type) => {
  const taskType = TASK_TYPES.find(t => t.value === parseInt(type))
  return taskType ? taskType.label : '其他'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 刷新用户数据方法
const refreshUserData = async () => {
  console.log('🔄 手动刷新用户数据...')
  await loadUserProfile()
}

// 添加调试方法
const debugTaskLoading = async () => {
  console.log('🐛 开始调试任务加载...')
  
  try {
    // 1. 检查钱包连接状态
    console.log('👛 钱包连接状态:', {
      isConnected: web3Store.isConnected,
      account: web3Store.account,
      hasContractService: !!web3Store.contractService
    })
    
    // 2. 强制重新加载所有任务
    console.log('📋 强制重新加载任务...')
    dataStore.tasks = [] // 清空现有任务
    await dataStore.getAllTasks()
    
    console.log('📋 加载后任务总数:', dataStore.tasks.length)
    console.log('📋 任务详情:', dataStore.tasks.map(task => ({
      id: task.id,
      title: task.title,
      creator: task.creator,
      fromContract: task.fromContract,
      status: task.status
    })))
    
    // 3. 重新加载用户任务
    await loadUserTasks()
    
    console.log('✅ 调试完成，用户相关任务数:', userTasks.value.length)
    
  } catch (error) {
    console.error('❌ 调试过程出错:', error)
  }
}

const showContractTasks = async () => {
  console.log('🔗 显示合约任务信息...')
  
  try {
    if (!web3Store.aptosContractService) {
      console.log('⚠️ Aptos合约服务未初始化，尝试初始化...')
      const success = await web3Store.initializeContracts()
      if (!success) {
        console.log('❌ 合约服务初始化失败')
        return
      }
    }
    
    // 使用aptosContractService获取任务
    const contractTasks = await web3Store.aptosContractService.getAllTasks()
    console.log('🏗️ 合约任务数量:', contractTasks.length)
    console.log('🏗️ 合约任务列表:', contractTasks.map(task => ({
      id: task.id,
      title: task.title,
      creator: task.creator,
      status: task.status,
      budget: task.budget
    })))
    
    // 检查哪些任务属于当前用户
    const userContractTasks = contractTasks.filter(task => 
      task.creator && task.creator.toLowerCase() === web3Store.account?.toLowerCase()
    )
    
    console.log('👤 当前用户的合约任务:', userContractTasks.length, '个')
    console.log('👤 用户任务详情:', userContractTasks)
    
  } catch (error) {
    console.error('❌ 获取合约任务失败:', error)
  }
}

// 监听钱包连接状态
watch(() => web3Store.isConnected, (isConnected) => {
  if (isConnected) {
    loadUserProfile()
  }
})

onMounted(() => {
  // 初始化IPFS
  ipfsStore.initIPFS()
  
  // 如果钱包已连接，加载用户资料
  if (web3Store.isConnected) {
    loadUserProfile()
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>