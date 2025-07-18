@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 开始部署 Dandelion Move 合约到新地址...
echo 📋 新地址: 0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9

REM 检查是否在正确的目录
if not exist "Move.toml" (
    echo ❌ 错误: 请在 MoveContracts 目录下运行此脚本
    pause
    exit /b 1
)

REM 检查 Aptos CLI
aptos --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Aptos CLI，请先安装
    echo 安装命令: curl -fsSL "https://aptos.dev/scripts/install_cli.py" ^| python3
    pause
    exit /b 1
)

echo ✅ Aptos CLI 已安装

REM 检查配置文件
if not exist ".aptos\config.yaml" (
    echo ❌ 错误: 未找到 .aptos\config.yaml 配置文件
    pause
    exit /b 1
)

echo ✅ 配置文件检查通过

REM 步骤1: 编译合约
echo.
echo 📦 步骤1: 编译合约...
aptos move compile --profile newaddress
if errorlevel 1 (
    echo ❌ 合约编译失败
    pause
    exit /b 1
)
echo ✅ 合约编译成功

REM 步骤2: 发布合约
echo.
echo 📤 步骤2: 发布合约到测试网...
aptos move publish --profile newaddress --named-addresses dandelion=0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9
if errorlevel 1 (
    echo ❌ 合约发布失败
    pause
    exit /b 1
)
echo ✅ 合约发布成功

REM 步骤3: 验证部署
echo.
echo 🔍 步骤3: 验证部署...
echo 📋 检查账户信息:
aptos account list --profile newaddress

echo.
echo 📋 检查部署的模块:
aptos account list --profile newaddress --query modules

REM 步骤4: 初始化合约
echo.
echo 🔧 步骤4: 初始化合约...

echo   初始化 TaskFactory...
aptos move run --profile newaddress --function-id "0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskFactory::init"
if errorlevel 1 (
    echo ⚠️  TaskFactory 初始化失败，可能已经初始化过
)

echo   初始化 BiddingSystem...
aptos move run --profile newaddress --function-id "0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::BiddingSystem::init" --args u64:1000000
if errorlevel 1 (
    echo ⚠️  BiddingSystem 初始化失败，可能已经初始化过
)

echo   初始化 Escrow...
aptos move run --profile newaddress --function-id "0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::Escrow::init"
if errorlevel 1 (
    echo ⚠️  Escrow 初始化失败，可能已经初始化过
)

echo   初始化 DisputeDAO...
aptos move run --profile newaddress --function-id "0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::DisputeDAO::init" --args u64:1000000 u64:3 u64:86400
if errorlevel 1 (
    echo ⚠️  DisputeDAO 初始化失败，可能已经初始化过
)

echo   初始化 TaskStorage...
aptos move run --profile newaddress --function-id "0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskStorage::init"
if errorlevel 1 (
    echo ⚠️  TaskStorage 初始化失败，可能已经初始化过
)

echo ✅ 所有合约初始化完成

REM 步骤5: 最终验证
echo.
echo 🔍 步骤5: 最终验证...
echo 📋 检查账户资源:
aptos account list --profile newaddress --query resources

echo.
echo 📋 测试合约功能...
aptos move view --profile newaddress --function-id "0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskFactory::view_get_all_tasks"

echo.
echo 🎉 部署完成！
echo.
echo 📋 部署信息:
echo    合约地址: 0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9
echo    网络: Aptos 测试网
echo    模块: TaskFactory, BiddingSystem, Escrow, DisputeDAO, TaskStorage
echo.
echo 🔗 查看合约:
echo    https://explorer.aptoslabs.com/account/0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9?network=testnet
echo.
echo 📝 下一步:
echo    1. 更新前端配置文件
echo    2. 启动前端服务
echo    3. 测试合约功能
echo.
echo 💡 提示: 运行 node check-deployment.js 检查部署状态
echo.
pause 