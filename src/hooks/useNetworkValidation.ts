import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { base, baseSepolia } from 'viem/chains'

const SUPPORTED_CHAINS = [base.id, baseSepolia.id] as const
const PAYMENT_CHAIN = baseSepolia.id // Base Sepolia for testnet

export function useNetworkValidation() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isCorrectNetwork = chainId === PAYMENT_CHAIN
  const isSupported = SUPPORTED_CHAINS.includes(chainId as typeof SUPPORTED_CHAINS[number])

  const switchToPaymentNetwork = async () => {
    try {
      await switchChain({ chainId: PAYMENT_CHAIN as 84532 | 8453 })
      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      return false
    }
  }

  return {
    isConnected,
    isCorrectNetwork,
    isSupported,
    currentChainId: chainId,
    paymentChainId: PAYMENT_CHAIN,
    switchToPaymentNetwork,
  }
}
