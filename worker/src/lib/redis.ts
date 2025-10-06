import { createClient } from 'redis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const redisClient = createClient({
  url: REDIS_URL,
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('✅ Redis Client Connected')
})

let isConnected = false

async function connect() {
  if (!isConnected) {
    await redisClient.connect()
    isConnected = true
  }
}

connect().catch(console.error)

export const redis = redisClient
