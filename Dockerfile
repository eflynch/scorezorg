# Use the official Node.js runtime as the base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/scorezorg/package*.json ./apps/scorezorg/
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NX_DAEMON=false
ENV NX_CLOUD_DISTRIBUTED_EXECUTION=false
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NX_DAEMON=false
ENV NX_CLOUD_DISTRIBUTED_EXECUTION=false

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/apps/scorezorg/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/scorezorg/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/scorezorg/.next/static ./apps/scorezorg/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/scorezorg/server.js"]
