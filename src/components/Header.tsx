'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WalletButton } from './WalletButton'
import { usePaymentContract } from '@/hooks/useContract'
import { useWallet } from '@/hooks/useWallet'
import { useAdmin } from '@/hooks/useAdmin'
import { formatEther } from 'viem'
import { Menu, X, Home, Compass, Shield, Network } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  const [isClient, setIsClient] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isConnected } = useWallet()
  const { treasuryBalance, treasuryAddress: treasuryAddressRaw } = usePaymentContract()
  const treasuryAddress = treasuryAddressRaw as string | undefined
  const { isAdmin } = useAdmin()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

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

  const formatAddress = (address: string | undefined): string => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <header className="border-b sticky top-0 z-50 font-futura text-base" style={{ backgroundColor: 'rgb(255, 166, 38)' }}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            {/* Left: Hamburger (Mobile) + Logo */}
            <div className="flex items-center gap-3 md:gap-8">
              {/* Hamburger Button - Solo Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Image
                  src="/images/Adarbakar Branding.png"
                  alt="Adarbakar"
                  width={120}
                  height={32}
                  className="h-8 md:h-10 w-auto"
                  priority
                />
              </Link>

              {/* Treasury Balance - Desktop */}
              {isClient && isConnected && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      Treasury: {treasuryBalance !== undefined ? formatBalance(treasuryBalance) : '0.00'} ETH
                    </span>
                    {treasuryAddress && formatAddress(treasuryAddress) && (
                      <span className="text-xs text-gray-700">
                        {formatAddress(treasuryAddress)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Desktop Menu + Wallet Button */}
            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 hover:bg-white/20 rounded-lg transition-colors font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/explore"
                  className="px-4 py-2 hover:bg-white/20 rounded-lg transition-colors font-medium"
                >
                  Explore
                </Link>
                {isClient && isAdmin && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 hover:bg-white/20 rounded-lg transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
              </nav>

              {/* Wallet Button */}
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />

          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-[280px] z-50 md:hidden bg-white shadow-2xl">
            {/* Header del Sidebar */}
            <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: 'rgb(255, 166, 38)' }}>
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col p-4 space-y-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                href="/explore"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Compass className="w-5 h-5" />
                <span className="font-medium">Explore</span>
              </Link>
              {isClient && isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              )}
            </nav>

            {/* Treasury Info & Network - Mobile */}
            {isClient && (
              <div className="absolute bottom-0 left-0 right-0 border-t bg-gray-50">
                {/* Network Selector */}
                <div className="p-4 pb-2">
                  <ConnectButton.Custom>
                    {({ chain, openChainModal, mounted: mountedState }) => {
                      const ready = mountedState
                      if (!ready || !chain) return null
                      
                      return (
                        <button
                          onClick={openChainModal}
                          className="w-full flex items-center gap-3 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Network className="w-4 h-4 text-gray-600" />
                          <div className="flex items-center gap-2">
                            {chain.hasIcon && chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-4 h-4"
                              />
                            )}
                            <span className="text-sm font-medium">{chain.name}</span>
                          </div>
                        </button>
                      )
                    }}
                  </ConnectButton.Custom>
                </div>

                {/* Treasury Balance */}
                {isConnected && treasuryBalance !== undefined && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          Treasury: {formatBalance(treasuryBalance)} ETH
                        </span>
                        {treasuryAddress && formatAddress(treasuryAddress) && (
                          <span className="text-xs text-gray-700">
                            {formatAddress(treasuryAddress)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
