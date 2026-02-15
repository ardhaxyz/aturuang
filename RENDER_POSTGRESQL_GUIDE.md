# Setup Render PostgreSQL & Deploy - Langkah demi Langkah

## 🎯 **Tujuan:**
Setup PostgreSQL database di Render dan deploy Aturuang dengan database tersebut.

---

## 📋 **Langkah 1: Buat PostgreSQL Database di Render**

### 1.1. Buka Render Dashboard
- Buka: https://dashboard.render.com
- Login dengan GitHub account

### 1.2. Create New Database
1. Klik **"New +"** → **"PostgreSQL"**
2. **Name:** `aturuang-db`
3. **Region:** Pilih region terdekat (misal: Frankfurt)
4. **Plan:** **Free** (GRATIS)
5. Klik **"Create Database"**

### 1.3. Tunggu Database Ready
- Database akan di-create dalam 1-2 menit
- Status berubah dari "Creating" ke "Provisioned"

---

## 📋 **Langkah 2: Get Database URL**

### 2.1. Buka Database Settings
1. Buka database → **Settings** → **Environment Variables**

### 2.2. Copy Connection String
Cari variabel `DATABASE_URL` atau **"Connection String"**

Format:
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/aturuang
```

**Contoh:**
```
postgresql://postgres:abc123xyz@eleanor-xxxxx.onrender.com:5432/aturuang
```

### 2.3. Save Connection String
Copy URL ini untuk langkah selanjutnya.

---

## 📋 **Langkah 3: Update Local .env File**

### 3.1. Edit `/home/sutopo/aturuang/backend/.env`

```bash
nano /home/sutopo/aturuang/backend/.env
```

### 3.2. Update DATABASE_URL

Ganti baris:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/aturuang
```

Dengan URL dari Render:
```env
DATABASE_URL=postgresql://postgres:abc123xyz@eleanor-xxxxx.onrender.com:5432/aturuang
```

### 3.3. Save & Exit
- Press `Ctrl+O`, Enter, lalu `Ctrl+X`

---

## 📋 **Langkah 4: Generate Migration**

```bash
cd /home/sutopo/aturuang/backend
npx prisma migrate dev --name init_postgresql
```

Expected output:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

Applying migration `20260215_xxxxx_init_postgresql`

The following migration(s) have been applied:

migrations/
  └─ 20260215_xxxxx_init_postgresql/
    └─ migration.sql

Your database is now in sync with your schema.
```

---

## 📋 **Langkah 5: Seed Database**

```bash
cd /home/sutopo/aturuang/backend
npx prisma db seed
```

Expected output:
```
🌱 Seeding database...

✅ Superadmin user created: admin (username: admin)
✅ Default organization created: Coordinating Ministry for Food Affairs
✅ Seed completed successfully!
```

---

## 📋 **Langkah 6: Deploy ke Render**

### 6.1. Push Code ke GitHub

```bash
cd /home/sutopo/aturuang
git add .
git commit -m "Switch to PostgreSQL and prepare for Render deployment"
git push origin main
```

### 6.2. Buka Render Dashboard
- Buka: https://dashboard.render.com

### 6.3. Create New Web Service

1. Klik **"New +"** → **"Web Service"**
2. Connect ke GitHub repository: `ardhaxyz/aturuang`
3. **Branch:** `main`
4. **Root Directory:** `backend`
5. **Build Command:**
   ```bash
   npx prisma generate && npx prisma migrate deploy
   ```
6. **Start Command:**
   ```bash
   npx prisma generate && node src/index.js
   ```
7. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://postgres:abc123xyz@eleanor-xxxxx.onrender.com:5432/aturuang
   JWT_SECRET=your-secret-key-min-32-chars-change-in-production
   FRONTEND_URL=https://aturuang.vercel.app
   PORT=3001
   NODE_ENV=production
   ```
8. **Region:** Pilih region terdekat
9. **Plan:** **Free** (Render Free)
10. Klik **"Create Web Service"**

### 6.4. Tunggu Deployment

- Deployment akan berjalan 3-5 menit
- Status berubah dari "Building" ke "Provisioned"

---

## 📋 **Langkah 7: Verify Deployment**

### 7.1. Check Health Endpoint

```bash
curl https://aturuang.onrender.com/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T13:00:00.000Z",
  "environment": "production"
}
```

### 7.2. Check Setup Status

```bash
curl https://aturuang.onrender.com/api/setup/status
```

Expected:
```json
{
  "setupRequired": false,
  "adminCreated": true
}
```

### 7.3. Test Login

```bash
curl -X POST https://aturuang.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "superadmin"
  }
}
```

---

## 🎉 **Deployment Selesai!**

### **Login Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

### **Access URLs:**
- **Frontend:** https://aturuang.vercel.app
- **Backend API:** https://aturuang.onrender.com
- **Health Check:** https://aturuang.onrender.com/health

---

## 🔧 **Troubleshooting**

### Error: "Database connection failed"

**Cek:**
1. DATABASE_URL benar di environment variables
2. Database sudah provisioned (tidak di "Creating" state)
3. Database URL format benar

### Error: "Migration failed"

**Solusi:**
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Error: "Setup required"

**Solusi:**
```bash
curl -X POST https://aturuang.onrender.com/api/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📊 **Summary**

✅ PostgreSQL database created di Render
✅ Migration applied successfully
✅ Database seeded with admin user
✅ Application deployed successfully
✅ Health check passing
✅ Login working

---

## 🎯 **Next Steps:**

1. Test aplikasi di browser
2. Test semua fitur (booking, users, rooms)
3. Setup cron job untuk keep warm (opsional)

**Happy deploying!** 🚀
