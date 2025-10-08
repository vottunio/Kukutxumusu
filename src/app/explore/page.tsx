'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Filter } from 'lucide-react'

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{ trait_type: string; value: string }>
}

interface NFT {
  tokenId: string
  owner: string
  metadata: NFTMetadata
}

export default function ExplorePage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAttribute, setSelectedAttribute] = useState<string>('')

  useEffect(() => {
    fetchNFTs()
  }, [])

  const fetchNFTs = async () => {
    try {
      const res = await fetch('/api/nfts')
      const data = await res.json()
      if (data.success && data.data?.nfts) {
        setNfts(data.data.nfts)
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Extract all unique attributes
  const allAttributes = (nfts || []).reduce((acc, nft) => {
    if (nft?.metadata?.attributes) {
      nft.metadata.attributes.forEach(attr => {
        if (!acc.includes(attr.trait_type)) {
          acc.push(attr.trait_type)
        }
      })
    }
    return acc
  }, [] as string[])

  // Filter NFTs
  const filteredNFTs = (nfts || []).filter(nft => {
    if (!nft) return false

    const matchesSearch = nft.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          nft.tokenId?.includes(searchTerm) ||
                          nft.owner?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAttribute = !selectedAttribute ||
                            nft.metadata?.attributes?.some(attr => attr.trait_type === selectedAttribute)

    return matchesSearch && matchesAttribute
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Explore NFTs
          </h1>
          <p className="text-xl text-gray-600">
            Browse all minted NFTs from Story Protocol
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, token ID, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Attribute Filter */}
          {allAttributes.length > 0 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedAttribute}
                onChange={(e) => setSelectedAttribute(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="">All Attributes</option>
                {allAttributes.map(attr => (
                  <option key={attr} value={attr}>{attr}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* NFT Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-500 text-center">Loading NFTs...</p>
            </div>
          ) : filteredNFTs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-500 text-center">
                {nfts.length === 0 ? 'No NFTs minted yet. Check back soon!' : 'No NFTs match your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNFTs.map((nft) => (
                <NFTCard key={nft.tokenId} nft={nft} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function NFTCard({ nft }: { nft: NFT }) {
  // Convert IPFS URI to HTTP gateway URL if needed
  let imageUrl = nft.metadata.image
  if (imageUrl && imageUrl.startsWith('ipfs://')) {
    imageUrl = imageUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative w-full h-64 bg-gray-100">
        <Image
          src={imageUrl}
          alt={nft.metadata.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
          {nft.metadata.name}
        </h3>

        {nft.metadata.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {nft.metadata.description}
          </p>
        )}

        {/* Token ID */}
        <div className="mb-3 text-xs text-gray-500">
          Token ID: {nft.tokenId}
        </div>

        {/* Owner */}
        <div className="mb-3 text-xs text-gray-500 truncate">
          Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
        </div>

        {/* Attributes */}
        {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {nft.metadata.attributes.slice(0, 3).map((attr, idx) => (
              <span
                key={idx}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
              >
                {attr.trait_type}: {attr.value}
              </span>
            ))}
            {nft.metadata.attributes.length > 3 && (
              <span className="text-xs text-gray-500">
                +{nft.metadata.attributes.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
