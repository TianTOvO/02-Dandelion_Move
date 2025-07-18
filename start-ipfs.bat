@echo off
echo ========================================
echo           IPFS 快速启动脚本
echo ========================================
echo.

echo 检查IPFS是否已安装...
ipfs --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ IPFS未安装或未添加到PATH
    echo.
    echo 请按照以下步骤安装IPFS：
    echo 1. 访问 https://ipfs.io/ipfs-desktop/
    echo 2. 下载并安装IPFS Desktop
    echo 3. 或者下载命令行版本并添加到PATH
    echo.
    pause
    exit /b 1
)

echo ✅ IPFS已安装
echo.

echo 检查IPFS是否已初始化...
if not exist "%USERPROFILE%\.ipfs\config" (
    echo 首次运行，正在初始化IPFS...
    ipfs init
    if %errorlevel% neq 0 (
        echo ❌ IPFS初始化失败
        pause
        exit /b 1
    )
    echo ✅ IPFS初始化完成
) else (
    echo ✅ IPFS已初始化
)

echo.

echo 配置CORS（允许前端访问）...
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
echo ✅ CORS配置完成

echo.

echo 启动IPFS守护进程...
echo 注意：IPFS守护进程将在后台运行
echo 访问 http://127.0.0.1:8080 查看Web界面
echo 访问 http://127.0.0.1:5001/api/v0/version 检查API
echo.
echo 按 Ctrl+C 停止IPFS守护进程
echo.

ipfs daemon 