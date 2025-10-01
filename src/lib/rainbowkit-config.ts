import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, mainnet } from 'wagmi/chains'

// Configuración de RainbowKit para Base y Ethereum (Story Protocol)
export const config = getDefaultConfig({
  appName: 'Kukuxumusu NFT',
  projectId: 'YOUR_PROJECT_ID', // Necesitarás obtener esto de WalletConnect
  chains: [base, mainnet], // Base para pagos, Ethereum para Story Protocol
  ssr: true, // Para Next.js SSR
})
