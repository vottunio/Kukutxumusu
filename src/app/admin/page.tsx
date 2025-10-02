'use client'

import { useAdmin } from '@/hooks/useAdmin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContractData } from '@/components/ContractData'
import { AccessDenied } from '@/components/AccessDenied'
import { CreateNFTAuctionForm } from '@/components/admin/CreateNFTAuctionForm'

export default function AdminPage() {
  const { isAdmin, isConnected, address } = useAdmin()

  // Not connected - ask to connect wallet
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Please connect your wallet to access the admin panel.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  // Connected but not admin - show access denied
  if (!isAdmin) {
    return <AccessDenied />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-600">
            Manage NFTs, auctions, and settings
          </p>
          {address && (
            <p className="text-sm text-gray-500 mt-2">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {/* Create NFT & Auction Form */}
        <div className="max-w-4xl mx-auto mb-12">
          <CreateNFTAuctionForm />
        </div>

        {/* Other Admin Actions */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Other Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Set prices for direct purchases (for direct sales, not auctions)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Configure treasury and allowed tokens
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Smart Contract Status - At the bottom */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Smart Contract Status
          </h2>
          <ContractData />
        </div>
      </div>
    </main>
  )
}
