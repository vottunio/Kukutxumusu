'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseSepolia } from '@/lib/chains'
import PaymentABI from '../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`
const NATIVE_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const

// Tokens disponibles - TODO: Agregar direcciones reales de VTN y USDT
const AVAILABLE_TOKENS = [
  { address: NATIVE_ETH, symbol: 'ETH', decimals: 18, coingeckoId: 'ethereum' },
  // { address: '0x...', symbol: 'VTN', decimals: 18, coingeckoId: 'valtoken' },
  // { address: '0x...', symbol: 'USDT', decimals: 6, coingeckoId: 'tether' },
]

// CoinGecko API para obtener precios
async function getTokenPrices(tokenIds: string[]): Promise<{ [key: string]: number }> {
  try {
    const ids = tokenIds.join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    )
    const data = await response.json()
    const prices: { [key: string]: number } = {}
    for (const id of tokenIds) {
      prices[id] = data[id]?.usd || 0
    }
    return prices
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return {}
  }
}

export function CreateAuctionForm() {
  const { address, isConnected } = useWallet()

  // Form state
  const [nftContract, setNftContract] = useState('')
  const [nftId, setNftId] = useState('')
  const [duration, setDuration] = useState('24') // horas
  const [baseUsdtPrice, setBaseUsdtPrice] = useState('100') // Precio base en USDT
  const [selectedTokens, setSelectedTokens] = useState<string[]>([NATIVE_ETH])
  const [discounts, setDiscounts] = useState<{ [key: string]: string }>({
    [NATIVE_ETH]: '0', // % descuento por token
  })
  const [minPrices, setMinPrices] = useState<{ [key: string]: string }>({
    [NATIVE_ETH]: '0.01',
  })
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: number }>({})
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [antiSnipingExtension, setAntiSnipingExtension] = useState('10') // minutos
  const [antiSnipingTrigger, setAntiSnipingTrigger] = useState('5') // minutos

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleTokenToggle = (tokenAddress: string) => {
    if (selectedTokens.includes(tokenAddress)) {
      setSelectedTokens(selectedTokens.filter(t => t !== tokenAddress))
      const newPrices = { ...minPrices }
      const newDiscounts = { ...discounts }
      delete newPrices[tokenAddress]
      delete newDiscounts[tokenAddress]
      setMinPrices(newPrices)
      setDiscounts(newDiscounts)
    } else {
      setSelectedTokens([...selectedTokens, tokenAddress])
      setMinPrices({ ...minPrices, [tokenAddress]: '0.01' })
      setDiscounts({ ...discounts, [tokenAddress]: '0' })
    }
  }

  const handleDiscountChange = (tokenAddress: string, value: string) => {
    setDiscounts({ ...discounts, [tokenAddress]: value })
  }

  // Calcular precios automáticamente cuando cambia el precio base USDT o descuentos
  const calculatePrices = async () => {
    if (!baseUsdtPrice || selectedTokens.length === 0) return

    setIsLoadingPrices(true)
    try {
      // Obtener IDs de CoinGecko de los tokens seleccionados
      const tokenIds = selectedTokens
        .map(addr => AVAILABLE_TOKENS.find(t => t.address === addr)?.coingeckoId)
        .filter(Boolean) as string[]

      // Obtener precios actuales
      const prices = await getTokenPrices(tokenIds)
      setTokenPrices(prices)

      // Calcular minPrices con descuentos
      const newMinPrices: { [key: string]: string } = {}

      selectedTokens.forEach(tokenAddress => {
        const token = AVAILABLE_TOKENS.find(t => t.address === tokenAddress)
        if (!token) return

        const tokenPrice = prices[token.coingeckoId] || 0
        if (tokenPrice === 0) {
          newMinPrices[tokenAddress] = '0'
          return
        }

        // Aplicar descuento
        const discount = parseFloat(discounts[tokenAddress] || '0')
        const priceAfterDiscount = parseFloat(baseUsdtPrice) * (1 - discount / 100)

        // Convertir USD a tokens
        const tokenAmount = priceAfterDiscount / tokenPrice

        // Formatear según decimales del token
        newMinPrices[tokenAddress] = tokenAmount.toFixed(token.decimals === 6 ? 2 : 6)
      })

      setMinPrices(newMinPrices)
    } catch (error) {
      console.error('Error calculating prices:', error)
    } finally {
      setIsLoadingPrices(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      alert('Please connect your wallet')
      return
    }

    if (!nftContract || !nftId || selectedTokens.length === 0) {
      alert('Please fill all required fields')
      return
    }

    try {
      // Convertir duración de horas a segundos
      const durationInSeconds = BigInt(Number(duration) * 3600)

      // Convertir precios mínimos a wei (18 decimals)
      const minPricesArray = selectedTokens.map(token => {
        const price = minPrices[token] || '0'
        return BigInt(Math.floor(parseFloat(price) * 1e18))
      })

      // Convertir descuentos a basis points (100 = 1%)
      const discountsArray = selectedTokens.map(token => {
        const discount = discounts[token] || '0'
        return BigInt(Math.floor(parseFloat(discount) * 100))
      })

      // Convertir anti-sniping de minutos a segundos
      const extensionInSeconds = BigInt(Number(antiSnipingExtension) * 60)
      const triggerInSeconds = BigInt(Number(antiSnipingTrigger) * 60)

      writeContract({
        address: PAYMENT_CONTRACT_ADDRESS,
        abi: PaymentABI,
        functionName: 'createAuction',
        args: [
          nftContract as `0x${string}`,
          BigInt(nftId),
          BigInt(0), // startTime (0 = immediate)
          durationInSeconds,
          selectedTokens as `0x${string}`[],
          minPricesArray,
          discountsArray,
          extensionInSeconds,
          triggerInSeconds,
        ],
        chainId: baseSepolia.id,
      })
    } catch (err: any) {
      console.error('Error creating auction:', err)
      alert(err.message || 'Error creating auction')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Auction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NFT Contract Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NFT Contract Address *
            </label>
            <input
              type="text"
              value={nftContract}
              onChange={(e) => setNftContract(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Contract address of the NFT on Story Protocol
            </p>
          </div>

          {/* NFT ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NFT Token ID *
            </label>
            <input
              type="number"
              value={nftId}
              onChange={(e) => setNftId(e.target.value)}
              placeholder="1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auction Duration (hours) *
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="24"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          {/* Base USDT Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price (USDT) *
            </label>
            <input
              type="number"
              step="0.01"
              value={baseUsdtPrice}
              onChange={(e) => setBaseUsdtPrice(e.target.value)}
              placeholder="100"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Base price in USDT. Discounts will be applied per token.
            </p>
          </div>

          {/* Allowed Tokens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Allowed Payment Tokens *
              </label>
              <Button
                type="button"
                onClick={calculatePrices}
                disabled={isLoadingPrices || !baseUsdtPrice || selectedTokens.length === 0}
                size="sm"
                variant="outline"
              >
                {isLoadingPrices ? 'Calculating...' : 'Calculate Prices'}
              </Button>
            </div>
            <div className="space-y-3">
              {AVAILABLE_TOKENS.map((token) => (
                <div key={token.address} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTokens.includes(token.address)}
                        onChange={() => handleTokenToggle(token.address)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="font-medium">{token.symbol}</span>
                    </label>
                    {tokenPrices[token.coingeckoId] && (
                      <span className="text-xs text-gray-500">
                        ${tokenPrices[token.coingeckoId].toFixed(2)}
                      </span>
                    )}
                  </div>

                  {selectedTokens.includes(token.address) && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={discounts[token.address] || '0'}
                          onChange={(e) => handleDiscountChange(token.address, e.target.value)}
                          placeholder="0"
                          min="0"
                          max="100"
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Minimum Price ({token.symbol})
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={minPrices[token.address] || ''}
                          readOnly
                          placeholder="Click 'Calculate Prices'"
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                        />
                        {discounts[token.address] && parseFloat(discounts[token.address]) > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            {discounts[token.address]}% discount applied
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Anti-Sniping Settings */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Anti-Sniping Protection
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Extension Time (minutes)
                </label>
                <input
                  type="number"
                  value={antiSnipingExtension}
                  onChange={(e) => setAntiSnipingExtension(e.target.value)}
                  placeholder="10"
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long to extend auction
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Trigger Window (minutes)
                </label>
                <input
                  type="number"
                  value={antiSnipingTrigger}
                  onChange={(e) => setAntiSnipingTrigger(e.target.value)}
                  placeholder="5"
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bids in last X minutes trigger extension
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error.message}</p>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">Auction created successfully! 🎉</p>
              {hash && (
                <a
                  href={`https://basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline mt-1 block"
                >
                  View on Basescan →
                </a>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isConnected || isPending || isConfirming}
          >
            {!isConnected && 'Connect Wallet'}
            {isConnected && isPending && 'Confirming...'}
            {isConnected && isConfirming && 'Creating Auction...'}
            {isConnected && !isPending && !isConfirming && 'Create Auction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
