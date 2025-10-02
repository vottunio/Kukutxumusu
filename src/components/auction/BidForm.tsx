'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { usePlaceBid } from '@/hooks/usePlaceBid'
import { parseEther } from 'viem'

interface BidFormProps {
  auctionId: number
  minBid: bigint
  currentHighestBid: bigint
  onSuccess?: () => void
}

// Tokens disponibles - TODO: Agregar VTN y USDT con sus direcciones reales
const AVAILABLE_TOKENS = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  },
  // {
  //   address: '0x...', // VTN address
  //   symbol: 'VTN',
  //   name: 'VTN Token',
  //   decimals: 18,
  // },
  // {
  //   address: '0x...', // USDT address
  //   symbol: 'USDT',
  //   name: 'Tether USD',
  //   decimals: 6,
  // },
]

export function BidForm({ auctionId, minBid, currentHighestBid, onSuccess }: BidFormProps) {
  const { address, isConnected } = useWallet()
  const [selectedToken, setSelectedToken] = useState(AVAILABLE_TOKENS[0])
  const [bidAmount, setBidAmount] = useState('')
  const { placeBidWithApproval, isApproving, isBidding, isSuccess, error } = usePlaceBid()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      alert('Please connect your wallet')
      return
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    try {
      const amountInWei = parseEther(bidAmount)

      // Verificar que el bid sea mayor que el mínimo
      const minimumRequired = currentHighestBid > 0n ? currentHighestBid : minBid
      if (amountInWei <= minimumRequired) {
        alert(
          `Bid must be higher than ${parseFloat((minimumRequired.toString())) / 1e18} ${selectedToken.symbol}`
        )
        return
      }

      await placeBidWithApproval(
        auctionId,
        selectedToken.address,
        amountInWei,
        address
      )

      // Si es exitoso, limpiar form
      if (isSuccess) {
        setBidAmount('')
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err: any) {
      console.error('Error placing bid:', err)
    }
  }

  // Calcular bid mínimo sugerido (un poco más que el actual)
  const suggestedBid = currentHighestBid > 0n
    ? (Number(currentHighestBid) / 1e18) * 1.05 // 5% más
    : Number(minBid) / 1e18

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Your Bid</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Token Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Token
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_TOKENS.map((token) => (
                <button
                  key={token.address}
                  type="button"
                  onClick={() => setSelectedToken(token)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedToken.address === token.address
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold">{token.symbol}</p>
                  <p className="text-xs text-gray-500">{token.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bid Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                min="0"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Min: ${suggestedBid.toFixed(4)}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                disabled={isApproving || isBidding}
              />
              <div className="absolute right-3 top-3 text-gray-500 font-medium">
                {selectedToken.symbol}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suggested: {suggestedBid.toFixed(4)} {selectedToken.symbol}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">Bid placed successfully! 🎉</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isConnected || isApproving || isBidding || !bidAmount}
          >
            {!isConnected && 'Connect Wallet'}
            {isConnected && isApproving && 'Approving Token...'}
            {isConnected && isBidding && 'Placing Bid...'}
            {isConnected && !isApproving && !isBidding && 'Place Bid'}
          </Button>

          {/* Info */}
          {!isConnected && (
            <p className="text-xs text-center text-gray-500">
              Connect your wallet to place a bid
            </p>
          )}
          {isApproving && (
            <p className="text-xs text-center text-gray-500">
              Step 1/2: Approving {selectedToken.symbol} for spending...
            </p>
          )}
          {isBidding && (
            <p className="text-xs text-center text-gray-500">
              Step 2/2: Submitting your bid...
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
