'use client'

import { useReadContract } from 'wagmi'
import { useWallet } from './useWallet'
import { baseMainnet, storyMainnet } from '@/lib/chains'

// Importar ABIs completos
import PaymentABI from '../../contracts/abis/KukuxumusuPayment_ABI.json'
import NFTABI from '../../contracts/abis/KukuxumusuNFT_ABI.json'

// Direcciones de contratos (Testnet)
const PAYMENT_CONTRACT_ADDRESS = '0x8CDaEfE1079125A5BBCD5A75B977aC262C65413B' as const // Base
const NFT_CONTRACT_ADDRESS = '0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7' as const // Story Protocol

export function usePaymentContract() {
  const { isConnected } = useWallet()

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

  // Leer total de NFTs minteados
  const { data: totalMinted } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFTABI,
    functionName: 'totalMinted',
    chainId: storyMainnet.id,
    query: {
      enabled: isConnected,
    },
  })

  // Leer max supply
  const { data: maxSupply } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFTABI,
    functionName: 'maxSupply',
    chainId: storyMainnet.id,
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
