'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, MessageCircle, Mail, ExternalLink } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="text-xl md:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Adarbakar
            </Link>
            <p className="text-gray-600 mt-3 md:mt-4 text-xs md:text-sm leading-relaxed">
              Cross-chain NFT marketplace powered by Base & Story Protocol.
              Bridging the future of digital collectibles.
            </p>
            <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a
                href="mailto:contact@adarbakar.com"
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Platform</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link href="/explore" className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm">
                  Explore NFTs
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm">
                  Admin Panel
                </Link>
              </li>
              <li>
                <a
                  href="https://base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm flex items-center gap-1"
                >
                  Base Network
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://story.foundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm flex items-center gap-1"
                >
                  Story Protocol
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Resources</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a
                  href="/docs"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/whitepaper"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Whitepaper
                </a>
              </li>
              <li>
                <a
                  href="/roadmap"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Community */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Legal & Community</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a
                  href="/privacy"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/governance"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Governance
                </a>
              </li>
              <li>
                <a
                  href="/community"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <a
                  href="/bug-bounty"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm"
                >
                  Bug Bounty
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
              <Image
                src="/images/Adarbakar Branding.png"
                alt="Adarbakar"
                width={32}
                height={32}
                className="object-contain md:w-[40px] md:h-[40px]"
              />
              <span className="text-gray-600 text-xs md:text-sm text-center sm:text-left">
                © {currentYear} Adarbakar NFT. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
              <span>Powered by</span>
              <Image
                src="/images/Vector.png"
                alt="Vottun"
                width={80}
                height={24}
                className="object-contain md:w-[100px] md:h-[30px]"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
