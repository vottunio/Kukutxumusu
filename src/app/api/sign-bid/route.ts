/**
 * POST /api/sign-bid
 *
 * Signs bid data with price verification for on-chain auction bidding
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
import { isAddress, type Address } from 'viem'
import { calculateUSDValue } from '@/lib/services/price-oracle'
import { signBidData } from '@/lib/services/signature-service'

interface SignBidRequest {
  auctionId: number
  bidder: string
  tokenAddress: string
  amount: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SignBidRequest

    console.log('🔷 [SIGN-BID] Request received:', {
      auctionId: body.auctionId,
      bidder: body.bidder,
      tokenAddress: body.tokenAddress,
      amount: body.amount
    })

    // Validate request
    if (!body.auctionId || typeof body.auctionId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid auction ID', code: 'INVALID_AUCTION_ID' },
        { status: 400 }
      )
    }

    if (!body.bidder || !isAddress(body.bidder)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bidder address', code: 'INVALID_BIDDER' },
        { status: 400 }
      )
    }

    if (!body.tokenAddress || !isAddress(body.tokenAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token address', code: 'INVALID_TOKEN' },
        { status: 400 }
      )
    }

    if (!body.amount || BigInt(body.amount) <= 0n) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than zero', code: 'INVALID_AMOUNT' },
        { status: 400 }
      )
    }

    // Calculate USD value based on current price
    console.log('💰 [SIGN-BID] Fetching price for token:', body.tokenAddress)
    const { valueInUSD, pricePerToken } = await calculateUSDValue(
      body.tokenAddress,
      body.amount
    )
    console.log('💰 [SIGN-BID] Price data:', { pricePerToken, valueInUSD: valueInUSD.toString() })

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000)
    const expiresAt = timestamp + 300 // Signature valid for 5 minutes

    // Sign the bid data
    console.log('✍️ [SIGN-BID] Signing bid data...')
    console.log('✍️ [SIGN-BID] Bid data to sign:', {
      auctionId: body.auctionId,
      bidder: body.bidder,
      tokenAddress: body.tokenAddress,
      amount: body.amount,
      valueInUSD: valueInUSD.toString(),
      timestamp,
    })
    
    const signedData = await signBidData({
      auctionId: body.auctionId,
      bidder: body.bidder as Address,
      tokenAddress: body.tokenAddress as Address,
      amount: BigInt(body.amount),
      valueInUSD,
      timestamp,
    })
    
    console.log('✅ [SIGN-BID] Signature generated successfully')
    console.log('✅ [SIGN-BID] Final signature:', signedData.signature)
    console.log('✅ [SIGN-BID] Message hash:', signedData.messageHash)

    console.log('📤 [SIGN-BID] Sending response')
    return NextResponse.json({
      success: true,
      data: {
        tokenAddress: body.tokenAddress,
        amount: body.amount,
        valueInUSD: valueInUSD.toString(),
        signature: signedData.signature,
        timestamp,
        pricePerToken,
        expiresAt,
      },
    })
  } catch (error: any) {
    console.error('Sign bid error:', error)

    // Handle specific errors
    if (error.message?.includes('not supported')) {
      return NextResponse.json(
        { success: false, error: 'Token not supported', code: 'INVALID_TOKEN' },
        { status: 400 }
      )
    }

    if (error.message?.includes('CoinGecko') || error.message?.includes('Price')) {
      return NextResponse.json(
        { success: false, error: 'Unable to fetch price from all sources', code: 'PRICE_UNAVAILABLE' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
