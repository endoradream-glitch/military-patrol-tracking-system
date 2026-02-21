# 🚀 Military Patrol Tracking System - Free WebApp Deployment Guide

This guide will help you deploy your Military Patrol Tracking System as a fully functional webapp at **zero cost** using free hosting platforms.

## 📋 Table of Contents

1. [Deployment Options Overview](#deployment-options-overview)
2. [Option 1: Vercel + Railway (Recommended)](#option-1-vercel--railway-recommended)
3. [Option 2: Vercel + Render](#option-2-vercel--render)
4. [Option 3: Netlify + Railway](#option-3-netlify--railway)
5. [Option 4: Self-Hosting with ngrok](#option-4-self-hosting-with-ngrok)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## 🌟 Deployment Options Overview

Since your application has **three main components**, you need a strategy to host all of them:

| Component | Technology | Free Options |
|-----------|-----------|--------------|
| Frontend (Next.js) | Next.js 16 | Vercel, Netlify, Cloudflare Pages |
| Database (SQLite) | Prisma + SQLite | Railway, Render, SQLite Cloud (free tier) |
| WebSocket Service | Socket.io (port 3003) | Railway, Render, Replit, Fly.io |

**Recommended Combination (100% Free):**
- **Vercel** for Frontend (Next.js native)
- **Railway** for WebSocket Service (background process)
- **Railway** or **SQLite Cloud** for Database

**Why this combination?**
- ✅ Vercel: Unlimited free hosting for Next.js (best performance)
- ✅ Railway: $5 free monthly credit (enough for small services)
- ✅ Zero cost for typical military patrol usage
- ✅ Auto-scaling and SSL certificates included
- ✅ Easy deployment from Git

---

## 🎯 Option 1: Vercel + Railway (Recommended)

### Prerequisites

Before starting, ensure you have:
- ✅ GitHub account (free)
- ✅ Vercel account (free)
- ✅ Railway account (free)
- ✅ Git installed locally

### Step 1: Prepare Your Code Repository

```bash
# Navigate to your project
cd /home/z/my-project

# Initialize Git if not already done
git init
git add .
git commit -m "Initial commit - Military Patrol Tracking System"

# Create a new repository on GitHub first (github.com/new)
# Then connect and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/military-patrol-system.git
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel

#### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 2.2 Login to Vercel
```bash
vercel login
```
- Choose your login method (GitHub, GitLab, Email)
- Follow the browser authentication

#### 2.3 Deploy to Vercel
```bash
cd /home/z/my-project
vercel --prod --yes
```

This will:
- Detect Next.js project automatically
- Build and deploy to Vercel
- Provide a URL like `https://military-patrol-system.vercel.app`

#### 2.4 Configure Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
NEXT_PUBLIC_WEBSOCKET_URL=your-railway-websocket-url (get after Step 3)
DATABASE_URL=your-railway-database-url (get after Step 3)
```

5. Redeploy:
```bash
vercel --prod
```

### Step 3: Deploy WebSocket Service to Railway

#### 3.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Verify your email

#### 3.2 Create New Project
1. Click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Select your repository
4. Select **"mini-services/tracking-service"** as the root directory

#### 3.3 Configure WebSocket Service

In Railway, edit the configuration:

**Add `railway.json` to tracking-service:**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "healthcheckPath": "/health"
  }
}
```

**Set Environment Variables in Railway:**
- `NODE_ENV=production`
- `PORT=3003`

#### 3.4 Expose the WebSocket Service

1. In Railway, go to **Settings** → **Networking**
2. Note the generated URL: `https://your-app-name.up.railway.app`
3. This is your WebSocket URL

#### 3.5 Update Vercel Environment Variables

Go back to Vercel Dashboard and update:
```
NEXT_PUBLIC_WEBSOCKET_URL=https://your-app-name.up.railway.app
```

Redeploy Vercel:
```bash
vercel --prod
```

### Step 4: Deploy Database to Railway

#### 4.1 Add PostgreSQL to Railway Project

1. In your Railway project, click **"New Service"**
2. Select **Database** → **PostgreSQL**
3. Railway will create a free PostgreSQL instance
4. Wait for it to be ready (green indicator)

#### 4.2 Get Database URL

1. Click on the PostgreSQL service
2. Go to **Variables** tab
3. Copy the `DATABASE_URL` (starts with `postgresql://...`)

#### 4.3 Update Prisma Schema for PostgreSQL

Your current schema uses SQLite. For Railway, we need PostgreSQL:

**Edit `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Keep all your existing models (User, Patrol, HQ, etc.)
```

#### 4.4 Push Schema to Railway Database

```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="postgresql://your-railway-db-url"

# Generate Prisma Client
bunx prisma generate

# Push schema to Railway database
bunx prisma db push
```

#### 4.5 Update Vercel Environment Variables

Go to Vercel Dashboard and add:
```
DATABASE_URL=postgresql://your-railway-db-url
```

Redeploy Vercel:
```bash
vercel --prod
```

### Step 5: Update WebSocket Connection Code

Since Railway uses HTTPS and proper ports, update your frontend code:

**Edit `/src/app/page.tsx`:**

```typescript
// Find the socket connection code
const socket = io('/', {
  path: '/',
  transports: ['websocket', 'polling'],
  forceNew: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

**Note:** The `XTransformPort` query parameter is not needed in production. The WebSocket URL should point directly to Railway.

### Step 6: Verify Deployment

1. **Frontend**: Visit your Vercel URL
2. **WebSocket**: Check Railway logs for connections
3. **Database**: Test user registration

Test all features:
- ✅ User login (Patrol code 1526, HQ code 8993)
- ✅ GPS tracking updates
- ✅ Real-time map
- ✅ Video/audio calls
- ✅ SOS alerts

### Step 7: Set Up Custom Domain (Optional)

#### For Vercel:
1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `patrol.yourcompany.com`)
3. Update DNS records as shown

#### For Railway:
1. Go to **Settings** → **Networking**
2. Add custom domain
3. Update DNS records

---

## 🎯 Option 2: Vercel + Render

If you prefer Render over Railway:

### Deploy WebSocket Service to Render

1. **Create Render Account**: [render.com](https://render.com)
2. **Create New Web Service**
   - Connect your GitHub repository
   - Root directory: `mini-services/tracking-service`
   - Runtime: Docker or Node
   - Build Command: `bun install`
   - Start Command: `bun index.ts`
   - Instance Type: Free

3. **Add Environment Variables:**
   ```
   PORT=3003
   NODE_ENV=production
   ```

4. **Get URL**: `https://your-service-name.onrender.com`

### Deploy Database on Render

1. **Create PostgreSQL Database**
   - Free tier available
   - Get `DATABASE_URL`

2. **Update Vercel Environment Variables** with Render URLs

---

## 🎯 Option 3: Netlify + Railway

If you prefer Netlify for frontend:

### Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   netlify login
   netlify deploy --prod
   ```

3. **Configure Build Settings**
   - Build command: `bun run build`
   - Publish directory: `.next`

4. **Add Environment Variables** in Netlify Dashboard

---

## 🎯 Option 4: Self-Hosting with ngrok (For Testing/Local Use)

If you want to test the webapp from anywhere while keeping it local:

### Step 1: Install ngrok

```bash
# For Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin

# Sign up at ngrok.com and get your authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 2: Expose Your Application

```bash
# Terminal 1: Expose Next.js (port 3000)
ngrok http 3000

# Terminal 2: Expose WebSocket (port 3003)
ngrok http 3003
```

### Step 3: Access Your App

Use the ngrok URLs provided:
- Frontend: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
- WebSocket: Update `NEXT_PUBLIC_WEBSOCKET_URL` in your app

**Note:** Free ngrok URLs change each time. For persistent URLs, upgrade to paid plan.

---

## ⚙️ Post-Deployment Configuration

### 1. Database Seeding (Initial Users)

Deploy default users to production database:

```bash
# Create seed script: prisma/seed.ts
import { db } from '@/lib/db';

async function seed() {
  await db.user.upsert({
    where: { code: '1526' },
    update: {},
    create: {
      code: '1526',
      name: 'Patrol Unit 1',
      role: 'PATROL',
      isActive: true,
      latitude: 0,
      longitude: 0,
    },
  });

  await db.user.upsert({
    where: { code: '8993' },
    update: {},
    create: {
      code: '8993',
      name: 'HQ Command Center',
      role: 'HQ',
      isActive: true,
      latitude: 0,
      longitude: 0,
    },
  });

  console.log('✅ Seeding complete');
}

seed();
```

Run seed:
```bash
export DATABASE_URL="postgresql://your-db-url"
bun run prisma/seed.ts
```

### 2. Set Up Monitoring

**Vercel Analytics** (Free):
- Enable in Vercel Dashboard
- Track page views, performance

**Railway Metrics** (Free):
- View CPU, memory usage
- Monitor WebSocket connections

### 3. Set Up Error Tracking

**Sentry** (Free tier available):
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### 4. Configure SSL (Auto-Managed)

- ✅ Vercel: Automatic SSL certificates
- ✅ Railway: Automatic SSL certificates
- ✅ No manual configuration needed

### 5. Update WebSocket Connection for Production

Edit `src/app/page.tsx`:

```typescript
'use client';

// Add this near the top
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Update socket initialization
const socket = io(IS_PRODUCTION ? WEBSOCKET_URL : '/', {
  path: '/',
  transports: ['websocket', 'polling'],
  secure: IS_PRODUCTION, // Use wss:// in production
  forceNew: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

---

## 🔧 Troubleshooting

### Issue 1: WebSocket Connection Fails

**Symptoms:**
- Map not updating in real-time
- SOS alerts not received

**Solutions:**
1. Check Railway/Render logs for WebSocket service
2. Verify `NEXT_PUBLIC_WEBSOCKET_URL` is correct in Vercel
3. Ensure WebSocket service is running (green in dashboard)
4. Check if ports are open (Railway auto-handles this)

### Issue 2: Database Connection Errors

**Symptoms:**
- Cannot login/register
- Data not persisting

**Solutions:**
1. Verify `DATABASE_URL` in Vercel Environment Variables
2. Check if PostgreSQL service is running in Railway
3. Test database connection:
   ```bash
   psql $DATABASE_URL
   ```
4. Ensure Prisma schema matches database

### Issue 3: Build Fails on Vercel

**Symptoms:**
- Deployment fails
- Build errors in logs

**Solutions:**
1. Check Vercel build logs
2. Ensure `package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "build": "next build",
       "dev": "next dev --turbopack"
     }
   }
   ```
3. Verify all dependencies are in `package.json`
4. Check TypeScript errors locally: `bun run build`

### Issue 4: 85% Transparency Not Visible

**Symptoms:**
- Background images not showing
- UI appears solid

**Solutions:**
1. Verify background images are in `/public/images/dashboard-backgrounds/`
2. Check build output includes images
3. Clear browser cache
4. Verify image paths in code

### Issue 5: Video/Audio Calls Not Working

**Symptoms:**
- Call button does nothing
- No audio/video

**Solutions:**
1. Check browser console for WebRTC errors
2. Ensure HTTPS is enabled (required for WebRTC)
3. Verify STUN/TURN servers if needed
4. Check firewall settings on Railway/Render

### Issue 6: Free Tier Limits Reached

**Symptoms:**
- App becomes slow
- Service stops responding

**Railway Free Limits:**
- $5 credit/month
- 512MB RAM per service
- Sleeps after 30min inactivity

**Solutions:**
1. Monitor usage in Railway dashboard
2. Implement wake-up endpoint to prevent sleep
3. Consider upgrading if needed ($5/month)

**Vercel Free Limits:**
- 100GB bandwidth/month
- 6000 minutes build time/month
- Unlimited deployments

---

## 📊 Cost Breakdown (100% Free)

| Service | Free Tier Limit | Typical Usage | Cost |
|---------|----------------|---------------|------|
| **Vercel** (Frontend) | 100GB bandwidth | ~5-10GB/month | **$0** |
| **Railway** (WebSocket) | $5 credit/month | ~$2-3/month | **$0** |
| **Railway** (PostgreSQL) | 1GB storage | ~500MB | **$0** |
| **Total** | | | **$0/month** |

**Cost becomes $0/month** for typical military patrol usage:
- 10-50 active users
- Moderate WebSocket traffic
- Small database size

---

## 🚀 Quick Start Command Summary

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod --yes

# 3. Deploy WebSocket to Railway
# (Use Railway UI - follow Step 3 above)

# 4. Deploy Database to Railway
# (Use Railway UI - follow Step 4 above)

# 5. Update environment variables
# (In Vercel Dashboard)

# 6. Redeploy
vercel --prod
```

---

## 📝 Environment Variables Checklist

Copy this checklist and fill in your values:

```bash
# Vercel Environment Variables
NEXT_PUBLIC_WEBSOCKET_URL=https://your-app-name.up.railway.app
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production

# Railway WebSocket Service
PORT=3003
NODE_ENV=production

# Railway Database
# (Auto-configured by Railway)
```

---

## 🔐 Security Best Practices for Production

1. **Enable Environment Variable Protection**
   - Mark sensitive variables as "Protected" in Vercel

2. **Use Strong Database Passwords**
   - Railway auto-generates strong passwords
   - Never commit passwords to Git

3. **Enable HTTPS Everywhere**
   - Vercel and Railway auto-enable HTTPS
   - Never use HTTP in production

4. **Set Up Access Controls**
   - Add authentication to admin routes
   - Rate limit API endpoints

5. **Regular Backups**
   - Railway auto-backs up PostgreSQL
   - Export regular backups manually

6. **Monitor Logs**
   - Check Vercel logs daily
   - Monitor Railway service health

7. **Update Dependencies**
   - Run `npm update` regularly
   - Check for security vulnerabilities: `npm audit`

---

## 🎉 You're All Set!

Your Military Patrol Tracking System is now:
- ✅ Deployed to the web
- ✅ Accessible from anywhere
- ✅ 100% free to operate
- ✅ With SSL certificates
- ✅ Auto-scaling
- ✅ Monitoring enabled

**Access Your App:**
- Frontend: Your Vercel URL
- WebSocket: Your Railway URL (backend)
- Database: Railway PostgreSQL (backend)

**Next Steps:**
1. Share access codes with your team (1526, 8993, etc.)
2. Test all features thoroughly
3. Set up monitoring alerts
4. Train your team on using the system

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Socket.io Docs**: https://socket.io/docs/v4

---

**Last Updated**: 2025
**Version**: 1.0
**Status**: ✅ Production Ready

---

*This guide will help you deploy your Military Patrol Tracking System as a fully functional webapp at zero cost. Follow the steps carefully and your system will be live in under 30 minutes!*
