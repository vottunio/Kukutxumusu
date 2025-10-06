# Dockerfile for Worker (Event Listener + Mint Executor)
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json del worker y prisma schema
COPY worker/package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar Prisma Client (necesita el schema de prisma/)
RUN npx prisma generate

# Copiar código fuente del worker
COPY worker/src ./src
COPY worker/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Variables de entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["npm", "start"]
