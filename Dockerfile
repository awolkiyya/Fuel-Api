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


# Prisma requires OpenSSL
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*



COPY --from=deps /app/node_modules ./node_modules


COPY . .



# Prisma needs DATABASE_URL during build
ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL



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



# Runtime dependencies
RUN apt-get update \
    && apt-get install -y curl openssl \
    && rm -rf /var/lib/apt/lists/*





COPY package*.json ./



COPY --from=builder /app/node_modules ./node_modules



COPY --from=builder /app/dist ./dist



COPY --from=builder /app/prisma ./prisma




# Startup script
COPY docker-entrypoint.sh ./docker-entrypoint.sh


RUN chmod +x ./docker-entrypoint.sh



EXPOSE 8080



ENTRYPOINT ["./docker-entrypoint.sh"]