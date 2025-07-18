// 检查页面实际内容脚本
// 直接复制到浏览器控制台运行

(function () {
    console.log('🔍 检查页面实际内容...')

    // 检查#app的实际内容
    console.log('\n📱 #app内容检查:')
    const appElement = document.querySelector('#app')
    if (appElement) {
        console.log('  - #app的HTML内容:')
        console.log(appElement.innerHTML.substring(0, 500) + '...')

        // 检查#app的子元素
        console.log('\n  - #app的子元素:')
        Array.from(appElement.children).forEach((child, index) => {
            console.log(`    ${index + 1}: <${child.tagName.toLowerCase()}> ${child.className}`)
        })
    }

    // 检查所有div元素
    console.log('\n📋 所有div元素检查:')
    const allDivs = document.querySelectorAll('div')
    console.log(`  - 总div数量: ${allDivs.length}`)

    // 查找包含"任务"的div
    const taskDivs = Array.from(allDivs).filter(div =>
        div.textContent.includes('任务') || div.textContent.includes('Task')
    )
    console.log(`  - 包含"任务"的div数量: ${taskDivs.length}`)

    if (taskDivs.length > 0) {
        taskDivs.forEach((div, index) => {
            console.log(`    ${index + 1}: ${div.className} - "${div.textContent.trim().substring(0, 100)}..."`)
        })
    }

    // 检查页面中的文本内容
    console.log('\n📝 页面文本内容检查:')
    const pageText = document.body.textContent
    const lines = pageText.split('\n').filter(line => line.trim().length > 0)

    console.log('  - 页面文本行数:', lines.length)
    console.log('  - 前10行文本:')
    lines.slice(0, 10).forEach((line, index) => {
        console.log(`    ${index + 1}: "${line.trim()}"`)
    })

    // 检查是否有加载状态
    console.log('\n⏳ 加载状态检查:')
    const loadingTexts = [
        '正在从合约获取任务数据',
        '请稍候',
        '加载中',
        'Loading',
        '正在加载',
        '暂无任务数据',
        '没有任务数据'
    ]

    loadingTexts.forEach(text => {
        const found = pageText.includes(text)
        console.log(`  - 包含"${text}": ${found ? '✅ 是' : '❌ 否'}`)
    })

    // 检查网格布局
    console.log('\n🔲 网格布局检查:')
    const gridElements = document.querySelectorAll('.grid')
    console.log(`  - .grid元素数量: ${gridElements.length}`)

    gridElements.forEach((grid, index) => {
        console.log(`  - 网格 ${index + 1}:`)
        console.log(`    - 类名: ${grid.className}`)
        console.log(`    - 子元素数量: ${grid.children.length}`)
        console.log(`    - 内容: "${grid.textContent.trim().substring(0, 100)}..."`)
    })

    // 检查所有按钮的详细信息
    console.log('\n🔘 按钮详细信息:')
    const allButtons = document.querySelectorAll('button')
    allButtons.forEach((btn, index) => {
        console.log(`  - 按钮 ${index + 1}:`)
        console.log(`    - 文本: "${btn.textContent.trim()}"`)
        console.log(`    - 类名: ${btn.className}`)
        console.log(`    - 禁用状态: ${btn.disabled}`)
        console.log(`    - 父元素: <${btn.parentElement.tagName.toLowerCase()}> ${btn.parentElement.className}`)
    })

    // 检查是否有错误信息
    console.log('\n⚠️ 错误信息检查:')
    const errorSelectors = [
        '.error',
        '.alert',
        '[class*="error"]',
        '[class*="alert"]',
        '[class*="warning"]',
        '[class*="danger"]'
    ]

    errorSelectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector)
            if (elements.length > 0) {
                console.log(`  - ${selector}: ${elements.length} 个元素`)
                elements.forEach((el, index) => {
                    console.log(`    ${index + 1}: "${el.textContent.trim()}"`)
                })
            }
        } catch (error) {
            // 忽略选择器错误
        }
    })

    // 检查页面状态指示器
    console.log('\n📊 页面状态指示器:')
    const statusIndicators = [
        '总任务数',
        '进行中',
        '已完成',
        '总奖金池',
        '找到',
        '个任务',
        '第',
        '页'
    ]

    statusIndicators.forEach(indicator => {
        const found = pageText.includes(indicator)
        console.log(`  - 包含"${indicator}": ${found ? '✅ 是' : '❌ 否'}`)
    })

    // 检查是否有任务数据
    console.log('\n📋 任务数据检查:')

    // 尝试查找任务相关的数字
    const numbers = pageText.match(/\d+/g) || []
    console.log(`  - 页面中的数字: ${numbers.join(', ')}`)

    // 检查是否有任务ID
    const taskIds = pageText.match(/任务\s*\d+/g) || []
    console.log(`  - 任务ID: ${taskIds.join(', ')}`)

    // 检查页面结构层次
    console.log('\n🏗️ 页面结构层次:')
    const structure = []
    let currentLevel = 0

    function analyzeStructure(element, level = 0) {
        if (level > 3) return // 只分析前3层

        const indent = '  '.repeat(level)
        const tagName = element.tagName.toLowerCase()
        const className = element.className ? `.${element.className.split(' ')[0]}` : ''
        const text = element.textContent.trim().substring(0, 50)

        structure.push(`${indent}<${tagName}${className}> ${text}`)

        if (level < 3) {
            Array.from(element.children).slice(0, 3).forEach(child => {
                analyzeStructure(child, level + 1)
            })
        }
    }

    if (appElement) {
        analyzeStructure(appElement)
        console.log('  - 页面结构:')
        structure.forEach(line => console.log(`    ${line}`))
    }

    console.log('\n🎯 页面内容检查完成！')
})(); 