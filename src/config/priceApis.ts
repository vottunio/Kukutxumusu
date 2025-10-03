// Configuración centralizada de APIs de precios para tokens

export type PriceSource = 'coingecko' | 'quicknode' | 'fixed'

export interface PriceConfig {
  source: PriceSource
  apiUrl?: string
  coingeckoId?: string
  fixedPrice?: number
}

// Configuración de fuentes de precios por token
export const PRICE_SOURCES: Record<string, PriceConfig> = {
  // ETH - CoinGecko
  'ethereum': {
    source: 'coingecko',
    coingeckoId: 'ethereum',
  },

  // VTN - QuickNode API
  'valtoken': {
    source: 'quicknode',
    apiUrl: 'https://quick-old-patina.base-mainnet.quiknode.pro/1d225d2d7f2fa80e9ea072e82f151f5dcf221d52/addon/1051/v1/prices/0xA9bc478A44a8c8FE6fd505C1964dEB3cEE3b7abC?target=aero',
  },

  // USDT - CoinGecko
  'tether': {
    source: 'coingecko',
    coingeckoId: 'tether',
  },
}

// Función para obtener precio desde la fuente configurada
export async function getTokenPrice(tokenKey: string): Promise<number> {
  const config = PRICE_SOURCES[tokenKey]

  if (!config) {
    throw new Error(`No price source configured for token: ${tokenKey}`)
  }

  switch (config.source) {
    case 'coingecko':
      return await fetchCoinGeckoPrice(config.coingeckoId!)

    case 'quicknode':
      return await fetchQuickNodePrice(config.apiUrl!)

    case 'fixed':
      return config.fixedPrice!

    default:
      throw new Error(`Unknown price source: ${config.source}`)
  }
}

// Fetch desde CoinGecko
async function fetchCoinGeckoPrice(coinId: string): Promise<number> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
  )
  const data = await response.json()
  return data[coinId]?.usd || 0
}

// Fetch desde QuickNode
async function fetchQuickNodePrice(apiUrl: string): Promise<number> {
  const response = await fetch(apiUrl)
  const data = await response.json()

  // Ajustar según la respuesta de QuickNode
  // Ejemplo: puede ser data.price, data.data.price, etc.
  return data.price || data.data?.price || 0
}

// Función para obtener múltiples precios
export async function getMultipleTokenPrices(
  tokenKeys: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {}

  await Promise.all(
    tokenKeys.map(async (key) => {
      try {
        prices[key] = await getTokenPrice(key)
      } catch (error) {
        console.error(`Error fetching price for ${key}:`, error)
        prices[key] = 0
      }
    })
  )

  return prices
}
