# 🚀 Simple Deployment Guide - Fixed Version

## If Deployment Failed, Follow These Steps

---

## ✅ BEFORE YOU DEPLOY - Pre-checks

### 1. Verify Local Build Works

```bash
cd /home/z/my-project

# Clean and rebuild
rm -rf .next
bun run build
```

**Expected:** Build completes successfully with ✓ Compiled successfully

### 2. Verify Code is Pushed to GitHub

```bash
git status
git log --oneline -3
```

**Expected:** Shows recent commits, no unpushed changes

If you see uncommitted changes:
```bash
git add .
git commit -m "Fix for deployment"
git push origin main
```

---

## 🎯 DEPLOYMENT STEPS (Follow in Order)

### STEP 1: Deploy Database to Railway

1. **Go to railway.app** and sign up/login
2. Click **"New Project"** → **"Provision PostgreSQL"**
3. Wait for it to be ready (green checkmark)
4. Click on the PostgreSQL service
5. Go to **"Variables"** tab
6. Copy the `DATABASE_URL` (starts with `postgresql://`)

### STEP 2: Setup Database Schema

**In your local terminal:**

```bash
# Set DATABASE_URL (replace with your Railway URL)
export DATABASE_URL="postgresql://user:password@host:port/database"

# Generate Prisma Client
bunx prisma generate

# Push schema to Railway database
bunx prisma db push

# Seed initial data
bun run db:seed
```

**Expected output:**
```
🌱 Starting database seed...
✅ HQ created: HQ Command Center
✅ Camp created: Base Camp Alpha
✅ Patrol created: Patrol Unit Alpha
✅ Subscription plans created
✅ Super Admin created: superadmin
🎉 Seeding complete!
```

### STEP 3: Deploy WebSocket Service to Railway

1. **Go to railway.app** dashboard
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `military-patrol-tracking-system` repository
4. **Preferred:** Set **Root Directory** to: `mini-services/tracking-service`
   - If your Railway flow does not support nested roots, deploy from repo root using the root `Dockerfile` + `railway.json` added in this repo.
5. Click **"Deploy Now"**
6. Wait for deployment to complete (green checkmark)

### STEP 4: Configure WebSocket Service

1. Click on the WebSocket service in Railway
2. Go to **"Settings"** → **"Variables"**
3. Add these environment variables:

```
NODE_ENV = production
# Do NOT set PORT on Railway; Railway injects this automatically
```

4. Go to **"Networking"** tab
5. Copy the **Public URL** (e.g., `https://tracking-service-abc123.up.railway.app`)
6. **Save this URL** - you'll need it for STEP 6

### STEP 5: Deploy to Vercel

**Method A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod --yes
```

**Method B: Using Vercel Website**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Click **"Deploy"**

### STEP 6: Configure Vercel Environment Variables (CRITICAL!)

**This is where most deployments fail - don't skip this!**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add these variables one by one:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `DATABASE_URL` | Your Railway PostgreSQL URL from STEP 1 | Production, Preview, Development |
| `NEXT_PUBLIC_WEBSOCKET_URL` | Your Railway WebSocket URL from STEP 4 | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `ALLOWED_ORIGINS` | Your Vercel URL (e.g., `https://your-app.vercel.app`) | Production, Preview, Development |

5. Click **"Save"** after adding each variable
6. **Important:** After adding all variables, go to **"Deployments"** tab
7. Click the three dots (...) on the latest deployment
8. Click **"Redeploy"**

### STEP 7: Update Railway CORS

1. Go back to Railway WebSocket service
2. Go to **"Settings"** → **"Variables"**
3. Add this variable:
   ```
   ALLOWED_ORIGINS = https://your-app.vercel.app
   ```
4. Replace `your-app.vercel.app` with your actual Vercel URL
5. Railway will automatically redeploy

### STEP 8: Keep WebSocket Service Alive

1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Click **"Create cron job"**
4. Configure:
   - **Title:** `Keep WebSocket Alive`
   - **URL:** `https://your-websocket-url.up.railway.app/health`
   - **Execution:** Every 10 minutes
5. Click **"Create"**

---

## ✅ TEST YOUR DEPLOYMENT

### Test 1: Frontend Loads

Open your browser and go to: `https://your-app.vercel.app`

**Expected:** Landing page appears with background image

### Test 2: API Routes Work

```bash
# Test HQ endpoint
curl https://your-app.vercel.app/api/hq/by-code/8993

# Expected: Returns JSON with HQ data
```

### Test 3: WebSocket Health Check

```bash
# Test WebSocket service
curl https://your-websocket-url.up.railway.app/health

# Expected: Returns JSON with "status": "healthy"
```

### Test 4: Database Connection

```bash
# Connect to Railway database
psql $DATABASE_URL -c "SELECT name, code FROM HQ;"

# Expected: Shows HQ Command Center with code 8993
```

### Test 5: Full User Flow

1. Open your Vercel URL in a browser
2. Enter code `8993` (HQ)
3. Click "Access System"
4. **Expected:** HQ Dashboard opens

---

## 🔧 COMMON FIXES FOR DEPLOYMENT FAILURES

### Fix 1: Build Fails - DATABASE_URL Missing

**Problem:** Build fails with "DATABASE_URL is not set"

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `DATABASE_URL` = (your Railway PostgreSQL URL)
3. Select ALL environments (Production, Preview, Development)
4. Click Save
5. Redeploy

### Fix 2: WebSocket Connection Fails

**Problem:** Real-time features don't work

**Solution:**
1. Verify `NEXT_PUBLIC_WEBSOCKET_URL` is set in Vercel
2. Verify `ALLOWED_ORIGINS` includes your Vercel URL
3. Check Railway WebSocket service is running (green)
4. Test: `curl https://your-websocket-url.railway.app/health`

### Fix 3: Database Connection Error

**Problem:** Cannot login or register

**Solution:**
1. Verify `DATABASE_URL` is correct in Vercel
2. Check Railway PostgreSQL is running (green)
3. Test manually: `psql $DATABASE_URL -c "SELECT 1;"`

### Fix 4: CORS Errors

**Problem:** Browser console shows CORS errors

**Solution:**
1. In Railway WebSocket service: Set `ALLOWED_ORIGINS` to your Vercel URL
2. In Vercel: Set `ALLOWED_ORIGINS` to your Vercel URL
3. Redeploy both services

### Fix 5: Local `bun install` returns `403` (then `socket.io` is missing on start)

**Problem:** `bun install` fails with `403`, and `bun run start` then fails with `Cannot find package 'socket.io'`.

**Cause:** Network/proxy policy is blocking package tarball downloads from the default npm registry.

**Solution:**
1. Use your approved registry mirror in the same shell session:
   ```bash
   cd mini-services/tracking-service
   NPM_CONFIG_REGISTRY=https://<your-approved-registry> bun install --no-frozen-lockfile
   bun run start
   ```
2. Verify health locally:
   ```bash
   curl http://127.0.0.1:3003/health
   ```

### Fix 6: Deployment Timeout

**Problem:** Build takes too long and times out

**Solution:**
1. Ensure `.next` is in `.gitignore`
2. Remove unnecessary dependencies
3. Try again (sometimes it's a temporary issue)

---

## 🎯 QUICK DEPLOYMENT CHECKLIST

Before saying "deployment failed", check these:

- [ ] Local build works: `bun run build` ✓
- [ ] Code pushed to GitHub ✓
- [ ] Railway PostgreSQL created and running (green) ✓
- [ ] DATABASE_URL copied from Railway ✓
- [ ] Database schema pushed: `bunx prisma db push` ✓
- [ ] Database seeded: `bun run db:seed` ✓
- [ ] Railway WebSocket service deployed (green) ✓
- [ ] WebSocket URL copied ✓
- [ ] Vercel project created ✓
- [ ] All 4 environment variables added in Vercel ✓
- [ ] Vercel redeployed after adding variables ✓
- [ ] Railway ALLOWED_ORIGINS updated with Vercel URL ✓
- [ ] Cron job created for WebSocket keep-alive ✓

**If ALL items above are checked, deployment should work!**

---

## 📞 STILL HAVING ISSUES?

If deployment still fails after following all steps:

### 1. Check Vercel Build Logs

1. Go to Vercel Dashboard → Your Project
2. Click on the failed deployment
3. Click "Build Logs"
4. Scroll to find the RED error message
5. Copy the exact error

### 2. Common Error Messages and Fixes

**Error:** "Cannot find module '@/lib/db'"
- **Fix:** Ensure file exists at `src/lib/db.ts`

**Error:** "Prisma Client is not generated"
- **Fix:** Run `bunx prisma generate` and push changes

**Error:** "DATABASE_URL is not set"
- **Fix:** Add DATABASE_URL in Vercel Environment Variables

**Error:** "Connection timeout"
- **Fix:** Check Railway service is running, verify DATABASE_URL

---

## 🚀 SUCCESS INDICATORS

Your deployment is successful when:

✅ Frontend loads at your Vercel URL
✅ No 500 errors on API routes
✅ WebSocket health check returns `{"status":"healthy"}`
✅ Database queries work
✅ You can login with code 8993
✅ HQ Dashboard opens successfully

---

## 💡 PRO TIPS

1. **Always add environment variables BEFORE first deployment**
   - This prevents initial build failures

2. **Redeploy after adding environment variables**
   - Vercel doesn't auto-redeploy when you add vars

3. **Use the same Vercel URL in ALLOWED_ORIGINS everywhere**
   - Prevents CORS issues

4. **Set up the cron job immediately after WebSocket deployment**
   - Prevents service from sleeping

5. **Keep Railway DATABASE_URL and WebSocket URL in a safe place**
   - You'll need them for future deployments

---

**Follow this guide exactly and your deployment will succeed! 🚀**
