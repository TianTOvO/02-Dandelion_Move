import { defineStore } from 'pinia'
import { create } from 'ipfs-http-client'
import axios from 'axios'

export const useIpfsStore = defineStore('ipfs', {
  state: () => ({
    client: null,
    loading: false,
    error: null,
    // 任务数据缓存
    taskCache: new Map(),
    // 用户数据缓存
    userCache: new Map(),
    // 节点哈希缓存
    nodeHashes: new Set()
  }),

  actions: {
    async initIPFS() {
      try {
        console.log('正在初始化IPFS客户端连接...')

        // 使用模拟IPFS客户端作为备用方案
        this.client = {
          add: async (data) => {
            // 模拟IPFS上传，返回一个假的哈希
            const fakeHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            console.log('模拟IPFS上传成功，哈希:', fakeHash)
            return { path: fakeHash, size: typeof data === 'string' ? data.length : data.size }
          },
          cat: async (hash) => {
            // 模拟IPFS下载
            console.log('模拟IPFS下载，哈希:', hash)
            return '模拟的IPFS数据'
          },
          version: async () => {
            return { version: '模拟版本', commit: '模拟提交' }
          }
        }

        console.log('使用模拟IPFS客户端')
      } catch (error) {
        console.error('IPFS初始化失败:', error)
        this.error = 'IPFS初始化失败'
        throw error
      }
    },

    async uploadFile(file) {
      if (!this.client) {
        console.log('IPFS客户端未初始化，正在初始化...')
        await this.initIPFS()
      }

      this.loading = true
      this.error = null

      try {
        console.log('开始上传文件到IPFS:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        })

        // 添加文件到IPFS
        const result = await this.client.add(file)
        const hash = result.path

        console.log('文件上传成功，IPFS Hash:', hash)
        console.log('上传结果详情:', result)
        return hash
      } catch (error) {
        console.error('文件上传失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          fileName: file.name,
          fileSize: file.size
        })
        this.error = '文件上传失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadJSON(data) {
      if (!this.client) {
        console.log('IPFS客户端未初始化，正在初始化...')
        await this.initIPFS()
      }

      this.loading = true
      this.error = null

      try {
        console.log('开始上传JSON数据到IPFS')
        const jsonString = JSON.stringify(data, null, 2)
        console.log('JSON字符串长度:', jsonString.length)
        console.log('JSON数据预览:', jsonString.substring(0, 500) + '...')

        const result = await this.client.add(jsonString)
        const hash = result.path

        console.log('JSON数据上传成功，IPFS Hash:', hash)
        console.log('上传结果详情:', result)
        return hash
      } catch (error) {
        console.error('JSON上传失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          type: error.type
        })
        this.error = 'JSON数据上传失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 上传任务完整数据到IPFS
     * @param {Object} taskData - 任务数据
     * @returns {Promise<string>} IPFS哈希
     */
    async uploadTaskData(taskData) {
      try {
        console.log('开始上传任务数据到IPFS，原始数据:', taskData)

        // 构建完整的任务数据结构
        const fullTaskData = {
          // 基本信息
          title: taskData.title,
          description: taskData.description,
          taskType: taskData.taskType,

          // 技术要求
          requirements: taskData.requirements || '',
          skillsRequired: taskData.skillsRequired || [],

          // 项目设置
          githubRequired: taskData.githubRequired || false,
          githubRepo: taskData.githubRepo || '',
          chainlinkVerification: taskData.chainlinkVerification || false,

          // 附件信息
          attachments: taskData.attachments || [],

          // 雇主信息
          employer: {
            address: taskData.employer.address,
            name: taskData.employer.name || '',
            email: taskData.employer.email || '',
            company: taskData.employer.company || '',
            avatar: taskData.employer.avatar || '',
            bio: taskData.employer.bio || '',
            website: taskData.employer.website || '',
            socialLinks: taskData.employer.socialLinks || {}
          },

          // 时间戳和版本信息
          createdAt: Date.now(),
          version: '1.0',

          // 元数据
          metadata: {
            platform: 'Dandelion',
            ipfsUploadedAt: Date.now()
          }
        }

        console.log('构建的完整任务数据:', fullTaskData)
        console.log('任务数据JSON大小:', JSON.stringify(fullTaskData).length, '字节')

        const hash = await this.uploadJSON(fullTaskData)
        console.log('任务数据上传到IPFS成功，哈希值:', hash)

        // 缓存任务数据
        this.taskCache.set(hash, fullTaskData)
        console.log('任务数据已缓存，缓存大小:', this.taskCache.size)

        return hash
      } catch (error) {
        console.error('上传任务数据失败:', error)
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          taskData: taskData
        })
        throw error
      }
    },

    /**
     * 从IPFS获取任务数据
     * @param {string} hash - IPFS哈希
     * @returns {Promise<Object>} 任务数据
     */
    async getTaskData(hash) {
      try {
        // 验证IPFS哈希格式
        if (!this.isValidIPFSHash(hash)) {
          console.warn('⚠️ 无效的IPFS哈希格式:', hash)
          // 返回基本的任务数据结构，避免应用崩溃
          return {
            title: '数据加载失败',
            description: `无效的IPFS哈希: ${hash}`,
            taskType: 'web',
            requirements: '',
            skillsRequired: [],
            githubRequired: false,
            githubRepo: '',
            chainlinkVerification: false,
            attachments: [],
            employer: {
              address: '',
              name: '',
              email: '',
              company: '',
              avatar: '',
              bio: '',
              website: '',
              socialLinks: {}
            },
            createdAt: Date.now(),
            version: '1.0',
            metadata: {
              platform: 'Dandelion',
              ipfsUploadedAt: Date.now(),
              error: 'Invalid IPFS hash'
            }
          }
        }

        // 先检查缓存
        if (this.taskCache.has(hash)) {
          return this.taskCache.get(hash)
        }

        const taskData = await this.getJSON(hash)

        // 缓存数据
        this.taskCache.set(hash, taskData)

        return taskData
      } catch (error) {
        console.error('获取任务数据失败:', error)
        console.error('IPFS哈希:', hash)

        // 返回错误信息而不是抛出异常
        return {
          title: '数据加载失败',
          description: `无法从IPFS获取数据: ${error.message}`,
          taskType: 'web',
          requirements: '',
          skillsRequired: [],
          githubRequired: false,
          githubRepo: '',
          chainlinkVerification: false,
          attachments: [],
          employer: {
            address: '',
            name: '',
            email: '',
            company: '',
            avatar: '',
            bio: '',
            website: '',
            socialLinks: {}
          },
          createdAt: Date.now(),
          version: '1.0',
          metadata: {
            platform: 'Dandelion',
            ipfsUploadedAt: Date.now(),
            error: error.message,
            invalidHash: hash
          }
        }
      }
    },

    /**
     * 验证IPFS哈希格式是否有效
     * @param {string} hash - 要验证的哈希
     * @returns {boolean} 是否为有效的IPFS哈希
     */
    isValidIPFSHash(hash) {
      if (!hash || typeof hash !== 'string') {
        return false
      }

      // 检查基本格式
      // IPFS v0 哈希通常以 Qm 开头，长度为46个字符
      // IPFS v1 哈希通常以 b 开头，长度更长
      // 也支持其他CID格式

      // 基本长度检查
      if (hash.length < 10) {
        return false
      }

      // 检查是否包含有效字符（Base58编码字符）
      const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/

      // 检查常见的IPFS哈希格式
      const ipfsV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/  // v0 CID
      const ipfsV1Regex = /^b[a-z2-7]{58,}$/              // v1 CID (base32)
      const ipfsCidRegex = /^[a-zA-Z0-9]{10,}$/           // 通用CID格式

      return ipfsV0Regex.test(hash) ||
        ipfsV1Regex.test(hash) ||
        (base58Regex.test(hash) && hash.length >= 44)
    },

    /**
     * 上传用户资料数据
     * @param {Object} userData - 用户数据
     * @returns {Promise<string>} IPFS哈希
     */
    async uploadUserProfile(userData) {
      try {
        const profileData = {
          // 基本信息
          address: userData.address,
          name: userData.name || '',
          email: userData.email || '',
          bio: userData.bio || '',
          avatar: userData.avatar || '',

          // 联系方式
          website: userData.website || '',
          socialLinks: userData.socialLinks || {},

          // 专业信息
          skills: userData.skills || [],
          experience: userData.experience || '',
          portfolio: userData.portfolio || [],

          // 角色信息
          roles: userData.roles || [], // ['employer', 'freelancer', 'arbitrator']

          // 统计信息（由系统维护）
          stats: userData.stats || {
            tasksCreated: 0,
            tasksCompleted: 0,
            totalEarned: 0,
            successRate: 0,
            rating: 0,
            reviews: []
          },

          // 时间戳
          createdAt: userData.createdAt || Date.now(),
          updatedAt: Date.now(),

          // 版本信息
          version: '1.0'
        }

        const hash = await this.uploadJSON(profileData)

        // 缓存用户数据
        this.userCache.set(hash, profileData)
        this.userCache.set(userData.address, profileData)

        return hash
      } catch (error) {
        console.error('上传用户资料失败:', error)
        throw error
      }
    },

    /**
     * 获取用户资料数据
     * @param {string} hashOrAddress - IPFS哈希或用户地址
     * @returns {Promise<Object>} 用户数据
     */
    async getUserProfile(hashOrAddress) {
      try {
        // 先检查缓存
        if (this.userCache.has(hashOrAddress)) {
          return this.userCache.get(hashOrAddress)
        }

        // 如果是地址，需要从链上或其他地方获取IPFS哈希
        // 这里假设传入的是IPFS哈希
        const userData = await this.getJSON(hashOrAddress)

        // 缓存数据
        this.userCache.set(hashOrAddress, userData)
        if (userData.address) {
          this.userCache.set(userData.address, userData)
        }

        return userData
      } catch (error) {
        console.error('获取用户资料失败:', error)
        throw error
      }
    },

    /**
     * 批量上传附件文件
     * @param {Array} files - 文件数组
     * @returns {Promise<Array>} 附件信息数组
     */
    async uploadAttachments(files) {
      try {
        console.log('开始批量上传附件，文件数量:', files.length)
        const attachments = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          console.log(`上传第${i + 1}个文件:`, {
            name: file.name,
            size: file.size,
            type: file.type
          })

          const hash = await this.uploadFile(file)
          console.log(`文件 ${file.name} 上传成功，IPFS哈希:`, hash)

          const attachment = {
            name: file.name,
            size: file.size,
            type: file.type,
            hash: hash,
            uploadedAt: Date.now()
          }

          attachments.push(attachment)
          console.log(`附件信息:`, attachment)
        }

        console.log('所有附件上传完成，附件列表:', attachments)
        return attachments
      } catch (error) {
        console.error('上传附件失败:', error)
        console.error('错误详情:', {
          message: error.message,
          files: files.map(f => ({ name: f.name, size: f.size }))
        })
        throw error
      }
    },

    async getFile(hash) {
      if (!this.client) {
        await this.initIPFS()
      }

      try {
        // 从IPFS获取文件
        const stream = this.client.cat(hash)
        let data = ''

        for await (const chunk of stream) {
          data += new TextDecoder().decode(chunk)
        }

        return data
      } catch (error) {
        console.error('获取IPFS文件失败:', error)
        throw error
      }
    },

    async getJSON(hash) {
      try {
        const data = await this.getFile(hash)
        return JSON.parse(data)
      } catch (error) {
        console.error('解析IPFS JSON失败:', error)
        throw error
      }
    },

    // 通过HTTP Gateway获取文件（用于图片等二进制文件）
    getFileURL(hash) {
      return `http://127.0.0.1:8080/ipfs/${hash}`
    },

    // 验证文件是否存在
    async fileExists(hash) {
      try {
        await this.client.object.stat(hash)
        return true
      } catch (error) {
        return false
      }
    },

    /**
     * 清除缓存
     */
    clearCache() {
      this.taskCache.clear()
      this.userCache.clear()
    },

    /**
     * 获取缓存统计
     */
    getCacheStats() {
      return {
        taskCacheSize: this.taskCache.size,
        userCacheSize: this.userCache.size
      }
    },

    /**
     * 获取并显示当前节点的所有IPFS哈希
     * @returns {Promise<Object>} 包含所有哈希信息的对象
     */
    async listAllHashes() {
      if (!this.client) {
        console.log('IPFS客户端未初始化，正在初始化...')
        await this.initIPFS()
      }

      try {
        console.log('🔍 开始扫描IPFS节点的所有哈希值...')
        console.log('='.repeat(80))

        const hashInfo = {
          pinnedHashes: [],
          localRefs: [],
          repoStats: null,
          totalHashes: 0,
          totalSize: 0,
          categories: {
            files: [],
            directories: [],
            unknown: []
          }
        }

        // 1. 获取所有固定的对象
        console.log('📌 获取固定的对象 (Pinned Objects):')
        try {
          for await (const pin of this.client.pin.ls()) {
            const pinInfo = {
              hash: pin.cid.toString(),
              type: pin.type
            }
            hashInfo.pinnedHashes.push(pinInfo)
            this.nodeHashes.add(pin.cid.toString())

            console.log(`  📎 ${pin.cid.toString()} [${pin.type}]`)
          }
          console.log(`✅ 固定对象总数: ${hashInfo.pinnedHashes.length}`)
        } catch (error) {
          console.error('❌ 获取固定对象失败:', error.message)
        }

        console.log('\n' + '-'.repeat(80))

        // 2. 获取本地存储的引用
        console.log('💾 获取本地引用 (Local References):')
        try {
          for await (const ref of this.client.refs.local()) {
            const refHash = ref.ref
            hashInfo.localRefs.push(refHash)
            this.nodeHashes.add(refHash)

            console.log(`  🔗 ${refHash}`)
          }
          console.log(`✅ 本地引用总数: ${hashInfo.localRefs.length}`)
        } catch (error) {
          console.error('❌ 获取本地引用失败:', error.message)
        }

        console.log('\n' + '-'.repeat(80))

        // 3. 获取存储库统计信息
        console.log('📊 存储库统计信息:')
        try {
          const stats = await this.client.repo.stat()
          hashInfo.repoStats = stats

          // 安全地处理 BigInt 类型的数值
          const repoSize = this.safeConvertBigInt(stats.repoSize)
          const numObjects = this.safeConvertBigInt(stats.numObjects)
          const storageMax = stats.storageMax ? this.safeConvertBigInt(stats.storageMax) : null

          hashInfo.totalSize = repoSize

          console.log(`  📦 存储库大小: ${this.formatBytes(repoSize)}`)
          console.log(`  🗂️  对象数量: ${numObjects}`)
          console.log(`  🏪 存储后端: ${storageMax ? this.formatBytes(storageMax) : '未限制'}`)
          console.log(`  📈 版本: ${stats.version || '未知'}`)
        } catch (error) {
          console.error('❌ 获取存储库统计失败:', error.message)
        }

        console.log('\n' + '-'.repeat(80))

        // 4. 分析哈希类型（使用新的 DAG API）
        console.log('🔍 分析哈希对象类型:')
        const uniqueHashes = Array.from(this.nodeHashes)
        hashInfo.totalHashes = uniqueHashes.length

        for (const hash of uniqueHashes.slice(0, 20)) { // 限制检查前20个以避免过长输出
          try {
            // 使用 dag.stat 替代已弃用的 object.stat
            const stat = await this.client.dag.stat(hash)
            const objInfo = {
              hash: hash,
              type: 'dag', // DAG 对象
              size: this.safeConvertBigInt(stat.size),
              blocks: this.safeConvertBigInt(stat.numBlocks)
            }

            hashInfo.categories.files.push(objInfo)
            console.log(`  📄 ${hash} [DAG对象] 大小: ${this.formatBytes(objInfo.size)} 块数: ${objInfo.blocks}`)
          } catch (error) {
            // 如果 dag.stat 失败，尝试使用 files API
            try {
              const fileStat = await this.client.files.stat(`/ipfs/${hash}`)
              const objInfo = {
                hash: hash,
                type: fileStat.type,
                size: this.safeConvertBigInt(fileStat.size),
                blocks: this.safeConvertBigInt(fileStat.blocks || 0)
              }

              if (objInfo.type === 'file') {
                hashInfo.categories.files.push(objInfo)
                console.log(`  📄 ${hash} [文件] 大小: ${this.formatBytes(objInfo.size)}`)
              } else if (objInfo.type === 'directory') {
                hashInfo.categories.directories.push(objInfo)
                console.log(`  📁 ${hash} [目录] 大小: ${this.formatBytes(objInfo.size)}`)
              }
            } catch (fileError) {
              hashInfo.categories.unknown.push({ hash, error: error.message })
              console.log(`  ❓ ${hash} [未知类型] 错误: ${error.message}`)
            }
          }
        }

        if (uniqueHashes.length > 20) {
          console.log(`  ... 还有 ${uniqueHashes.length - 20} 个哈希未显示`)
        }

        console.log('\n' + '='.repeat(80))

        // 5. 显示汇总信息
        console.log('📋 汇总信息:')
        console.log(`  🎯 唯一哈希总数: ${hashInfo.totalHashes}`)
        console.log(`  📌 固定对象: ${hashInfo.pinnedHashes.length}`)
        console.log(`  💾 本地引用: ${hashInfo.localRefs.length}`)
        console.log(`  📄 文件对象: ${hashInfo.categories.files.length}`)
        console.log(`  📁 目录对象: ${hashInfo.categories.directories.length}`)
        console.log(`  ❓ 未知对象: ${hashInfo.categories.unknown.length}`)
        console.log(`  💽 总存储大小: ${this.formatBytes(hashInfo.totalSize)}`)

        console.log('\n' + '='.repeat(80))

        // 6. 显示缓存信息
        console.log('🗂️  应用缓存信息:')
        console.log(`  📋 任务缓存: ${this.taskCache.size} 项`)
        console.log(`  👤 用户缓存: ${this.userCache.size} 项`)

        if (this.taskCache.size > 0) {
          console.log('  📋 缓存的任务哈希:')
          for (const [hash, data] of this.taskCache.entries()) {
            console.log(`    📝 ${hash} - ${data.title || '未命名任务'}`)
          }
        }

        if (this.userCache.size > 0) {
          console.log('  👤 缓存的用户数据:')
          for (const [key, data] of this.userCache.entries()) {
            console.log(`    👤 ${key} - ${data.name || data.address || '未命名用户'}`)
          }
        }

        return hashInfo
      } catch (error) {
        console.error('❌ 获取IPFS哈希列表失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          type: error.type
        })
        throw error
      }
    },

    /**
     * 快速查看节点哈希概览
     * @returns {Promise<void>}
     */
    async quickHashOverview() {
      try {
        console.log('🚀 IPFS节点哈希快速概览')
        console.log('='.repeat(50))

        const [pinnedCount, repoStats] = await Promise.all([
          this.countPinnedObjects(),
          this.getQuickRepoStats()
        ])

        console.log(`📌 固定对象数量: ${pinnedCount}`)
        console.log(`💽 存储库大小: ${this.formatBytes(repoStats.repoSize)}`)
        console.log(`🗂️  对象总数: ${repoStats.numObjects}`)
        console.log(`🗃️  应用缓存: 任务${this.taskCache.size}项, 用户${this.userCache.size}项`)
        console.log('='.repeat(50))

        return { pinnedCount, repoStats, cacheStats: this.getCacheStats() }
      } catch (error) {
        console.error('❌ 快速概览失败:', error.message)
        throw error
      }
    },

    /**
     * 统计固定对象数量
     * @returns {Promise<number>}
     */
    async countPinnedObjects() {
      let count = 0
      try {
        for await (const pin of this.client.pin.ls()) {
          count++
        }
      } catch (error) {
        console.error('统计固定对象失败:', error.message)
      }
      return count
    },

    /**
     * 获取快速存储库统计
     * @returns {Promise<Object>}
     */
    async getQuickRepoStats() {
      try {
        const stats = await this.client.repo.stat()
        return {
          repoSize: this.safeConvertBigInt(stats.repoSize),
          numObjects: this.safeConvertBigInt(stats.numObjects),
          version: stats.version
        }
      } catch (error) {
        console.error('获取存储库统计失败:', error.message)
        return { repoSize: 0, numObjects: 0, version: '未知' }
      }
    },

    /**
     * 搜索特定哈希的详细信息
     * @param {string} hash - 要搜索的哈希
     * @returns {Promise<Object>}
     */
    async searchHashDetails(hash) {
      if (!this.client) {
        await this.initIPFS()
      }

      try {
        console.log(`🔍 搜索哈希详情: ${hash}`)
        console.log('-'.repeat(60))

        const details = {
          hash: hash,
          exists: false,
          isPinned: false,
          stat: null,
          content: null,
          error: null
        }

        // 检查对象是否存在（使用新的 DAG API）
        try {
          const stat = await this.client.dag.stat(hash)
          details.exists = true
          details.stat = {
            size: this.safeConvertBigInt(stat.size),
            numBlocks: this.safeConvertBigInt(stat.numBlocks)
          }

          console.log(`✅ 哈希存在`)
          console.log(`📊 大小: ${this.formatBytes(details.stat.size)}`)
          console.log(`🧱 块数: ${details.stat.numBlocks}`)
        } catch (dagError) {
          // 如果 DAG 失败，尝试使用 files API
          try {
            const fileStat = await this.client.files.stat(`/ipfs/${hash}`)
            details.exists = true
            details.stat = {
              size: this.safeConvertBigInt(fileStat.size),
              type: fileStat.type,
              blocks: this.safeConvertBigInt(fileStat.blocks || 0)
            }

            console.log(`✅ 哈希存在`)
            console.log(`📊 大小: ${this.formatBytes(details.stat.size)}`)
            console.log(`📁 类型: ${details.stat.type}`)
            console.log(`🧱 块数: ${details.stat.blocks}`)
          } catch (fileError) {
            details.error = dagError.message
            console.log(`❌ 哈希不存在或无法访问: ${dagError.message}`)
          }
        }

        // 检查是否被固定
        try {
          for await (const pin of this.client.pin.ls({ paths: [hash] })) {
            if (pin.cid.toString() === hash) {
              details.isPinned = true
              console.log(`📌 已固定 [${pin.type}]`)
              break
            }
          }
          if (!details.isPinned) {
            console.log(`📌 未固定`)
          }
        } catch (error) {
          console.log(`📌 固定状态检查失败: ${error.message}`)
        }

        // 尝试获取内容预览（仅对小文件）
        if (details.exists && details.stat.size > 0 && details.stat.size < 1024) {
          try {
            const content = await this.getFile(hash)
            details.content = content.substring(0, 500)
            console.log(`📄 内容预览: ${details.content}${content.length > 500 ? '...' : ''}`)
          } catch (error) {
            console.log(`📄 内容获取失败: ${error.message}`)
          }
        }

        // 检查缓存
        if (this.taskCache.has(hash)) {
          console.log(`🗂️  在任务缓存中找到`)
        }
        if (this.userCache.has(hash)) {
          console.log(`🗂️  在用户缓存中找到`)
        }

        console.log('-'.repeat(60))
        return details
      } catch (error) {
        console.error('❌ 搜索哈希详情失败:', error)
        throw error
      }
    },

    /**
     * 安全地将 BigInt 转换为 number
     * @param {*} value - 可能是 BigInt 或 number 的值
     * @returns {number} 转换后的数字
     */
    safeConvertBigInt(value) {
      if (typeof value === 'bigint') {
        // 如果 BigInt 太大，返回 Number.MAX_SAFE_INTEGER
        if (value > Number.MAX_SAFE_INTEGER) {
          console.warn('BigInt 值过大，使用 MAX_SAFE_INTEGER:', value.toString())
          return Number.MAX_SAFE_INTEGER
        }
        return Number(value)
      }
      return typeof value === 'number' ? value : 0
    },

    /**
     * 格式化字节大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    /**
     * 上传项目提交数据到IPFS
     * @param {Object} submissionData - 项目提交数据
     * @returns {Promise<string>} IPFS哈希
     */
    async uploadProjectSubmission(submissionData) {
      try {
        console.log('开始上传项目提交数据到IPFS，原始数据:', submissionData)

        // 构建完整的项目提交数据结构
        const fullSubmissionData = {
          // 基本信息
          taskId: submissionData.taskId,
          submitterAddress: submissionData.submitterAddress,
          submissionTitle: submissionData.submissionTitle || '项目成果提交',
          description: submissionData.description || '',

          // 文件信息
          files: submissionData.files || [],

          // 演示链接
          demoUrl: submissionData.demoUrl || '',
          repositoryUrl: submissionData.repositoryUrl || '',

          // 技术信息
          technologies: submissionData.technologies || [],
          features: submissionData.features || [],
          instructions: submissionData.instructions || '',

          // 时间戳和版本信息
          submittedAt: Date.now(),
          version: '1.0',

          // 元数据
          metadata: {
            platform: 'Dandelion',
            submissionType: 'project_completion',
            ipfsUploadedAt: Date.now()
          }
        }

        console.log('构建的完整项目提交数据:', fullSubmissionData)
        console.log('项目提交数据JSON大小:', JSON.stringify(fullSubmissionData).length, '字节')

        const hash = await this.uploadJSON(fullSubmissionData)
        console.log('项目提交数据上传到IPFS成功，哈希值:', hash)

        // 缓存提交数据
        this.taskCache.set(`submission_${hash}`, fullSubmissionData)
        console.log('项目提交数据已缓存')

        return hash
      } catch (error) {
        console.error('上传项目提交数据失败:', error)
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          submissionData: submissionData
        })
        throw error
      }
    },

    /**
     * 从IPFS获取项目提交数据
     * @param {string} hash - IPFS哈希
     * @returns {Promise<Object>} 项目提交数据
     */
    async getProjectSubmission(hash) {
      try {
        // 检查缓存
        const cacheKey = `submission_${hash}`
        if (this.taskCache.has(cacheKey)) {
          console.log('从缓存获取项目提交数据:', hash)
          return this.taskCache.get(cacheKey)
        }

        console.log('从IPFS获取项目提交数据:', hash)
        const submissionData = await this.getJSON(hash)

        // 缓存数据
        this.taskCache.set(cacheKey, submissionData)

        return submissionData
      } catch (error) {
        console.error('获取项目提交数据失败:', error)
        throw error
      }
    },

    /**
     * 批量上传项目文件到IPFS
     * @param {Array} files - 文件数组
     * @returns {Promise<Array>} 文件信息数组
     */
    async uploadProjectFiles(files) {
      try {
        console.log('开始批量上传项目文件，文件数量:', files.length)
        const uploadedFiles = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          console.log(`上传第${i + 1}个项目文件:`, {
            name: file.name,
            size: file.size,
            type: file.type
          })

          const hash = await this.uploadFile(file)
          console.log(`项目文件 ${file.name} 上传成功，IPFS哈希:`, hash)

          const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            hash: hash,
            uploadedAt: Date.now(),
            category: this.categorizeFile(file.name, file.type)
          }

          uploadedFiles.push(fileInfo)
          console.log(`项目文件信息:`, fileInfo)
        }

        console.log('所有项目文件上传完成，文件列表:', uploadedFiles)
        return uploadedFiles
      } catch (error) {
        console.error('上传项目文件失败:', error)
        throw error
      }
    },

    /**
     * 文件分类
     * @param {string} fileName - 文件名
     * @param {string} fileType - 文件类型
     * @returns {string} 文件分类
     */
    categorizeFile(fileName, fileType) {
      const extension = fileName.toLowerCase().split('.').pop()

      // 代码文件
      if (['js', 'jsx', 'ts', 'tsx', 'vue', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'sol'].includes(extension)) {
        return 'code'
      }

      // 文档文件
      if (['md', 'txt', 'doc', 'docx', 'pdf'].includes(extension)) {
        return 'documentation'
      }

      // 图片文件
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
        return 'image'
      }

      // 视频文件
      if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension)) {
        return 'video'
      }

      // 压缩文件
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return 'archive'
      }

      return 'other'
    }
  }
}) 