import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient } from '@tanstack/react-query'
import { http } from 'viem'
import { baseMainnet, baseSepolia, storyMainnet, storyTestnet } from './chains'
import { WAGMI_CHAINS } from '@/config/network'

// Configuración de gas optimizada para Base (EIP-1559)
const baseGasConfig = {
  maxFeePerGas: 2000000000n, // 2 gwei
  maxPriorityFeePerGas: 1000000000n, // 1 gwei
  gas: 500000n, // 500k gas limit por defecto
}

// Configuración de RainbowKit con optimizaciones de gas
export const config = getDefaultConfig({
  appName: 'Adarbakar NFT',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains: WAGMI_CHAINS as any, // Determinado por NEXT_PUBLIC_NETWORK_MODE
  transports: {
    [baseMainnet.id]: http('https://mainnet.base.org', {
      retryCount: 3,
      timeout: 30_000,
    }),
    [baseSepolia.id]: http('https://sepolia.base.org', {
      retryCount: 3,
      timeout: 30_000,
    }),
    [storyMainnet.id]: http('https://mainnet.storyrpc.io', {
      retryCount: 3,
      timeout: 30_000,
    }),
    [storyTestnet.id]: http('https://aeneid.storyrpc.io', {
      retryCount: 3,
      timeout: 30_000,
    }),
  },
  // Configuración de gas optimizada
  batch: {
    multicall: {
      batchSize: 1024,
      wait: 16,
    },
  },
})

// Query Client para React Query
export const queryClient = new QueryClient()

// Exportar configuración de gas para uso en hooks
export { baseGasConfig }
