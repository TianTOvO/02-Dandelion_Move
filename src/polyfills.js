// polyfills.js - 浏览器兼容性polyfill
// 解决Node.js模块在浏览器环境中的兼容性问题

// Buffer polyfill
import { Buffer } from 'buffer'

// 确保Buffer在全局可用
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
  window.global = window.global || window
  
  // 确保buffer模块在全局可用
  window.buffer = { Buffer }
  
  // Process polyfill
  if (!window.process) {
    window.process = {
      env: {},
      browser: true,
      version: '',
      platform: 'browser',
      nextTick: function(fn) {
        setTimeout(fn, 0)
      }
    }
  }
}

// 确保globalThis可用
if (typeof globalThis === 'undefined') {
  if (typeof window !== 'undefined') {
    window.globalThis = window
  } else if (typeof global !== 'undefined') {
    global.globalThis = global
  }
}

// 确保全局buffer和Buffer可用
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer
  globalThis.buffer = { Buffer }
}

console.log('🔧 Polyfills已加载:', {
  Buffer: typeof Buffer !== 'undefined',
  'window.Buffer': typeof window?.Buffer !== 'undefined',
  'window.buffer': typeof window?.buffer !== 'undefined',
  process: typeof process !== 'undefined',
  globalThis: typeof globalThis !== 'undefined'
}) 