# 🔧 CORS跨域问题修复指南

## 问题描述
前端应用从网络IP地址（如 `http://192.168.80.1:3000`）访问本地IPFS节点时遇到CORS跨域错误：
```
Access to fetch at 'http://127.0.0.1:5001/api/v0/version' from origin 'http://192.168.80.1:3000' has been blocked by CORS policy
```

## 根本原因
- Vite开发服务器默认绑定到所有网络接口（`0.0.0.0:3000`），可通过多个IP地址访问
- IPFS节点的CORS配置只允许特定的来源域名
- 当前配置未包含所有可能的网络IP地址

## 解决方案

### 1. 更新IPFS CORS配置
```bash
# 停止IPFS守护进程
taskkill /f /im ipfs.exe

# 配置允许所有来源（推荐用于开发环境）
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET", "DELETE", "OPTIONS"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "Content-Type", "X-Requested-With"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "false"

# 重新启动IPFS守护进程
ipfs daemon
```

### 2. 使用自动化脚本
运行项目根目录下的 `configure-ipfs-cors.bat` 脚本：
```cmd
.\configure-ipfs-cors.bat
```

### 3. 验证配置
检查CORS配置是否正确：
```bash
ipfs config API.HTTPHeaders.Access-Control-Allow-Origin
```
应该返回：
```json
[
  "*"
]
```

## 当前系统状态

### ✅ 服务状态
- **IPFS节点**: 运行在 `http://127.0.0.1:5001` (已配置CORS)
- **前端服务器**: 运行在 `http://0.0.0.0:3000`，可通过以下地址访问：
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://192.168.80.1:3000`
  - `http://192.168.184.1:3000`
  - `http://192.168.146.225:3000`

### ✅ 功能状态
- **Web3连接**: Ethers.js v5 正确配置
- **IPFS集成**: 支持跨域访问
- **测试页面**: 可访问 `/test` 路径进行功能验证

## 测试验证

### 访问测试页面
打开浏览器访问任意可用地址的测试页面：
- `http://localhost:3000/test`
- `http://192.168.80.1:3000/test`

### 功能测试
1. **Ethers导入测试**: 验证ethers.js库正确导入
2. **Web3连接测试**: 测试MetaMask钱包连接
3. **IPFS连接测试**: 验证IPFS节点连接
4. **IPFS上传测试**: 测试文件上传功能

## 安全说明

⚠️ **开发环境配置**
当前CORS配置使用通配符 `"*"` 允许所有来源，这适用于开发环境。

🔒 **生产环境建议**
在生产环境中，应该明确指定允许的域名：
```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["https://yourdomain.com", "https://www.yourdomain.com"]'
```

## 故障排除

### 如果仍然遇到CORS错误
1. 确认IPFS守护进程已重启
2. 检查浏览器控制台的具体错误信息
3. 验证IPFS配置是否正确应用
4. 清除浏览器缓存并刷新页面

### 重新配置IPFS
如果需要重新配置，可以重复运行配置脚本：
```cmd
.\configure-ipfs-cors.bat
```

---

**最后更新**: 2024年6月26日
**状态**: ✅ 问题已解决，系统正常运行 