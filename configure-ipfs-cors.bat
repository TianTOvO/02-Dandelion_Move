@echo off
echo 正在配置IPFS CORS设置...

REM 停止IPFS守护进程
echo 停止IPFS守护进程...
taskkill /f /im ipfs.exe 2>nul

REM 等待进程完全停止
timeout /t 3 /nobreak >nul

REM 配置CORS设置 - 允许所有来源
echo 配置CORS设置...
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\", \"DELETE\", \"OPTIONS\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers "[\"Authorization\", \"Content-Type\", \"X-Requested-With\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "false"

REM 重新启动IPFS守护进程
echo 重新启动IPFS守护进程...
start /B ipfs daemon

echo IPFS CORS配置完成！
echo 请等待几秒钟让IPFS守护进程完全启动...
timeout /t 5 /nobreak >nul

echo 配置完成！现在可以从任何网络地址访问IPFS了。
echo 前端可以访问的地址:
echo - http://localhost:3000
echo - http://127.0.0.1:3000  
echo - http://192.168.80.1:3000
echo - http://192.168.184.1:3000
echo - http://192.168.146.225:3000
pause 