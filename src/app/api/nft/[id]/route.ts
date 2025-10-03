import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenId = parseInt(params.id)

    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      )
    }

    const nft = await prisma.nFT.findUnique({
      where: { tokenId },
    })

    if (!nft) {
      return NextResponse.json(
        { error: 'NFT not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      nft: {
        tokenId: nft.tokenId,
        name: nft.name,
        description: nft.description,
        collection: nft.collection,
        imageHash: nft.imageHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${nft.imageHash}`,
        attributes: nft.attributes,
        status: nft.status,
      },
    })
  } catch (error: any) {
    console.error('Error fetching NFT:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
