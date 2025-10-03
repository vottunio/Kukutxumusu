# 🚀 KUKUXUMUSU MULTIPLE COLLECTIONS DEPLOYMENT

## 📋 Deployment Summary

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Network:** Story Protocol + Base  
**Architecture:** Cross-chain NFT marketplace with factory pattern

---

== Logs ==
  Deploying KukuxumusuNFT contract...
  Deployer: 0x0e60B83F83c5d2684acE779dea8A957e91D02475
  Name: Kukuxumusu NFT
  Symbol: KUKU
  Base URI: ipfs://
  Max Supply: 10000
  Owner: 0x090378a9c80c5E1Ced85e56B2128c1e514E75357
  Royalty Receiver: 0x090378a9c80c5E1Ced85e56B2128c1e514E75357
  Royalty Fee: 500 basis points
  KukuxumusuNFT deployed at: 0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7
  
=== Deployment Summary ===
  Contract: KukuxumusuNFT
  Address: 0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7
  Owner: 0x090378a9c80c5E1Ced85e56B2128c1e514E75357
  Max Supply: 10000
  ========================


## Setting up 1 EVM.

==========================

Chain 1315

Estimated gas price: 30 gwei

Estimated total gas used for script: 2649470

Estimated amount required: 0.0794841 ETH

==========================

##### 1315
✅  [Success] Hash: 0x1e248324ca0299ff8fd326935332ebcd1204fe2230805535cb7334904756094c
Contract Address: 0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7
Block: 9577774
Paid: 0.06114162 ETH (2038054 gas * 30 gwei)

✅ Sequence #1 on 1315 | Total Paid: 0.06114162 ETH (2038054 gas * avg 30 gwei)            

  https://aeneid.storyscan.io/address/0xd9b3913250035D6a2621Cefc9574f7F8c6e5F2B7

## 💰 PAYMENT CONTRACT (Base)

### Contract Details

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
##
Start verification for (1) contracts
Start verifying contract `0xCb214FAd13Da95E02f3C3883aE8Bcf6CdF186e80` deployed on base-sepolia
EVM version: prague
Compiler version: 0.8.30
Optimizations:    200
Constructor args: 000000000000000000000000090378a9c80c5e1ced85e56b2128c1e514e753570000000000000000000000000e60b83f83c5d2684ace779dea8a957e91d02475

Submitting verification for [src/KukuxumusuPayment.sol:KukuxumusuPayment] 0xCb214FAd13Da95E02f3C3883aE8Bcf6CdF186e80.

https://sepolia.basescan.org/address/0xCb214FAd13Da95E02f3C3883aE8Bcf6CdF186e80

KukuxumusuPayment deployed at: 0xCb214FAd13Da95E02f3C3883aE8Bcf6CdF186e80
Treasury: 0x090378a9c80c5E1Ced85e56B2128c1e514E75357
Owner: 0x090378a9c80c5E1Ced85e56B2128c1e514E75357


Relayer en Go, porque:
Ya lo tienes para mintear después de la auction
Puede manejar ambas cosas: firmar bids + mintear NFT
Más performante para última hora de auction (muchos bids)
Flujo completo:
Usuario → Relayer: "Quiero pujar X tokens"
Relayer → firma conversión
Usuario → Smart contract con firma
Auction termina
Relayer → mintea NFT al ganador
Todo centralizado en el relayer. ¿Tiene sentid