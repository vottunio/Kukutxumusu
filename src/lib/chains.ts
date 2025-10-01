import { defineChain } from 'viem'

// Base Network
export const baseMainnet = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
  testnet: false,
})

export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
  testnet: true,
})

// Story Protocol
export const storyMainnet = defineChain({
  id: 1514,
  name: 'Story Mainnet',
  nativeCurrency: {
    name: 'IP',
    symbol: 'IP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.storyrpc.io'],
    },
    public: {
      http: ['https://mainnet.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'StoryScan',
      url: 'https://mainnet.storyscan.xyz',
    },
  },
  testnet: false,
})

export const storyTestnet = defineChain({
  id: 1513,
  name: 'Story Testnet',
  nativeCurrency: {
    name: 'IP',
    symbol: 'IP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.storyrpc.io'],
    },
    public: {
      http: ['https://testnet.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'StoryScan Testnet',
      url: 'https://testnet.storyscan.xyz',
    },
  },
  testnet: true,
})

// Redes para pagos (Base)
export const paymentChains = [baseMainnet, baseSepolia]

// Redes para NFTs (Story Protocol)
export const nftChains = [storyMainnet, storyTestnet]

// Todas las redes soportadas
export const supportedChains = [...paymentChains, ...nftChains]
