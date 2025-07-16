# PowerShell 脚本：自动检查并安装项目依赖，最后运行前后端
# 适用于 Windows 环境

Write-Host "==== 检查 Node.js 版本... ====" -ForegroundColor Cyan
$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "未检测到 Node.js，正在下载安装..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v18.20.3/node-v18.20.3-x64.msi" -OutFile "nodejs.msi"
    Start-Process msiexec.exe -Wait -ArgumentList '/I nodejs.msi /quiet'
    Remove-Item "nodejs.msi"
    $env:Path += ";$($env:ProgramFiles)\nodejs"
} else {
    Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green
}

# 检查 npm
Write-Host "==== 检查 npm... ====" -ForegroundColor Cyan
$npmVersion = npm -v 2>$null
if (-not $npmVersion) {
    Write-Host "npm 未安装，请检查 Node.js 安装。" -ForegroundColor Red
    exit 1
} else {
    Write-Host "npm 版本: $npmVersion" -ForegroundColor Green
}

# 检查 contracts 依赖
Write-Host "==== 检查并安装 contracts 依赖... ====" -ForegroundColor Cyan
if (Test-Path "contracts/package.json") {
    cd contracts
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    if (-not (npm list @openzeppelin/contracts | Select-String "@openzeppelin/contracts")) {
        Write-Host "安装 @openzeppelin/contracts..." -ForegroundColor Yellow
        npm install @openzeppelin/contracts
    }
    if (-not (npm list hardhat | Select-String "hardhat")) {
        Write-Host "安装 hardhat..." -ForegroundColor Yellow
        npm install --save-dev hardhat
    }
    cd ..
}

# 检查 frontend 依赖
Write-Host "==== 检查并安装 frontend 依赖... ====" -ForegroundColor Cyan
if (Test-Path "frontend/package.json") {
    cd frontend
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    cd ..
}

# 编译合约
Write-Host "==== 编译合约... ====" -ForegroundColor Cyan
if (Test-Path "contracts/scripts/deploy.js") {
    cd contracts
    npx hardhat compile
    cd ..
}

# 启动前端
Write-Host "==== 启动前端... ====" -ForegroundColor Cyan
if (Test-Path "frontend/package.json") {
    cd frontend
    npm run dev
}
