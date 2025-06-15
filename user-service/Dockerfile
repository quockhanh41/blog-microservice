# Development stage for user-service
FROM node:20-alpine

WORKDIR /app

# Install development dependencies
RUN apk add --no-cache curl openssl

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./
COPY jest.config.js ./

# Install all dependencies
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

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
