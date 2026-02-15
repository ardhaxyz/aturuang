# Railway Auto-Deployment Guide

This guide covers deploying Aturuang Meeting Room Booking System to Railway using auto-deployment from Git.

## Prerequisites

- Git repository with Aturuang code
- Railway account (free tier available at [railway.app](https://railway.app))
- Railway CLI (optional, can use dashboard instead)

## Quick Start

### 1. Connect Repository to Railway

**Using Railway CLI:**
```bash
# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

**Using Railway Dashboard:**
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Aturuang repository
5. Railway will auto-detect services from `railway.json`

### 2. Verify Services

Railway will detect two services from your repository:

- **Backend Service**: `backend/` directory
  - Health check: `GET /health`
  - Port: 3001 (auto-assigned by Railway)
  - Database: SQLite via Railway volume

- **Frontend Service**: `frontend/` directory
  - Health check: `GET /`
  - Port: 80 (Nginx)
  - Static files served by Nginx

Check the Railway dashboard to verify both services are detected.

### 3. Configure Environment Variables

#### Backend Service Variables

Set these in Railway dashboard (select backend service):

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `file:./prisma/production.db` | SQLite database path (Railway volume) |
| `JWT_SECRET` | Generate with `openssl rand -base64 32` | JWT signing secret (32+ chars recommended) |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3001` | Backend port |

#### Frontend Service Variables

Set these in Railway dashboard (select frontend service):

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | Backend Railway URL | Your backend service URL (e.g., `https://xxx-backend.railway.app`) |

**Important**: Get your backend URL from Railway dashboard after deployment, then set `VITE_API_URL` in frontend service.

### 4. Deploy

After environment variables are set, Railway will automatically deploy:

1. Build logs show in Railway dashboard
2. Health checks verify services are running
3. URLs provided once deployment completes

## Auto-Deploy Flow

Once configured, every push to your Git repository triggers:

```
Git Push
    ↓
Railway Webhook Triggered
    ↓
Backend + Frontend Rebuild (independent)
    ↓
New Deployments Active
    ↓
Zero Downtime (Railway rolling updates)
```

## Railway Service URLs

After deployment, Railway provides URLs like:

- Backend: `https://aturrail-backend.railway.app`
- Frontend: `https://aturrail-frontend.railway.app`
- Custom domains: Can be configured in Railway settings

## Testing Deployment

### Verify Health Checks

```bash
# Backend health
curl https://your-backend.railway.app/health

# Frontend health
curl https://your-frontend.railway.app/

# Health check should return 200 OK
```

### Setup Initial Superadmin

After backend deployment, create the first superadmin:

```bash
curl -X POST https://your-backend.railway.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_secure_password"}'
```

### Access Application

1. Open frontend URL in browser
2. Login with superadmin credentials
3. Create organizations and users
4. Start booking rooms!

## Database Migrations

Railway uses the `backend/start.sh` script which runs:

```bash
npx prisma migrate deploy
```

This ensures all migrations are applied on each deployment.

## Troubleshooting

### Backend Not Starting

- Check build logs in Railway dashboard
- Verify `DATABASE_URL` is set correctly
- Ensure `JWT_SECRET` is set (32+ characters recommended)

### Frontend Can't Connect to Backend

- Verify `VITE_API_URL` is set to correct backend URL
- Check browser console for API errors
- Verify backend health check is passing

### Health Check Failing

- Backend: Check `/health` endpoint in code (backend/src/index.js)
- Frontend: Check `/health` location in nginx.conf
- Verify ports are exposed correctly (3001 for backend, 80 for frontend)

### Database Issues

- Railway SQLite volume persists across deployments
- Check `DATABASE_URL` format: `file:./prisma/production.db`
- migrations run automatically via `start.sh`

## Environment vs Local Development

### Docker Compose (Local)
```bash
docker compose up -d
```
- Single network
- Frontend proxies `/api` to backend
- SQLite in Docker volume

### Railway (Production)
- Two separate services
- Frontend connects via `VITE_API_URL`
- SQLite in Railway volume
- Auto-deploy from Git

## Costs

Railway free tier (as of 2025):
- $5 free credit/month
- Sufficient for development/small production usage
- Scale up as needed with paid plans

See [railway.app/pricing](https://railway.app/pricing) for current pricing.

## Next Steps

1. Deploy to Railway
2. Setup custom domain (optional)
3. Configure monitoring (Railway built-in metrics)
4. Set up CI/CD with GitHub Actions (optional)
5. Scale based on traffic

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI](https://github.com/railwayapp/cli)
- [Docker on Railway](https://docs.railway.app/deploy/dockerfiles)
- [Environment Variables](https://docs.railway.app/develop/variables)
