'use client'

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { baseMainnet, baseSepolia, storyMainnet, storyTestnet } from '@/lib/chains'

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // Detectar red actual
  const getCurrentChain = () => {
    switch (chainId) {
      case baseMainnet.id:
        return { ...baseMainnet, type: 'payment' as const }
      case baseSepolia.id:
        return { ...baseSepolia, type: 'payment' as const }
      case storyMainnet.id:
        return { ...storyMainnet, type: 'nft' as const }
      case storyTestnet.id:
        return { ...storyTestnet, type: 'nft' as const }
      default:
        return null
    }
  }

  const currentChain = getCurrentChain()

  // Cambiar a red de pagos (Base)
  const switchToPaymentChain = async () => {
    try {
      await switchChain({ chainId: baseMainnet.id })
    } catch (error) {
      console.error('Error switching to payment chain:', error)
    }
  }

  // Cambiar a red de NFTs (Story)
  const switchToNftChain = async () => {
    try {
      await switchChain({ chainId: storyMainnet.id })
    } catch (error) {
      console.error('Error switching to NFT chain:', error)
    }
  }

  return {
    // Estado
    address,
    isConnected,
    chainId,
    currentChain,
    
    // Acciones
    connect,
    disconnect,
    switchChain,
    switchToPaymentChain,
    switchToNftChain,
    
    // Conectores disponibles
    connectors,
  }
}

