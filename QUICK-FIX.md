# ⚡ Quick Fix - Deployment Failed?

## The #1 Reason for Deployment Failure:
**Missing Environment Variables in Vercel**

---

## 🔥 IMMEDIATE FIX (2 minutes)

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click on your project
- Go to: Settings → Environment Variables

### 2. Add These 4 Variables

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `DATABASE_URL` | `postgresql://...` | Railway → PostgreSQL Service → Variables tab |
| `NEXT_PUBLIC_WEBSOCKET_URL` | `https://...railway.app` | Railway → WebSocket Service → Networking tab |
| `NODE_ENV` | `production` | Type manually |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Your Vercel URL |

**IMPORTANT:** Select ALL environments: Production, Preview, Development

### 3. Redeploy

After adding variables:
1. Go to "Deployments" tab
2. Click three dots (...) on latest deployment
3. Click "Redeploy"

---

## ✅ Verify It Works

After redeployment:

```bash
# Test frontend
curl https://your-app.vercel.app

# Test API
curl https://your-app.vercel.app/api/hq/by-code/8993

# Test WebSocket
curl https://your-websocket-url.railway.app/health
```

All should return successful responses.

---

## 🐛 Still Not Working?

### Check #1: Railway Services Running

1. Go to Railway Dashboard
2. Check PostgreSQL service → Must be GREEN
3. Check WebSocket service → Must be GREEN

If not green:
- Click the service
- Click "Restart" button

### Check #2: Correct URLs

**DATABASE_URL should look like:**
```
postgresql://postgres:randomstring@containers-us-west-1.railway.app:5432/railway
```

**NEXT_PUBLIC_WEBSOCKET_URL should look like:**
```
https://your-service-name.up.railway.app
```

**ALLOWED_ORIGINS should be:**
```
https://your-project-name.vercel.app
```

### Check #3: Build Logs

1. Vercel Dashboard → Your Project
2. Click failed deployment
3. Click "Build Logs"
4. Find the RED error message
5. Copy and search for it online, or check SIMPLE-DEPLOY-GUIDE.md

---

## 🎯 Most Common Errors & Solutions

### Error: "DATABASE_URL is not set"
**Fix:** Add DATABASE_URL in Vercel Environment Variables

### Error: "Prisma Client is not generated"
**Fix:**
```bash
bunx prisma generate
git add .
git commit -m "Generate Prisma Client"
git push origin main
```

### Error: "Connection refused"
**Fix:** Check Railway service is running (green)

### Error: "CORS policy blocked"
**Fix:** Add ALLOWED_ORIGINS in both Vercel and Railway

### Error: "Module not found"
**Fix:**
```bash
rm -rf node_modules .next
bun install
bun run build
git add .
git commit -m "Fix dependencies"
git push origin main
```

---

## 📞 Need More Help?

1. Check `SIMPLE-DEPLOY-GUIDE.md` for detailed steps
2. Check `DEPLOYMENT-TROUBLESHOOTING.md` for more issues
3. Copy the exact error message from Vercel build logs

---

**80% of deployment failures are fixed by just adding the environment variables!**
