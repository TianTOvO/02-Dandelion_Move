// 简单页面状态检查脚本
// 直接复制到浏览器控制台运行

(function () {
    console.log('🔍 开始简单页面状态检查...')

    // 检查页面基本信息
    console.log('\n📄 页面基本信息:')
    console.log('  - 当前URL:', window.location.href)
    console.log('  - 页面标题:', document.title)
    console.log('  - 是否在任务页面:', window.location.pathname.includes('/tasks'))

    // 检查Vue应用
    console.log('\n📱 Vue应用检查:')
    const appElement = document.querySelector('#app')
    console.log('  - #app元素:', appElement)

    if (appElement) {
        console.log('  - #app内容长度:', appElement.innerHTML.length)
        console.log('  - #app子元素数量:', appElement.children.length)
        console.log('  - #app是否有Vue属性:', !!appElement.__vue_app__)
    }

    // 检查页面内容
    console.log('\n📋 页面内容检查:')

    // 检查是否有任务相关的文本
    const pageText = document.body.textContent
    console.log('  - 页面包含"任务":', pageText.includes('任务'))
    console.log('  - 页面包含"竞标":', pageText.includes('竞标'))
    console.log('  - 页面包含"Tasks":', pageText.includes('Tasks'))
    console.log('  - 页面包含"Bid":', pageText.includes('Bid'))

    // 检查各种可能的选择器
    console.log('\n🔍 选择器检查:')

    const selectors = [
        '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div',
        '.grid > div',
        '[class*="task"]',
        '[class*="card"]',
        '.task-card',
        '.card',
        'button'
    ]

    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector)
            console.log(`  - ${selector}: ${elements.length} 个元素`)
        } catch (error) {
            console.log(`  - ${selector}: 选择器错误`)
        }
    })

    // 检查所有按钮
    console.log('\n🔘 按钮检查:')
    const allButtons = document.querySelectorAll('button')
    console.log(`  - 总按钮数量: ${allButtons.length}`)

    if (allButtons.length > 0) {
        console.log('  - 按钮文本列表:')
        allButtons.forEach((btn, index) => {
            const text = btn.textContent.trim()
            if (text) {
                console.log(`    ${index + 1}: "${text}"`)
            }
        })
    }

    // 检查页面加载状态
    console.log('\n⏳ 页面加载状态:')
    console.log('  - document.readyState:', document.readyState)
    console.log('  - 是否有加载动画:', !!document.querySelector('.animate-spin'))
    console.log('  - 是否有加载文本:', !!document.querySelector('*:contains("加载")'))

    // 检查错误信息
    console.log('\n⚠️ 错误检查:')
    const errorElements = document.querySelectorAll('.error, .alert, [class*="error"], [class*="alert"]')
    console.log(`  - 错误元素数量: ${errorElements.length}`)

    if (errorElements.length > 0) {
        errorElements.forEach((el, index) => {
            console.log(`    ${index + 1}: ${el.textContent.trim()}`)
        })
    }

    // 检查网络请求
    console.log('\n🌐 网络状态:')
    console.log('  - navigator.onLine:', navigator.onLine)

    // 检查控制台错误
    console.log('\n📝 控制台错误:')
    console.log('  - 请检查控制台是否有其他错误信息')

    // 尝试获取Vue组件
    console.log('\n🧩 Vue组件检查:')
    const vueComponents = document.querySelectorAll('[data-v-]')
    console.log(`  - Vue组件数量: ${vueComponents.length}`)

    if (vueComponents.length > 0) {
        console.log('  - 第一个Vue组件:', vueComponents[0])
        console.log('  - 组件属性:', Array.from(vueComponents[0].attributes).map(attr => attr.name).join(', '))
    }

    // 检查页面结构
    console.log('\n🏗️ 页面结构检查:')
    const mainContent = document.querySelector('main') || document.querySelector('.main') || document.querySelector('#main')
    console.log('  - 主要内容区域:', mainContent)

    if (mainContent) {
        console.log('  - 内容区域子元素:', mainContent.children.length)
        console.log('  - 内容区域HTML:', mainContent.innerHTML.substring(0, 200) + '...')
    }

    // 检查是否有任务列表容器
    console.log('\n📋 任务列表容器检查:')
    const possibleContainers = [
        '.tasks-container',
        '.task-list',
        '.grid',
        '.container',
        '[class*="task"]',
        '[class*="list"]'
    ]

    possibleContainers.forEach(selector => {
        try {
            const container = document.querySelector(selector)
            if (container) {
                console.log(`  - 找到容器 ${selector}:`, container)
                console.log(`    - 子元素数量: ${container.children.length}`)
                console.log(`    - 内容长度: ${container.innerHTML.length}`)
            }
        } catch (error) {
            // 忽略选择器错误
        }
    })

    console.log('\n🎯 简单页面检查完成！')
    console.log('💡 建议:')
    console.log('  1. 确保页面完全加载')
    console.log('  2. 检查网络连接')
    console.log('  3. 尝试刷新页面')
    console.log('  4. 检查是否有JavaScript错误')
})(); 