/**
 * Kukuxumusu Worker
 * Event listener, mint executor, and API server for cross-chain NFT minting
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { EventListener } from './services/event-listener'
import { MintExecutor } from './services/mint-executor'
import { AuctionScheduler } from './services/auction-scheduler'
import { signBidEndpoint } from './api/sign-bid'
import { getTrustedSignerAddress } from './services/signature-service'
import { prisma } from './lib/prisma'
import { redis } from './lib/redis'

console.log('🚀 Kukuxumusu Worker Starting...')
console.log('Environment:', process.env.NODE_ENV || 'development')

// Initialize Express server
const app = express()
const PORT = process.env.WORKER_PORT || 8080

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.get('/health', (_req: any, res: any) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    trustedSigner: getTrustedSignerAddress(),
  })
})

app.post('/sign-bid', signBidEndpoint)

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down gracefully...')
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Shutting down gracefully...')
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
})

async function main() {
  try {
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🌐 Worker API server listening on port ${PORT}`)
      console.log(`   - POST http://localhost:${PORT}/sign-bid`)
      console.log(`   - GET  http://localhost:${PORT}/health`)
      console.log(`   - Trusted Signer: ${getTrustedSignerAddress()}`)
    })

    // Initialize services
    console.log('📡 Initializing Event Listener...')
    const eventListener = new EventListener()

    console.log('⚙️  Initializing Mint Executor...')
    const mintExecutor = new MintExecutor()

    console.log('📅 Initializing Auction Scheduler...')
    const auctionScheduler = new AuctionScheduler()

    // Start event listener
    console.log('👂 Starting to listen for Base events...')
    await eventListener.start()

    // Start mint executor (processes queue)
    console.log('🔨 Starting Mint Executor...')
    await mintExecutor.start()

    // Start auction scheduler
    console.log('⏰ Starting Auction Scheduler...')
    await auctionScheduler.start()

    console.log('✅ Worker is fully operational!')
    console.log('   - HTTP API server running')
    console.log('   - Listening to Base Payment Contract')
    console.log('   - Processing mint queue every 30 seconds')
    console.log('   - Updating expired auctions every 5 minutes')
    console.log('   - Press Ctrl+C to stop')
  } catch (error) {
    console.error('❌ Failed to start worker:', error)
    process.exit(1)
  }
}

// Start the worker
main()
