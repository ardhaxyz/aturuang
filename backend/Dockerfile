# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Create data directory for SQLite (optional)
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "src/index.js"]
