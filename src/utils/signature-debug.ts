/**
 * Debug utility for signature issues
 * This helps diagnose problems with bid signatures
 */

import { encodePacked, keccak256, type Address, type Hex } from 'viem'
import { getTrustedSignerAddress } from '@/lib/services/signature-service'

export interface DebugSignatureData {
  auctionId: number
  bidder: Address
  tokenAddress: Address
  amount: bigint
  valueInUSD: bigint
  timestamp: number
}

export function debugSignatureGeneration(data: DebugSignatureData) {
  console.log('🔍 [SIGNATURE-DEBUG] Input data:', {
    auctionId: data.auctionId,
    bidder: data.bidder,
    tokenAddress: data.tokenAddress,
    amount: data.amount.toString(),
    valueInUSD: data.valueInUSD.toString(),
    timestamp: data.timestamp,
  })

  // Generate the same hash as the signature service
  const encoded = encodePacked(
    ['uint256', 'address', 'address', 'uint256', 'uint256', 'uint256'],
    [
      BigInt(data.auctionId),
      data.bidder,
      data.tokenAddress,
      data.amount,
      data.valueInUSD,
      BigInt(data.timestamp),
    ]
  )

  const messageHash = keccak256(encoded)

  console.log('🔍 [SIGNATURE-DEBUG] Encoded data:', encoded)
  console.log('🔍 [SIGNATURE-DEBUG] Message hash:', messageHash)
  console.log('🔍 [SIGNATURE-DEBUG] Trusted signer address:', getTrustedSignerAddress())

  return {
    encoded,
    messageHash,
    trustedSignerAddress: getTrustedSignerAddress(),
  }
}

export function validateSignatureFormat(signature: Hex): boolean {
  // Ethereum signatures should be 65 bytes (0x + 130 hex characters)
  if (!signature.startsWith('0x')) {
    console.error('❌ Signature does not start with 0x')
    return false
  }

  if (signature.length !== 132) { // 0x + 130 hex chars
    console.error('❌ Signature length is incorrect:', signature.length, 'expected 132')
    return false
  }

  // Check if all characters are valid hex
  const hexPart = signature.slice(2)
  if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
    console.error('❌ Signature contains invalid hex characters')
    return false
  }

  console.log('✅ Signature format is valid')
  return true
}

export function compareSignatures(sig1: Hex, sig2: Hex): boolean {
  const normalized1 = sig1.toLowerCase()
  const normalized2 = sig2.toLowerCase()
  
  const isEqual = normalized1 === normalized2
  
  console.log('🔍 [SIGNATURE-DEBUG] Comparing signatures:')
  console.log('  Signature 1:', normalized1)
  console.log('  Signature 2:', normalized2)
  console.log('  Are equal:', isEqual)
  
  return isEqual
}

// Common issues and solutions
export const SIGNATURE_ISSUES = {
  INVALID_FORMAT: {
    description: 'Signature format is invalid',
    solutions: [
      'Check that signature is 65 bytes (0x + 130 hex characters)',
      'Ensure signature starts with 0x',
      'Verify all characters are valid hex (0-9, a-f, A-F)'
    ]
  },
  WRONG_TRUSTED_SIGNER: {
    description: 'Trusted signer address mismatch',
    solutions: [
      'Verify TRUSTED_SIGNER_PRIVATE_KEY environment variable',
      'Check that trusted signer address matches contract configuration',
      'Ensure the private key corresponds to the expected address'
    ]
  },
  HASH_MISMATCH: {
    description: 'Message hash generation mismatch',
    solutions: [
      'Verify data encoding matches contract expectations',
      'Check that all parameters are in correct order',
      'Ensure timestamp is within valid range'
    ]
  },
  EXPIRED_SIGNATURE: {
    description: 'Signature has expired',
    solutions: [
      'Check signature timestamp',
      'Ensure signature is not older than 5 minutes',
      'Generate new signature if expired'
    ]
  }
}

export function diagnoseSignatureIssue(signature: Hex, data: DebugSignatureData): string[] {
  const issues: string[] = []
  
  // Check signature format
  if (!validateSignatureFormat(signature)) {
    issues.push('INVALID_FORMAT')
  }
  
  // Check timestamp (signatures expire after 5 minutes)
  const now = Math.floor(Date.now() / 1000)
  const age = now - data.timestamp
  if (age > 300) { // 5 minutes
    issues.push('EXPIRED_SIGNATURE')
    console.warn(`⚠️ Signature is ${age} seconds old (expires after 300 seconds)`)
  }
  
  // Debug the signature generation
  debugSignatureGeneration(data)
  
  return issues
}
