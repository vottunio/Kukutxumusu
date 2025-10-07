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
    <ConnectButton
      chainStatus="full"
      showBalance={false}
    />
  )
}

