/**
 * 任务时间计算工具函数
 * 统一管理所有与任务时间相关的计算逻辑
 */

/**
 * 计算竞标截止时间
 * @param {Date|string} createdAt - 任务创建时间
 * @param {number} biddingPeriodHours - 竞标期（小时）
 * @returns {Date} 竞标截止时间
 */
export function calculateBiddingEndTime(createdAt, biddingPeriodHours) {
  try {
    const createTime = new Date(createdAt)
    const biddingPeriod = parseInt(biddingPeriodHours) || 72
    
    if (isNaN(createTime.getTime())) {
      throw new Error('无效的创建时间')
    }
    
    return new Date(createTime.getTime() + biddingPeriod * 60 * 60 * 1000)
  } catch (error) {
    console.warn('计算竞标截止时间失败:', error)
    return new Date() // 返回当前时间作为兜底
  }
}

/**
 * 计算建议的开发完成时间
 * @param {Date|string} createdAt - 任务创建时间
 * @param {number} biddingPeriodHours - 竞标期（小时）
 * @param {number} developmentPeriodDays - 开发周期（天）
 * @returns {Date} 建议开发完成时间
 */
export function calculateDevelopmentEndTime(createdAt, biddingPeriodHours, developmentPeriodDays) {
  try {
    const biddingEndTime = calculateBiddingEndTime(createdAt, biddingPeriodHours)
    const developmentPeriod = parseInt(developmentPeriodDays) || 14
    
    return new Date(biddingEndTime.getTime() + developmentPeriod * 24 * 60 * 60 * 1000)
  } catch (error) {
    console.warn('计算开发完成时间失败:', error)
    return new Date() // 返回当前时间作为兜底
  }
}

/**
 * 计算建议的最小截止时间（包含缓冲时间）
 * @param {Date|string} createdAt - 任务创建时间
 * @param {number} biddingPeriodHours - 竞标期（小时）
 * @param {number} developmentPeriodDays - 开发周期（天）
 * @param {number} bufferDays - 缓冲天数，默认1天
 * @returns {Date} 建议最小截止时间
 */
export function calculateMinDeadlineTime(createdAt, biddingPeriodHours, developmentPeriodDays, bufferDays = 1) {
  try {
    const developmentEndTime = calculateDevelopmentEndTime(createdAt, biddingPeriodHours, developmentPeriodDays)
    const buffer = parseInt(bufferDays) || 1
    
    return new Date(developmentEndTime.getTime() + buffer * 24 * 60 * 60 * 1000)
  } catch (error) {
    console.warn('计算最小截止时间失败:', error)
    return new Date() // 返回当前时间作为兜底
  }
}

/**
 * 获取任务完整的时间规划
 * @param {Object} options - 时间计算选项
 * @param {Date|string} options.createdAt - 任务创建时间，默认为当前时间
 * @param {number} options.biddingPeriodHours - 竞标期（小时）
 * @param {number} options.developmentPeriodDays - 开发周期（天）
 * @param {Date|string} options.userDeadline - 用户设置的截止时间
 * @param {number} options.bufferDays - 缓冲天数，默认1天
 * @returns {Object} 时间规划对象
 */
export function getTaskTimeline(options = {}) {
  try {
    const {
      createdAt = new Date(),
      biddingPeriodHours,
      developmentPeriodDays,
      userDeadline,
      bufferDays = 1
    } = options

    // 验证必要参数
    if (!biddingPeriodHours || !developmentPeriodDays) {
      return {
        valid: false,
        message: '请完整设置竞标期和开发周期'
      }
    }

    const createTime = new Date(createdAt)
    const biddingEndTime = calculateBiddingEndTime(createTime, biddingPeriodHours)
    const developmentEndTime = calculateDevelopmentEndTime(createTime, biddingPeriodHours, developmentPeriodDays)
    const minDeadlineTime = calculateMinDeadlineTime(createTime, biddingPeriodHours, developmentPeriodDays, bufferDays)

    const timeline = {
      valid: true,
      createdAt: createTime,
      biddingEndTime,
      developmentEndTime,
      minDeadlineTime,
      
      // 格式化的时间字符串
      formatted: {
        createdAt: createTime.toLocaleString('zh-CN'),
        createdAtDate: createTime.toLocaleDateString('zh-CN'),
        biddingEnd: biddingEndTime.toLocaleString('zh-CN'),
        biddingEndDate: biddingEndTime.toLocaleDateString('zh-CN'),
        developmentEnd: developmentEndTime.toLocaleString('zh-CN'),
        developmentEndDate: developmentEndTime.toLocaleDateString('zh-CN'),
        minDeadline: minDeadlineTime.toLocaleString('zh-CN'),
        minDeadlineDate: minDeadlineTime.toLocaleDateString('zh-CN')
      }
    }

    // 如果用户设置了截止时间，进行验证
    if (userDeadline) {
      const userDeadlineTime = new Date(userDeadline)
      timeline.userDeadlineTime = userDeadlineTime
      timeline.formatted.userDeadline = userDeadlineTime.toLocaleString('zh-CN')
      timeline.formatted.userDeadlineDate = userDeadlineTime.toLocaleDateString('zh-CN')

      if (userDeadlineTime < minDeadlineTime) {
        timeline.warning = `截止时间过早，建议不早于 ${timeline.formatted.minDeadlineDate}`
        timeline.isValid = false
      } else {
        timeline.status = '时间安排合理'
        timeline.isValid = true
      }
    }

    return timeline
  } catch (error) {
    console.warn('获取任务时间规划失败:', error)
    return {
      valid: false,
      message: '时间计算出错'
    }
  }
}

/**
 * 计算竞标进度百分比
 * @param {Date|string} createdAt - 任务创建时间
 * @param {number} biddingPeriodHours - 竞标期（小时）
 * @returns {number} 竞标进度百分比 (0-100)
 */
export function calculateBiddingProgress(createdAt, biddingPeriodHours) {
  try {
    const now = new Date()
    const createTime = new Date(createdAt)
    const biddingEndTime = calculateBiddingEndTime(createTime, biddingPeriodHours)
    
    if (now >= biddingEndTime) return 100
    if (now <= createTime) return 0
    
    const totalTime = biddingEndTime.getTime() - createTime.getTime()
    const elapsedTime = now.getTime() - createTime.getTime()
    
    return Math.max(0, Math.min(100, Math.round((elapsedTime / totalTime) * 100)))
  } catch (error) {
    console.warn('计算竞标进度失败:', error)
    return 0
  }
}

/**
 * 检查任务时间状态
 * @param {Object} task - 任务对象
 * @returns {Object} 时间状态信息
 */
export function getTaskTimeStatus(task) {
  try {
    const now = new Date()
    const timeline = getTaskTimeline({
      createdAt: task.createdAt,
      biddingPeriodHours: task.biddingPeriod,
      developmentPeriodDays: task.developmentPeriod,
      userDeadline: task.deadline
    })

    if (!timeline.valid) {
      return { status: 'unknown', message: timeline.message }
    }

    const status = {
      isCreated: true,
      isBiddingActive: now >= timeline.createdAt && now < timeline.biddingEndTime,
      isBiddingEnded: now >= timeline.biddingEndTime,
      isDevelopmentPhase: now >= timeline.biddingEndTime && now < timeline.developmentEndTime,
      isDevelopmentEnded: now >= timeline.developmentEndTime,
      isOverdue: timeline.userDeadlineTime && now > timeline.userDeadlineTime,
      
      biddingProgress: calculateBiddingProgress(task.createdAt, task.biddingPeriod),
      timeline
    }

    // 确定当前阶段
    if (status.isOverdue) {
      status.currentPhase = 'overdue'
      status.phaseText = '已逾期'
    } else if (status.isBiddingActive) {
      status.currentPhase = 'bidding'
      status.phaseText = '竞标中'
    } else if (status.isDevelopmentPhase) {
      status.currentPhase = 'development'
      status.phaseText = '开发中'
    } else if (status.isDevelopmentEnded) {
      status.currentPhase = 'review'
      status.phaseText = '待评审'
    } else {
      status.currentPhase = 'unknown'
      status.phaseText = '未知状态'
    }

    return status
  } catch (error) {
    console.warn('获取任务时间状态失败:', error)
    return { status: 'error', message: '时间状态计算失败' }
  }
}

/**
 * 格式化时间差
 * @param {Date} startTime - 开始时间
 * @param {Date} endTime - 结束时间
 * @returns {string} 格式化的时间差
 */
export function formatTimeDifference(startTime, endTime) {
  try {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    
    if (diffMs <= 0) return '已结束'
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) {
      return `${diffDays}天${diffHours}小时`
    } else if (diffHours > 0) {
      return `${diffHours}小时${diffMinutes}分钟`
    } else {
      return `${diffMinutes}分钟`
    }
  } catch (error) {
    console.warn('格式化时间差失败:', error)
    return '计算失败'
  }
}

/**
 * 获取时间状态的颜色类
 * @param {string} phase - 当前阶段
 * @returns {string} CSS颜色类
 */
export function getPhaseColorClass(phase) {
  const colorMap = {
    bidding: 'text-blue-600',
    development: 'text-green-600',
    review: 'text-yellow-600',
    completed: 'text-purple-600',
    overdue: 'text-red-600',
    unknown: 'text-gray-600'
  }
  
  return colorMap[phase] || 'text-gray-600'
}

/**
 * 获取时间状态的背景色类
 * @param {string} phase - 当前阶段
 * @returns {string} CSS背景色类
 */
export function getPhaseBackgroundClass(phase) {
  const colorMap = {
    bidding: 'bg-blue-100',
    development: 'bg-green-100',
    review: 'bg-yellow-100',
    completed: 'bg-purple-100',
    overdue: 'bg-red-100',
    unknown: 'bg-gray-100'
  }
  
  return colorMap[phase] || 'bg-gray-100'
} 