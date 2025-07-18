@echo off
chcp 65001 >nul
title Aptos Move 合约部署脚本

echo.
echo =====================================================
echo 🚀 Aptos Move 智能合约部署脚本
echo =====================================================
echo.

echo 📋 检查环境...
where aptos >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Aptos CLI，正在安装...
    echo 请访问: https://aptos.dev/tools/aptos-cli/install-cli/
    echo 或使用以下命令安装:
    echo curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
    echo.
    pause
    exit /b 1
)

echo ✅ Aptos CLI 检查通过

echo.
echo 🔧 检查 Move 合约目录...
if not exist MoveContracts (
    echo ❌ 未找到 MoveContracts 目录
    pause
    exit /b 1
)

echo ✅ Move 合约目录检查通过

echo.
echo 📁 进入 Move 合约目录...
cd MoveContracts

echo.
echo 🔍 检查 Move.toml 配置...
if not exist Move.toml (
    echo ❌ 未找到 Move.toml 配置文件
    pause
    exit /b 1
)

echo ✅ Move.toml 配置检查通过

echo.
echo 🔧 初始化 Aptos 项目...
aptos init --profile dandelion --network testnet
if %errorlevel% neq 0 (
    echo ❌ Aptos 项目初始化失败
    pause
    exit /b 1
)

echo ✅ Aptos 项目初始化成功

echo.
echo 📦 编译 Move 合约...
aptos move compile --profile dandelion
if %errorlevel% neq 0 (
    echo ❌ Move 合约编译失败
    echo.
    echo 可能的原因:
    echo 1. Move.toml 配置错误
    echo 2. 合约语法错误
    echo 3. 依赖项问题
    echo.
    pause
    exit /b 1
)

echo ✅ Move 合约编译成功

echo.
echo 🚀 部署到 Aptos 测试网...
echo 请稍等，部署过程可能需要几分钟...
echo.

aptos move publish --profile dandelion --named-addresses dandelion=0x1
if %errorlevel% neq 0 (
    echo ❌ 合约部署失败
    echo.
    echo 可能的原因:
    echo 1. 账户余额不足
    echo 2. 网络连接问题
    echo 3. 合约验证失败
    echo.
    pause
    exit /b 1
)

echo.
echo =====================================================
echo 🎉 Aptos Move 合约部署成功！
echo =====================================================
echo.
echo ✅ 所有合约已部署到 Aptos 测试网
echo ✅ 模块地址: 0x1::dandelion
echo.
echo 📋 部署的模块:
echo - TaskFactory
echo - BiddingSystem  
echo - Escrow
echo - DisputeDAO
echo - TaskStorage
echo.
echo 🔍 验证部署:
echo 1. 查看 Aptos Explorer: https://explorer.aptoslabs.com/
echo 2. 搜索您的钱包地址查看交易记录
echo 3. 验证模块是否正确部署
echo.
echo 📱 下一步:
echo 1. 更新前端配置文件中的合约地址
echo 2. 重启前端开发服务器
echo 3. 测试合约功能
echo.

echo 正在生成前端配置文件...
echo.
echo 请手动更新以下文件中的合约地址:
echo - src/utils/aptosConfig.js
echo - src/utils/contracts.js
echo.

pause 