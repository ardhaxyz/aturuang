# Deployment Instructions

Panduan lengkap untuk deploy Meeting Room Dashboard ke production.

## 🚀 Deployment Architecture

```
Frontend (Vercel) ── HTTPS ──> Backend (Railway/Render) ──> PostgreSQL Database
     │                                 │
     └── User Browser                  └── Database (Railway PostgreSQL atau external)
```

## 1. Backend Deployment (Railway atau Render)

### Option A: Railway (Recommended)

**Step 1: Setup Railway Account**
1. Sign up di [railway.app](https://railway.app)
2. Install Railway CLI (opsional): `npm i -g @railway/cli`

**Step 2: Create New Project**
1. Klik "New Project"
2. Pilih "Deploy from GitHub repo"
3. Connect ke GitHub repository
4. Pilih folder `backend/`

**Step 3: Setup Database**
1. Di Railway dashboard, klik "New" → "Database" → "PostgreSQL"
2. Tunggu sampai database provisioned
3. Copy connection string dari "Connect" tab

**Step 4: Configure Environment Variables**
Di Railway project settings → Variables, tambahkan:

```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"
JWT_SECRET="generate-random-string-min-32-chars"
PORT="3001"
GUEST_PASSWORD="change-this-in-production"
ADMIN_PASSWORD="change-this-in-production"
FRONTEND_URL="https://your-frontend.vercel.app"
NODE_ENV="production"
```

**Step 5: Deploy**
1. Railway akan auto-deploy dari GitHub
2. Tunggu deployment selesai
3. Copy deployment URL (contoh: `https://your-backend.up.railway.app`)

**Step 6: Run Database Migrations**
```bash
# Via Railway CLI
railway run npx prisma migrate deploy

# Atau via Railway dashboard:
# Klik "Connect" → "PostgreSQL" → Open terminal dan run:
npx prisma migrate deploy
```

### Option B: Render

**Step 1: Setup Render Account**
1. Sign up di [render.com](https://render.com)
2. Connect GitHub account

**Step 2: Create Web Service**
1. Klik "New" → "Web Service"
2. Connect ke GitHub repository
3. Configure:
   - **Name:** meeting-room-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install && npx prisma generate`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `backend/`

**Step 3: Create Database**
1. Klik "New" → "PostgreSQL"
2. Pilih plan (Free tier available)
3. Copy internal database URL

**Step 4: Configure Environment Variables**
Di Render dashboard → Environment:

```env
DATABASE_URL="postgresql://user:password@dpg-xxx:5432/database"
JWT_SECRET="generate-random-string-min-32-chars"
PORT="10000"  # Render uses port 10000
GUEST_PASSWORD="change-this-in-production"
ADMIN_PASSWORD="change-this-in-production"
FRONTEND_URL="https://your-frontend.vercel.app"
NODE_ENV="production"
```

**Step 5: Deploy**
1. Klik "Create Web Service"
2. Tunggu deployment selesai
3. Copy URL (contoh: `https://your-backend.onrender.com`)

## 2. Frontend Deployment (Vercel)

**Step 1: Setup Vercel Account**
1. Sign up di [vercel.com](https://vercel.com)
2. Connect GitHub account

**Step 2: Import Project**
1. Klik "New Project"
2. Import GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

**Step 3: Configure Environment Variables**
Di Vercel project settings → Environment Variables:

```env
VITE_API_URL="https://your-backend.up.railway.app"  # Backend URL dari Railway/Render
```

**Step 4: Deploy**
1. Klik "Deploy"
2. Tunggu deployment selesai
3. Copy URL (contoh: `https://meeting-room-dashboard.vercel.app`)

**Step 5: Update Backend CORS**
Update `FRONTEND_URL` di backend environment variables dengan URL Vercel.

## 3. Domain Custom (Opsional)

### Custom Domain di Vercel
1. Di Vercel project → Settings → Domains
2. Add custom domain (contoh: `dashboard.company.com`)
3. Setup DNS records sesuai instruksi

### Custom Domain di Backend
1. Di Railway/Render, tambahkan custom domain
2. Update `FRONTEND_URL` dengan domain baru
3. Update `VITE_API_URL` di frontend dengan domain backend baru

## 4. Production Checklist

### 🔐 Security
- [ ] Ganti `JWT_SECRET` dengan random string yang kuat
- [ ] Ganti `GUEST_PASSWORD` dan `ADMIN_PASSWORD`
- [ ] Setup HTTPS/SSL (otomatis di Vercel/Railway/Render)
- [ ] Enable CORS dengan domain yang spesifik
- [ ] Setup rate limiting (jika perlu)

### 🗄️ Database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Run seed data: `npm run seed` (development only)
- [ ] Setup automatic backups
- [ ] Monitor database performance

### 📱 Frontend
- [ ] Update `VITE_API_URL` dengan production backend URL
- [ ] Test semua fitur di production
- [ ] Setup analytics (Google Analytics, etc.)
- [ ] Add PWA manifest (jika perlu)

### 🔧 Monitoring
- [ ] Setup error tracking (Sentry, LogRocket)
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Monitor logs di Railway/Render dashboard
- [ ] Setup alerts untuk downtime

## 5. Troubleshooting Production

### Database Connection Issues
```bash
# Test database connection
railway run npx prisma db pull

# Reset database (HATI-HATI!)
railway run npx prisma migrate reset
```

### CORS Issues
1. Pastikan `FRONTEND_URL` di backend benar
2. Check browser console untuk CORS errors
3. Test dengan `curl` atau Postman

### Authentication Issues
1. Clear localStorage di browser
2. Check JWT token di [jwt.io](https://jwt.io)
3. Verify `JWT_SECRET` sama antara deployments

### Performance Issues
1. Check database indexes di Prisma schema
2. Monitor query performance dengan Prisma Studio
3. Consider caching dengan Redis (Phase 2)

## 6. Maintenance

### Update Application
1. Push changes ke GitHub
2. Railway/Render akan auto-deploy backend
3. Vercel akan auto-deploy frontend

### Database Backups
- Railway: Automatic daily backups
- Render: Manual backups via dashboard
- Consider external backup solution untuk critical data

### Monitoring
- Railway/Render: Built-in logs dan metrics
- Vercel: Analytics dan performance monitoring
- External: Setup UptimeRobot untuk uptime monitoring

## 7. Cost Estimation

### Free Tier (Untuk testing/small team)
- **Vercel:** Free (unlimited deployments, 100GB bandwidth)
- **Railway:** $5 credit/month (Free tier available)
- **Render:** Free tier (Web service + PostgreSQL)

### Production (Untuk team 10-50 users)
- **Vercel:** Pro plan $20/month
- **Railway:** ~$10-20/month
- **Render:** ~$7-25/month
- **Total:** ~$30-65/month

## 📞 Support

Jika ada issues dengan deployment:

1. **Check logs** di Railway/Render/Vercel dashboard
2. **Test API endpoints** dengan Postman/curl
3. **Verify environment variables**
4. **Check Prisma migrations status**
5. **Clear browser cache dan localStorage**

## 🎉 Deployment Complete!

Setelah semua step selesai, aplikasi siap digunakan di:
- Frontend: `https://your-frontend.vercel.app`
- Backend API: `https://your-backend.up.railway.app`
- Health check: `https://your-backend.up.railway.app/health`

Default passwords (GANTI DI PRODUCTION!):
- Guest: `guest123`
- Admin: `admin123`

**Selamat! Meeting Room Dashboard sudah live!** 🚀