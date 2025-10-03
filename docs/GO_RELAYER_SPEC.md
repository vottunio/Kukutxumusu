# Go Relayer - Complete Technical Specification

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [REST API Endpoints](#rest-api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Database Schema](#database-schema)
7. [Configuration](#configuration)
8. [Implementation Guide](#implementation-guide)
9. [Deployment](#deployment)

---

## Overview

The Go Relayer is a critical microservice that bridges the Base blockchain (payments) with Story Protocol (NFT minting). It serves two main purposes:

### Primary Responsibilities

**1. Price Oracle & Signature Service**
- Fetch real-time token prices from multiple sources (CoinGecko, QuickNode)
- Calculate USD values for bids
- Sign price data cryptographically for on-chain validation
- Provide REST endpoints for Next.js frontend to consume

**2. Cross-Chain Event Listener & Executor**
- Monitor Base blockchain for payment/auction events
- Automatically mint NFTs on Story Protocol when auctions end
- Manage transaction queue with retry logic
- Ensure idempotency (no double mints)

### Technology Stack
- **Language:** Go 1.21+
- **Blockchain:** go-ethereum (Geth)
- **Web Framework:** Gin or Echo
- **Database:** PostgreSQL 15
- **Cache:** In-memory or Redis
- **Logging:** Zap (structured JSON logs)
- **Metrics:** Prometheus

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Next.js Frontend                       │
│  (User places bid with token amount)                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTP Request
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     Go Relayer - REST API                    │
│  POST /api/sign-bid                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Fetch token price (CoinGecko/QuickNode/Cache)     │  │
│  │ 2. Calculate valueInUSD = amount * price             │  │
│  │ 3. Generate signature with trustedSigner wallet      │  │
│  │ 4. Return { valueInUSD, signature, timestamp }       │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Response
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                       Next.js Frontend                       │
│  Submit bid to Base contract with signature                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Transaction
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                Base Blockchain (Payment Contract)            │
│  Event: BidPlaced, AuctionWon                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ WebSocket/Event Listener
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                Go Relayer - Event Processor                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Detect AuctionWon event                           │  │
│  │ 2. Add to mint queue (PostgreSQL)                    │  │
│  │ 3. Call Story Protocol mint function                 │  │
│  │ 4. Transfer NFT to winner                            │  │
│  │ 5. Update status (retry on failure)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Mint Transaction
                   ▼
┌─────────────────────────────────────────────────────────────┐
│           Story Protocol Blockchain (NFT Contract)           │
│  NFT minted and transferred to winner                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
relayer/
├── cmd/
│   └── relayer/
│       └── main.go                 # Entry point
│
├── internal/
│   ├── config/
│   │   └── config.go              # Environment configuration
│   │
│   ├── blockchain/
│   │   ├── base_client.go         # Base blockchain client
│   │   ├── story_client.go        # Story Protocol client
│   │   ├── event_listener.go      # Event subscription & processing
│   │   └── contracts/
│   │       ├── payment.go         # Payment contract bindings (abigen)
│   │       └── nft.go             # NFT contract bindings (abigen)
│   │
│   ├── price/
│   │   ├── oracle.go              # Price fetching orchestrator
│   │   ├── sources/
│   │   │   ├── coingecko.go       # CoinGecko API client
│   │   │   ├── quicknode.go       # QuickNode API client
│   │   │   └── fallback.go        # Fallback fixed prices
│   │   ├── signer.go              # ECDSA signature generation
│   │   └── cache.go               # Price caching layer
│   │
│   ├── api/
│   │   ├── server.go              # HTTP server setup (Gin)
│   │   ├── handlers/
│   │   │   ├── price.go           # GET /api/price/:token
│   │   │   ├── sign_bid.go        # POST /api/sign-bid
│   │   │   ├── queue.go           # GET /api/queue
│   │   │   ├── transaction.go     # GET /api/tx/:hash
│   │   │   └── health.go          # GET /health
│   │   └── middleware/
│   │       ├── cors.go            # CORS configuration
│   │       ├── logger.go          # Request logging
│   │       └── auth.go            # Admin authentication (optional)
│   │
│   ├── queue/
│   │   ├── database.go            # PostgreSQL connection
│   │   ├── models.go              # Database models
│   │   ├── repository.go          # DB operations (CRUD)
│   │   └── processor.go           # Queue processing with retries
│   │
│   ├── monitoring/
│   │   ├── metrics.go             # Prometheus metrics
│   │   ├── logger.go              # Zap logger setup
│   │   └── alerts.go              # Alert system (optional)
│   │
│   └── utils/
│       ├── crypto.go              # Cryptographic utilities
│       ├── retry.go               # Exponential backoff
│       └── errors.go              # Custom error types
│
├── contracts/                      # Smart contract ABIs
│   ├── KukuxumusuPayment_ABI.json
│   └── KukuxumusuNFTFactory_ABI.json
│
├── migrations/                     # Database migrations
│   ├── 001_initial_schema.up.sql
│   └── 001_initial_schema.down.sql
│
├── .env.example                    # Environment variables template
├── go.mod
├── go.sum
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## REST API Endpoints

### 1. Sign Bid Endpoint (CRITICAL FOR FRONTEND)

**Endpoint:** `POST /api/sign-bid`

**Purpose:** Generate signed price data for placing a bid on an auction

**Request Body:**
```json
{
  "auctionId": 1,
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "amount": "1000000000000000000",
  "bidder": "0x1234567890123456789012345678901234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "amount": "1000000000000000000",
    "valueInUSD": "3500000000000000000",
    "signature": "0x1234567890abcdef...",
    "timestamp": 1734567890,
    "pricePerToken": 3500.00,
    "expiresAt": 1734568190
  }
}
```

**Error Responses:**
```json
// Invalid token
{
  "success": false,
  "error": "Token not supported",
  "code": "INVALID_TOKEN"
}

// Price fetch failed
{
  "success": false,
  "error": "Unable to fetch price from all sources",
  "code": "PRICE_UNAVAILABLE"
}

// Invalid amount
{
  "success": false,
  "error": "Amount must be greater than zero",
  "code": "INVALID_AMOUNT"
}
```

**Frontend Usage (Next.js):**
```typescript
// src/lib/relayer.ts
export async function signBid(
  auctionId: number,
  tokenAddress: string,
  amount: bigint,
  bidder: string
): Promise<{ valueInUSD: bigint; signature: `0x${string}` }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_RELAYER_URL}/api/sign-bid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auctionId,
      tokenAddress,
      amount: amount.toString(),
      bidder
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to sign bid')
  }

  const data = await response.json()
  return {
    valueInUSD: BigInt(data.data.valueInUSD),
    signature: data.data.signature as `0x${string}`
  }
}
```

---

### 2. Get Token Price

**Endpoint:** `GET /api/price/:token`

**Purpose:** Get current price in USD for a specific token

**Parameters:**
- `token` (path): Token symbol (ETH, VTN, USDT) or address

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "ETH",
    "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "priceUSD": 3500.50,
    "source": "coingecko",
    "timestamp": 1734567890,
    "cachedAt": 1734567800
  }
}
```

**Frontend Usage:**
```typescript
export async function getTokenPrice(tokenSymbol: string): Promise<number> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_RELAYER_URL}/api/price/${tokenSymbol}`
  )
  const data = await response.json()
  return data.data.priceUSD
}
```

---

### 3. Get Mint Queue Status

**Endpoint:** `GET /api/queue`

**Purpose:** View pending cross-chain mint operations

**Query Parameters:**
- `status` (optional): Filter by status (pending, processing, completed, failed)
- `limit` (optional): Number of results (default 50, max 100)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 5,
    "processing": 2,
    "completed": 140,
    "failed": 3,
    "items": [
      {
        "id": 123,
        "auctionId": 1,
        "nftId": 42,
        "winnerAddress": "0x1234...",
        "paymentTxHash": "0xabcd...",
        "tokenAddress": "0x8335...",
        "amount": "100000000",
        "valueUSD": "100000000000000000000",
        "status": "pending",
        "retryCount": 0,
        "createdAt": "2024-12-18T10:30:00Z",
        "updatedAt": "2024-12-18T10:30:00Z",
        "mintTxHash": null,
        "lastError": null
      }
    ]
  }
}
```

**Frontend Usage:**
```typescript
export async function getMintQueue(status?: string) {
  const url = new URL(`${process.env.NEXT_PUBLIC_RELAYER_URL}/api/queue`)
  if (status) url.searchParams.set('status', status)

  const response = await fetch(url.toString())
  return response.json()
}
```

---

### 4. Get Transaction Status

**Endpoint:** `GET /api/tx/:hash`

**Purpose:** Get cross-chain transaction status for a specific payment transaction

**Parameters:**
- `hash` (path): Payment transaction hash from Base

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentTxHash": "0xabcd1234...",
    "status": "completed",
    "auctionId": 1,
    "nftId": 42,
    "winner": "0x1234...",
    "mintTxHash": "0xef567890...",
    "mintedAt": "2024-12-18T10:35:00Z",
    "retryCount": 0,
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2024-12-18T10:30:00Z"
      },
      {
        "status": "processing",
        "timestamp": "2024-12-18T10:31:00Z"
      },
      {
        "status": "completed",
        "timestamp": "2024-12-18T10:35:00Z"
      }
    ]
  }
}
```

**Frontend Usage:**
```typescript
export async function getTransactionStatus(paymentTxHash: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_RELAYER_URL}/api/tx/${paymentTxHash}`
  )
  return response.json()
}

// Use in a component with polling
const { data, error } = useSWR(
  paymentTxHash ? `/api/tx/${paymentTxHash}` : null,
  () => getTransactionStatus(paymentTxHash!),
  { refreshInterval: 5000 } // Poll every 5 seconds
)
```

---

### 5. Health Check

**Endpoint:** `GET /health`

**Purpose:** Check if relayer service is healthy

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1734567890,
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "baseRPC": "healthy",
    "storyRPC": "healthy",
    "priceOracle": "healthy"
  },
  "uptime": 86400
}
```

---

### 6. Prometheus Metrics

**Endpoint:** `GET /metrics`

**Purpose:** Prometheus metrics for monitoring

**Response:** (Prometheus format)
```
# HELP relayer_events_processed_total Total number of blockchain events processed
# TYPE relayer_events_processed_total counter
relayer_events_processed_total{event_type="AuctionWon",status="success"} 142
relayer_events_processed_total{event_type="AuctionWon",status="failed"} 3

# HELP relayer_mint_duration_seconds Time taken to mint NFT on Story
# TYPE relayer_mint_duration_seconds histogram
relayer_mint_duration_seconds_bucket{status="success",le="5"} 120
relayer_mint_duration_seconds_bucket{status="success",le="10"} 140
relayer_mint_duration_seconds_bucket{status="success",le="30"} 142

# HELP relayer_queue_size Current number of items in mint queue
# TYPE relayer_queue_size gauge
relayer_queue_size{status="pending"} 5
relayer_queue_size{status="processing"} 2

# HELP relayer_price_fetch_errors_total Total price fetch errors
# TYPE relayer_price_fetch_errors_total counter
relayer_price_fetch_errors_total{source="coingecko"} 2
relayer_price_fetch_errors_total{source="quicknode"} 0
```

---

## Frontend Integration

### Environment Variables (.env.local)

```bash
# Relayer URL
NEXT_PUBLIC_RELAYER_URL=http://localhost:8080

# Or in production
NEXT_PUBLIC_RELAYER_URL=https://relayer.kukuxumusu.com
```

### Complete Integration Example

**1. Update BidForm to use relayer:**

```typescript
// src/components/auction/BidForm.tsx
import { signBid } from '@/lib/relayer'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!isConnected || !address || !selectedToken) {
    alert('Please connect your wallet and select a token')
    return
  }

  try {
    const amountInWei = parseUnits(bidAmount, selectedToken.decimals)

    // 1. Get signature from relayer
    setIsLoadingSignature(true)
    const { valueInUSD, signature } = await signBid(
      auctionId,
      selectedToken.address,
      amountInWei,
      address
    )
    setIsLoadingSignature(false)

    // 2. Place bid with signature
    await placeBidWithApproval(
      auctionId,
      selectedToken.address,
      amountInWei,
      valueInUSD,
      signature,
      address
    )

    if (isSuccess) {
      setBidAmount('')
      if (onSuccess) onSuccess()
    }
  } catch (err: any) {
    console.error('Error placing bid:', err)
    setError(err.message)
  }
}
```

**2. Create relayer client library:**

```typescript
// src/lib/relayer.ts
const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:8080'

export class RelayerClient {
  private baseUrl: string

  constructor(baseUrl: string = RELAYER_URL) {
    this.baseUrl = baseUrl
  }

  async signBid(
    auctionId: number,
    tokenAddress: string,
    amount: bigint,
    bidder: string
  ): Promise<{ valueInUSD: bigint; signature: `0x${string}`; pricePerToken: number }> {
    const response = await fetch(`${this.baseUrl}/api/sign-bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auctionId,
        tokenAddress,
        amount: amount.toString(),
        bidder
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to sign bid')
    }

    const data = await response.json()
    return {
      valueInUSD: BigInt(data.data.valueInUSD),
      signature: data.data.signature as `0x${string}`,
      pricePerToken: data.data.pricePerToken
    }
  }

  async getTokenPrice(symbol: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/api/price/${symbol}`)
    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data.priceUSD
  }

  async getTransactionStatus(paymentTxHash: string) {
    const response = await fetch(`${this.baseUrl}/api/tx/${paymentTxHash}`)
    return response.json()
  }

  async getQueue(status?: string) {
    const url = new URL(`${this.baseUrl}/api/queue`)
    if (status) url.searchParams.set('status', status)
    const response = await fetch(url.toString())
    return response.json()
  }

  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`)
    return response.json()
  }
}

export const relayerClient = new RelayerClient()
```

**3. React Hook for cross-chain tracking:**

```typescript
// src/hooks/useCrossChainTracking.ts
import { useState, useEffect } from 'react'
import { relayerClient } from '@/lib/relayer'

export function useCrossChainTracking(paymentTxHash?: string) {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!paymentTxHash) return

    const fetchStatus = async () => {
      setIsLoading(true)
      try {
        const data = await relayerClient.getTransactionStatus(paymentTxHash)
        setStatus(data.data)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()

    // Poll every 5 seconds if not completed
    const interval = setInterval(() => {
      if (status?.status !== 'completed' && status?.status !== 'failed') {
        fetchStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [paymentTxHash, status?.status])

  return { status, isLoading, error }
}
```

**4. Display cross-chain status component:**

```typescript
// src/components/CrossChainStatus.tsx
export function CrossChainStatus({ paymentTxHash }: { paymentTxHash: string }) {
  const { status, isLoading } = useCrossChainTracking(paymentTxHash)

  if (isLoading && !status) return <div>Loading...</div>

  return (
    <div className="space-y-2">
      <h3 className="font-bold">Cross-Chain Status</h3>
      <div className="flex items-center gap-2">
        <StatusIcon status={status?.status} />
        <span>{status?.status || 'Unknown'}</span>
      </div>

      {status?.timeline && (
        <div className="space-y-1 text-sm">
          {status.timeline.map((item: any, i: number) => (
            <div key={i} className="flex justify-between">
              <span>{item.status}</span>
              <span>{new Date(item.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {status?.mintTxHash && (
        <a
          href={`https://explorer.story.foundation/tx/${status.mintTxHash}`}
          target="_blank"
          className="text-blue-600 hover:underline text-sm"
        >
          View mint transaction →
        </a>
      )}
    </div>
  )
}
```

---

## Database Schema

### PostgreSQL Tables

```sql
-- Mint queue for cross-chain operations
CREATE TABLE mint_queue (
    id SERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    nft_id BIGINT NOT NULL,
    winner_address VARCHAR(42) NOT NULL,
    payment_tx_hash VARCHAR(66) NOT NULL UNIQUE,
    token_address VARCHAR(42) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    value_usd NUMERIC(78, 0) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INT DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    mint_tx_hash VARCHAR(66),
    minted_at TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_payment_tx (payment_tx_hash),
    INDEX idx_created_at (created_at)
);

-- Price cache to reduce API calls
CREATE TABLE price_cache (
    token_address VARCHAR(42) PRIMARY KEY,
    token_symbol VARCHAR(10) NOT NULL,
    price_usd NUMERIC(20, 8) NOT NULL,
    source VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_expires_at (expires_at)
);

-- Bid signatures for audit trail
CREATE TABLE bid_signatures (
    id SERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    bidder VARCHAR(42) NOT NULL,
    token_address VARCHAR(42) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    value_usd NUMERIC(78, 0) NOT NULL,
    signature VARCHAR(132) NOT NULL,
    timestamp BIGINT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_auction_bidder (auction_id, bidder),
    INDEX idx_used (used)
);

-- Event processing log
CREATE TABLE event_log (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_processed (processed),
    INDEX idx_event_type (event_type)
);
```

---

## Configuration

### Environment Variables

```bash
# Server
PORT=8080
ENVIRONMENT=production
LOG_LEVEL=info

# Blockchain - Base (Payments)
BASE_RPC_URL=https://mainnet.base.org
BASE_WS_URL=wss://mainnet.base.org
PAYMENT_CONTRACT_ADDRESS=0x535683a04a9bFE0F9EF102336706A981d12fF125

# Blockchain - Story Protocol (NFTs)
STORY_RPC_URL=https://rpc.story.foundation
STORY_WS_URL=wss://rpc.story.foundation
NFT_CONTRACT_ADDRESS=0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7

# Wallets (CRITICAL - KEEP SECRET)
RELAYER_PRIVATE_KEY=0x...                    # For minting NFTs on Story
TRUSTED_SIGNER_PRIVATE_KEY=0x...             # For signing price data

# Price APIs
COINGECKO_API_KEY=your_coingecko_api_key
QUICKNODE_VTN_API_URL=https://quick-old-patina.base-mainnet.quiknode.pro/.../0xA9bc478A44a8c8FE6fd505C1964dEB3cEE3b7abC?target=aero

# IPFS
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kukuxumusu_relayer?sslmode=disable

# Cache
REDIS_URL=redis://localhost:6379/0
PRICE_CACHE_TTL=300                          # 5 minutes in seconds

# Monitoring
PROMETHEUS_ENABLED=true
SENTRY_DSN=https://...                       # Optional error tracking

# CORS
CORS_ALLOWED_ORIGINS=https://kukuxumusu.com,http://localhost:3000
```

---

## Implementation Guide

### Step 1: Initialize Go Project

```bash
mkdir relayer && cd relayer
go mod init github.com/kukuxumusu/relayer
go get -u github.com/ethereum/go-ethereum
go get -u github.com/gin-gonic/gin
go get -u github.com/lib/pq
go get -u go.uber.org/zap
go get -u github.com/prometheus/client_golang
```

### Step 2: Generate Contract Bindings

```bash
# Install abigen
go install github.com/ethereum/go-ethereum/cmd/abigen@latest

# Generate Go bindings from ABIs
abigen --abi=../contracts/abis/KukuxumusuPayment_ABI.json --pkg=contracts --type=Payment --out=internal/blockchain/contracts/payment.go
abigen --abi=../contracts/abis/KukuxumusuNFTFactory_ABI.json --pkg=contracts --type=NFT --out=internal/blockchain/contracts/nft.go
```

### Step 3: Implement Price Oracle

```go
// internal/price/oracle.go
package price

import (
    "context"
    "fmt"
    "time"
)

type Oracle struct {
    coingecko *CoinGeckoClient
    quicknode *QuickNodeClient
    cache     *Cache
}

func NewOracle(cfg *Config) *Oracle {
    return &Oracle{
        coingecko: NewCoinGeckoClient(cfg.CoinGeckoAPIKey),
        quicknode: NewQuickNodeClient(cfg.QuickNodeURL),
        cache:     NewCache(cfg.CacheTTL),
    }
}

func (o *Oracle) GetPrice(ctx context.Context, tokenAddress string) (float64, error) {
    // 1. Check cache first
    if price, ok := o.cache.Get(tokenAddress); ok {
        return price, nil
    }

    // 2. Fetch from appropriate source
    var price float64
    var err error

    switch tokenAddress {
    case "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": // ETH
        price, err = o.coingecko.GetPrice("ethereum")
    case "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": // USDT
        price, err = o.coingecko.GetPrice("tether")
    case "0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E": // VTN
        price, err = o.quicknode.GetPrice()
    default:
        return 0, fmt.Errorf("unsupported token: %s", tokenAddress)
    }

    if err != nil {
        return 0, err
    }

    // 3. Cache the result
    o.cache.Set(tokenAddress, price, 5*time.Minute)

    return price, nil
}
```

### Step 4: Implement Signature Service

```go
// internal/price/signer.go
package price

import (
    "crypto/ecdsa"
    "fmt"
    "math/big"

    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/crypto"
)

type Signer struct {
    privateKey *ecdsa.PrivateKey
}

func NewSigner(privateKeyHex string) (*Signer, error) {
    privateKey, err := crypto.HexToECDSA(privateKeyHex)
    if err != nil {
        return nil, err
    }
    return &Signer{privateKey: privateKey}, nil
}

func (s *Signer) SignBid(
    tokenAddress common.Address,
    amount *big.Int,
    valueInUSD *big.Int,
    bidder common.Address,
    auctionId *big.Int,
    timestamp int64,
) ([]byte, error) {
    // Create message hash
    message := crypto.Keccak256(
        tokenAddress.Bytes(),
        common.LeftPadBytes(amount.Bytes(), 32),
        common.LeftPadBytes(valueInUSD.Bytes(), 32),
        bidder.Bytes(),
        common.LeftPadBytes(auctionId.Bytes(), 32),
        common.LeftPadBytes(big.NewInt(timestamp).Bytes(), 32),
    )

    // Sign the message
    signature, err := crypto.Sign(message, s.privateKey)
    if err != nil {
        return nil, err
    }

    // Adjust V value for Ethereum
    signature[64] += 27

    return signature, nil
}
```

### Step 5: Implement REST API Handler

```go
// internal/api/handlers/sign_bid.go
package handlers

import (
    "math/big"
    "net/http"
    "time"

    "github.com/ethereum/go-ethereum/common"
    "github.com/gin-gonic/gin"
)

type SignBidRequest struct {
    AuctionID    uint64 `json:"auctionId" binding:"required"`
    TokenAddress string `json:"tokenAddress" binding:"required"`
    Amount       string `json:"amount" binding:"required"`
    Bidder       string `json:"bidder" binding:"required"`
}

type SignBidResponse struct {
    TokenAddress  string  `json:"tokenAddress"`
    Amount        string  `json:"amount"`
    ValueInUSD    string  `json:"valueInUSD"`
    Signature     string  `json:"signature"`
    Timestamp     int64   `json:"timestamp"`
    PricePerToken float64 `json:"pricePerToken"`
    ExpiresAt     int64   `json:"expiresAt"`
}

func (h *Handler) SignBid(c *gin.Context) {
    var req SignBidRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "error":   "Invalid request body",
            "code":    "INVALID_REQUEST",
        })
        return
    }

    // Parse addresses and amounts
    tokenAddr := common.HexToAddress(req.TokenAddress)
    bidderAddr := common.HexToAddress(req.Bidder)
    amount := new(big.Int)
    amount.SetString(req.Amount, 10)

    // Get token price
    price, err := h.oracle.GetPrice(c.Request.Context(), req.TokenAddress)
    if err != nil {
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "success": false,
            "error":   "Unable to fetch token price",
            "code":    "PRICE_UNAVAILABLE",
        })
        return
    }

    // Calculate USD value
    // valueInUSD = (amount / 10^decimals) * price * 10^18
    decimals := h.getTokenDecimals(req.TokenAddress)
    amountFloat := new(big.Float).SetInt(amount)
    amountFloat.Quo(amountFloat, big.NewFloat(math.Pow10(decimals)))

    valueFloat := new(big.Float).Mul(amountFloat, big.NewFloat(price))
    valueFloat.Mul(valueFloat, big.NewFloat(1e18))

    valueInUSD := new(big.Int)
    valueFloat.Int(valueInUSD)

    // Generate signature
    timestamp := time.Now().Unix()
    signature, err := h.signer.SignBid(
        tokenAddr,
        amount,
        valueInUSD,
        bidderAddr,
        big.NewInt(int64(req.AuctionID)),
        timestamp,
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error":   "Failed to generate signature",
            "code":    "SIGNATURE_ERROR",
        })
        return
    }

    // Save to database for audit
    h.db.SaveBidSignature(&BidSignature{
        AuctionID:    req.AuctionID,
        Bidder:       req.Bidder,
        TokenAddress: req.TokenAddress,
        Amount:       amount.String(),
        ValueUSD:     valueInUSD.String(),
        Signature:    common.Bytes2Hex(signature),
        Timestamp:    timestamp,
    })

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": SignBidResponse{
            TokenAddress:  req.TokenAddress,
            Amount:        amount.String(),
            ValueInUSD:    valueInUSD.String(),
            Signature:     "0x" + common.Bytes2Hex(signature),
            Timestamp:     timestamp,
            PricePerToken: price,
            ExpiresAt:     timestamp + 300, // 5 minutes
        },
    })
}
```

### Step 6: Implement Event Listener

```go
// internal/blockchain/event_listener.go
package blockchain

import (
    "context"
    "log"
    "math/big"

    "github.com/ethereum/go-ethereum"
    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/core/types"
    "github.com/ethereum/go-ethereum/ethclient"
)

type EventListener struct {
    client          *ethclient.Client
    contractAddress common.Address
    queue           *queue.Processor
}

func (l *EventListener) Start(ctx context.Context) error {
    // Subscribe to AuctionWon events
    query := ethereum.FilterQuery{
        Addresses: []common.Address{l.contractAddress},
        Topics: [][]common.Hash{
            {crypto.Keccak256Hash([]byte("AuctionWon(uint256,address,address,uint256,address,uint256)"))},
        },
    }

    logs := make(chan types.Log)
    sub, err := l.client.SubscribeFilterLogs(ctx, query, logs)
    if err != nil {
        return err
    }

    go func() {
        for {
            select {
            case err := <-sub.Err():
                log.Printf("Subscription error: %v", err)
                return
            case vLog := <-logs:
                l.handleAuctionWon(vLog)
            case <-ctx.Done():
                return
            }
        }
    }()

    return nil
}

func (l *EventListener) handleAuctionWon(vLog types.Log) {
    // Parse event data
    event := struct {
        AuctionID  *big.Int
        Winner     common.Address
        NFTContract common.Address
        NFTID      *big.Int
        Token      common.Address
        Amount     *big.Int
    }{}

    // Add to mint queue
    l.queue.Add(&queue.MintTask{
        AuctionID:     event.AuctionID.Uint64(),
        NFTID:         event.NFTID.Uint64(),
        Winner:        event.Winner.Hex(),
        PaymentTxHash: vLog.TxHash.Hex(),
        TokenAddress:  event.Token.Hex(),
        Amount:        event.Amount.String(),
    })
}
```

---

## Deployment

### Docker Setup

**Dockerfile:**
```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git build-base

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o relayer ./cmd/relayer

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/relayer .
COPY --from=builder /app/contracts ./contracts

EXPOSE 8080

CMD ["./relayer"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  relayer:
    build: .
    container_name: kukuxumusu-relayer
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - DATABASE_URL=postgresql://relayer:${DB_PASSWORD}@postgres:5432/kukuxumusu?sslmode=disable
      - BASE_RPC_URL=${BASE_RPC_URL}
      - STORY_RPC_URL=${STORY_RPC_URL}
      - RELAYER_PRIVATE_KEY=${RELAYER_PRIVATE_KEY}
      - TRUSTED_SIGNER_PRIVATE_KEY=${TRUSTED_SIGNER_PRIVATE_KEY}
      - COINGECKO_API_KEY=${COINGECKO_API_KEY}
      - QUICKNODE_VTN_API_URL=${QUICKNODE_VTN_API_URL}
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - relayer-network

  postgres:
    image: postgres:15-alpine
    container_name: kukuxumusu-db
    environment:
      - POSTGRES_USER=relayer
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=kukuxumusu
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    networks:
      - relayer-network

  prometheus:
    image: prom/prometheus:latest
    container_name: kukuxumusu-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - relayer-network

volumes:
  postgres-data:
  prometheus-data:

networks:
  relayer-network:
    driver: bridge
```

---

## Testing Checklist

- [ ] Unit tests for price oracle (CoinGecko, QuickNode, cache)
- [ ] Unit tests for signature generation
- [ ] Integration test for `/api/sign-bid` endpoint
- [ ] Integration test for event listener
- [ ] Integration test for mint queue processor
- [ ] End-to-end test: auction → bid → mint
- [ ] Load testing for API endpoints (100 req/s)
- [ ] Failover testing (RPC down, database down)
- [ ] Security audit of private key handling

---

## Monitoring Dashboard

Create a Grafana dashboard to monitor:
- Events processed per minute
- Mint success/failure rate
- Average mint time
- Queue size over time
- Price API response times
- Database connection pool usage
- RPC connection health

---

## Production Deployment Steps

1. **Setup Infrastructure**
   - Provision AWS EC2 instance (t3.medium minimum)
   - Install Docker and Docker Compose
   - Configure security groups (port 8080)

2. **Database Setup**
   - Create RDS PostgreSQL instance
   - Run migrations
   - Configure backup schedule

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Fill in all production values
   - **CRITICAL:** Secure private keys (use AWS Secrets Manager)

4. **Deploy Service**
   ```bash
   docker-compose up -d
   ```

5. **Configure NGINX Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name relayer.kukuxumusu.com;

       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

6. **Setup SSL**
   ```bash
   certbot --nginx -d relayer.kukuxumusu.com
   ```

7. **Configure Monitoring**
   - Point Prometheus to relayer metrics
   - Create Grafana dashboards
   - Setup alerts for failures

---

## Support & Troubleshooting

**Common Issues:**

1. **Signature verification fails on contract**
   - Check that `trustedSigner` address matches the one set in Payment contract
   - Verify signature format (should start with 0x and be 132 chars)

2. **Price API rate limits**
   - Increase cache TTL
   - Add Redis for distributed caching
   - Consider upgrading CoinGecko plan

3. **Mint transactions fail**
   - Check relayer wallet has enough ETH for gas on Story
   - Verify NFT contract allows relayer address to mint
   - Check event logs in database

4. **Database connection pool exhausted**
   - Increase `max_connections` in PostgreSQL
   - Optimize query performance
   - Add connection pooling (pgbouncer)

---

## Next Steps

1. Build price oracle module
2. Build signature service
3. Build REST API with all endpoints
4. Build event listener for Base
5. Build mint processor for Story
6. Add comprehensive logging
7. Add Prometheus metrics
8. Write integration tests
9. Deploy to staging
10. Frontend integration testing
11. Deploy to production

**Estimated Development Time:** 5-7 days for full implementation
