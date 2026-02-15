# Local Testing - PostgreSQL + Docker

## 🎯 Tujuan
Test backend dengan PostgreSQL di local sebelum deploy ke Render.

---

## 📋 Prerequisites

- ✅ Docker terinstall
- ✅ Docker Compose terinstall
- ✅ PostgreSQL terinstall (opsional, docker akan handle)

---

## 🚀 Quick Start

### 1. Start Services

```bash
./test-local.sh
```

Script ini akan:
- ✅ Pull PostgreSQL image
- ✅ Build backend image
- ✅ Start PostgreSQL
- ✅ Generate Prisma Client
- ✅ Run migration
- ✅ Seed database
- ✅ Start backend

### 2. Access Services

- **PostgreSQL:** `localhost:5432`
- **Backend:** `http://localhost:3001`
- **Frontend:** `http://localhost:3000`

### 3. Test API

```bash
./test-api.sh
```

---

## 📊 Available Commands

### Start Services
```bash
./test-local.sh
```

### Stop Services
```bash
./stop-local.sh
```

### Access Prisma Studio
```bash
docker-compose -f docker-compose.dev.yml exec backend npx prisma studio
```

### View Logs
```bash
# Backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Restart Services
```bash
docker-compose -f docker-compose.dev.yml restart
```

### Rebuild Services
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
```

---

## 🔧 Manual Commands

### Start PostgreSQL Only
```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Start Backend Only
```bash
docker-compose -f docker-compose.dev.yml up -d backend
```

### Run Migration
```bash
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
```

### Seed Database
```bash
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

### Check Status
```bash
docker-compose -f docker-compose.dev.yml ps
```

---

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### Setup Status
```bash
curl http://localhost:3001/api/setup/status
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Users
```bash
TOKEN="your-jwt-token"
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📁 Files Created

- `docker-compose.dev.yml` - Docker compose configuration
- `backend/Dockerfile` - Backend Docker image
- `.env.local` - Local environment variables
- `test-local.sh` - Script to start services
- `test-api.sh` - Script to test API
- `stop-local.sh` - Script to stop services

---

## 🐛 Troubleshooting

### PostgreSQL not connecting

**Solution:**
```bash
docker-compose -f docker-compose.dev.yml restart postgres
```

### Migration failed

**Solution:**
```bash
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate reset
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

### Backend not starting

**Solution:**
```bash
docker-compose -f docker-compose.dev.yml logs backend
```

---

## 🔄 Cleanup

### Stop and Remove Volumes
```bash
./stop-local.sh
docker-compose -f docker-compose.dev.yml down -v
```

### Remove All Docker Resources
```bash
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
```

---

## 📊 Expected Output

### After Setup
```
✅ Setup completed successfully!

📊 Services running:
   - PostgreSQL: localhost:5432
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000
```

### After Test
```
✅ Testing completed!
```

---

## 🎯 Next Steps

Setelah testing local berhasil:

1. ✅ Verify all endpoints working
2. ✅ Test all features (booking, users, rooms)
3. ✅ Test with different users
4. ✅ Document any issues
5. ✅ Deploy to Render

---

## 📚 Useful Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Happy testing!** 🚀

---

*Created: 2026-02-15*
