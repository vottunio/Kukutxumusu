import { useReadContract, useAccount, useBalance } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import { PAYMENT_CHAIN } from '@/config/network'

export function useTokenBalance(tokenAddress: string) {
  const { address, isConnected } = useAccount()

  // For native ETH
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: PAYMENT_CHAIN.id,
    query: {
      enabled: isConnected && tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    },
  })

  // For ERC20 tokens
  const { data: erc20Balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: PAYMENT_CHAIN.id,
    query: {
      enabled: isConnected && !!address && tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    },
  })

  // Return ETH balance or ERC20 balance
  const balance = tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    ? ethBalance?.value
    : erc20Balance

  return {
    balance,
    isLoading: !isConnected,
  }
}

export function useHasSufficientBalance(tokenAddress: string, requiredAmount: bigint, decimals: number = 18) {
  const { balance, isLoading } = useTokenBalance(tokenAddress)

  const hasSufficient = balance !== undefined && balance >= requiredAmount
  const formattedBalance = balance ? formatUnits(balance, decimals) : '0'
  const formattedRequired = formatUnits(requiredAmount, decimals)

  return {
    hasSufficient,
    balance,
    formattedBalance,
    formattedRequired,
    isLoading,
  }
}
