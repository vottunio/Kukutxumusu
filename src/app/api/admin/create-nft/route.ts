import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { imageHash, name, description, collection, attributes } = body

    // Validation
    if (!imageHash || !name) {
      return NextResponse.json(
        { error: 'imageHash and name are required' },
        { status: 400 }
      )
    }

    // Get the next available token ID
    // Strategy: Get the highest tokenId and increment by 1
    const lastNFT = await prisma.nFT.findFirst({
      orderBy: { tokenId: 'desc' },
      select: { tokenId: true },
    })

    const nextTokenId = lastNFT ? lastNFT.tokenId + 1 : 1

    // Create NFT record in database
    const nft = await prisma.nFT.create({
      data: {
        tokenId: nextTokenId,
        name,
        description: description || '',
        collection: collection || 'Default',
        imageHash,
        attributes: attributes || [],
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      tokenId: nft.tokenId,
      nftId: nft.id,
      message: 'NFT created successfully',
    })
  } catch (error: any) {
    console.error('Error creating NFT:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
