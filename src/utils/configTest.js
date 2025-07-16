// 配置测试工具
import { getContractInfo, validateContractConfig } from './contracts.js'

export class ConfigTester {
  constructor() {
    this.results = {
      contractInfo: null,
      validation: null,
      abiTests: {},
      addressTests: {},
      errors: []
    }
  }

  // 运行完整的配置测试
  async runFullTest() {
    console.log('🧪 开始合约配置测试...')
    
    try {
      // 获取合约信息
      this.results.contractInfo = getContractInfo()
      console.log('合约信息获取成功')

      // 验证配置
      this.testValidation()
      
      // 测试ABI
      this.testABI()
      
      // 测试地址
      this.testAddresses()
      
      console.log('🎉 配置测试完成')
      return this.results
      
    } catch (error) {
      this.results.errors.push(`配置测试失败: ${error.message}`)
      console.error('配置测试失败:', error)
      return this.results
    }
  }

  // 测试配置验证
  testValidation() {
    try {
      this.results.validation = validateContractConfig()
      
      if (this.results.validation.valid) {
        console.log('✅ 配置验证通过')
      } else {
        console.warn('⚠️  配置验证失败:', this.results.validation.errors)
      }
    } catch (error) {
      this.results.errors.push(`验证测试失败: ${error.message}`)
    }
  }

  // 测试ABI配置
  testABI() {
    const { abis } = this.results.contractInfo
    
    for (const [contractName, abi] of Object.entries(abis)) {
      try {
        this.results.abiTests[contractName] = {
          exists: !!abi,
          isArray: Array.isArray(abi),
          length: abi ? abi.length : 0,
          hasConstructor: false,
          hasFunctions: 0,
          hasEvents: 0,
          hasViews: 0,
          valid: false
        }

        if (Array.isArray(abi)) {
          // 分析ABI内容
          for (const item of abi) {
            if (item.type === 'constructor') {
              this.results.abiTests[contractName].hasConstructor = true
            } else if (item.type === 'function') {
              this.results.abiTests[contractName].hasFunctions++
              if (item.stateMutability === 'view' || item.stateMutability === 'pure') {
                this.results.abiTests[contractName].hasViews++
              }
            } else if (item.type === 'event') {
              this.results.abiTests[contractName].hasEvents++
            }
          }

          // 检查ABI是否有效
          this.results.abiTests[contractName].valid = 
            this.results.abiTests[contractName].length > 0 &&
            this.results.abiTests[contractName].hasFunctions > 0

          if (this.results.abiTests[contractName].valid) {
            console.log(`✅ ${contractName} ABI有效 (${this.results.abiTests[contractName].length}项)`)
          } else {
            console.warn(`⚠️  ${contractName} ABI可能无效`)
          }
        }

      } catch (error) {
        this.results.errors.push(`${contractName} ABI测试失败: ${error.message}`)
      }
    }
  }

  // 测试地址配置
  testAddresses() {
    const { addresses } = this.results.contractInfo
    
    for (const [contractName, address] of Object.entries(addresses)) {
      try {
        this.results.addressTests[contractName] = {
          exists: !!address,
          isString: typeof address === 'string',
          isValidFormat: false,
          isNotZero: false,
          length: address ? address.length : 0,
          valid: false
        }

        if (address) {
          // 检查以太坊地址格式
          this.results.addressTests[contractName].isValidFormat = /^0x[a-fA-F0-9]{40}$/.test(address)
          this.results.addressTests[contractName].isNotZero = address !== '0x0000000000000000000000000000000000000000'
          
          this.results.addressTests[contractName].valid = 
            this.results.addressTests[contractName].isValidFormat && 
            this.results.addressTests[contractName].isNotZero

          if (this.results.addressTests[contractName].valid) {
            console.log(`✅ ${contractName} 地址有效: ${address}`)
          } else {
            console.warn(`⚠️  ${contractName} 地址无效: ${address}`)
          }
        }

      } catch (error) {
        this.results.errors.push(`${contractName} 地址测试失败: ${error.message}`)
      }
    }
  }

  // 生成测试报告
  generateReport() {
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        overallValid: this.results.validation?.valid || false,
        totalErrors: this.results.errors.length,
        contractsTestedABI: Object.keys(this.results.abiTests).length,
        contractsTestedAddress: Object.keys(this.results.addressTests).length
      },
      validation: this.results.validation,
      abiTests: this.results.abiTests,
      addressTests: this.results.addressTests,
      errors: this.results.errors
    }

    console.log('📊 配置测试报告:')
    console.table(report.summary)
    
    if (report.errors.length > 0) {
      console.error('❌ 发现的错误:')
      report.errors.forEach(error => console.error(`  - ${error}`))
    }

    return report
  }
}

// 导出测试实例
export const configTester = new ConfigTester()

// 快速测试函数
export const quickConfigTest = async () => {
  const tester = new ConfigTester()
  await tester.runFullTest()
  return tester.generateReport()
} 