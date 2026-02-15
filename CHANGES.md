# Perubahan Backend - SQLite ke PostgreSQL

## ✅ Apa yang Sudah Dilakukan

### 1. Pull Repository
- Repository berhasil di-clone dari GitHub
- Lokasi: `/home/sutopo/aturuang/`

### 2. Ubah Prisma Schema
- **File:** `backend/prisma/schema.prisma`
- **Perubahan:**
  ```prisma
  # Sebelum (SQLite)
  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }

  # Sesudah (PostgreSQL)
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

### 3. Buat .env File
- **File:** `backend/.env`
- **Isi:** Template PostgreSQL URL untuk 3 opsi:
  1. Local PostgreSQL di VPS (GRATIS)
  2. Render PostgreSQL (GRATIS)
  3. Supabase (GRATIS tier)

### 4. Generate Prisma Client
- **Command:** `npx prisma generate`
- **Status:** ✅ Berhasil
- **Output:** Prisma Client v5.22.0 generated

---

## 📋 Langkah Selanjutnya (Yang Perlu Ardha Lakukan)

### 1. Setup Database PostgreSQL

**Pilih salah satu opsi:**

#### Opsi A: Local PostgreSQL di VPS (REKOMENDASI)
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

#### Opsi B: Render PostgreSQL
1. Buka Render dashboard → Aturuang → Environment Variables
2. Add variable: `DATABASE_URL` (Render generate otomatis)
3. Re-deploy

#### Opsi C: Supabase
1. Daftar di https://supabase.com → Create project
2. Copy connection string dari Dashboard → Settings → Database
3. Update `.env` file

### 2. Update .env File

Edit `backend/.env` dan sesuaikan `DATABASE_URL` dengan setup Anda:

```env
# Local PostgreSQL
DATABASE_URL=postgresql://aturuang:password@localhost:5432/aturuang

# Render PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@[HOST]:5432/postgres
```

### 3. Generate Migration

```bash
cd backend
npx prisma migrate dev --name init_postgresql
```

### 4. Seed Database

```bash
cd backend
npx prisma db seed
```

### 5. Deploy ke Render

**Build Command:**
```bash
cd backend && npx prisma generate && npx prisma migrate deploy
```

**Start Command:**
```bash
cd backend && npx prisma generate && node src/index.js
```

**Environment Variables:**
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-min-32-chars-change-in-production
FRONTEND_URL=https://aturuang.vercel.app
PORT=3001
```

---

## 📚 Dokumentasi Tambahan

- **POSTGRESQL_SETUP.md** - Guide lengkap setup PostgreSQL
- **DEPLOY_POSTGRESQL.md** - Guide deployment dengan PostgreSQL

---

## 🎯 Ringkasan

**Yang sudah selesai:**
- ✅ Repository di-clone
- ✅ Prisma schema diubah ke PostgreSQL
- ✅ .env file dibuat dengan template
- ✅ Prisma client generated

**Yang perlu Ardha lakukan:**
1. Setup database PostgreSQL (1 dari 3 opsi)
2. Update .env file dengan DATABASE_URL
3. Generate migration
4. Seed database
5. Deploy ke Render

---

**Apa yang Ardha mau?**
1. ✅ Saya bantu setup local PostgreSQL di VPS
2. ✅ Saya bantu setup Render PostgreSQL
3. ✅ Saya bantu setup Supabase
4. ✅ Saya bantu deploy ke Render

**Apa yang Ardha pilih?**
