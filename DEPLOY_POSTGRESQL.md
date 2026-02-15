# Deployment Guide - PostgreSQL

## Langkah 1: Setup Database

Pilih salah satu opsi di bawah ini:

### Opsi A: Local PostgreSQL di VPS (GRATIS)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database & user
sudo -u postgres psql <<EOF
CREATE DATABASE aturuang;
CREATE USER aturuang WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aturuang TO aturuang;
EOF
```

### Opsi B: Render PostgreSQL (GRATIS)

1. Buka Render dashboard → Aturuang → **Environment Variables**
2. Add variable: `DATABASE_URL` (Render akan generate otomatis)
3. Re-deploy

### Opsi C: Supabase (GRATIS tier)

1. Daftar di https://supabase.com → Create project
2. Copy connection string dari Dashboard → Settings → Database
3. Update `.env` file

---

## Langkah 2: Update Environment Variables

Edit `backend/.env`:

```env
# Database (sesuaikan dengan setup Anda)
DATABASE_URL=postgresql://aturuang:password@localhost:5432/aturuang

# JWT Secret (ganti dengan random string minimal 32 karakter)
JWT_SECRET=your-secret-key-min-32-chars-change-in-production

# Server
PORT=3001
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://aturuang.vercel.app

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=2097152
```

---

## Langkah 3: Generate Migration

```bash
cd backend
npx prisma migrate dev --name init_postgresql
```

---

## Langkah 4: Seed Database

```bash
cd backend
npx prisma db seed
```

---

## Langkah 5: Deploy ke Render

### Option 1: Via Render Dashboard

1. Buka Render dashboard → Aturuang
2. **Build Command:**
   ```bash
   cd backend && npx prisma generate && npx prisma migrate deploy
   ```

3. **Start Command:**
   ```bash
   cd backend && npx prisma generate && node src/index.js
   ```

4. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secret-key-min-32-chars-change-in-production
   FRONTEND_URL=https://aturuang.vercel.app
   PORT=3001
   ```

5. **Deploy** → Manual Deploy → Latest Revision

### Option 2: Via GitHub

1. Push code ke GitHub:
   ```bash
   git add .
   git commit -m "Switch to PostgreSQL"
   git push origin main
   ```

2. Render otomatis detect dan deploy

---

## Langkah 6: Verify Deployment

### 1. Check Health Endpoint

```bash
curl https://aturuang.onrender.com/health
```

### 2. Check Setup Status

```bash
curl https://aturuang.onrender.com/api/setup/status
```

### 3. Test Login

```bash
curl -X POST https://aturuang.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Troubleshooting

### Migration Failed

```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Connection Error

- Cek environment variables di Render dashboard
- Pastikan DATABASE_URL benar
- Cek PostgreSQL service running

### Seed Failed

```bash
cd backend
npx prisma db seed
```

---

## Post-Deployment Checklist

- [ ] Database connection successful
- [ ] Migration applied successfully
- [ ] Seed data created
- [ ] Health endpoint returning OK
- [ ] Login works with admin/admin123
- [ ] Frontend accessible
- [ ] API endpoints working

---

## Rollback (SQLite)

Jika ingin rollback ke SQLite:

1. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Reset database:
   ```bash
   cd backend
   npx prisma migrate reset
   ```

3. Re-deploy

---

## Support

Jika ada error:
1. Cek Render logs: dashboard.render.com → Aturuang → Logs
2. Cek database connection: `npx prisma studio`
3. Check environment variables

**Happy deploying!** 🚀
