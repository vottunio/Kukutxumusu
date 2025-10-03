'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Gavel, Image as ImageIcon } from 'lucide-react'

interface AuctionStats {
  total: number
  active: number
  completed: number
}

interface BidStats {
  total: number
  averagePerAuction: number
}

interface NFTStats {
  totalMinted: number
}

interface Stats {
  auctions: AuctionStats
  bids: BidStats
  nfts: NFTStats
}

interface TokenBalance {
  token: string
  balance: string
  balanceFormatted: string
}

interface TreasuryData {
  treasuryAddress: string
  balances: TokenBalance[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [treasury, setTreasury] = useState<TreasuryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, treasuryRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/treasury')
      ])

      const statsData = await statsRes.json()
      const treasuryData = await treasuryRes.json()

      if (statsData.success) setStats(statsData.data)
      if (treasuryData.success) setTreasury(treasuryData.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Public Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Transparency & Statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Auctions */}
          <StatCard
            icon={<Gavel className="w-8 h-8 text-purple-600" />}
            title="Total Auctions"
            value={stats?.auctions.total.toString() || '0'}
            subtitle={`${stats?.auctions.active || 0} active, ${stats?.auctions.completed || 0} completed`}
            bgColor="bg-purple-100"
          />

          {/* Total Bids */}
          <StatCard
            icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
            title="Total Bids"
            value={stats?.bids.total.toString() || '0'}
            subtitle={`Avg: ${stats?.bids.averagePerAuction.toFixed(1) || '0'} per auction`}
            bgColor="bg-blue-100"
          />

          {/* NFTs Minted */}
          <StatCard
            icon={<ImageIcon className="w-8 h-8 text-green-600" />}
            title="NFTs Minted"
            value={stats?.nfts.totalMinted.toString() || '0'}
            subtitle="On Story Protocol"
            bgColor="bg-green-100"
          />

          {/* Treasury Value */}
          <StatCard
            icon={<DollarSign className="w-8 h-8 text-yellow-600" />}
            title="Treasury Tokens"
            value={treasury?.balances.length.toString() || '0'}
            subtitle="Different tokens held"
            bgColor="bg-yellow-100"
          />
        </div>

        {/* Treasury Balances */}
        {treasury && (
          <div className="max-w-7xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Treasury Balances
              </h2>

              {/* Treasury Address */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Treasury Address (Base)</p>
                <p className="font-mono text-sm break-all">{treasury.treasuryAddress}</p>
              </div>

              {/* Token Balances */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {treasury.balances.map((balance) => (
                  <div
                    key={balance.token}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900">
                        {balance.token}
                      </span>
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mb-1">
                      {parseFloat(balance.balanceFormatted).toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500 font-mono break-all">
                      {balance.balance} wei
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About This Dashboard
            </h2>
            <div className="prose text-gray-600">
              <p className="mb-4">
                This public dashboard displays real-time statistics and treasury information
                for the Kukuxumusu NFT marketplace. All data is sourced directly from the blockchain:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Auction & Bid Data:</strong> Payment contract on Base Sepolia</li>
                <li><strong>NFT Data:</strong> NFT contract on Story Protocol Testnet</li>
                <li><strong>Treasury Balances:</strong> Multi-token balances (VTN, ETH, USDT) on Base</li>
              </ul>
              <p className="mt-4">
                All smart contracts are verified and transparent. Only authorized Kukuxumusu
                wallets can withdraw funds from the treasury.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  bgColor
}: {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
      <div className={`${bgColor} rounded-lg p-3 w-fit mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}
