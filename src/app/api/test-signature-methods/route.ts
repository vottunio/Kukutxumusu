/**
 * GET/POST /api/test-signature-methods
 * 
 * Test different signature methods to find the one that works
 */

import { NextRequest, NextResponse } from 'next/server'
import { signBidData } from '@/lib/services/signature-service'
import { generateAlternativeMessageHashes } from '@/lib/services/signature-service'
import { type Address } from 'viem'

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 [TEST-SIGNATURE-METHODS] GET request - Testing signature methods...')

    // Use the exact data from the failed transaction
    const testData = {
      auctionId: 1,
      bidder: '0x090378a9c80c5E1Ced85e56B2128c1e514E75357' as Address,
      tokenAddress: '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E' as Address,
      amount: 50000000000000000000n, // 50 VTN
      valueInUSD: 204421336951692832n,
      timestamp: Math.floor(Date.now() / 1000), // Use current timestamp
    }

    console.log('🧪 [TEST-SIGNATURE-METHODS] Test data:', testData)

    // Generate signature with current method
    const signedData = await signBidData(testData)
    
    // Generate alternative hashes
    const alternativeHashes = generateAlternativeMessageHashes(testData)

    console.log('🧪 [TEST-SIGNATURE-METHODS] Signature generated successfully')

    return NextResponse.json({
      success: true,
      message: 'Signature methods tested successfully',
      testResults: {
        currentMethod: {
          messageHash: signedData.messageHash,
          signature: signedData.signature,
          signatureLength: signedData.signature.length
        },
        alternativeHashes,
        testData: {
          ...testData,
          amount: testData.amount.toString(),
          valueInUSD: testData.valueInUSD.toString(),
        },
        recommendations: [
          '✅ New EIP-712 style signature generated',
          '🔄 Try bidding with this new signature method',
          '📋 If still fails, we may need to check contract source code'
        ]
      }
    })

  } catch (error: any) {
    console.error('❌ [TEST-SIGNATURE-METHODS] GET Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    console.log('🧪 [TEST-SIGNATURE-METHODS] Testing different signature methods...')

    // Use the exact data from the failed transaction
    const testData = {
      auctionId: 1,
      bidder: '0x090378a9c80c5E1Ced85e56B2128c1e514E75357' as Address,
      tokenAddress: '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E' as Address,
      amount: 50000000000000000000n, // 50 VTN
      valueInUSD: 204421336951692832n,
      timestamp: Math.floor(Date.now() / 1000), // Use current timestamp
    }

    console.log('🧪 [TEST-SIGNATURE-METHODS] Test data:', testData)

    // Generate signature with current method
    const signedData = await signBidData(testData)
    
    // Generate alternative hashes
    const alternativeHashes = generateAlternativeMessageHashes(testData)

    console.log('🧪 [TEST-SIGNATURE-METHODS] Signature generated successfully')

    return NextResponse.json({
      success: true,
      testResults: {
        currentMethod: {
          messageHash: signedData.messageHash,
          signature: signedData.signature,
          signatureLength: signedData.signature.length
        },
        alternativeHashes,
        testData: {
          ...testData,
          amount: testData.amount.toString(),
          valueInUSD: testData.valueInUSD.toString(),
        },
        recommendations: [
          '✅ Try the new EIP-712 style signature',
          '🔄 If still fails, we may need to check the contract source code',
          '📋 Compare message hashes with what the contract expects'
        ]
      }
    })

  } catch (error: any) {
    console.error('❌ [TEST-SIGNATURE-METHODS] Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
