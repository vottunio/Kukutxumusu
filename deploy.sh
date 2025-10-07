#!/bin/bash

# ===========================================
# KUKUXUMUSU NFT PROJECT - DEPLOY SCRIPT
# ===========================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar que se pase el entorno
if [ $# -eq 0 ]; then
    error "Uso: ./deploy.sh [staging|prod]"
fi

ENVIRONMENT=$1

# Validar entorno
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
    error "Entorno inválido. Usa: staging o prod"
fi

log "🚀 Iniciando deploy a $ENVIRONMENT..."

# Cargar variables de entorno PRIMERO
if [ -f ".env.$ENVIRONMENT" ]; then
    log "📝 Cargando variables de .env.$ENVIRONMENT..."
    set -a
    source ".env.$ENVIRONMENT"
    set +a
else
    warning "No se encontró .env.$ENVIRONMENT, usando .env por defecto"
    if [ -f ".env" ]; then
        set -a
        source ".env"
        set +a
    else
        error "No se encontró archivo .env"
    fi
fi

# Verificar que existe el archivo de compose
COMPOSE_FILE="docker-compose.$ENVIRONMENT.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    error "No se encontró el archivo $COMPOSE_FILE"
fi

# Hacer backup de la versión anterior (solo si existe)
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    log "📦 Haciendo backup de la versión anterior..."
    docker-compose -f "$COMPOSE_FILE" down
    success "Backup completado"
fi

# Pull del código más reciente
log "📥 Actualizando código desde Git..."
git pull origin master
success "Código actualizado"

# Build (primero construir para ver logs)
log "🔨 Construyendo imágenes..."

# Construir cada servicio por separado para ver logs
log "📦 Construyendo frontend..."
docker build -t kukuxumusu-frontend:staging \
  --build-arg NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="$NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID" \
  --build-arg NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS="$NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS" \
  --build-arg NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="$NEXT_PUBLIC_NFT_CONTRACT_ADDRESS" \
  --build-arg NEXT_PUBLIC_NETWORK_MODE="$NEXT_PUBLIC_NETWORK_MODE" \
  --build-arg NEXT_PUBLIC_BASE_RPC_URL="$NEXT_PUBLIC_BASE_RPC_URL" \
  --build-arg NEXT_PUBLIC_STORY_RPC_URL="$NEXT_PUBLIC_STORY_RPC_URL" \
  --build-arg TRUSTED_SIGNER_PRIVATE_KEY="$TRUSTED_SIGNER_PRIVATE_KEY" \
  -f Dockerfile .

log "📦 Construyendo worker..."
docker build -t kukuxumusu-worker:staging -f worker/Dockerfile .

success "Imágenes construidas"

# Deploy (luego levantar servicios)
log "🚀 Desplegando servicios..."
log "📦 Creando contenedores..."
docker-compose --progress plain -f "$COMPOSE_FILE" up -d --remove-orphans

# Verificar que los servicios estén corriendo
log "🔍 Verificando servicios..."
sleep 10

# Definir comando base de docker-compose
COMPOSE_CMD="docker-compose -f $COMPOSE_FILE"

# Verificar estado de los servicios
if $COMPOSE_CMD ps | grep -q "Up"; then
    success "Deploy completado exitosamente!"

    # Mostrar estado de los servicios
    log "📊 Estado de los servicios:"
    $COMPOSE_CMD ps

    # Mostrar URLs según el entorno
    if [ "$ENVIRONMENT" = "staging" ]; then
        log "🌐 Staging disponible en: http://localhost:8080"
        log "🗄️  Adminer disponible en: http://localhost:8081"
    else
        log "🌐 Producción disponible en: https://kukuxumusu.com"
    fi

else
    error "Algunos servicios no se iniciaron correctamente"
fi

# Mostrar logs de errores si los hay
log "📋 Últimos logs (últimas 20 líneas):"
$COMPOSE_CMD logs --tail=20

success "🎉 Deploy a $ENVIRONMENT completado!"
