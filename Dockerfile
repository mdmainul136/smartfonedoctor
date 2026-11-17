# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

# ── Stage 2: Builder ──
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js and Prisma static generation
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://smartfone:ndui8vLNFPy0MylzixT8@smartfone-doctor-smartfone-doctor-ovfvrh:5432/smartfone"
ENV POSTGRES_URL="postgresql://smartfone:ndui8vLNFPy0MylzixT8@smartfone-doctor-smartfone-doctor-ovfvrh:5432/smartfone"
ENV DATABASE_URI="postgresql://smartfone:ndui8vLNFPy0MylzixT8@smartfone-doctor-smartfone-doctor-ovfvrh:5432/smartfone"
ENV PAYLOAD_SECRET="smartfonedoctor-philadelphia-payload-secret-key-32chars"

# Generate Prisma Client
RUN npx prisma generate

RUN npm run build

# ── Stage 3: Production Runner ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="postgresql://smartfone:ndui8vLNFPy0MylzixT8@smartfone-doctor-smartfone-doctor-ovfvrh:5432/smartfone"
ENV POSTGRES_URL="postgresql://smartfone:ndui8vLNFPy0MylzixT8@smartfone-doctor-smartfone-doctor-ovfvrh:5432/smartfone"
ENV DATABASE_URI="postgresql://smartfone:ndui8vLNFPy0MylzixT8@smartfone-doctor-smartfone-doctor-ovfvrh:5432/smartfone"
ENV PAYLOAD_SECRET="smartfonedoctor-philadelphia-payload-secret-key-32chars"

RUN apk add --no-cache openssl libc6-compat curl bash

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
