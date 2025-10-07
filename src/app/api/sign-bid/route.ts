/**
 * POST /api/sign-bid
 *
 * Proxy endpoint that forwards bid signing requests to the worker service
 *
 * Request body:
 * {
 *   "auctionId": 1,
 *   "bidder": "0x...",
 *   "tokenAddress": "0x...",
 *   "amount": "1000000000000000000"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "valueInUSD": "3500000000000000000",
 *     "signature": "0x...",
 *     "timestamp": 1234567890,
 *     "pricePerToken": 3500.00,
 *     "expiresAt": 1234568190
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🔷 [SIGN-BID PROXY] Forwarding request to worker...')

    // Forward request to worker service
    const response = await fetch(`${WORKER_URL}/sign-bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [SIGN-BID PROXY] Worker error:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [SIGN-BID PROXY] Success')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ [SIGN-BID PROXY] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to worker service',
        code: 'WORKER_UNAVAILABLE',
      },
      { status: 503 }
    )
  }
}
