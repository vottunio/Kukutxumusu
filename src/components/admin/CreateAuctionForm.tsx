'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseMainnet } from '@/lib/chains'
import PaymentABI from '../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = '0x8CDaEfE1079125A5BBCD5A75B977aC262C65413B' as const
const NATIVE_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const

// Tokens disponibles - TODO: Agregar direcciones reales de VTN y USDT
const AVAILABLE_TOKENS = [
  { address: NATIVE_ETH, symbol: 'ETH', decimals: 18 },
  // { address: '0x...', symbol: 'VTN', decimals: 18 },
  // { address: '0x...', symbol: 'USDT', decimals: 6 },
]

export function CreateAuctionForm() {
  const { address, isConnected } = useWallet()

  // Form state
  const [nftContract, setNftContract] = useState('')
  const [nftId, setNftId] = useState('')
  const [duration, setDuration] = useState('24') // horas
  const [selectedTokens, setSelectedTokens] = useState<string[]>([NATIVE_ETH])
  const [minPrices, setMinPrices] = useState<{ [key: string]: string }>({
    [NATIVE_ETH]: '0.01',
  })
  const [antiSnipingExtension, setAntiSnipingExtension] = useState('10') // minutos
  const [antiSnipingTrigger, setAntiSnipingTrigger] = useState('5') // minutos

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleTokenToggle = (tokenAddress: string) => {
    if (selectedTokens.includes(tokenAddress)) {
      setSelectedTokens(selectedTokens.filter(t => t !== tokenAddress))
      const newPrices = { ...minPrices }
      delete newPrices[tokenAddress]
      setMinPrices(newPrices)
    } else {
      setSelectedTokens([...selectedTokens, tokenAddress])
      setMinPrices({ ...minPrices, [tokenAddress]: '0.01' })
    }
  }

  const handleMinPriceChange = (tokenAddress: string, value: string) => {
    setMinPrices({ ...minPrices, [tokenAddress]: value })
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
          durationInSeconds,
          selectedTokens as `0x${string}`[],
          minPricesArray,
          extensionInSeconds,
          triggerInSeconds,
        ],
        chainId: baseMainnet.id,
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

          {/* Allowed Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Payment Tokens *
            </label>
            <div className="space-y-3">
              {AVAILABLE_TOKENS.map((token) => (
                <div key={token.address} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTokens.includes(token.address)}
                        onChange={() => handleTokenToggle(token.address)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="font-medium">{token.symbol}</span>
                    </label>
                  </div>

                  {selectedTokens.includes(token.address) && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Minimum Price ({token.symbol})
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={minPrices[token.address] || ''}
                        onChange={(e) => handleMinPriceChange(token.address, e.target.value)}
                        placeholder="0.01"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
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
