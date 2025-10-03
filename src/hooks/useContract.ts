'use client'

import { useReadContract } from 'wagmi'
import { useWallet } from './useWallet'
import { baseSepolia, storyTestnet } from '@/lib/chains'

// Importar ABIs completos
import PaymentABI from '../../contracts/abis/KukuxumusuPayment_ABI.json'
import NFTABI from '../../contracts/abis/KukuxumusuNFT_ABI.json'

// Direcciones de contratos desde variables de entorno
const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}` // Base Sepolia
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}` // Story Protocol

export function usePaymentContract() {
  const { isConnected } = useWallet()

  // Leer dirección del treasury
  const { data: treasuryAddress } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'treasury',
    chainId: baseSepolia.id,
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
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && !!treasuryAddress,
    },
  })

  // Leer contador de subastas
  const { data: auctionCounter } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'auctionCounter',
    chainId: baseSepolia.id,
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

  // Leer total de NFTs minteados
  const { data: totalMinted } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFTABI,
    functionName: 'totalMinted',
    chainId: storyTestnet.id,
    query: {
      enabled: isConnected,
    },
  })

  // Leer max supply
  const { data: maxSupply } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFTABI,
    functionName: 'maxSupply',
    chainId: storyTestnet.id,
    query: {
      enabled: isConnected,
    },
  })

  return {
    totalMinted,
    maxSupply,
    contractAddress: NFT_CONTRACT_ADDRESS,
  }
}
