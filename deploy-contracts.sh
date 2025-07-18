#!/bin/bash

# Dandelion Move 合约部署脚本
# 使用方法: ./deploy-contracts.sh

set -e  # 遇到错误时退出

echo "🚀 开始部署 Dandelion Move 合约..."

# 检查是否在正确的目录
if [ ! -f "Move.toml" ]; then
    echo "❌ 错误: 请在 MoveContracts 目录下运行此脚本"
    exit 1
fi

# 检查 Aptos CLI
if ! command -v aptos &> /dev/null; then
    echo "❌ 错误: 未找到 Aptos CLI，请先安装"
    echo "安装命令: curl -fsSL 'https://aptos.dev/scripts/install_cli.py' | python3"
    exit 1
fi

echo "✅ Aptos CLI 已安装"

# 检查配置文件
if [ ! -f ".aptos/config.yaml" ]; then
    echo "❌ 错误: 未找到 .aptos/config.yaml 配置文件"
    exit 1
fi

echo "✅ 配置文件检查通过"

# 步骤1: 编译合约
echo "📦 步骤1: 编译合约..."
aptos move compile --profile newaddress
echo "✅ 合约编译成功"

# 步骤2: 发布合约
echo "📤 步骤2: 发布合约到测试网..."
aptos move publish --profile newaddress --named-addresses dandelion=0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9
echo "✅ 合约发布成功"

# 步骤3: 验证部署
echo "🔍 步骤3: 验证部署..."
echo "📋 检查账户信息:"
aptos account list --profile newaddress

echo "📋 检查部署的模块:"
aptos account list --profile newaddress --query modules

# 步骤4: 初始化合约
echo "🔧 步骤4: 初始化合约..."

echo "  初始化 TaskFactory..."
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskFactory::init'

echo "  初始化 BiddingSystem..."
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::BiddingSystem::init' \
  --args u64:1000000

echo "  初始化 Escrow..."
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::Escrow::init'

echo "  初始化 DisputeDAO..."
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::DisputeDAO::init' \
  --args u64:1000000 u64:3 u64:86400

echo "  初始化 TaskStorage..."
aptos move run --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskStorage::init'

echo "✅ 所有合约初始化成功"

# 步骤5: 最终验证
echo "🔍 步骤5: 最终验证..."
echo "📋 检查账户资源:"
aptos account list --profile newaddress --query resources

echo "📋 测试合约功能..."
aptos move view --profile newaddress \
  --function-id '0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9::TaskFactory::view_get_all_tasks'

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 部署信息:"
echo "   合约地址: 0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9"
echo "   网络: Aptos 测试网"
echo "   模块: TaskFactory, BiddingSystem, Escrow, DisputeDAO, TaskStorage"
echo ""
echo "🔗 查看合约:"
echo "   https://explorer.aptoslabs.com/account/0x87315ce5564346fa199d58c2160cf45d8e73a589b6bfb02f444f9c283e56f5f9?network=testnet"
echo ""
echo "📝 下一步:"
echo "   1. 更新前端配置文件"
echo "   2. 启动前端服务"
echo "   3. 测试合约功能"
echo "" 