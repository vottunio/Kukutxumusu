/**
 * GET /api/price/:token
 *
 * Get current price in USD for a specific token
 *
 * Parameters:
 * - token (path): Token symbol (ETH, VTN, USDT) or address
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "symbol": "ETH",
 *     "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
 *     "priceUSD": 3500.50,
 *     "source": "coingecko",
 *     "timestamp": 1734567890,
 *     "cachedAt": 1734567800
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTokenPrice } from '@/lib/services/price-oracle'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token parameter required', code: 'MISSING_TOKEN' },
        { status: 400 }
      )
    }

    // Get token price
    const priceData = await getTokenPrice(token)

    return NextResponse.json({
      success: true,
      data: priceData,
    })
  } catch (error: any) {
    console.error('Get price error:', error)

    if (error.message?.includes('not supported')) {
      return NextResponse.json(
        { success: false, error: 'Token not supported', code: 'INVALID_TOKEN' },
        { status: 404 }
      )
    }

    if (error.message?.includes('CoinGecko') || error.message?.includes('API')) {
      return NextResponse.json(
        { success: false, error: 'Unable to fetch price', code: 'PRICE_UNAVAILABLE' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
