#!/bin/bash

# Meeting Room Dashboard - Quick Deploy Script
# Jalankan di VPS setelah setup project

set -e  # Exit on error

echo "🚀 Starting Meeting Room Dashboard Deployment..."

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose tidak terinstall. Install dulu: apt install docker-compose"
    exit 1
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📋 Membuat file .env dari template..."
    cp backend/.env.example backend/.env
    echo "⚠️  SILAKAN EDIT backend/.env sebelum melanjutkan deployment!"
    echo "   Ganti JWT_SECRET, GUEST_PASSWORD, dan ADMIN_PASSWORD!"
    exit 1
fi

# Build and start containers
echo "🔨 Membuild containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Menunggu services siap..."
sleep 10

# Run database migrations
echo "🗄️  Menjalankan database migrations..."
cd backend
npx prisma migrate deploy
cd ..

# Seed database (optional)
echo "🌱 Menyediakan data awal..."
cd backend
if [ -f "dist/index.js" ]; then
    echo "✅ Database sudah siap!"
else
    echo "⚠️  Backend belum dibuild. Jalankan: cd backend && npm run build"
    cd ..
fi

# Check status
echo "📊 Mengecek status services..."
docker-compose ps

echo ""
echo "✅ Deployment Selesai!"
echo ""
echo "📍 Access Points:"
echo "   - Frontend: http://$(hostname -I | awk '{print $1}')"
echo "   - Backend API: http://$(hostname -I | awk '{print $1}'):3001"
echo "   - Database: localhost:5432"
echo ""
echo "🔐 Default Credentials (GANTI SEBELUM DEPLOYMENT!):"
echo "   - Guest: guest123"
echo "   - Admin: admin123"
echo ""
echo "📋 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "🎉 Meeting Room Dashboard sudah live!"
