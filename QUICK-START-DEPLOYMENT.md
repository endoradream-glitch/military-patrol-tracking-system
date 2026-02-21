# ⚡ Quick Start Deployment
## Vercel + Railway - 30 Minutes to Production

---

## 🚀 5-Phase Quick Deployment

### Phase 1: GitHub (5 min)
```bash
cd /home/z/my-project

# Initialize Git (if needed)
git init
git add .
git commit -m "Ready for deployment"

# Create repo at github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/military-patrol-tracking-system.git
git branch -M main
git push -u origin main
```

### Phase 2: Railway Database (10 min)

1. **Create Railway Account** → [railway.app](https://railway.app)
2. **New Project** → **Provision PostgreSQL**
3. **Copy DATABASE_URL** from Variables tab
4. **Push schema:**
```bash
export DATABASE_URL="your-railway-db-url"
bunx prisma generate
bunx prisma db push
bun run db:seed
```

### Phase 3: Railway WebSocket (10 min)

1. **New Project** → **Deploy from GitHub**
2. **Root Directory**: `mini-services/tracking-service`
3. **Add Variables:**
   - `NODE_ENV=production`
   - `PORT=3003`
   - `ALLOWED_ORIGINS=https://your-app.vercel.app`
4. **Copy WebSocket URL** from Networking tab

### Phase 4: Vercel (5 min)

1. **Install CLI:**
```bash
npm install -g vercel
vercel login
```

2. **Create .env.production:**
```bash
DATABASE_URL=postgresql://your-railway-db-url
NEXT_PUBLIC_WEBSOCKET_URL=https://your-websocket.up.railway.app
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app
```

3. **Deploy:**
```bash
vercel --prod --yes
```

4. **Add Environment Variables** in Vercel Dashboard:
   - DATABASE_URL
   - NEXT_PUBLIC_WEBSOCKET_URL
   - NODE_ENV
   - ALLOWED_ORIGINS

5. **Redeploy:**
```bash
vercel --prod
```

### Phase 5: Keep WebSocket Alive (2 min)

1. Go to [cron-job.org](https://cron-job.org)
2. Create cron job:
   - **URL**: `https://your-websocket.up.railway.app/health`
   - **Schedule**: Every 10 minutes

---

## ✅ Verification

```bash
# Test frontend
curl https://your-app.vercel.app

# Test API
curl https://your-app.vercel.app/api/hq/by-code/8993

# Test WebSocket
curl https://your-websocket.up.railway.app/health

# Test database
psql $DATABASE_URL -c "SELECT * FROM Patrol;"
```

---

## 🔑 Access Codes

| Role | Code | Password |
|------|------|----------|
| Patrol | 1526 | - |
| HQ | 8993 | - |
| Super Admin | 92481526 | admin123 |

---

## 💰 Cost

| Service | Monthly Cost |
|---------|--------------|
| Vercel | $0 |
| Railway (WebSocket) | $0 |
| Railway (PostgreSQL) | $0 |
| **Total** | **$0** |

---

## 📚 Full Documentation

- **Complete Guide**: `DEPLOY-NOW-GUIDE.md`
- **Backend Details**: `COMPLETE-BACKEND-DEPLOYMENT-GUIDE.md`
- **Checklist**: `BACKEND-DEPLOYMENT-CHECKLIST.md`
- **Env Template**: `.env.production.example`

---

**You're ready to deploy! 🚀**
