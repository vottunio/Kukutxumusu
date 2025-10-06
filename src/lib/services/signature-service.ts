/**
 * Signature Service
 * Signs bid data with the trusted signer private key for on-chain validation
 */

import { privateKeyToAccount } from 'viem/accounts'
import { encodePacked, keccak256, type Address, type Hex } from 'viem'

// Get trusted signer from environment
const TRUSTED_SIGNER_PRIVATE_KEY = process.env.TRUSTED_SIGNER_PRIVATE_KEY as Hex

if (!TRUSTED_SIGNER_PRIVATE_KEY) {
  throw new Error('TRUSTED_SIGNER_PRIVATE_KEY not set in environment')
}

const trustedSigner = privateKeyToAccount(TRUSTED_SIGNER_PRIVATE_KEY)

export interface BidSignatureData {
  auctionId: number
  bidder: Address
  tokenAddress: Address
  amount: bigint
  valueInUSD: bigint
  timestamp: number
}

export interface SignedBidData extends BidSignatureData {
  signature: Hex
  messageHash: Hex
}

/**
 * Generate message hash for bid data
 * This hash is what gets signed and verified on-chain
 * 
 * IMPORTANT: The contract might expect a specific format
 * We're trying the original encodePacked method since EIP-712 failed
 */
function generateMessageHash(data: BidSignatureData): Hex {
  // Try method 1: Direct byte concatenation (like Go implementation)
  // This mimics: crypto.Keccak256(tokenAddress.Bytes(), amount.Bytes(), ...)
  const tokenAddressBytes = data.tokenAddress.slice(2) // Remove 0x
  const bidderBytes = data.bidder.slice(2) // Remove 0x
  
  // Convert to 32-byte padded hex strings
  const amountHex = data.amount.toString(16).padStart(64, '0')
  const valueInUSDHex = data.valueInUSD.toString(16).padStart(64, '0')
  const auctionIdHex = BigInt(data.auctionId).toString(16).padStart(64, '0')
  const timestampHex = BigInt(data.timestamp).toString(16).padStart(64, '0')
  
  // Concatenate all bytes: tokenAddress(20) + amount(32) + valueInUSD(32) + bidder(20) + auctionId(32) + timestamp(32)
  const concatenated = `0x${tokenAddressBytes}${amountHex}${valueInUSDHex}${bidderBytes}${auctionIdHex}${timestampHex}`
  
  // Hash the concatenated bytes
  return keccak256(concatenated as `0x${string}`)
}

/**
 * Alternative: Direct packed encoding (original method)
 */
function generatePackedMessageHash(data: BidSignatureData): Hex {
  // Same order as the main function
  const encoded = encodePacked(
    ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256'],
    [
      data.tokenAddress,
      data.amount,
      data.valueInUSD,
      data.bidder,
      BigInt(data.auctionId),
      BigInt(data.timestamp),
    ]
  )

  return keccak256(encoded)
}

/**
 * Alternative message hash generation methods for testing
 * The contract might use a different encoding method
 */
export function generateAlternativeMessageHashes(data: BidSignatureData): {
  packed: Hex
  // Add more alternatives as needed
} {
  // Method 1: Correct order as per contract documentation
  const packed = encodePacked(
    ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256'],
    [
      data.tokenAddress,
      data.amount,
      data.valueInUSD,
      data.bidder,
      BigInt(data.auctionId),
      BigInt(data.timestamp),
    ]
  )
  
  return {
    packed: keccak256(packed),
  }
}

/**
 * Sign bid data with trusted signer private key
 */
export async function signBidData(data: BidSignatureData): Promise<SignedBidData> {
  console.log('🔐 [SIGNATURE] Starting signature process...')
  console.log('🔐 [SIGNATURE] Trusted signer address:', trustedSigner.address)
  console.log('🔐 [SIGNATURE] Input data:', {
    auctionId: data.auctionId,
    bidder: data.bidder,
    tokenAddress: data.tokenAddress,
    amount: data.amount.toString(),
    valueInUSD: data.valueInUSD.toString(),
    timestamp: data.timestamp,
  })

  // Generate message hash
  const messageHash = generateMessageHash(data)
  console.log('🔐 [SIGNATURE] Generated message hash:', messageHash)

  try {
    // Sign the hash
    const signature = await trustedSigner.signMessage({
      message: { raw: messageHash },
    })
    
    console.log('🔐 [SIGNATURE] Generated signature:', signature)
    console.log('🔐 [SIGNATURE] Signature length:', signature.length)
    
    // Validate signature format
    if (signature.length !== 132) {
      throw new Error(`Invalid signature length: ${signature.length}, expected 132`)
    }
    
    if (!signature.startsWith('0x')) {
      throw new Error('Signature must start with 0x')
    }

    console.log('✅ [SIGNATURE] Signature generated successfully')

    return {
      ...data,
      signature,
      messageHash,
    }
  } catch (error) {
    console.error('❌ [SIGNATURE] Error signing message:', error)
    throw new Error(`Failed to sign bid data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get the trusted signer address (for frontend/contract configuration)
 */
export function getTrustedSignerAddress(): Address {
  return trustedSigner.address
}

/**
 * Verify a signature (for testing purposes)
 */
export async function verifySignature(
  data: BidSignatureData,
  signature: Hex
): Promise<boolean> {
  try {
    const messageHash = generateMessageHash(data)

    // In production, the smart contract will do this verification on-chain
    // This is just for testing purposes
    const recoveredAddress = await trustedSigner.signMessage({
      message: { raw: messageHash },
    })

    return recoveredAddress === signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}
