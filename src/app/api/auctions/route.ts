import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from '@/lib/chains'
import PaymentABI from '../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'ended', 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get total auction count
    const auctionCounter = await publicClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'auctionCounter',
    }) as bigint

    const totalAuctions = Number(auctionCounter)

    if (totalAuctions === 0) {
      return NextResponse.json({
        success: true,
        data: {
          auctions: [],
          total: 0,
          limit,
          offset,
        },
      })
    }

    // Get all auction IDs
    const auctionIds = Array.from({ length: totalAuctions }, (_, i) => i)

    // Apply pagination
    const paginatedIds = auctionIds.slice(offset, offset + limit)

    // Fetch auction data for each ID
    const auctionPromises = paginatedIds.map(async (id) => {
      try {
        const auctionData = await publicClient.readContract({
          address: PAYMENT_CONTRACT_ADDRESS,
          abi: PaymentABI,
          functionName: 'auctions',
          args: [BigInt(id)],
        }) as any[]

        const auction = {
          id,
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

        // Calculate if active
        const now = Math.floor(Date.now() / 1000)
        const isActive = !auction.finalized && now >= auction.startTime && now < auction.endTime

        return {
          ...auction,
          isActive,
          timeRemaining: isActive ? auction.endTime - now : 0,
        }
      } catch (error) {
        console.error(`Error fetching auction ${id}:`, error)
        return null
      }
    })

    const auctions = (await Promise.all(auctionPromises)).filter(Boolean)

    // Filter by status if requested
    let filteredAuctions = auctions
    if (status === 'active') {
      filteredAuctions = auctions.filter(a => a?.isActive)
    } else if (status === 'ended') {
      filteredAuctions = auctions.filter(a => !a?.isActive)
    }

    return NextResponse.json({
      success: true,
      data: {
        auctions: filteredAuctions,
        total: totalAuctions,
        filtered: filteredAuctions.length,
        limit,
        offset,
      },
    })
  } catch (error: any) {
    console.error('Error fetching auctions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch auctions',
      },
      { status: 500 }
    )
  }
}
