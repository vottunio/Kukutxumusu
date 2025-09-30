# Roadmap Técnico Detallado - Proyecto NFT Kukuxumusu

## 📋 RESUMEN EJECUTIVO DEL ENTREGABLE MVP (1 SEMANA)

### Capacidades del Producto Final
- **Conexión de Wallet**: Integración con MetaMask y WalletConnect para interacción con la blockchain
- **Arquitectura Cross-Chain**: NFTs minteados en Story Protocol, pagos gestionados en Base
- **Smart Contract NFT (Story)**: Contrato ERC-721 verificado en Story Protocol para la creación y gestión de NFTs
- **Smart Contract de Pagos (Base)**: Sistema de pagos multi-token (VTN, ETH, USDT) y gestión de subastas
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

### Entregables Técnicos
- Smart contract NFT desplegado y verificado en Story Protocol mainnet
- Smart contract de Pagos desplegado y verificado en Base mainnet
- Backend/Relayer para comunicación cross-chain entre Base y Story
- Frontend responsive desplegado en dominio personalizado con soporte multi-chain
- Sistema de subida de NFTs para administradores
- Documentación técnica completa
- Código fuente en repositorio GitHub

### Limitaciones del MVP
- Sin funcionalidades DAO (previsto para Fase 2)
- Panel administrativo con funciones básicas
- Sin integración con marketplaces externos
- Sin auditoría completa de smart contracts (solo review básica)
- Explore con filtros básicos (versión avanzada en Fase 2)
- Sin herramientas de análisis avanzado de datos
- Monitoreo básico (sin sistema completo de alertas)

### Gestión Económica y Transparencia
- **Treasury Wallet (Base)**: Implementación de wallet multisig dedicada en Base para recibir todos los fondos de ventas en VTN, ETH y USDT
- **Dashboard Público**: Página pública que muestra en tiempo real el número de NFTs vendidos y balance de la treasury en Base
- **Smart Contracts Verificados**: Código de ambos contratos (Base y Story) verificados en sus respectivos exploradores de bloques
- **Función withdraw**: Sólo la wallet autorizada de Kukuxumusu podrá retirar los fondos acumulados en Base
- **Royalties**: Configuración de royalties del 5-10% en ventas secundarias que se envían automáticamente a la treasury
- **Transparencia Cross-Chain**: Todos los eventos de pagos en Base están vinculados con los NFTs minteados en Story

### Arquitectura de la Aplicación

#### Frontend (Single Page Application)
- **Tecnología**: Next.js + React + TypeScript + Tailwind CSS
- **Estructura**: Una única aplicación web con múltiples páginas/secciones
- **Diseño inspirado en**: nouns.wtf
- **Páginas principales**:
  - **Home (Landing + Subasta Activa)**: Hero con subasta principal destacada, contador de tiempo, formulario de puja directo con selector de token (VTN/ETH/USDT), listado de bidders en tiempo real, información breve del proyecto, últimos NFTs minteados
  - **Explore**: Galería completa de todos los NFTs minteados con filtros, búsqueda y grid responsive
  - **Dashboard Público**: Estadísticas de ventas, balance de treasury en Base, historial de transacciones cross-chain
  - **Dashboard Admin**: Panel protegido para upload de NFTs, gestión de subastas y monitoreo del relayer (acceso restringido por wallet)

#### Backend - Arquitectura Cross-Chain

**Smart Contract de Pagos (Base)**
- Gestión de pagos multi-token (VTN, ETH, USDT)
- Sistema de múltiples subastas simultáneas con tiempo límite
- Registro de bidders y determinación de ganadores
- Treasury multisig para custodia de fondos
- Eventos on-chain: `PaymentReceived`, `AuctionCreated`, `BidPlaced`, `AuctionWon`
- Cada puja (bid) se registrará como un evento on-chain para garantizar total transparencia y verificabilidad
- Los eventos `BidPlaced` contendrán toda la información de la puja (bidder, monto, timestamp, tokenId)

**Smart Contract NFT (Story Protocol)**
- Minteo de NFTs ERC-721 con metadatos en IPFS
- Control de acceso: solo el backend/relayer autorizado puede mintear
- Función de transferencia automática al ganador de subasta
- Royalties configurados para ventas secundarias

**Backend/Relayer (Node.js)**
- Escucha eventos de pagos exitosos en Base (`PaymentReceived`, `AuctionWon`)
- Ejecuta mint automático de NFT en Story Protocol
- Transfiere NFT al comprador/ganador
- Mantiene registro de transacciones cross-chain
- API para consultar estado de transacciones pendientes

**API Services**
- Integrados en Next.js mediante API routes
- Endpoints para consultar datos cross-chain
- Cache de metadata de NFTs

**Almacenamiento**:
  - IPFS/Pinata: Imágenes y metadatos de NFTs
    - Imágenes originales: 2000x2000px (1:1), formato PNG/JPG, máx 10MB, con transparencia opcional
    - Versiones optimizadas automáticamente generadas:
      - Thumbnail (galería): 400x400px
      - Media (cards): 800x800px
      - Full (vista detalle): 2000x2000px original
    - Metadatos: Estándar ERC-721 JSON con atributos/traits
- Base de datos: Información auxiliar, caché y tracking cross-chain

#### Despliegue
- **Frontend/Backend/Relayer**: AWS EC2 con contenedores Docker
- **Containerización**: Docker + Docker Compose para entornos consistentes
- **CI/CD**: Pipeline automatizado para build y deploy de contenedores
- **Smart Contract de Pagos**: Desplegado y verificado en Base mainnet
- **Smart Contract NFT**: Desplegado y verificado en Story Protocol mainnet
- **Relayer Service**: Servicio persistente con reintentos automáticos para garantizar mints
- **Dominio**: Configuración de dominio personalizado con SSL/TLS
- **Escalabilidad**: Posibilidad de escalar horizontalmente con múltiples instancias EC2
- **Monitoring**: CloudWatch para tracking de eventos cross-chain y alertas

## 🚀 SEMANA 1 - DESARROLLO MVP

### DÍA 1 (LUNES) - FUNDAMENTOS BASE

#### Blockchain Development (Smart Contracts)
**Smart Contract de Pagos (Base)**
- [ ] Crear contrato de pagos con soporte multi-token (VTN, ETH, USDT)
- [ ] Implementar función de pago directo con validación de tokens ERC-20
- [ ] Configurar treasury wallet multisig como destinatario de fondos
- [ ] Añadir función withdraw para tokens ERC-20 y ETH nativo
- [ ] Implementar eventos: `PaymentReceived`, `DirectPurchase`
- [ ] Crear testing unitario básico para pagos multi-token

**Smart Contract NFT (Story Protocol)**
- [ ] Crear contrato ERC-721 en Story Protocol
- [ ] Implementar función mint con control de acceso (solo relayer autorizado)
- [ ] Añadir función setBaseURI para metadatos IPFS
- [ ] Implementar ownership controls (onlyOwner)
- [ ] Configurar royalties para ventas secundarias
- [ ] Crear testing unitario básico para mint

**Testing y Validación Inicial**
- [ ] Deploy contrato de Pagos en Base testnet
- [ ] Deploy contrato NFT en Story testnet
- [ ] Verificar ambos contratos en sus block explorers respectivos
- [ ] Test manual de pagos multi-token en Base
- [ ] Test manual de mint autorizado en Story
- [ ] Configurar wallets de testing con fondos en ambas redes

#### Frontend Development
**Setup Proyecto Frontend**
- [ ] Configurar Next.js con TypeScript
- [ ] Setup Tailwind CSS y configuración de theme
- [ ] Instalar y configurar wagmi + viem para Web3 multi-chain
- [ ] Configurar soporte para Base y Story Protocol
- [ ] Crear estructura de componentes base (Header, Footer, Layout)

**Conexión Blockchain Multi-Chain**
- [ ] Implementar conexión wallet multi-chain (MetaMask, WalletConnect)
- [ ] Crear hooks para interactuar con contratos en Base y Story
- [ ] Setup providers y configuración de ambas redes (Base + Story)
- [ ] Implementar switch de red automático según contexto
- [ ] Test básico de lectura de ambos contratos

#### Backend/Relayer Development
**Setup Backend Relayer**
- [ ] Configurar proyecto Node.js con TypeScript
- [ ] Setup ethers.js/viem para interacción multi-chain
- [ ] Configurar conexiones RPC para Base y Story
- [ ] Implementar sistema de event listening en Base
- [ ] Crear cola de transacciones pendientes con base de datos

#### Infraestructura (IPFS/Storage)
**Setup IPFS**
- [ ] Configurar cuenta Pinata y API keys
- [ ] Crear funciones de upload a IPFS
- [ ] Implementar generación de metadata JSON según estándar ERC-721
- [ ] Configurar validación de imágenes originales (2000x2000px, formato PNG/JPG, máx 10MB)
- [ ] Implementar generación automática de versiones optimizadas (400x400px, 800x800px)
- [ ] Test de subida de imagen básica y verificación de calidad

**📋 Entregables Día 1:**
- Smart contract de Pagos funcional en Base testnet
- Smart contract NFT funcional en Story testnet
- Backend/Relayer configurado y listening eventos
- Frontend con conexión wallet multi-chain working
- IPFS configurado y probado

---

### DÍA 2 (MARTES) - FUNCIONALIDAD CORE DE MINT

#### Blockchain Development
**Completar Smart Contract de Pagos (Base)**
- [ ] Añadir función pausable/unpausable al contrato de pagos
- [ ] Implementar withdraw funds multi-token para owner
- [ ] Añadir controls de max supply y precios por token
- [ ] Implementar función setPrice para admin (VTN, ETH, USDT)
- [ ] Desarrollar sistema de múltiples subastas simultáneas con tiempo límite
- [ ] Crear funciones para registrar y listar bidders en cada subasta
- [ ] Implementar lógica de determinación de ganador
- [ ] Añadir eventos: `AuctionCreated`, `BidPlaced`, `AuctionWon`
- [ ] Testing completo de todas las funciones en Base

**Completar Smart Contract NFT (Story)**
- [ ] Crear función batch mint para relayer (mintear múltiples NFTs)
- [ ] Implementar función de transferencia automática al comprador
- [ ] Añadir función para actualizar relayer autorizado
- [ ] Implementar función emergency pause
- [ ] Añadir eventos: `NFTMinted`, `BatchMinted`
- [ ] Testing completo de mint y transfers en Story

**Backend/Relayer - Lógica Cross-Chain**
- [ ] Implementar listener de evento `PaymentReceived` en Base
- [ ] Implementar listener de evento `AuctionWon` en Base
- [ ] Crear lógica de mint automático en Story al detectar pago
- [ ] Implementar sistema de reintentos en caso de fallo
- [ ] Crear sistema de logging para tracking cross-chain
- [ ] Implementar notificaciones de éxito/error
- [ ] Testing end-to-end del flujo cross-chain

#### Frontend Development
**Página de Pagos/Mint y Subastas UI**
- [ ] Crear componente PaymentPage con selección de token (VTN/ETH/USDT)
- [ ] Implementar preview de NFT antes del pago con visualización a tamaño completo (2000x2000px)
- [ ] Añadir validaciones de frontend (balance de tokens, conexión, red correcta)
- [ ] Crear componente de selección de cantidad y token de pago
- [ ] Diseñar interfaz de subastas con contador y selector de token
- [ ] Implementar formulario para realizar pujas con diferentes tokens
- [ ] Crear listado de bidders en tiempo real con token utilizado

**Integración Cross-Chain Completa**
- [ ] Conectar UI con contrato de Pagos en Base
- [ ] Implementar estados de transacción cross-chain (pago pending → pago success → mint pending → mint success)
- [ ] Añadir feedback visual para cada estado del proceso cross-chain
- [ ] Implementar manejo de errores de Web3 en ambas redes
- [ ] Integrar sistema de subastas con el frontend
- [ ] Desarrollar lógica para actualizar pujas en tiempo real
- [ ] Implementar notificaciones para ganadores de subastas y estado de mint
- [ ] Crear componente de tracking cross-chain para ver el progreso
- [ ] Testing responsive en dispositivos móviles

**📋 Entregables Día 2:**
- Sistema de pagos multi-token funcional en Base
- Sistema de subastas con listado de bidders implementado
- Backend/Relayer ejecutando mints automáticos en Story
- Interface de usuario pulida para pagos y subastas cross-chain
- Validaciones y manejo de errores completo
- Proceso automatizado cross-chain para compra/subasta → mint en Story

---

### DÍA 3 (MIÉRCOLES) - DASHBOARD ADMINISTRATIVO

#### Frontend Development - Dashboard Admin
**Interface Admin Base**
- [ ] Crear página admin con autenticación por wallet
- [ ] Implementar protección de rutas admin
- [ ] Crear formulario de subida de NFTs
- [ ] Implementar preview de imágenes antes de subir con verificación de dimensiones (2000x2000px)

**Funcionalidad Upload NFTs**
- [ ] Integrar formulario con IPFS upload
- [ ] Crear generación automática de metadata JSON con estándar ERC-721 completo
- [ ] Implementar validación de formatos de imagen (2000x2000px, PNG/JPG, máx 10MB)
- [ ] Configurar generación automática de versiones optimizadas para galería y cards
- [ ] Añadir progress bars para uploads

#### Blockchain Development - Soporte Admin
**Optimización y Auditoría**
- [ ] Optimizar gas consumption de ambos contratos (Base y Story)
- [ ] Añadir natspec documentation completa a ambos contratos
- [ ] Crear scripts de deployment automatizado para ambas redes
- [ ] Preparar contratos para review de seguridad básica

**Backend/Relayer - Dashboard de Monitoreo**
- [ ] Crear endpoint API para consultar estado de transacciones cross-chain
- [ ] Implementar dashboard de admin para ver cola de mints pendientes
- [ ] Añadir métricas de relayer (éxito/fallo, tiempo promedio)
- [ ] Implementar sistema de alertas para fallos en el relayer

**Testing Integración Dashboard**
- [ ] Test completo del flow admin de subida a IPFS
- [ ] Verificar metadata correcta en IPFS
- [ ] Test de mint de NFTs recién añadidos vía relayer
- [ ] Validar que URIs se generan correctamente en Story
- [ ] Test de tracking cross-chain end-to-end

**📋 Entregables Día 3:**
- Dashboard admin completamente funcional
- Sistema de upload de NFTs working con IPFS
- Metadatos generados correctamente en IPFS
- Backend/Relayer con dashboard de monitoreo
- Sistema de tracking cross-chain operativo

---

### DÍA 4 (JUEVES) - PÁGINA EXPLORE Y GALERÍA

#### Frontend Development - Página Explore
**Base de Galería**
- [ ] Crear layout de galería responsive
- [ ] Implementar componente NFTCard individual con imágenes de resolución media (800x800px)
- [ ] Conectar con datos de Story Protocol (tokenURI de NFTs)
- [ ] Crear sistema de loading para imágenes con diferentes resoluciones (thumbnails 400x400px para galería)
- [ ] Implementar sección de estadísticas de ventas (datos de Base) y transparencia

**Funcionalidades Avanzadas Explore**
- [ ] Implementar filtros por atributos/traits
- [ ] Añadir búsqueda por token ID u owner
- [ ] Crear sistema de paginación eficiente
- [ ] Implementar lazy loading para performance con carga progresiva de resoluciones (thumbnail -> media -> full)
- [ ] Añadir estados de loading y error handling
- [ ] Mostrar información cross-chain (precio pagado en Base, NFT en Story)

#### Blockchain Development - APIs y Utilities Cross-Chain
**Backend Support**
- [ ] Crear utility functions para parsear metadata de Story
- [ ] Implementar función getAllTokens optimizada para Story
- [ ] Crear endpoints para servir metadata y diferentes resoluciones de imágenes
- [ ] Optimizar queries cross-chain (NFTs de Story + pagos de Base)
- [ ] Implementar caché de datos cross-chain para performance
- [ ] Crear endpoint para vincular NFT de Story con pago de Base

**📋 Entregables Día 4:**
- Página Explore completamente funcional con datos de Story
- Sistema de filtros y búsqueda operativo
- Performance optimizada para carga de NFTs
- Visualización cross-chain (NFTs + info de pagos)
- Dashboard público de transparencia con datos de Base

---

### DÍA 5 (VIERNES) - TESTING, DEPLOY Y FINALIZACIÓN

#### Testing Completo
**Frontend Testing:**
- [ ] Test end-to-end de todos los user flows
- [ ] Test de responsive design en diferentes dispositivos
- [ ] Test de performance y optimización de carga
- [ ] Validación de accesibilidad básica

**Backend/Relayer Testing:**
- [ ] Test completo de todas las funciones de ambos contratos (Base + Story)
- [ ] Test de integración con IPFS
- [ ] Validación de metadata generada
- [ ] Test de gas costs y optimización en ambas redes
- [ ] Test exhaustivo del flujo cross-chain completo
- [ ] Test de reintentos automáticos del relayer
- [ ] Test de manejo de fallos en el relayer

#### Deploy a Producción
**Blockchain Deploy:**
- [ ] Deploy final del contrato de Pagos en Base mainnet
- [ ] Deploy final del contrato NFT en Story Protocol mainnet
- [ ] Verificar ambos contratos en sus block explorers respectivos
- [ ] Configurar ownership correctamente en ambos contratos
- [ ] Configurar treasury wallet multisig en Base
- [ ] Configurar relayer wallet autorizado en Story
- [ ] Crear backup seguro de private keys (Base, Story, Relayer)

**Frontend/Backend/Relayer Deploy:**
- [ ] Build optimizado para producción del frontend
- [ ] Crear imágenes Docker para frontend, backend y relayer
- [ ] Setup de Docker Compose para entorno de producción (3 servicios)
- [ ] Deploy en AWS EC2 con configuración de seguridad
- [ ] Configurar dominio personalizado con Route 53
- [ ] Setup SSL/TLS con certificados gestionados
- [ ] Configurar RPC endpoints para Base y Story en producción
- [ ] Implementar dashboard público de transparencia con datos de Base
- [ ] Configurar CloudWatch para monitoreo del relayer

#### Testing Final y Documentación
- [ ] Test completo cross-chain en mainnet con fondos reales (VTN, ETH, USDT)
- [ ] Verificación de todas las funcionalidades en ambas redes
- [ ] Test de flujo completo: pago en Base → mint en Story
- [ ] Test de subastas completas con diferentes tokens
- [ ] Crear documentación técnica para handover (incluye arquitectura cross-chain)
- [ ] Documentar proceso de deploy en ambas redes
- [ ] Preparar demo para presentación final
- [ ] Setup monitoring y alertas para relayer
- [ ] Configurar auto-scaling para EC2 si es necesario
- [ ] Implementar backup automatizado de la base de datos del relayer

**📋 Entregables Día 5:**
- MVP completamente deployed en producción (Base + Story)
- Backend/Relayer operativo y monitoreado
- Documentación técnica completa cross-chain
- Sistema listo para demo con Kukuxumusu
- Pagos multi-token funcionando en Base
- NFTs minteándose automáticamente en Story

---

## ✅ CHECKLIST FINAL DE ENTREGABLES

### Smart Contract de Pagos (Base) ✅
- [ ] Contrato de pagos deployed y verificado en Base mainnet
- [ ] Soporte multi-token: VTN, ETH (nativo), USDT (ERC-20)
- [ ] Funciones pause, withdraw multi-token, setPrice por token implementadas
- [ ] Sistema de múltiples subastas simultáneas con tiempo límite
- [ ] Registro de bidders con información del token utilizado
- [ ] Lógica de determinación de ganador implementada
- [ ] Proceso de pago con validación de tokens
- [ ] Sistema de ownership y access controls
- [ ] Eventos on-chain: `PaymentReceived`, `DirectPurchase`, `AuctionCreated`, `BidPlaced`, `AuctionWon`
- [ ] Testing unitario exhaustivo (>90% coverage)
- [ ] Documentación técnica del contrato
- [ ] Treasury wallet multisig configurada en Base
- [ ] Almacenamiento del historial de subastas y pujas como eventos on-chain

### Smart Contract NFT (Story Protocol) ✅
- [ ] Contrato ERC-721 deployed y verificado en Story Protocol mainnet
- [ ] Función mint con control de acceso (solo relayer autorizado)
- [ ] Función batch mint para relayer
- [ ] Función de transferencia automática al comprador
- [ ] Sistema de ownership y access controls
- [ ] Configuración de royalties para mercado secundario
- [ ] Eventos on-chain: `NFTMinted`, `BatchMinted`
- [ ] Testing unitario exhaustivo (>90% coverage)
- [ ] Documentación técnica del contrato
- [ ] BaseURI configurado para metadatos IPFS

### Backend/Relayer Cross-Chain ✅
- [ ] Servicio Node.js deployed y operativo en AWS EC2
- [ ] Event listeners para Base (PaymentReceived, AuctionWon)
- [ ] Lógica de mint automático en Story al detectar pago en Base
- [ ] Sistema de cola de transacciones pendientes con base de datos
- [ ] Sistema de reintentos automáticos para mints fallidos
- [ ] Logging completo de transacciones cross-chain
- [ ] Dashboard de monitoreo para admin
- [ ] API endpoints para consultar estado de transacciones
- [ ] Métricas de performance (éxito/fallo, tiempo promedio)
- [ ] Sistema de alertas para fallos
- [ ] Backup automatizado de base de datos
- [ ] Documentación del relayer y procedimientos de mantenimiento

### Frontend Application ✅
- [ ] Conexión multi-wallet multi-chain (MetaMask, WalletConnect)
- [ ] Soporte para Base y Story Protocol con switch automático
- [ ] Selector de token de pago (VTN, ETH, USDT)
- [ ] Página de pagos/subastas con múltiples subastas activas
- [ ] Listado de bidders en tiempo real con token utilizado
- [ ] Interface para realizar pujas con diferentes tokens
- [ ] Estados de transacción cross-chain (pago → mint)
- [ ] Componente de tracking cross-chain
- [ ] Notificaciones para ganadores de subastas y estado de mint
- [ ] Página explore con datos de Story Protocol
- [ ] Visualización cross-chain (NFT en Story + pago en Base)
- [ ] Dashboard admin protegido y funcional
- [ ] Diseño responsive para todos los dispositivos
- [ ] Estados de loading, error y success para ambas redes
- [ ] Dashboard público de transparencia con datos de Base
- [ ] Visualización del balance de la treasury wallet en Base
- [ ] Historial de subastas pasadas con información de tokens

### Backend & Infrastructure ✅
- [ ] Integración IPFS con Pinata para storage
- [ ] Sistema de upload de imágenes y generación de metadata
- [ ] APIs para obtener datos cross-chain (Base + Story)
- [ ] Sistema de autenticación admin por wallet
- [ ] Endpoints para tracking de transacciones cross-chain
- [ ] Caché de datos cross-chain para performance

### Deploy & Operations ✅
- [ ] Frontend, backend y relayer dockerizados y deployed en AWS EC2
- [ ] Configuración de seguridad de AWS implementada
- [ ] Dominio personalizado con Route 53
- [ ] SSL/TLS configurado y funcionando
- [ ] Backup de keys y configuraciones críticas (Base, Story, Relayer)
- [ ] RPC endpoints configurados para Base y Story
- [ ] Monitoring de relayer con CloudWatch
- [ ] Alertas configuradas para fallos en mints cross-chain
- [ ] Documentación de deploy y mantenimiento cross-chain
- [ ] Procedimientos de escalado y recuperación
- [ ] Documentación de troubleshooting del relayer

---

## 🎯 CRITERIOS DE ÉXITO MVP

### Funcionalidad ✅
- [ ] Cualquier usuario puede conectar wallet y participar en subastas con VTN/ETH/USDT
- [ ] Sistema de múltiples subastas simultáneas funciona correctamente con tiempo límite
- [ ] Listado de bidders se actualiza en tiempo real con datos verificables on-chain en Base
- [ ] Proceso cross-chain automatizado: pago en Base → mint automático en Story
- [ ] Relayer procesa pagos y ejecuta mints sin intervención manual
- [ ] Admin puede subir nuevos NFTs vía dashboard
- [ ] Los NFTs aparecen correctamente en la página explore (datos de Story)
- [ ] Metadata se almacena correctamente en IPFS
- [ ] Sistema de precios multi-token funciona correctamente
- [ ] Treasury wallet en Base recibe correctamente los fondos en VTN/ETH/USDT
- [ ] Dashboard de transparencia muestra datos precisos de Base
- [ ] Solo wallets autorizadas pueden retirar fondos de Base
- [ ] Solo relayer autorizado puede mintear en Story
- [ ] Historial de subastas y pujas accesible y verificable on-chain en Base
- [ ] Tracking cross-chain funciona correctamente

### Experiencia de Usuario ✅
- [ ] Proceso de pago simple y claro (< 3 clics)
- [ ] Selección de token de pago intuitiva
- [ ] Feedback claro en cada paso del proceso cross-chain
- [ ] Usuario puede ver progreso: pago confirmado → minting → NFT recibido
- [ ] Diseño mobile-first responsive
- [ ] Tiempo de carga < 3 segundos
- [ ] Manejo elegante de errores en ambas redes
- [ ] Notificaciones claras de estado de transacción cross-chain

### Técnico ✅
- [ ] Cero bugs críticos en producción
- [ ] Ambos contratos optimizados para gas (Base y Story)
- [ ] Frontend optimizado para performance multi-chain
- [ ] Relayer robusto con reintentos automáticos
- [ ] Contenedores Docker optimizados (frontend, backend, relayer)
- [ ] Código bien documentado (incluye arquitectura cross-chain)
- [ ] Testing coverage adecuado (>90% en ambos contratos)
- [ ] Configuración de CI/CD para despliegue automático
- [ ] Monitoring del relayer operativo
- [ ] Sistema de alertas para fallos cross-chain funcionando

**🚀 ¿Listo para comenzar el desarrollo?**