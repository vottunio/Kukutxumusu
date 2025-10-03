'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useActiveAuction, useAuction } from '@/hooks/useAuction'
import { AuctionCard } from '@/components/auction/AuctionCard'
import { BidForm } from '@/components/auction/BidForm'
import { BidderList } from '@/components/auction/BidderList'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { activeAuctionId } = useActiveAuction()
  const {
    auction,
    bids,
    isActive,
    isLoading,
    refetch,
  } = useAuction(activeAuctionId ?? 0)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Hero section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Kukuxumusu NFT
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Cross-chain NFT marketplace powered by Base & Story Protocol
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/explore"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Explore NFTs
            </Link>
            <Link
              href="/admin"
              className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        {/* Featured Auction Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Active Auction
          </h2>

          {!mounted || isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500">Loading auction...</p>
            </div>
          ) : !auction ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500">No active auctions at the moment</p>
              <p className="text-sm text-gray-400 mt-2">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Auction Card */}
              <div>
                <AuctionCard auction={auction} auctionId={activeAuctionId!} />
              </div>

              {/* Right: Bid Form & Bidder List */}
              <div className="space-y-6">
                {isActive && (
                  <BidForm
                    auctionId={activeAuctionId!}
                    currentHighestBid={auction.highestBid}
                    currentHighestToken={auction.highestBidToken}
                    onSuccess={refetch}
                  />
                )}
                <BidderList
                  bids={bids}
                  currentHighestBidder={auction.highestBidder}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recently Minted NFTs */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Recently Minted
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500">No NFTs minted yet</p>
            <p className="text-sm text-gray-400 mt-2">Be the first to mint!</p>
          </div>
        </div>
      </div>
    </main>
  )
}
