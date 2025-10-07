/**
 * Signature Service
 * Signs bid data with the trusted signer private key for on-chain validation
 */

import { privateKeyToAccount } from 'viem/accounts'
import { encodePacked, keccak256, type Address, type Hex } from 'viem'

// Get trusted signer from environment (lazy initialization)
let trustedSigner: ReturnType<typeof privateKeyToAccount> | null = null

function getTrustedSigner() {
  if (!trustedSigner) {
    const TRUSTED_SIGNER_PRIVATE_KEY = process.env.TRUSTED_SIGNER_PRIVATE_KEY as Hex

    if (!TRUSTED_SIGNER_PRIVATE_KEY) {
      throw new Error('TRUSTED_SIGNER_PRIVATE_KEY not set in environment')
    }

    trustedSigner = privateKeyToAccount(TRUSTED_SIGNER_PRIVATE_KEY)
  }

  return trustedSigner
}

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
  // EXACT MATCH with contract: keccak256(abi.encodePacked(auctionId, msg.sender, paymentToken, amount, valueInUSD))
  const encoded = encodePacked(
    ['uint256', 'address', 'address', 'uint256', 'uint256'],
    [
      BigInt(data.auctionId),
      data.bidder,
      data.tokenAddress,
      data.amount,
      data.valueInUSD,
    ]
  )

  // Hash the encoded data (this will be passed to toEthSignedMessageHash() in the contract)
  return keccak256(encoded)
}

/**
 * Alternative: Direct packed encoding (original method)
 */
// function generatePackedMessageHash(data: BidSignatureData): Hex {
//   // Same order as the main function
//   const encoded = encodePacked(
//     ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256'],
//     [
//       data.tokenAddress,
//       data.amount,
//       data.valueInUSD,
//       data.bidder,
//       BigInt(data.auctionId),
//       BigInt(data.timestamp),
//     ]
//   )
//
//   return keccak256(encoded)
// }

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
  const signer = getTrustedSigner()
  console.log('🔐 [SIGNATURE] Starting signature process...')
  console.log('🔐 [SIGNATURE] Trusted signer address:', signer.address)
  console.log('🔐 [SIGNATURE] Input data:', {
    auctionId: data.auctionId,
    bidder: data.bidder,
    tokenAddress: data.tokenAddress,
    amount: data.amount.toString(),
    valueInUSD: data.valueInUSD.toString(),
    timestamp: data.timestamp,
  })

  // Generate message hash (exactly like contract)
  const messageHash = generateMessageHash(data)
  console.log('🔐 [SIGNATURE] Generated message hash:', messageHash)

  try {
    // Sign with Ethereum Signed Message prefix (like contract uses toEthSignedMessageHash())
    const signature = await signer.signMessage({
      message: { raw: messageHash },
    })
    
    console.log('🔐 [SIGNATURE] Generated signature:', signature)
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
  return getTrustedSigner().address
}

/**
 * Verify a signature (for testing purposes)
 */
export async function verifySignature(
  data: BidSignatureData,
  signature: Hex
): Promise<boolean> {
  try {
    const signer = getTrustedSigner()
    const messageHash = generateMessageHash(data)

    // In production, the smart contract will do this verification on-chain
    // This is just for testing purposes
    const recoveredAddress = await signer.signMessage({
      message: { raw: messageHash },
    })

    return recoveredAddress === signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}
