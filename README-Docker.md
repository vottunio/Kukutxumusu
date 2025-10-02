# Docker Setup para Kukuxumusu NFT Project

## 🐳 Servicios incluidos

Este Docker Compose incluye solo los servicios de infraestructura necesarios para el desarrollo local:

- **PostgreSQL**: Base de datos para el relayer cross-chain
- **Redis**: Cache y sesiones
- **Adminer**: Interfaz web para administrar PostgreSQL

## 🚀 Uso

### 1. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables necesarias
nano .env
```

### 2. Iniciar los servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### 3. Conectar desde tu aplicación

**PostgreSQL:**
- Host: `localhost`
- Puerto: `5432`
- Base de datos: `kukuxumusu`
- Usuario: `kukuxumusu`
- Contraseña: `kukuxumusu_dev`

**Redis:**
- Host: `localhost`
- Puerto: `6379`

**Adminer (opcional):**
- URL: `http://localhost:8080`
- Servidor: `postgres`
- Usuario: `kukuxumusu`
- Contraseña: `kukuxumusu_dev`
- Base de datos: `kukuxumusu`

## 🔧 Comandos útiles

```bash
# Ver estado de los servicios
docker-compose ps

# Reiniciar un servicio específico
docker-compose restart postgres

# Ver logs de un servicio
docker-compose logs postgres

# Ejecutar comandos en el contenedor
docker-compose exec postgres psql -U kukuxumusu -d kukuxumusu

# Limpiar volúmenes (CUIDADO: borra todos los datos)
docker-compose down -v
```

## 📝 Notas

- Los datos de PostgreSQL se persisten en el volumen `postgres_data`
- Los datos de Redis se persisten en el volumen `redis_data`
- El frontend Next.js y backend Go se ejecutan localmente (no en Docker)
- Para producción, se puede agregar Nginx y otros servicios según sea necesario
