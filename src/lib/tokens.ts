// Token configuration for Kukuxumusu marketplace

export const NATIVE_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const

export interface TokenConfig {
  address: string
  symbol: string
  decimals: number
  name: string
}

export interface NetworkTokens {
  ETH: TokenConfig
  VTN: TokenConfig
  USDT: TokenConfig
}

// Testnet tokens (Base Sepolia)
export const TESTNET_TOKENS: NetworkTokens = {
  ETH: {
    address: NATIVE_ETH,
    symbol: 'ETH',
    decimals: 18,
    name: 'Ethereum',
  },
  VTN: {
    address: '',
    symbol: 'VTN',
    decimals: 18,
    name: 'Vottun Token',
  },
  USDT: {
    address: '',
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD',
  },
}

// Mainnet tokens (Base Mainnet)
export const MAINNET_TOKENS: NetworkTokens = {
  ETH: {
    address: NATIVE_ETH,
    symbol: 'ETH',
    decimals: 18,
    name: 'Ethereum',
  },
  VTN: {
    address: '',
    symbol: 'VTN',
    decimals: 18,
    name: 'Vottun Token',
  },
  USDT: {
    // Official USDT on Base Mainnet
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD',
  },
}

export type NetworkMode = 'testnet' | 'mainnet'

export function getTokens(mode: NetworkMode): NetworkTokens {
  return mode === 'testnet' ? TESTNET_TOKENS : MAINNET_TOKENS
}

export function getTokenArray(mode: NetworkMode): TokenConfig[] {
  const tokens = getTokens(mode)
  return [tokens.ETH, tokens.VTN, tokens.USDT]
}
