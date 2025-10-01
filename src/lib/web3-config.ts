import { createPublicClient, createWalletClient, http } from 'viem'
import { chains } from './chains'

// Configuración de clientes para cada red
export const createClients = () => {
  const clients = {
    // Base Mainnet
    baseMainnet: createPublicClient({
      chain: chains.baseMainnet,
      transport: http(),
    }),
    
    // Base Sepolia
    baseSepolia: createPublicClient({
      chain: chains.baseSepolia,
      transport: http(),
    }),
    
    // Ethereum Mainnet (Story Protocol)
    ethereumMainnet: createPublicClient({
      chain: chains.ethereumMainnet,
      transport: http(),
    }),
    
    // Ethereum Sepolia
    ethereumSepolia: createPublicClient({
      chain: chains.ethereumSepolia,
      transport: http(),
    }),
  }

  return clients
}

// Configuración de WalletConnect
export const walletConnectConfig = {
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [chains.baseMainnet, chains.ethereumMainnet],
  metadata: {
    name: 'Kukuxumusu NFT',
    description: 'Cross-chain NFT marketplace on Story Protocol and Base',
    url: 'https://kukuxumusu.com',
    icons: ['https://kukuxumusu.com/icon.png'],
  },
}

// Configuración de contratos (direcciones)
export const contractAddresses = {
  // Base (Payments)
  base: {
    paymentContract: process.env.NEXT_PUBLIC_BASE_PAYMENT_CONTRACT || '0x...',
    treasuryWallet: process.env.NEXT_PUBLIC_BASE_TREASURY_WALLET || '0x...',
  },
  
  // Ethereum (Story Protocol - NFTs)
  ethereum: {
    nftContract: process.env.NEXT_PUBLIC_ETHEREUM_NFT_CONTRACT || '0x...',
    relayerWallet: process.env.NEXT_PUBLIC_ETHEREUM_RELAYER_WALLET || '0x...',
  },
}
