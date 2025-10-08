/**
 * Auction Scheduler
 * Updates expired auctions and finalizes them on-chain
 */

import { prisma } from '../lib/prisma'
import { createWalletClient, http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import { PAYMENT_CONTRACT_ABI } from '../config/abis'

const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.BASE_RPC_URL
const PAYMENT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS || process.env.PAYMENT_CONTRACT_ADDRESS) as `0x${string}`
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as `0x${string}`

if (!BASE_RPC_URL) {
  throw new Error('BASE_RPC_URL not set')
}

if (!PAYMENT_CONTRACT_ADDRESS) {
  throw new Error('PAYMENT_CONTRACT_ADDRESS not set')
}

if (!RELAYER_PRIVATE_KEY) {
  throw new Error('RELAYER_PRIVATE_KEY not set for auction finalization')
}

const account = privateKeyToAccount(RELAYER_PRIVATE_KEY)

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_RPC_URL),
})

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(BASE_RPC_URL),
})

export class AuctionScheduler {
  private isRunning = false
  private pollInterval = 5 * 60 * 1000 // 5 minutes

  async start() {
    this.isRunning = true
    console.log('📅 Auction Scheduler started - checking every 5 minutes')

    // Run immediately on start
    await this.updateExpiredAuctions()

    // Then run on interval
    this.scheduleUpdates()
  }

  private async scheduleUpdates() {
    while (this.isRunning) {
      await new Promise(resolve => setTimeout(resolve, this.pollInterval))

      try {
        await this.updateExpiredAuctions()
      } catch (error) {
        console.error('❌ Error updating expired auctions:', error)
      }
    }
  }

  private async updateExpiredAuctions() {
    const now = new Date()

    // Find auctions that have ended but still marked as ACTIVE
    const expiredAuctions = await prisma.auction.findMany({
      where: {
        endTime: { lt: now },
        status: { in: ['ACTIVE', 'PENDING'] }
      },
      select: {
        id: true,
        auctionId: true,
        endTime: true,
        status: true
      }
    })

    if (expiredAuctions.length === 0) {
      return
    }

    console.log(`⏰ Found ${expiredAuctions.length} expired auction(s) to update`)

    for (const auction of expiredAuctions) {
      try {
        // First, finalize the auction on-chain
        console.log(`🔨 Finalizing auction ${auction.auctionId} on-chain...`)

        const hash = await walletClient.writeContract({
          address: PAYMENT_CONTRACT_ADDRESS,
          abi: PAYMENT_CONTRACT_ABI,
          functionName: 'finalizeAuction',
          args: [BigInt(auction.auctionId)],
        })

        console.log(`📝 Finalize transaction sent: ${hash}`)

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status === 'success') {
          console.log(`✅ Auction ${auction.auctionId} finalized on-chain successfully`)

          // Update database status
          await prisma.auction.update({
            where: { id: auction.id },
            data: { status: 'ENDED' }
          })

          console.log(`✅ Updated auction ${auction.auctionId} to ENDED in database`)
        } else {
          console.error(`❌ Finalize transaction failed for auction ${auction.auctionId}`)
        }
      } catch (error: any) {
        console.error(`❌ Failed to finalize auction ${auction.auctionId}:`, error.message || error)
      }
    }

    console.log(`✅ Processed ${expiredAuctions.length} expired auction(s)`)
  }

  stop() {
    this.isRunning = false
    console.log('🛑 Auction Scheduler stopped')
  }
}
