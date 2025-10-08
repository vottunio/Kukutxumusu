'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { usePlaceBid } from '@/hooks/usePlaceBid'
import { useIsTokenAllowedForAuction, useAuctionMinPrice } from '@/hooks/useAuction'
import { useHasSufficientBalance } from '@/hooks/useTokenBalance'
import { useNetworkValidation } from '@/hooks/useNetworkValidation'
import { formatUnits, parseUnits } from 'viem'
import { getTokensByNetwork, NATIVE_ETH_ADDRESS } from '@/config/tokens'

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
      className={`p-2 md:p-3 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-purple-600 bg-purple-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <p className="font-bold text-sm md:text-base">{token.symbol}</p>
      <p className="text-[10px] md:text-xs text-gray-500 mt-1">
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
  const [isLoadingSignature, setIsLoadingSignature] = useState(false)
  const [showGasInfo, setShowGasInfo] = useState(false)
  const { placeBidWithApproval, isApproving, isBidding, isSuccess, error, gasEstimate, reset } = usePlaceBid()
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
  }, [allTokens, selectedToken])

  // Handle successful bid
  useEffect(() => {
    if (isSuccess) {
      setBidAmount('')
      console.log('✅ Bid successful! Refreshing auction data...')
      
      // Wait 2 seconds for blockchain to confirm, then refresh and reset
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
        // Reset el estado del hook para permitir otro bid
        reset()
      }, 2000)
    }
  }, [isSuccess, onSuccess, reset])

  const minPrice = useAuctionMinPrice(auctionId, selectedToken?.address || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address || !selectedToken) {
      alert('Please connect your wallet and select a token')
      return
    }

    // Check network - if wrong network, switch instead of submitting
    if (!isCorrectNetwork) {
      await switchToPaymentNetwork()
      return
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

      // Obtener valueInUSD y signature del relayer
      setIsLoadingSignature(true)
      const signResponse = await fetch('/api/sign-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          bidder: address,
          tokenAddress: selectedToken.address,
          amount: amountInWei.toString(),
        }),
      })

      if (!signResponse.ok) {
        const error = await signResponse.json()
        alert(`Failed to sign bid: ${error.error || 'Unknown error'}`)
        setIsLoadingSignature(false)
        return
      }

      setIsLoadingSignature(false)

      const signData = await signResponse.json()
      const valueInUSD = BigInt(signData.data.valueInUSD)
      const signature = signData.data.signature as `0x${string}`

      await placeBidWithApproval(
        auctionId,
        selectedToken.address,
        amountInWei,
        valueInUSD,
        signature,
        address
      )
      // El useEffect se encarga de limpiar el form y llamar onSuccess
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
    <Card className="bg-transparent border-0 shadow-none p-0">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          {/* Token Selector and Amount Input - Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Token Selector */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Payment Token
              </label>
              <div className="grid grid-cols-3 gap-1.5 md:gap-2">
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
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  disabled={isApproving || isBidding}
                />
                <div className="absolute right-2 md:right-3 top-2.5 md:top-3 text-gray-500 font-medium text-sm md:text-base">
                  {selectedToken?.symbol || 'ETH'}
                </div>
              </div>
              {suggestedBid > 0 && (
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  Minimum: {suggestedBid.toFixed(decimalsToShow)} {selectedToken?.symbol}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs md:text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs md:text-sm text-green-800">Bid placed successfully! 🎉</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-sm md:text-base"
            size="lg"
            disabled={disabled || !isConnected || !isCorrectNetwork || isLoadingSignature || isApproving || isBidding || !bidAmount || !selectedToken}
          >
            {!isConnected && 'Connect Wallet'}
            {isConnected && !isCorrectNetwork && 'Switch to Base Sepolia'}
            {isConnected && isCorrectNetwork && isLoadingSignature && 'Getting Price...'}
            {isConnected && isCorrectNetwork && isApproving && 'Approving Token...'}
            {isConnected && isCorrectNetwork && isBidding && 'Placing Bid...'}
            {isConnected && isCorrectNetwork && !isLoadingSignature && !isApproving && !isBidding && 'Place Bid'}
          </Button>

          {/* Gas Info - Desplegable */}
          {gasEstimate && isConnected && selectedToken && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowGasInfo(!showGasInfo)}
                className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-xs md:text-sm text-gray-700"
              >
                <span className="font-medium">⚙️ Gas Info</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showGasInfo ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showGasInfo && (
                <div className="p-3 bg-blue-50 border-t border-blue-200">
                  <p className="text-[10px] md:text-xs text-blue-800">
                    💡 Gas estimado: <span className="font-mono font-semibold">~{Number(gasEstimate).toLocaleString()}</span> gas units
                  </p>
                  {selectedToken.address !== NATIVE_ETH_ADDRESS && (
                    <p className="text-[10px] md:text-xs text-green-800 mt-2">
                      ✅ Approve infinito activado - futuras pujas con este token solo necesitarán 1 confirmación
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info */}
          {!isConnected && (
            <p className="text-[10px] md:text-xs text-center text-gray-500">
              Connect your wallet to place a bid
            </p>
          )}
          {isLoadingSignature && (
            <p className="text-[10px] md:text-xs text-center text-gray-500">
              Getting token price and signature from relayer...
            </p>
          )}
          {isApproving && (
            <p className="text-[10px] md:text-xs text-center text-gray-500">
              Step 1/2: Approving {selectedToken?.symbol} for spending...
            </p>
          )}
          {isBidding && (
            <p className="text-[10px] md:text-xs text-center text-gray-500">
              Step 2/2: Submitting your bid...
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
