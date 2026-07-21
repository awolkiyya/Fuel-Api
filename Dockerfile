FROM node:20-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci


FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build


FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

COPY prisma ./prisma


EXPOSE 8080


CMD ["npm","start"]