export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Explore NFTs
          </h1>
          <p className="text-xl text-gray-600">
            Browse all minted NFTs from Story Protocol
          </p>
        </div>

        {/* NFT Grid - TODO */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-500 text-center">
              No NFTs minted yet. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
