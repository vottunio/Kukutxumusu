/**
 * Utilidad para probar la configuración de gas
 * Este archivo ayuda a verificar que la configuración EIP-1559 funciona correctamente
 */

import { baseGasConfig } from '@/lib/wallet-config'

// Función para validar la configuración de gas
export function validateGasConfig() {
  console.log('🔧 Validando configuración de gas...')
  
  // Verificar que solo usamos EIP-1559 (no gasPrice)
  if ('gasPrice' in baseGasConfig) {
    console.error('❌ Error: No se debe usar gasPrice en redes EIP-1559')
    return false
  }
  
  // Verificar que tenemos maxFeePerGas y maxPriorityFeePerGas
  if (!baseGasConfig.maxFeePerGas || !baseGasConfig.maxPriorityFeePerGas) {
    console.error('❌ Error: Faltan maxFeePerGas o maxPriorityFeePerGas')
    return false
  }
  
  // Verificar que maxFeePerGas > maxPriorityFeePerGas
  if (baseGasConfig.maxFeePerGas <= baseGasConfig.maxPriorityFeePerGas) {
    console.error('❌ Error: maxFeePerGas debe ser mayor que maxPriorityFeePerGas')
    return false
  }
  
  console.log('✅ Configuración de gas válida:')
  console.log(`   Max Fee: ${baseGasConfig.maxFeePerGas} wei (${Number(baseGasConfig.maxFeePerGas / 1000000000n)} gwei)`)
  console.log(`   Max Priority Fee: ${baseGasConfig.maxPriorityFeePerGas} wei (${Number(baseGasConfig.maxPriorityFeePerGas / 1000000000n)} gwei)`)
  
  return true
}

// Función para estimar el costo de una transacción
export function estimateTransactionCost(gasLimit: bigint): string {
  const maxFee = baseGasConfig.maxFeePerGas
  const cost = Number(maxFee * gasLimit / 1000000000000000000n)
  return `${cost.toFixed(6)} ETH`
}

// Función para obtener la configuración de gas para una transacción específica
export function getGasConfigForTransaction(gasLimit: bigint) {
  return {
    gas: gasLimit,
    ...baseGasConfig
  }
}

// Ejemplo de uso en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Solo ejecutar en el navegador y en desarrollo
  validateGasConfig()
}
