import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { method, signature } = await request.json()
    
    if (!method || !signature) {
      return NextResponse.json({
        success: false,
        error: 'Method and signature are required'
      }, { status: 400 })
    }

    // Test data (same as your failed transaction)
    const testData = {
      auctionId: 1,
      bidder: '0x090378a9c80c5E1Ced85e56B2128c1e514E75357',
      tokenAddress: '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E',
      amount: '50000000000000000000',
      valueInUSD: '204421336951692832',
      timestamp: 1759751635
    }

    return NextResponse.json({
      success: true,
      message: `Testing signature from method: ${method}`,
      testData,
      signature,
      instructions: [
        'Copy this signature and temporarily replace the one in signature-service.ts',
        'Or modify the frontend to use this specific signature for testing',
        'Try making a bid with this signature'
      ],
      codeToTest: `
// Temporarily replace in signature-service.ts:
export async function signBidData(data: BidSignatureData): Promise<SignedBidData> {
  // TEMPORARY TEST - Replace with this signature:
  return {
    ...data,
    signature: '${signature}',
    messageHash: '0x0000000000000000000000000000000000000000000000000000000000000000' // dummy
  }
}`
    })

  } catch (error) {
    console.error('❌ [TEST-SPECIFIC-SIGNATURE] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
