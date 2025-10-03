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

# Verificar que existe el archivo de compose
COMPOSE_FILE="docker-compose.$ENVIRONMENT.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    error "No se encontró el archivo $COMPOSE_FILE"
fi

# Verificar que existe el archivo .env
if [ ! -f ".env.$ENVIRONMENT" ]; then
    warning "No se encontró .env.$ENVIRONMENT, usando .env por defecto"
    if [ ! -f ".env" ]; then
        error "No se encontró archivo .env"
    fi
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

# Build y deploy
log "🔨 Construyendo y desplegando servicios..."
if [ -f ".env.$ENVIRONMENT" ]; then
    docker-compose -f "$COMPOSE_FILE" --env-file ".env.$ENVIRONMENT" up -d --build
else
    docker-compose -f "$COMPOSE_FILE" up -d --build
fi

# Verificar que los servicios estén corriendo
log "🔍 Verificando servicios..."
sleep 10

# Verificar estado de los servicios
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    success "Deploy completado exitosamente!"
    
    # Mostrar estado de los servicios
    log "📊 Estado de los servicios:"
    docker-compose -f "$COMPOSE_FILE" ps
    
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
docker-compose -f "$COMPOSE_FILE" logs --tail=20

success "🎉 Deploy a $ENVIRONMENT completado!"
