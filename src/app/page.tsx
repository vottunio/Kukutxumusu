'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useActiveAuctions, useAuction } from '@/hooks/useAuction'
import { usePlaceBid } from '@/hooks/usePlaceBid'
import { AuctionCard } from '@/components/auction/AuctionCard'
import { BidForm } from '@/components/auction/BidForm'
import { BidderList } from '@/components/auction/BidderList'
import { LandingSections } from '@/components/LandingSections'
import { Footer } from '@/components/Footer'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { activeAuctionIds } = useActiveAuctions()
  const [filteredActiveAuctions, setFilteredActiveAuctions] = useState<number[]>([])
  const [actualActiveCount, setActualActiveCount] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Filtrar subastas activas en el frontend
  useEffect(() => {
    const filterActiveAuctions = async () => {
      if (activeAuctionIds.length === 0) {
        setFilteredActiveAuctions([])
        setActualActiveCount(0)
        return
      }

      const currentTime = BigInt(Math.floor(Date.now() / 1000))
      const activeAuctions: number[] = []

      // Verificar cada subasta individualmente
      for (const auctionId of activeAuctionIds) {
        try {
          const response = await fetch(`/api/auctions/${auctionId}`)
          if (response.ok) {
            const auctionData = await response.json()
            if (auctionData.success && auctionData.auction) {
              const { startTime, endTime, finalized } = auctionData.auction
              
              // Verificar si está activa: no finalizada, dentro del rango de tiempo
              const isActive = !finalized && 
                currentTime >= BigInt(startTime) && 
                currentTime < BigInt(endTime)
              
              if (isActive) {
                activeAuctions.push(auctionId)
              }
            }
          }
        } catch (error) {
          console.error(`Error checking auction ${auctionId}:`, error)
        }
      }

      setFilteredActiveAuctions(activeAuctions)
      setActualActiveCount(activeAuctions.length)
    }

    filterActiveAuctions()
  }, [activeAuctionIds])

  const currentAuctionId = filteredActiveAuctions[currentIndex] ?? null
  const {
    auction,
    bids,
    isActive,
    isLoading,
    refetch,
  } = useAuction(currentAuctionId ?? 0)

  // Obtener hashes de transacción de bids
  const { bidTransactionHashes } = usePlaceBid()

  // Navegar al siguiente/anterior
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % actualActiveCount)
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + actualActiveCount) % actualActiveCount)
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: 'rgb(255, 166, 38)' }}>
      <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-16">
        {/* Featured Auction Section with Carousel */}
        <div className="mb-16">
          {!isClient || isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500">Loading auctions...</p>
            </div>
          ) : actualActiveCount === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Example Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <Image
                  src="/images/Adarbakar-1.jpg"
                  alt="Example NFT"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Right: Bid Section */}
              <div className="space-y-2">
                {/* Title */}
                <h1 className="font-glina text-gray-900 text-4xl sm:text-5xl lg:text-[68px]" style={{ lineHeight: '1' }}>
                  Adarbakar
                </h1>

                {/* Current Bid and Timer */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Current bid</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">Ξ 1.50</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Auction ends in</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">3h 28m 23s</p>
                  </div>
                </div>

                {/* Bid Form and History Container */}
                <div>
                  <BidForm
                    auctionId={0}
                    currentHighestBid={0n}
                    currentHighestToken=""
                    onSuccess={() => {}}
                    disabled={true}
                  />

                  {/* Example Bids */}
                  <BidderList
                    bids={[
                      {
                        bidder: '0x1234567890abcdef1234567890abcdef12345678',
                        amount: 1500000000000000000n,
                        token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                        valueInUSD: 2500000000000000000000n,
                        timestamp: BigInt(Math.floor((Date.now() - 3600000) / 1000)),
                        transactionHash: '0xabcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234',
                      },
                      {
                        bidder: '0x8765432109876543210987654321098765432109',
                        amount: 1000000000n,
                        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                        valueInUSD: 1000000000000000000000n,
                        timestamp: BigInt(Math.floor((Date.now() - 7200000) / 1000)),
                        transactionHash: '0xefgh5678efgh5678efgh5678efgh5678efgh5678efgh5678efgh5678efgh5678',
                      },
                      {
                        bidder: '0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd',
                        amount: 500000000000000000n,
                        token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                        valueInUSD: 800000000000000000000n,
                        timestamp: BigInt(Math.floor((Date.now() - 10800000) / 1000)),
                        transactionHash: '0xijkl9012ijkl9012ijkl9012ijkl9012ijkl9012ijkl9012ijkl9012ijkl9012',
                      },
                      {
                        bidder: '0x5555555555555555555555555555555555555555',
                        amount: 400000000000000000n,
                        token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                        valueInUSD: 650000000000000000000n,
                        timestamp: BigInt(Math.floor((Date.now() - 14400000) / 1000)),
                        transactionHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                      },
                      {
                        bidder: '0x9999999999999999999999999999999999999999',
                        amount: 300000000000000000n,
                        token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                        valueInUSD: 500000000000000000000n,
                        timestamp: BigInt(Math.floor((Date.now() - 18000000) / 1000)),
                        transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
                      },
                      {
                        bidder: '0x7777777777777777777777777777777777777777',
                        amount: 500000000n,
                        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                        valueInUSD: 500000000000000000000n,
                        timestamp: BigInt(Math.floor((Date.now() - 21600000) / 1000)),
                        transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                      },
                      {
                        bidder: '0x6666666666666666666666666666666666666666',
                        amount: 200000000000000000n,
                        token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                        valueInUSD: 330000000000000000000n,
                        timestamp: BigInt(Math.floor((Date.now() - 25200000) / 1000)),
                        transactionHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
                      },
                      {
                        bidder: '0x3333333333333333333333333333333333333333',
                        amount: 100000000000000000n,
                        token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                        valueInUSD: 165000000000000000000n,
                        timestamp: BigInt(Math.floor((Date.now() - 28800000) / 1000)),
                        transactionHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
                      },
                    ]}
                    currentHighestBidder="0x1234567890abcdef1234567890abcdef12345678"
                    bidTransactionHashes={{}}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Navigation Arrows */}
              {actualActiveCount > 1 && (
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 rounded-xl" style={{ backgroundColor: 'rgb(255, 166, 38)' }}>
                {/* Left: Auction Card */}
                <div>
                  <AuctionCard auction={auction!} auctionId={currentAuctionId!} />
                </div>

                {/* Right: Bid Form & Bidder List */}
                <div>
                  <BidForm
                    auctionId={currentAuctionId!}
                    currentHighestBid={auction!.highestBid}
                    currentHighestToken={auction!.highestBidToken}
                    onSuccess={refetch}
                    disabled={!isActive}
                  />
                  <BidderList
                    bids={bids}
                    currentHighestBidder={auction!.highestBidder}
                    bidTransactionHashes={bidTransactionHashes}
                  />
                </div>
              </div>

              {/* Auction Indicators */}
              {actualActiveCount > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {filteredActiveAuctions.map((_, index) => (
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
        {/* <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Recently Minted
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500">No NFTs minted yet</p>
            <p className="text-sm text-gray-400 mt-2">Be the first to mint!</p>
          </div>
        </div> */}
      </div>

      {/* Landing Sections - About Us & FAQ */}
      <LandingSections />

      {/* Footer */}
      <Footer />
    </main>
  )
}
