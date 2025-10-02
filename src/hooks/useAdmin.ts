'use client'

import { useWallet } from './useWallet'
import { isAdmin, getAdminRole } from '@/lib/admin-config'

/**
 * Hook to check admin permissions
 *
 * Usage:
 * const { isAdmin, role } = useAdmin()
 * if (!isAdmin) return <AccessDenied />
 */
export function useAdmin() {
  const { address, isConnected } = useWallet()

  return {
    isAdmin: isAdmin(address),
    role: getAdminRole(address),
    isConnected,
    address,
  }
}
