#!/bin/bash

# Test API Script

echo "🧪 Testing Aturuang Backend API"
echo "================================"
echo ""

BASE_URL="http://localhost:3001"

echo "1️⃣ Testing Health Endpoint..."
curl -s $BASE_URL/health | jq .
echo ""

echo "2️⃣ Testing Setup Status..."
curl -s $BASE_URL/api/setup/status | jq .
echo ""

echo "3️⃣ Testing Login..."
curl -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq .
echo ""

echo "4️⃣ Testing Get Users..."
TOKEN=$(curl -s $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

curl -s $BASE_URL/api/users \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "5️⃣ Testing Get Organizations..."
curl -s $BASE_URL/api/organizations \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "6️⃣ Testing Get Rooms..."
curl -s $BASE_URL/api/rooms \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "================================"
echo "✅ Testing completed!"
echo ""
