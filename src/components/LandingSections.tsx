'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <h2 className="font-glina text-gray-900 mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem]" style={{ lineHeight: '1.1' }}>
                One NFT, Every Auction, Forever.
              </h2>
              <p className="text-gray-600 leading-relaxed font-futura-book text-base sm:text-lg md:text-xl">
                Behold, an infinite work of art! Adarbakar is a community-owned brand that makes a positive impact by funding ideas and fostering collaboration. From collectors and technologists, to non-profits and brands, Adarbakar is for everyone.
              </p>
            </div>

            {/* Right: Video/Image Placeholder */}
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 font-futura-book">Video Placeholder</p>
                <p className="text-sm text-gray-400 mt-2">YouTube embed goes here</p>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mt-12 md:mt-16 lg:mt-20">
            {/* Left: Video/Image Placeholder */}
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 font-futura-book">Video Placeholder</p>
                <p className="text-sm text-gray-400 mt-2">YouTube embed goes here</p>
              </div>
            </div>

            {/* Right: Text Content */}
            <div>
              <h2 className="font-glina text-gray-900 mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem]" style={{ lineHeight: '1.1' }}>
                Build With Adarbakar. Get Funded.
              </h2>
              <p className="text-gray-600 leading-relaxed font-futura-book text-base sm:text-lg md:text-xl">
                There&apos;s a way for everyone to get involved with Adarbakar. From whimsical endeavors like naming a frog, to ambitious projects like constructing a giant float for the Rose Parade, or even crypto infrastructure like Prop House. Adarbakar funds projects of all kinds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 lg:py-20" style={{ backgroundColor: 'rgb(255, 166, 38)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-glina text-gray-900 mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4rem]">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 font-futura-book text-base sm:text-lg md:text-xl">
                Everything you need to know about Adarbakar NFT marketplace
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left flex items-center justify-between transition-colors py-2"
                  >
                    <span className="font-semibold text-gray-900 pr-4 font-futura text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[2.5rem]">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFaq === index && (
                    <div className="pb-4">
                      <div className="pt-2">
                        <p className="text-gray-600 leading-relaxed font-futura-book text-sm sm:text-base md:text-lg">
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
    </div>
  )
}
