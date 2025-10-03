'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useActiveAuctions, useAuction } from '@/hooks/useAuction'
import { AuctionCard } from '@/components/auction/AuctionCard'
import { BidForm } from '@/components/auction/BidForm'
import { BidderList } from '@/components/auction/BidderList'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { activeAuctionIds, totalActive } = useActiveAuctions()

  const currentAuctionId = activeAuctionIds[currentIndex] ?? null
  const {
    auction,
    bids,
    isActive,
    isLoading,
    refetch,
  } = useAuction(currentAuctionId ?? 0)

  // Navegar al siguiente/anterior
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalActive)
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalActive) % totalActive)
  }

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

        {/* Featured Auction Section with Carousel */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Active Auctions
            </h2>
            {totalActive > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} of {totalActive}
                </span>
              </div>
            )}
          </div>

          {!mounted || isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500">Loading auctions...</p>
            </div>
          ) : totalActive === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500">No active auctions at the moment</p>
              <p className="text-sm text-gray-400 mt-2">Check back soon!</p>
            </div>
          ) : (
            <div className="relative">
              {/* Navigation Arrows */}
              {totalActive > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
                    aria-label="Previous auction"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
                    aria-label="Next auction"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Auction Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Auction Card */}
                <div>
                  <AuctionCard auction={auction!} auctionId={currentAuctionId!} />
                </div>

                {/* Right: Bid Form & Bidder List */}
                <div className="space-y-6">
                  {isActive && (
                    <BidForm
                      auctionId={currentAuctionId!}
                      currentHighestBid={auction!.highestBid}
                      currentHighestToken={auction!.highestBidToken}
                      onSuccess={refetch}
                    />
                  )}
                  <BidderList
                    bids={bids}
                    currentHighestBidder={auction!.highestBidder}
                  />
                </div>
              </div>

              {/* Auction Indicators */}
              {totalActive > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {activeAuctionIds.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'w-8 bg-purple-600'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to auction ${index + 1}`}
                    />
                  ))}
                </div>
              )}
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
