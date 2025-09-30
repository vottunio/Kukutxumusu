# Roadmap Técnico Detallado - Proyecto NFT Kukuxumusu

## 📋 RESUMEN EJECUTIVO DEL ENTREGABLE MVP (1 SEMANA)

### Capacidades del Producto Final
- **Conexión de Wallet**: Integración con MetaMask y WalletConnect para interacción multi-chain
- **Arquitectura Cross-Chain**: NFTs minteados en Story Protocol, pagos gestionados en Base
- **Smart Contract NFT (Story)**: Contrato ERC-721 verificado en Story Protocol para la creación y gestión de NFTs
- **Smart Contract de Pagos (Base)**: Sistema de pagos multi-token (VTN, ETH, USDT) y gestión de subastas
- **Backend/Relayer**: Servicio Node.js que conecta eventos de pago en Base con minteo en Story Protocol
- **Sistema de Subastas**: Mecanismo para pujar por NFTs durante un periodo determinado con listado de bidders (en Base)
- **Compra por Ganador**: Proceso automatizado cross-chain para que el ganador de la subasta reciba el NFT
- **Galería de NFTs**: Exploración completa de los NFTs ya minteados/comprados con filtros y búsqueda
- **Panel Administrativo**: Dashboard protegido para que el equipo de Kukuxumusu pueda subir nuevos NFTs
- **Visualización del Saldo**: Dashboard público que muestra el balance de la treasury y estadísticas
- **Almacenamiento Descentralizado**: Todas las imágenes y metadatos almacenados en IPFS vía Pinata

### Stack Tecnológico
- **Blockchain (NFTs)**: Story Protocol - Smart Contract ERC-721 para minteo de NFTs
- **Blockchain (Pagos)**: Base - Smart Contract para pagos multi-token y subastas
- **Tokens de Pago Aceptados**: VTN, ETH (nativo), USDT (ERC-20)
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Web3**: Integración con wagmi/viem para conexión multi-chain de wallets
- **Backend/Relayer**: Servicio Node.js que conecta eventos de Base con Story Protocol
- **Storage**: IPFS/Pinata para imágenes y metadatos
- **Hosting**: AWS EC2 con Docker para frontend y backend/relayer
