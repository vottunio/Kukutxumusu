# Kukuxumusu Worker Service

Node.js backend service for the Kukuxumusu NFT marketplace that handles:
- ✅ **Bid price signing** - Signs bid data with trusted signer for on-chain validation
- ✅ **Event listening** - Monitors Base blockchain for auction events
- ✅ **Mint execution** - Mints NFTs on Story Protocol when auctions end
- ✅ **Cross-chain coordination** - Manages the Base → Story Protocol flow

## 🏗️ Architecture

```
Frontend (Next.js) → Worker API (Port 8080) → Blockchain
                         ↓
                   /sign-bid endpoint
                   (signs prices)
                         ↓
                   Event Listener
                   (monitors Base)
                         ↓
                   Mint Executor
                   (mints on Story)
```

## 🚀 Setup

### 1. Install Dependencies

```bash
cd worker
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
# Worker Configuration
WORKER_PORT=8080

# Database
DATABASE_URL=postgres://...

# Redis
REDIS_URL=redis://localhost:6379

# Blockchain - Base Sepolia
BASE_RPC_URL=https://sepolia.base.org
PAYMENT_CONTRACT_ADDRESS=0xa04cEda1fc7eeB2559d2C3936cA678D91b4530E3s

# Blockchain - Story Protocol
STORY_RPC_URL=https://rpc.odyssey.storyrpc.io
NFT_FACTORY_ADDRESS=0x75bf7b1DD6b3a666F18c7784B78871C429E92C71

# Trusted Signer (CRITICAL - Keep secret!)
TRUSTED_SIGNER_PRIVATE_KEY=0x...

# IPFS/Pinata
PINATA_API_KEY=...
PINATA_SECRET=...
PINATA_JWT=...
```

### 3. Run the Worker

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## 📡 API Endpoints

### POST /sign-bid

Signs bid data with current token prices.

**Request:**
```json
{
  "auctionId": 1,
  "bidder": "0x...",
  "tokenAddress": "0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E",
  "amount": "50000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenAddress": "0x812BAe92A8A5BE95A68Be5653e565Fd469fE234E",
    "amount": "50000000000000000000",
    "valueInUSD": "205626842751654368",
    "signature": "0x...",
    "timestamp": 1728205620,
    "pricePerToken": 0.004113,
    "expiresAt": 1728205920
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T09:00:00.000Z",
  "trustedSigner": "0x..."
}
```

## 🔐 Trusted Signer

The worker uses a **trusted signer** private key to sign bid prices. This signature is verified on-chain by the smart contract.

**Security Notes:**
- ⚠️ Never commit the private key to git
- ⚠️ Keep the `.env` file secure
- ⚠️ Use a dedicated wallet for the trusted signer
- ⚠️ The trusted signer address must match the one configured in the smart contract

**Get trusted signer address:**
```bash
# From the private key, derive the public address
cast wallet address <PRIVATE_KEY>
```

## 🔄 Event Listener

The worker continuously monitors the Base blockchain for:
- `AuctionCreated` - New auctions
- `BidPlaced` - New bids
- `AuctionWon` - Auction winners
- `AuctionFinalized` - Completed auctions

## 🎨 Mint Executor

When an auction ends with a winner:
1. ✅ Detects `AuctionWon` event
2. ✅ Creates complete NFT metadata (including auction history)
3. ✅ Uploads metadata to IPFS via Pinata
4. ✅ Mints NFT on Story Protocol
5. ✅ Transfers NFT to winner

## 📊 Monitoring

View worker logs:
```bash
# Development
npm run dev

# Production (Docker)
docker-compose logs -f worker
```

## 🐛 Troubleshooting

**Worker not starting:**
- Check if port 8080 is available
- Verify database connection
- Verify Redis connection

**Signature errors:**
- Verify `TRUSTED_SIGNER_PRIVATE_KEY` is set
- Check that the trusted signer address matches the contract

**Price fetching errors:**
- Check QuickNode API is accessible
- Verify CoinGecko API is not rate-limited
- Check Redis is running for caching

**Mint failures:**
- Verify Story Protocol RPC is accessible
- Check NFT Factory address is correct
- Ensure worker wallet has sufficient funds for gas

## 📚 Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Blockchain:** viem (Ethereum interactions)
- **Database:** Prisma + PostgreSQL
- **Cache:** Redis
- **Storage:** Pinata (IPFS)

## 🏭 Production Deployment

The worker runs as a separate service alongside Next.js:

```
docker-compose up -d
```

This starts:
- ✅ Next.js frontend (Port 3000)
- ✅ Worker service (Port 8080)
- ✅ PostgreSQL database
- ✅ Redis cache
