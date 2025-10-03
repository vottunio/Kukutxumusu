import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nftId, status, errorMessage } = body

    if (!nftId || !status) {
      return NextResponse.json(
        { error: 'nftId and status are required' },
        { status: 400 }
      )
    }

    // Update NFT status
    const nft = await prisma.nFT.update({
      where: { id: nftId },
      data: {
        status,
        ...(status === 'FAILED' && errorMessage ? {
          // Store error in a metadata field or create a separate error log
          // For now we'll just update the status
        } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      nft,
    })
  } catch (error: any) {
    console.error('Error updating NFT status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
