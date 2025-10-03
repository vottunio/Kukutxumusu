'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { usePlaceBid } from '@/hooks/usePlaceBid'
import { useIsTokenAllowedForAuction, useAuctionMinPrice } from '@/hooks/useAuction'
import { useHasSufficientBalance } from '@/hooks/useTokenBalance'
import { useNetworkValidation } from '@/hooks/useNetworkValidation'
import { formatUnits, parseUnits } from 'viem'
import { getTokensByNetwork } from '@/config/tokens'
import { AlertCircle } from 'lucide-react'

interface BidFormProps {
  auctionId: number
  currentHighestBid: bigint
  currentHighestToken?: string
  onSuccess?: () => void
  disabled?: boolean
}

interface TokenOption {
  address: string
  symbol: string
  decimals: number
}

function TokenButton({
  token,
  auctionId,
  isSelected,
  onClick
}: {
  token: TokenOption
  auctionId: number
  isSelected: boolean
  onClick: () => void
}) {
  const isAllowed = useIsTokenAllowedForAuction(auctionId, token.address)
  const minPrice = useAuctionMinPrice(auctionId, token.address)

  if (!isAllowed) return null

  const formattedMinPrice = minPrice
    ? parseFloat(formatUnits(minPrice, token.decimals)).toFixed(token.decimals === 6 ? 2 : 4)
    : '...'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-purple-600 bg-purple-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <p className="font-bold">{token.symbol}</p>
      <p className="text-xs text-gray-500 mt-1">
        Min: {formattedMinPrice}
      </p>
    </button>
  )
}

export function BidForm({ auctionId, currentHighestBid, currentHighestToken, onSuccess, disabled = false }: BidFormProps) {
  const { address, isConnected } = useWallet()
  const allTokens = getTokensByNetwork('testnet')
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const { placeBidWithApproval, isApproving, isBidding, isSuccess, error } = usePlaceBid()
  const { isCorrectNetwork, switchToPaymentNetwork } = useNetworkValidation()

  const requiredAmount = bidAmount && selectedToken
    ? parseUnits(bidAmount, selectedToken.decimals)
    : 0n

  const { hasSufficient, formattedBalance } = useHasSufficientBalance(
    selectedToken?.address || '',
    requiredAmount,
    selectedToken?.decimals || 18
  )

  // Set first token as default
  useEffect(() => {
    if (!selectedToken && allTokens.length > 0) {
      setSelectedToken(allTokens[0])
    }
  }, [allTokens])

  const minPrice = useAuctionMinPrice(auctionId, selectedToken?.address || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address || !selectedToken) {
      alert('Please connect your wallet and select a token')
      return
    }

    // Check network
    if (!isCorrectNetwork) {
      const switched = await switchToPaymentNetwork()
      if (!switched) {
        alert('Please switch to Base Sepolia network')
        return
      }
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    // Check balance
    if (!hasSufficient) {
      alert(`Insufficient balance. You have ${formattedBalance} ${selectedToken.symbol}`)
      return
    }

    try {
      const amountInWei = parseUnits(bidAmount, selectedToken.decimals)

      // Verificar que el bid sea mayor que el mínimo
      const minimumRequired = currentHighestBid > 0n && currentHighestToken?.toLowerCase() === selectedToken.address.toLowerCase()
        ? currentHighestBid
        : minPrice || 0n

      if (amountInWei <= minimumRequired) {
        alert(
          `Bid must be higher than ${formatUnits(minimumRequired, selectedToken.decimals)} ${selectedToken.symbol}`
        )
        return
      }

      // TODO: Obtener valueInUSD y signature del relayer
      const valueInUSD = BigInt(0)
      const signature = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`

      await placeBidWithApproval(
        auctionId,
        selectedToken.address,
        amountInWei,
        valueInUSD,
        signature,
        address
      )

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

  const getMinimumForToken = () => {
    if (!selectedToken || !minPrice) return 0

    if (currentHighestBid > 0n && currentHighestToken?.toLowerCase() === selectedToken.address.toLowerCase()) {
      return parseFloat(formatUnits(currentHighestBid, selectedToken.decimals)) * 1.05
    }

    return parseFloat(formatUnits(minPrice, selectedToken.decimals))
  }

  const suggestedBid = getMinimumForToken()
  const decimalsToShow = selectedToken?.decimals === 6 ? 2 : 4

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
              {allTokens.map((token) => (
                <TokenButton
                  key={token.address}
                  token={token}
                  auctionId={auctionId}
                  isSelected={selectedToken?.address === token.address}
                  onClick={() => setSelectedToken(token)}
                />
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
                step={selectedToken?.decimals === 6 ? '0.01' : '0.0001'}
                min="0"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={suggestedBid > 0 ? `Min: ${suggestedBid.toFixed(decimalsToShow)}` : '0.0'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                disabled={isApproving || isBidding}
              />
              <div className="absolute right-3 top-3 text-gray-500 font-medium">
                {selectedToken?.symbol || 'ETH'}
              </div>
            </div>
            {suggestedBid > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum: {suggestedBid.toFixed(decimalsToShow)} {selectedToken?.symbol}
              </p>
            )}
          </div>

          {/* Network Warning */}
          {isConnected && !isCorrectNetwork && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Wrong Network</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Please switch to Base Sepolia to place bids
                </p>
                <button
                  type="button"
                  onClick={switchToPaymentNetwork}
                  className="mt-2 text-xs text-yellow-800 underline hover:text-yellow-900"
                >
                  Switch Network
                </button>
              </div>
            </div>
          )}

          {/* Balance Warning */}
          {isConnected && selectedToken && bidAmount && !hasSufficient && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Insufficient Balance</p>
                <p className="text-xs text-red-700 mt-1">
                  Balance: {formattedBalance} {selectedToken.symbol}
                </p>
              </div>
            </div>
          )}

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

          {/* Auction Ended Warning */}
          {disabled && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 text-center">This auction has ended</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={disabled || !isConnected || isApproving || isBidding || !bidAmount || !selectedToken}
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
              Step 1/2: Approving {selectedToken?.symbol} for spending...
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
