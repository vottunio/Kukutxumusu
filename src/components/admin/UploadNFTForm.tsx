'use client'

import { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

/*interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: { trait_type: string; value: string }[]
}*/

export function UploadNFTForm() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nftName, setNftName] = useState('')
  const [nftDescription, setNftDescription] = useState('')
  const [attributes, setAttributes] = useState<{ trait_type: string; value: string }[]>([
    { trait_type: '', value: '' },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ imageUrl: string; metadataUrl: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG or JPG)')
      return
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setImageFile(file)
    setError(null)

    // Crear preview
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile || !nftName) {
      setError('Please fill all required fields')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // TODO: Implementar upload a Pinata
      // Por ahora, simular el upload

      // 1. Upload imagen a IPFS/Pinata
      const formData = new FormData()
      formData.append('file', imageFile)

      // const imageUploadResponse = await fetch('/api/upload-image', {
      //   method: 'POST',
      //   body: formData,
      // })
      // const { ipfsHash: imageHash } = await imageUploadResponse.json()

      // Simulado:
      const imageHash = 'QmSimulatedImageHash123'
      const imageUrl = `ipfs://${imageHash}`

      // 2. Crear metadata JSON
      // const metadata: NFTMetadata = {
      //   name: nftName,
      //   description: nftDescription,
      //   image: imageUrl,
      //   attributes: attributes.filter(attr => attr.trait_type && attr.value),
      // }

      // 3. Upload metadata a IPFS/Pinata
      // const metadataUploadResponse = await fetch('/api/upload-metadata', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metadata),
      // })
      // const { ipfsHash: metadataHash } = await metadataUploadResponse.json()

      // Simulado:
      const metadataHash = 'QmSimulatedMetadataHash456'
      const metadataUrl = `ipfs://${metadataHash}`

      setUploadResult({ imageUrl, metadataUrl })

      // Limpiar form
      setImageFile(null)
      setImagePreview(null)
      setNftName('')
      setNftDescription('')
      setAttributes([{ trait_type: '', value: '' }])

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Error uploading to IPFS')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload NFT to IPFS</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NFT Image * (PNG/JPG, max 10MB)
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative w-64 h-64 mx-auto">
                    <Image
                      src={imagePreview}
                      alt="NFT Preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
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
              ) : (
                <div className="space-y-2">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <label htmlFor="file-upload" className="cursor-pointer text-purple-600 hover:text-purple-500 font-medium">
                      Upload a file
                    </label>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                    <p className="mt-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* NFT Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NFT Name *
            </label>
            <input
              type="text"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              placeholder="Adarbakar #1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          {/* NFT Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={nftDescription}
              onChange={(e) => setNftDescription(e.target.value)}
              placeholder="Description of your NFT..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          {/* Attributes */}
          <div>
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
                + Add Attribute
              </Button>
            </div>

            <div className="space-y-3">
              {attributes.map((attr, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={attr.trait_type}
                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                    placeholder="Trait (e.g. Color)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    placeholder="Value (e.g. Blue)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  {attributes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttribute(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {uploadResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-green-800">Upload successful! 🎉</p>
              <div className="text-xs space-y-1">
                <p className="text-green-700">
                  <span className="font-medium">Image URL:</span> {uploadResult.imageUrl}
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Metadata URL:</span> {uploadResult.metadataUrl}
                </p>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Use the metadata URL when minting the NFT on Story Protocol
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!imageFile || !nftName || isUploading}
          >
            {isUploading ? 'Uploading to IPFS...' : 'Upload to IPFS'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            ⚠️ Note: IPFS integration is simulated. Connect Pinata API to enable real uploads.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
