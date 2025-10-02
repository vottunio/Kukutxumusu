'use client'

import { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseMainnet } from '@/lib/chains'
import PaymentABI from '../../../contracts/abis/KukuxumusuPayment_ABI.json'
import Image from 'next/image'
import { getTokenArray, type NetworkMode } from '@/lib/tokens'

const PAYMENT_CONTRACT_ADDRESS = '0x8CDaEfE1079125A5BBCD5A75B977aC262C65413B' as const
const NFT_CONTRACT_ADDRESS = '0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7' as const

export function CreateNFTAuctionForm() {
  const { address, isConnected } = useWallet()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Network mode
  const [networkMode, setNetworkMode] = useState<NetworkMode>('testnet')
  const availableTokens = getTokenArray(networkMode)

  // Step 1: NFT Metadata
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nftName, setNftName] = useState('')
  const [nftDescription, setNftDescription] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [attributes, setAttributes] = useState<{ trait_type: string; value: string }[]>([
    { trait_type: '', value: '' },
  ])

  // Step 2: Auction Settings
  const [startTime, setStartTime] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [duration, setDuration] = useState('24')
  const [selectedTokens, setSelectedTokens] = useState<string[]>([availableTokens[0].address])
  const [minPrices, setMinPrices] = useState<{ [key: string]: string }>({
    [availableTokens[0].address]: '0.01',
  })
  const [antiSnipingExtension, setAntiSnipingExtension] = useState('10')
  const [antiSnipingTrigger, setAntiSnipingTrigger] = useState('5')

  // Upload & Transaction state
  const [currentStep, setCurrentStep] = useState<'form' | 'uploading' | 'creating'>('form')
  const [uploadedImageHash, setUploadedImageHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { writeContract, data: hash, isPending, error: txError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG or JPG)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setImageFile(file)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }])
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...attributes]
    newAttributes[index][field] = value
    setAttributes(newAttributes)
  }

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

  const uploadImageToPinata = async (): Promise<string> => {
    if (!imageFile) throw new Error('No image file selected')

    setCurrentStep('uploading')

    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload image')
    }

    const data = await response.json()
    return data.ipfsHash
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      setError('Please connect your wallet')
      return
    }

    if (!imageFile || !nftName || selectedTokens.length === 0) {
      setError('Please fill all required fields')
      return
    }

    try {
      setError(null)

      // Step 1: Upload image to Pinata
      const imageHash = await uploadImageToPinata()
      setUploadedImageHash(imageHash)

      // Step 2: Call backend API to save NFT data and get assigned tokenId
      const nftResponse = await fetch('/api/admin/create-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageHash,
          name: nftName,
          description: nftDescription,
          collection: collectionName || 'Default',
          attributes: attributes.filter(attr => attr.trait_type && attr.value),
        }),
      })

      if (!nftResponse.ok) {
        const error = await nftResponse.json()
        throw new Error(error.error || 'Failed to create NFT')
      }

      const { tokenId: assignedId, nftId } = await nftResponse.json()
      console.log('NFT created in database with tokenId:', assignedId, 'nftId:', nftId)

      // Step 3: Create auction on Base
      setCurrentStep('creating')

      // Calculate start time
      let startTimeTimestamp = BigInt(Math.floor(Date.now() / 1000))
      if (startTime === 'scheduled' && scheduledDate) {
        startTimeTimestamp = BigInt(Math.floor(new Date(scheduledDate).getTime() / 1000))
      }

      const durationInSeconds = BigInt(Number(duration) * 3600)
      const minPricesArray = selectedTokens.map(token => {
        const price = minPrices[token] || '0'
        return BigInt(Math.floor(parseFloat(price) * 1e18))
      })
      const extensionInSeconds = BigInt(Number(antiSnipingExtension) * 60)
      const triggerInSeconds = BigInt(Number(antiSnipingTrigger) * 60)

      writeContract({
        address: PAYMENT_CONTRACT_ADDRESS,
        abi: PaymentABI,
        functionName: 'createAuction',
        args: [
          NFT_CONTRACT_ADDRESS,
          BigInt(assignedId),
          startTimeTimestamp,
          durationInSeconds,
          selectedTokens as `0x${string}`[],
          minPricesArray,
          extensionInSeconds,
          triggerInSeconds,
        ],
        chainId: baseMainnet.id,
      })
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error creating NFT auction')
      setCurrentStep('form')
    }
  }

  const resetForm = () => {
    setImageFile(null)
    setImagePreview(null)
    setNftName('')
    setNftDescription('')
    setCollectionName('')
    setAttributes([{ trait_type: '', value: '' }])
    setDuration('24')
    setStartTime('now')
    setScheduledDate('')
    setUploadedImageHash(null)
    setCurrentStep('form')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create NFT & Auction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: NFT METADATA */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: NFT Metadata
            </h3>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NFT Image * (PNG/JPG, max 10MB)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative w-48 h-48 mx-auto">
                      <Image
                        src={imagePreview}
                        alt="NFT Preview"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer block text-center py-8">
                    <div className="text-gray-600">
                      <p className="font-medium">Click to upload image</p>
                      <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Collection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection (optional)
              </label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Summer 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* NFT Name */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NFT Name *
              </label>
              <input
                type="text"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                placeholder="Kukuxumusu #1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                placeholder="Description of your NFT..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* Attributes */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attributes (Optional)
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                >
                  + Add
                </Button>
              </div>
              <div className="space-y-2">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={attr.trait_type}
                      onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                      placeholder="Trait"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600"
                    />
                    {attributes.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttribute(index)}
                        className="text-red-600"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: AUCTION SETTINGS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step 2: Auction Settings
            </h3>

            {/* Start Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="now"
                    checked={startTime === 'now'}
                    onChange={(e) => setStartTime(e.target.value as 'now')}
                    className="w-4 h-4"
                  />
                  <span>Start immediately</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={startTime === 'scheduled'}
                    onChange={(e) => setStartTime(e.target.value as 'scheduled')}
                    className="w-4 h-4"
                  />
                  <span>Schedule for later</span>
                </label>
                {startTime === 'scheduled' && (
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-4">
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

            {/* Network Mode Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network Mode *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="testnet"
                    checked={networkMode === 'testnet'}
                    onChange={(e) => setNetworkMode(e.target.value as NetworkMode)}
                    className="w-4 h-4"
                  />
                  <span>Testnet (Base Sepolia)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="mainnet"
                    checked={networkMode === 'mainnet'}
                    onChange={(e) => setNetworkMode(e.target.value as NetworkMode)}
                    className="w-4 h-4"
                  />
                  <span>Mainnet (Base)</span>
                </label>
              </div>
            </div>

            {/* Allowed Tokens & Min Prices */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Payment Tokens *
              </label>
              <div className="space-y-2">
                {availableTokens.map((token) => (
                  <div key={token.address} className="border rounded-lg p-3">
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedTokens.includes(token.address)}
                        onChange={() => handleTokenToggle(token.address)}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{token.symbol}</span>
                    </label>
                    {selectedTokens.includes(token.address) && (
                      <input
                        type="number"
                        step="0.0001"
                        value={minPrices[token.address] || ''}
                        onChange={(e) => handleMinPriceChange(token.address, e.target.value)}
                        placeholder="0.01"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Sniping */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Extension (minutes)
                </label>
                <input
                  type="number"
                  value={antiSnipingExtension}
                  onChange={(e) => setAntiSnipingExtension(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Trigger (minutes)
                </label>
                <input
                  type="number"
                  value={antiSnipingTrigger}
                  onChange={(e) => setAntiSnipingTrigger(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Progress/Status */}
          {uploadedImageHash && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Image uploaded: {uploadedImageHash.slice(0, 20)}...
              </p>
            </div>
          )}

          {/* Error */}
          {(error || txError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error || txError?.message}</p>
            </div>
          )}

          {/* Success */}
          {isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800">
                NFT & Auction created successfully! 🎉
              </p>
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="mt-3"
              >
                Create Another
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isConnected || currentStep !== 'form' || isPending || isConfirming}
          >
            {!isConnected && 'Connect Wallet'}
            {isConnected && currentStep === 'uploading' && 'Uploading to IPFS...'}
            {isConnected && currentStep === 'creating' && 'Creating Auction...'}
            {isConnected && isPending && 'Confirming Transaction...'}
            {isConnected && isConfirming && 'Waiting for Confirmation...'}
            {isConnected && currentStep === 'form' && !isPending && !isConfirming && 'Create NFT & Auction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
