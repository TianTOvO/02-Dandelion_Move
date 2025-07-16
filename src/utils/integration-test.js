/**
 * 集成测试 - 验证前端与合约的数据一致性
 */

import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts.js'
import { 
  TASK_STATUS, 
  TASK_TYPE, 
  getStatusText, 
  getTypeText,
  contractTypeToFrontend,
  frontendTypeToContract 
} from '@/stores/data.js'

/**
 * 数据一致性测试套件
 */
export class IntegrationTest {
  constructor() {
    this.results = []
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始运行集成测试...')
    
    this.testTaskStatusMapping()
    this.testTaskTypeMapping()
    this.testContractAddresses()
    this.testABIStructure()
    
    const passedTests = this.results.filter(r => r.passed).length
    const totalTests = this.results.length
    
    console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`)
    
    if (passedTests === totalTests) {
      console.log('✅ 所有测试通过！系统数据一致性良好')
    } else {
      console.error('❌ 部分测试失败，请检查以下问题:')
      this.results.filter(r => !r.passed).forEach(r => {
        console.error(`- ${r.name}: ${r.error}`)
      })
    }
    
    return {
      passed: passedTests,
      total: totalTests,
      success: passedTests === totalTests,
      results: this.results
    }
  }

  /**
   * 添加测试结果
   */
  addResult(name, passed, error = null) {
    this.results.push({ name, passed, error })
    if (passed) {
      console.log(`✅ ${name}`)
    } else {
      console.error(`❌ ${name}: ${error}`)
    }
  }

  /**
   * 测试任务状态映射
   */
  testTaskStatusMapping() {
    try {
      // 验证状态枚举值
      const expectedStatuses = {
        CREATED: 0,
        BIDDING: 1,
        IN_PROGRESS: 2,
        PENDING_EMPLOYER_CONFIRM: 3,
        COMPLETED: 4,
        DISPUTED: 5,
        PENDING_DISPUTE_PERIOD: 6
      }

      for (const [key, value] of Object.entries(expectedStatuses)) {
        if (TASK_STATUS[key] !== value) {
          throw new Error(`状态 ${key} 映射错误: 期望 ${value}, 实际 ${TASK_STATUS[key]}`)
        }
      }

      // 验证状态文本映射
      const statusTexts = [
        '已创建', '竞标中', '开发中', '待雇主确认', 
        '已完成', '争议中', '争议期'
      ]

      for (let i = 0; i < statusTexts.length; i++) {
        const text = getStatusText(i)
        if (!text || text === '未知') {
          throw new Error(`状态 ${i} 缺少文本映射`)
        }
      }

      this.addResult('任务状态映射', true)
    } catch (error) {
      this.addResult('任务状态映射', false, error.message)
    }
  }

  /**
   * 测试任务类型映射
   */
  testTaskTypeMapping() {
    try {
      // 验证类型枚举值
      const expectedTypes = {
        OTHER: 0,
        WEB3: 1,
        UI_UX: 2,
        MARKET_PROMOTION: 3,
        CONTENT_PRODUCTION: 4,
        DATA_ANALYTICS: 5
      }

      for (const [key, value] of Object.entries(expectedTypes)) {
        if (TASK_TYPE[key] !== value) {
          throw new Error(`类型 ${key} 映射错误: 期望 ${value}, 实际 ${TASK_TYPE[key]}`)
        }
      }

      // 验证类型文本映射
      const typeTexts = [
        '其他', 'Web3开发', 'UI/UX设计', 
        '市场推广', '内容创作', '数据分析'
      ]

      for (let i = 0; i < typeTexts.length; i++) {
        const text = getTypeText(i)
        if (!text || text === '未知') {
          throw new Error(`类型 ${i} 缺少文本映射`)
        }
      }

      // 验证双向转换
      const contractTypes = ['Other', 'web3', 'UI/UX', 'Market Promotion', 'Content Production', 'Data Analytics']
      
      for (let i = 0; i < contractTypes.length; i++) {
        const contractType = contractTypes[i]
        const frontendType = contractTypeToFrontend(contractType)
        const backToContract = frontendTypeToContract(frontendType)
        
        if (backToContract !== contractType) {
          throw new Error(`类型双向转换失败: ${contractType} -> ${frontendType} -> ${backToContract}`)
        }
      }

      this.addResult('任务类型映射', true)
    } catch (error) {
      this.addResult('任务类型映射', false, error.message)
    }
  }

  /**
   * 测试合约地址配置
   */
  testContractAddresses() {
    try {
      const requiredContracts = [
        'TASK_FACTORY',
        'BIDDING_SYSTEM', 
        'ESCROW',
        'DISPUTE_DAO'
      ]

      for (const contractName of requiredContracts) {
        const address = CONTRACT_ADDRESSES[contractName]
        
        if (!address) {
          throw new Error(`缺少合约地址: ${contractName}`)
        }
        
        if (!ethers.utils.isAddress(address)) {
          throw new Error(`无效的合约地址: ${contractName} = ${address}`)
        }
        
        if (address === '0x0000000000000000000000000000000000000000') {
          throw new Error(`合约地址未部署: ${contractName}`)
        }
      }

      this.addResult('合约地址配置', true)
    } catch (error) {
      this.addResult('合约地址配置', false, error.message)
    }
  }

  /**
   * 测试ABI结构
   */
  testABIStructure() {
    try {
      const requiredABIs = [
        'TaskFactory',
        'BiddingSystem',
        'Escrow', 
        'DisputeDAO'
      ]

      for (const abiName of requiredABIs) {
        const abi = CONTRACT_ABIS[abiName]
        
        if (!abi) {
          throw new Error(`缺少ABI: ${abiName}`)
        }
        
        if (!Array.isArray(abi) || abi.length === 0) {
          throw new Error(`无效的ABI结构: ${abiName}`)
        }
      }

      // 验证关键函数存在
      const taskFactoryABI = CONTRACT_ABIS.TaskFactory
      const requiredFunctions = [
        'createTask',
        'participateInTask', 
        'selectWinner',
        'employerConfirmTask',
        'disputeTask',
        'getTaskById',
        'getAllTasks'
      ]

      for (const funcName of requiredFunctions) {
        const func = taskFactoryABI.find(item => 
          item.type === 'function' && item.name === funcName
        )
        
        if (!func) {
          throw new Error(`TaskFactory ABI缺少函数: ${funcName}`)
        }
      }

      this.addResult('ABI结构', true)
    } catch (error) {
      this.addResult('ABI结构', false, error.message)
    }
  }

  /**
   * 验证数据模型一致性
   */
  validateDataModel(frontendTask, contractTask) {
    const issues = []

    // 检查必要字段
    const requiredFields = ['id', 'title', 'creator', 'reward', 'status', 'taskType']
    
    for (const field of requiredFields) {
      if (frontendTask[field] === undefined || frontendTask[field] === null) {
        issues.push(`前端任务缺少字段: ${field}`)
      }
      
      if (contractTask && (contractTask[field] === undefined || contractTask[field] === null)) {
        issues.push(`合约任务缺少字段: ${field}`)
      }
    }

    // 检查状态一致性
    if (contractTask && frontendTask.status !== contractTask.status) {
      issues.push(`状态不一致: 前端=${frontendTask.status}, 合约=${contractTask.status}`)
    }

    // 检查类型一致性
    if (contractTask && frontendTask.taskType !== contractTask.taskType) {
      issues.push(`类型不一致: 前端=${frontendTask.taskType}, 合约=${contractTask.taskType}`)
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        success: this.results.every(r => r.passed)
      },
      details: this.results,
      recommendations: []
    }

    // 生成建议
    if (!report.summary.success) {
      report.recommendations.push('修复失败的测试项目')
      report.recommendations.push('确保前端数据映射与合约完全一致')
      report.recommendations.push('验证所有合约地址和ABI的有效性')
    }

    return report
  }
}

/**
 * 快速运行集成测试
 */
export const runIntegrationTest = async () => {
  const test = new IntegrationTest()
  return await test.runAllTests()
}

/**
 * 验证单个任务数据的一致性
 */
export const validateTaskData = (task) => {
  const test = new IntegrationTest()
  return test.validateDataModel(task)
}

export default IntegrationTest 