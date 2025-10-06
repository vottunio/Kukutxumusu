/**
 * POST /api/test-signature-validation
 * 
 * Test endpoint to verify signature validation logic
 * This helps debug signature validation issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, encodePacked, keccak256 } from 'viem'
import { baseSepolia } from '@/lib/chains'
import { getTrustedSignerAddress } from '@/lib/services/signature-service'
import PaymentABI from '../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🧪 [TEST-SIGNATURE] Testing signature validation...')
    console.log('🧪 [TEST-SIGNATURE] Input data:', body)

    // Extract data from request
    const {
      auctionId,
      bidder,
      tokenAddress,
      amount,
      valueInUSD,
      timestamp,
      signature
    } = body

    // Create public client
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    })

    // Get trusted signer from contract
    const contractTrustedSigner = await publicClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'trustedSigner',
    }) as `0x${string}`

    console.log('🧪 [TEST-SIGNATURE] Contract trusted signer:', contractTrustedSigner)

    // Generate message hash (same as backend)
    const encoded = encodePacked(
      ['uint256', 'address', 'address', 'uint256', 'uint256', 'uint256'],
      [
        BigInt(auctionId),
        bidder,
        tokenAddress,
        BigInt(amount),
        BigInt(valueInUSD),
        BigInt(timestamp),
      ]
    )

    const messageHash = keccak256(encoded)
    console.log('🧪 [TEST-SIGNATURE] Generated message hash:', messageHash)

    // Try to simulate what the contract does
    // Note: This is a simplified version - the actual contract might do things differently
    try {
      // Read the contract's signature verification logic if available
      // For now, we'll just validate the format and compare addresses
      
      const validationResult = {
        signatureFormat: {
          length: signature.length,
          startsWith0x: signature.startsWith('0x'),
          isValidLength: signature.length === 132,
          isHex: /^0x[0-9a-fA-F]+$/.test(signature)
        },
        addresses: {
          backendTrustedSigner: getTrustedSignerAddress(),
          contractTrustedSigner,
          match: getTrustedSignerAddress().toLowerCase() === contractTrustedSigner.toLowerCase()
        },
        messageHash,
        encodedData: encoded,
        inputData: {
          auctionId: Number(auctionId),
          bidder,
          tokenAddress,
          amount,
          valueInUSD,
          timestamp: Number(timestamp)
        }
      }

      console.log('🧪 [TEST-SIGNATURE] Validation result:', validationResult)

      return NextResponse.json({
        success: true,
        validation: validationResult,
        recommendations: [
          validationResult.signatureFormat.isValidLength ? '✅ Signature format is valid' : '❌ Signature format is invalid',
          validationResult.addresses.match ? '✅ Trusted signers match' : '❌ Trusted signers do not match',
          validationResult.signatureFormat.isHex ? '✅ Signature is valid hex' : '❌ Signature contains invalid characters'
        ]
      })

    } catch (contractError) {
      console.error('🧪 [TEST-SIGNATURE] Contract error:', contractError)
      
      return NextResponse.json({
        success: false,
        error: 'Error reading from contract',
        details: contractError instanceof Error ? contractError.message : 'Unknown error',
        validation: {
          messageHash,
          encodedData: encoded,
          contractTrustedSigner,
          backendTrustedSigner: getTrustedSignerAddress()
        }
      })
    }

  } catch (error: any) {
    console.error('❌ [TEST-SIGNATURE] Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
