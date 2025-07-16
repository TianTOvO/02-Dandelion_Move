<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">时间计算功能测试</h2>
    
    <!-- 输入参数 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">竞标期（小时）</label>
        <select v-model="testParams.biddingPeriod" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="24">24小时</option>
          <option value="48">48小时</option>
          <option value="72">72小时</option>
          <option value="120">5天</option>
          <option value="168">7天</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">开发周期（天）</label>
        <select v-model="testParams.developmentPeriod" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="3">3天</option>
          <option value="7">7天</option>
          <option value="14">14天</option>
          <option value="21">21天</option>
          <option value="30">30天</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">用户截止时间</label>
        <input 
          v-model="testParams.userDeadline" 
          type="date" 
          class="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
      </div>
    </div>
    
    <!-- 实时计算结果 -->
    <div class="bg-blue-50 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold text-blue-800 mb-4">📅 实时时间规划</h3>
      
      <div v-if="timeline.valid" class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">🚀 任务发布:</span>
              <span class="font-medium">{{ timeline.formatted.createdAt }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">📢 竞标截止:</span>
              <span class="font-medium text-blue-600">{{ timeline.formatted.biddingEnd }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">💡 建议完成:</span>
              <span class="font-medium text-green-600">{{ timeline.formatted.developmentEnd }}</span>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">⏰ 建议截止:</span>
              <span class="font-medium text-green-600">{{ timeline.formatted.minDeadline }}</span>
            </div>
            <div v-if="testParams.userDeadline" class="flex justify-between">
              <span class="text-gray-600">✅ 您的截止:</span>
              <span class="font-medium" :class="timeline.warning ? 'text-red-600' : 'text-purple-600'">
                {{ timeline.formatted.userDeadline }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 状态信息 -->
        <div class="mt-4 pt-4 border-t border-blue-200">
          <div v-if="timeline.status" class="text-center text-green-600 font-medium mb-2">
            ✅ {{ timeline.status }}
          </div>
          <div v-if="timeline.warning" class="text-center text-orange-600 font-medium">
            ⚠️ {{ timeline.warning }}
          </div>
        </div>
      </div>
      
      <div v-else class="text-gray-500">
        {{ timeline.message }}
      </div>
    </div>
    
    <!-- 时间差计算 -->
    <div class="bg-gray-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">⏱️ 时间差计算</h3>
      
      <div v-if="timeline.valid" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="bg-white p-3 rounded border">
          <div class="font-medium text-blue-600 mb-1">竞标期剩余</div>
          <div class="text-gray-700">{{ getBiddingTimeLeft() }}</div>
        </div>
        
        <div class="bg-white p-3 rounded border">
          <div class="font-medium text-green-600 mb-1">开发期长度</div>
          <div class="text-gray-700">{{ getDevelopmentDuration() }}</div>
        </div>
        
        <div class="bg-white p-3 rounded border">
          <div class="font-medium text-purple-600 mb-1">总项目周期</div>
          <div class="text-gray-700">{{ getTotalDuration() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getTaskTimeline, formatTimeDifference } from '@/utils/timeUtils'

// 测试参数
const testParams = ref({
  biddingPeriod: '72',
  developmentPeriod: '14',
  userDeadline: ''
})

// 计算时间线
const timeline = computed(() => {
  return getTaskTimeline({
    biddingPeriodHours: parseInt(testParams.value.biddingPeriod),
    developmentPeriodDays: parseInt(testParams.value.developmentPeriod),
    userDeadline: testParams.value.userDeadline
  })
})

// 计算竞标期剩余时间
const getBiddingTimeLeft = () => {
  if (!timeline.value.valid) return '计算失败'
  
  const now = new Date()
  return formatTimeDifference(now, timeline.value.biddingEndTime)
}

// 计算开发期长度
const getDevelopmentDuration = () => {
  if (!timeline.value.valid) return '计算失败'
  
  return formatTimeDifference(timeline.value.biddingEndTime, timeline.value.developmentEndTime)
}

// 计算总项目周期
const getTotalDuration = () => {
  if (!timeline.value.valid) return '计算失败'
  
  return formatTimeDifference(timeline.value.createdAt, timeline.value.minDeadlineTime)
}

// 监听参数变化，自动更新计算结果
watch(testParams, () => {
  console.log('参数变化，重新计算时间线:', testParams.value)
  console.log('计算结果:', timeline.value)
}, { deep: true })
</script>

<style scoped>
/* 测试组件样式 */

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