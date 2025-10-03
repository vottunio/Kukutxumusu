'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CountdownTimer } from './CountdownTimer'
import { Auction } from '@/hooks/useAuction'
import { formatEther } from 'viem'
import Image from 'next/image'

interface AuctionCardProps {
  auction: Auction
  auctionId: number
}

interface NFTData {
  name: string
  imageUrl: string
  description: string
  collection: string
}

// Mapeo de direcciones de tokens a nombres
const TOKEN_NAMES: { [key: string]: string } = {
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ETH',
  '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E': 'VTN'
  // Agregar VTN y USDT cuando tengas las direcciones
}

export function AuctionCard({ auction, auctionId }: AuctionCardProps) {
  const [nftData, setNftData] = useState<NFTData | null>(null)
  const [loading, setLoading] = useState(true)

  const tokenName = TOKEN_NAMES[auction.highestBidToken] || 'Token'
  const hasValidBid = auction.highestBid > 0n

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        const response = await fetch(`/api/nft/${auction.nftId}`)
        if (response.ok) {
          const data = await response.json()
          setNftData(data.nft)
        }
      } catch (error) {
        console.error('Error fetching NFT data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTData()
  }, [auction.nftId])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* NFT Image */}
        <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white">
              <p>Loading...</p>
            </div>
          ) : nftData?.imageUrl ? (
            <Image
              src={nftData.imageUrl}
              alt={nftData.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-white">
              <div>
                <p className="text-6xl font-bold mb-2">#{auction.nftId.toString()}</p>
                <p className="text-xl opacity-80">Kukuxumusu NFT</p>
              </div>
            </div>
          )}
        </div>

        {/* Auction Info */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {nftData?.name || `Kukuxumusu #${auction.nftId.toString()}`}
              </h3>
              <p className="text-sm text-gray-500">Auction #{auctionId}</p>
            </div>
            <Badge variant={auction.finalized ? 'secondary' : 'default'}>
              {auction.finalized ? 'Finalized' : 'Active'}
            </Badge>
          </div>

          {/* Countdown */}
          {!auction.finalized && (
            <CountdownTimer endTime={Number(auction.endTime)} />
          )}

          {/* Current Bid */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Current Bid</p>
            {hasValidBid ? (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {formatEther(auction.highestBid)} {tokenName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  by {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                </p>
              </>
            ) : (
              <p className="text-xl text-gray-500">No bids yet</p>
            )}
          </div>

          {/* Anti-Sniping Info */}
          {auction.antiSnipingExtension > 0n && (
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
              <p className="font-semibold text-blue-900 mb-1">🛡️ Anti-Sniping Protection</p>
              <p>
                Bids in the last {Number(auction.antiSnipingTrigger) / 60} minutes extend auction by{' '}
                {Number(auction.antiSnipingExtension) / 60} minutes
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
