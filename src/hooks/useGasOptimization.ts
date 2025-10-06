'use client'

import { useReadContract } from 'wagmi'
import { useState, useEffect } from 'react'
import { baseSepolia } from '@/lib/chains'

interface GasInfo {
  gasPrice: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  estimatedGas: bigint
  estimatedCost: string
}

export function useGasOptimization() {
  const [gasInfo, setGasInfo] = useState<GasInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Leer gas price actual del blockchain
  const { data: blockData } = useReadContract({
    address: '0x0000000000000000000000000000000000000000',
    abi: [{
      type: 'function',
      name: 'getBlock',
      stateMutability: 'view',
      inputs: [{ name: 'blockNumber', type: 'uint256' }],
      outputs: [{
        type: 'tuple',
        components: [
          { name: 'baseFeePerGas', type: 'uint256' },
          { name: 'gasLimit', type: 'uint256' },
          { name: 'gasUsed', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' }
        ]
      }]
    }],
    functionName: 'getBlock',
    args: ['latest'],
    chainId: baseSepolia.id,
    query: {
      enabled: true,
      refetchInterval: 10000, // Refetch cada 10 segundos
    },
  })

  useEffect(() => {
    if (blockData) {
      const baseFee = blockData.baseFeePerGas || 1000000000n // 1 gwei por defecto
      const priorityFee = 1000000000n // 1 gwei priority fee
      const maxFee = baseFee + priorityFee

      setGasInfo({
        gasPrice: baseFee,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee,
        estimatedGas: 250000n, // Estimación conservadora
        estimatedCost: `${Number(maxFee * 250000n / 1000000000000000000n).toFixed(6)} ETH`
      })
    }
  }, [blockData])

  const getOptimizedGasConfig = (gasLimit: bigint) => {
    if (!gasInfo) {
      return {
        gas: gasLimit,
        maxFeePerGas: 2000000000n, // 2 gwei por defecto
        maxPriorityFeePerGas: 1000000000n, // 1 gwei por defecto
      }
    }

    return {
      gas: gasLimit,
      maxFeePerGas: gasInfo.maxFeePerGas,
      maxPriorityFeePerGas: gasInfo.maxPriorityFeePerGas,
    }
  }

  const estimateTransactionCost = (gasLimit: bigint): string => {
    if (!gasInfo) return 'Calculando...'
    
    const cost = Number(gasInfo.maxFeePerGas * gasLimit / 1000000000000000000n)
    return `${cost.toFixed(6)} ETH`
  }

  return {
    gasInfo,
    isLoading,
    getOptimizedGasConfig,
    estimateTransactionCost,
  }
}
