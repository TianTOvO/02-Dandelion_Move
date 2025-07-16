@echo off
echo 🚀 启动Dandelion平台服务...

REM 检查IPFS是否已经运行
echo 检查IPFS服务状态...
tasklist /FI "IMAGENAME eq ipfs.exe" 2>NUL | find /I /N "ipfs.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ IPFS守护进程已在运行
) else (
    echo 🔄 启动IPFS守护进程...
    start /B ipfs daemon
    echo 等待IPFS启动...
    timeout /t 5 /nobreak >nul
)

REM 检查前端服务器是否已经运行
echo 检查前端服务器状态...
netstat -an | findstr :3000 >nul
if %errorlevel%==0 (
    echo ✅ 前端服务器已在运行
) else (
    echo 🔄 启动前端服务器...
    cd frontend
    start /B npx vite --host 0.0.0.0 --port 3000
    cd ..
    echo 等待前端服务器启动...
    timeout /t 8 /nobreak >nul
)

echo.
echo 🎉 服务启动完成！
echo.
echo 📊 服务状态检查:
netstat -an | findstr :5001 >nul && echo ✅ IPFS API: http://127.0.0.1:5001 || echo ❌ IPFS API未启动
netstat -an | findstr :3000 >nul && echo ✅ 前端服务器: http://localhost:3000 || echo ❌ 前端服务器未启动

echo.
echo 🌐 可访问的地址:
echo   - http://localhost:3000
echo   - http://127.0.0.1:3000
echo   - http://192.168.80.1:3000
echo   - http://192.168.184.1:3000
echo   - http://192.168.146.225:3000
echo.
echo 🧪 测试页面: 在任意地址后添加 /test
echo   例如: http://localhost:3000/test
echo.
echo 💡 MetaMask连接问题解决方案:
echo   1. 如果出现"待处理请求"错误，请在MetaMask中处理或等待几秒后重试
echo   2. 如果出现CORS错误，请运行 configure-ipfs-cors.bat
echo   3. 确保MetaMask已解锁并切换到正确的网络
echo   4. 如果出现网络获取错误，请使用测试页面的"详细诊断"功能
echo.
echo 🔧 Web3错误修复:
echo   - 已修复ethers.js网络代理错误
echo   - 实施了多重网络获取策略和重试机制
echo   - 详细诊断工具可在测试页面使用
echo.
echo 📖 相关文档:
echo   - METAMASK_CONNECTION_GUIDE.md - MetaMask连接问题指南
echo   - WEB3_NETWORK_ERROR_FIX.md - Web3网络错误修复指南
echo   - CORS_FIX_GUIDE.md - IPFS跨域问题解决指南
echo.

pause 