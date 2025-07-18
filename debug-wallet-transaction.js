// 调试钱包连接和交易提交问题
console.log('🔍 调试钱包连接和交易提交问题...\n')

// 检查浏览器环境
console.log('🌐 浏览器环境检查:')
console.log('  typeof window:', typeof window)
console.log('  window.petra:', !!window.petra)
console.log('  window.aptos:', !!window.aptos)
console.log('')

// 检查钱包API
if (typeof window !== 'undefined') {
    console.log('🔗 钱包API检查:')

    if (window.petra) {
        console.log('✅ Petra 钱包已安装')
        console.log('  connect:', typeof window.petra.connect)
        console.log('  signAndSubmitTransaction:', typeof window.petra.signAndSubmitTransaction)
        console.log('  network:', typeof window.petra.network)
        console.log('  account:', typeof window.petra.account)
    } else {
        console.log('❌ Petra 钱包未安装')
    }

    if (window.aptos) {
        console.log('✅ Aptos 钱包已安装')
        console.log('  connect:', typeof window.aptos.connect)
        console.log('  signAndSubmitTransaction:', typeof window.aptos.signAndSubmitTransaction)
        console.log('  network:', typeof window.aptos.network)
        console.log('  account:', typeof window.aptos.account)
    } else {
        console.log('❌ Aptos 钱包未安装')
    }
} else {
    console.log('⚠️ 非浏览器环境，无法检查钱包')
}

console.log('')

// 测试交易载荷构建
console.log('📦 测试交易载荷构建:')

const testPayload = {
    type: 'entry_function_payload',
    function: '0x0af66c3096f6d90b8a4b4491fc5933d8729d5002d938559109e9e91556e83ddb::TaskFactory::init',
    type_arguments: [],
    arguments: []
}

console.log('TaskFactory::init 载荷:')
console.log(JSON.stringify(testPayload, null, 2))
console.log('')

// 测试可能的错误原因
console.log('⚠️ 可能的错误原因:')
const possibleErrors = [
    '钱包未连接',
    '网络不匹配',
    '账户余额不足',
    '合约地址错误',
    '函数名错误',
    '参数类型错误',
    'Gas费用不足',
    '交易被拒绝',
    '网络拥堵',
    '合约未部署'
]

possibleErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`)
})

console.log('')

// 提供调试建议
console.log('💡 调试建议:')
console.log('1. 检查浏览器控制台的详细错误信息')
console.log('2. 确认Petra钱包已连接并切换到测试网')
console.log('3. 确认账户有足够的APT余额')
console.log('4. 检查合约是否已正确部署')
console.log('5. 尝试手动调用钱包的connect()方法')
console.log('6. 检查网络连接状态')

console.log('\n✅ 调试信息收集完成')
console.log('请查看浏览器控制台的详细错误信息') 