'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Info, Users, Zap, Shield, Globe } from 'lucide-react'

export function LandingSections() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "What is Adarbakar NFT?",
      answer: "Adarbakar NFT is a cross-chain NFT marketplace that combines the power of Base blockchain for payments and Story Protocol for NFT minting. We create unique digital collectibles that bridge multiple blockchain networks."
    },
    {
      question: "How do the auctions work?",
      answer: "Our auctions are time-based and allow bidding in multiple cryptocurrencies. Each auction has a specific duration, and the highest bidder at the end wins the NFT. All bids are processed on-chain for transparency and security."
    },
    {
      question: "Which blockchains are supported?",
      answer: "Currently, we support Base (for payments and treasury) and Story Protocol (for NFT minting). This cross-chain approach allows us to leverage the best features of each network while maintaining interoperability."
    },
    {
      question: "How do I participate in auctions?",
      answer: "To participate, connect your wallet, ensure you have sufficient funds in supported tokens, and place your bid. The system will automatically handle the bidding process and update the auction in real-time."
    },
    {
      question: "What happens to the treasury funds?",
      answer: "All funds from successful auctions go to our treasury, which is managed by the community through our governance system. These funds are used for platform development, community initiatives, and future NFT projects."
    },
    {
      question: "Are the NFTs unique?",
      answer: "Yes, each NFT is unique and minted on-chain. Our collection features limited edition pieces with varying rarity levels, making each NFT a truly unique digital asset."
    }
  ]

  return (
    <div className="w-full">
      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-purple-100 rounded-full">
                <Info className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              About Adarbakar
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              We&apos;re pioneering the future of cross-chain NFT marketplaces by combining the best of multiple blockchain networks. 
              Our platform bridges the gap between different ecosystems, creating a seamless experience for collectors and creators alike.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cross-Chain Innovation</h3>
                <p className="text-gray-600">
                  Leveraging Base and Story Protocol to create a seamless multi-chain experience
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Transparent</h3>
                <p className="text-gray-600">
                  All transactions are processed on-chain with full transparency and security
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Driven</h3>
                <p className="text-gray-600">
                  Built by the community, for the community, with decentralized governance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-8">
                <div className="p-4 bg-purple-100 rounded-full">
                  <HelpCircle className="w-12 h-12 text-purple-600" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about Adarbakar NFT marketplace
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/20 rounded-full">
                <Globe className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join the Revolution?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Connect your wallet and start exploring unique NFTs across multiple blockchains. 
              Be part of the future of digital collectibles.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                Connect Wallet
              </button>
              <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-purple-600 transition-colors font-semibold">
                Explore NFTs
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
