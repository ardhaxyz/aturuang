# Multi-stage build for Aturuang Backend

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create .env file from example
COPY .env.example .env

# Stage 2: Production
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/ ./node_modules/@prisma/

# Copy source files
COPY --from=builder /app/src ./src

# Copy Prisma schema, seed, and migrations
COPY --from=builder /app/prisma ./prisma

# Copy migrations folder explicitly
COPY --from=builder /app/prisma/migrations ./prisma/migrations

# Copy startup script
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x start.sh

# Create uploads directory
RUN mkdir -p uploads/rooms

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1))"

# Start server with migrations
CMD ["./start.sh"]
