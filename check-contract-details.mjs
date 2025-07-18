const CONTRACT_ADDRESS = "0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb";
const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";

async function checkContractDeployment() {
    console.log("🔍 详细检查合约部署状态...");
    console.log(`📋 合约地址: ${CONTRACT_ADDRESS}`);

    try {
        // 检查账户是否存在
        const accountRes = await fetch(`${NODE_URL}/accounts/${CONTRACT_ADDRESS}`);
        if (!accountRes.ok) throw new Error("账户不存在");
        const account = await accountRes.json();
        console.log("✅ 账户存在");
        console.log(`  sequence_number: '${account.sequence_number}',`);
        console.log(`  authentication_key: '${account.authentication_key}'`);

        // 获取账户资源
        const resourcesRes = await fetch(`${NODE_URL}/accounts/${CONTRACT_ADDRESS}/resources`);
        if (!resourcesRes.ok) throw new Error("无法获取账户资源");
        const resources = await resourcesRes.json();
        console.log(`📦 账户资源数量: ${resources.length}`);

        // 查找dandelion模块
        const dandelionModules = [];
        const packageRegistry = resources.find(r => r.type === "0x1::code::PackageRegistry");

        if (packageRegistry) {
            const packages = packageRegistry.data.packages;
            console.log(`📦 找到 ${packages.length} 个合约包`);

            for (const pkg of packages) {
                if (pkg.name === "MoveContracts") {
                    console.log(`✅ 找到 MoveContracts 包`);
                    console.log(`📋 包含 ${pkg.modules.length} 个模块:`);

                    for (const module of pkg.modules) {
                        const moduleName = module.name;
                        console.log(`  - dandelion::${moduleName}`);
                        dandelionModules.push(moduleName);
                    }
                }
            }
        }

        if (dandelionModules.length > 0) {
            console.log("\n🎉 合约部署成功！");
            console.log("📋 已部署的模块:");
            dandelionModules.forEach(module => {
                console.log(`  ✅ dandelion::${module}`);
            });
            console.log("\n💡 现在可以关闭模拟模式，使用真实合约了！");
        } else {
            console.log("\n❌ 未找到dandelion模块");
            console.log("💡 可能的原因:");
            console.log("   1. 合约部署还在进行中");
            console.log("   2. 需要等待区块链同步");
            console.log("   3. 部署的模块名称不匹配");
        }

    } catch (error) {
        console.error("❌ 检查失败:", error.message);
    }
}

checkContractDeployment(); 