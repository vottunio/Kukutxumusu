import { createAppKit } from '@reown/appkit'
import { WagmiProvider } from '@reown/appkit/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'viem'
import { baseMainnet, baseSepolia, storyMainnet, storyTestnet } from './chains'

// Configuración de WalletConnect
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required')
}

// Configuración de AppKit
export const appKitConfig = createAppKit({
  adapters: [
    // MetaMask
    {
      id: 'metaMask',
      name: 'MetaMask',
      icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
    },
    // WalletConnect
    {
      id: 'walletConnect',
      name: 'WalletConnect',
      icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Gradient/Icon.png',
    },
  ],
  chains: [baseMainnet, baseSepolia, storyMainnet, storyTestnet],
  projectId,
  themeMode: 'light',
  themeVariables: {
    '--w3m-z-index': '1000',
  },
})

// Configuración de Wagmi
export const wagmiConfig = appKitConfig.wagmiConfig

// Query Client para React Query
export const queryClient = new QueryClient()
