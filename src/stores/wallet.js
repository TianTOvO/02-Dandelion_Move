
import { defineStore } from 'pinia'
import { AptosClient } from 'aptos'

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    // Move链相关
    aptosAccount: null, // Aptos钱包地址
    aptosConnected: false,
    aptosBalance: '0',
    aptosClient: null,
    aptosNetwork: 'https://fullnode.mainnet.aptoslabs.com/v1', // 可根据需要切换
    error: null,
    loading: false,
  }),

  getters: {
    // 格式化Aptos余额显示
    formattedAptosBalance: (state) => {
      return parseFloat(state.aptosBalance).toFixed(4)
    },
    // 格式化Aptos地址显示
    formatAptosAddress: (state) => (address) => {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    },
    // 检查Aptos钱包是否已连接
    isAptosReady: (state) => {
      return state.aptosConnected && !!state.aptosAccount
    }
  },

  actions: {
    // 连接Aptos钱包（如Petra/Martian）
    async connectAptosWallet() {
      this.loading = true;
      this.error = null;
      if (window.aptos) {
        try {
          const response = await window.aptos.connect();
          this.aptosAccount = response.address;
          this.aptosConnected = true;
          this.aptosClient = new AptosClient(this.aptosNetwork);
          // 获取余额
          const resources = await this.aptosClient.getAccountResources(this.aptosAccount);
          const coin = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
          this.aptosBalance = coin ? (parseInt(coin.data.coin.value) / 1e8).toString() : '0';
        } catch (e) {
          this.error = 'Aptos钱包连接失败';
        }
      } else {
        this.error = '未检测到Aptos钱包插件（如Petra/Martian）';
      }
      this.loading = false;
    },

    // 断开Aptos钱包
    disconnectAptosWallet() {
      this.aptosAccount = null;
      this.aptosConnected = false;
      this.aptosBalance = '0';
      this.aptosClient = null;
    },

    // 清除错误
    clearError() {
      this.error = null;
    },
  }
})