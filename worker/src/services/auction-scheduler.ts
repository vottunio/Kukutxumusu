/**
 * Auction Scheduler
 * Updates expired auctions that have no bids
 */

import { prisma } from '../lib/prisma'

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
        await prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'ENDED' }
        })

        console.log(`✅ Updated auction ${auction.auctionId} to ENDED (was ${auction.status})`)
      } catch (error) {
        console.error(`❌ Failed to update auction ${auction.auctionId}:`, error)
      }
    }

    console.log(`✅ Updated ${expiredAuctions.length} expired auction(s) to ENDED`)
  }

  stop() {
    this.isRunning = false
    console.log('🛑 Auction Scheduler stopped')
  }
}
