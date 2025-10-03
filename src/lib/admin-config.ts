/**
 * Admin Configuration & Wallet Addresses
 *
 * For MVP: Hardcoded list of admin wallets
 * Future: Move to database with role-based access control
 */

// Environment-based configuration
const isTestnet = process.env.NEXT_PUBLIC_NETWORK_MODE === 'testnet'

// List of authorized admin wallet addresses
// NOTE: Same wallets will be used for both testnet and mainnet
export const ADMIN_WALLETS: string[] = [
  '0x090378a9c80c5E1Ced85e56B2128c1e514E75357', // Owner (Kukuxumusu)
  '0x0e60B83F83c5d2684acE779dea8A957e91D02475', // Deployer (Technical team)
  // Add more admin wallets here as needed
]

/**
 * Treasury wallet - receives all payments on Base
 * This wallet is configured in the Payment smart contract
 * NOTE: Same wallet for both testnet and mainnet
 */
export const TREASURY_WALLET = '0x090378a9c80c5E1Ced85e56B2128c1e514E75357' // Kukuxumusu treasury

/**
 * Relayer wallet - executes cross-chain mints on Story Protocol
 * This is the wallet used by the Go relayer service
 * NOTE: Will be configured when Go relayer is deployed (same for testnet/mainnet)
 */
export const RELAYER_WALLET = process.env.RELAYER_ADDRESS || '0x...' // To be configured

/**
 * Contract owner wallet - can call owner-only functions
 * Usually same as primary admin
 * NOTE: Same wallet for both testnet and mainnet
 */
export const OWNER_WALLET = '0x090378a9c80c5E1Ced85e56B2128c1e514E75357' // Kukuxumusu owner

/**
 * Check if an address is an admin
 * @param address - Wallet address to check
 * @returns true if address is in admin list
 */
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false

  const normalizedAddress = address.toLowerCase()
  return ADMIN_WALLETS.some(admin => admin.toLowerCase() === normalizedAddress)
}

/**
 * Get admin role for an address
 * Future: Expand to support different roles (super-admin, moderator, etc.)
 */
export function getAdminRole(address: string | undefined): 'admin' | 'user' {
  return isAdmin(address) ? 'admin' : 'user'
}

/**
 * Check if an address is the contract owner
 */
export function isOwner(address: string | undefined): boolean {
  if (!address) return false
  return OWNER_WALLET.toLowerCase() === address.toLowerCase()
}

/**
 * Check if an address is the relayer
 */
export function isRelayer(address: string | undefined): boolean {
  if (!address) return false
  return RELAYER_WALLET.toLowerCase() === address.toLowerCase()
}
