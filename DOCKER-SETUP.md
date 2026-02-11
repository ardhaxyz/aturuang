# Docker Deployment Guide

Panduan lengkap untuk deploy Meeting Room Dashboard menggunakan Docker Compose di VPS Anda.

## 📋 Prerequisites

Sebelum memulai, pastikan:
- ✅ VPS dengan akses SSH
- ✅ Docker & Docker Compose terinstall
- ✅ Port 80 dan 3001 terbuka di firewall
- ✅ Port 5432 (optional - hanya untuk external access)

## 🚀 Quick Start

### 1. Clone atau Setup Project

```bash
# Jika dari repository
git clone <repository-url>
cd meeting-room-dashboard

# Atau langsung gunakan setup yang sudah ada
```

### 2. Install Dependencies

```bash
# Install dependencies untuk backend
cd backend
npm ci
npx prisma generate

# Kembali ke root
cd ..
```

### 3. Configuration

Edit `docker-compose.yml` dengan konfigurasi yang sesuai:

```yaml
# Ganti JWT_SECRET dengan random string yang kuat
JWT_SECRET: "generate-random-string-min-32-chars"

# Ganti passwords
GUEST_PASSWORD: "guest123"
ADMIN_PASSWORD: "admin123"

# Update FRONTEND_URL dengan domain production Anda
FRONTEND_URL: "http://your-domain.com"
```

### 4. Build & Start

```bash
# Build dan run dengan Docker Compose
docker-compose up -d --build

# Lihat log
docker-compose logs -f

# Cek status semua services
docker-compose ps
```

### 5. Run Database Migrations

```bash
# Jalankan migrations
cd backend
npx prisma migrate deploy

# Atau untuk development
npx prisma migrate dev --name init

# Seed database (optional)
npm run seed
```

### 6. Verify Installation

```bash
# Cek health check
curl http://localhost/health
curl http://localhost:3001/health

# Cek services
docker-compose ps
```

## 🔐 Security Checklist

### Change Default Credentials

**1. Ganti Default Passwords di docker-compose.yml:**
```yaml
GUEST_PASSWORD: "ganti-password-besaitu"
ADMIN_PASSWORD: "admin-password-anda"
```

**2. Ganti JWT Secret:**
```bash
# Generate random string (minimal 32 characters)
JWT_SECRET=$(openssl rand -base64 32)
```

**3. Update FRONTEND_URL:**
```yaml
FRONTEND_URL: "https://dashboard.yourdomain.com"
```

### Firewall Configuration

**1. Allow HTTP:**
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # Jika HTTPS

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**2. Allow PostgreSQL (jika butuh external access):**
```bash
sudo ufw allow 5432/tcp
# ATAU lebih aman: allow dari IP tertentu saja
sudo ufw allow from YOUR_IP_ADDRESS to any port 5432
```

**3. Restart Firewall:**
```bash
sudo ufw reload
# atau
sudo firewall-cmd --reload
```

### SSL/HTTPS Setup (Recommended)

**Option A: Using Nginx Reverse Proxy (Recommended)**

1. Install Certbot & Nginx:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

2. Setup SSL Certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

3. Nginx config sudah otomatis update dengan SSL. Restart services:
```bash
docker-compose restart frontend
```

**Option B: Using Traefik (Advanced)**

Add Traefik to docker-compose.yml dan configure SSL automatically.

## 📊 Monitoring & Logs

### View Logs

```bash
# Lihat semua logs
docker-compose logs -f

# Log spesifik service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Container Status

```bash
# Cek status
docker-compose ps

# Restart service
docker-compose restart backend
docker-compose restart frontend

# Stop service
docker-compose stop backend

# Start service
docker-compose start backend
```

### Health Checks

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' meeting-room-backend

# View health details
docker inspect meeting-room-backend | grep -A 10 Health
```

## 🗄️ Database Management

### Access PostgreSQL Container

```bash
# Connect ke database container
docker exec -it meeting-room-db psql -U meeting_room_user -d meeting_room_db

# Atau dengan psql client dari host
docker exec -it meeting-room-db psql -U meeting_room_user -d meeting_room_db -h localhost

# Export database
docker exec meeting-room-db pg_dump -U meeting_room_user meeting_room_db > backup.sql

# Import database
cat backup.sql | docker exec -i meeting-room-db psql -U meeting_room_user -d meeting_room_db
```

### Prisma Commands

```bash
# Masuk ke backend container
docker exec -it meeting-room-backend sh

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Reset database (WARNING: Hapus semua data!)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Backup Database

**Automated Backup (Cron Job):**

Create backup script:
```bash
#!/bin/bash
# /root/backup-meeting-room.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backup/meeting-room-${DATE}.sql"

# Create backup
docker exec meeting-room-db pg_dump -U meeting_room_user meeting_room_db > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep only last 7 days
find /backup -name "meeting-room-*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

Add to crontab:
```bash
# Backup setiap malam jam 2:00
0 2 * * * /root/backup-meeting-room.sh >> /var/log/meeting-room-backup.log 2>&1
```

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose up -d --build

# Restart services
docker-compose restart backend frontend
```

### Update Dependencies

```bash
# Update backend dependencies
cd backend
npm update
npx prisma generate
npm run build
cd ..

# Rebuild backend
docker-compose build backend
docker-compose up -d backend

# Update frontend dependencies
cd frontend
npm update
npm run build
cd ..

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Database Migration

```bash
# Jalankan migration baru
cd backend
npx prisma migrate dev --name migration_name
npx prisma migrate deploy

# Buat seed data
npm run seed

# Kembali ke root
cd ..
```

## 🧹 Cleanup

### Remove Old Containers & Volumes

```bash
# Stop semua services
docker-compose down

# Remove containers
docker-compose down

# Remove volumes (WARNING: Hapus semua database!)
docker-compose down -v

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### Clean System

```bash
# Clean build cache
docker builder prune

# Clean system (WARNING: Remove everything!)
docker system prune -a --volumes
```

## 📱 Access Points

Setelah deploy, akses dengan:
- **Frontend:** http://your-vps-ip atau http://your-domain.com
- **Backend API:** http://your-vps-ip:3001/api/*
- **Database:** localhost:5432 (internal) atau IP:5432 (jika external)

Default credentials (ganti sebelum deploy!):
- **Guest:** `guest123`
- **Admin:** `admin123`

## 🔧 Troubleshooting

### Frontend tidak bisa access

**1. Check backend:**
```bash
docker-compose ps backend
docker-compose logs backend
```

**2. Check nginx:**
```bash
docker-compose logs frontend
docker ps | grep meeting-room
```

**3. Check firewall:**
```bash
sudo ufw status
```

### Database connection error

**1. Check postgres status:**
```bash
docker-compose ps postgres
```

**2. Check database URL di backend:**
```bash
docker-compose config | grep DATABASE_URL
```

**3. Restart postgres:**
```bash
docker-compose restart postgres
```

### Migration failed

**1. Check Prisma logs:**
```bash
docker-compose logs backend | grep -i prisma
```

**2. Reset database (WARNING!):**
```bash
docker-compose down -v
docker-compose up -d
cd backend
npx prisma migrate reset --force
cd ..
```

### Port already in use

```bash
# Cek apa yang pakai port 80/3001
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3001

# Stop service yang memakai port
sudo systemctl stop nginx  # Jika nginx install
docker-compose stop

# Ganti port di docker-compose.yml
```

## 📞 Support

Jika ada issues:

1. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Restart services:**
   ```bash
   docker-compose restart
   ```

3. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

4. **Check Docker status:**
   ```bash
   docker ps
   docker stats
   ```

## ✅ Deployment Checklist

- [ ] Ganti default passwords di docker-compose.yml
- [ ] Ganti JWT_SECRET dengan random string
- [ ] Update FRONTEND_URL dengan domain production
- [ ] Setup firewall (allow port 80)
- [ ] Setup SSL/HTTPS (Certbot)
- [ ] Setup database backup (cron job)
- [ ] Test access di browser
- [ ] Test booking flow
- [ ] Test admin panel
- [ ] Update documentation

**Selamat! Meeting Room Dashboard sudah live dengan Docker!** 🚀
