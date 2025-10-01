'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from '@reown/appkit/wagmi'
import { AppKitProvider } from '@reown/appkit/react'
import { queryClient, wagmiConfig, appKitConfig } from '@/lib/wallet-config'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <AppKitProvider config={appKitConfig}>
          {children}
        </AppKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
