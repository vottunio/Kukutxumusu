import { NextResponse } from 'next/server'
import { createPublicClient, http, formatUnits, erc20Abi } from 'viem'
import { baseSepolia } from '@/lib/chains'
import PaymentABI from '../../../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

// Token addresses on Base Sepolia
const TOKENS = {
  ETH: {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const,
    symbol: 'ETH',
    decimals: 18,
  },
  VTN: {
    address: '0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E' as `0x${string}`,
    symbol: 'VTN',
    decimals: 18,
  },
  USDT: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    symbol: 'USDT',
    decimals: 6,
  },
}

export async function GET() {
  try {
    // Get treasury address from contract
    const treasuryAddress = await publicClient.readContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'treasury',
    }) as `0x${string}`

    // Get balances for each token
    const balancePromises = Object.entries(TOKENS).map(async ([key, token]) => {
      try {
        let balance: bigint

        if (token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
          // ETH balance
          balance = await publicClient.getBalance({
            address: treasuryAddress,
          })
        } else {
          // ERC20 token balance
          balance = await publicClient.readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [treasuryAddress],
          }) as bigint
        }

        const formatted = formatUnits(balance, token.decimals)

        return {
          token: token.symbol,
          address: token.address,
          balance: balance.toString(),
          balanceFormatted: parseFloat(formatted).toFixed(token.decimals === 6 ? 2 : 4),
          decimals: token.decimals,
        }
      } catch (error) {
        console.error(`Error fetching ${key} balance:`, error)
        return {
          token: token.symbol,
          address: token.address,
          balance: '0',
          balanceFormatted: '0',
          decimals: token.decimals,
          error: 'Failed to fetch balance',
        }
      }
    })

    const balances = await Promise.all(balancePromises)

    // Calculate total value in USD (would need price oracle in production)
    // For now, just return the balances
    const totalValueUSD = null // TODO: Implement with price oracle

    return NextResponse.json({
      success: true,
      data: {
        treasuryAddress,
        balances,
        totalValueUSD,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error fetching treasury data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch treasury data',
      },
      { status: 500 }
    )
  }
}
