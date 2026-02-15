#!/bin/bash

# PostgreSQL Setup Script for Aturuang
# Menggunakan local PostgreSQL di VPS (GRATIS)

set -e

echo "🚀 PostgreSQL Setup Script for Aturuang"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Please run as root or use sudo"
    exit 1
fi

# Check PostgreSQL installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    apt update
    apt install -y postgresql postgresql-contrib
    echo "✅ PostgreSQL installed"
else
    echo "✅ PostgreSQL already installed"
fi

# Start PostgreSQL service
echo "🔧 Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql
echo "✅ PostgreSQL service started"

# Create database and user
echo ""
echo "👤 Creating database and user..."
read -p "Enter database name [default: aturuang]: " DB_NAME
DB_NAME=${DB_NAME:-aturuang}

read -sp "Enter database password: " DB_PASSWORD
echo ""
read -p "Enter database user [default: aturuang]: " DB_USER
DB_USER=${DB_USER:-aturuang}

sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

echo "✅ Database and user created"

# Generate connection string
CONNECTION_STRING="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# Update .env file
ENV_FILE="/home/sutopo/aturuang/backend/.env"

if [ -f "$ENV_FILE" ]; then
    echo ""
    echo "📝 Updating $ENV_FILE..."

    # Backup original file
    cp "$ENV_FILE" "$ENV_FILE.backup"

    # Update DATABASE_URL
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=$CONNECTION_STRING|" "$ENV_FILE"

    echo "✅ $ENV_FILE updated"
else
    echo "⚠️  $ENV_FILE not found. Please create it manually."
fi

# Generate migration
echo ""
echo "🔄 Generating Prisma migration..."
cd /home/sutopo/aturuang/backend
npx prisma migrate dev --name init_postgresql

# Seed database
echo ""
echo "🌱 Seeding database..."
npx prisma db seed

echo ""
echo "========================================"
echo "✅ PostgreSQL setup completed!"
echo ""
echo "📊 Database Details:"
echo "   Name: $DB_NAME"
echo "   User: $DB_USER"
echo "   Connection: $CONNECTION_STRING"
echo ""
echo "📁 Configuration:"
echo "   .env file: $ENV_FILE"
echo ""
echo "🚀 Next Steps:"
echo "   1. Test connection: npx prisma studio"
echo "   2. Deploy to Render: Follow DEPLOY_POSTGRESQL.md"
echo ""
