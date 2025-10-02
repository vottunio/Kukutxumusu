'use client'

import { useAdmin } from '@/hooks/useAdmin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContractData } from '@/components/ContractData'
import { AccessDenied } from '@/components/AccessDenied'

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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-600">
            Manage NFTs, auctions, and settings
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Smart Contract Status */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Smart Contract Status
          </h2>
          <ContractData />
        </div>

        {/* Admin Actions */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Auction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Create a new auction for an NFT
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload NFT</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Upload metadata and images to IPFS
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Set prices for direct purchases
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
      </div>
    </main>
  )
}
