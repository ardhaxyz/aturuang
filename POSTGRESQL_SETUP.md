# PostgreSQL Setup Guide

## Pilihan Database

Anda memiliki 3 opsi untuk PostgreSQL:

### 1. Local PostgreSQL di VPS (REKOMENDASI) ✅

**Kelebihan:**
- ✅ GRATIS
- ✅ Full control
- ✅ Data di VPS Anda
- ✅ Private & secure

**Setup:**

```bash
# 1. Install PostgreSQL di VPS
sudo apt update
sudo apt install postgresql postgresql-contrib

# 2. Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Create database & user
sudo -u postgres psql <<EOF
CREATE DATABASE aturuang;
CREATE USER aturuang WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aturuang TO aturuang;
\q
EOF

# 4. Update .env file
# Ubah DATABASE_URL di backend/.env:
DATABASE_URL=postgresql://aturuang:your_secure_password@localhost:5432/aturuang
```

---

### 2. Render PostgreSQL (GRATIS) ✅

**Kelebihan:**
- ✅ GRATIS
- ✅ Auto backup
- ✅ Auto scaling
- ✅ Integrated dengan Render

**Setup:**

1. Buka Render dashboard → Aturuang → **Environment Variables**

2. Add variable:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

3. Render otomatis generate URL:
   - Host: `eleanor-xxxxx.onrender.com`
   - Database: `aturuang`
   - User: `postgres`
   - Password: (auto-generated)

4. Update `backend/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

5. Re-deploy di Render

---

### 3. Supabase (GRATIS tier) ✅

**Kelebihan:**
- ✅ GRATIS (500MB database)
- ✅ Auto backup
- ✅ SSL support
- ✅ Easy setup

**Setup:**

1. Daftar di https://supabase.com → Create new project

2. Tunggu project ready (~2 minutes)

3. Buka **Settings** → **Database**

4. Copy connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

5. Update `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

6. Re-deploy aplikasi

---

## Setelah Setup

### 1. Generate Migration

```bash
cd backend
npx prisma migrate dev --name init_postgresql
```

### 2. Seed Database

```bash
cd backend
npx prisma db seed
```

### 3. Test Connection

```bash
cd backend
npx prisma studio
```

### 4. Deploy

Deploy ke Render/VPS sesuai preferensi.

---

## Troubleshooting

### Error: "Connection refused"
- Cek PostgreSQL service running: `sudo systemctl status postgresql`
- Cek port 5432 terbuka: `sudo ufw status`

### Error: "Password authentication failed"
- Cek password di .env file
- Cek user created di PostgreSQL

### Error: "Database not found"
- Pastikan database created: `sudo -u postgres psql -l`

---

## Environment Variables

Pastikan .env sudah di-set:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-min-32-chars-change-in-production
FRONTEND_URL=https://aturuang.vercel.app
PORT=3001
NODE_ENV=production
```

---

## Next Steps

1. Pilih salah satu opsi PostgreSQL
2. Setup database
3. Update .env file
4. Generate migration
5. Seed database
6. Deploy aplikasi

**Good luck!** 🚀
