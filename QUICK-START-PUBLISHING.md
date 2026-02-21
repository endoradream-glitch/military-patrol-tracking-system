# Free Publishing Quick Start
## Military Patrol Tracking System

---

## 🚀 Quickest Way to Deploy (FREE)

### Option 1: Vercel (Recommended) - 5 Minutes

**Step 1:** Install Vercel CLI
```bash
npm install -g vercel
```

**Step 2:** Deploy from project directory
```bash
cd /home/z/my-project
vercel --prod --yes
```

**That's it!** Your app will be live at:
- `https://military-patrol-tracking.vercel.app` (or similar)

---

### Option 2: Netlify - 10 Minutes

**Step 1:** Install Netlify CLI
```bash
npm install -g netlify-cli
```

**Step 2:** Deploy
```bash
cd /home/z/my-project
netlify deploy --prod
```

**Your app will be live at:**
- `https://military-patrol-tracking.netlify.app` (or similar)

---

## 📋 Full Deployment Process

### Step 1: Push Code to GitHub

```bash
cd /home/z/my-project

# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit - Military Patrol Tracking System"

# Create GitHub repository at github.com/new
# Then:
git remote add origin https://github.com/YOUR_USERNAME/military-patrol-tracking.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Platform

**Choose one:**

#### Vercel:
```bash
npm install -g vercel
vercel login
vercel --prod --yes
```

#### Netlify:
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

#### Render:
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect GitHub repository
- Configure settings (see DEPLOY-COMMANDS.md for details)
- Deploy

#### Railway:
- Go to [railway.app](https://railway.app)
- Click "New Project"
- "Deploy from GitHub repo"
- Select repository
- Deploy

---

## 🎯 Recommended Setup

### For Testing (FREE)
**Vercel** - Fastest deployment, best Next.js support

### For Production (Low Cost)
**Render** - $5-7/month with PostgreSQL

### For Full-Stack (FREE)
**Netlify** - Background functions for WebSocket support

---

## 🔧 Configuration

### Environment Variables (Required)

Set these in your platform:

```
DATABASE_URL=file:./db/custom.db
```

### WebSocket URL (If using separate service)

```
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-tracking-service-url
```

---

## 📱 After Deployment

### Your App Will Be Live At:

**Vercel:** `https://military-patrol-tracking.vercel.app`
**Netlify:** `https://military-patrol-tracking.netlify.app`
**Render:** `https://military-patrol-tracking.onrender.com`
**Railway:** `https://military-patrol-tracking.up.railway.app`

### Access Codes (For Testing):
- **Super Admin**: `9248156` / Password: `admin123`
- **HQ**: `8993`
- **Patrol**: `1526`

---

## 📖 More Information

- **Full Publishing Guide**: See [FREE-PUBLISHING-GUIDE.md](FREE-PUBLISHING-GUIDE.md)
- **Deployment Commands**: See [DEPLOY-COMMANDS.md](DEPLOY-COMMANDS.md)
- **Operating Manual**: See [OPERATING-MANUAL.md](OPERATING-MANUAL.md)

---

## 💡 Tips

1. **Choose Vercel for easiest deployment**
2. **GitHub is required** for auto-deploys
3. **Free SSL is automatic** on all platforms
4. **Custom domains cost money** (~$10/year)
5. **All platforms have free tiers** sufficient for testing

---

**Quick Start v1.0**  
February 20, 2025  
Military Patrol Tracking System
