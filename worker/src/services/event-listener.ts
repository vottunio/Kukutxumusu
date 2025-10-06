/**
 * Event Listener
 * Listens to Base blockchain for auction/payment events
 */

import { createPublicClient, http, parseAbiItem, type Log } from 'viem'
import { baseSepolia } from 'viem/chains'
import { prisma } from '../lib/prisma'
import { AuctionStatus, MintStatus, NFTStatus } from '@prisma/client'

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

// Event signature for AuctionWon (example - adjust based on your contract)
const AUCTION_WON_EVENT = parseAbiItem(
  'event AuctionWon(uint256 indexed auctionId, address indexed winner, address token, uint256 amount, uint256 valueInUSD)'
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

    // Get AuctionWon events
    const logs = await baseClient.getLogs({
      address: PAYMENT_CONTRACT_ADDRESS,
      event: AUCTION_WON_EVENT,
      fromBlock: this.lastProcessedBlock + 1n,
      toBlock: currentBlock,
    })

    if (logs.length > 0) {
      console.log(`📥 Found ${logs.length} AuctionWon event(s)`)

      for (const log of logs) {
        await this.handleAuctionWonEvent(log)
      }
    }

    // Update last processed block
    this.lastProcessedBlock = currentBlock
  }

  private async handleAuctionWonEvent(log: any) {
    try {
      const { auctionId, winner, token, amount, valueInUSD } = log.args as {
        auctionId: bigint
        winner: string
        token: string
        amount: bigint
        valueInUSD: bigint
      }

      console.log(`🎉 Auction ${auctionId} won by ${winner}`)

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
            token,
            amount: amount.toString(),
            valueInUSD: valueInUSD.toString(),
          },
          processed: false,
        },
      })

      // Update auction status
      const auction = await prisma.auction.findUnique({
        where: { auctionId: Number(auctionId) },
        include: { nft: true },
      })

      if (!auction) {
        console.error(`❌ Auction ${auctionId} not found in database`)
        return
      }

      // Update auction with winner info
      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          status: AuctionStatus.ENDED,
          winnerAddress: winner.toLowerCase(),
          winningToken: token.toLowerCase(),
          winningAmount: amount.toString(),
          winningValueUSD: valueInUSD.toString(),
        },
      })

      // Create mint transaction in queue
      await prisma.mintTransaction.create({
        data: {
          nftId: auction.nftId,
          recipientAddress: winner.toLowerCase(),
          status: MintStatus.PENDING,
        },
      })

      // Update NFT status
      await prisma.nFT.update({
        where: { id: auction.nftId },
        data: { status: NFTStatus.AUCTION_ENDED },
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

      console.log(`✅ Auction ${auctionId} processed - mint queued for NFT #${auction.nft.tokenId}`)
    } catch (error) {
      console.error('❌ Error handling AuctionWon event:', error)
    }
  }

  stop() {
    this.isRunning = false
  }
}
