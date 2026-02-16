# Use Node.js 18 (Debian-based for better Prisma compatibility)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Start application - run migrations first, then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
