import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      buffer: 'buffer',
      process: resolve(__dirname, 'node_modules/process/browser.js'),
      util: 'util',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify'
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    buffer: 'buffer',
    Buffer: 'buffer.Buffer',
  },
  server: {
    port: 3000,
    host: true
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'util',
      'ethers',
      'stream-browserify',
      'crypto-browserify',
      'ipfs-http-client'
    ],
    exclude: []
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {
          buffer: 'buffer'
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
