# Development stage for feed-service
FROM node:20-alpine AS development

WORKDIR /app

# Install curl for health check and other dependencies
RUN apk add --no-cache curl openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy application code
COPY src ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Set development environment
ENV NODE_ENV=development

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install curl for health check and other dependencies
RUN apk add --no-cache curl openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application code
COPY src ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Start the application
CMD ["npm", "run", "start"]
