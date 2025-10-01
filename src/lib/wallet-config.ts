import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient } from '@tanstack/react-query'
import { http } from 'viem'
import { baseMainnet, baseSepolia, storyMainnet, storyTestnet } from './chains'

// Configuración de RainbowKit
export const config = getDefaultConfig({
  appName: 'Kukuxumusu NFT',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [baseMainnet, baseSepolia, storyMainnet, storyTestnet],
  transports: {
    [baseMainnet.id]: http(),
    [baseSepolia.id]: http(),
    [storyMainnet.id]: http(),
    [storyTestnet.id]: http(),
  },
})

// Query Client para React Query
export const queryClient = new QueryClient()
