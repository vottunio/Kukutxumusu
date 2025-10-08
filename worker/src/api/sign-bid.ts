/**
 * POST /sign-bid
 *
 * Signs bid data with price verification for on-chain auction bidding
 */

import { Request, Response } from 'express'
import { isAddress, type Address } from 'viem'
import { calculateUSDValue } from '../services/price-oracle'
import { signBidData } from '../services/signature-service'

interface SignBidRequest {
  auctionId: number
  bidder: string
  tokenAddress: string
  amount: string
}

export async function signBidEndpoint(req: Request, res: Response) {
  try {
    const body = req.body as SignBidRequest

    console.log('🔷 [SIGN-BID] Request received:', {
      auctionId: body.auctionId,
      bidder: body.bidder,
      tokenAddress: body.tokenAddress,
      amount: body.amount
    })

    // Validate request
    if (body.auctionId === undefined || body.auctionId === null || typeof body.auctionId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid auction ID',
        code: 'INVALID_AUCTION_ID'
      })
    }

    if (!body.bidder || !isAddress(body.bidder)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bidder address',
        code: 'INVALID_BIDDER'
      })
    }

    if (!body.tokenAddress || !isAddress(body.tokenAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address',
        code: 'INVALID_TOKEN'
      })
    }

    if (!body.amount || BigInt(body.amount) <= 0n) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than zero',
        code: 'INVALID_AMOUNT'
      })
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
    
    const signedData = await signBidData({
      auctionId: body.auctionId,
      bidder: body.bidder as Address,
      tokenAddress: body.tokenAddress as Address,
      amount: BigInt(body.amount),
      valueInUSD,
      timestamp,
    })
    
    console.log('✅ [SIGN-BID] Signature generated successfully')
    console.log('📤 [SIGN-BID] Sending response')

    return res.json({
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
    console.error('❌ [SIGN-BID] Error:', error)

    // Handle specific errors
    if (error.message?.includes('not supported')) {
      return res.status(400).json({
        success: false,
        error: 'Token not supported',
        code: 'INVALID_TOKEN'
      })
    }

    if (error.message?.includes('CoinGecko') || error.message?.includes('Price')) {
      return res.status(503).json({
        success: false,
        error: 'Unable to fetch price from all sources',
        code: 'PRICE_UNAVAILABLE'
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}
