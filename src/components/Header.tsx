'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WalletButton } from './WalletButton'
import { usePaymentContract } from '@/hooks/useContract'
import { useWallet } from '@/hooks/useWallet'
import { useAdmin } from '@/hooks/useAdmin'
import { formatEther } from 'viem'

export function Header() {
  const [isClient, setIsClient] = useState(false)
  const { isConnected } = useWallet()
  const { treasuryBalance } = usePaymentContract()
  const { isAdmin } = useAdmin()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Debug logs
  console.log('🔍 [Header] Debug:', {
    isConnected,
    treasuryBalance,
    isAdmin,
  })

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00'
    return parseFloat(formatEther(balance)).toFixed(4)
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
            Adarbakar
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/explore" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Explore
              </Link>
              {isClient && isAdmin && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Treasury Balance & Wallet Button */}
          <div className="flex items-center gap-4">
            {isClient && isConnected && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  Treasury: {treasuryBalance !== undefined ? formatBalance(treasuryBalance) : '0.00'} ETH
                </span>
              </div>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  )
}
