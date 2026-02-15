# Backend Deployment Guide - PostgreSQL

## Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `aturuang-db`
   - **Database**: `aturuang`
   - **User**: `aturuang`
   - **Plan**: Free
4. Click **Create Database**
5. Wait for status to become "Available" (1-2 minutes)

## Step 2: Get Database Connection URL

1. Open your PostgreSQL database on Render
2. Go to **"Connections"** tab
3. Copy the **"Internal Database URL"** or **"External Database URL"**
   - Format: `postgresql://aturuang:password@host:5432/aturuang`

## Step 3: Deploy with Render CLI

```bash
# From project root directory
cd /Users/ardhayosef/Documents/aturuang

# Deploy the blueprint
render blueprint apply

# Or create service manually
render services create web --name aturuang-backend \
  --branch master \
  --build-command "cd backend && npm install && npx prisma generate" \
  --start-command "cd backend && npx prisma migrate deploy && npm start"
```

## Step 4: Set Environment Variables

After the service is created, set the DATABASE_URL:

```bash
render env set aturuang-backend DATABASE_URL="postgresql://aturuang:PASSWORD@HOST:5432/aturuang"
```

## Step 5: Verify Deployment

```bash
# Check health
curl https://aturuang-backend.onrender.com/health

# Test setup
curl https://aturuang-backend.onrender.com/api/setup/status
```

## Quick Commands

```bash
# View logs
render logs aturuang-backend

# View service details
render services show aturuang-backend

# Redeploy
render deploy aturuang-backend
```
