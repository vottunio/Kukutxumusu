import { NextResponse } from 'next/server'
import { createPublicClient, http, parseAbi } from 'viem'
import { baseSepolia, storyTestnet } from '@/lib/chains'
import PaymentABI from '../../../../contracts/abis/KukuxumusuPayment_ABI.json'
import NFTFactoryABI from '../../../../contracts/abis/KukuxumusuNFT_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

const storyClient = createPublicClient({
  chain: storyTestnet,
  transport: http(),
})

export async function GET() {
  try {
    // Get auction statistics from Base
    const auctionCounter = await baseClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'auctionCounter',
    }) as bigint

    const totalAuctions = Number(auctionCounter)

    // Count active auctions
    let activeAuctions = 0
    let completedAuctions = 0
    let totalBidsCount = 0
    const now = Math.floor(Date.now() / 1000)

    const auctionPromises = Array.from({ length: totalAuctions }, async (_, id) => {
      try {
        const auctionData = await baseClient.readContract({
          address: PAYMENT_CONTRACT_ADDRESS,
          abi: PaymentABI,
          functionName: 'auctions',
          args: [BigInt(id)],
        }) as any[]

        const endTime = Number(auctionData[3])
        const finalized = auctionData[8]

        const isActive = !finalized && now < endTime

        if (isActive) activeAuctions++
        if (finalized) completedAuctions++

        // Get bids count
        const bids = await baseClient.readContract({
          address: PAYMENT_CONTRACT_ADDRESS,
          abi: PaymentABI,
          functionName: 'getAuctionBids',
          args: [BigInt(id)],
        }) as any[]

        return bids.length
      } catch {
        return 0
      }
    })

    const bidCounts = await Promise.all(auctionPromises)
    totalBidsCount = bidCounts.reduce((sum, count) => sum + count, 0)

    // Get NFT statistics from Story Protocol
    const collectionId = BigInt(0)
    const totalSupply = await storyClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFTFactoryABI,
      functionName: 'getCollectionSupply',
      args: [collectionId],
    }) as bigint

    const totalNFTsMinted = Number(totalSupply)

    // Get recent events for activity
    // Get BidPlaced events from last 7 days
    // const sevenDaysAgo = BigInt(Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60)

    let recentBids = 0
    try {
      const logs = await baseClient.getLogs({
        address: PAYMENT_CONTRACT_ADDRESS,
        event: parseAbi(['event BidPlaced(uint256 indexed auctionId, address indexed bidder, address token, uint256 amount, uint256 timestamp)'])[0],
        fromBlock: 'earliest',
        toBlock: 'latest',
      })
      recentBids = logs.length
    } catch (error) {
      console.error('Error fetching recent bids:', error)
    }

    // Calculate average bids per auction
    const avgBidsPerAuction = totalAuctions > 0 ? (totalBidsCount / totalAuctions).toFixed(2) : '0'

    return NextResponse.json({
      success: true,
      data: {
        auctions: {
          total: totalAuctions,
          active: activeAuctions,
          completed: completedAuctions,
        },
        bids: {
          total: totalBidsCount,
          recent7Days: recentBids,
          averagePerAuction: parseFloat(avgBidsPerAuction),
        },
        nfts: {
          totalMinted: totalNFTsMinted,
        },
        activity: {
          recentBidsCount: recentBids,
          lastUpdated: new Date().toISOString(),
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch statistics',
      },
      { status: 500 }
    )
  }
}
