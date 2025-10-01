import { WalletButton } from '@/components/WalletButton'
import { ContractData } from '@/components/ContractData'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Kukuxumusu NFT
            </h1>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Kukuxumusu NFT
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Your gateway to the world of digital collectibles
          </p>
        </div>

        {/* Contract Data */}
        <ContractData />
      </div>
    </main>
  )
}
