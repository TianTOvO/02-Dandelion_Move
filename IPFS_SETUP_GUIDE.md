# IPFS 安装和配置指南

## 概述

Dandelion平台使用IPFS（星际文件系统）来存储任务数据、用户资料和项目文件。如果IPFS节点未运行，系统会自动启用模拟模式，确保所有功能正常工作。

## 安装IPFS

### 方法1：使用IPFS Desktop（推荐）

1. 访问 [IPFS Desktop官网](https://ipfs.io/ipfs-desktop/)
2. 下载适合您操作系统的版本
3. 安装并启动IPFS Desktop
4. 首次启动时会自动初始化IPFS节点

### 方法2：使用命令行

#### Windows
```bash
# 下载IPFS二进制文件
# 访问 https://dist.ipfs.io/go-ipfs/v0.20.0/go-ipfs_v0.20.0_windows-amd64.zip

# 解压到 C:\ipfs
# 将 C:\ipfs 添加到系统PATH

# 初始化IPFS
ipfs init

# 启动IPFS守护进程
ipfs daemon
```

#### macOS
```bash
# 使用Homebrew安装
brew install ipfs

# 初始化IPFS
ipfs init

# 启动IPFS守护进程
ipfs daemon
```

#### Linux
```bash
# 下载并安装IPFS
wget https://dist.ipfs.io/go-ipfs/v0.20.0/go-ipfs_v0.20.0_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.20.0_linux-amd64.tar.gz
cd go-ipfs
sudo bash install.sh

# 初始化IPFS
ipfs init

# 启动IPFS守护进程
ipfs daemon
```

## 配置IPFS

### 1. 启用CORS（跨域资源共享）

为了允许前端应用访问IPFS API，需要配置CORS：

```bash
# 允许所有来源（开发环境）
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'

# 重启IPFS守护进程
ipfs shutdown
ipfs daemon
```

### 2. 验证配置

访问以下地址验证IPFS是否正常运行：
- API: http://127.0.0.1:5001/api/v0/version
- Web界面: http://127.0.0.1:8080

## 模拟模式

如果IPFS节点未运行，Dandelion平台会自动启用模拟模式：

### 模拟模式特性
- ✅ 所有功能正常工作
- ✅ 文件上传生成模拟哈希
- ✅ 数据获取返回模拟数据
- ✅ 不影响开发和测试

### 启用/禁用模拟模式
```javascript
// 在浏览器控制台中
const ipfsStore = useIpfsStore()

// 手动启用模拟模式
ipfsStore.simulationMode = true

// 手动禁用模拟模式（需要IPFS节点运行）
ipfsStore.simulationMode = false
```

## 故障排除

### 常见问题

1. **连接被拒绝 (ERR_CONNECTION_REFUSED)**
   - 确保IPFS守护进程正在运行
   - 检查端口5001是否被占用

2. **CORS错误**
   - 重新配置CORS设置
   - 重启IPFS守护进程

3. **API响应慢**
   - 检查网络连接
   - 考虑使用本地IPFS节点

### 调试命令

```bash
# 检查IPFS状态
ipfs id

# 查看配置
ipfs config show

# 检查API是否可访问
curl http://127.0.0.1:5001/api/v0/version

# 查看日志
ipfs log level all debug
```

## 生产环境建议

1. **使用专用IPFS节点**
   - 部署专用的IPFS服务器
   - 配置负载均衡

2. **数据备份**
   - 定期备份IPFS数据
   - 使用IPFS集群确保高可用性

3. **监控**
   - 监控IPFS节点状态
   - 设置告警机制

## 更多资源

- [IPFS官方文档](https://docs.ipfs.io/)
- [IPFS JavaScript客户端](https://github.com/ipfs/js-ipfs)
- [IPFS HTTP API参考](https://docs.ipfs.io/reference/http/api/) 