'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'

export function WalletButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted: mountedState,
      }) => {
        const ready = mountedState
        const connected = ready && account && chain

        return (
          <div className="flex items-center gap-1 md:gap-2">
            {connected ? (
              <>
                {/* Chain Selector - Solo Desktop */}
                <button
                  onClick={openChainModal}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
                  type="button"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    <img
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      className="w-5 h-5"
                    />
                  )}
                  {chain.name}
                </button>

                {/* Account Button */}
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 px-2 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-xs md:text-base"
                  type="button"
                >
                  {/* Mobile: Solo últimos 4 caracteres */}
                  <span className="md:hidden font-mono">
                    ...{account.address.slice(-4)}
                  </span>
                  {/* Desktop: Formato normal */}
                  <span className="hidden md:inline">
                    {account.displayName}
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={openConnectModal}
                className="px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm md:text-base whitespace-nowrap"
                type="button"
              >
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

