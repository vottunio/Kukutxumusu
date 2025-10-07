/**
 * Event Listener
 * Listens to Base blockchain for auction/payment events
 */

import { createPublicClient, http, parseAbiItem, type Log } from 'viem'
import { baseSepolia } from 'viem/chains'
import { prisma } from '../lib/prisma'
// import { AuctionStatus, MintStatus, NFTStatus } from '@prisma/client'

// Get config from env
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.BASE_RPC_URL
const PAYMENT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS || process.env.PAYMENT_CONTRACT_ADDRESS) as `0x${string}`

if (!BASE_RPC_URL) {
  throw new Error('BASE_RPC_URL not set')
}

if (!PAYMENT_CONTRACT_ADDRESS) {
  throw new Error('PAYMENT_CONTRACT_ADDRESS not set')
}

// Create Base client
const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_RPC_URL),
})

// Event signatures
const AUCTION_WON_EVENT = parseAbiItem(
  'event AuctionWon(uint256 indexed auctionId, address indexed winner, address indexed nftContract, uint256 nftId, address token, uint256 finalAmount, uint256 valueInUSD)'
)

const BID_PLACED_EVENT = parseAbiItem(
  'event BidPlaced(uint256 indexed auctionId, address indexed bidder, address token, uint256 amount, uint256 valueInUSD, uint256 timestamp)'
)

export class EventListener {
  private isRunning = false
  private pollInterval = 30000 // 30 seconds
  private lastProcessedBlock = 0n

  async start() {
    this.isRunning = true

    // Get last processed block from database or start from current
    const lastEvent = await prisma.eventLog.findFirst({
      orderBy: { blockNumber: 'desc' },
    })

    this.lastProcessedBlock = lastEvent ? BigInt(lastEvent.blockNumber) : await baseClient.getBlockNumber()

    console.log(`📍 Starting from block: ${this.lastProcessedBlock}`)

    // Start polling loop
    this.poll()
  }

  private async poll() {
    while (this.isRunning) {
      try {
        await this.processNewEvents()
      } catch (error) {
        console.error('❌ Error processing events:', error)
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, this.pollInterval))
    }
  }

  private async processNewEvents() {
    const currentBlock = await baseClient.getBlockNumber()

    if (currentBlock <= this.lastProcessedBlock) {
      // No new blocks
      return
    }

    console.log(`🔍 Checking blocks ${this.lastProcessedBlock + 1n} to ${currentBlock}`)

    // Get BidPlaced events
    console.log(`🎯 Searching for BidPlaced events at contract: ${PAYMENT_CONTRACT_ADDRESS}`)
    const bidLogs = await baseClient.getLogs({
      address: PAYMENT_CONTRACT_ADDRESS,
      event: BID_PLACED_EVENT,
      fromBlock: this.lastProcessedBlock + 1n,
      toBlock: currentBlock,
    })
    
    console.log(`🔍 Found ${bidLogs.length} BidPlaced events`)
    if (bidLogs.length > 0) {
      console.log(`🎯 BidPlaced events:`, bidLogs.map(log => ({
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        args: log.args
      })))
    }

    if (bidLogs.length > 0) {
      console.log(`📥 Found ${bidLogs.length} BidPlaced event(s)`)

      for (const log of bidLogs) {
        await this.handleBidPlacedEvent(log)
      }
    }

    // Get AuctionWon events
    const auctionLogs = await baseClient.getLogs({
      address: PAYMENT_CONTRACT_ADDRESS,
      event: AUCTION_WON_EVENT,
      fromBlock: this.lastProcessedBlock + 1n,
      toBlock: currentBlock,
    })

    if (auctionLogs.length > 0) {
      console.log(`📥 Found ${auctionLogs.length} AuctionWon event(s)`)

      for (const log of auctionLogs) {
        await this.handleAuctionWonEvent(log)
      }
    }

    // Update last processed block
    this.lastProcessedBlock = currentBlock
  }

  private async handleBidPlacedEvent(log: any) {
    try {
      const { auctionId, bidder, token, amount, valueInUSD, timestamp } = log.args

      console.log(`🎯 Processing BidPlaced event: auctionId=${auctionId}, bidder=${bidder}, amount=${amount}, valueInUSD=${valueInUSD}`)

      // Check if event already processed
      const existingEvent = await prisma.eventLog.findFirst({
        where: {
          txHash: log.transactionHash,
          logIndex: log.logIndex,
        },
      })

      if (existingEvent) {
        console.log(`⏭️  Event already processed: ${log.transactionHash}`)
        return
      }

      // Find the auction in database
      const auction = await prisma.auction.findFirst({
        where: {
          auctionId: Number(auctionId),
        },
        include: {
          nft: true,
        },
      })

      if (!auction) {
        console.error(`❌ Auction ${auctionId} not found in database`)
        return
      }

      // Create bid record
      await prisma.bid.create({
        data: {
          auctionId: auction.id,
          nftId: auction.nftId,
          bidderAddress: bidder.toLowerCase(),
          tokenAddress: token.toLowerCase(),
          amount: amount.toString(),
          valueInUSD: valueInUSD.toString(),
          txHash: log.transactionHash!,
          blockNumber: Number(log.blockNumber!),
          timestamp: new Date(Number(timestamp) * 1000),
          isWinning: false, // Will be updated when auction ends
        },
      })

      // Store event in database
      await prisma.eventLog.create({
        data: {
          eventType: 'BidPlaced',
          contractAddress: PAYMENT_CONTRACT_ADDRESS.toLowerCase(),
          txHash: log.transactionHash!,
          blockNumber: Number(log.blockNumber!),
          logIndex: log.logIndex!,
          eventData: {
            auctionId: auctionId.toString(),
            bidder,
            token,
            amount: amount.toString(),
            timestamp: timestamp.toString(),
          },
          processed: true,
          processedAt: new Date(),
        },
      })

      console.log(`✅ BidPlaced event processed and stored: ${log.transactionHash}`)

    } catch (error) {
      console.error('❌ Error processing BidPlaced event:', error)
    }
  }

  private async handleAuctionWonEvent(log: any) {
    try {
      const { auctionId, winner, nftContract, nftId, token, finalAmount, valueInUSD } = log.args as {
        auctionId: bigint
        winner: string
        nftContract: string
        nftId: bigint
        token: string
        finalAmount: bigint
        valueInUSD: bigint
      }

      console.log(`🎉 Auction ${auctionId} won by ${winner} - NFT #${nftId} for ${finalAmount} (${valueInUSD} USD)`)

      // Check if event already processed (idempotency)
      const existingEvent = await prisma.eventLog.findUnique({
        where: {
          txHash_logIndex: {
            txHash: log.transactionHash!,
            logIndex: log.logIndex!,
          },
        },
      })

      if (existingEvent) {
        console.log(`⏭️  Event already processed: ${log.transactionHash}`)
        return
      }

      // Store event in database
      await prisma.eventLog.create({
        data: {
          eventType: 'AuctionWon',
          contractAddress: PAYMENT_CONTRACT_ADDRESS.toLowerCase(),
          txHash: log.transactionHash!,
          blockNumber: Number(log.blockNumber!),
          logIndex: log.logIndex!,
          eventData: {
            auctionId: auctionId.toString(),
            winner,
            nftContract,
            nftId: nftId.toString(),
            token,
            finalAmount: finalAmount.toString(),
            valueInUSD: valueInUSD.toString(),
          },
          processed: false,
        },
      })

      // Find NFT in database by tokenId (from event)
      const nft = await prisma.nFT.findFirst({
        where: { tokenId: Number(nftId) },
      })

      console.log(`📋 Auction ${auctionId} - Looking for NFT with tokenId=${nftId}`)

      if (!nft) {
        console.error(`❌ NFT with tokenId ${nftId} not found in database`)
        return
      }

      // Try to update auction in database if it exists
      const existingAuction = await prisma.auction.findFirst({
        where: { auctionId: Number(auctionId) },
      })

      if (existingAuction) {
        // Update existing auction with winner info
        await prisma.auction.update({
          where: { id: existingAuction.id },
          data: {
            status: 'ENDED',
            winnerAddress: winner.toLowerCase(),
            winningToken: token.toLowerCase(),
            winningAmount: finalAmount.toString(),
            winningValueUSD: valueInUSD.toString(),
          },
        })
        console.log(`✅ Updated auction ${auctionId} in database`)
      } else {
        console.log(`⚠️ Auction ${auctionId} not found in database, but continuing with mint`)
      }

      // Create mint transaction in queue
      await prisma.mintTransaction.create({
        data: {
          nftId: nft.id, // Use NFT ID from database
          recipientAddress: winner.toLowerCase(),
          status: 'PENDING',
        },
      })

      console.log(`🎯 Mint transaction queued for NFT #${nft.tokenId} to ${winner}`)

      // Update NFT status
      await prisma.nFT.update({
        where: { id: nft.id },
        data: { status: 'AUCTION_ENDED' },
      })

      // Mark event as processed
      await prisma.eventLog.update({
        where: {
          txHash_logIndex: {
            txHash: log.transactionHash!,
            logIndex: log.logIndex!,
          },
        },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      })

      console.log(`✅ Auction ${auctionId} processed - mint queued for NFT #${nft.tokenId}`)
    } catch (error) {
      console.error('❌ Error handling AuctionWon event:', error)
    }
  }

  stop() {
    this.isRunning = false
  }
}
