# Development stage for post-service
FROM node:20-alpine AS development

WORKDIR /app

# Install curl for health check and openssl for Prisma
RUN apk add --no-cache curl openssl dos2unix

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Install all dependencies including devDependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY src ./src/
COPY scripts ./scripts/
COPY entrypoint.sh ./

# Convert entrypoint script to Unix format and make it executable
RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Build TypeScript
RUN npm run build

# Set development environment
ENV NODE_ENV=development

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Use entrypoint script
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install curl for health check and openssl for Prisma
RUN apk add --no-cache curl openssl dos2unix

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Install only production dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY src ./src/
COPY scripts ./scripts/
COPY entrypoint.sh ./

# Convert entrypoint script to Unix format and make it executable
RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Build TypeScript
RUN npm run build

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Use entrypoint script
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
CMD ["npm", "run", "start"]
