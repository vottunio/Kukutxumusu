# 📊 AUDITORÍA DE BASE DE DATOS - Kukuxumusu NFT Marketplace

**Última actualización:** 2024-12-19
**Contrato Payment:** `0xa04cEda1fc7eeB2559d2C3936cA678D91b4530E3`

---

## 🔍 RESUMEN EJECUTIVO

Auditoría completa del sistema de guardado de datos en la base de datos, identificando responsabilidades entre frontend y worker.

---

## 📊 ESTADO ACTUAL POR ENTIDAD

### ✅ **NFT** - BIEN IMPLEMENTADO
**Quién guarda:** Frontend (Admin Panel)

**Flujo:**
- ✅ Se guarda correctamente en `/api/admin/create-nft`
- ✅ Campos completos: `imageHash`, `name`, `description`, `collection`, `attributes`
- ✅ Status updates por el worker cuando se mintea

**Nota importante:** El NFT en la DB es un **template/placeholder** hasta que se mintea on-chain en Story Protocol.

**Estados del ciclo de vida:**
```
PENDING → AUCTIONING → AUCTION_ENDED → MINTING → MINTED
```

---

### ✅ **Auction** - BIEN IMPLEMENTADO
**Quién guarda:** Frontend (`/api/admin/create-auction`)

**Flujo:**
- ✅ Se crea en la DB después de crear la auction on-chain
- ✅ Campos básicos guardados: `auctionId`, `nftId`, `startTime`, `endTime`, `duration`
- ✅ Configuración anti-sniping guardada: `extensionTime`, `triggerTime`
- ✅ Tokens permitidos y precios mínimos guardados
- ⚠️ Worker actualiza status a `ENDED` cuando detecta `AuctionWon`

**Mejora implementada:**
- ✅ Job scheduled para actualizar auctions expiradas sin bids (cada 5 minutos)

---

### ✅ **Bid** - BIEN IMPLEMENTADO (RESUELTO)
**Quién guarda:** Worker (event-listener.ts)

**Flujo:**
- ✅ Se guarda cuando el worker detecta evento `BidPlaced`
- ✅ **RESUELTO:** El evento ahora incluye `valueInUSD` correctamente
- ✅ Worker lee `valueInUSD` directamente del evento (no placeholder)
- ✅ Guardado correcto en BD con todos los campos

**Cambios realizados (2024-12-19):**
- ✅ Contrato modificado: Evento `BidPlaced` ahora emite `valueInUSD`
- ✅ Worker actualizado: Lee `valueInUSD` del evento
- ✅ Eliminado placeholder incorrecto

**Resiliencia:**
- ⚠️ Los bids solo se guardan en DB si el worker está corriendo
- ✅ **Fallback implementado:** Si DB vacía o error → API lee bids directamente del contrato
- ✅ Sistema funciona incluso si worker está caído (lee de blockchain)

---

### ✅ **MintTransaction** - BIEN IMPLEMENTADO
**Quién guarda:** Worker (event-listener.ts + mint-executor.ts)

**Flujo:**
- ✅ Se crea cuando se detecta `AuctionWon`
- ✅ Se actualiza correctamente en mint-executor.ts con status y txHash
- ✅ Retry logic implementado (max 3 intentos)
- ✅ Estados: `PENDING` → `PROCESSING` → `SUBMITTED` → `CONFIRMED` / `FAILED`

---

### ✅ **EventLog** - BIEN IMPLEMENTADO
**Quién guarda:** Worker

**Flujo:**
- ✅ Se guardan todos los eventos procesados (`BidPlaced`, `AuctionWon`)
- ✅ Idempotencia implementada (evita duplicados con `txHash_logIndex`)
- ✅ Usado para auditoría y tracking

---

## 📋 TABLA DE RESPONSABILIDADES

| Entidad | Creación | Actualización | Estado |
|---------|----------|---------------|--------|
| **NFT (template)** | ✅ Frontend (admin) | ✅ Worker (status) | ✅ Bien |
| **Auction** | ✅ Frontend (admin) | ⚠️ Worker (parcial) | ⚠️ Mejora pendiente |
| **Bid** | ✅ Worker | - | ✅ Resuelto |
| **MintTransaction** | ✅ Worker | ✅ Worker | ✅ Bien |
| **EventLog** | ✅ Worker | ✅ Worker | ✅ Bien |

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: Admin prepara (ANTES de la subasta)                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Admin sube imagen a Pinata → ipfs://QmImageHash          │
│ 2. Frontend guarda NFT template en DB                       │
│ 3. DB asigna tokenId auto-incremental                       │
│ 4. Estado: PENDING                                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: Admin crea auction (on-chain en Base)               │
├─────────────────────────────────────────────────────────────┤
│ 1. Admin ejecuta createAuction() en contrato                │
│ 2. Frontend espera confirmación                             │
│ 3. Frontend guarda Auction en DB con datos del tx           │
│ 4. Estado NFT: AUCTIONING                                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: Usuarios hacen bids (on-chain en Base)              │
├─────────────────────────────────────────────────────────────┤
│ 1. Usuario obtiene firma del relayer (valueInUSD)           │
│ 2. Usuario ejecuta placeBid() con firma                     │
│ 3. Contrato valida firma y emite BidPlaced                  │
│    - Evento incluye: auctionId, bidder, token, amount,      │
│      valueInUSD, timestamp                                  │
│ 4. Worker detecta evento y guarda Bid en DB                 │
│ 5. Frontend muestra bids desde DB                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: Auction termina (on-chain en Base)                  │
├─────────────────────────────────────────────────────────────┤
│ 1. Alguien ejecuta finalizeAuction()                        │
│ 2. Contrato emite AuctionWon con todos los datos:           │
│    - auctionId, winner, nftContract, nftId, token,          │
│      finalAmount, valueInUSD                                │
│ 3. Worker detecta evento                                    │
│ 4. Worker actualiza Auction status → ENDED                  │
│ 5. Worker crea MintTransaction → PENDING                    │
│ 6. Estado NFT: AUCTION_ENDED                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 5: Worker mintea (on-chain en Story Protocol)          │
├─────────────────────────────────────────────────────────────┤
│ 1. mint-executor procesa MintTransaction pendiente          │
│ 2. Lee imageHash del NFT template                           │
│ 3. Lee bids de la DB (auction history)                      │
│ 4. Genera metadata JSON completo                            │
│    - image: ipfs://QmImageHash                              │
│    - auction_history: [todos los bids con valueInUSD]       │
│ 5. Sube metadata a Pinata → ipfs://QmMetadataHash           │
│ 6. Ejecuta mint() en Story Protocol                         │
│ 7. Transfiere NFT al ganador                                │
│ 8. Actualiza MintTransaction → CONFIRMED                    │
│ 9. Estado NFT: MINTED                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ MEJORAS IMPLEMENTADAS (2024-12-19)

### ✅ Auction status automático (IMPLEMENTADO)

**Solución:**
- ✅ Creado `AuctionScheduler` service en worker
- ✅ Ejecuta cada 5 minutos
- ✅ Actualiza auctions expiradas de `ACTIVE`/`PENDING` → `ENDED`
- ✅ Integrado en worker startup ([worker/src/index.ts](../worker/src/index.ts))

**Código:** [worker/src/services/auction-scheduler.ts](../worker/src/services/auction-scheduler.ts)

---

### ✅ Fallback de lectura de bids (IMPLEMENTADO)

**Solución:**
- ✅ API `/api/auctions/[id]/bids` con fallback automático
- ✅ Primary source: Base de datos (incluye txHash)
- ✅ Fallback source: Contrato on-chain (si DB vacía o error)
- ✅ Respuesta incluye campo `source: 'database' | 'contract'`

**Beneficios:**
- ✅ Sistema resiliente ante caídas del worker
- ✅ Bids siempre visibles (aunque worker esté caído)
- ✅ Fallback automático y transparente

**Código:** [src/app/api/auctions/[id]/bids/route.ts](../src/app/api/auctions/[id]/bids/route.ts)

---

## ✅ PROBLEMAS RESUELTOS

### ✅ Bid.valueInUSD incorrecto (RESUELTO 2024-12-19)

**Problema original:**
- El worker usaba placeholder: `valueInUSD = amount`
- El evento `BidPlaced` no incluía `valueInUSD`

**Solución implementada:**
- ✅ Contrato modificado para emitir `valueInUSD` en evento `BidPlaced`
- ✅ Evento `AuctionWon` también actualizado con `valueInUSD`
- ✅ Worker actualizado para leer del evento
- ✅ Nuevo contrato deployado: `0xa04cEda1fc7eeB2559d2C3936cA678D91b4530E3`

---

## 📌 CONCLUSIÓN

El sistema está **funcionalmente correcto** con las siguientes características:

### ✅ Fortalezas:
- Guardado correcto de todos los datos críticos
- Idempotencia en eventos (no duplicados)
- Retry logic para mints fallidos
- valueInUSD ahora se guarda correctamente

### ✅ Mejoras implementadas:
1. ✅ Job para actualizar auctions expiradas (cada 5 minutos)
2. ✅ Fallback de lectura de bids desde contrato (automático)
3. ⚠️ Monitoreo/alertas si worker está caído (pendiente para producción)

### 🎯 Sistema listo para MVP
El flujo completo funciona correctamente y los datos se persisten de manera confiable.
