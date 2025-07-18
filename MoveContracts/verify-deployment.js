import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "aptos";

// 配置
const NODE_URL = "https://fullnode.testnet.aptoslabs.com";
const MODULE_ADDRESS = "0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b";

const client = new AptosClient(NODE_URL);

async function verifyDeployment() {
    console.log("🔍 验证合约部署状态...\n");

    const modules = [
        "TaskFactory",
        "TaskStorage",
        "Escrow",
        "BiddingSystem",
        "DisputeDAO"
    ];

    for (const moduleName of modules) {
        try {
            const moduleAddress = `${MODULE_ADDRESS}::${moduleName}`;
            console.log(`检查模块: ${moduleName}`);

            // 尝试获取模块信息
            const moduleData = await client.getAccountModule(MODULE_ADDRESS, moduleName);

            if (moduleData) {
                console.log(`✅ ${moduleName} - 部署成功`);
                console.log(`   地址: ${moduleAddress}`);
                console.log(`   字节码长度: ${moduleData.bytecode.length} bytes\n`);
            }
        } catch (error) {
            console.log(`❌ ${moduleName} - 部署失败或无法访问`);
            console.log(`   错误: ${error.message}\n`);
        }
    }

    // 检查账户余额
    try {
        const accountData = await client.getAccount(MODULE_ADDRESS);
        console.log("💰 账户信息:");
        console.log(`   地址: ${MODULE_ADDRESS}`);
        console.log(`   序列号: ${accountData.sequence_number}`);
        console.log(`   认证密钥: ${accountData.authentication_key}\n`);
    } catch (error) {
        console.log(`❌ 无法获取账户信息: ${error.message}\n`);
    }

    console.log("🎉 部署验证完成！");
}

// 运行验证
verifyDeployment().catch(console.error); 