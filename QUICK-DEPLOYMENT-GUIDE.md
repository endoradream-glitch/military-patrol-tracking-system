# Quick Deployment Guide

## Prerequisites
- Node.js / Bun runtime
- SQLite database support
- Ports 3000 and 3003 available

## Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Database
```bash
bun run db:push
```

### 3. Start Services
```bash
# Start all background services
bun run services:start

# Check service status
bun run services:status
```

### 4. Access Application
- Main URL: http://localhost:3000
- Super Admin Code: `92481526`
- Super Admin Password: `admin123`
- HQ Access Code: `8993`
- Patrol Access Code: `1526`

## Production Deployment

### Build for Production
```bash
bun run build
```

### Start Production Server
```bash
# Start Next.js
bun start

# Start Tracking Service (separate terminal)
cd mini-services/tracking-service
bun start
```

### Using Service Scripts
```bash
# Start all services
bun run services:start

# Stop all services
bun run services:stop

# Restart all services
bun run services:restart

# Check status
bun run services:status
```

## Environment Variables

Create `.env` file:
```env
DATABASE_URL="file:./db/custom.db"
```

## Default Credentials

### Super Admin
- Code: `92481526`
- Password: `admin123`

### HQ Access
- Code: `8993`
- Requires approval by Super Admin

### Patrol Access
- Code: `1526`
- Requires registration

## Troubleshooting

### Services Not Starting
```bash
# Check port availability
lsof -i :3000
lsof -i :3003

# Kill processes if needed
kill -9 <PID>

# Restart services
bun run services:restart
```

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
bun run db:push --force-reset

# Regenerate Prisma Client
bun run db:generate
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
bun run build
```

### Logs
```bash
# Next.js dev logs
tail -f dev.log

# Next.js production logs
tail -f server.log

# Tracking Service logs
tail -f mini-services/tracking-service/tracking-service.log
```

## Service Management

### Start Services Individually
```bash
# Next.js
nohup bun run dev > dev.log 2>&1 &

# Tracking Service
cd mini-services/tracking-service
nohup bun --hot index.ts > tracking-service.log 2>&1 &
```

### Stop Services Individually
```bash
# Find and kill Next.js
lsof -ti :3000 | xargs kill -9

# Find and kill Tracking Service
lsof -ti :3003 | xargs kill -9
```

## File Structure

```
my-project/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   └── page.tsx           # Main application
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── maps/             # Map components
│   │   └── VideoCallPopup.tsx
│   └── lib/
│       └── db.ts             # Database client
├── mini-services/
│   └── tracking-service/      # WebSocket service
│       ├── index.ts
│       └── package.json
├── prisma/
│   └── schema.prisma         # Database schema
├── public/
│   └── images/               # Static assets
│       ├── logo.png
│       └── dashboard-backgrounds/
├── scripts/
│   ├── start-services.sh
│   ├── stop-services.sh
│   ├── restart-services.sh
│   └── check-services.sh
├── db/
│   └── custom.db             # SQLite database
└── package.json
```

## Performance Tips

1. **Enable Turbopack**: Already enabled (default in Next.js 16)
2. **Database Optimization**: Prisma handles this automatically
3. **Static Assets**: Served directly from public folder
4. **WebSocket**: Persistent connections reduce overhead

## Security Checklist

- [ ] Change default Super Admin password
- [ ] Use HTTPS in production
- [ ] Set up CORS policies
- [ ] Implement rate limiting
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity

## Monitoring

### Health Checks
```bash
# Check if services are running
bun run services:status

# Check server response
curl http://localhost:3000
```

### Log Monitoring
```bash
# Watch all logs
tail -f dev.log mini-services/tracking-service/tracking-service.log

# Check for errors
grep -i error dev.log
grep -i error mini-services/tracking-service/tracking-service.log
```

## Support

For issues or questions:
1. Check the logs
2. Review this guide
3. Check DEPLOYABILITY-REPORT.md for detailed information
4. Verify all prerequisites are met
