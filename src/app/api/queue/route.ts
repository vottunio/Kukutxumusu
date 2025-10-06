/**
 * GET /api/queue
 *
 * View pending cross-chain mint operations
 *
 * Query Parameters:
 * - status (optional): Filter by status (PENDING, PROCESSING, SUBMITTED, CONFIRMED, FAILED)
 * - limit (optional): Number of results (default 50, max 100)
 * - offset (optional): Pagination offset
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "items": [...],
 *     "total": 10,
 *     "limit": 50,
 *     "offset": 0
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MintStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const statusParam = searchParams.get('status')
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    // Validate status
    let status: MintStatus | undefined
    if (statusParam) {
      if (!Object.values(MintStatus).includes(statusParam as MintStatus)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status value', code: 'INVALID_STATUS' },
          { status: 400 }
        )
      }
      status = statusParam as MintStatus
    }

    // Validate limit
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50
    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid limit value', code: 'INVALID_LIMIT' },
        { status: 400 }
      )
    }

    // Validate offset
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid offset value', code: 'INVALID_OFFSET' },
        { status: 400 }
      )
    }

    // Build query
    const where = status ? { status } : {}

    // Get total count
    const total = await prisma.mintTransaction.count({ where })

    // Get items
    const items = await prisma.mintTransaction.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        nft: {
          select: {
            id: true,
            tokenId: true,
            name: true,
            imageHash: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        limit,
        offset,
      },
    })
  } catch (error: any) {
    console.error('Get queue error:', error)

    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
