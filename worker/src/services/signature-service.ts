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

console.log('🔐 Trusted Signer initialized:', trustedSigner.address)

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
 * Sign bid data with trusted signer private key
 */
export async function signBidData(data: BidSignatureData): Promise<SignedBidData> {
  console.log('🔐 [SIGNATURE] Starting signature process...')
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
    const signature = await trustedSigner.signMessage({
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
  return trustedSigner.address
}
