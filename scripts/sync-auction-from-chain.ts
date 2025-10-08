/**
 * Script para sincronizar una auction desde blockchain a la base de datos
 * Uso: npx tsx scripts/sync-auction-from-chain.ts <txHash>
 */

import { createPublicClient, http, decodeEventLog } from 'viem'
import { baseSepolia } from 'viem/chains'
import { PrismaClient } from '@prisma/client'
import PaymentABI from '../contracts/abis/KukuxumusuPayment_ABI.json'

const prisma = new PrismaClient()

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org'),
})

async function syncAuctionFromChain(txHash: string) {
  try {
    console.log(`🔍 Buscando transacción: ${txHash}`)

    // Get transaction receipt
    const receipt = await baseClient.getTransactionReceipt({ hash: txHash as `0x${string}` })

    if (!receipt) {
      throw new Error('Transaction not found')
    }

    console.log('✅ Transacción encontrada')

    // Find AuctionCreated event
    const auctionCreatedLog = receipt.logs.find(log => {
      try {
        const decoded = decodeEventLog({
          abi: PaymentABI,
          data: log.data,
          topics: log.topics,
        })
        return decoded.eventName === 'AuctionCreated'
      } catch {
        return false
      }
    })

    if (!auctionCreatedLog) {
      throw new Error('AuctionCreated event not found in transaction')
    }

    // Decode event
    const decodedEvent = decodeEventLog({
      abi: PaymentABI,
      data: auctionCreatedLog.data,
      topics: auctionCreatedLog.topics,
    })

    const {
      auctionId,
      nftId: tokenId,
      startTime,
      endTime,
      allowedTokens,
      minPrices,
      discounts,
      antiSnipingExtension,
      antiSnipingTrigger,
    } = decodedEvent.args as any

    console.log(`\n📊 Datos del evento AuctionCreated:`)
    console.log(`  - Auction ID: ${auctionId}`)
    console.log(`  - Token ID: ${tokenId}`)
    console.log(`  - Start Time: ${new Date(Number(startTime) * 1000).toISOString()}`)
    console.log(`  - End Time: ${new Date(Number(endTime) * 1000).toISOString()}`)
    console.log(`  - Allowed Tokens: ${allowedTokens.length}`)

    // Find NFT in database by tokenId
    const nft = await prisma.nFT.findFirst({
      where: { tokenId: Number(tokenId) },
    })

    if (!nft) {
      throw new Error(`NFT with tokenId ${tokenId} not found in database`)
    }

    console.log(`\n✅ NFT encontrado en BD: ${nft.name} (id: ${nft.id})`)

    // Check if auction already exists
    const existingAuction = await prisma.auction.findUnique({
      where: { auctionId: Number(auctionId) },
    })

    if (existingAuction) {
      console.log(`\n⚠️  La auction ${auctionId} ya existe en la base de datos`)
      console.log('¿Quieres actualizarla? (Este script solo crea, no actualiza)')
      return
    }

    // Calculate duration
    const duration = Number(endTime - startTime)

    // Create auction in database
    const auction = await prisma.auction.create({
      data: {
        auctionId: Number(auctionId),
        nftId: nft.id,
        startTime: new Date(Number(startTime) * 1000),
        endTime: new Date(Number(endTime) * 1000),
        duration: duration,
        extensionTime: Number(antiSnipingExtension),
        triggerTime: Number(antiSnipingTrigger),
        allowedTokens: allowedTokens.map((addr: string) => addr.toLowerCase()),
        minPrices: minPrices.map((price: bigint) => price.toString()),
        discounts: discounts.map((discount: bigint) => discount.toString()),
        status: 'ACTIVE',
      },
    })

    // Update NFT status
    await prisma.nFT.update({
      where: { id: nft.id },
      data: { status: 'AUCTIONING' },
    })

    console.log(`\n✅ Auction ${auctionId} sincronizada correctamente en la base de datos`)
    console.log(`✅ NFT ${nft.id} actualizado a estado AUCTIONING`)
    console.log(`\n📊 Detalles de la auction:`)
    console.log(JSON.stringify(auction, null, 2))

  } catch (error: any) {
    console.error('❌ Error sincronizando auction:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get txHash from command line
const txHash = process.argv[2]

if (!txHash) {
  console.error('❌ Falta el transaction hash')
  console.log('\nUso: npx tsx scripts/sync-auction-from-chain.ts <txHash>')
  process.exit(1)
}

syncAuctionFromChain(txHash)
