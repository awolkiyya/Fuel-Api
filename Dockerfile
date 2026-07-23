# =====================================
# Dependencies
# =====================================
FROM node:20-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci



# =====================================
# Build
# =====================================
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .


# Generate Prisma Client
RUN npx prisma generate


# Build TypeScript
RUN npm run build



# =====================================
# Production
# =====================================
FROM node:20-slim AS production

WORKDIR /app


ENV NODE_ENV=production


# Install required production tools
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*



COPY package*.json ./


# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules


# Copy compiled API
COPY --from=builder /app/dist ./dist


# Copy Prisma
COPY --from=builder /app/prisma ./prisma


# Startup script
COPY docker-entrypoint.sh ./docker-entrypoint.sh


RUN chmod +x ./docker-entrypoint.sh



EXPOSE 8080



ENTRYPOINT ["./docker-entrypoint.sh"]