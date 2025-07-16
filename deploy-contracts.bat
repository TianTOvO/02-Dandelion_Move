@echo off
chcp 65001 >nul
title Dandelion智能合约部署

echo.
echo =====================================================
echo 🔗 Dandelion智能合约部署脚本
echo =====================================================
echo.

echo 📋 检查环境...
if not exist contracts\.env (
    echo ❌ 未找到.env配置文件
    echo.
    echo 请在contracts目录下创建.env文件，包含以下内容:
    echo PRIVATE_KEY=your_private_key_here
    echo SNOWTRACE_API_KEY=your_api_key_here
    echo.
    echo ⚠️  重要提醒:
    echo - 私钥不要包含0x前缀
    echo - 确保账户有足够的AVAX用于部署
    echo - 建议使用测试账户的私钥
    echo.
    pause
    exit /b 1
)

echo ✅ 配置文件检查通过

echo.
echo 🔧 准备部署...
cd contracts

echo 正在编译智能合约...
npm run compile
if %errorlevel% neq 0 (
    echo ❌ 合约编译失败
    pause
    exit /b 1
)

echo ✅ 合约编译成功

echo.
echo 🚀 部署到Avalanche Fuji测试网...
echo 请稍等，部署过程可能需要几分钟...
echo.

npm run deploy:fuji
if %errorlevel% neq 0 (
    echo ❌ 合约部署失败
    echo.
    echo 可能的原因:
    echo 1. 私钥配置错误
    echo 2. 账户AVAX余额不足
    echo 3. 网络连接问题
    echo.
    pause
    exit /b 1
)

echo.
echo =====================================================
echo 🎉 智能合约部署成功！
echo =====================================================
echo.
echo ✅ 所有合约已部署到Avalanche Fuji测试网
echo ✅ 配置文件已自动生成: frontend/src/config/contracts.js
echo ✅ 前端应用已自动配置合约地址
echo.
echo 🔍 验证部署:
echo 1. 查看Snowtrace浏览器: https://testnet.snowtrace.io/
echo 2. 搜索您的钱包地址查看交易记录
echo 3. 验证合约地址是否正确
echo.
echo 📱 下一步:
echo 1. 重启前端开发服务器
echo 2. 在MetaMask中确认网络设置
echo 3. 开始测试平台功能
echo =====================================================

pause 