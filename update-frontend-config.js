import fs from 'fs';
import path from 'path';

// 新的合约地址
const NEW_CONTRACT_ADDRESS = "0xa1b3e0179d015222a7dfae11a029f96b173f0bf5b4747fd6c2d057dead2b921b";

// 需要更新的文件列表
const filesToUpdate = [
    'frontend/src/utils/aptosConfig.js',
    'frontend/src/utils/contracts.js',
    'frontend/src/utils/aptosContractService.js',
    'src/utils/aptosConfig.js',
    'src/utils/contracts.js',
    'src/utils/aptosContractService.js'
];

function updateFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  文件不存在: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // 更新各种可能的地址格式
        const patterns = [
            /0x[a-fA-F0-9]{64}/g,  // 64位十六进制地址
            /"0x[a-fA-F0-9]{64}"/g,  // 引号包围的地址
            /'0x[a-fA-F0-9]{64}'/g,  // 单引号包围的地址
        ];

        patterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, (match) => {
                    if (match.includes('0x')) {
                        updated = true;
                        return match.replace(/0x[a-fA-F0-9]{64}/, NEW_CONTRACT_ADDRESS);
                    }
                    return match;
                });
            }
        });

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 已更新: ${filePath}`);
        } else {
            console.log(`ℹ️  无需更新: ${filePath}`);
        }
    } catch (error) {
        console.log(`❌ 更新失败: ${filePath} - ${error.message}`);
    }
}

console.log("🔄 开始更新前端配置文件...\n");

filesToUpdate.forEach(updateFile);

console.log("\n📋 更新完成！");
console.log(`📝 新的合约地址: ${NEW_CONTRACT_ADDRESS}`);
console.log("\n🔗 您可以在以下位置查看合约:");
console.log(`   https://explorer.aptoslabs.com/account/${NEW_CONTRACT_ADDRESS}?network=testnet`); 