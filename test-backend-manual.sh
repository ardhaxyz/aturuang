#!/bin/bash

# Manual Backend Testing - PostgreSQL + Backend

set -e

echo "🚀 Starting Aturuang Backend with PostgreSQL"
echo "=============================================="
echo ""

# 1. Start PostgreSQL
echo "📥 Starting PostgreSQL..."
docker run -d \
  --name aturuang-postgres \
  -e POSTGRES_USER=aturuang \
  -e POSTGRES_PASSWORD=aturuang_password \
  -e POSTGRES_DB=aturuang \
  -p 5432:5432 \
  postgres:15-alpine

echo "✅ PostgreSQL started"
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# 2. Generate Prisma Client
echo "📝 Generating Prisma Client..."
cd /home/sutopo/aturuang/backend
npx prisma generate

# 3. Run migration
echo "🔄 Running migration..."
npx prisma migrate dev --name init_postgresql

# 4. Seed database
echo "🌱 Seeding database..."
npx prisma db seed

# 5. Start backend
echo "🔧 Starting backend..."
node src/index.js &

BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"
echo "⏳ Waiting for backend to be ready..."
sleep 5

# 6. Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
curl -s http://localhost:3001/health | jq .
echo ""

# 7. Test setup status
echo "📊 Testing setup status..."
curl -s http://localhost:3001/api/setup/status | jq .
echo ""

# 8. Test login
echo "🔐 Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "$LOGIN_RESPONSE" | jq .
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Login successful! Token obtained"

    # 9. Test get users
    echo ""
    echo "👥 Testing get users..."
    curl -s http://localhost:3001/api/users \
      -H "Authorization: Bearer $TOKEN" | jq .
    echo ""

    # 10. Test get organizations
    echo "🏢 Testing get organizations..."
    curl -s http://localhost:3001/api/organizations \
      -H "Authorization: Bearer $TOKEN" | jq .
    echo ""

    # 11. Test get rooms
    echo "🚪 Testing get rooms..."
    curl -s http://localhost:3001/api/rooms \
      -H "Authorization: Bearer $TOKEN" | jq .
    echo ""

else
    echo "❌ Login failed!"
fi

echo ""
echo "=============================================="
echo "✅ Backend testing completed!"
echo ""
echo "🛑 Stopping backend..."
kill $BACKEND_PID
docker stop aturuang-postgres
docker rm aturuang-postgres

echo ""
echo "✅ All services stopped!"
echo ""
