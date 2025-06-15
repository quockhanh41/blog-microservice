# Development stage for api-gateway
FROM node:20-alpine

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# Copy package files first for better layer caching
COPY package.json ./

# Install all dependencies
RUN npm install

# Copy application code
COPY . .

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Expose ports
EXPOSE 8080 8081 9876

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev"]
