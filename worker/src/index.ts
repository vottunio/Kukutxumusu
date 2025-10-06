/**
 * Kukuxumusu Worker
 * Event listener and mint executor for cross-chain NFT minting
 */

import 'dotenv/config'
import { EventListener } from './services/event-listener'
import { MintExecutor } from './services/mint-executor'
import { prisma } from './lib/prisma'
import { redis } from './lib/redis'

console.log('🚀 Kukuxumusu Worker Starting...')
console.log('Environment:', process.env.NODE_ENV || 'development')

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
    // Initialize services
    console.log('📡 Initializing Event Listener...')
    const eventListener = new EventListener()

    console.log('⚙️  Initializing Mint Executor...')
    const mintExecutor = new MintExecutor()

    // Start event listener
    console.log('👂 Starting to listen for Base events...')
    await eventListener.start()

    // Start mint executor (processes queue)
    console.log('🔨 Starting Mint Executor...')
    await mintExecutor.start()

    console.log('✅ Worker is running!')
    console.log('   - Listening to Base Payment Contract')
    console.log('   - Processing mint queue every 30 seconds')
    console.log('   - Press Ctrl+C to stop')
  } catch (error) {
    console.error('❌ Failed to start worker:', error)
    process.exit(1)
  }
}

// Start the worker
main()
