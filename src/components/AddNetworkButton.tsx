'use client'

import { useState } from 'react'
import { storyTestnet, baseSepolia } from '@/lib/chains'

export function AddNetworkButton() {
  const [isAdding, setIsAdding] = useState(false)

  const addNetwork = async (chain: typeof storyTestnet | typeof baseSepolia) => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask no está instalado')
      return
    }

    setIsAdding(true)

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chain.id.toString(16)}`,
            chainName: chain.name,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: [chain.rpcUrls.default.http[0]],
            blockExplorerUrls: chain.blockExplorers?.default?.url
              ? [chain.blockExplorers.default.url]
              : undefined,
          },
        ],
      })
      alert(`${chain.name} agregada exitosamente!`)
    } catch (error: any) {
      if (error.code === 4902) {
        alert(`${chain.name} ya existe en MetaMask`)
      } else if (error.code === 4001) {
        // Usuario rechazó
        console.log('Usuario rechazó agregar la red')
      } else {
        console.error('Error agregando red:', error)
        alert(`Error al agregar ${chain.name}: ${error.message || 'Error desconocido'}`)
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => addNetwork(baseSepolia)}
        disabled={isAdding}
        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
      >
        + Base Sepolia
      </button>
      <button
        onClick={() => addNetwork(storyTestnet)}
        disabled={isAdding}
        className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded disabled:opacity-50"
      >
        + Story Testnet
      </button>
    </div>
  )
}
