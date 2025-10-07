/**
 * Network Configuration
 * Configuración centralizada de redes según el modo (testnet/mainnet)
 */

import { baseMainnet, baseSepolia, storyMainnet, storyTestnet } from '@/lib/chains'

// Determinar el modo de red desde variables de entorno
const NETWORK_MODE = (process.env.NEXT_PUBLIC_NETWORK_MODE || 'testnet') as 'testnet' | 'mainnet'

// Configuración de redes según el modo
export const PAYMENT_CHAIN = NETWORK_MODE === 'testnet' ? baseSepolia : baseMainnet
export const NFT_CHAIN = NETWORK_MODE === 'testnet' ? storyTestnet : storyMainnet

// Exportar el modo para uso en otros lugares
export const IS_TESTNET = NETWORK_MODE === 'testnet'
export const IS_MAINNET = NETWORK_MODE === 'mainnet'

// Chains para wagmi config (testnets primero en desarrollo)
export const WAGMI_CHAINS = IS_TESTNET
  ? [baseSepolia, storyTestnet, baseMainnet, storyMainnet]
  : [baseMainnet, storyMainnet, baseSepolia, storyTestnet]

// Log de configuración (solo en desarrollo)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🌐 Network Mode:', NETWORK_MODE)
  console.log('💰 Payment Chain:', PAYMENT_CHAIN.name, `(ID: ${PAYMENT_CHAIN.id})`)
  console.log('🎨 NFT Chain:', NFT_CHAIN.name, `(ID: ${NFT_CHAIN.id})`)
  console.log('🔧 NFT_CHAIN ID:', NFT_CHAIN.id)
}
