FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["node", "server/prod-server.mjs"]
