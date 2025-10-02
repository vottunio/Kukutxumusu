/**
 * Admin Configuration
 *
 * For MVP: Hardcoded list of admin wallets
 * Future: Move to database with role-based access control
 */

// List of authorized admin wallet addresses
export const ADMIN_WALLETS: string[] = [
  '0x090378a9c80c5E1Ced85e56B2128c1e514E75357', // Owner
  '0x0e60B83F83c5d2684acE779dea8A957e91D02475', // Deployer
  // Add more admin wallets here as needed
]

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
