# Detailed Technical Roadmap - Kukuxumusu NFT Project

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

**Backend/Relayer (Go)**
- Service written in Go using go-ethereum (Geth)
- Listens for successful payment events on Base (`PaymentReceived`, `AuctionWon`)
- Executes automatic NFT mint on Story Protocol
- Transfers NFT to buyer/winner
- Maintains cross-chain transaction log
- REST API for querying pending transaction status
- Goroutines for listening to multiple simultaneous events
- Persistent queue system with PostgreSQL/SQLite

**API Services**
- Integrated in Next.js through API routes
- Endpoints for querying cross-chain data
- NFT metadata cache

**Storage**:
  - IPFS/Pinata: Images and NFT metadata
    - Original images: 2000x2000px (1:1), PNG/JPG format, max 10MB, with optional transparency
    - Automatically generated optimized versions:
      - Thumbnail (gallery): 400x400px
      - Media (cards): 800x800px
      - Full (detail view): 2000x2000px original
    - Metadata: ERC-721 JSON standard with attributes/traits
- Database: Auxiliary information, cache and cross-chain tracking

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
**Payment Smart Contract (Base)**
- [?] Create payment contract with multi-token support (VTN, ETH, USDT) - *Already developed*
- [?] Implement direct payment function with ERC-20 token validation - *Already developed*
- [?] Configure multisig treasury wallet as fund recipient - *Already developed*
- [?] Add withdraw function for ERC-20 tokens and native ETH - *Already developed*
- [?] Implement events: `PaymentReceived`, `DirectPurchase` - *Already developed*
- [?] Create basic unit testing for multi-token payments - *No testnet available*

**NFT Smart Contract (Story Protocol)**
- [?] Create ERC-721 contract on Story Protocol - *Already developed*
- [?] Implement mint function with access control (only authorized relayer) - *Already developed*
- [?] Add setBaseURI function for IPFS metadata - *Already developed*
- [?] Implement ownership controls (onlyOwner) - *Already developed*
- [?] Configure royalties for secondary sales - *Already developed*
- [?] Create basic unit testing for mint - *No testnet available*

**Initial Testing and Validation**
- [?] Deploy Payment contract on Base testnet - *No testnet available*
- [?] Deploy NFT contract on Story testnet - *No testnet available*
- [?] Verify both contracts on their respective block explorers
- [?] Manual test of multi-token payments on Base - *No testnet available*
- [?] Manual test of authorized mint on Story - *No testnet available*
- [?] Configure testing wallets with funds on both networks - *No testnet available*

#### Frontend Development
**Frontend Project Setup**
- [✅] Configure Next.js with TypeScript - *Completed*
- [✅] Setup Tailwind CSS and theme configuration - *Completed*
- [✅] Install and configure Web3 moderno (WalletConnect v2 + viem) - *Completed*
- [✅] Configure support for Base and Story Protocol - *Completed*
- [✅] Create base component structure (Header, Footer, Layout) - *Completed*

**Multi-Chain Blockchain Connection**
- [ ] Implement multi-chain wallet connection (MetaMask, WalletConnect)
- [ ] Create hooks for interacting with contracts on Base and Story
- [ ] Setup providers and configuration for both networks (Base + Story)
- [ ] Implement automatic network switch according to context
- [ ] Basic test of reading from both contracts

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
- [ ] Configure Pinata account and API keys
- [ ] Create upload functions to IPFS
- [ ] Implement JSON metadata generation according to ERC-721 standard
- [ ] Configure validation of original images (2000x2000px, PNG/JPG format, max 10MB)
- [ ] Implement automatic generation of optimized versions (400x400px, 800x800px)
- [ ] Test basic image upload and quality verification

**📋 Day 1 Deliverables:**
- [?] Functional Payment smart contract on Base testnet - *Already developed, no testnet available*
- [?] Functional NFT smart contract on Story testnet - *Already developed, no testnet available*
- [ ] Backend/Relayer configured and listening events
- [🔄] Frontend with multi-chain wallet connection working - *Next.js + Web3 setup completed, connection pending*
- [ ] IPFS configured and tested

---

### DAY 2 (TUESDAY) - CORE MINT FUNCTIONALITY

#### Blockchain Development
**Complete Payment Smart Contract (Base)**
- [ ] Add pausable/unpausable function to payment contract
- [ ] Implement multi-token withdraw funds for owner
- [ ] Add controls for max supply and prices per token
- [ ] Implement setPrice function for admin (VTN, ETH, USDT)
- [ ] Develop system of multiple simultaneous auctions with time limit
- [ ] Create functions to register and list bidders in each auction
- [ ] Implement winner determination logic
- [ ] Add events: `AuctionCreated`, `BidPlaced`, `AuctionWon`
- [?] Complete testing of all functions on Base - *No testnet available*

**Complete NFT Smart Contract (Story)**
- [ ] Create batch mint function for relayer (mint multiple NFTs)
- [ ] Implement automatic transfer function to buyer
- [ ] Add function to update authorized relayer
- [ ] Implement emergency pause function
- [ ] Add events: `NFTMinted`, `BatchMinted`
- [?] Complete testing of mint and transfers on Story - *No testnet available*

**Backend/Relayer - Cross-Chain Logic (Go)**
- [ ] Implement listener for `PaymentReceived` event on Base with dedicated goroutine
- [ ] Implement listener for `AuctionWon` event on Base with dedicated goroutine
- [ ] Create automatic mint logic on Story when detecting payment
- [ ] Implement retry system with exponential backoff
- [ ] Create structured logging system (logrus/zap)
- [ ] Implement success/error notifications
- [ ] Idempotency system to avoid double mint
- [ ] End-to-end testing of cross-chain flow

#### Frontend Development
**Payment/Mint and Auctions UI Page**
- [ ] Create PaymentPage component with token selection (VTN/ETH/USDT)
- [ ] Implement NFT preview before payment with full-size visualization (2000x2000px)
- [ ] Add frontend validations (token balance, connection, correct network)
- [ ] Create quantity selection and payment token component
- [ ] Design auction interface with counter and token selector
- [ ] Implement form for placing bids with different tokens
- [ ] Create real-time bidder listing with used token

**Complete Cross-Chain Integration**
- [ ] Connect UI with Payment contract on Base
- [ ] Implement cross-chain transaction states (payment pending → payment success → mint pending → mint success)
- [ ] Add visual feedback for each state of the cross-chain process
- [ ] Implement Web3 error handling on both networks
- [ ] Integrate auction system with frontend
- [ ] Develop logic to update bids in real time
- [ ] Implement notifications for auction winners and mint status
- [ ] Create cross-chain tracking component to see progress
- [ ] Responsive testing on mobile devices

**📋 Day 2 Deliverables:**
- Functional multi-token payment system on Base
- Auction system with bidder listing implemented
- Backend/Relayer executing automatic mints on Story
- Polished user interface for cross-chain payments and auctions
- Complete validations and error handling
- Automated cross-chain process for purchase/auction → mint on Story

---

### DAY 3 (WEDNESDAY) - ADMINISTRATIVE DASHBOARD

#### Frontend Development - Admin Dashboard
**Base Admin Interface**
- [ ] Create admin page with wallet authentication
- [ ] Implement admin route protection
- [ ] Create NFT upload form
- [ ] Implement image preview before upload with dimension verification (2000x2000px)

**NFT Upload Functionality**
- [ ] Integrate form with IPFS upload
- [ ] Create automatic JSON metadata generation with complete ERC-721 standard
- [ ] Implement image format validation (2000x2000px, PNG/JPG, max 10MB)
- [ ] Configure automatic generation of optimized versions for gallery and cards
- [ ] Add progress bars for uploads

#### Blockchain Development - Admin Support
**Optimization and Audit**
- [ ] Optimize gas consumption of both contracts (Base and Story)
- [ ] Add complete natspec documentation to both contracts
- [ ] Create automated deployment scripts for both networks
- [ ] Prepare contracts for basic security review

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
- Fully functional admin dashboard
- NFT upload system working with IPFS
- Metadata correctly generated on IPFS
- Backend/Relayer with monitoring dashboard
- Operational cross-chain tracking system

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
- [ ] Multi-wallet multi-chain connection (MetaMask, WalletConnect)
- [ ] Support for Base and Story Protocol with automatic switch
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
- [✅] Responsive design for all devices - *Next.js + Tailwind setup completed*
- [ ] Loading, error and success states for both networks
- [ ] Public transparency dashboard with Base data
- [ ] Treasury wallet balance visualization on Base
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

**🚀 Ready to start development?**