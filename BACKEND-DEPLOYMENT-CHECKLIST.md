# ✅ Backend Deployment Checklist
## Military Patrol Tracking System - All Backend Components

Use this checklist to ensure **EVERY** backend component is deployed and operational.

---

## 📋 Backend Components to Deploy

### 1. Next.js API Routes (15 endpoints)
Location: `/src/app/api/`

**Authentication APIs:**
- [ ] `/api/admin/login` - Super Admin authentication
- [ ] `/api/patrol/register` - Patrol registration

**Patrol Management APIs:**
- [ ] `/api/patrol/start` - Start patrol session
- [ ] `/api/patrol/location` - GPS location updates
- [ ] `/api/patrol/location/sync` - Offline location sync
- [ ] `/api/patrol/sos` (POST) - Create SOS alert
- [ ] `/api/patrol/sos` (GET) - Retrieve active SOS alerts

**HQ Management APIs:**
- [ ] `/api/hq/patrols` - Get HQ patrols
- [ ] `/api/hq/by-code/[code]` - Get HQ by code
- [ ] `/api/hq/sos` - HQ SOS management

**Super Admin APIs:**
- [ ] `/api/admin/hq` - HQ CRUD operations
- [ ] `/api/admin/hq/[id]` - Get HQ by ID
- [ ] `/api/admin/hq/[id]/logo` - Upload HQ logo
- [ ] `/api/admin/hq/[id]/subscription` - Subscription management
- [ ] `/api/admin/subscriptions/plans` - Get subscription plans

### 2. WebSocket Service (Port 3003)
Location: `/mini-services/tracking-service/index.ts`

**Real-time Features:**
- [ ] HQ dashboard connection (`hq:connect`)
- [ ] Patrol connection (`patrol:connect`)
- [ ] GPS location updates (`patrol:location`)
- [ ] Start/stop patrol (`patrol:start`, `patrol:stop`)
- [ ] SOS alerts (`patrol:sos`)
- [ ] WebRTC video/audio signaling (`webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`)
- [ ] Offline buffer sync (`patrol:sync:buffered`)
- [ ] Call management (`hq:call:patrol`, `call:ended`)

### 3. Database (Prisma ORM)
Location: `prisma/schema.prisma`

**Data Models:**
- [ ] Camp - Permanent locations
- [ ] Patrol - Patrol commanders
- [ ] PatrolSession - Daily sessions
- [ ] LocationHistory - GPS tracking history
- [ ] BufferedLocation - Offline buffer
- [ ] SOSAlert - Emergency alerts
- [ ] HQ - HQ/Agency management
- [ ] SubscriptionPlan - Subscription tiers
- [ ] Subscription - User subscriptions
- [ ] SuperAdmin - System administrators

---

## 🚀 Deployment Steps

### Phase 1: Database (Railway)
- [ ] Create Railway account
- [ ] Provision PostgreSQL database
- [ ] Copy DATABASE_URL
- [ ] Update schema to PostgreSQL
- [ ] Run `prisma generate`
- [ ] Run `prisma db push`
- [ ] Run seed script
- [ ] Verify data in database

### Phase 2: WebSocket Service (Railway)
- [ ] Create Railway project
- [ ] Deploy from GitHub
- [ ] Set root directory to `mini-services/tracking-service`
- [ ] Configure environment variables (PORT=3003, NODE_ENV=production)
- [ ] Copy WebSocket URL
- [ ] Update CORS settings
- [ ] Add health check endpoint
- [ ] Set up keep-alive cron job
- [ ] Test WebSocket connection

### Phase 3: Frontend + API Routes (Vercel)
- [ ] Install Vercel CLI
- [ ] Login to Vercel
- [ ] Create `.env.production` file
- [ ] Deploy with `vercel --prod`
- [ ] Add environment variables in Vercel dashboard:
  - [ ] DATABASE_URL
  - [ ] NEXT_PUBLIC_WEBSOCKET_URL
  - [ ] NODE_ENV
- [ ] Redeploy with new variables
- [ ] Verify API routes are accessible

### Phase 4: Configuration
- [ ] Update WebSocket CORS to allow Vercel domain
- [ ] Update frontend WebSocket connection to use Railway URL
- [ ] Remove XTransformPort in production
- [ ] Test all API endpoints
- [ ] Test all WebSocket events
- [ ] Test database operations

---

## 🧪 Testing Checklist

### API Routes Testing
```bash
# Test Admin Login
curl -X POST https://your-app.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"code":"92481526","password":"admin123"}'

# Test HQ by Code
curl https://your-app.vercel.app/api/hq/by-code/8993

# Test Patrol Registration
curl -X POST https://your-app.vercel.app/api/patrol/register \
  -H "Content-Type: application/json" \
  -d '{"code":"1526","name":"Test Patrol","campId":"camp-1",...}'

# Test Get Active SOS Alerts
curl https://your-app.vercel.app/api/patrol/sos
```

### WebSocket Testing
- [ ] Connect to WebSocket from browser console
- [ ] Send `hq:connect` event
- [ ] Send `patrol:connect` event
- [ ] Send `patrol:location` event
- [ ] Verify location updates in real-time
- [ ] Trigger SOS alert
- [ ] Verify SOS broadcast to all clients
- [ ] Test WebRTC signaling

### Database Testing
- [ ] Connect to Railway PostgreSQL
- [ ] Query patrols table
- [ ] Query hq table
- [ ] Query sOSAlerts table
- [ ] Verify data integrity

---

## 🔍 Verification Commands

```bash
# Check Vercel deployment
vercel list

# Check Vercel logs
vercel logs

# Check Railway services (via Railway dashboard)
# - View logs
# - Check service status (green = running)
# - Monitor resource usage

# Test database connection
psql $DATABASE_URL -c "SELECT * FROM Patrol LIMIT 5;"

# Test WebSocket service
curl https://your-websocket-url.railway.app/health
# Should return: {"status":"healthy","timestamp":"..."}
```

---

## ⚠️ Common Issues and Solutions

### Issue: WebSocket Connection Fails
**Symptoms**: Map not updating, SOS not received
**Solutions**:
- [ ] Check Railway service is running
- [ ] Verify NEXT_PUBLIC_WEBSOCKET_URL in Vercel
- [ ] Check CORS settings allow Vercel domain
- [ ] Verify WebSocket service health endpoint

### Issue: API Routes Return 500 Error
**Symptoms**: Any API call fails
**Solutions**:
- [ ] Check Vercel deployment logs
- [ ] Verify DATABASE_URL is correct
- [ ] Check database connection
- [ ] Verify Prisma client generated

### Issue: Database Connection Error
**Symptoms**: Cannot login/register
**Solutions**:
- [ ] Verify DATABASE_URL in Vercel
- [ ] Check PostgreSQL service in Railway
- [ ] Test connection manually
- [ ] Ensure schema matches database

### Issue: WebRTC Calls Not Working
**Symptoms**: Video/audio call fails
**Solutions**:
- [ ] Ensure HTTPS is enabled (automatic on Vercel)
- [ ] Check WebSocket signaling logs
- [ ] Verify STUN servers are accessible
- [ ] Check browser console for WebRTC errors

### Issue: Railway Service Sleeps
**Symptoms**: Service stops responding after 30 min
**Solutions**:
- [ ] Set up cron job to ping health endpoint
- [ ] Use cron-job.org (free)
- [ ] Ping every 10 minutes: `https://your-service.railway.app/health`

---

## 📊 Service Status Dashboard

After deployment, create a status dashboard:

| Component | Platform | Status | URL | Cost |
|-----------|----------|--------|-----|------|
| Frontend | Vercel | ☐ Running | https://... | Free |
| API Routes | Vercel | ☐ Running | https://.../api | Free |
| WebSocket | Railway | ☐ Running | https://... | Free |
| Database | Railway | ☐ Running | postgresql://... | Free |

Fill in the actual URLs and check off ☑ when operational.

---

## 🎯 Success Criteria

Your backend is fully operational when:

- [ ] All 15 API routes respond correctly (200 OK)
- [ ] WebSocket connects successfully
- [ ] GPS updates appear in real-time on map
- [ ] SOS alerts broadcast instantly
- [ ] Video/audio calls can be established
- [ ] Patrol registration works
- [ ] HQ management works
- [ ] Subscription management works
- [ ] File uploads (logos) work
- [ ] Offline sync works
- [ ] Database operations work
- [ ] No errors in logs
- [ ] All services show "running" status

---

## 📞 Quick Reference URLs

After deployment, fill in these:

```
Frontend URL:          https://your-app.vercel.app
API Base URL:         https://your-app.vercel.app/api
WebSocket URL:        wss://your-service.up.railway.app
Database URL:         postgresql://... (from Railway)
Railway Dashboard:    https://railway.app/project/...
Vercel Dashboard:     https://vercel.com/dashboard/...
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Changed default super admin password
- [ ] Changed default access codes (1526, 8993, 92481526)
- [ ] All secrets in environment variables
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Database backups enabled
- [ ] Log monitoring set up
- [ ] Dependencies are up to date
- [ ] Private GitHub repository

---

## 🚀 Deployment Timeline

**Estimated Time**: 45-60 minutes

- Phase 1 (Database): 15 minutes
- Phase 2 (WebSocket): 15 minutes
- Phase 3 (Frontend+API): 10 minutes
- Phase 4 (Configuration): 10 minutes
- Testing: 10-20 minutes

---

**Last Updated**: 2025
**Version**: 1.0
**Status**: Ready for Deployment

---

*Use this checklist to ensure NO backend functionality is excluded!*
