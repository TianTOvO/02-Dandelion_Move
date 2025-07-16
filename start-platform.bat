@echo off
chcp 65001 >nul
title Dandelion去中心化任务悬赏平台

echo.
echo =====================================================
echo 🌻 Dandelion去中心化任务悬赏平台 启动脚本
echo =====================================================
echo.

echo 📋 检查环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Node.js，请先安装Node.js 18+
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到npm，请先安装Node.js
    pause
    exit /b 1
)

echo ✅ Node.js环境检查通过

echo.
echo 🔧 安装依赖...
echo 正在安装前端依赖...
cd frontend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)

echo 正在安装合约依赖...
cd ..\contracts
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 合约依赖安装失败
        pause
        exit /b 1
    )
)

echo ✅ 依赖安装完成

echo.
echo 🚀 启动服务...
echo 正在启动前端开发服务器...
cd ..\frontend

echo.
echo =====================================================
echo 🎉 平台启动成功！
echo =====================================================
echo 📱 访问地址: http://localhost:3000
echo 🔧 开发服务器: Vite
echo 📁 项目目录: %CD%
echo =====================================================
echo.
echo 💡 使用提示:
echo 1. 确保MetaMask已安装并连接到Avalanche Fuji测试网
echo 2. 获取测试AVAX: https://faucet.avax.network/
echo 3. 部署智能合约: 在contracts目录运行 npm run deploy:fuji
echo 4. 按Ctrl+C停止服务器
echo.

npm run dev

pause 