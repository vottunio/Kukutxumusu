import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import PaymentABI from '../../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org'),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auctionId = parseInt(id)

    if (isNaN(auctionId)) {
      return NextResponse.json(
        { error: 'Invalid auction ID' },
        { status: 400 }
      )
    }

    // Leer datos de la subasta desde el contrato
    const auctionData = await baseClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'auctions',
      args: [BigInt(auctionId)],
    })

    if (!auctionData) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }

    const [nftContract, nftId, startTime, endTime, highestBidder, highestBidToken, highestBid, highestBidValueUSD, finalized] = auctionData as any[]

    const auction = {
      auctionId,
      nftContract,
      nftId: Number(nftId),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      highestBidder,
      highestBidToken,
      highestBid: highestBid.toString(),
      highestBidValueUSD: highestBidValueUSD.toString(),
      finalized,
    }

    return NextResponse.json({ success: true, auction })
  } catch (error: any) {
    console.error('Error fetching auction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auction', details: error.message },
      { status: 500 }
    )
  }
}