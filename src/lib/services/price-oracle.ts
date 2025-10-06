/**
 * Price Oracle Service
 * Fetches token prices from CoinGecko and other sources
 */

import { redis } from '@/lib/redis'

// Supported tokens configuration
const SUPPORTED_TOKENS: Record<string, { symbol: string; coingeckoId: string; address: string }> = {
  // ETH (native on Base)
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': {
    symbol: 'ETH',
    coingeckoId: 'ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  },
  // USDT on Base
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
    symbol: 'USDT',
    coingeckoId: 'tether',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  // VTN token on Base Sepolia
  '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E': {
    symbol: 'VTN',
    coingeckoId: 'valtoken', // Ajustar si es diferente en CoinGecko
    address: '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E',
  },
}

interface PriceData {
  priceUSD: number
  symbol: string
  address: string
  timestamp: number
  source: string
  cachedAt?: number
}

const CACHE_TTL = 300 // 5 minutos en segundos

/**
 * Get token configuration by address
 */
export function getTokenConfig(address: string) {
  const normalized = address.toLowerCase()

  // Buscar por dirección
  for (const [tokenAddress, config] of Object.entries(SUPPORTED_TOKENS)) {
    if (tokenAddress.toLowerCase() === normalized) {
      return config
    }
  }

  // Buscar por símbolo
  for (const config of Object.values(SUPPORTED_TOKENS)) {
    if (config.symbol.toLowerCase() === normalized) {
      return config
    }
  }

  return null
}

/**
 * Fallback prices for tokens not in CoinGecko
 */
const FALLBACK_PRICES: Record<string, number> = {
  'valtoken': 0.004113, // Precio actual de VTN (~$0.004) si falla QuickNode
}

/**
 * QuickNode API configuration
 */
const QUICKNODE_VTN_API = 'https://quick-old-patina.base-mainnet.quiknode.pro/1d225d2d7f2fa80e9ea072e82f151f5dcf221d52/addon/1051/v1/prices/0xA9bc478A44a8c8FE6fd505C1964dEB3cEE3b7abC?target=aero'

/**
 * Fetch VTN price from QuickNode
 */
async function fetchVTNFromQuickNode(): Promise<number> {
  try {
    const response = await fetch(QUICKNODE_VTN_API, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`QuickNode API error: ${response.status}`)
    }

    const data = await response.json()

    // QuickNode response format: { token: {...}, price: 0.004112536855033088, price_display: 0.004113 }
    const price = data.price

    if (!price || typeof price !== 'number' || isNaN(price)) {
      console.error('QuickNode unexpected response format:', data)
      throw new Error('Invalid price format from QuickNode')
    }

    console.log(`✅ VTN price from QuickNode: ${price.toFixed(6)}`)
    return price
  } catch (error) {
    console.error('QuickNode API error for VTN:', error)
    throw error
  }
}

/**
 * Fetch price from CoinGecko
 */
async function fetchFromCoinGecko(coingeckoId: string): Promise<number> {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data[coingeckoId] || !data[coingeckoId].usd) {
      throw new Error(`Price not found for ${coingeckoId}`)
    }

    return data[coingeckoId].usd
  } catch (error) {
    // Si falla CoinGecko, usar precio de fallback
    if (FALLBACK_PRICES[coingeckoId]) {
      console.warn(`Using fallback price for ${coingeckoId}: ${FALLBACK_PRICES[coingeckoId]}`)
      return FALLBACK_PRICES[coingeckoId]
    }
    throw error
  }
}

/**
 * Get cached price from Redis
 */
async function getCachedPrice(tokenAddress: string): Promise<PriceData | null> {
  try {
    const cached = await redis.get(`price:${tokenAddress.toLowerCase()}`)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.error('Redis cache error:', error)
  }
  return null
}

/**
 * Cache price in Redis
 */
async function cachePrice(tokenAddress: string, priceData: PriceData): Promise<void> {
  try {
    await redis.setex(
      `price:${tokenAddress.toLowerCase()}`,
      CACHE_TTL,
      JSON.stringify(priceData)
    )
  } catch (error) {
    console.error('Redis cache error:', error)
  }
}

/**
 * Get token price in USD
 * Returns cached price if available, otherwise fetches from appropriate source
 */
export async function getTokenPrice(tokenAddressOrSymbol: string): Promise<PriceData> {
  const tokenConfig = getTokenConfig(tokenAddressOrSymbol)

  if (!tokenConfig) {
    throw new Error(`Token not supported: ${tokenAddressOrSymbol}`)
  }

  // Check cache first
  const cached = await getCachedPrice(tokenConfig.address)
  if (cached) {
    return cached
  }

  // Fetch from appropriate source
  const timestamp = Math.floor(Date.now() / 1000)
  let priceUSD: number
  let source: string

  // Use QuickNode for VTN, CoinGecko for others
  if (tokenConfig.symbol === 'VTN') {
    try {
      priceUSD = await fetchVTNFromQuickNode()
      source = 'quicknode'
    } catch (error) {
      console.warn('QuickNode failed for VTN, trying CoinGecko fallback')
      priceUSD = await fetchFromCoinGecko(tokenConfig.coingeckoId)
      source = 'coingecko'
    }
  } else {
    priceUSD = await fetchFromCoinGecko(tokenConfig.coingeckoId)
    source = 'coingecko'
  }

  const priceData: PriceData = {
    priceUSD,
    symbol: tokenConfig.symbol,
    address: tokenConfig.address,
    timestamp,
    source,
  }

  // Cache the result
  await cachePrice(tokenConfig.address, priceData)

  return priceData
}

/**
 * Calculate USD value for a token amount
 * @param tokenAddress Token contract address
 * @param amount Amount in wei (as string or bigint)
 * @param decimals Token decimals (default 18)
 */
export async function calculateUSDValue(
  tokenAddress: string,
  amount: string | bigint,
  decimals: number = 18
): Promise<{ valueInUSD: bigint; pricePerToken: number }> {
  const priceData = await getTokenPrice(tokenAddress)

  // Convert amount to number (in token units, not wei)
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount
  const amountInTokens = Number(amountBigInt) / Math.pow(10, decimals)

  // Calculate USD value
  const valueUSD = amountInTokens * priceData.priceUSD

  // Convert back to wei-like format (18 decimals for USD)
  const valueInUSDWei = BigInt(Math.floor(valueUSD * 1e18))

  return {
    valueInUSD: valueInUSDWei,
    pricePerToken: priceData.priceUSD,
  }
}
