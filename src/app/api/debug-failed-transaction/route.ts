/**
 * POST /api/debug-failed-transaction
 * 
 * Debug endpoint specifically for the failed transaction
 * Uses the exact data from the failed transaction to test signature validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, encodePacked, keccak256 } from 'viem'
import { baseSepolia } from '@/lib/chains'
import { getTrustedSignerAddress } from '@/lib/services/signature-service'
import PaymentABI from '../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG-FAILED-TX] Debugging failed transaction...')

    // Exact data from the failed transaction
    const failedTxData = {
      auctionId: 1,
      bidder: '0x090378a9c80c5E1Ced85e56B2128c1e514E75357' as `0x${string}`,
      tokenAddress: '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E' as `0x${string}`,
      amount: '50000000000000000000', // 50 VTN
      valueInUSD: '204421336951692832',
      timestamp: 1759743354,
      signature: '0xf94f6d507c774d7be083996d9f571961847d20edeba302896b41f4e0160f9512795988b02688abdce7b6a2fe180f9f56890f0e1cf7ab6c6c4ea9fa14fbfedf7d1b'
    }

    console.log('🔍 [DEBUG-FAILED-TX] Failed transaction data:', failedTxData)

    // Create public client
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    })

    // Get contract information
    const contractTrustedSigner = await publicClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'trustedSigner',
    }) as `0x${string}`

    console.log('🔍 [DEBUG-FAILED-TX] Contract trusted signer:', contractTrustedSigner)

    // Generate message hash using the same method as the backend
    const encoded = encodePacked(
      ['uint256', 'address', 'address', 'uint256', 'uint256', 'uint256'],
      [
        BigInt(failedTxData.auctionId),
        failedTxData.bidder,
        failedTxData.tokenAddress,
        BigInt(failedTxData.amount),
        BigInt(failedTxData.valueInUSD),
        BigInt(failedTxData.timestamp),
      ]
    )

    const messageHash = keccak256(encoded)
    console.log('🔍 [DEBUG-FAILED-TX] Generated message hash:', messageHash)

    // Try to call the contract's placeBid function with the exact same data
    // This will help us see what error the contract throws
    try {
      console.log('🔍 [DEBUG-FAILED-TX] Attempting to simulate placeBid call...')
      
      // Note: This is a simulation - we're not actually calling the function
      // but we can prepare the data exactly as it would be sent
      const callData = {
        auctionId: BigInt(failedTxData.auctionId),
        paymentToken: failedTxData.tokenAddress,
        amount: BigInt(failedTxData.amount),
        valueInUSD: BigInt(failedTxData.valueInUSD),
        signature: failedTxData.signature as `0x${string}`
      }

      console.log('🔍 [DEBUG-FAILED-TX] Call data prepared:', callData)

      // Check if the auction exists and is active
      try {
        const auctionData = await publicClient.readContract({
          address: PAYMENT_CONTRACT_ADDRESS,
          abi: PaymentABI,
          functionName: 'auctions',
          args: [BigInt(failedTxData.auctionId)]
        })
        
        console.log('🔍 [DEBUG-FAILED-TX] Auction data:', auctionData)
      } catch (auctionError) {
        console.log('🔍 [DEBUG-FAILED-TX] Error reading auction data:', auctionError)
      }

      // Check if the token is allowed for this auction
      try {
        const isTokenAllowed = await publicClient.readContract({
          address: PAYMENT_CONTRACT_ADDRESS,
          abi: PaymentABI,
          functionName: 'isTokenAllowedForAuction',
          args: [BigInt(failedTxData.auctionId), failedTxData.tokenAddress]
        })
        
        console.log('🔍 [DEBUG-FAILED-TX] Is token allowed:', isTokenAllowed)
      } catch (tokenError) {
        console.log('🔍 [DEBUG-FAILED-TX] Error checking token allowance:', tokenError)
      }

    } catch (simulationError) {
      console.log('🔍 [DEBUG-FAILED-TX] Simulation error:', simulationError)
    }

    // Analyze the signature
    const signatureAnalysis = {
      length: failedTxData.signature.length,
      startsWith0x: failedTxData.signature.startsWith('0x'),
      isValidLength: failedTxData.signature.length === 132,
      isHex: /^0x[0-9a-fA-F]+$/.test(failedTxData.signature),
      r: failedTxData.signature.slice(2, 66),
      s: failedTxData.signature.slice(66, 130),
      v: failedTxData.signature.slice(130, 132)
    }

    console.log('🔍 [DEBUG-FAILED-TX] Signature analysis:', signatureAnalysis)

    return NextResponse.json({
      success: true,
      debug: {
        failedTransactionData: failedTxData,
        contractInfo: {
          trustedSigner: contractTrustedSigner,
          backendTrustedSigner: getTrustedSignerAddress(),
          addressesMatch: contractTrustedSigner.toLowerCase() === getTrustedSignerAddress().toLowerCase()
        },
        messageHash: {
          generated: messageHash,
          encoded: encoded
        },
        signatureAnalysis,
        recommendations: [
          signatureAnalysis.isValidLength ? '✅ Signature format is valid' : '❌ Signature format is invalid',
          signatureAnalysis.isHex ? '✅ Signature is valid hex' : '❌ Signature contains invalid characters',
          contractTrustedSigner.toLowerCase() === getTrustedSignerAddress().toLowerCase() ? '✅ Trusted signers match' : '❌ Trusted signers do not match'
        ]
      }
    })

  } catch (error: any) {
    console.error('❌ [DEBUG-FAILED-TX] Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
