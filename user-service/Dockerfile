# Development stage for user-service
FROM node:20-alpine as development

WORKDIR /app

# Install development dependencies
RUN apk add --no-cache curl openssl

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./
COPY jest.config.js ./

# Install all dependencies including devDependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY src ./src/
COPY tests ./tests/
COPY scripts ./scripts/
COPY entrypoint.sh ./

# Build TypeScript to JavaScript
RUN npm run build

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set development environment
ENV NODE_ENV=development

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine as production

WORKDIR /app

# Install only required dependencies
RUN apk add --no-cache curl openssl

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY src ./src/
COPY scripts ./scripts/
COPY entrypoint.sh ./

# Build TypeScript to JavaScript
RUN npm run build

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "run", "start"]
