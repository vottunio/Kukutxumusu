import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { storyTestnet } from '@/lib/chains'
import NFTFactoryABI from '../../../../contracts/abis/KukuxumusuNFT_ABI.json'

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: storyTestnet,
  transport: http(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const owner = searchParams.get('owner') // Filter by owner address

    // Get total supply of the first collection (collectionId = 0)
    // TODO: Support multiple collections
    const collectionId = BigInt(0)

    const totalSupply = await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFTFactoryABI,
      functionName: 'getCollectionSupply',
      args: [collectionId],
    }) as bigint

    const total = Number(totalSupply)

    if (total === 0) {
      return NextResponse.json({
        success: true,
        data: {
          nfts: [],
          total: 0,
          limit,
          offset,
        },
      })
    }

    // Get NFT IDs (pagination)
    const nftIds = Array.from({ length: total }, (_, i) => i).slice(offset, offset + limit)

    // Fetch NFT data for each ID
    const nftPromises = nftIds.map(async (localId) => {
      try {
        // Get global token ID
        const tokenId = await publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFTFactoryABI,
          functionName: 'getGlobalTokenId',
          args: [collectionId, BigInt(localId)],
        }) as bigint

        // Get owner
        const ownerAddress = await publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFTFactoryABI,
          functionName: 'ownerOf',
          args: [tokenId],
        }) as string

        // Filter by owner if requested
        if (owner && ownerAddress.toLowerCase() !== owner.toLowerCase()) {
          return null
        }

        // Get token URI
        const tokenURI = await publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFTFactoryABI,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string

        // Fetch metadata from IPFS
        let metadata = null
        if (tokenURI) {
          try {
            const metadataUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
            const metadataResponse = await fetch(metadataUrl)
            if (metadataResponse.ok) {
              metadata = await metadataResponse.json()
            }
          } catch (error) {
            console.error(`Error fetching metadata for token ${tokenId}:`, error)
          }
        }

        return {
          collectionId: collectionId.toString(),
          localId,
          globalTokenId: tokenId.toString(),
          owner: ownerAddress,
          tokenURI,
          metadata: metadata || {
            name: `Kukuxumusu #${localId}`,
            description: 'Metadata not available',
            image: tokenURI ? tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : null,
          },
        }
      } catch (error) {
        console.error(`Error fetching NFT ${localId}:`, error)
        return null
      }
    })

    const nfts = (await Promise.all(nftPromises)).filter(Boolean)

    return NextResponse.json({
      success: true,
      data: {
        nfts,
        total,
        filtered: nfts.length,
        limit,
        offset,
      },
    })
  } catch (error: any) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch NFTs',
      },
      { status: 500 }
    )
  }
}
