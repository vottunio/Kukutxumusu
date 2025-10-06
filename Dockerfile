# Dockerfile para Next.js
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Variables de entorno necesarias para el build (NEXT_PUBLIC_* se leen en build time)
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS
ARG NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
ARG NEXT_PUBLIC_NETWORK_MODE
ARG NEXT_PUBLIC_BASE_RPC_URL
ARG NEXT_PUBLIC_STORY_RPC_URL

ENV NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ENV NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=$NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS
ENV NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=$NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
ENV NEXT_PUBLIC_NETWORK_MODE=$NEXT_PUBLIC_NETWORK_MODE
ENV NEXT_PUBLIC_BASE_RPC_URL=$NEXT_PUBLIC_BASE_RPC_URL
ENV NEXT_PUBLIC_STORY_RPC_URL=$NEXT_PUBLIC_STORY_RPC_URL

# Generar build de producción
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio - ejecuta prisma db push y luego npm start
CMD sh -c "npx prisma db push --skip-generate && npm start"
