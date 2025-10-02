'use client'

import { usePaymentContract, useNftContract } from '@/hooks/useContract'
import { useWallet } from '@/hooks/useWallet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ContractData() {
  const { isConnected } = useWallet()
  const { treasuryBalance, contractAddress: paymentAddress } = usePaymentContract()
  const { totalMinted, maxSupply, contractAddress: nftAddress } = useNftContract()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contract Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect wallet to view contract data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Payment Contract Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Payment Contract
            <Badge variant="outline">Base</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Treasury Balance:</span>
              <p className="font-mono">
                {treasuryBalance ? `${treasuryBalance.toString()} ETH` : 'Loading...'}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Address:</span>
              <p className="font-mono text-xs break-all">
                {paymentAddress}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Contract Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            NFT Contract
            <Badge variant="outline">Story Protocol</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Total Minted:</span>
              <p className="font-mono">
                {totalMinted !== undefined && totalMinted !== null ? `${totalMinted.toString()} / ${maxSupply?.toString() || '∞'}` : 'Loading...'}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Address:</span>
              <p className="font-mono text-xs break-all">
                {nftAddress}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
