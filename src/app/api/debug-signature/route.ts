/**
 * GET /api/debug-signature
 * 
 * Debug endpoint to verify signature configuration
 * This helps diagnose signature issues without making actual bids
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTrustedSignerAddress } from '@/lib/services/signature-service'
import { signBidData } from '@/lib/services/signature-service'
import { isAddress, type Address } from 'viem'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG-SIGNATURE] Debug request received')

    // Check if trusted signer is configured
    const trustedSignerAddress = getTrustedSignerAddress()
    console.log('🔍 [DEBUG-SIGNATURE] Trusted signer address:', trustedSignerAddress)

    // Test signature generation with dummy data
    const testData = {
      auctionId: 1,
      bidder: '0x090378a9c80c5E1Ced85e56B2128c1e514E75357' as Address,
      tokenAddress: '0x0000000000000000000000000000000000000000' as Address, // ETH
      amount: 1000000000000000000n, // 1 ETH
      valueInUSD: 3500000000000000000n, // $3500
      timestamp: Math.floor(Date.now() / 1000),
    }

    console.log('🔍 [DEBUG-SIGNATURE] Testing with dummy data:', testData)

    const signedData = await signBidData(testData)

    console.log('✅ [DEBUG-SIGNATURE] Test signature generated successfully')

    return NextResponse.json({
      success: true,
      debug: {
        trustedSignerAddress,
        testData: {
          ...testData,
          amount: testData.amount.toString(),
          valueInUSD: testData.valueInUSD.toString(),
        },
        signature: signedData.signature,
        messageHash: signedData.messageHash,
        signatureLength: signedData.signature.length,
        isValidFormat: signedData.signature.length === 132 && signedData.signature.startsWith('0x'),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('❌ [DEBUG-SIGNATURE] Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      debug: {
        trustedSignerConfigured: !!process.env.TRUSTED_SIGNER_PRIVATE_KEY,
        trustedSignerAddress: process.env.TRUSTED_SIGNER_PRIVATE_KEY ? 'Configured' : 'Not configured',
        timestamp: new Date().toISOString(),
      },
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔍 [DEBUG-SIGNATURE] POST request received:', body)

    // Validate required fields
    if (!body.auctionId || !body.bidder || !body.tokenAddress || !body.amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: auctionId, bidder, tokenAddress, amount',
      }, { status: 400 })
    }

    // Validate addresses
    if (!isAddress(body.bidder)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bidder address',
      }, { status: 400 })
    }

    if (!isAddress(body.tokenAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token address',
      }, { status: 400 })
    }

    // Generate test signature
    const testData = {
      auctionId: Number(body.auctionId),
      bidder: body.bidder as Address,
      tokenAddress: body.tokenAddress as Address,
      amount: BigInt(body.amount),
      valueInUSD: BigInt(body.valueInUSD || '3500000000000000000'), // Default $3500
      timestamp: Math.floor(Date.now() / 1000),
    }

    const signedData = await signBidData(testData)

    return NextResponse.json({
      success: true,
      signature: signedData.signature,
      messageHash: signedData.messageHash,
      testData: {
        ...testData,
        amount: testData.amount.toString(),
        valueInUSD: testData.valueInUSD.toString(),
      },
    })
  } catch (error: any) {
    console.error('❌ [DEBUG-SIGNATURE] POST Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
