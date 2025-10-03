# Wallet Configuration Guide

This document explains where all wallet addresses are configured in the Kukuxumusu NFT platform.

## 📍 Wallet Locations

### 1. Smart Contract Addresses (`.env.local`)

These are the deployed contract addresses on Base and Story Protocol:

```bash
# Base Sepolia - Payment Contract
NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=0x535683a04a9bFE0F9EF102336706A981d12fF125

# Story Protocol Testnet - NFT Factory Contract
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7

# Network mode
NEXT_PUBLIC_NETWORK_MODE=testnet
```

**Location:** `c:\Users\smias\Documents\DEVELOPEMENT\kukutxumusu\.env.local`

---

### 2. Admin & Special Wallets (`src/lib/admin-config.ts`)

All special wallet addresses are centralized in this file:

```typescript
// ADMIN WALLETS (same for testnet and mainnet)
const ADMIN_WALLETS = [
  '0x090378a9c80c5E1Ced85e56B2128c1e514E75357', // Owner (Kukuxumusu)
  '0x0e60B83F83c5d2684acE779dea8A957e91D02475', // Deployer (Technical team)
]

// TREASURY WALLET (same for testnet and mainnet)
const TREASURY_WALLET = '0xE4b01e7d518CC627881bFcA74D3321E5cbf7347e'

// OWNER WALLET (same for testnet and mainnet)
const OWNER_WALLET = '0x090378a9c80c5E1Ced85e56B2128c1e514E75357'

// RELAYER WALLET (to be configured - same for testnet and mainnet)
const RELAYER_WALLET = process.env.RELAYER_ADDRESS || '0x...'
```

**Note:** The same wallet addresses are used for both testnet and mainnet environments.

**Location:** `src/lib/admin-config.ts`

**Helper Functions:**
- `isAdmin(address)` - Check if wallet is admin
- `isOwner(address)` - Check if wallet is owner
- `isRelayer(address)` - Check if wallet is relayer
- `getAdminRole(address)` - Get role ('admin' | 'user')

---

### 3. Treasury Wallet (On-Chain)

The treasury wallet is **configured inside the Payment smart contract on Base**.

**How to verify:**
```typescript
// Read treasury address from contract
const treasuryAddress = await paymentContract.read.treasury()
```

**How to change (owner only):**
```typescript
// Only contract owner can call this
await paymentContract.write.setTreasury(['0xNewTreasuryAddress'])
```

**Current value (testnet & mainnet):** `0x090378a9c80c5E1Ced85e56B2128c1e514E75357`

---

### 4. Relayer Wallet (Go Service - Pending)

The Go relayer will use a dedicated wallet to execute mints on Story Protocol.

**Configuration location:** Go relayer `.env` file (to be created)

```bash
# Go Relayer Environment Variables
RELAYER_PRIVATE_KEY=0x...  # Private key (NEVER commit this!)
RELAYER_ADDRESS=0x...       # Public address
```

**Important:**
- This wallet must be authorized in the NFT contract on Story
- Private key must be kept secure (use AWS Secrets Manager in production)
- Need to fund this wallet with testnet tokens for gas fees

---

## 🔐 Security Best Practices

### Development (Testnet)
- ✅ Hardcode addresses in `admin-config.ts`
- ✅ Store private keys in `.env.local` (never commit!)
- ✅ Use test wallets with no real funds

### Production (Mainnet)
- ❌ **NEVER** hardcode mainnet private keys
- ✅ Use AWS Secrets Manager or similar for private keys
- ✅ Use hardware wallets for owner/treasury operations
- ✅ Implement multi-sig for treasury wallet
- ✅ Separate relayer wallet with limited permissions
- ✅ Regular security audits

---

## 📝 Wallet Roles & Permissions

| Wallet | Location | Permissions | Used By |
|--------|----------|-------------|---------|
| **Owner** | Smart contracts | Full contract control, withdraw funds, pause | Admin dashboard |
| **Treasury** | Payment contract | Receives all payments (ETH/VTN/USDT) | Automated |
| **Admin** | admin-config.ts | Access admin dashboard, upload NFTs, create auctions | Frontend |
| **Relayer** | Go service | Mint NFTs on Story Protocol | Backend service |

---

## 🚀 Setup Instructions

### For Development

1. **Copy `.env.local.example` to `.env.local`**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add your wallet address to admin list** (if needed)

   Edit `src/lib/admin-config.ts`:
   ```typescript
   export const ADMIN_WALLETS: string[] = [
     '0x090378a9c80c5E1Ced85e56B2128c1e514E75357',
     '0x0e60B83F83c5d2684acE779dea8A957e91D02475',
     '0xYourWalletAddress', // Add your wallet here
   ]
   ```

3. **Fund your wallet with testnet tokens**
   - Base Sepolia ETH: https://www.alchemy.com/faucets/base-sepolia
   - Story Protocol testnet: https://faucet.story.foundation/

### For Production

**Note:** Same wallet addresses are used for both testnet and mainnet.

1. **Verify addresses in `admin-config.ts`**
   ```typescript
   // Same wallets for testnet and mainnet
   export const ADMIN_WALLETS = [
     '0x090378a9c80c5E1Ced85e56B2128c1e514E75357', // Owner
     '0x0e60B83F83c5d2684acE779dea8A957e91D02475', // Deployer
   ]
   export const TREASURY_WALLET = '0x090378a9c80c5E1Ced85e56B2128c1e514E75357'
   export const OWNER_WALLET = '0x090378a9c80c5E1Ced85e56B2128c1e514E75357'
   ```

2. **Configure treasury wallet on mainnet contract**
   - Call `setTreasury()` on Payment contract (mainnet)
   - Same address as testnet: `0x090378a9c80c5E1Ced85e56B2128c1e514E75357`
   - (Optional) Consider using multisig for extra security

3. **Setup relayer wallet**
   - Generate dedicated wallet for relayer (or use same as testnet)
   - Fund with mainnet tokens (Base & Story)
   - Store private key in AWS Secrets Manager
   - Authorize in NFT contract on Story mainnet

---

## 🔄 Migration Checklist (Testnet → Mainnet)

- [ ] Update `NEXT_PUBLIC_NETWORK_MODE=mainnet` in `.env.local`
- [ ] ✅ Wallet addresses already configured (same for testnet/mainnet)
- [ ] Deploy new contracts to mainnet (Base + Story)
- [ ] Update contract addresses in `.env.local`:
  - `NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS` (Base mainnet)
  - `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` (Story mainnet)
- [ ] Configure treasury in mainnet contract via `setTreasury()`
- [ ] Setup mainnet relayer wallet in AWS Secrets Manager
- [ ] Authorize relayer address in Story NFT contract (mainnet)
- [ ] Fund owner wallet with mainnet tokens (Base + Story)
- [ ] Fund relayer wallet with mainnet tokens (Base + Story)
- [ ] Test with small amounts before going live
- [ ] Verify contracts on block explorers (BaseScan + StoryScan)

---

## 📞 Support

If you need to add/remove admin wallets or change configuration, edit:
- `src/lib/admin-config.ts` - For admin/owner/treasury addresses
- `.env.local` - For contract addresses and environment variables

**Never commit private keys or sensitive data to the repository!**
