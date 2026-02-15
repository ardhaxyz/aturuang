#!/bin/bash

# Stop Local Services

echo "🛑 Stopping Aturuang Local Services..."
echo "======================================"

docker-compose -f docker-compose.dev.yml down -v

echo ""
echo "✅ Services stopped!"
echo ""
echo "📊 To start again:"
echo "   ./test-local.sh"
echo ""
