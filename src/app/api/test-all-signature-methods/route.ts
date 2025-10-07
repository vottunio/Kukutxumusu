import { NextResponse } from 'next/server'
import { privateKeyToAccount } from 'viem/accounts'
import { encodePacked, keccak256, type Address, type Hex } from 'viem'

// Test data (same as your failed transaction)
const testData = {
  auctionId: 1,
  bidder: '0x090378a9c80c5E1Ced85e56B2128c1e514E75357' as Address,
  tokenAddress: '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E' as Address,
  amount: BigInt('50000000000000000000'),
  valueInUSD: BigInt('204421336951692832'),
  timestamp: 1759751635
}

const trustedSigner = privateKeyToAccount(process.env.TRUSTED_SIGNER_PRIVATE_KEY as `0x${string}`)

export async function GET() {
  try {
    console.log('🧪 [TEST-ALL-METHODS] Testing all signature generation methods...')
    
    const results = []

    // Method 1: Current implementation (concatenation like Go)
    const method1Hash = generateMethod1(testData)
    const method1Sig = await signHash(method1Hash)
    results.push({
      method: 'Concatenation (Go-like)',
      hash: method1Hash,
      signature: method1Sig,
      description: 'Direct byte concatenation like Go implementation'
    })

    // Method 2: encodePacked with correct order
    const method2Hash = generateMethod2(testData)
    const method2Sig = await signHash(method2Hash)
    results.push({
      method: 'encodePacked (correct order)',
      hash: method2Hash,
      signature: method2Sig,
      description: 'encodePacked with tokenAddress, amount, valueInUSD, bidder, auctionId, timestamp'
    })

    // Method 3: encodePacked with original order
    const method3Hash = generateMethod3(testData)
    const method3Sig = await signHash(method3Hash)
    results.push({
      method: 'encodePacked (original order)',
      hash: method3Hash,
      signature: method3Sig,
      description: 'encodePacked with auctionId, bidder, tokenAddress, amount, valueInUSD, timestamp'
    })

    // Method 4: EIP-712 style
    const method4Hash = generateMethod4(testData)
    const method4Sig = await signHash(method4Hash)
    results.push({
      method: 'EIP-712 style',
      hash: method4Hash,
      signature: method4Sig,
      description: 'EIP-712 message prefix'
    })

    // Method 5: Simple concatenation without padding
    const method5Hash = generateMethod5(testData)
    const method5Sig = await signHash(method5Hash)
    results.push({
      method: 'Simple concatenation',
      hash: method5Hash,
      signature: method5Sig,
      description: 'Simple string concatenation without padding'
    })

    return NextResponse.json({
      success: true,
      message: 'All signature methods tested',
      testData: {
        ...testData,
        amount: testData.amount.toString(),
        valueInUSD: testData.valueInUSD.toString(),
        timestamp: testData.timestamp.toString()
      },
      results,
      recommendations: [
        'Try each signature in the frontend',
        'The one that works is the correct method',
        'Update signature-service.ts with the working method'
      ]
    })

  } catch (error) {
    console.error('❌ [TEST-ALL-METHODS] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Method 1: Current implementation (concatenation like Go)
function generateMethod1(data: typeof testData): Hex {
  const tokenAddressBytes = data.tokenAddress.slice(2)
  const bidderBytes = data.bidder.slice(2)
  
  const amountHex = data.amount.toString(16).padStart(64, '0')
  const valueInUSDHex = data.valueInUSD.toString(16).padStart(64, '0')
  const auctionIdHex = BigInt(data.auctionId).toString(16).padStart(64, '0')
  const timestampHex = BigInt(data.timestamp).toString(16).padStart(64, '0')
  
  const concatenated = `0x${tokenAddressBytes}${amountHex}${valueInUSDHex}${bidderBytes}${auctionIdHex}${timestampHex}`
  return keccak256(concatenated as `0x${string}`)
}

// Method 2: encodePacked with correct order
function generateMethod2(data: typeof testData): Hex {
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

// Method 3: encodePacked with original order
function generateMethod3(data: typeof testData): Hex {
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
  return keccak256(encoded)
}

// Method 4: EIP-712 style
function generateMethod4(data: typeof testData): Hex {
  const message = `Place Bid
Auction ID: ${data.auctionId}
Bidder: ${data.bidder}
Token: ${data.tokenAddress}
Amount: ${data.amount}
Value USD: ${data.valueInUSD}
Timestamp: ${data.timestamp}`
  
  const prefixedMessage = `\x19Ethereum Signed Message:\n${message.length}${message}`
  return keccak256(prefixedMessage as `0x${string}`)
}

// Method 5: Simple concatenation without padding
function generateMethod5(data: typeof testData): Hex {
  const concatenated = `${data.tokenAddress}${data.amount}${data.valueInUSD}${data.bidder}${data.auctionId}${data.timestamp}`
  return keccak256(concatenated as `0x${string}`)
}

async function signHash(hash: Hex): Promise<Hex> {
  const signature = await trustedSigner.signMessage({
    message: { raw: hash },
  })
  return signature
}
