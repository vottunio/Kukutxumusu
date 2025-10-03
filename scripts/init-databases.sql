-- ===========================================
-- KUKUXUMUSU NFT PROJECT - DATABASE INIT
-- ===========================================

-- Crear base de datos para el Go Relayer
CREATE DATABASE kukuxumusu_relayer;

-- Crear usuario para el relayer (opcional, puede usar el mismo)
-- CREATE USER relayer WITH PASSWORD 'relayer_dev';
-- GRANT ALL PRIVILEGES ON DATABASE kukuxumusu_relayer TO relayer;

-- ===========================================
-- TABLAS PARA NEXT.JS/PRISMA (kukuxumusu)
-- ===========================================

-- Conectar a la base de datos principal
\c kukuxumusu;

-- Tabla para cache de metadata de NFTs
CREATE TABLE IF NOT EXISTS nft_metadata_cache (
  id SERIAL PRIMARY KEY,
  token_id BIGINT UNIQUE NOT NULL,
  collection_address VARCHAR(42) NOT NULL,
  metadata JSONB NOT NULL,
  image_url TEXT,
  cached_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para usuarios (si es necesario)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para seguimiento de transacciones cross-chain
CREATE TABLE IF NOT EXISTS cross_chain_transactions (
  id SERIAL PRIMARY KEY,
  payment_tx_hash VARCHAR(66) UNIQUE NOT NULL,
  auction_id BIGINT NOT NULL,
  winner_address VARCHAR(42) NOT NULL,
  amount BIGINT NOT NULL,
  token_address VARCHAR(42) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, minted, failed
  mint_tx_hash VARCHAR(66),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_nft_metadata_token_id ON nft_metadata_cache(token_id);
CREATE INDEX IF NOT EXISTS idx_cross_chain_payment_hash ON cross_chain_transactions(payment_tx_hash);
CREATE INDEX IF NOT EXISTS idx_cross_chain_status ON cross_chain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);

-- ===========================================
-- TABLAS PARA GO RELAYER (kukuxumusu_relayer)
-- ===========================================

-- Conectar a la base de datos del relayer
\c kukuxumusu_relayer;

-- Cola de NFTs pendientes de mintear
CREATE TABLE IF NOT EXISTS mint_queue (
  id SERIAL PRIMARY KEY,
  payment_tx_hash VARCHAR(66) UNIQUE NOT NULL,
  auction_id BIGINT NOT NULL,
  winner_address VARCHAR(42) NOT NULL,
  nft_contract VARCHAR(42) NOT NULL,
  nft_id BIGINT NOT NULL,
  metadata_uri TEXT NOT NULL,
  priority INTEGER DEFAULT 0, -- 0 = normal, 1 = high, -1 = low
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Cache de precios para evitar llamadas constantes a APIs
CREATE TABLE IF NOT EXISTS price_cache (
  id SERIAL PRIMARY KEY,
  token_address VARCHAR(42) NOT NULL,
  price_usd DECIMAL(18, 8) NOT NULL,
  source VARCHAR(50) NOT NULL, -- coingecko, uniswap, etc.
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  UNIQUE(token_address, source)
);

-- Auditoría de todas las firmas generadas
CREATE TABLE IF NOT EXISTS bid_signatures (
  id SERIAL PRIMARY KEY,
  auction_id BIGINT NOT NULL,
  bidder_address VARCHAR(42) NOT NULL,
  token_address VARCHAR(42) NOT NULL,
  amount BIGINT NOT NULL,
  signature VARCHAR(132) NOT NULL,
  message_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Registro de eventos procesados
CREATE TABLE IF NOT EXISTS event_log (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- PaymentReceived, AuctionWon, etc.
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  log_index INTEGER NOT NULL,
  contract_address VARCHAR(42) NOT NULL,
  event_data JSONB NOT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tx_hash, log_index)
);

-- Configuración del relayer
CREATE TABLE IF NOT EXISTS relayer_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO relayer_config (key, value, description) VALUES
('base_rpc_url', 'https://mainnet.base.org', 'Base network RPC URL'),
('story_rpc_url', 'https://rpc.story.foundation', 'Story Protocol RPC URL'),
('payment_contract', '0x75bf7b1DD6b3a666F18c7784B78871C429E92C71', 'Payment contract address on Base'),
('nft_contract', '0x75bf7b1DD6b3a666F18c7784B78871C429E92C71', 'NFT contract address on Story'),
('poll_interval', '30', 'Event polling interval in seconds'),
('max_retries', '3', 'Maximum retry attempts for failed transactions'),
('price_cache_ttl', '300', 'Price cache time-to-live in seconds')
ON CONFLICT (key) DO NOTHING;

-- Índices para performance del relayer
CREATE INDEX IF NOT EXISTS idx_mint_queue_status ON mint_queue(status);
CREATE INDEX IF NOT EXISTS idx_mint_queue_priority ON mint_queue(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_mint_queue_payment_hash ON mint_queue(payment_tx_hash);
CREATE INDEX IF NOT EXISTS idx_price_cache_token ON price_cache(token_address);
CREATE INDEX IF NOT EXISTS idx_price_cache_expires ON price_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_bid_signatures_auction ON bid_signatures(auction_id);
CREATE INDEX IF NOT EXISTS idx_event_log_tx_hash ON event_log(tx_hash);
CREATE INDEX IF NOT EXISTS idx_event_log_processed ON event_log(processed_at);

-- ===========================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ===========================================

COMMENT ON DATABASE kukuxumusu IS 'Main database for Next.js frontend and API';
COMMENT ON DATABASE kukuxumusu_relayer IS 'Database for Go relayer service - cross-chain operations';

COMMENT ON TABLE mint_queue IS 'Queue of NFTs pending to be minted on Story Protocol';
COMMENT ON TABLE price_cache IS 'Cache for token prices to avoid constant API calls';
COMMENT ON TABLE bid_signatures IS 'Audit trail of all bid signatures generated';
COMMENT ON TABLE event_log IS 'Log of all blockchain events processed by relayer';
COMMENT ON TABLE relayer_config IS 'Configuration settings for the relayer service';
