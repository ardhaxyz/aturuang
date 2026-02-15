#!/bin/sh

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration may have failed, continuing..."

# Run seed if needed (optional)
# echo "Seeding database..."
# node prisma/seed.js

# Start the application
echo "Starting server..."
exec node src/index.js
