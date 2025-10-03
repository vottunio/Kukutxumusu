'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseSepolia } from '@/lib/chains'
import PaymentABI from '../../../contracts/abis/KukuxumusuPayment_ABI.json'
import { getTokenByAddress } from '@/config/tokens'

const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`

// Role constants from contract
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
const AUCTION_CREATOR_ROLE = '0x' + Buffer.from('AUCTION_CREATOR_ROLE').toString('hex').padEnd(64, '0')

type Tab = 'tokens' | 'roles' | 'config' | 'emergency'

export function ContractAdminPanel() {
  const {  isConnected } = useWallet()
  const [activeTab, setActiveTab] = useState<Tab>('tokens')

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Token Management State
  const [tokenAddress, setTokenAddress] = useState('')
  //const [tokenPrice] = useState('')
  const [tokenAllowed, setTokenAllowed] = useState(true)

  // Role Management State
  const [roleAddress, setRoleAddress] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>(AUCTION_CREATOR_ROLE)

  // Config State
  const [newTreasury, setNewTreasury] = useState('')
  const [newSigner, setNewSigner] = useState('')
  const [nftContractAddress, setNftContractAddress] = useState('')
  const [nftContractAllowed, setNftContractAllowed] = useState(true)

  // Withdraw State
  const [withdrawToken, setWithdrawToken] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // Token Management Functions
  const handleSetAllowedToken = async () => {
    if (!tokenAddress) return
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'setAllowedPaymentToken',
      args: [tokenAddress as `0x${string}`, tokenAllowed],
      chainId: baseSepolia.id,
    })
  }

  // Role Management Functions
  const handleGrantRole = async () => {
    if (!roleAddress) return
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'grantRole',
      args: [selectedRole as `0x${string}`, roleAddress as `0x${string}`],
      chainId: baseSepolia.id,
    })
  }

  const handleRevokeRole = async () => {
    if (!roleAddress) return
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'revokeRole',
      args: [selectedRole as `0x${string}`, roleAddress as `0x${string}`],
      chainId: baseSepolia.id,
    })
  }

  // Config Functions
  const handleSetTreasury = async () => {
    if (!newTreasury) return
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'setTreasury',
      args: [newTreasury as `0x${string}`],
      chainId: baseSepolia.id,
    })
  }

  const handleSetSigner = async () => {
    if (!newSigner) return
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'setTrustedSigner',
      args: [newSigner as `0x${string}`],
      chainId: baseSepolia.id,
    })
  }

  const handleSetAllowedNFTContract = async () => {
    if (!nftContractAddress) return
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'setAllowedNFTContract',
      args: [nftContractAddress as `0x${string}`, nftContractAllowed],
      chainId: baseSepolia.id,
    })
  }

  // Emergency Functions
  const handlePause = async () => {
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'pause',
      chainId: baseSepolia.id,
    })
  }

  const handleUnpause = async () => {
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'unpause',
      chainId: baseSepolia.id,
    })
  }

  const handleWithdraw = async () => {
    if (!withdrawToken || !withdrawAmount) return
    const tokenConfig = getTokenByAddress(withdrawToken)
    const decimals = tokenConfig?.decimals || 18
    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PaymentABI,
      functionName: 'withdraw',
      args: [
        withdrawToken as `0x${string}`,
        BigInt(Math.floor(parseFloat(withdrawAmount) * Math.pow(10, decimals))),
      ],
      chainId: baseSepolia.id,
    })
  }

  const tabs = [
    { id: 'tokens' as Tab, label: 'Token Management' },
    { id: 'roles' as Tab, label: 'Roles' },
    { id: 'config' as Tab, label: 'Configuration' },
    { id: 'emergency' as Tab, label: 'Emergency' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Administration</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Token Management Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Add/Remove Payment Token</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Token Address (0x...)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={tokenAllowed}
                      onChange={() => setTokenAllowed(true)}
                    />
                    <span>Allow</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!tokenAllowed}
                      onChange={() => setTokenAllowed(false)}
                    />
                    <span>Disallow</span>
                  </label>
                </div>
                <Button onClick={handleSetAllowedToken} disabled={!isConnected || isPending}>
                  {isPending ? 'Processing...' : 'Set Token Status'}
                </Button>
              </div>
            </div>

            <div className="border-t pt-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Nota:</strong> Los precios de tokens se obtienen automáticamente desde CoinGecko API.
                El relayer firma las conversiones USD para cada bid. No necesitas configurar precios manualmente.
              </p>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Grant/Revoke Roles</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={roleAddress}
                  onChange={(e) => setRoleAddress(e.target.value)}
                  placeholder="Wallet Address (0x...)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value={DEFAULT_ADMIN_ROLE}>Admin Role</option>
                  <option value={AUCTION_CREATOR_ROLE}>Auction Creator Role</option>
                </select>
                <div className="flex gap-3">
                  <Button onClick={handleGrantRole} disabled={!isConnected || isPending}>
                    {isPending ? 'Processing...' : 'Grant Role'}
                  </Button>
                  <Button
                    onClick={handleRevokeRole}
                    disabled={!isConnected || isPending}
                    variant="outline"
                  >
                    {isPending ? 'Processing...' : 'Revoke Role'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Set Treasury Address</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTreasury}
                  onChange={(e) => setNewTreasury(e.target.value)}
                  placeholder="New Treasury Address (0x...)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <Button onClick={handleSetTreasury} disabled={!isConnected || isPending}>
                  {isPending ? 'Processing...' : 'Update Treasury'}
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Set Trusted Signer (Relayer)</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSigner}
                  onChange={(e) => setNewSigner(e.target.value)}
                  placeholder="Relayer Address (0x...)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <Button onClick={handleSetSigner} disabled={!isConnected || isPending}>
                  {isPending ? 'Processing...' : 'Update Signer'}
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Allow/Disallow NFT Contract</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={nftContractAddress}
                  onChange={(e) => setNftContractAddress(e.target.value)}
                  placeholder="NFT Contract Address (0x...)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={nftContractAllowed}
                      onChange={() => setNftContractAllowed(true)}
                    />
                    <span>Allow</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!nftContractAllowed}
                      onChange={() => setNftContractAllowed(false)}
                    />
                    <span>Disallow</span>
                  </label>
                </div>
                <Button onClick={handleSetAllowedNFTContract} disabled={!isConnected || isPending}>
                  {isPending ? 'Processing...' : 'Set NFT Contract Status'}
                </Button>
                <p className="text-xs text-gray-500">
                  ℹ️ Use: <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pause/Unpause Contract</h3>
              <div className="flex gap-3">
                <Button
                  onClick={handlePause}
                  disabled={!isConnected || isPending}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  {isPending ? 'Processing...' : 'Pause Contract'}
                </Button>
                <Button
                  onClick={handleUnpause}
                  disabled={!isConnected || isPending}
                  variant="outline"
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  {isPending ? 'Processing...' : 'Unpause Contract'}
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={withdrawToken}
                  onChange={(e) => setWithdrawToken(e.target.value)}
                  placeholder="Token Address (0x... or 0xEEE for ETH)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <Button
                  onClick={handleWithdraw}
                  disabled={!isConnected || isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isPending ? 'Processing...' : 'Withdraw'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        )}

        {isSuccess && (
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">Transaction successful!</p>
            {hash && (
              <a
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline mt-1 block"
              >
                View on Basescan →
              </a>
            )}
          </div>
        )}

        {isConfirming && (
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Waiting for confirmation...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
