#!/usr/bin/env node

/**
 * Script to automatically create GitHub Issues from technical_en.md
 *
 * Prerequisites:
 * 1. Install GitHub CLI: https://cli.github.com/
 * 2. Authenticate: gh auth login
 * 3. Run: node create-github-issues.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPO = 'vottunio/Kukutxumusu';
const DRY_RUN = false; // Set to false to actually create issues

// Issue templates organized by day
const issues = [
  // DAY 1 - Foundation
  {
    title: '[Day 1] Setup Payment Smart Contract on Base',
    body: `## Task
Create payment smart contract with multi-token support (VTN, ETH, USDT)

## Checklist
- [ ] Create payment contract with multi-token support
- [ ] Implement direct payment function with ERC-20 token validation
- [ ] Configure multisig treasury wallet as fund recipient
- [ ] Add withdraw function for ERC-20 tokens and native ETH
- [ ] Implement events: \`PaymentReceived\`, \`DirectPurchase\`
- [ ] Create basic unit testing for multi-token payments`,
    labels: ['day-1', 'smart-contracts', 'base', 'blockchain'],
    milestone: 'Day 1: Foundation'
  },
  {
    title: '[Day 1] Setup NFT Smart Contract on Story Protocol',
    body: `## Task
Create ERC-721 NFT contract on Story Protocol with access control

## Checklist
- [ ] Create ERC-721 contract on Story Protocol
- [ ] Implement mint function with access control (only authorized relayer)
- [ ] Add setBaseURI function for IPFS metadata
- [ ] Implement ownership controls (onlyOwner)
- [ ] Configure royalties for secondary sales
- [ ] Create basic unit testing for mint`,
    labels: ['day-1', 'smart-contracts', 'story-protocol', 'blockchain'],
    milestone: 'Day 1: Foundation'
  },
  {
    title: '[Day 1] Testing and Initial Validation - Smart Contracts',
    body: `## Task
Deploy and verify both contracts on testnets

## Checklist
- [ ] Deploy Payment contract on Base testnet
- [ ] Deploy NFT contract on Story testnet
- [ ] Verify both contracts on their respective block explorers
- [ ] Manual testing of multi-token payments on Base
- [ ] Manual testing of authorized mint on Story
- [ ] Configure testing wallets with funds on both networks`,
    labels: ['day-1', 'testing', 'blockchain'],
    milestone: 'Day 1: Foundation'
  },
  {
    title: '[Day 1] Setup Frontend Project',
    body: `## Task
Initialize Next.js project with multi-chain Web3 integration

## Checklist
- [ ] Configure Next.js with TypeScript
- [ ] Setup Tailwind CSS and theme configuration
- [ ] Install and configure wagmi + viem for multi-chain Web3
- [ ] Configure support for Base and Story Protocol
- [ ] Create base component structure (Header, Footer, Layout)`,
    labels: ['day-1', 'frontend', 'setup'],
    milestone: 'Day 1: Foundation'
  },
  {
    title: '[Day 1] Multi-Chain Blockchain Connection',
    body: `## Task
Implement multi-chain wallet connection for Base and Story

## Checklist
- [ ] Implement multi-chain wallet connection (MetaMask, WalletConnect)
- [ ] Create hooks to interact with contracts on Base and Story
- [ ] Setup providers and configuration for both networks (Base + Story)
- [ ] Implement automatic network switching based on context
- [ ] Basic testing of reading both contracts`,
    labels: ['day-1', 'frontend', 'web3'],
    milestone: 'Day 1: Foundation'
  },
  {
    title: '[Day 1] Setup Backend Relayer in Go',
    body: `## Task
Configure Go relayer project with go-ethereum

## Checklist
- [ ] Configure Go project with modules
- [ ] Setup go-ethereum for multi-chain interaction
- [ ] Configure RPC clients for Base and Story
- [ ] Implement event listening system on Base using goroutines
- [ ] Create pending transaction queue with PostgreSQL/SQLite
- [ ] Implement basic REST API for health checks`,
    labels: ['day-1', 'backend', 'relayer', 'go'],
    milestone: 'Day 1: Foundation'
  },
  {
    title: '[Day 1] Setup IPFS/Storage Infrastructure',
    body: `## Task
Configure IPFS and Pinata for NFT storage

## Checklist
- [ ] Configure Pinata account and API keys
- [ ] Create upload functions to IPFS
- [ ] Implement metadata JSON generation per ERC-721 standard
- [ ] Configure original image validation (2000x2000px, PNG/JPG format, max 10MB)
- [ ] Implement automatic generation of optimized versions (400x400px, 800x800px)
- [ ] Basic image upload and quality verification testing`,
    labels: ['day-1', 'infrastructure', 'ipfs'],
    milestone: 'Day 1: Foundation'
  },

  // DAY 2 - Core Functionality
  {
    title: '[Day 2] Complete Payment Smart Contract Features',
    body: `## Task
Add auction system and advanced payment features

## Checklist
- [ ] Add pausable/unpausable function to payment contract
- [ ] Implement multi-token withdraw funds for owner
- [ ] Add max supply and per-token price controls
- [ ] Implement setPrice function for admin (VTN, ETH, USDT)
- [ ] Develop system of multiple simultaneous auctions with time limit
- [ ] Create functions to register and list bidders in each auction
- [ ] Implement winner determination logic
- [ ] Add events: \`AuctionCreated\`, \`BidPlaced\`, \`AuctionWon\`
- [ ] Complete testing of all functions on Base`,
    labels: ['day-2', 'smart-contracts', 'base', 'auctions'],
    milestone: 'Day 2: Core Functionality'
  },
  {
    title: '[Day 2] Complete NFT Smart Contract on Story',
    body: `## Task
Finalize NFT contract with batch minting and transfers

## Checklist
- [ ] Create batch mint function for relayer (mint multiple NFTs)
- [ ] Implement automatic transfer function to buyer
- [ ] Add function to update authorized relayer
- [ ] Implement emergency pause function
- [ ] Add events: \`NFTMinted\`, \`BatchMinted\`
- [ ] Complete testing of mint and transfers on Story`,
    labels: ['day-2', 'smart-contracts', 'story-protocol'],
    milestone: 'Day 2: Core Functionality'
  },
  {
    title: '[Day 2] Backend/Relayer Cross-Chain Logic',
    body: `## Task
Implement Go relayer cross-chain minting logic

## Checklist
- [ ] Implement \`PaymentReceived\` event listener on Base with dedicated goroutine
- [ ] Implement \`AuctionWon\` event listener on Base with dedicated goroutine
- [ ] Create automatic mint logic on Story when payment detected
- [ ] Implement retry system with exponential backoff
- [ ] Create structured logging system (logrus/zap)
- [ ] Implement success/error notifications
- [ ] Idempotency system to prevent double mint
- [ ] End-to-end testing of cross-chain flow`,
    labels: ['day-2', 'backend', 'relayer', 'go', 'cross-chain'],
    milestone: 'Day 2: Core Functionality'
  },
  {
    title: '[Day 2] Payment/Mint and Auctions UI',
    body: `## Task
Create payment and auction interface with token selector

## Checklist
- [ ] Create PaymentPage component with token selection (VTN/ETH/USDT)
- [ ] Implement NFT preview before payment with full-size visualization (2000x2000px)
- [ ] Add frontend validations (token balance, connection, correct network)
- [ ] Create quantity and payment token selection component
- [ ] Design auction interface with counter and token selector
- [ ] Implement bid form with different tokens
- [ ] Create real-time bidder listing with token used`,
    labels: ['day-2', 'frontend', 'ui'],
    milestone: 'Day 2: Core Functionality'
  },
  {
    title: '[Day 2] Complete Cross-Chain Integration',
    body: `## Task
Integrate frontend with payment contract and cross-chain tracking

## Checklist
- [ ] Connect UI with Payment contract on Base
- [ ] Implement cross-chain transaction states (payment pending → payment success → mint pending → mint success)
- [ ] Add visual feedback for each cross-chain process state
- [ ] Implement Web3 error handling on both networks
- [ ] Integrate auction system with frontend
- [ ] Develop logic to update bids in real-time
- [ ] Implement notifications for auction winners and mint status
- [ ] Create cross-chain tracking component to see progress
- [ ] Responsive testing on mobile devices`,
    labels: ['day-2', 'frontend', 'integration', 'cross-chain'],
    milestone: 'Day 2: Core Functionality'
  },

  // DAY 3 - Admin Dashboard
  {
    title: '[Day 3] Admin Dashboard Base Interface',
    body: `## Task
Create admin panel with wallet authentication

## Checklist
- [ ] Create admin page with wallet authentication
- [ ] Implement admin route protection
- [ ] Create NFT upload form
- [ ] Implement image preview before upload with dimension verification (2000x2000px)`,
    labels: ['day-3', 'frontend', 'admin'],
    milestone: 'Day 3: Admin Dashboard'
  },
  {
    title: '[Day 3] NFT Upload Functionality',
    body: `## Task
Integrate upload form with IPFS

## Checklist
- [ ] Integrate form with IPFS upload
- [ ] Create automatic metadata JSON generation with complete ERC-721 standard
- [ ] Implement image format validation (2000x2000px, PNG/JPG, max 10MB)
- [ ] Configure automatic generation of optimized versions for gallery and cards
- [ ] Add progress bars for uploads`,
    labels: ['day-3', 'frontend', 'admin', 'ipfs'],
    milestone: 'Day 3: Admin Dashboard'
  },
  {
    title: '[Day 3] Smart Contract Optimization and Audit',
    body: `## Task
Optimize and document both smart contracts

## Checklist
- [ ] Optimize gas consumption of both contracts (Base and Story)
- [ ] Add complete natspec documentation to both contracts
- [ ] Create automated deployment scripts for both networks
- [ ] Prepare contracts for basic security review`,
    labels: ['day-3', 'smart-contracts', 'optimization'],
    milestone: 'Day 3: Admin Dashboard'
  },
  {
    title: '[Day 3] Relayer Monitoring Dashboard',
    body: `## Task
Create monitoring endpoints and dashboard for relayer

## Checklist
- [ ] Create REST endpoints in Go to query cross-chain transaction status
- [ ] Implement Prometheus metrics endpoint
- [ ] Implement admin dashboard to view pending mints queue
- [ ] Add relayer metrics (success/failure, average time, latency)
- [ ] Implement alert system for relayer failures
- [ ] Health check endpoint for monitoring`,
    labels: ['day-3', 'backend', 'relayer', 'monitoring'],
    milestone: 'Day 3: Admin Dashboard'
  },
  {
    title: '[Day 3] Dashboard Integration Testing',
    body: `## Task
Test complete admin flow with cross-chain tracking

## Checklist
- [ ] Complete testing of admin upload flow to IPFS
- [ ] Verify correct metadata on IPFS
- [ ] Test minting of newly added NFTs via relayer
- [ ] Validate URIs are generated correctly on Story
- [ ] End-to-end cross-chain tracking testing`,
    labels: ['day-3', 'testing', 'integration'],
    milestone: 'Day 3: Admin Dashboard'
  },

  // DAY 4 - Explore & Gallery
  {
    title: '[Day 4] Explore Page Gallery Base',
    body: `## Task
Create responsive gallery layout

## Checklist
- [ ] Create responsive gallery layout
- [ ] Implement individual NFTCard component with medium resolution images (800x800px)
- [ ] Connect with Story Protocol data (tokenURI of NFTs)
- [ ] Create image loading system with different resolutions (400x400px thumbnails for gallery)
- [ ] Implement sales statistics section (Base data) and transparency`,
    labels: ['day-4', 'frontend', 'gallery'],
    milestone: 'Day 4: Explore & Gallery'
  },
  {
    title: '[Day 4] Advanced Explore Functionalities',
    body: `## Task
Add filters, search and pagination

## Checklist
- [ ] Implement filters by attributes/traits
- [ ] Add search by token ID or owner
- [ ] Create efficient pagination system
- [ ] Implement lazy loading for performance with progressive resolution loading (thumbnail -> media -> full)
- [ ] Add loading and error handling states
- [ ] Show cross-chain information (price paid on Base, NFT on Story)`,
    labels: ['day-4', 'frontend', 'features'],
    milestone: 'Day 4: Explore & Gallery'
  },
  {
    title: '[Day 4] Cross-Chain APIs and Utilities',
    body: `## Task
Create backend utilities for cross-chain data

## Checklist
- [ ] Create utility functions to parse Story metadata
- [ ] Implement optimized getAllTokens function for Story
- [ ] Create endpoints to serve metadata and different image resolutions
- [ ] Optimize cross-chain queries (NFTs from Story + payments from Base)
- [ ] Implement cross-chain data cache for performance
- [ ] Create endpoint to link Story NFT with Base payment`,
    labels: ['day-4', 'backend', 'api', 'cross-chain'],
    milestone: 'Day 4: Explore & Gallery'
  },

  // DAY 5 - Testing & Deployment
  {
    title: '[Day 5] Complete Frontend Testing',
    body: `## Task
End-to-end frontend testing

## Checklist
- [ ] End-to-end testing of all user flows
- [ ] Responsive design testing on different devices
- [ ] Performance and load optimization testing
- [ ] Basic accessibility validation`,
    labels: ['day-5', 'testing', 'frontend'],
    milestone: 'Day 5: Testing & Deployment'
  },
  {
    title: '[Day 5] Backend/Relayer Complete Testing',
    body: `## Task
Test both contracts and relayer thoroughly

## Checklist
- [ ] Complete testing of all functions on both contracts (Base + Story)
- [ ] IPFS integration testing
- [ ] Generated metadata validation
- [ ] Gas costs testing and optimization on both networks
- [ ] Exhaustive cross-chain flow testing
- [ ] Relayer automatic retry testing
- [ ] Relayer failure handling testing`,
    labels: ['day-5', 'testing', 'backend'],
    milestone: 'Day 5: Testing & Deployment'
  },
  {
    title: '[Day 5] Blockchain Production Deploy',
    body: `## Task
Deploy both contracts to mainnet

## Checklist
- [ ] Final deployment of Payment contract on Base mainnet
- [ ] Final deployment of NFT contract on Story Protocol mainnet
- [ ] Verify both contracts on their respective block explorers
- [ ] Configure ownership correctly on both contracts
- [ ] Configure multisig treasury wallet on Base
- [ ] Configure authorized relayer wallet on Story
- [ ] Create secure backup of private keys (Base, Story, Relayer)`,
    labels: ['day-5', 'deployment', 'blockchain'],
    milestone: 'Day 5: Testing & Deployment'
  },
  {
    title: '[Day 5] Frontend/Backend/Relayer Production Deploy',
    body: `## Task
Deploy all services to AWS EC2

## Checklist
- [ ] Optimized production build of frontend
- [ ] Compile Go relayer binary for production
- [ ] Create Docker images for frontend (Node.js), backend API (Node.js) and relayer (Go)
- [ ] Setup Docker Compose for production environment (3 services)
- [ ] Deploy on AWS EC2 with security configuration
- [ ] Configure custom domain with Route 53
- [ ] Setup SSL/TLS with managed certificates
- [ ] Configure RPC endpoints for Base and Story in production
- [ ] Configure environment variables for Go relayer
- [ ] Implement public transparency dashboard with Base data
- [ ] Configure CloudWatch for relayer monitoring
- [ ] Setup Prometheus + Grafana for relayer metrics (optional)`,
    labels: ['day-5', 'deployment', 'infrastructure'],
    milestone: 'Day 5: Testing & Deployment'
  },
  {
    title: '[Day 5] Final Testing and Documentation',
    body: `## Task
Complete mainnet testing and documentation

## Checklist
- [ ] Complete cross-chain testing on mainnet with real funds (VTN, ETH, USDT)
- [ ] Verification of all functionalities on both networks
- [ ] Complete flow testing: payment on Base → mint on Story
- [ ] Complete auction testing with different tokens
- [ ] Create technical documentation for handover (includes cross-chain architecture)
- [ ] Document deployment process on both networks
- [ ] Prepare final presentation demo
- [ ] Setup monitoring and alerts for relayer
- [ ] Configure auto-scaling for EC2 if needed
- [ ] Implement automated backup of relayer database`,
    labels: ['day-5', 'testing', 'documentation'],
    milestone: 'Day 5: Testing & Deployment'
  }
];

// Function to create a single issue
function createIssue(issue) {
  const { title, body, labels, milestone } = issue;

  const labelsStr = labels.map(l => `"${l}"`).join(',');
  const command = `gh issue create --repo ${REPO} --title "${title}" --body "${body.replace(/"/g, '\\"')}" --label ${labelsStr} --milestone "${milestone}"`;

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would create issue:`);
    console.log(`Title: ${title}`);
    console.log(`Labels: ${labels.join(', ')}`);
    console.log(`Milestone: ${milestone}`);
    return;
  }

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Created: ${title}`);
  } catch (error) {
    console.error(`❌ Failed to create: ${title}`);
    console.error(error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 GitHub Issues Creator for Kukuxumusu NFT Project\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No issues will be created');
    console.log('⚠️  Set DRY_RUN = false in the script to actually create issues\n');
  }

  console.log(`📊 Total issues to create: ${issues.length}\n`);
  console.log(`📦 Repository: ${REPO}\n`);

  if (REPO === 'YOUR_GITHUB_USERNAME/kukutxumusu') {
    console.error('❌ ERROR: Please update the REPO variable in the script!');
    console.error('   Change "YOUR_GITHUB_USERNAME" to your actual GitHub username');
    process.exit(1);
  }

  // Create milestones first
  const milestones = [...new Set(issues.map(i => i.milestone))];
  console.log('📌 Creating milestones...\n');

  for (const milestone of milestones) {
    if (!DRY_RUN) {
      try {
        execSync(`gh api repos/${REPO}/milestones -f title="${milestone}"`, { stdio: 'inherit' });
        console.log(`✅ Created milestone: ${milestone}`);
      } catch (error) {
        console.log(`⚠️  Milestone might already exist: ${milestone}`);
      }
    } else {
      console.log(`[DRY RUN] Would create milestone: ${milestone}`);
    }
  }

  console.log('\n📝 Creating issues...\n');

  // Create all issues
  for (const issue of issues) {
    createIssue(issue);
  }

  console.log('\n✨ Done!');

  if (DRY_RUN) {
    console.log('\n💡 To actually create the issues:');
    console.log('   1. Update REPO variable with your GitHub username');
    console.log('   2. Set DRY_RUN = false');
    console.log('   3. Run: node create-github-issues.js');
  }
}

main().catch(console.error);