import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPublicClient, http, decodeEventLog } from 'viem'
import { baseSepolia } from 'viem/chains'
import PaymentABI from '../../../../../contracts/abis/KukuxumusuPayment_ABI.json'

// const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nftId, txHash, auctionData } = body

    if (!nftId || !txHash || !auctionData) {
      return NextResponse.json(
        { error: 'nftId, txHash, and auctionData are required' },
        { status: 400 }
      )
    }

    // Get the NFT from database
    const nft = await prisma.nFT.findUnique({
      where: { id: nftId },
    })

    if (!nft) {
      return NextResponse.json(
        { error: 'NFT not found' },
        { status: 404 }
      )
    }

    // Get transaction receipt to find the auction ID
    const receipt = await baseClient.getTransactionReceipt({ hash: txHash as `0x${string}` })
    
    if (!receipt) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Find AuctionCreated event in the transaction logs
    const auctionCreatedLog = receipt.logs.find(log => {
      try {
        // Decode the log to check if it's an AuctionCreated event
        const decoded = decodeEventLog({
          abi: PaymentABI,
          data: log.data,
          topics: log.topics,
        })
        return decoded.eventName === 'AuctionCreated'
      } catch {
        return false
      }
    })

    if (!auctionCreatedLog) {
      return NextResponse.json(
        { error: 'AuctionCreated event not found in transaction' },
        { status: 400 }
      )
    }

    // Decode the AuctionCreated event
    const decodedEvent = decodeEventLog({
      abi: PaymentABI,
      data: auctionCreatedLog.data,
      topics: auctionCreatedLog.topics,
    })

    const { auctionId, nftId: eventNftId, startTime, endTime } = decodedEvent.args as any

    // Verify the NFT ID matches
    if (Number(eventNftId) !== nft.tokenId) {
      return NextResponse.json(
        { error: 'NFT ID mismatch between database and blockchain' },
        { status: 400 }
      )
    }

    // Calculate duration
    const duration = Number(endTime - startTime)

    // Use data from frontend instead of reading from contract
    const {
      selectedTokens,
      minPrices: minPricesArray,
      discounts: discountsArray,
      extensionInSeconds,
      triggerInSeconds,
    } = auctionData

    // Create auction record in database
    const auction = await prisma.auction.create({
      data: {
        auctionId: Number(auctionId),
        nftId: nft.id,
        startTime: new Date(Number(startTime) * 1000),
        endTime: new Date(Number(endTime) * 1000),
        duration: duration,
        extensionTime: Number(extensionInSeconds),
        triggerTime: Number(triggerInSeconds),
        allowedTokens: selectedTokens.map((addr: string) => addr.toLowerCase()),
        minPrices: minPricesArray.map((price: bigint) => price.toString()),
        discounts: discountsArray.map((discount: bigint) => discount.toString()),
        status: 'ACTIVE',
      },
    })

    console.log(`✅ Auction ${auctionId} created in database for NFT ${nft.id}`)

    return NextResponse.json({
      success: true,
      auction,
      message: 'Auction created successfully in database',
    })
  } catch (error: any) {
    console.error('Error creating auction in database:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
