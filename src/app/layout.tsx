import type { Metadata } from 'next'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/Header'


export const metadata: Metadata = {
  title: 'Adarbakar',
  description: 'Cross-chain NFT marketplace on Story Protocol and Base',
  icons: {
    icon: '/images/Adarbakar Branding.png',
    apple: '/images/Adarbakar Branding.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-futura">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
