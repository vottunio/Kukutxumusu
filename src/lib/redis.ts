/**
 * Redis client for caching
 */

import { createClient } from 'redis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Create Redis client
const redisClient = createClient({
  url: REDIS_URL,
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('Redis Client Connected')
})

// Connection state management
let isConnected = false
let connectionPromise: Promise<void> | null = null

async function connect() {
  // If already connected, do nothing
  if (isConnected) {
    return
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise
  }

  // Start new connection
  connectionPromise = redisClient.connect()
    .then(() => {
      isConnected = true
      connectionPromise = null
    })
    .catch((err) => {
      console.error('Redis connection failed:', err)
      connectionPromise = null
      throw err
    })

  return connectionPromise
}

// Export simplified interface
export const redis = {
  async get(key: string): Promise<string | null> {
    await connect()
    return redisClient.get(key)
  },

  async set(key: string, value: string): Promise<void> {
    await connect()
    await redisClient.set(key, value)
  },

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await connect()
    await redisClient.setEx(key, seconds, value)
  },

  async del(key: string): Promise<void> {
    await connect()
    await redisClient.del(key)
  },

  async exists(key: string): Promise<boolean> {
    await connect()
    const result = await redisClient.exists(key)
    return result === 1
  },

  async quit(): Promise<void> {
    if (isConnected) {
      await redisClient.quit()
      isConnected = false
    }
  },
}

export default redisClient
