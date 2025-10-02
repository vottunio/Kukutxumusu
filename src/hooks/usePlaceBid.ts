'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useEffect } from 'react'
import { baseMainnet } from '@/lib/chains'
import PaymentABI from '../../contracts/abis/KukuxumusuPayment_ABI.json'

const PAYMENT_CONTRACT_ADDRESS = '0x8CDaEfE1079125A5BBCD5A75B977aC262C65413B' as const

// Dirección especial para ETH nativo
const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const

// ABI mínimo para ERC20 (approve, allowance)
const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const

export function usePlaceBid() {
  const [isApproving, setIsApproving] = useState(false)
  const [isBidding, setIsBidding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hook para aprobar tokens ERC20
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError
  } = useWriteContract()

  // Hook para hacer bid
  const {
    writeContract: writeBid,
    data: bidHash,
    isPending: isBidPending,
    error: bidError
  } = useWriteContract()

  // Esperar confirmación de aprobación
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    })

  // Esperar confirmación de bid
  const { isLoading: isBidConfirming, isSuccess: isBidSuccess } =
    useWaitForTransactionReceipt({
      hash: bidHash,
    })

  // Actualizar estados
  useEffect(() => {
    if (approveError) {
      setError(approveError.message)
      setIsApproving(false)
    }
    if (bidError) {
      setError(bidError.message)
      setIsBidding(false)
    }
  }, [approveError, bidError])


  /**
   * Aprobar tokens ERC20 para el contrato de payment
   */
  const approveToken = async (tokenAddress: string, amount: bigint) => {
    if (tokenAddress === NATIVE_ETH_ADDRESS) {
      // ETH nativo no requiere aprobación
      return true
    }

    try {
      setIsApproving(true)
      setError(null)

      writeApprove({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PAYMENT_CONTRACT_ADDRESS, amount],
        chainId: baseMainnet.id,
      })

      return true
    } catch (err: any) {
      setError(err.message || 'Error approving token')
      setIsApproving(false)
      return false
    }
  }

  /**
   * Hacer una apuesta en una subasta
   */
  const placeBid = async (
    auctionId: number | bigint,
    tokenAddress: string,
    amount: bigint
  ) => {
    try {
      setIsBidding(true)
      setError(null)

      const isNativeETH = tokenAddress === NATIVE_ETH_ADDRESS

      writeBid({
        address: PAYMENT_CONTRACT_ADDRESS,
        abi: PaymentABI,
        functionName: 'placeBid',
        args: [
          BigInt(auctionId),
          tokenAddress as `0x${string}`,
          amount,
        ],
        value: isNativeETH ? amount : 0n, // Enviar ETH si es nativo
        chainId: baseMainnet.id,
      })

      return true
    } catch (err: any) {
      setError(err.message || 'Error placing bid')
      setIsBidding(false)
      return false
    }
  }

  /**
   * Flujo completo: aprobar (si es necesario) y hacer bid
   * Nota: Para tokens ERC20, el usuario debe aprobar primero manualmente
   */
  const placeBidWithApproval = async (
    auctionId: number | bigint,
    tokenAddress: string,
    amount: bigint,
    _ownerAddress: string
  ) => {
    try {
      setError(null)

      // Si es ETH nativo, hacer bid directamente
      if (tokenAddress === NATIVE_ETH_ADDRESS) {
        return await placeBid(auctionId, tokenAddress, amount)
      }

      // Para tokens ERC20, primero aprobar
      // El usuario verá el botón "Approve" primero
      if (!isApproveSuccess && !isApprovePending) {
        await approveToken(tokenAddress, amount)
        return false // Indicar que está en proceso de aprobación
      }

      // Si ya se aprobó, hacer bid
      return await placeBid(auctionId, tokenAddress, amount)
    } catch (err: any) {
      setError(err.message || 'Error in bid process')
      return false
    }
  }

  // Auto-continuar con bid después de aprobación exitosa
  useEffect(() => {
    if (isApproveSuccess && !isBidding) {
      setIsApproving(false)
      // Aquí podrías auto-continuar con el bid si guardas los parámetros
      // Por ahora, el usuario tendrá que hacer click en "Bid" de nuevo
    }
  }, [isApproveSuccess, isBidding])

  return {
    placeBid,
    approveToken,
    placeBidWithApproval,
    isApproving: isApproving || isApprovePending || isApproveConfirming,
    isBidding: isBidding || isBidPending || isBidConfirming,
    isSuccess: isBidSuccess,
    isApproveSuccess,
    error,
    approveHash,
    bidHash,
    reset: () => {
      setIsApproving(false)
      setIsBidding(false)
      setError(null)
    },
  }
}
