import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import PaymentABI from '../../../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const prisma = new PrismaClient()

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org'

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_RPC_URL),
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

    // Intentar obtener bids desde la base de datos (primary source)
    try {
      const bids = await prisma.bid.findMany({
        where: {
          auction: {
            auctionId: auctionId
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        include: {
          auction: {
            select: {
              auctionId: true,
              nft: {
                select: {
                  tokenId: true
                }
              }
            }
          }
        }
      })

      if (bids.length > 0) {
        // Transformar los datos desde DB
        const formattedBids = bids.map(bid => ({
          bidder: bid.bidderAddress,
          token: bid.tokenAddress,
          amount: bid.amount,
          valueInUSD: bid.valueInUSD,
          timestamp: Math.floor(bid.timestamp.getTime() / 1000).toString(),
          transactionHash: bid.txHash,
          blockNumber: bid.blockNumber,
          isWinning: bid.isWinning
        }))

        console.log(`📊 [API] Retrieved ${bids.length} bids for auction ${auctionId} from database`)

        return NextResponse.json({
          success: true,
          bids: formattedBids,
          count: bids.length,
          source: 'database'
        })
      }

      console.log(`⚠️ [API] No bids found in database for auction ${auctionId}, falling back to contract`)
    } catch (dbError) {
      console.error('⚠️ [API] Database error, falling back to contract:', dbError)
    }

    // Fallback: Leer bids directamente del contrato
    console.log(`🔗 [API] Reading bids from contract for auction ${auctionId}`)

    const contractBids = await baseClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'getAuctionBids',
      args: [BigInt(auctionId)]
    }) as any[]

    // Transformar datos del contrato
    const formattedContractBids = contractBids.map((bid: any) => ({
      bidder: bid.bidder,
      token: bid.token,
      amount: bid.amount.toString(),
      valueInUSD: bid.valueInUSD.toString(),
      timestamp: bid.timestamp.toString(),
      // Sin txHash desde contrato (no disponible)
      transactionHash: undefined,
      blockNumber: undefined,
      isWinning: false
    }))

    console.log(`📊 [API] Retrieved ${contractBids.length} bids for auction ${auctionId} from contract (fallback)`)

    return NextResponse.json({
      success: true,
      bids: formattedContractBids,
      count: contractBids.length,
      source: 'contract' // Indica que vino del contrato como fallback
    })

  } catch (error) {
    console.error('❌ [API] Error fetching bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bids from both database and contract' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
