'use client'

import { useState } from 'react'
import { Bid } from '@/hooks/useAuction'
import { formatEther } from 'viem'
import { getTokenSymbol } from '@/config/tokens'

interface BidderListProps {
  bids: Bid[]
  currentHighestBidder?: string
  bidTransactionHashes?: Record<string, string>
}

export function BidderList({ bids, currentHighestBidder, bidTransactionHashes = {} }: BidderListProps) {
  const [showAllBids, setShowAllBids] = useState(false)
  const INITIAL_DISPLAY_COUNT = 3

  if (bids.length === 0) {
    return (
      <div className="border-t border-gray-200 pt-3 md:pt-4 mt-3 md:mt-4">
        <p className="text-xs md:text-sm text-gray-500 py-3 md:py-4">
          No bids yet. Be the first to bid!
        </p>
      </div>
    )
  }

  // Ordenar bids por timestamp descendente (más recientes primero)
  const sortedBids = [...bids].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
  const displayedBids = sortedBids.slice(0, INITIAL_DISPLAY_COUNT)

  return (
    <>
      <div className="border-t border-gray-200 pt-3 md:pt-4 mt-3 md:mt-4 w-full">
        <div className="space-y-1.5 md:space-y-2 w-full">
          {displayedBids.map((bid, index) => {
            const tokenName = getTokenSymbol(bid.token)

            // Buscar el hash de transacción para este bid
            const bidKey = `${bid.bidder}-${bid.token}-${bid.amount}`
            const transactionHash = bidTransactionHashes[bidKey] || bid.transactionHash

            return (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 md:py-2"
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span className="font-mono text-xs md:text-sm">
                    {bid.bidder.slice(0, 4)}...{bid.bidder.slice(-4)}
                  </span>
                  {transactionHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="View on BaseScan"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
                <div className="font-semibold text-sm md:text-base">
                  {formatEther(bid.amount)} {tokenName}
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Bids Button - Siempre visible para mostrar más info */}
        {bids.length > 0 && (
          <div className="mt-3 md:mt-4 text-center">
            <button
              onClick={() => setShowAllBids(true)}
              className="text-xs md:text-sm text-gray-600 hover:text-gray-900 underline"
            >
              View all bids ({bids.length})
            </button>
          </div>
        )}
      </div>

      {/* Modal for All Bids */}
      {showAllBids && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="rounded-lg max-w-2xl w-full max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'rgb(255, 166, 38)' }}>
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">All Bids ({bids.length})</h2>
              <button
                onClick={() => setShowAllBids(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Bids List */}
            <div className="overflow-y-auto flex-1 p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {sortedBids.map((bid, index) => {
                  const tokenName = getTokenSymbol(bid.token)
                  const isHighest = bid.bidder.toLowerCase() === currentHighestBidder?.toLowerCase()
                  const date = new Date(Number(bid.timestamp) * 1000)

                  // Buscar el hash de transacción para este bid
                  const bidKey = `${bid.bidder}-${bid.token}-${bid.amount}`
                  const transactionHash = bidTransactionHashes[bidKey] || bid.transactionHash

                  return (
                    <div
                      key={index}
                      className={`p-3 md:p-4 rounded-lg border ${
                        isHighest ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex-1 w-full sm:w-auto">
                          <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                            <span className="font-mono text-xs md:text-sm font-semibold break-all">
                              {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                            </span>
                            {isHighest && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Winning
                              </span>
                            )}
                          </div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {date.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                          {transactionHash && (
                            <a
                              href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs md:text-sm text-blue-600 hover:text-blue-800 mt-1 md:mt-2"
                            >
                              View transaction
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <div className="text-lg md:text-xl font-bold">
                            {formatEther(bid.amount)} {tokenName}
                          </div>
                          {bid.valueInUSD > 0n && (
                            <div className="text-xs md:text-sm text-gray-500 mt-1">
                              ≈ ${(Number(bid.valueInUSD) / 1e18).toFixed(2)} USD
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
