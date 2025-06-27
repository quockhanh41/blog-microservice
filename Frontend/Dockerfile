# Development stage for Frontend Next.js application
FROM node:18-alpine AS development

WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat curl
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies
RUN pnpm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set hostname to make the server accessible outside the container
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start development server
CMD ["pnpm", "dev", "--hostname", "0.0.0.0", "--port", "3000"]

# Production stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Set environment variables directly for build
ARG NEXT_PUBLIC_API_URL="https://api-gateway-production-db6a.up.railway.app"
ARG NEXT_PUBLIC_AUTH_ENABLED="true"
ARG NODE_ENV="production"

# Set environment variables from build args
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AUTH_ENABLED=$NEXT_PUBLIC_AUTH_ENABLED
ENV NODE_ENV=$NODE_ENV

# Build the application
RUN pnpm run build

# Production runtime stage
FROM node:18-alpine AS production

WORKDIR /app


# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Use non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname to make the server accessible outside the container
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Set production environment variables (runtime)
ENV NEXT_PUBLIC_API_URL="https://api-gateway-production-db6a.up.railway.app"
ENV NEXT_PUBLIC_AUTH_ENABLED="true"
ENV NODE_ENV="production"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["node", "server.js"]
