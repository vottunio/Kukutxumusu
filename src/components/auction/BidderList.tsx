'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bid } from '@/hooks/useAuction'
import { formatEther } from 'viem'

interface BidderListProps {
  bids: Bid[]
  currentHighestBidder?: string
}

const TOKEN_NAMES: { [key: string]: string } = {
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ETH',
}

export function BidderList({ bids, currentHighestBidder }: BidderListProps) {
  if (bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bid History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No bids yet. Be the first to bid!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Ordenar bids por timestamp descendente (más recientes primero)
  const sortedBids = [...bids].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bid History</span>
          <Badge variant="outline">{bids.length} bid{bids.length !== 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedBids.map((bid, index) => {
            const tokenName = TOKEN_NAMES[bid.token] || 'Token'
            const isHighest = bid.bidder.toLowerCase() === currentHighestBidder?.toLowerCase()
            const date = new Date(Number(bid.timestamp) * 1000)

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isHighest ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-medium">
                      {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                    </p>
                    {isHighest && (
                      <Badge variant="default" className="text-xs">
                        Winning
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {date.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {formatEther(bid.amount)}
                  </p>
                  <p className="text-xs text-gray-600">{tokenName}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
