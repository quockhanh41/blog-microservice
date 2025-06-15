# Development stage for feed-service
FROM node:20-alpine

WORKDIR /app

# Install curl for health check and other dependencies
RUN apk add --no-cache curl openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm install

# Copy application code
COPY src ./src/

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Start development server with hot reload
CMD ["npm", "run", "dev"]
