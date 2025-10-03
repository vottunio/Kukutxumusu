# 🚀 Kukuxumusu NFT Project - Deploy Guide

## 📁 Estructura de archivos

```
├── docker-compose.yml           # ← Desarrollo local (solo infraestructura)
├── docker-compose.staging.yml   # ← Entorno de pruebas
├── docker-compose.prod.yml      # ← Entorno de producción
├── Dockerfile                   # ← Para Next.js
├── deploy.sh                    # ← Script de deploy automatizado
├── nginx/
│   ├── nginx.staging.conf       # ← Configuración Nginx staging
│   └── nginx.prod.conf          # ← Configuración Nginx producción
└── scripts/
    └── init-databases.sql       # ← Inicialización de BD
```

## 🔧 Configuración por entorno

### **1. Desarrollo Local**
```bash
# Solo infraestructura
docker-compose up -d

# Next.js corre nativo
npm run dev
```

### **2. Staging (Pruebas)**
```bash
# Copiar variables de entorno
cp .env.staging.example .env.staging
# Editar .env.staging con tus valores

# Deploy
./deploy.sh staging
```

### **3. Producción (Live)**
```bash
# Copiar variables de entorno
cp .env.prod.example .env.prod
# Editar .env.prod con tus valores

# Deploy
./deploy.sh prod
```

## 🚀 Comandos de deploy

### **Deploy automático:**
```bash
# Staging
./deploy.sh staging

# Producción
./deploy.sh prod
```

### **Deploy manual:**
```bash
# Staging
git pull origin main
docker-compose -f docker-compose.staging.yml up -d --build

# Producción
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔐 Variables de entorno

### **Staging (.env.staging):**
- Usa **testnets** (Base Sepolia, Story Testnet)
- Contraseñas simples para desarrollo
- URLs de staging

### **Producción (.env.prod):**
- Usa **mainnets** (Base Mainnet, Story Mainnet)
- Contraseñas seguras
- URLs de producción
- SSL configurado

## 🌐 URLs de acceso

### **Staging:**
- Frontend: `http://localhost:8080`
- Adminer: `http://localhost:8081`

### **Producción:**
- Frontend: `https://kukuxumusu.com`
- API: `https://kukuxumusu.com/api/relayer/`

## 📊 Monitoreo

### **Ver logs:**
```bash
# Staging
docker-compose -f docker-compose.staging.yml logs -f

# Producción
docker-compose -f docker-compose.prod.yml logs -f
```

### **Ver estado:**
```bash
# Staging
docker-compose -f docker-compose.staging.yml ps

# Producción
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Flujo de trabajo

1. **Desarrollo local** - Trabajas con `docker-compose.yml`
2. **Push a Git** - `git push origin main`
3. **Deploy a staging** - `./deploy.sh staging`
4. **Pruebas** - Verificar en staging
5. **Deploy a producción** - `./deploy.sh prod`

## ⚠️ Notas importantes

- **Staging** usa testnets (Base Sepolia, Story Testnet)
- **Producción** usa mainnets (Base Mainnet, Story Mainnet)
- **SSL** solo en producción
- **Contraseñas** deben ser seguras en producción
- **Backup** automático antes de cada deploy
