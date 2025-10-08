// Configuración centralizada de tokens
// Todas las direcciones y metadata de tokens en un solo lugar

export interface TokenConfig {
  address: string
  symbol: string
  decimals: number
  coingeckoId?: string
}

// Dirección especial para ETH nativo
export const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const

// ====== TESTNET TOKENS (Base Sepolia) ======
export const TESTNET_TOKENS = {
  ETH: {
    address: NATIVE_ETH_ADDRESS,
    symbol: 'ETH',
    decimals: 18,
    coingeckoId: 'ethereum',
  },
  VTN: {
    address: '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E',
    symbol: 'VTN',
    decimals: 18,
    coingeckoId: 'valtoken',
  },
  USDT: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDT',
    decimals: 6,
    coingeckoId: 'tether',
  },
} as const

// ====== MAINNET TOKENS (Base) ======
export const MAINNET_TOKENS = {
  ETH: {
    address: NATIVE_ETH_ADDRESS,
    symbol: 'ETH',
    decimals: 18,
    coingeckoId: 'ethereum',
  },
  VTN: {
    address: '0x...', // TODO: Dirección real en mainnet
    symbol: 'VTN',
    decimals: 18,
    coingeckoId: 'valtoken',
  },
  USDT: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDT',
    decimals: 6,
    coingeckoId: 'tether',
  },
} as const

// Función para obtener tokens por red
export function getTokensByNetwork(network: 'testnet' | 'mainnet') {
  return network === 'testnet' ? Object.values(TESTNET_TOKENS) : Object.values(MAINNET_TOKENS)
}

// Por defecto usa testnet
export const TOKENS = TESTNET_TOKENS
export const AVAILABLE_TOKENS = Object.values(TESTNET_TOKENS)

// Mapping de dirección -> símbolo (útil para lookups rápidos)
export const TOKEN_SYMBOLS: Record<string, string> = Object.values(TOKENS).reduce(
  (acc, token) => ({
    ...acc,
    [token.address.toLowerCase()]: token.symbol,
  }),
  {}
)

// Función helper para obtener símbolo de token por dirección
export function getTokenSymbol(address: string): string {
  if (!address) return 'Unknown'
  return TOKEN_SYMBOLS[address.toLowerCase()] || 'Unknown'
}

// Función helper para obtener config completa de token por dirección
export function getTokenByAddress(address: string): TokenConfig | undefined {
  return AVAILABLE_TOKENS.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  )
}

// Función helper para obtener config de token por símbolo
export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return AVAILABLE_TOKENS.find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
  )
}
