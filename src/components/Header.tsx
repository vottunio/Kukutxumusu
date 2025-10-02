'use client'

import Link from 'next/link'
import { WalletButton } from './WalletButton'

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
              Kukuxumusu
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/explore" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Explore
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Admin
              </Link>
            </nav>
          </div>

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
