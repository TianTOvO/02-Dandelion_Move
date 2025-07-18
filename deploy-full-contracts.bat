@echo off
echo 🚀 开始完整部署Move合约到Aptos测试网...
echo.

REM 检查是否安装了Aptos CLI
aptos --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装Aptos CLI
    echo 📝 请先安装Aptos CLI:
    echo    curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
    pause
    exit /b 1
)

echo ✅ Aptos CLI已安装

REM 切换到MoveContracts目录
cd MoveContracts

REM 检查Move.toml是否存在
if not exist "Move.toml" (
    echo ❌ Move.toml文件不存在
    pause
    exit /b 1
)

echo ✅ 找到Move.toml文件

REM 初始化Aptos项目（如果还没有初始化）
echo 🔧 初始化Aptos项目...
aptos init --profile testnet --network testnet --private-key-file .aptos/key

REM 编译合约
echo 🔨 编译Move合约...
aptos move compile --named-addresses dandelion=0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb

if %errorlevel% neq 0 (
    echo ❌ 合约编译失败
    pause
    exit /b 1
)

echo ✅ 合约编译成功

REM 发布合约
echo 📤 发布合约到测试网...
aptos move publish --named-addresses dandelion=0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb --profile testnet

if %errorlevel% equ 0 (
    echo.
    echo ✅ 合约部署成功!
    echo 📋 合约地址: 0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb
    echo 🔗 可以在Aptos Explorer中查看: https://explorer.aptoslabs.com/account/0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb
    echo.
    echo 💡 等待几秒钟让区块链同步，然后运行检查脚本
    echo.
    echo 等待5秒...
    timeout /t 5 /nobreak >nul
    
    echo 🔍 检查部署状态...
    cd ..
    node check-contract-details.js
    
    echo.
    echo 💡 如果合约已部署，重新启动前端将自动切换到真实模式
) else (
    echo.
    echo ❌ 部署失败
    echo 💡 可能的解决方案:
    echo    1. 确保有足够的测试网APT代币
    echo    2. 检查网络连接
    echo    3. 确保Move合约代码正确
)

pause 