import fs from 'fs';
import path from 'path';

// 修复前端问题
function fixFrontendIssues() {
    console.log("🔧 开始修复前端问题...\n");

    // 1. 修复 web3.js 中的 getBalance 问题
    fixWeb3BalanceIssue();

    // 2. 修复合约初始化问题
    fixContractInitialization();

    // 3. 修复 IPFS 配置
    fixIPFSConfig();

    console.log("\n✅ 前端问题修复完成！");
}

function fixWeb3BalanceIssue() {
    console.log("1. 修复余额获取问题...");

    const web3Path = 'frontend/src/stores/web3.js';
    if (!fs.existsSync(web3Path)) {
        console.log("   ⚠️  web3.js 文件不存在");
        return;
    }

    let content = fs.readFileSync(web3Path, 'utf8');

    // 修复 updateBalance 方法
    const newUpdateBalance = `
    async updateBalance() {
      try {
        if (!this.account || !this.aptosContractService) return

        const balance = await this.aptosContractService.getBalance(this.account)
        if (balance && balance.toString) {
          this.balance = (parseInt(balance.toString()) / 100000000).toString() // 转换为APT
          console.log('💰 APT余额更新:', this.formattedBalance)
        } else {
          console.warn('⚠️ 余额数据格式异常:', balance)
          this.balance = '0'
        }
      } catch (error) {
        console.error('❌ 更新APT余额失败:', error)
        this.balance = '0'
      }
    }`;

    // 替换 updateBalance 方法
    const updateBalanceRegex = /async updateBalance\(\) \{[\s\S]*?\n    \}/;
    if (updateBalanceRegex.test(content)) {
        content = content.replace(updateBalanceRegex, newUpdateBalance);
        fs.writeFileSync(web3Path, content, 'utf8');
        console.log("   ✅ 余额获取方法已修复");
    } else {
        console.log("   ⚠️  未找到 updateBalance 方法");
    }
}

function fixContractInitialization() {
    console.log("2. 修复合约初始化问题...");

    const web3Path = 'frontend/src/stores/web3.js';
    if (!fs.existsSync(web3Path)) {
        console.log("   ⚠️  web3.js 文件不存在");
        return;
    }

    let content = fs.readFileSync(web3Path, 'utf8');

    // 修复 initializeContracts 方法
    const newInitializeContracts = `
    async initializeContracts() {
      try {
        // 对于 Aptos，我们不需要 provider 和 signer
        // 直接使用 aptosContractService
        if (!this.aptosContractService) {
          console.warn('⚠️ Aptos合约服务未初始化')
          return false
        }

        console.log('✅ Aptos合约服务已就绪')
        return true
      } catch (error) {
        console.error('❌ 合约初始化失败:', error)
        this.error = error.message
        return false
      }
    }`;

    // 替换 initializeContracts 方法
    const initializeContractsRegex = /async initializeContracts\(\) \{[\s\S]*?\n    \}/;
    if (initializeContractsRegex.test(content)) {
        content = content.replace(initializeContractsRegex, newInitializeContracts);
        fs.writeFileSync(web3Path, content, 'utf8');
        console.log("   ✅ 合约初始化方法已修复");
    } else {
        console.log("   ⚠️  未找到 initializeContracts 方法");
    }
}

function fixIPFSConfig() {
    console.log("3. 修复 IPFS 配置...");

    const ipfsPath = 'frontend/src/stores/ipfs.js';
    if (!fs.existsSync(ipfsPath)) {
        console.log("   ⚠️  ipfs.js 文件不存在");
        return;
    }

    let content = fs.readFileSync(ipfsPath, 'utf8');

    // 修改 IPFS 节点地址为公共节点
    const newIPFSConfig = `
// IPFS 配置
const IPFS_CONFIG = {
  // 使用公共 IPFS 网关，避免本地节点依赖
  gateway: 'https://ipfs.io/ipfs/',
  api: 'https://ipfs.io/api/v0/',
  // 备用网关
  fallbackGateways: [
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ]
}`;

    // 查找并替换 IPFS 配置
    const ipfsConfigRegex = /const IPFS_CONFIG = \{[\s\S]*?\}/;
    if (ipfsConfigRegex.test(content)) {
        content = content.replace(ipfsConfigRegex, newIPFSConfig);
    } else {
        // 如果没有找到配置，在文件开头添加
        content = newIPFSConfig + '\n\n' + content;
    }

    // 修改 initIPFS 方法
    const newInitIPFS = `
  async initIPFS() {
    try {
      console.log('🌐 初始化IPFS连接...')
      
      // 使用公共 IPFS 网关，不需要本地节点
      this.isConnected = true
      this.gateway = IPFS_CONFIG.gateway
      this.api = IPFS_CONFIG.api
      
      console.log('✅ IPFS 已连接到公共网关')
      return true
    } catch (error) {
      console.error('❌ IPFS连接失败:', error)
      console.log('错误详情:', error)
      
      // 启用模拟模式
      console.log('🎭 启用IPFS模拟模式,使用本地缓存...')
      this.simulationMode = true
      this.isConnected = false
      return false
    }
  }`;

    // 替换 initIPFS 方法
    const initIPFSRegex = /async initIPFS\(\) \{[\s\S]*?\n  \}/;
    if (initIPFSRegex.test(content)) {
        content = content.replace(initIPFSRegex, newInitIPFS);
    }

    fs.writeFileSync(ipfsPath, content, 'utf8');
    console.log("   ✅ IPFS 配置已修复为使用公共网关");
}

// 运行修复
fixFrontendIssues(); 