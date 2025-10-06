import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient } from '@tanstack/react-query'
import { http } from 'viem'
import { baseMainnet, baseSepolia, storyMainnet, storyTestnet } from './chains'
import { WAGMI_CHAINS } from '@/config/network'

// Configuración de gas optimizada para Base (EIP-1559)
const baseGasConfig = {
  maxFeePerGas: 2000000000n, // 2 gwei
  maxPriorityFeePerGas: 1000000000n, // 1 gwei
}

// Configuración de RainbowKit con optimizaciones de gas
export const config = getDefaultConfig({
  appName: 'Kukuxumusu NFT',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains: WAGMI_CHAINS, // Determinado por NEXT_PUBLIC_NETWORK_MODE
  transports: {
    [baseMainnet.id]: http(),
    [baseSepolia.id]: http(),
    [storyMainnet.id]: http(),
    [storyTestnet.id]: http(),
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
