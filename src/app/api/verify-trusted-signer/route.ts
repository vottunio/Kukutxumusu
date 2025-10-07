/**
 * GET /api/verify-trusted-signer
 * 
 * Verifica que el trusted signer configurado en el backend
 * coincida con el configurado en el contrato
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTrustedSignerAddress } from '@/lib/services/signature-service'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from '@/lib/chains'
import PaymentABI from '../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 [VERIFY-TRUSTED-SIGNER] Checking trusted signer configuration...')

    // Get trusted signer from backend
    const backendTrustedSigner = getTrustedSignerAddress()
    console.log('🔍 [VERIFY-TRUSTED-SIGNER] Backend trusted signer:', backendTrustedSigner)

    // Create public client to read from contract
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    })

    // Read trusted signer from contract
    const contractTrustedSigner = await publicClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'trustedSigner',
    }) as `0x${string}`

    console.log('🔍 [VERIFY-TRUSTED-SIGNER] Contract trusted signer:', contractTrustedSigner)

    // Compare addresses
    const addressesMatch = backendTrustedSigner.toLowerCase() === contractTrustedSigner.toLowerCase()

    console.log('🔍 [VERIFY-TRUSTED-SIGNER] Addresses match:', addressesMatch)

    return NextResponse.json({
      success: true,
      verification: {
        backendTrustedSigner,
        contractTrustedSigner,
        addressesMatch,
        contractAddress: PAYMENT_CONTRACT_ADDRESS,
        network: 'Base Sepolia',
        timestamp: new Date().toISOString(),
      },
      status: addressesMatch ? 'OK' : 'MISMATCH',
      recommendation: addressesMatch 
        ? 'Configuration is correct'
        : 'Update contract trusted signer to match backend configuration'
    })

  } catch (error: any) {
    console.error('❌ [VERIFY-TRUSTED-SIGNER] Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      verification: {
        backendTrustedSigner: getTrustedSignerAddress(),
        contractTrustedSigner: 'Error reading from contract',
        addressesMatch: false,
        contractAddress: PAYMENT_CONTRACT_ADDRESS,
        timestamp: new Date().toISOString(),
      },
    }, { status: 500 })
  }
}
