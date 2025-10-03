'use client'

import { useReadContract } from 'wagmi'
import { useWallet } from './useWallet'
import { baseSepolia } from '@/lib/chains'
import PaymentABI from '../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

export interface Auction {
  nftContract: string
  nftId: bigint
  startTime: bigint
  endTime: bigint
  highestBidder: string
  highestBidToken: string
  highestBid: bigint
  highestBidValueUSD: bigint
  finalized: boolean
  antiSnipingExtension: bigint
  antiSnipingTrigger: bigint
}

export interface Bid {
  bidder: string
  token: string
  amount: bigint
  valueInUSD: bigint
  timestamp: bigint
}

/**
 * Hook para leer datos de una subasta específica
 */
export function useAuction(auctionId: number | bigint) {
  const { isConnected } = useWallet()

  // Leer datos principales de la subasta
  const { data: auctionData, isLoading: isLoadingAuction, refetch: refetchAuction } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'auctions',
    args: [BigInt(auctionId)],
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && auctionId !== undefined,
      refetchInterval: 5000, // Actualizar cada 5 segundos
    },
  })

  // Leer lista de bids
  const { data: bidsData, isLoading: isLoadingBids, refetch: refetchBids } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'getAuctionBids',
    args: [BigInt(auctionId)],
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && auctionId !== undefined,
      refetchInterval: 5000, // Actualizar cada 5 segundos
    },
  })

  // Parsear datos de la subasta
  const auction: Auction | null = auctionData ? {
    nftContract: (auctionData as any)[0],
    nftId: (auctionData as any)[1],
    startTime: (auctionData as any)[2],
    endTime: (auctionData as any)[3],
    highestBidder: (auctionData as any)[4],
    highestBidToken: (auctionData as any)[5],
    highestBid: (auctionData as any)[6],
    highestBidValueUSD: (auctionData as any)[7],
    finalized: (auctionData as any)[8],
    antiSnipingExtension: (auctionData as any)[9],
    antiSnipingTrigger: (auctionData as any)[10],
  } : null

  // Parsear lista de bids
  const bids: Bid[] = bidsData ? (bidsData as any[]).map((bid: any) => ({
    bidder: bid.bidder,
    token: bid.token,
    amount: bid.amount,
    valueInUSD: bid.valueInUSD,
    timestamp: bid.timestamp,
  })) : []

  // Calcular si la subasta está activa
  const isActive = auction && !auction.finalized &&
    BigInt(Math.floor(Date.now() / 1000)) < auction.endTime &&
    BigInt(Math.floor(Date.now() / 1000)) >= auction.startTime

  // Calcular tiempo restante
  const timeRemaining = auction && isActive
    ? Number(auction.endTime) - Math.floor(Date.now() / 1000)
    : 0

  return {
    auction,
    bids,
    isActive,
    timeRemaining,
    isLoading: isLoadingAuction || isLoadingBids,
    refetch: () => {
      refetchAuction()
      refetchBids()
    },
  }
}

/**
 * Hook para obtener el ID de la subasta activa actual
 */
export function useActiveAuction() {
  const { isConnected } = useWallet()

  // Leer contador total de subastas
  const { data: auctionCounter } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'auctionCounter',
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected,
    },
  })

  // El ID de la subasta activa es el último creado (auctionCounter - 1)
  // Si no hay subastas, auctionCounter será 0
  const activeAuctionId = auctionCounter && Number(auctionCounter) > 0
    ? Number(auctionCounter) - 1
    : null

  return {
    activeAuctionId,
    totalAuctions: auctionCounter ? Number(auctionCounter) : 0,
  }
}

/**
 * Hook para verificar si un token está permitido en una subasta
 */
export function useIsTokenAllowedForAuction(auctionId: number | bigint | undefined, tokenAddress: string) {
  const { isConnected } = useWallet()

  const { data: isAllowed } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'isTokenAllowedForAuction',
    args: [BigInt(auctionId || 0), tokenAddress as `0x${string}`],
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && auctionId !== undefined && !!tokenAddress,
    },
  })

  return isAllowed as boolean | undefined
}

/**
 * Hook para obtener el precio mínimo de una subasta por token
 */
export function useAuctionMinPrice(auctionId: number | bigint | undefined, tokenAddress: string) {
  const { isConnected } = useWallet()

  const { data: minPrice } = useReadContract({
    address: PAYMENT_CONTRACT_ADDRESS,
    abi: PaymentABI,
    functionName: 'getAuctionMinPrice',
    args: [BigInt(auctionId || 0), tokenAddress as `0x${string}`],
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && auctionId !== undefined && !!tokenAddress,
    },
  })

  return minPrice as bigint | undefined
}
