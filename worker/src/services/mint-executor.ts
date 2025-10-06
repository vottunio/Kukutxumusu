/**
 * Mint Executor
 * Processes mint queue and executes mints on Story Protocol
 */

import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { odysseyTestnet } from 'viem/chains'
import { prisma } from '../lib/prisma'
import { MintStatus, NFTStatus, AuctionStatus } from '@prisma/client'

// Get config from env
const STORY_RPC_URL = process.env.NEXT_PUBLIC_STORY_RPC_URL || process.env.STORY_RPC_URL
const NFT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || process.env.NFT_CONTRACT_ADDRESS) as `0x${string}`
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as `0x${string}`

if (!STORY_RPC_URL) {
  throw new Error('STORY_RPC_URL not set')
}

if (!NFT_CONTRACT_ADDRESS) {
  throw new Error('NFT_CONTRACT_ADDRESS not set')
}

if (!RELAYER_PRIVATE_KEY) {
  throw new Error('RELAYER_PRIVATE_KEY not set')
}

// Create Story Protocol clients
const account = privateKeyToAccount(RELAYER_PRIVATE_KEY)

const publicClient = createPublicClient({
  chain: odysseyTestnet,
  transport: http(STORY_RPC_URL),
})

const walletClient = createWalletClient({
  account,
  chain: odysseyTestnet,
  transport: http(STORY_RPC_URL),
})

// NFT Contract ABI (simplified - adjust based on your actual contract)
const NFT_ABI = parseAbi([
  'function mint(address to, uint256 tokenId, string memory metadataURI) public returns (uint256)',
  'function safeMint(address to, string memory metadataURI) public returns (uint256)',
])

export class MintExecutor {
  private isRunning = false
  private pollInterval = 30000 // 30 seconds
  private maxRetries = 3

  async start() {
    this.isRunning = true
    console.log(`🔑 Relayer address: ${account.address}`)

    // Start processing loop
    this.processQueue()
  }

  private async processQueue() {
    while (this.isRunning) {
      try {
        await this.processPendingMints()
      } catch (error) {
        console.error('❌ Error processing mint queue:', error)
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, this.pollInterval))
    }
  }

  private async processPendingMints() {
    // Get pending mints
    const pendingMints = await prisma.mintTransaction.findMany({
      where: {
        status: MintStatus.PENDING,
        attempts: {
          lt: this.maxRetries,
        },
      },
      include: {
        nft: {
          include: {
            auction: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 5, // Process max 5 at a time
    })

    if (pendingMints.length === 0) {
      return
    }

    console.log(`🔨 Processing ${pendingMints.length} pending mint(s)`)

    for (const mintTx of pendingMints) {
      await this.executeMint(mintTx)
    }
  }

  private async executeMint(mintTx: any) {
    try {
      console.log(`⚙️  Minting NFT #${mintTx.nft.tokenId} for ${mintTx.recipientAddress}`)

      // Update status to PROCESSING
      await prisma.mintTransaction.update({
        where: { id: mintTx.id },
        data: {
          status: MintStatus.PROCESSING,
          attempts: mintTx.attempts + 1,
        },
      })

      // Build metadata URI (IPFS)
      const metadataURI = mintTx.nft.metadataHash
        ? `ipfs://${mintTx.nft.metadataHash}`
        : `ipfs://${mintTx.nft.imageHash}` // Fallback to image if metadata not set

      // Execute mint transaction on Story Protocol
      const hash = await walletClient.writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [mintTx.recipientAddress as `0x${string}`, BigInt(mintTx.nft.tokenId), metadataURI],
      })

      console.log(`📤 Mint transaction sent: ${hash}`)

      // Update status to SUBMITTED
      await prisma.mintTransaction.update({
        where: { id: mintTx.id },
        data: {
          status: MintStatus.SUBMITTED,
          txHash: hash,
          submittedAt: new Date(),
        },
      })

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        console.log(`✅ NFT #${mintTx.nft.tokenId} minted successfully!`)

        // Update to CONFIRMED
        await prisma.mintTransaction.update({
          where: { id: mintTx.id },
          data: {
            status: MintStatus.CONFIRMED,
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed.toString(),
            confirmedAt: new Date(),
          },
        })

        // Update NFT status
        await prisma.nFT.update({
          where: { id: mintTx.nftId },
          data: {
            status: NFTStatus.MINTED,
            mintedAt: new Date(),
          },
        })

        // Update auction status
        if (mintTx.nft.auction) {
          await prisma.auction.update({
            where: { id: mintTx.nft.auction.id },
            data: {
              status: AuctionStatus.COMPLETED,
            },
          })
        }
      } else {
        throw new Error('Transaction reverted')
      }
    } catch (error: any) {
      console.error(`❌ Mint failed for NFT #${mintTx.nft.tokenId}:`, error.message)

      // Update with error
      await prisma.mintTransaction.update({
        where: { id: mintTx.id },
        data: {
          status: mintTx.attempts + 1 >= this.maxRetries ? MintStatus.FAILED : MintStatus.PENDING,
          lastError: error.message || 'Unknown error',
        },
      })

      // If max retries reached, mark NFT as failed
      if (mintTx.attempts + 1 >= this.maxRetries) {
        await prisma.nFT.update({
          where: { id: mintTx.nftId },
          data: {
            status: NFTStatus.FAILED,
          },
        })

        console.error(`💀 NFT #${mintTx.nft.tokenId} failed after ${this.maxRetries} attempts`)
      }
    }
  }

  stop() {
    this.isRunning = false
  }
}
