# Deployment Checklist - Render PostgreSQL

## ✅ Checklist Deployment

### Phase 1: Database Setup
- [ ] Buka Render dashboard: https://dashboard.render.com
- [ ] Create new PostgreSQL database
  - [ ] Name: `aturuang-db`
  - [ ] Region: [Pilih region terdekat]
  - [ ] Plan: Free
  - [ ] Click "Create Database"
- [ ] Tunggu database ready (1-2 menit)

### Phase 2: Get Database URL
- [ ] Buka database → Settings → Environment Variables
- [ ] Copy connection string
- [ ] Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/aturuang`

### Phase 3: Update Local Files
- [ ] Edit `/home/sutopo/aturuang/backend/.env`
- [ ] Update `DATABASE_URL` dengan URL dari Render
- [ ] Save file

### Phase 4: Generate Migration
- [ ] Buka terminal
- [ ] Run: `cd /home/sutopo/aturuang/backend`
- [ ] Run: `npx prisma migrate dev --name init_postgresql`
- [ ] Check migration successful

### Phase 5: Seed Database
- [ ] Run: `npx prisma db seed`
- [ ] Check seed successful
- [ ] Verify admin user created

### Phase 6: Push to GitHub
- [ ] Buka terminal
- [ ] Run: `cd /home/sutopo/aturuang`
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "Switch to PostgreSQL and prepare for Render deployment"`
- [ ] Run: `git push origin main`

### Phase 7: Deploy to Render
- [ ] Buka Render dashboard
- [ ] Create new Web Service
  - [ ] Connect GitHub repository: `ardhaxyz/aturuang`
  - [ ] Branch: `main`
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npx prisma generate && npx prisma migrate deploy`
  - [ ] Start Command: `npx prisma generate && node src/index.js`
  - [ ] Environment Variables:
    - [ ] `DATABASE_URL=postgresql://postgres:password@host:5432/aturuang`
    - [ ] `JWT_SECRET=your-secret-key-min-32-chars-change-in-production`
    - [ ] `FRONTEND_URL=https://aturuang.vercel.app`
    - [ ] `PORT=3001`
    - [ ] `NODE_ENV=production`
  - [ ] Region: [Pilih region terdekat]
  - [ ] Plan: Free
  - [ ] Click "Create Web Service"
- [ ] Tunggu deployment (3-5 menit)

### Phase 8: Verify Deployment
- [ ] Check health endpoint: `curl https://aturuang.onrender.com/health`
- [ ] Check setup status: `curl https://aturuang.onrender.com/api/setup/status`
- [ ] Test login:
  - [ ] Username: `admin`
  - [ ] Password: `admin123`
- [ ] Buka frontend: https://aturuang.vercel.app
- [ ] Test login di frontend
- [ ] Test semua fitur (booking, users, rooms)

---

## 📊 Status

### Database Setup
- [ ] Database created: [ ]
- [ ] Database URL obtained: [ ]

### Local Setup
- [ ] .env updated: [ ]
- [ ] Migration generated: [ ]
- [ ] Database seeded: [ ]
- [ ] Code pushed to GitHub: [ ]

### Render Deployment
- [ ] Web Service created: [ ]
- [ ] Deployment successful: [ ]
- [ ] Health check passing: [ ]
- [ ] Login working: [ ]
- [ ] Frontend accessible: [ ]

### Testing
- [ ] Test login: [ ]
- [ ] Test booking: [ ]
- [ ] Test users: [ ]
- [ ] Test rooms: [ ]

---

## 🎯 Final Verification

### Database
- [ ] Database connection successful
- [ ] Migration applied
- [ ] Seed data present
- [ ] Admin user exists

### Application
- [ ] Health endpoint: OK
- [ ] Login: Success
- [ ] Frontend: Accessible
- [ ] Backend: Responding

### Features
- [ ] Booking system working
- [ ] User management working
- [ ] Room management working
- [ ] Organization management working

---

## 🚀 Launch Checklist

- [ ] All above items checked
- [ ] Ready for production use
- [ ] Monitor logs for first few hours
- [ ] Test all features thoroughly

---

**Happy deploying!** 🎉

---

*Created: 2026-02-15*
*Updated: 2026-02-15*
