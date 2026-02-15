#!/bin/bash

# Local Testing Script - PostgreSQL + Docker

set -e

echo "🚀 Starting Aturuang Local Testing with PostgreSQL"
echo "=================================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker tidak terinstall"
    exit 1
fi

echo "✅ Docker terinstall: $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose tidak terinstall"
    exit 1
fi

echo "✅ Docker Compose terinstall"
echo ""

# Pull PostgreSQL image
echo "📥 Pulling PostgreSQL image..."
docker pull postgres:15-alpine

# Build backend image
echo "🔨 Building backend image..."
docker-compose -f docker-compose.dev.yml build backend

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Generate Prisma Client
echo "📝 Generating Prisma Client..."
docker-compose -f docker-compose.dev.yml exec backend npx prisma generate

# Run migration
echo "🔄 Running migration..."
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name init_postgresql

# Seed database
echo "🌱 Seeding database..."
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed

# Start backend
echo "🔧 Starting backend..."
docker-compose -f docker-compose.dev.yml up -d backend

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check health
echo "🏥 Checking health endpoint..."
curl -s http://localhost:3001/health || echo "Backend belum ready"

echo ""
echo "=================================================="
echo "✅ Setup completed successfully!"
echo ""
echo "📊 Services running:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Backend: http://localhost:3001"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "📝 Access Prisma Studio:"
echo "   docker-compose -f docker-compose.dev.yml exec backend npx prisma studio"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""
echo "🧪 Test login:"
echo "   curl -X POST http://localhost:3001/api/auth/login \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
echo ""
