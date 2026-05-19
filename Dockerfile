# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
ENV NODE_ENV=production
RUN npm run build:cloudrun

FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN mkdir -p .next/cache \
  && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 8080

CMD ["node", "server.js"]
