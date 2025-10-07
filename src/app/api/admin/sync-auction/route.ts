import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import PaymentABI from '../../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { auctionId } = body

    if (!auctionId) {
      return NextResponse.json(
        { error: 'auctionId is required' },
        { status: 400 }
      )
    }

    // Check if auction already exists in database
    const existingAuction = await prisma.auction.findFirst({
      where: { auctionId: Number(auctionId) },
    })

    if (existingAuction) {
      return NextResponse.json({
        success: true,
        message: 'Auction already exists in database',
        auction: existingAuction,
      })
    }

    // Get auction data from blockchain
    const auctionData = await baseClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'auctions',
      args: [BigInt(auctionId)],
    })

    if (!auctionData) {
      return NextResponse.json(
        { error: 'Auction not found on blockchain' },
        { status: 404 }
      )
    }

    const [
      _nftContract,
      nftId,
      startTime,
      endTime,
      _highestBidder,
      _highestBidToken,
      _highestBid,
      _highestBidValueUSD,
      finalized,
      antiSnipingExtension,
      antiSnipingTrigger,
    ] = auctionData as any[]

    // Find NFT in database by tokenId
    const nft = await prisma.nFT.findFirst({
      where: { tokenId: Number(nftId) },
    })

    if (!nft) {
      return NextResponse.json(
        { error: `NFT with tokenId ${nftId} not found in database` },
        { status: 404 }
      )
    }

    // Get allowed tokens for this auction (we'll need to read them from the contract)
    // For now, we'll use empty arrays as we don't have the frontend data
    const allowedTokens: string[] = []
    const minPrices: string[] = []
    const discounts: string[] = []

    // Create auction record in database
    const auction = await prisma.auction.create({
      data: {
        auctionId: Number(auctionId),
        nftId: nft.id,
        startTime: new Date(Number(startTime) * 1000),
        endTime: new Date(Number(endTime) * 1000),
        duration: Number(endTime - startTime),
        extensionTime: Number(antiSnipingExtension),
        triggerTime: Number(antiSnipingTrigger),
        allowedTokens: allowedTokens,
        minPrices: minPrices,
        discounts: discounts,
        status: finalized ? 'COMPLETED' : 'ACTIVE',
      },
    })

    console.log(`✅ Auction ${auctionId} synced to database for NFT ${nft.id}`)

    return NextResponse.json({
      success: true,
      auction,
      message: 'Auction synced successfully to database',
    })
  } catch (error: any) {
    console.error('Error syncing auction:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
