# Development stage for api-gateway
FROM node:20-alpine as development

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# Copy package files first for better layer caching
COPY package.json ./

# Install all dependencies for development
RUN npm install

# Copy application code
COPY . .

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Expose ports
EXPOSE 8080 8081 9876

# Set development environment
ENV NODE_ENV=development

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine as production

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Expose ports
EXPOSE 8080 8081 9876

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start"]