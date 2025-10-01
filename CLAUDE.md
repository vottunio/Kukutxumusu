# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a cross-chain NFT marketplace project for Kukuxumusu, a Spanish design brand. The project involves creating a Web3 platform with auction and direct purchase capabilities using a cross-chain architecture.

**Key Features:**
- Cross-chain architecture: Payments on Base, NFTs on Story Protocol
- Multi-token payment system (VTN, ETH, USDT)
- Auction system with multiple simultaneous auctions
- Multi-wallet integration (MetaMask, WalletConnect)
- IPFS-based decentralized storage via Pinata
- Administrative dashboard for NFT uploads
- Public transparency dashboard showing sales and treasury balance
- Explore/gallery page with filtering capabilities
- Automated cross-chain relayer service

## Tech Stack

### Blockchain
- **Payment Network**: Base (handles payments and auctions)
- **NFT Network**: Story Protocol (handles NFT minting and ownership)
- **Payment Tokens**: VTN, ETH (native), USDT (ERC-20) - all on Base
- **Smart Contracts**: Solidity
  - Payment Contract (Base): Multi-token payments and auction system
  - NFT Contract (Story): ERC-721 with access-controlled minting
- **Storage**: IPFS + Pinata for images and metadata

### Frontend
- **Framework**: Next.js + TypeScript + Tailwind CSS
- **Web3 Integration**: wagmi + viem for multi-chain wallet connections
- **Hosting**: AWS EC2 with Docker containerization

### Backend/Relayer
- **Language**: Go
- **Libraries**: go-ethereum (Geth) for blockchain interactions
- **Database**: PostgreSQL or SQLite for transaction queue and cross-chain tracking
- **Concurrency**: Goroutines for simultaneous event listening
- **API**: REST endpoints for status and monitoring
- **Purpose**: Listens to payment events on Base and executes mints on Story

### Infrastructure
- **Deployment**: Docker + Docker Compose (3 services: frontend, backend, relayer)
- **CI/CD**: Automated pipeline for container builds and deployments
- **Domain**: Route 53 for DNS management
- **SSL/TLS**: Managed certificates
- **Monitoring**: CloudWatch for relayer monitoring and alerts

## Project Architecture

### Cross-Chain Design
The project uses a **two-contract cross-chain architecture**:

**Payment Contract (Base):**
- Handles all payments in VTN, ETH (native), or USDT (ERC-20)
- Multiple simultaneous time-limited auctions
- Bid tracking with token information
- Winner determination
- Treasury management with multisig wallet
- Emits events: `PaymentReceived`, `DirectPurchase`, `AuctionCreated`, `BidPlaced`, `AuctionWon`

**NFT Contract (Story Protocol):**
- ERC-721 standard NFT minting
- Access-controlled minting (only authorized relayer can mint)
- Batch minting capability
- Automatic transfer to buyer
- Royalty configuration for secondary sales
- Emits events: `NFTMinted`, `BatchMinted`

**Backend/Relayer Service (Go):**
- Written in Go using go-ethereum (Geth)
- Listens to payment events on Base using goroutines
- Automatically executes mints on Story Protocol when payment is confirmed
- Queue system for pending transactions (PostgreSQL/SQLite)
- Retry logic with exponential backoff for failed mints
- Idempotency to prevent duplicate mints
- Cross-chain transaction tracking
- REST API for status queries
- Health check endpoints
- Structured logging (logrus/zap)
- Optional Prometheus metrics
- Monitoring dashboard for admins

### Frontend Application Structure
Single Page Application inspired by nouns.wtf design:

**1. Home (Landing + Active Auction)**
- Hero section with main active auction highlighted
- Live countdown timer
- Direct bidding form with token selector (VTN/ETH/USDT)
- Real-time bidder list with token information
- Brief project information (sticky sidebar or bottom section)
- Recently minted NFTs showcase
- Cross-chain transaction tracking component

**2. Explore**
- Complete gallery of all minted NFTs (data from Story Protocol)
- Filters by attributes/traits
- Search by token ID or owner
- Responsive grid layout
- Shows cross-chain info (payment on Base + NFT on Story)

**3. Public Dashboard**
- Sales statistics from Base
- Treasury balance display (VTN, ETH, USDT)
- Cross-chain transaction history
- Transparency metrics

**4. Admin Dashboard (Protected)**
- Wallet-based authentication
- NFT upload interface with IPFS integration
- Auction management
- Relayer monitoring and status
- Cross-chain transaction queue visibility

### Economic & Transparency Model
- All payments flow to treasury multisig wallet on Base (VTN, ETH, USDT)
- Public dashboard displays real-time sales and treasury balance from Base
- Verified smart contract codes on both block explorers (Base + Story)
- Only authorized Kukuxumusu wallet can withdraw funds from Base treasury
- Only authorized relayer can mint NFTs on Story
- 5-10% royalties on secondary market sales
- Complete transaction history on-chain (payments on Base, mints on Story)

## Development Approach

### MVP Philosophy (1 Week)
This is a rapid MVP with focus on core functionality:
- Minimize scope to validate market before full investment
- Cross-chain architecture (Base for payments, Story for NFTs)
- Multi-token payment support (VTN, ETH, USDT)
- Automated relayer service for cross-chain operations
- No DAO features in MVP (Phase 2)
- Basic admin panel (advanced features in Phase 2)
- No external marketplace integration in MVP
- No full smart contract audit (basic review only)
- Basic monitoring of relayer (full alerting in Phase 2)

### Deployment & Operations
- Containerized deployment using Docker on AWS EC2
- Three services: Frontend, Backend API, Relayer
- Auto-scaling capability with multiple EC2 instances
- Automated backups for relayer database
- CloudWatch for monitoring relayer operations
- Alerts for cross-chain transaction failures
- CI/CD pipeline for automated deployments

## Development Timeline (MVP - 5 Days)

### Day 1: Foundation
- Payment contract (Base) with multi-token support
- NFT contract (Story) with access-controlled minting
- Backend/Relayer service setup in Go with go-ethereum
- Frontend setup with Next.js + multi-chain Web3 integration
- IPFS/Pinata configuration

### Day 2: Core Functionality
- Complete payment contract with auctions and multi-token bidding (Base)
- Complete NFT contract with batch minting (Story)
- Relayer logic in Go for cross-chain minting with goroutines
- Event listeners with retry logic and idempotency
- Payment and auction UI with token selector
- Real-time bidder listing with token information
- Cross-chain transaction tracking component

### Day 3: Admin Dashboard
- Admin panel with wallet authentication
- NFT upload system with IPFS integration
- Metadata generation
- Relayer monitoring dashboard
- Cross-chain transaction status tracking

### Day 4: Explore & Gallery
- Responsive gallery layout (NFT data from Story)
- Filters and search functionality
- Public transparency dashboard (payment data from Base)
- Cross-chain data visualization

### Day 5: Testing & Deployment
- End-to-end cross-chain testing
- Mainnet deployment of both contracts (Base + Story)
- Compile Go relayer binary for production
- Relayer service deployment with Docker
- Docker containerization for all services (Next.js + Go relayer)
- AWS EC2 deployment with monitoring
- CloudWatch + optional Prometheus/Grafana setup
- Domain and SSL configuration

## Key Technical Considerations

### Gas Optimization
- Both contracts optimized for minimal gas consumption
- Batch operations where possible in NFT contract
- Efficient storage patterns
- Multi-token support without excessive gas overhead

### Security
- Wallet-based admin authentication
- Access controls on sensitive functions in both contracts
- Treasury multisig wallet protection on Base
- Relayer wallet authorization on Story (only authorized relayer can mint)
- Emergency pause functionality on both contracts
- Secure RPC endpoint configuration

### Cross-Chain Reliability
- Go relayer with goroutines for concurrent event processing
- Automatic retry logic with exponential backoff
- Transaction queue with persistent storage (PostgreSQL/SQLite)
- Monitoring and alerting for failed mints
- Idempotent mint operations (prevent duplicate mints)
- Event-driven architecture for reliability
- Health checks and graceful shutdown
- Structured logging for debugging

### Performance
- Lazy loading for NFT gallery
- Image optimization
- Efficient cross-chain queries (Base + Story)
- Caching strategies for metadata and cross-chain data
- Optimized RPC calls to both networks

### Auction System
- Multiple simultaneous auctions on Base
- Multi-token bidding (VTN, ETH, USDT)
- Time-limited bidding windows
- Real-time bidder list updates with token info
- Automated winner determination
- Cross-chain mint triggered after auction ends
- On-chain auction history storage on Base

## Testing Requirements
- Smart contract unit tests for both contracts (>90% coverage)
- Cross-chain integration testing
- End-to-end user flow testing (payment on Base → mint on Story)
- Relayer reliability testing (retry logic, failure handling)
- Responsive design validation
- Performance optimization (<3s load time)
- Gas cost validation on both networks
- Multi-token payment testing (VTN, ETH, USDT)

## Success Metrics (MVP)
- 50+ NFTs sold in first 2 weeks
- Minimum 5 successful auction completions with different tokens
- Cross-chain relayer uptime >99%
- Positive community feedback
- Transparent treasury operations on Base
- Zero critical bugs in production
- All cross-chain mints successful (no stuck transactions)