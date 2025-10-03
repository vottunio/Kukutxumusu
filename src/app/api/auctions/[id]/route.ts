import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from '@/lib/chains'
import PaymentABI from '../../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const auctionId = parseInt(id)

    if (isNaN(auctionId) || auctionId < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid auction ID',
        },
        { status: 400 }
      )
    }

    // Get auction data
    const auctionData = await publicClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'auctions',
      args: [BigInt(auctionId)],
    }) as any[]

    // Get auction bids
    const bidsData = await publicClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'getAuctionBids',
      args: [BigInt(auctionId)],
    }) as any[]

    // Parse auction data
    const auction = {
      id: auctionId,
      nftContract: auctionData[0],
      nftId: auctionData[1].toString(),
      startTime: Number(auctionData[2]),
      endTime: Number(auctionData[3]),
      highestBidder: auctionData[4],
      highestBidToken: auctionData[5],
      highestBid: auctionData[6].toString(),
      highestBidValueUSD: auctionData[7].toString(),
      finalized: auctionData[8],
      antiSnipingExtension: Number(auctionData[9]),
      antiSnipingTrigger: Number(auctionData[10]),
    }

    // Parse bids
    const bids = bidsData.map((bid: any) => ({
      bidder: bid.bidder,
      token: bid.token,
      amount: bid.amount.toString(),
      valueInUSD: bid.valueInUSD.toString(),
      timestamp: Number(bid.timestamp),
    }))

    // Calculate if active
    const now = Math.floor(Date.now() / 1000)
    const isActive = !auction.finalized && now >= auction.startTime && now < auction.endTime
    const timeRemaining = isActive ? auction.endTime - now : 0

    // Get allowed tokens and min prices
    const tokens = ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913']

    const allowedTokensPromises = tokens.map(async (token) => {
      try {
        const isAllowed = await publicClient.readContract({
          address: PAYMENT_CONTRACT_ADDRESS,
          abi: PaymentABI,
          functionName: 'isTokenAllowedForAuction',
          args: [BigInt(auctionId), token as `0x${string}`],
        }) as boolean

        if (!isAllowed) return null

        const minPrice = await publicClient.readContract({
          address: PAYMENT_CONTRACT_ADDRESS,
          abi: PaymentABI,
          functionName: 'getAuctionMinPrice',
          args: [BigInt(auctionId), token as `0x${string}`],
        }) as bigint

        return {
          address: token,
          minPrice: minPrice.toString(),
        }
      } catch {
        return null
      }
    })

    const allowedTokens = (await Promise.all(allowedTokensPromises)).filter(Boolean)

    return NextResponse.json({
      success: true,
      data: {
        auction: {
          ...auction,
          isActive,
          timeRemaining,
          allowedTokens,
        },
        bids: bids.sort((a, b) => b.timestamp - a.timestamp), // Most recent first
        totalBids: bids.length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching auction details:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch auction details',
      },
      { status: 500 }
    )
  }
}
