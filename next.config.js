/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Excluir worker/ del build
  typescript: {
    ignoreBuildErrors: false,
  },

  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Excluir worker del análisis de TypeScript
  experimental: {
    typedRoutes: false,
  },
  
  // Optimización de imágenes para logos de tokens/wallets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
    ],
  },

  // Webpack config para WalletConnect y crypto libs
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Para viem y wagmi
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    return config
  },

  // Variables de entorno públicas (opcional)
  env: {
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  },
}

module.exports = nextConfig