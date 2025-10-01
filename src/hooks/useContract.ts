'use client'

import { useReadContract } from 'wagmi'
import { useWallet } from './useWallet'
import { baseMainnet, storyMainnet } from '@/lib/chains'

// Importar ABIs completos
import PaymentABI from '../../KukuxumusuPayment_ABI.json'
import NFTFactoryABI from '../../KukuxumusuNFTFactory_ABI.json'

// Direcciones de contratos
const PAYMENT_CONTRACT_ADDRESS = '0x75bf7b1DD6b3a666F18c7784B78871C429E92C71' as const // Base
const NFT_FACTORY_ADDRESS = '0x75bf7b1DD6b3a666F18c7784B78871C429E92C71' as const // Story Protocol

export function usePaymentContract() {
  const { address, isConnected } = useWallet()

  // Leer dirección del treasury
  const { data: treasuryAddress } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'treasury',
    chainId: baseMainnet.id,
    query: {
      enabled: isConnected,
    },
  })

  // Leer balance del treasury (desde el contrato nativo ETH)
  const { data: treasuryBalance, refetch: refetchBalance } = useReadContract({
    address: treasuryAddress as `0x${string}` | undefined,
    abi: [{
      type: 'function',
      name: 'getBalance',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint256' }]
    }],
    functionName: 'getBalance',
    chainId: baseMainnet.id,
    query: {
      enabled: isConnected && !!treasuryAddress,
    },
  })

  // Leer contador de subastas
  const { data: auctionCounter } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'auctionCounter',
    chainId: baseMainnet.id,
    query: {
      enabled: isConnected,
    },
  })

  return {
    treasuryAddress,
    treasuryBalance,
    refetchBalance,
    auctionCounter,
    contractAddress: PAYMENT_CONTRACT_ADDRESS,
  }
}

export function useNftContract() {
  const { isConnected } = useWallet()

  // Leer total de colecciones del factory
  const { data: totalCollections } = useReadContract({
    address: NFT_FACTORY_ADDRESS,
    abi: NFTFactoryABI,
    functionName: 'getTotalCollections',
    chainId: storyMainnet.id,
    query: {
      enabled: isConnected,
    },
  })

  return {
    totalCollections,
    contractAddress: NFT_FACTORY_ADDRESS,
  }
}
