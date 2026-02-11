# Meeting Room Dashboard (Phase 1 - MVP) - Docker Ready!

Modern meeting room booking system dengan React + TypeScript + FullCalendar.js frontend dan Node.js + Express + PostgreSQL backend.

**Status:** ✅ Docker-ready! Deploy langsung di VPS Anda.

## 📦 Deploy dengan Docker (Recommended)

### Quick Deploy (5 menit)

```bash
# 1. Clone atau setup project
cd meeting-room-dashboard

# 2. Install dependencies
cd backend && npm ci && npx prisma generate && cd ..

# 3. Setup .env
cp backend/.env.example backend/.env
# Edit backend/.env dan ganti JWT_SECRET, passwords, dll

# 4. Deploy
./deploy.sh
```

### Manual Deploy

```bash
# Build dan start
docker-compose up -d --build

# Run migrations
cd backend
npx prisma migrate deploy

# Cek status
docker-compose ps
```

### Access
- **Frontend:** `http://VPS-IP` atau `http://domain.com`
- **Backend:** `http://VPS-IP:3001`
- **Database:** `localhost:5432` (internal)

**Default Credentials:** guest123 / admin123 (GANTI SEBELUM DEPLOYMENT!)

📖 **Lihat DOCKER-SETUP.md untuk detail lengkap:**
- Configuration guide
- Security checklist
- SSL/HTTPS setup
- Backup & maintenance
- Troubleshooting

## 📋 Fitur

- **Single Password Authentication** - Login dengan password sederhana (guest/admin)
- **Dashboard** - Stats, today's schedule, quick actions
- **Booking System** - Form booking dengan conflict detection
- **Calendar View** - FullCalendar.js dengan filter room/status
- **Room Management** - List rooms dengan capacity & facilities
- **Admin Panel** - Approve/reject pending bookings
- **Responsive Design** - Mobile-first dengan bottom navigation
- **Docker Support** - Deploy cepat di VPS dengan docker-compose

## 🏗️ Tech Stack

### Frontend (Vercel OR Docker)
- React 18 + TypeScript
- Tailwind CSS + Lucide React icons
- FullCalendar.js untuk calendar view
- React Router untuk navigation
- Axios untuk API calls

### Backend (Railway OR Docker)
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT untuk authentication
- Zod untuk validation

### Database
- PostgreSQL 15

## 📁 Project Structure

```
meeting-room-dashboard/
├── backend/              # Express API server
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── index.js
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── frontend/             # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   └── package.json
│
├── docker-compose.yml    # Docker orchestration
├── deploy.sh            # Quick deploy script
├── DOCKER-SETUP.md      # Detailed deployment guide
├── DEPLOYMENT.md        # Deployment guide (Vercel + Railway)
└── README.md            # This file
```

## 🚀 Setup Development

### Local Development (Docker)

```bash
# Copy docker-compose.yml dan build
docker-compose up -d

# Run migrations
cd backend
npx prisma migrate dev --name init
npm run seed
cd ..

# Start frontend dev server
cd frontend
npm run dev
# Server berjalan di http://localhost:3000
```

### Local Development (No Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## ⚙️ Configuration

### Edit docker-compose.yml

```yaml
# Ganti environment variables sesuai kebutuhan
JWT_SECRET: "ganti-dengan-random-string-min-32-chars"
GUEST_PASSWORD: "guest123"
ADMIN_PASSWORD: "admin123"
FRONTEND_URL: "http://your-domain.com"
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | postgresql://... | PostgreSQL connection string |
| `JWT_SECRET` | *Required* | Secret untuk JWT token |
| `GUEST_PASSWORD` | guest123 | Password guest |
| `ADMIN_PASSWORD` | admin123 | Password admin |
| `FRONTEND_URL` | http://localhost | URL frontend (CORS) |
| `PORT` | 3001 | Backend port |

## 🗄️ Database Schema

```prisma
model Room {
  id        String   @id @default(cuid())
  name      String
  capacity  Int
  facilities String[]
  bookings  Booking[]
}

model Booking {
  id          String   @id @default(cuid())
  roomId      String
  date        DateTime
  startTime   String
  endTime     String
  title       String
  bookerName  String
  bookerEmail String?
  status      String   @default("pending")
  room        Room     @relation(fields: [roomId], references: [id])
}

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  role         String   @default("admin")
}
```

## 🔧 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth` | Login dengan password | Public |
| GET | `/api/me` | Get current user info | Protected |
| GET | `/api/rooms` | Get all rooms | Public |
| GET | `/api/rooms/:id` | Get room by ID | Public |
| GET | `/api/bookings` | Get bookings (with filters) | Protected |
| POST | `/api/bookings` | Create new booking | Protected |
| PATCH | `/api/bookings/:id/approve` | Approve/reject booking | Admin |
| DELETE | `/api/bookings/:id` | Delete booking | Admin |

## 📱 Pages

1. **Login Page** - Single password authentication
2. **Dashboard** - Quick stats, today's schedule, quick actions
3. **Book Room** - Booking form dengan date/time picker
4. **Rooms** - List semua room dengan capacity & facilities
5. **Calendar** - FullCalendar.js view dengan filtering
6. **Admin Panel** - Approve/reject pending bookings (admin only)

## 🛠️ Commands

### Docker Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build
```

### Database Management

```bash
# Enter postgres container
docker exec -it meeting-room-db psql -U meeting_room_user -d meeting_room_db

# Run migrations
docker exec -it meeting-room-backend npx prisma migrate deploy

# Reset database
docker-compose down -v
docker-compose up -d
cd backend && npx prisma migrate reset && cd ..
```

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed

# Open Prisma Studio
npx prisma studio
```

## 📊 Monitoring

### Check Status

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Logs
docker-compose logs backend
docker-compose logs frontend
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Frontend health
curl http://localhost/health

# Database health
docker exec meeting-room-db pg_isready -U meeting_room_user
```

## 🔒 Security

### Checklist Sebelum Deploy

- [ ] Ganti `JWT_SECRET` dengan random string (32+ chars)
- [ ] Ganti `GUEST_PASSWORD` dan `ADMIN_PASSWORD`
- [ ] Update `FRONTEND_URL` dengan domain production
- [ ] Setup firewall (allow port 80)
- [ ] Setup SSL/HTTPS (Certbot)
- [ ] Setup database backup
- [ ] Test booking flow
- [ ] Test admin panel

### SSL/HTTPS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Setup SSL
sudo certbot --nginx -d your-domain.com

# Certbot akan otomatis configure Nginx untuk SSL
docker-compose restart frontend
```

## 🧹 Cleanup

```bash
# Stop semua services
docker-compose down

# Remove containers
docker-compose down

# Remove volumes (HAPUS SEMUA DATABASE!)
docker-compose down -v

# Remove unused images
docker image prune -a

# Clean build cache
docker builder prune
```

## 🔄 Updates

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose up -d --build

# Restart services
docker-compose restart backend frontend

# Run migrations jika ada
cd backend && npx prisma migrate deploy && cd ..
```

## 📝 Notes Produksi

1. **Ganti default passwords** di environment variables
2. **Ganti JWT_SECRET** dengan random string yang kuat
3. **Setup SSL/HTTPS** untuk production
4. **Setup database backup** otomatis (cron job)
5. **Monitor logs** untuk debugging
6. **Update dependencies** secara berkala

## 📚 Documentation

- **DOCKER-SETUP.md** - Lengkap untuk Docker deployment di VPS
- **DEPLOYMENT.md** - Panduan Vercel + Railway deployment
- **README.md** - Panduan development

## 🎯 Next Steps (Phase 2)

1. **Real-time updates** dengan WebSocket
2. **Email notifications** untuk approvals
3. **Export to PDF/Excel** fitur
4. **Advanced filtering & search**
5. **Recurring bookings**
6. **Analytics dashboard**
7. **QR code check-in**
8. **Mobile app PWA**

## 📄 License

MIT License - bebas digunakan dan dimodifikasi.

## 👥 Contributors

Dikembangkan sebagai solusi modern untuk booking ruang rapat.

---

**Status:** Phase 1 MVP - Production Ready + Docker Ready 🚀

**Last Updated:** February 2026

**Deploy Quick Start:**
```bash
./deploy.sh
```

Selamat! Meeting Room Dashboard sudah siap untuk deployment! 🎉
