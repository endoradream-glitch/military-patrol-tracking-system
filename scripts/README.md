# Background Services Management

This directory contains scripts for managing the background services of the Military Patrol Tracking System.

## Available Scripts

### services:start
Starts all background services (WebSocket tracking service) with auto-restart capability.

```bash
bun run services:start
```

### services:stop
Stops all running background services gracefully.

```bash
bun run services:stop
```

### services:restart
Restarts all background services.

```bash
bun run services:restart
```

### services:status
Shows the status of all background services including:
- Next.js Dev Server (port 3000)
- Tracking Service/WebSocket (port 3003)
- Log file locations

```bash
bun run services:status
```

## Services

### Next.js Dev Server
- **Port**: 3000
- **Log**: `/home/z/my-project/dev.log`
- **Command**: `bun run dev`
- **Auto-restart**: Managed by Turbopack

### Tracking Service (WebSocket)
- **Port**: 3003
- **Log**: `/home/z/my-project/mini-services/tracking-service/tracking-service.log`
- **Command**: `bun --hot index.ts`
- **Auto-restart**: Enabled with `--hot` flag

## Custom Images

### Dashboard Backgrounds
Dashboard background images are located at:
- `/home/z/my-project/public/images/dashboard-backgrounds/`

Available backgrounds:
- `background-1.png` - Used for Landing Page and Super Admin
- `background-2.png` - Used for Patrol Dashboard and Registration
- `background-3.png` - Used for HQ Dashboard
- `mobile-background.png` - Optimized for mobile devices

### Logo
The default logo is located at:
- `/home/z/my-project/public/images/logo.png`

This logo is used throughout the application:
- Landing page
- Header (when no HQ logo is set)
- Patrol Dashboard
- HQ Dashboard
- Super Admin Dashboard

## Troubleshooting

### Services not starting
1. Check if ports 3000 and 3003 are already in use:
   ```bash
   lsof -i :3000
   lsof -i :3003
   ```

2. Check service logs for errors:
   ```bash
   tail -f /home/z/my-project/dev.log
   tail -f /home/z/my-project/mini-services/tracking-service/tracking-service.log
   ```

3. Restart services:
   ```bash
   bun run services:restart
   ```

### Images not displaying
1. Verify images exist in `/home/z/my-project/public/images/`
2. Check file permissions
3. Clear browser cache and reload

## Auto-Restart Configuration

Both services are configured for automatic restart on file changes:

- **Next.js**: Uses Turbopack's built-in hot module replacement
- **Tracking Service**: Uses Bun's `--hot` flag for auto-restart

This ensures that any code changes are automatically picked up without manual restart.
