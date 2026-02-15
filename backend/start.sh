#!/bin/sh

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run seed if needed (optional)
# echo "Seeding database..."
# node prisma/seed.js

# Start the application
echo "Starting server..."
exec node src/index.js
