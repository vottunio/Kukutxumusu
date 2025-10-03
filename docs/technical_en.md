# Detailed Technical Roadmap - Kukuxumusu NFT Project

## 📊 CURRENT PROJECT STATUS

**Overall Progress:** Day 1-3 Frontend ~85% Complete | Backend/Relayer 0% | Day 4-5 Pending

**Completed (✅ 79 tasks):**
- ✅ Smart Contracts deployed on Base Sepolia + Story Testnet
- ✅ Frontend setup with Next.js + TypeScript + Tailwind
- ✅ Multi-chain wallet connection (RainbowKit + Wagmi + Viem)
- ✅ Auction UI with multi-token bidding (ETH/VTN/USDT)
- ✅ Admin panel with NFT upload + auction creation
- ✅ IPFS integration via Pinata for images and metadata
- ✅ Token decimal handling fixed (18 for ETH/VTN, 6 for USDT)
- ✅ Contract admin panel for token/role management
- ✅ Real-time auction data display with 5s refresh
- ✅ Bidder listing with USD value display
- ✅ Anti-sniping configuration system

**In Progress (⚠️):**
- ⚠️ Auction/bid price signing (needs Go relayer for `/api/sign-bid` endpoint)
- ⚠️ End-to-end testing with deployed contracts
- ⚠️ Frontend validations (token balance, network checks)

**Pending ( 197 tasks):**
- ❌ Go Relayer (0% complete) - Price oracle, event listeners, cross-chain minting
- ❌ Explore/Gallery page
- ❌ Public dashboard with treasury stats
- ❌ Cross-chain transaction tracking
- ❌ Production deployment
- ❌ Responsive mobile testing

**Next Priority:** Build Go Relayer service for price signing and cross-chain operations

---

## 📋 MVP DELIVERABLE EXECUTIVE SUMMARY (1 WEEK)

### Final Product Capabilities
- **Wallet Connection**: Integration with MetaMask and WalletConnect for blockchain interaction
- **Cross-Chain Architecture**: NFTs minted on Story Protocol, payments managed on Base
- **NFT Smart Contract (Story)**: Verified ERC-721 contract on Story Protocol for NFT creation and management
- **Payment Smart Contract (Base)**: Multi-token payment system (VTN, ETH, USDT) and auction management
- **Auction System**: Mechanism for bidding on NFTs during a determined period with bidder listing (on Base)
- **Purchase by Winner**: Automated cross-chain process for auction winner to receive the NFT
- **NFT Gallery**: Complete exploration of minted/purchased NFTs with filters and search
- **Administrative Panel**: Protected dashboard for Kukuxumusu team to upload new NFTs
- **Balance Visualization**: Public dashboard showing treasury balance and statistics
- **Decentralized Storage**: All images and metadata stored on IPFS via Pinata

### Technology Stack
- **Blockchain (NFTs)**: Story Protocol - ERC-721 Smart Contract for NFT minting
- **Blockchain (Payments)**: Base - Smart Contract for multi-token payments and auctions
- **Accepted Payment Tokens**: VTN, ETH (native), USDT (ERC-20)
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Web3**: Integration with wagmi/viem for multi-chain wallet connection
- **Backend/Relayer**: Go service (go-ethereum) connecting Base events with Story Protocol
- **Storage**: IPFS/Pinata for images and metadata
- **Hosting**: AWS EC2 with Docker for frontend and backend/relayer

### Technical Deliverables
- NFT smart contract deployed and verified on Story Protocol mainnet
- Payment smart contract deployed and verified on Base mainnet
- Backend/Relayer for cross-chain communication between Base and Story
- Responsive frontend deployed on custom domain with multi-chain support
- NFT upload system for administrators
- Complete technical documentation
- Source code in GitHub repository

### MVP Limitations
- No DAO functionalities (planned for Phase 2)
- Administrative panel with basic functions
- No integration with external marketplaces
- No complete smart contract audit (basic review only)
- Explore with basic filters (advanced version in Phase 2)
- No advanced data analysis tools
- Basic monitoring (no complete alert system)

### Economic Management and Transparency
- **Treasury Wallet (Base)**: Implementation of dedicated multisig wallet on Base to receive all sales funds in VTN, ETH and USDT
- **Public Dashboard**: Public page showing real-time number of NFTs sold and treasury balance on Base
- **Verified Smart Contracts**: Code of both contracts (Base and Story) verified on their respective block explorers
- **Withdraw function**: Only Kukuxumusu's authorized wallet can withdraw accumulated funds on Base
- **Royalties**: Configuration of 5-10% royalties on secondary sales automatically sent to treasury
- **Cross-Chain Transparency**: All payment events on Base are linked with minted NFTs on Story

### Application Architecture

#### Frontend (Single Page Application)
- **Technology**: Next.js + React + TypeScript + Tailwind CSS
- **Structure**: Single web application with multiple pages/sections
- **Design inspired by**: nouns.wtf
- **Main pages**:
  - **Home (Landing + Active Auction)**: Hero with featured main auction, time counter, direct bid form with token selector (VTN/ETH/USDT), real-time bidder listing, brief project information, latest minted NFTs
  - **Explore**: Complete gallery of all minted NFTs with filters, search and responsive grid
  - **Public Dashboard**: Sales statistics, treasury balance on Base, cross-chain transaction history
  - **Admin Dashboard**: Protected panel for NFT upload, auction management and relayer monitoring (access restricted by wallet)

#### Backend - Cross-Chain Architecture

**Payment Smart Contract (Base)**
- Multi-token payment management (VTN, ETH, USDT)
- System of multiple simultaneous auctions with time limit
- Bidder registration and winner determination
- Multisig treasury for fund custody
- On-chain events: `PaymentReceived`, `AuctionCreated`, `BidPlaced`, `AuctionWon`
- Each bid will be registered as an on-chain event to guarantee total transparency and verifiability
- `BidPlaced` events will contain all bid information (bidder, amount, timestamp, tokenId)

**NFT Smart Contract (Story Protocol)**
- ERC-721 NFT minting with IPFS metadata
- Access control: only authorized backend/relayer can mint
- Automatic transfer function to auction winner
- Configured royalties for secondary sales

**Backend/Relayer Service (Go) - Critical Cross-Chain Operations**
- **Purpose**: Autonomous service for cross-chain transaction execution (Base → Story)
- **Language**: Go using go-ethereum (Geth) - chosen for performance and native blockchain support
- **Deployment**: Standalone service running 24/7 on AWS EC2 (separate from Next.js)
- **Responsibilities**:
  - Listens for payment events on Base (`PaymentReceived`, `AuctionWon`) using WebSocket/HTTP polling
  - Executes automatic NFT mint transactions on Story Protocol when payment confirmed
  - Transfers minted NFTs to buyer/winner addresses
  - Maintains persistent cross-chain transaction queue with PostgreSQL/SQLite
  - Implements retry logic with exponential backoff for failed mints
  - Provides REST API for monitoring relayer status and pending transactions
- **Why Go?**: High performance, excellent concurrency (goroutines), native blockchain libraries, runs as system service

**Next.js API Routes - Frontend/User-Facing Data**
- **Purpose**: Serve data to the React frontend for user interface
- **Language**: TypeScript (Next.js App Router API routes)
- **Deployment**: Integrated with Next.js frontend on AWS EC2
- **Responsibilities**:
  - Query and aggregate data from Base and Story Protocol for display
  - Cache NFT metadata from IPFS to reduce load times
  - Provide endpoints for gallery/explore page (NFT listings with filters)
  - Aggregate auction data and bidder lists from Base
  - Cross-chain data correlation (match payments on Base with NFTs on Story)
  - Optional: Proxy requests to Go relayer for status updates
- **Why Next.js?**: Direct integration with frontend, serverless functions, easy caching, TypeScript type safety

**Key Difference**:
- **Go Relayer = Write Operations** (execute blockchain transactions automatically)
- **Next.js API = Read Operations** (serve data to users, no transaction execution)

**Architecture Diagram**:
```
┌─────────────────────────────────────┐
│  Go Relayer (Port 8080)             │
│  - Listens to Base events           │
│  - Executes mints on Story          │
│  - Persistent queue                 │
└─────────────────────────────────────┘
           ↕ (optional)
┌─────────────────────────────────────┐
│  Next.js API (Port 3000/api)        │
│  - Gallery data                     │
│  - Metadata cache                   │
│  - Cross-chain aggregation          │
└─────────────────────────────────────┘
           ↕
┌─────────────────────────────────────┐
│  Next.js Frontend (React)           │
│  - User interface                   │
└─────────────────────────────────────┘
```
**Storage**:
  - IPFS/Pinata: Images and NFT metadata
    - Original images: 2000x2000px (1:1), PNG/JPG format, max 10MB, with optional transparency
    - Automatically generated optimized versions:
      - Thumbnail (gallery): 400x400px
      - Media (cards): 800x800px
      - Full (detail view): 2000x2000px original
    - Metadata: ERC-721 JSON standard with attributes/traits
- Database: Auxiliary information, cache and cross-chain tracking


Flujo correcto:
Fase 1: Admin prepara (ANTES de la subasta)
Admin Panel:
├── Sube SOLO la imagen a Pinata → ipfs://QmImageHash
└── Guarda este hash asociado al NFT ID
Fase 2: Subasta ocurre
Base Contract:
├── createAuction(nftId: 5, duration, tokens...)
├── Usuarios hacen bids (se guardan on-chain como eventos)
└── Auction termina → ganador definido
Fase 3: Backend genera metadata completo (DESPUÉS)
Backend/Relayer:
├── Detecta AuctionWon
├── Lee todos los bids del contrato
├── Crea metadata JSON completo:
   {
     "name": "Kukuxumusu #5",
     "image": "ipfs://QmImageHash", ← de Fase 1
     "description": "...",
     "attributes": [...],
     "auction_history": [todos los bids] ← de blockchain
   }
├── Sube este JSON a Pinata → ipfs://QmMetadataHash
└── Mintea NFT con esta URI completa
Entonces necesitas:
Admin panel: Solo sube imagen + datos básicos → guarda relación nftId → imageHash
Backend/Relayer: Genera metadata completo + sube a Pinata + mintea
¿Modifico el UploadNFTForm para que solo suba la imagen y datos básicos (sin generar metadata final)


#### Deployment
- **Frontend/Backend/Relayer**: AWS EC2 with Docker containers
- **Containerization**: Docker + Docker Compose for consistent environments
- **CI/CD**: Automated pipeline for container build and deploy
- **Payment Smart Contract**: Deployed and verified on Base mainnet
- **NFT Smart Contract**: Deployed and verified on Story Protocol mainnet
- **Relayer Service**: Persistent service with automatic retries to guarantee mints
- **Domain**: Custom domain configuration with SSL/TLS
- **Scalability**: Possibility to scale horizontally with multiple EC2 instances
- **Monitoring**: CloudWatch for cross-chain event tracking and alerts

## 🚀 WEEK 1 - MVP DEVELOPMENT

### DAY 1 (MONDAY) - BASE FOUNDATIONS

#### Blockchain Development (Smart Contracts)
**Payment Smart Contract (Base) - ✅ 100% COMPLETED**
Based on `KukuxumusuPayment_ABI.json`, the contract includes:
- [✅] Multi-token payment support (native ETH, ERC-20 tokens like VTN, USDT)
- [✅] Direct purchase function (`directPurchase`) with multi-token support
- [✅] Complete auction system:
  - `createAuction` - Create auctions with token whitelist and min prices
  - `placeBid` - Place bids with any allowed token
  - `finalizeAuction` - End auctions and determine winner
  - `getAuctionBids` - Query all bids for an auction
  - Anti-sniping protection with automatic time extension
- [✅] Treasury management (`treasury` address, `setTreasury`)
- [✅] Multi-token withdraw (`withdraw`) for owner
- [✅] Refund system (`withdrawRefund`, `getPendingRefund`)
- [✅] Access control (Ownable pattern)
- [✅] Emergency pause functionality (`pause`, `unpause`)
- [✅] Price management per NFT per token (`setPrice`, `prices`)
- [✅] Token whitelist (`setAllowedPaymentToken`, `allowedPaymentTokens`)
- [✅] NFT contract whitelist (`setAllowedNFTContract`, `allowedNFTContracts`)
- [✅] Complete event system: `PaymentReceived`, `DirectPurchase`, `AuctionCreated`, `BidPlaced`, `AuctionWon`, `AuctionFinalized`, etc.

**NFT Factory Contract (Story Protocol) - ✅ 100% COMPLETED**
Based on `KukuxumusuNFTFactory_ABI.json`, the contract includes:
- [✅] Factory pattern for creating NFT collections
- [✅] `createCollection` - Deploy new ERC-721 collections with custom config
- [✅] Collection management (`getTotalCollections`, `getCollection`, `getCollectionByAddress`)
- [✅] Royalty configuration per collection (EIP-2981)
- [✅] Collection name uniqueness validation (`isCollectionNameAvailable`)
- [✅] Access control (Ownable pattern)
- [✅] Emergency pause functionality
- [✅] Events: `CollectionCreated`, `CollectionUpdated`

**Smart Contract Status**
- [✅] Both contracts fully developed with complete ABIs
- [✅] **NFT Factory deployed on Story Protocol:** `0x75bf7b1DD6b3a666F18c7784B78871C429E92C71`
  - Owner: `0x090378a9c80c5E1Ced85e56B2128c1e514E75357`
  - Deployer: `0x0e60B83F83c5d2684acE779dea8A957e91D02475`
- [✅] **Payment Contract deployed on Base:** `0x75bf7b1DD6b3a666F18c7784B78871C429E92C71`
  - Owner: `0x090378a9c80c5E1Ced85e56B2128c1e514E75357`
  - Treasury: `0x090378a9c80c5E1Ced85e56B2128c1e514E75357`
  - Deployer: `0x0e60B83F83c5d2684acE779dea8A957e91D02475`
- [✅] Deployment status: **COMPLETED SUCCESSFULLY**
- [ ] Verify both contracts on block explorers (Story + Base)
- [ ] Configure allowed payment tokens (VTN, USDT addresses on Base)
- [ ] Create first collection via NFT Factory
- [ ] Set initial NFT prices
- [ ] Plan mainnet deployment after testing

#### Frontend Development
**Frontend Project Setup**
- [✅] Configure Next.js with TypeScript - *Completed*
- [✅] Setup Tailwind CSS and theme configuration - *Completed*
- [✅] Install and configure Web3 moderno (WalletConnect v2 + viem) - *Completed*
- [✅] Configure support for Base and Story Protocol - *Completed*
- [✅] Create base component structure (Header, Footer, Layout) - *Completed*

**Multi-Chain Blockchain Connection**
- [✅] Implement multi-chain wallet connection (MetaMask, WalletConnect) - *RainbowKit 2.2.8 configured with SSR fix*
- [✅] Create hooks for interacting with contracts on Base and Story - *useContract.ts with full ABIs*
- [✅] Setup providers and configuration for both networks (Base + Story) - *Wagmi 2.17.5 + Viem 2.37.9 configured*
- [✅] Implement automatic network switch according to context - *RainbowKit includes network switcher*
- [⚠️] Basic test of reading from both contracts - *UI implemented but NOT tested with real contracts yet*
- [✅] Fix hydration errors in SSR - *Client-only rendering for wallet components*
- [✅] Import ABIs from JSON files - *Complete ABIs loaded from KukuxumusuPayment_ABI.json and KukuxumusuNFTFactory_ABI.json*
- [✅] Clean up duplicate configuration files - *Removed web3-config.ts and rainbowkit-config.ts*

#### Backend/Relayer Development
**Backend Relayer Setup (Go)**
- [ ] Configure Go project with modules
- [ ] Setup go-ethereum for multi-chain interaction
- [ ] Configure RPC clients for Base and Story
- [ ] Implement event listening system on Base using goroutines
- [ ] Create pending transaction queue with PostgreSQL/SQLite
- [ ] Implement basic REST API for health checks

#### Infrastructure (IPFS/Storage)
**IPFS Setup**
- [✅] Configure Pinata account and API keys - *API routes configured*
- [✅] Create upload functions to IPFS - */api/admin/upload-image and upload-metadata*
- [✅] Implement JSON metadata generation according to ERC-721 standard - *Auto-generated in UploadNFTForm*
- [✅] Configure validation of original images (PNG/JPG format, max 10MB) - *Implemented in UploadNFTForm*
- [ ] Implement automatic generation of optimized versions (400x400px, 800x800px)
- [⚠️] Test basic image upload and quality verification - *Implemented but needs end-to-end testing*

**📋 Day 1 Deliverables:**
- [✅] Functional Payment smart contract on Base - *Deployed at 0x535683a04a9bFE0F9EF102336706A981d12fF125*
- [✅] Functional NFT Factory on Story Protocol - *Deployed at 0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7*
- [ ] Backend/Relayer configured and listening events
- [✅] Frontend with multi-chain wallet connection working - *RainbowKit 2.2.8 + 4 networks (Base/Story mainnet & testnet)*
- [✅] Contract interaction hooks implemented - *useContract, useAuction, usePlaceBid with full ABIs*
- [✅] UI components for contract data - *AuctionCard, BidForm, BidderList, CountdownTimer implemented*
- [✅] Fix all configuration issues - *Cleaned duplicate configs, fixed ABIs encoding, SSR hydration*
- [✅] IPFS configured and tested - *Pinata integration working in admin panel*

---

### DAY 2 (TUESDAY) - CORE MINT FUNCTIONALITY

#### Blockchain Development
**Smart Contracts - ✅ Already 100% Complete**
Both Payment (Base) and NFT Factory (Story) contracts are fully developed. Remaining tasks:
- [ ] Deploy Payment contract to Base mainnet
- [ ] Deploy NFT Factory to Story Protocol mainnet
- [ ] Verify contracts on block explorers
- [ ] Configure initial settings (treasury, allowed tokens, etc.)
- [ ] Test all contract functions on mainnet with small amounts

**Backend/Relayer - Cross-Chain Logic (Go)**
**Core Event Listeners:**
- [ ] Implement listener for `PaymentReceived` event on Base with dedicated goroutine
- [ ] Implement listener for `AuctionWon` event on Base with dedicated goroutine
- [ ] Implement listener for `DirectPurchase` event on Base
- [ ] Create automatic mint logic on Story when detecting payment
- [ ] Implement retry system with exponential backoff
- [ ] Idempotency system to avoid double mint

**Price Oracle & Signature Service:**
- [ ] Implement REST endpoint `/api/price` to fetch real-time token prices (CoinGecko + QuickNode)
- [ ] Create `/api/sign-bid` endpoint that returns valueInUSD + signature
- [ ] Implement ECDSA signature generation for price validation
- [ ] Support multiple price sources (CoinGecko API, QuickNode API, fallback to fixed prices)
- [ ] Add price caching to reduce API calls (5-minute cache)
- [ ] Validate bid amounts against current market prices
- [ ] Sign price data with trusted signer wallet (configured in Payment contract)

**Monitoring & Logging:**
- [ ] Create structured logging system (logrus/zap)
- [ ] Implement success/error notifications
- [ ] Add Prometheus metrics endpoint for monitoring
- [ ] Health check endpoint `/health`
- [ ] Transaction status endpoint `/api/tx/:hash`
- [ ] Pending queue endpoint `/api/queue`
- [ ] End-to-end testing of cross-chain flow

#### Frontend Development
**Payment/Mint and Auctions UI Page**
- [✅] Create auction interface with countdown timer
- [✅] Implement form for placing bids with multi-token support (ETH/VTN/USDT)
- [✅] Add token selector with correct decimals handling (18 for ETH/VTN, 6 for USDT)
- [✅] Create real-time bidder listing with token information and USD values
- [✅] Display auction data from Payment contract (Base)
- [✅] Show minimum bid prices per token from contract
- [✅] Filter allowed tokens per auction using `isTokenAllowedForAuction`
- [✅] Implement bid approval flow for ERC-20 tokens
- [ ] Add NFT preview before payment with full-size visualization (2000x2000px)
- [ ] Add frontend validations (token balance, connection, correct network)

**Complete Cross-Chain Integration**
- [✅] Connect UI with Payment contract on Base
- [✅] Implement Web3 error handling on Base network
- [✅] Integrate auction system with frontend
- [✅] Display auction data in real-time (5s refresh)
- [✅] Show USD values for bids (awaiting relayer for price signing)
- [ ] Implement cross-chain transaction states (payment pending → payment success → mint pending → mint success)
- [ ] Add visual feedback for each state of the cross-chain process
- [ ] Implement notifications for auction winners and mint status
- [ ] Create cross-chain tracking component to see progress
- [ ] Responsive testing on mobile devices

**📋 Day 2 Deliverables:**
- [✅] Functional multi-token payment system on Base - *Implemented with ETH/VTN/USDT*
- [✅] Auction system with bidder listing implemented - *Real-time updates working*
- [⚠️] Backend/Relayer executing automatic mints on Story - **CRITICAL: Go Relayer not started**
- [✅] Polished user interface for cross-chain payments and auctions - *UI complete*
- [⚠️] Complete validations and error handling - *Partial, needs balance checks*
- [ ] Automated cross-chain process for purchase/auction → mint on Story - **Blocked by Relayer**

---

### DAY 3 (WEDNESDAY) - ADMINISTRATIVE DASHBOARD

#### Frontend Development - Admin Dashboard
**Base Admin Interface**
- [✅] Create admin page with wallet authentication
- [✅] Implement admin route protection
- [✅] Create NFT upload form with Pinata integration
- [✅] Implement image preview before upload with dimension verification
- [✅] Create auction creation form (CreateNFTAuctionForm)
- [✅] Add multi-token support with dynamic pricing
- [✅] Implement discount system per token (basis points)
- [✅] Add anti-sniping configuration (extension + trigger time)
- [✅] Create contract admin panel for token/role management

**NFT Upload Functionality**
- [✅] Integrate form with IPFS upload via Pinata API
- [✅] Create automatic JSON metadata generation with ERC-721 standard
- [✅] Implement image format validation (PNG/JPG, max 10MB)
- [✅] Add progress bars for uploads
- [✅] Support for multiple token payment options per auction
- [✅] Calculate min prices based on USD base price + discounts
- [✅] Fix token decimal handling (18 for ETH/VTN, 6 for USDT)
- [ ] Configure automatic generation of optimized versions for gallery and cards

#### Blockchain Development - Deployment & Configuration
**Contract Deployment (both networks)**
- [ ] Deploy Payment contract to Base mainnet
- [ ] Deploy NFT Factory to Story Protocol mainnet
- [ ] Verify both contracts on block explorers
- [ ] Configure Payment contract:
  - Set treasury address (multisig)
  - Whitelist payment tokens (VTN, USDT addresses)
  - Set initial NFT prices per token
- [ ] Configure NFT Factory:
  - Create first Kukuxumusu collection
  - Set royalty receiver and fee
- [ ] Test end-to-end flow with small amounts

**Backend/Relayer - Monitoring Dashboard (Go)**
- [ ] Create REST endpoints in Go for querying cross-chain transaction status
- [ ] Implement Prometheus metrics endpoint
- [ ] Implement admin dashboard to see pending mint queue
- [ ] Add relayer metrics (success/failure, average time, latency)
- [ ] Implement alert system for relayer failures
- [ ] Health check endpoint for monitoring

**Dashboard Integration Testing**
- [ ] Complete test of admin flow for uploading to IPFS
- [ ] Verify correct metadata on IPFS
- [ ] Test minting newly added NFTs via relayer
- [ ] Validate that URIs are correctly generated on Story
- [ ] End-to-end cross-chain tracking test

**📋 Day 3 Deliverables:**
- [✅] Fully functional admin dashboard - *Complete with all forms*
- [✅] NFT upload system working with IPFS - *Pinata integration done*
- [✅] Metadata correctly generated on IPFS - *Auto-generation implemented*
- [ ] Backend/Relayer with monitoring dashboard - **CRITICAL: Go Relayer not started**
- [ ] Operational cross-chain tracking system - **Blocked by Relayer**

---

### DAY 4 (THURSDAY) - EXPLORE PAGE AND GALLERY

#### Frontend Development - Explore Page
**Gallery Base**
- [ ] Create responsive gallery layout
- [ ] Implement individual NFTCard component with medium resolution images (800x800px)
- [ ] Connect with Story Protocol data (NFT tokenURI)
- [ ] Create loading system for images with different resolutions (thumbnails 400x400px for gallery)
- [ ] Implement sales statistics section (Base data) and transparency

**Advanced Explore Functionalities**
- [ ] Implement filters by attributes/traits
- [ ] Add search by token ID or owner
- [ ] Create efficient pagination system
- [ ] Implement lazy loading for performance with progressive resolution loading (thumbnail -> media -> full)
- [ ] Add loading states and error handling
- [ ] Show cross-chain information (price paid on Base, NFT on Story)

#### Blockchain Development - Cross-Chain APIs and Utilities
**Backend Support**
- [ ] Create utility functions to parse metadata from Story
- [ ] Implement optimized getAllTokens function for Story
- [ ] Create endpoints to serve metadata and different image resolutions
- [ ] Optimize cross-chain queries (NFTs from Story + payments from Base)
- [ ] Implement cross-chain data cache for performance
- [ ] Create endpoint to link NFT from Story with payment from Base

**📋 Day 4 Deliverables:**
- Fully functional Explore page with Story data
- Operational filter and search system
- Optimized performance for NFT loading
- Cross-chain visualization (NFTs + payment info)
- Public transparency dashboard with Base data

---

### DAY 5 (FRIDAY) - TESTING, DEPLOY AND FINALIZATION

#### Complete Testing
**Frontend Testing:**
- [ ] End-to-end test of all user flows
- [ ] Responsive design test on different devices
- [ ] Performance and load optimization test
- [ ] Basic accessibility validation

**Backend/Relayer Testing:**
- [?] Complete test of all functions of both contracts (Base + Story) - *No testnet available*
- [ ] Integration test with IPFS
- [ ] Generated metadata validation
- [?] Gas costs test and optimization on both networks - *No testnet available*
- [?] Exhaustive test of complete cross-chain flow - *No testnet available*
- [ ] Test automatic retries of relayer
- [ ] Test failure handling in relayer

#### Production Deploy
**Blockchain Deploy:**
- [ ] Final deploy of Payment contract on Base mainnet
- [ ] Final deploy of NFT contract on Story Protocol mainnet
- [ ] Verify both contracts on their respective block explorers
- [ ] Configure ownership correctly on both contracts
- [ ] Configure multisig treasury wallet on Base
- [ ] Configure authorized relayer wallet on Story
- [ ] Create secure backup of private keys (Base, Story, Relayer)

**Frontend/Backend/Relayer Deploy:**
- [ ] Optimized production build of frontend
- [ ] Compile Go binary of relayer for production
- [ ] Create Docker images for frontend (Node.js), backend API (Node.js) and relayer (Go)
- [ ] Setup Docker Compose for production environment (3 services)
- [ ] Deploy on AWS EC2 with security configuration
- [ ] Configure custom domain with Route 53
- [ ] Setup SSL/TLS with managed certificates
- [ ] Configure RPC endpoints for Base and Story in production
- [ ] Configure environment variables for Go relayer
- [ ] Implement public transparency dashboard with Base data
- [ ] Configure CloudWatch for relayer monitoring
- [ ] Setup Prometheus + Grafana for relayer metrics (optional)

#### Final Testing and Documentation
- [?] Complete cross-chain test on mainnet with real funds (VTN, ETH, USDT) - *Requires mainnet deployment*
- [?] Verification of all functionalities on both networks - *Requires mainnet deployment*
- [?] Complete flow test: payment on Base → mint on Story - *Requires mainnet deployment*
- [?] Complete auction test with different tokens - *Requires mainnet deployment*
- [ ] Create technical documentation for handover (includes cross-chain architecture)
- [ ] Document deployment process on both networks
- [ ] Prepare demo for final presentation
- [ ] Setup monitoring and alerts for relayer
- [ ] Configure auto-scaling for EC2 if necessary
- [ ] Implement automated backup of relayer database

**📋 Day 5 Deliverables:**
- MVP completely deployed in production (Base + Story)
- Backend/Relayer operational and monitored
- Complete cross-chain technical documentation
- System ready for demo with Kukuxumusu
- Multi-token payments working on Base
- NFTs automatically minting on Story

---

## ✅ FINAL MVP DELIVERABLES CHECKLIST

### Payment Smart Contract (Base) 🔵
- [?] Payment contract deployed and verified on Base mainnet
- [?] Multi-token support: VTN, ETH (native), USDT (ERC-20)
- [?] Pause, multi-token withdraw, setPrice per token functions implemented
- [?] System of multiple simultaneous auctions with time limit
- [?] Bidder registration with used token information
- [?] Winner determination logic implemented
- [?] Payment process with token validation
- [?] Ownership and access controls system
- [?] On-chain events: `PaymentReceived`, `DirectPurchase`, `AuctionCreated`, `BidPlaced`, `AuctionWon`
- [?] Exhaustive unit testing (>90% coverage) - *No testnet available for testing*
- [?] Contract technical documentation
- [?] Multisig treasury wallet configured on Base
- [?] Storage of auction history and bids as on-chain events

### NFT Smart Contract (Story Protocol) 🔵
- [?] ERC-721 contract deployed and verified on Story Protocol mainnet
- [?] Mint function with access control (only authorized relayer)
- [?] Batch mint function for relayer
- [?] Automatic transfer function to buyer
- [?] Ownership and access controls system
- [?] Royalties configuration for secondary market
- [?] On-chain events: `NFTMinted`, `BatchMinted`
- [?] Exhaustive unit testing (>90% coverage) - *No testnet available for testing*
- [?] Contract technical documentation
- [?] BaseURI configured for IPFS metadata

### Cross-Chain Backend/Relayer (Go) ✅
- [ ] Go service deployed and operational on AWS EC2
- [ ] Event listeners for Base using goroutines (PaymentReceived, AuctionWon)
- [ ] Automatic mint logic on Story when detecting payment on Base
- [ ] Pending transaction queue system with PostgreSQL/SQLite
- [ ] Automatic retry system with exponential backoff
- [ ] Complete structured logging of cross-chain transactions (logrus/zap)
- [ ] Monitoring dashboard for admin
- [ ] REST API endpoints for querying transaction status
- [ ] Performance metrics (success/failure, average time, latency)
- [ ] Idempotency system to prevent double mint
- [ ] Alert system for failures
- [ ] Automated database backup
- [ ] Health check endpoint
- [ ] Prometheus metrics (optional)
- [ ] Go relayer documentation and maintenance procedures

### Frontend Application 🔵
- [✅] Multi-wallet multi-chain connection (MetaMask, WalletConnect) - *RainbowKit 2.2.8 with SSR fix*
- [✅] Support for Base and Story Protocol with automatic switch - *4 networks configured*
- [✅] Basic layout with Header and WalletButton - *Completed*
- [⚠️] Contract data display components - *ContractData.tsx implemented but needs real contract addresses*
- [✅] Hooks for reading contract data - *usePaymentContract & useNftContract coded*
- [⚠️] Treasury wallet balance visualization on Base - *UI ready but needs deployed contract to test*
- [✅] Responsive design for all devices - *Next.js 15 + Tailwind CSS 3.4*
- [ ] Payment token selector (VTN, ETH, USDT)
- [ ] Payment/auction page with multiple active auctions
- [ ] Real-time bidder listing with used token
- [ ] Interface for placing bids with different tokens
- [ ] Cross-chain transaction states (payment → mint)
- [ ] Cross-chain tracking component
- [ ] Notifications for auction winners and mint status
- [ ] Explore page with Story Protocol data
- [ ] Cross-chain visualization (NFT on Story + payment on Base)
- [ ] Protected and functional admin dashboard
- [ ] Loading, error and success states for both networks
- [ ] Public transparency dashboard with Base data
- [ ] Past auction history with token information

### Backend & Infrastructure ✅
- [ ] IPFS integration with Pinata for storage
- [ ] Image upload system and metadata generation
- [ ] APIs for obtaining cross-chain data (Base + Story)
- [ ] Admin authentication system by wallet
- [ ] Endpoints for cross-chain transaction tracking
- [ ] Cross-chain data cache for performance

### Deploy & Operations ✅
- [ ] Frontend, backend and relayer dockerized and deployed on AWS EC2
- [ ] AWS security configuration implemented
- [ ] Custom domain with Route 53
- [ ] SSL/TLS configured and working
- [ ] Backup of keys and critical configurations (Base, Story, Relayer)
- [ ] RPC endpoints configured for Base and Story
- [ ] Relayer monitoring with CloudWatch
- [ ] Alerts configured for cross-chain mint failures
- [ ] Cross-chain deploy and maintenance documentation
- [ ] Scaling and recovery procedures
- [ ] Relayer troubleshooting documentation

---

## 🎯 MVP SUCCESS CRITERIA

### Functionality ✅
- [ ] Any user can connect wallet and participate in auctions with VTN/ETH/USDT
- [ ] System of multiple simultaneous auctions works correctly with time limit
- [ ] Bidder listing updates in real time with verifiable on-chain data on Base
- [ ] Automated cross-chain process: payment on Base → automatic mint on Story
- [ ] Relayer processes payments and executes mints without manual intervention
- [ ] Admin can upload new NFTs via dashboard
- [ ] NFTs appear correctly on explore page (Story data)
- [ ] Metadata is correctly stored on IPFS
- [ ] Multi-token pricing system works correctly
- [ ] Treasury wallet on Base correctly receives funds in VTN/ETH/USDT
- [ ] Transparency dashboard shows accurate Base data
- [ ] Only authorized wallets can withdraw funds from Base
- [ ] Only authorized relayer can mint on Story
- [ ] Auction and bid history accessible and verifiable on-chain on Base
- [ ] Cross-chain tracking works correctly

### User Experience ✅
- [ ] Simple and clear payment process (< 3 clicks)
- [ ] Intuitive payment token selection
- [ ] Clear feedback at each step of the cross-chain process
- [ ] User can see progress: payment confirmed → minting → NFT received
- [ ] Responsive mobile-first design
- [ ] Load time < 3 seconds
- [ ] Elegant error handling on both networks
- [ ] Clear cross-chain transaction status notifications

### Technical ✅
- [ ] Zero critical bugs in production
- [ ] Both contracts optimized for gas (Base and Story)
- [ ] Frontend optimized for multi-chain performance
- [ ] Robust relayer with automatic retries
- [ ] Optimized Docker containers (frontend, backend, relayer)
- [ ] Well-documented code (includes cross-chain architecture)
- [ ] Adequate testing coverage (>90% on both contracts)
- [ ] CI/CD configuration for automated deployment
- [ ] Operational relayer monitoring
- [ ] Cross-chain failure alert system working

---

## 🔧 GO RELAYER - DETAILED TECHNICAL SPECIFICATION

### Architecture Overview

The Go Relayer is a critical component that bridges Base (payments) and Story Protocol (NFT minting). It operates as a standalone service with the following responsibilities:

**Primary Functions:**
1. **Event Listener**: Monitor Base blockchain for payment/auction events
2. **Price Oracle**: Provide real-time token prices with cryptographic signatures
3. **Mint Executor**: Automatically mint NFTs on Story Protocol
4. **Transaction Queue**: Manage pending cross-chain operations

### Service Structure

```
relayer/
├── main.go                    # Entry point, service initialization
├── config/
│   └── config.go             # Environment configuration
├── blockchain/
│   ├── base_listener.go      # Base event listener (goroutines)
│   ├── story_minter.go       # Story Protocol mint executor
│   └── contracts.go          # Contract ABIs and bindings
├── price/
│   ├── oracle.go             # Multi-source price fetching
│   ├── signer.go             # ECDSA signature generation
│   └── cache.go              # Price caching layer
├── api/
│   ├── server.go             # HTTP server (Gin/Echo framework)
│   ├── handlers.go           # REST endpoint handlers
│   └── middleware.go         # Auth, logging, CORS
├── queue/
│   ├── database.go           # PostgreSQL/SQLite connection
│   ├── models.go             # Transaction queue models
│   └── processor.go          # Queue processing with retries
├── monitoring/
│   ├── metrics.go            # Prometheus metrics
│   ├── logger.go             # Structured logging (Zap)
│   └── alerts.go             # Alert system
└── utils/
    ├── crypto.go             # Cryptographic utilities
    └── retry.go              # Exponential backoff logic
```

### REST API Endpoints

**Price Oracle Endpoints:**
```
GET  /api/price/:token        # Get current price for token (ETH/VTN/USDT)
POST /api/sign-bid            # Sign bid with USD value
     Request: { tokenAddress, amount, bidder, auctionId }
     Response: { valueInUSD, signature, timestamp }
```

**Monitoring Endpoints:**
```
GET  /health                  # Health check
GET  /api/queue               # View pending mint queue
GET  /api/tx/:hash            # Get cross-chain tx status
GET  /metrics                 # Prometheus metrics
```

**Admin Endpoints (authenticated):**
```
POST /admin/retry/:id         # Retry failed transaction
POST /admin/pause             # Pause relayer operations
POST /admin/resume            # Resume relayer operations
```

### Price Oracle Implementation

**Multi-Source Price Fetching:**
```go
type PriceSource interface {
    FetchPrice(tokenSymbol string) (float64, error)
}

// Sources:
1. CoinGecko API (primary for ETH, USDT)
2. QuickNode API (for VTN token)
3. Fallback to fixed prices if APIs unavailable
```

**Price Signature Generation:**
```go
// Message format for signing:
message = keccak256(abi.encodePacked(
    tokenAddress,
    amount,
    valueInUSD,
    bidder,
    auctionId,
    timestamp
))

signature = sign(message, trustedSignerPrivateKey)
```

**Cache Strategy:**
- Redis or in-memory cache
- TTL: 5 minutes for volatile tokens (ETH, VTN)
- TTL: 30 minutes for stablecoins (USDT)
- Automatic invalidation on major price swings (>5%)

### Event Processing Flow

**1. Base Event Listener (Goroutine):**
```go
func ListenToBaseEvents() {
    // Subscribe to Payment contract events
    events := []string{"AuctionWon", "DirectPurchase", "PaymentReceived"}

    for event := range eventChannel {
        go ProcessPaymentEvent(event) // Parallel processing
    }
}
```

**2. Event Processing:**
```go
func ProcessPaymentEvent(event PaymentEvent) {
    // 1. Validate event
    // 2. Check idempotency (prevent double mint)
    // 3. Add to mint queue
    // 4. Trigger mint on Story Protocol
}
```

**3. Story Protocol Mint:**
```go
func MintNFT(nftId, winner, metadataURI) error {
    // 1. Generate metadata JSON
    // 2. Upload metadata to Pinata
    // 3. Call Story contract mint function
    // 4. Transfer NFT to winner
    // 5. Update database status
}
```

### Database Schema

**PostgreSQL Tables:**
```sql
-- Pending mints queue
CREATE TABLE mint_queue (
    id SERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    nft_id BIGINT NOT NULL,
    winner_address VARCHAR(42) NOT NULL,
    payment_tx_hash VARCHAR(66) NOT NULL,
    token_address VARCHAR(42) NOT NULL,
    amount NUMERIC NOT NULL,
    value_usd NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    retry_count INT DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    mint_tx_hash VARCHAR(66),
    UNIQUE(payment_tx_hash) -- Idempotency
);

-- Price cache
CREATE TABLE price_cache (
    token_address VARCHAR(42) PRIMARY KEY,
    price_usd NUMERIC NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bid signatures
CREATE TABLE bid_signatures (
    id SERIAL PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    bidder VARCHAR(42) NOT NULL,
    token_address VARCHAR(42) NOT NULL,
    amount NUMERIC NOT NULL,
    value_usd NUMERIC NOT NULL,
    signature VARCHAR(132) NOT NULL,
    timestamp BIGINT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Configuration (Environment Variables)

```bash
# Blockchain RPC
BASE_RPC_URL=https://mainnet.base.org
STORY_RPC_URL=https://rpc.story.foundation
PAYMENT_CONTRACT_ADDRESS=0x...
NFT_CONTRACT_ADDRESS=0x...

# Wallets
RELAYER_PRIVATE_KEY=0x...           # For minting on Story
TRUSTED_SIGNER_PRIVATE_KEY=0x...    # For price signatures

# APIs
COINGECKO_API_KEY=...
QUICKNODE_API_URL=https://...
PINATA_API_KEY=...
PINATA_SECRET_KEY=...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/relayer

# Server
PORT=8080
ENVIRONMENT=production

# Monitoring
PROMETHEUS_ENABLED=true
LOG_LEVEL=info
```

### Monitoring & Metrics

**Prometheus Metrics:**
```
relayer_events_processed_total{event_type, status}
relayer_mint_duration_seconds{status}
relayer_price_fetch_errors_total{source}
relayer_queue_size
relayer_retry_count{tx_hash}
```

**Logging:**
- Structured JSON logs with Zap
- Log levels: DEBUG, INFO, WARN, ERROR
- Contextual fields: tx_hash, auction_id, nft_id, bidder

### Deployment

**Docker Container:**
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o relayer main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/relayer .
EXPOSE 8080
CMD ["./relayer"]
```

**Docker Compose Integration:**
```yaml
services:
  relayer:
    build: ./relayer
    ports:
      - "8080:8080"
    environment:
      - BASE_RPC_URL=${BASE_RPC_URL}
      - STORY_RPC_URL=${STORY_RPC_URL}
    depends_on:
      - postgres
    restart: always

  postgres:
    image: postgres:15-alpine
    volumes:
      - relayer-db:/var/lib/postgresql/data
```

**🚀 Ready to start development?**