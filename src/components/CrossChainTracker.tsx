'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react'

type TransactionStatus = 'pending' | 'confirmed' | 'failed'

interface CrossChainTransaction {
  id: string
  paymentTxHash: string
  paymentNetwork: string
  mintTxHash?: string
  mintNetwork: string
  tokenId?: string
  status: TransactionStatus
  timestamp: number
  buyer: string
}

export default function CrossChainTracker({ txHash }: { txHash?: string }) {
  const [transaction, setTransaction] = useState<CrossChainTransaction | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (txHash) {
      fetchTransaction(txHash)
    }
  }, [txHash])

  const fetchTransaction = async (hash: string) => {
    setLoading(true)
    try {
      // TODO: Replace with actual API endpoint from Go Relayer
      // const res = await fetch(`/api/relayer/transaction/${hash}`)
      // const data = await res.json()

      // Mock data for now
      const mockData: CrossChainTransaction = {
        id: '1',
        paymentTxHash: hash,
        paymentNetwork: 'Base Sepolia',
        mintNetwork: 'Story Protocol Testnet',
        status: 'pending',
        timestamp: Date.now(),
        buyer: '0x1234...5678'
      }

      setTransaction(mockData)
    } catch (error) {
      console.error('Error fetching transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!txHash) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Loading transaction...</p>
      </div>
    )
  }

  if (!transaction) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Cross-Chain Transaction Status
      </h3>

      <div className="space-y-6">
        {/* Step 1: Payment on Base */}
        <TransactionStep
          title="Payment on Base"
          status={transaction.status !== 'pending' ? 'confirmed' : 'confirmed'}
          txHash={transaction.paymentTxHash}
          network={transaction.paymentNetwork}
          explorerUrl={`https://sepolia.basescan.org/tx/${transaction.paymentTxHash}`}
        />

        {/* Step 2: Relayer Processing */}
        <TransactionStep
          title="Relayer Processing"
          status={transaction.mintTxHash ? 'confirmed' : transaction.status === 'failed' ? 'failed' : 'pending'}
          description="Relayer listening for payment event and preparing mint transaction"
        />

        {/* Step 3: NFT Mint on Story */}
        <TransactionStep
          title="NFT Mint on Story Protocol"
          status={transaction.mintTxHash ? 'confirmed' : 'pending'}
          txHash={transaction.mintTxHash}
          network={transaction.mintNetwork}
          explorerUrl={transaction.mintTxHash ? `https://testnet.storyscan.xyz/tx/${transaction.mintTxHash}` : undefined}
          tokenId={transaction.tokenId}
        />
      </div>

      {/* Overall Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {transaction.status === 'confirmed' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-600">Transaction Complete</span>
            </>
          )}
          {transaction.status === 'pending' && (
            <>
              <Clock className="w-5 h-5 text-yellow-600 animate-spin" />
              <span className="font-medium text-yellow-600">Processing...</span>
            </>
          )}
          {transaction.status === 'failed' && (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-600">Transaction Failed</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function TransactionStep({
  title,
  status,
  txHash,
  network,
  explorerUrl,
  tokenId,
  description
}: {
  title: string
  status: TransactionStatus
  txHash?: string
  network?: string
  explorerUrl?: string
  tokenId?: string
  description?: string
}) {
  return (
    <div className="flex items-start gap-4">
      {/* Status Icon */}
      <div className="flex-shrink-0 mt-1">
        {status === 'confirmed' && (
          <CheckCircle className="w-6 h-6 text-green-600" />
        )}
        {status === 'pending' && (
          <Clock className="w-6 h-6 text-yellow-600" />
        )}
        {status === 'failed' && (
          <AlertCircle className="w-6 h-6 text-red-600" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1">{title}</h4>

        {description && (
          <p className="text-sm text-gray-600 mb-2">{description}</p>
        )}

        {network && (
          <p className="text-sm text-gray-500 mb-1">Network: {network}</p>
        )}

        {txHash && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Tx:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </code>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {tokenId && (
          <p className="text-sm text-gray-500 mt-1">Token ID: {tokenId}</p>
        )}
      </div>
    </div>
  )
}
