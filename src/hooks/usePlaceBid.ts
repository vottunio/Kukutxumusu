'use client'

import { useWriteContract, useWaitForTransactionReceipt, useEstimateGas } from 'wagmi'
import { useState, useEffect } from 'react'
import { baseSepolia } from '@/lib/chains'
import PaymentABI from '../../contracts/abis/KukuxumusuPayment_ABI.json'
import { NATIVE_ETH_ADDRESS } from '@/config/tokens'
import { baseGasConfig } from '@/lib/wallet-config'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

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
  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null)
  const [pendingBidParams, setPendingBidParams] = useState<{
    auctionId: number | bigint
    tokenAddress: string
    amount: bigint
    valueInUSD: bigint
    signature: `0x${string}`
  } | null>(null)

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
   * Estimar gas para transacciones
   */
  const estimateGasForBid = async (
    auctionId: number | bigint,
    tokenAddress: string,
    amount: bigint,
    valueInUSD: bigint,
    signature: `0x${string}`
  ) => {
    try {
      const isNativeETH = tokenAddress === NATIVE_ETH_ADDRESS
      // Aquí podrías implementar la estimación real usando useEstimateGas
      // Por ahora usamos valores conservadores
      const estimatedGas = isNativeETH ? 200000n : 250000n // ETH nativo usa menos gas
      setGasEstimate(estimatedGas)
      return estimatedGas
    } catch (err) {
      console.warn('Gas estimation failed, using default:', err)
      setGasEstimate(300000n) // Valor por defecto conservador
      return 300000n
    }
  }

  /**
   * Aprobar tokens ERC20 para el contrato de payment
   * Usa approve infinito para reducir costos futuros
   */
  const approveToken = async (tokenAddress: string, amount: bigint, useInfiniteApprove = true) => {
    if (tokenAddress === NATIVE_ETH_ADDRESS) {
      // ETH nativo no requiere aprobación
      return true
    }

    try {
      setIsApproving(true)
      setError(null)

      // Usar approve infinito para evitar transacciones futuras
      const approveAmount = useInfiniteApprove 
        ? 115792089237316195423570985008687907853269984665640564039457584007913129639935n // max uint256
        : amount

      writeApprove({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PAYMENT_CONTRACT_ADDRESS, approveAmount],
        chainId: baseSepolia.id,
        // Configuración de gas optimizada
        gas: 100000n, // Aprobar es una operación simple
        ...baseGasConfig,
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
   * Ahora requiere valueInUSD y firma del relayer
   */
  const placeBid = async (
    auctionId: number | bigint,
    tokenAddress: string,
    amount: bigint,
    valueInUSD: bigint,
    signature: `0x${string}`
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
          valueInUSD,
          signature,
        ],
        value: isNativeETH ? amount : 0n, // Enviar ETH si es nativo
        chainId: baseSepolia.id,
        // Configuración de gas optimizada
        gas: gasEstimate ? gasEstimate + (gasEstimate * 20n / 100n) : 400000n, // +20% buffer o 400k por defecto
        ...baseGasConfig,
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
   * Ahora guarda los parámetros y auto-ejecuta el bid después del approve
   */
  const placeBidWithApproval = async (
    auctionId: number | bigint,
    tokenAddress: string,
    amount: bigint,
    valueInUSD: bigint,
    signature: `0x${string}`,
    _ownerAddress: string
  ) => {
    try {
      setError(null)

      // Estimar gas antes de proceder
      await estimateGasForBid(auctionId, tokenAddress, amount, valueInUSD, signature)

      // Si es ETH nativo, hacer bid directamente
      if (tokenAddress === NATIVE_ETH_ADDRESS) {
        return await placeBid(auctionId, tokenAddress, amount, valueInUSD, signature)
      }

      // Para tokens ERC20, primero aprobar
      if (!isApproveSuccess && !isApprovePending) {
        console.log('🔑 Requesting token approval...')
        
        // Guardar parámetros para ejecutar el bid después del approve
        setPendingBidParams({
          auctionId,
          tokenAddress,
          amount,
          valueInUSD,
          signature
        })
        
        // Usar approve infinito para reducir costos futuros
        await approveToken(tokenAddress, amount, true)
        return true // La transacción de bid se ejecutará automáticamente
      }

      // Si ya se aprobó, hacer bid directamente
      console.log('🎯 Placing bid...')
      return await placeBid(auctionId, tokenAddress, amount, valueInUSD, signature)
    } catch (err: any) {
      setError(err.message || 'Error in bid process')
      setPendingBidParams(null)
      return false
    }
  }

  // Auto-continuar con bid después de aprobación exitosa
  useEffect(() => {
    if (isApproveSuccess && !isBidding && pendingBidParams) {
      console.log('✅ Approval successful! Now placing bid...')
      setIsApproving(false)
      
      // Ejecutar el bid automáticamente
      placeBid(
        pendingBidParams.auctionId,
        pendingBidParams.tokenAddress,
        pendingBidParams.amount,
        pendingBidParams.valueInUSD,
        pendingBidParams.signature
      )
      
      // Limpiar parámetros pendientes
      setPendingBidParams(null)
    }
  }, [isApproveSuccess, isBidding, pendingBidParams])

  return {
    placeBid,
    approveToken,
    placeBidWithApproval,
    estimateGasForBid,
    isApproving: isApproving || isApprovePending || isApproveConfirming,
    isBidding: isBidding || isBidPending || isBidConfirming,
    isSuccess: isBidSuccess,
    isApproveSuccess,
    error,
    gasEstimate,
    approveHash,
    bidHash,
    reset: () => {
      setIsApproving(false)
      setIsBidding(false)
      setError(null)
      setGasEstimate(null)
    },
  }
}
