# Military Patrol Tracking System
## Complete Operating Manual

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [User Roles & Access](#user-roles--access)
4. [Super Admin Operations](#super-admin-operations)
5. [HQ Operations](#hq-operations)
6. [Patrol Commander Operations](#patrol-commander-operations)
7. [Features Guide](#features-guide)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [UI & Visual Features](#ui--visual-features)
11. [Support & Contact](#support--contact)

---

## System Overview

### What is the Military Patrol Tracking System?

The Military Patrol Tracking System is a comprehensive real-time monitoring and coordination platform designed for military patrol operations. It provides:

- **Real-time GPS Tracking**: Live location updates every 3 seconds
- **SOS Emergency System**: Instant alerts with automatic routing
- **Video/Audio Calling**: Built-in WebRTC communication
- **Multi-tenant Architecture**: Support for multiple HQs
- **Subscription Management**: Flexible access control
- **Offline Support**: GPS buffering when network drops
- **Mobile Responsive**: Works on all devices
- **85% Transparent UI**: Glass-morphism design for better visibility
- **Custom Background Images**: Military-themed backgrounds per dashboard
- **Transparent Logo**: Clean, professional logo display

### Key Features

| Feature | Description |
|---------|-------------|
| **Live Tracking** | Real-time GPS location of all patrols |
| **SOS Alerts** | Instant emergency notifications |
| **Video/Audio Calls** | Direct communication between HQ and patrols |
| **Trail History** | Complete patrol movement history |
| **Heat Maps** | Visual patrol density indicators |
| **Multi-HQ Support** | Separate management for different units |
| **Subscription Plans** | 4 tiers with different feature sets |
| **Transparent UI** | 85% glass-morphism design with text shadows |
| **Custom Backgrounds** | Military-themed images for each dashboard |
| **Transparent Logo** | Professional branding with transparent background |

---

## Getting Started

### System Requirements

#### For Deployment:
- **Server**: Linux/Unix or Windows Server
- **Runtime**: Bun or Node.js 18+
- **Memory**: Minimum 2GB RAM
- **Storage**: 1GB free space
- **Ports**: 3000 (HTTP), 3003 (WebSocket)

#### For Users:
- **Device**: Any modern web browser
- **Internet**: Stable connection for real-time features
- **GPS**: Required for patrol tracking
- **Camera/Microphone**: Required for video/audio calls

### Initial Setup

#### 1. Start the System

```bash
# Navigate to project directory
cd /home/z/my-project

# Start all services
bun run services:start

# Verify services are running
bun run services:status
```

#### 2. Access the Application

- **URL**: `http://localhost:3000` (or your server's IP)
- **Landing Page**: Enter access code to proceed

#### 3. Default Access Codes

| Role | Access Code | Password |
|------|-------------|----------|
| Super Admin | `92481526` | `admin123` |
| HQ | `8993` | - |
| Patrol | `1526` | - |

---

## User Roles & Access

### Role Hierarchy

```
Super Admin (Level 1)
    ↓
HQ Commander (Level 2)
    ↓
Patrol Commander (Level 3)
```

### Role Permissions

| Permission | Super Admin | HQ | Patrol |
|------------|-------------|-----|---------|
| Manage HQs | ✅ | ❌ | ❌ |
| Approve HQs | ✅ | ❌ | ❌ |
| Manage Subscriptions | ✅ | ❌ | ❌ |
| View All Patrols | ✅ | ✅ | ❌ |
| Manage Own Patrols | ✅ | ✅ | ✅ |
| Start/Stop Patrol | ❌ | ❌ | ✅ |
| Send SOS Alerts | ❌ | ❌ | ✅ |
| Make Calls | ✅ | ✅ | ✅ |
| Upload HQ Logo | ✅ | ❌ | ❌ |

---

## Super Admin Operations

### Accessing Super Admin Dashboard

1. Go to the application URL
2. Enter code: `92481526`
3. Enter password: `admin123`
4. Click "Access Dashboard"

### Dashboard Overview

The Super Admin dashboard provides:

- **Statistics**: Total HQs, Active HQs, Pending Approvals
- **HQ Management**: Create, approve, deactivate HQs
- **Subscription Plans**: View and manage subscription tiers

### Creating a New HQ

1. Navigate to "HQ Management" tab
2. Click "Register New HQ"
3. Fill in the form:
   - **Name**: Internal identifier (e.g., "10 Div", "65 BDE")
   - **Display Name**: User-friendly name (e.g., "10th Division")
   - **Code**: Unique access code (e.g., "8994")
   - **Description**: Optional details
4. Click "Register HQ"

### Approving HQs

1. In HQ Management tab, find pending HQs
2. Click "Approve" on the desired HQ
3. Confirm the approval
4. The HQ is now active

### Uploading HQ Logo

1. Click the "Upload Logo" button on an HQ card
2. Select PNG file (max 2MB)
3. Click "Upload"
4. Logo will appear in HQ dashboard

### Managing Subscriptions

1. Navigate to "Subscription Plans" tab
2. View all available plans:
   - **72 hours-Pro Use**: FREE, 3 days
   - **Lets Walk**: $25/30 days, limited features
   - **Start Jogging**: $35/30 days, medium features
   - **Sprint**: $56/30 days, full features

3. To activate a subscription for an HQ:
   - Go to HQ Management
   - Find the HQ
   - Click "Activate Subscription"
   - Select a plan
   - Set duration
   - Click "Activate"

### Deactivating an HQ

1. In HQ Management, find the HQ
2. Click "Deactivate"
3. Confirm the action
4. HQ can no longer access the system

---

## HQ Operations

### Accessing HQ Dashboard

1. Go to the application URL
2. Enter HQ access code (e.g., `8993`)
3. Click "Access Dashboard"

### Dashboard Overview

The HQ dashboard displays:

- **Live Map**: Real-time patrol locations
- **Patrol List**: All registered patrols
- **SOS Alerts**: Active emergency notifications
- **Statistics**: Patrolling count, total patrols, SOS count, camps

### Viewing Patrol Locations

1. Patrols appear on the map as markers
2. Click a marker to see patrol details:
   - Patrol name
   - Unit
   - Status (idle, patrolling, SOS)
   - Last location update

### Managing Patrols

#### View Patrol List

1. Click "📋 Show Panel" button
2. View all registered patrols
3. Filter by status or search by name

#### Call a Patrol

**Audio Call:**
1. Find the patrol in the list or click on map marker
2. Click the phone icon
3. Wait for patrol to answer

**Video Call:**
1. Find the patrol or click map marker
2. Click the video camera icon
3. Wait for patrol to answer

### Responding to SOS Alerts

1. SOS alerts appear in the SOS panel
2. Click "Show SOS" to view all alerts
3. Click on an alert to see details:
   - Patrol name
   - Location (on map)
   - Time of alert
   - Message
4. Click "Resolve" when the situation is handled

### Map Controls

- **🔥 Heatmap**: Toggle patrol density visualization
- **〰️ Trails**: Toggle patrol movement trails
- **🏕️ Camps**: Toggle camp location markers
- **🔄 Refresh**: Manually refresh data

### Checking Subscription Status

Your subscription status is displayed:
- **Active**: Normal operation
- **Expiring Soon**: Warning displayed (3 days before expiry)
- **Expired**: System access blocked

---

## Patrol Commander Operations

### Accessing Patrol Dashboard

1. Go to the application URL
2. Enter patrol access code: `1526`
3. Click "Access Dashboard"

### Registering as a Patrol Commander

1. After entering code `1526`, you'll see registration form
2. Fill in:
   - **Camp Name**: Your base location
   - **Unit**: Your unit designation
   - **Name/Callsign**: Your identifier
   - **Strength**: Number of personnel in your patrol
3. Click "Register"
4. Your patrol dashboard will open

### Dashboard Overview

The Patrol dashboard displays:

- **Live Map**: Your current GPS location
- **Patrol Info**: Name, unit, camp, strength
- **Status Indicators**: Online/Offline, patrolling status
- **Quick Stats**: Unit, Camp, Strength
- **Action Buttons**: Start/Stop patrol, SOS, Call HQ

### Starting a Patrol

1. Click the green "Start Patrol" button
2. Your GPS will begin tracking every 3 seconds
3. Status changes to "Patrolling"
4. HQ will see your real-time location

### Stopping a Patrol

1. Click the red "Stop Patrol" button
2. GPS tracking stops
3. Status changes to "Idle"
4. Final location is saved

### Sending an SOS Alert

⚠️ **Use only for genuine emergencies!**

1. Ensure your GPS is active (must be patrolling)
2. Click the red SOS button (triangle icon)
3. Confirm the SOS
4. HQ and nearby patrols are immediately notified
5. Your exact location is shared

### Calling HQ

**Audio Call:**
1. Click the phone icon
2. Wait for HQ to answer
3. Speak using your device microphone

**Video Call:**
1. Click the video camera icon
2. Wait for HQ to answer
3. Allow camera/microphone access when prompted

### During a Call

- **Mute/Unmute**: Toggle microphone
- **On/Off Video**: Toggle camera
- **End Call**: Hang up
- **View Duration**: See call time

### Viewing Your Location

Your location appears as:
- **Blue Marker**: Your current position
- **Trail Line**: Path you've taken (when patrolling)

---

## Features Guide

### Real-Time GPS Tracking

**How it Works:**
- GPS coordinates are sent every 3 seconds
- Location is displayed on HQ dashboard map
- Complete trail history is maintained
- Works both online and offline

**Best Practices:**
- Ensure device GPS is enabled
- Keep location services on
- Maintain internet connection for real-time updates
- Offline mode buffers locations and syncs when reconnected

### SOS Emergency System

**When to Use:**
- Medical emergencies
- Security threats
- Lost or disoriented
- Equipment failure
- Any situation requiring immediate assistance

**What Happens:**
1. SOS is sent to HQ
2. Nearby patrols are notified
3. Your exact GPS location is shared
4. HQ can call you immediately
5. Alert stays active until resolved

**Important:**
- Only use for genuine emergencies
- Misuse may result in account suspension
- Provide accurate information when possible

### Video/Audio Calling

**Requirements:**
- Stable internet connection
- Camera/microphone permissions enabled
- Compatible device

**Making Calls:**
- HQ can initiate calls to patrols
- Patrols can initiate calls to HQ
- Both audio-only and video calls supported

**Call Features:**
- Mute/unmute microphone
- Turn camera on/off
- See call duration
- Picture-in-picture self-view (video calls)

### Offline Support

**How it Works:**
- GPS locations are stored locally when offline
- Locations sync automatically when connection restored
- No data loss during network outages
- Indicators show online/offline status

**Offline Indicator:**
- 🟢 Green: Online
- 🔴 Red: Offline

### Map Features

**Trail Visualization:**
- Shows patrol movement history
- Color-coded by patrol
- Toggle on/off with "Trails" button

**Heatmap:**
- Displays patrol density
- Red areas = high patrol activity
- Toggle with "Heatmap" button

**Camp Markers:**
- Shows permanent camp locations
- Toggle with "Camps" button

---

## Troubleshooting

### Common Issues

#### Issue: Cannot connect to the system

**Possible Causes:**
- Server is down
- Incorrect access code
- Network connection issues

**Solutions:**
1. Check if you're using the correct code
2. Verify internet connection
3. Contact your system administrator
4. Try refreshing the page

#### Issue: GPS not tracking

**Possible Causes:**
- Location services disabled
- GPS permission denied
- Device in airplane mode

**Solutions:**
1. Enable location services in device settings
2. Grant GPS permission to the browser
3. Turn off airplane mode
4. Restart the browser

#### Issue: Video call not working

**Possible Causes:**
- Camera/microphone permission denied
- Poor internet connection
- Firewall blocking WebRTC

**Solutions:**
1. Allow camera/microphone access in browser
2. Check internet speed (min 1 Mbps recommended)
3. Try a different browser (Chrome, Firefox, Safari)
4. Contact IT if behind a corporate firewall

#### Issue: SOS not sending

**Possible Causes:**
- Not patrolling (GPS not active)
- No current GPS location
- Network connection lost

**Solutions:**
1. Start patrol first (green button)
2. Wait for GPS to lock (shows location on map)
3. Ensure internet connection
4. Try again after a few seconds

#### Issue: Map not loading

**Possible Causes:**
- No internet connection
- Map service error
- Browser compatibility issue

**Solutions:**
1. Check internet connection
2. Refresh the page
3. Clear browser cache
4. Try a different browser

#### Issue: Background images not visible

**Possible Causes:**
- Image files not loaded
- Browser caching issue
- Network error

**Solutions:**
1. Refresh the page (Ctrl+F5)
2. Clear browser cache
3. Check internet connection
4. Contact administrator

### Error Messages

#### "Invalid access code"
- Double-check the code you entered
- Ensure no extra spaces
- Contact your administrator for correct code

#### "HQ account is pending approval"
- Your HQ is waiting for Super Admin approval
- Contact your administrator
- Wait for approval notification

#### "Your subscription has expired"
- Contact your administrator
- Subscription renewal required
- System access is blocked until renewed

#### "No active GPS location"
- Ensure you've started patrolling
- Wait for GPS to acquire signal
- Check location services are enabled

---

## Best Practices

### For Patrol Commanders

#### Before Patrol
1. **Charge your device** - Ensure sufficient battery
2. **Enable GPS** - Turn on location services
3. **Test connection** - Verify internet is working
4. **Start patrol** - Begin tracking before leaving

#### During Patrol
1. **Maintain connection** - Keep device connected
2. **Monitor status** - Check online/offline indicator
3. **Report regularly** - Use calls for updates
4. **Use SOS wisely** - Only for true emergencies

#### After Patrol
1. **Stop patrol** - Click the red button
2. **Review trail** - Check your movement history
3. **Report in** - Call HQ for debrief
4. **Charge device** - Prepare for next patrol

### For HQ Commanders

#### Monitoring
1. **Check regularly** - Monitor patrol status frequently
2. **Respond quickly** - Answer calls and SOS alerts promptly
3. **Track patterns** - Review patrol trails for optimization
4. **Maintain contact** - Regular check-ins with patrols

#### Emergency Response
1. **Act fast** - SOS alerts require immediate attention
2. **Communicate** - Call the patrol immediately
3. **Coordinate** - Alert nearby patrols if needed
4. **Document** - Keep records of all emergencies

### For Super Admins

#### Management
1. **Approve quickly** - Don't leave HQs pending
2. **Monitor subscriptions** - Warn before expiry
3. **Maintain security** - Change passwords regularly
4. **Review logs** - Check for unusual activity

#### System Health
1. **Monitor services** - Ensure all services running
2. **Backup database** - Regular backups of patrol data
3. **Update system** - Apply updates during low-activity periods
4. **Test features** - Regular testing of all functionality

---

## Security Guidelines

### Password Security

**For Super Admins:**
- Change default password immediately
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Never share passwords
- Change passwords every 90 days

### Access Control

- Never share access codes with unauthorized personnel
- Report lost or stolen devices immediately
- Log out after each session
- Use secure networks only (avoid public Wi-Fi)

### Data Protection

- The system tracks your location - use responsibly
- Don't share sensitive patrol information
- Report any suspicious activity
- Follow your organization's data policies

---

## Maintenance

### Regular Tasks

#### Daily
- Monitor service status
- Check for SOS alerts
- Review new patrol registrations

#### Weekly
- Review patrol activity logs
- Check subscription expirations
- Update system if needed

#### Monthly
- Backup database
- Review all HQ accounts
- Audit access permissions
- Update documentation

### Service Management

#### Starting Services
```bash
bun run services:start
```

#### Stopping Services
```bash
bun run services:stop
```

#### Restarting Services
```bash
bun run services:restart
```

#### Checking Status
```bash
bun run services:status
```

---

## Default Credentials

### Important: Change These After First Login!

| Role | Access Code | Password | Action Required |
|------|-------------|----------|-----------------|
| Super Admin | `92481526` | `admin123` | CHANGE IMMEDIATELY |
| HQ Demo | `8993` | - | Create new HQs |
| Patrol Demo | `1526` | - | For testing only |

---

## Support & Contact

---

## UI & Visual Features

### Overview

The Military Patrol Tracking System features a modern, transparent interface design with military-themed background imagery. This section explains the visual elements and how to customize them.

### Transparent UI Design (85% Glass-Morphism)

**What It Is:**
- All interface elements are 85% transparent
- Creates a glass-like effect that reveals background images
- Text shadows ensure excellent readability
- Professional military aesthetic

**Benefits:**
- Background images remain visible through the interface
- Modern, sleek appearance
- Excellent text contrast with drop shadows
- Reduces visual fatigue in low-light operations

**Where Transparency is Applied:**
- **Cards & Panels**: 85% opacity with backdrop blur
- **Buttons**: Semi-transparent with hover effects
- **Input Fields**: Transparent backgrounds with visible borders
- **Modals & Dialogs**: Glass-morphism effect
- **Navigation**: Transparent with active indicators

### Dashboard Backgrounds

The system uses different background images for each view:

| View | Background Image | Description |
|------|------------------|-------------|
| **Landing Page** | `background-1.png` | Welcome screen background |
| **Super Admin** | `background-1.png` | Admin dashboard background |
| **Patrol Dashboard** | `background-2.png` | Patrol operations background |
| **HQ Dashboard** | `background-3.png` | Command center background |
| **Mobile View** | `mobile-background.png` | Optimized for mobile devices |

**Background Image Locations:**
- Directory: `/public/images/dashboard-backgrounds/`
- Format: PNG
- Sizes: 2.6 - 3.1 MB per image
- Total: ~14 MB

### Logo

**Current Logo:**
- File: `/public/images/logo.png`
- Format: PNG with transparent background
- Size: 2.5 MB
- Features: Clean, professional military branding

**Logo Display:**
- Transparent background (no white box)
- Drop shadow for visibility
- Responsive sizing (mobile: 32px, desktop: 40px)
- Appears on all dashboards and landing page

### Customizing Background Images

**To Change Background Images:**

1. **Prepare New Images:**
   - Format: PNG or JPG
   - Recommended resolution: 1920x1080 or higher
   - Size: Keep under 5 MB each for performance

2. **Upload to Server:**
   ```bash
   # Navigate to project directory
   cd /home/z/my-project

   # Copy your new background to the appropriate location
   cp /path/to/your-image.png public/images/dashboard-backgrounds/background-X.png
   ```

3. **Replace Background Files:**
   - `background-1.png`: Landing & Super Admin
   - `background-2.png`: Patrol Dashboard
   - `background-3.png`: HQ Dashboard
   - `mobile-background.png`: Mobile devices

4. **Clear Browser Cache:**
   - Press `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear cache in browser settings

**Recommended Background Styles:**
- Military-themed imagery
- Darker tones for better text contrast
- Subtle patterns (don't distract from interface)
- Professional, operation-focused imagery

### Customizing the Logo

**To Replace the Logo:**

1. **Prepare Logo:**
   - Format: PNG with transparency (recommended)
   - Recommended size: 200x200 to 400x400 pixels
   - Transparent background (no solid color)
   - Keep under 5 MB

2. **Upload to Server:**
   ```bash
   # Copy your new logo
   cp /path/to/your-logo.png public/images/logo.png
   ```

3. **Clear Browser Cache:**
   - Refresh with `Ctrl+F5` or `Cmd+Shift+R`

### Troubleshooting Visual Issues

#### Background images not loading

**Symptoms:**
- Gray or black background only
- Dashboard looks empty

**Solutions:**
1. Check internet connection
2. Clear browser cache (Ctrl+F5)
3. Verify files exist in `/public/images/dashboard-backgrounds/`
4. Check browser console for errors
5. Ensure images are not corrupted

```bash
# Verify background files exist
ls -lh public/images/dashboard-backgrounds/
```

#### Logo not displaying correctly

**Symptoms:**
- Broken image icon
- White box around logo
- Logo not visible

**Solutions:**
1. Verify logo file exists: `ls -lh public/images/logo.png`
2. Check file format (PNG recommended for transparency)
3. Ensure file is not corrupted
4. Clear browser cache
5. Check browser console for 404 errors

#### Text hard to read on backgrounds

**Symptoms:**
- Low contrast between text and background
- Text blends into background image

**Solutions:**
- The system includes text shadows for readability
- If issues persist, consider:
  - Using darker background images
  - Reducing image brightness
  - Ensuring images have lower contrast patterns

#### Images loading slowly

**Symptoms:**
- Long wait times for backgrounds
- Logo appears slowly

**Solutions:**
1. Check internet speed
2. Optimize image sizes (keep under 5 MB)
3. Compress images using tools like TinyPNG
4. Clear browser cache
5. Check server performance

### Image Best Practices

**For Backgrounds:**
- Use PNG or JPG format
- Optimize for web (compress without quality loss)
- Keep file sizes under 5 MB
- Use military/operation-themed imagery
- Ensure darker tones for better contrast
- Avoid busy patterns that distract from UI

**For Logos:**
- Use PNG format for transparency
- Maintain aspect ratio
- Use vector graphics when possible
- Ensure logo is readable at small sizes
- Test on both light and dark backgrounds

### Performance Considerations

**Impact of Large Images:**
- Slower initial page load
- Higher bandwidth usage
- Potential lag on slow connections

**Recommendations:**
- Compress all images before upload
- Use appropriate image dimensions
- Consider progressive loading for very large images
- Test on mobile networks

### File Structure Reference

```
public/
├── images/
│   ├── logo.png                    # Main system logo (transparent background)
│   └── dashboard-backgrounds/
│       ├── background-1.png        # Landing & Super Admin
│       ├── background-2.png        # Patrol Dashboard
│       ├── background-3.png        # HQ Dashboard
│       └── mobile-background.png   # Mobile devices
```

### Browser Compatibility

**Supported Browsers:**
- Chrome/Edge (latest versions) - Full support
- Firefox (latest versions) - Full support
- Safari (latest versions) - Full support
- Mobile browsers (iOS Safari, Chrome Mobile) - Full support

**Features Requiring Modern Browsers:**
- `backdrop-blur` (glass effect)
- Text shadows
- CSS gradients
- Responsive images

**Fallback Behavior:**
- Older browsers may not show blur effects
- Images will still display
- Functionality remains intact

---

## Support & Contact

### Getting Help

#### For Technical Issues
1. Check this manual first
2. Review troubleshooting section
3. Check system logs
4. Contact system administrator

#### For Account Issues
1. Contact your HQ commander
2. Contact Super Admin
3. Provide your access code and details

### Log Files

**Next.js Server:**
- Development: `/dev.log`
- Production: `/server.log`

**Tracking Service:**
- `/mini-services/tracking-service/tracking-service.log`

**Viewing Logs:**
```bash
tail -f dev.log
tail -f mini-services/tracking-service/tracking-service.log
```

### Reporting Bugs

When reporting issues, include:
1. Your role (Super Admin, HQ, Patrol)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser/device information
6. Screenshots if applicable

---

## Quick Reference

### Access Codes
- Super Admin: `92481526`
- HQ: `8993`
- Patrol: `1526`

### Service Ports
- Web Interface: `3000`
- WebSocket: `3003`

### Common Commands
```bash
# Start system
bun run services:start

# Stop system
bun run services:stop

# Check status
bun run services:status

# Build for production
bun run build

# Run linter
bun run lint

# Update database
bun run db:push
```

### Emergency Contacts
- System Administrator: [Add contact info]
- IT Support: [Add contact info]
- Security: [Add contact info]

---

## Version Information

- **System Version**: 1.0.0
- **Last Updated**: February 20, 2025
- **Documentation Version**: 1.0

---

## Appendix A: Subscription Plans

### 72 hours-Pro Use (FREE)
- **Duration**: 3 days
- **Cost**: FREE
- **Features**:
  - Basic patrol tracking
  - SOS alerts
  - Up to 5 patrols

### Lets Walk ($25/30 days)
- **Duration**: 30 days
- **Cost**: $25
- **Features**:
  - All FREE features
  - Up to 20 patrols
  - Trail history (7 days)
  - Audio calls

### Start Jogging ($35/30 days)
- **Duration**: 30 days
- **Cost**: $35
- **Features**:
  - All LETS WALK features
  - Up to 50 patrols
  - Trail history (30 days)
  - Audio + Video calls
  - Heatmap visualization

### Sprint ($56/30 days)
- **Duration**: 30 days
- **Cost**: $56
- **Features**:
  - All START JOGGING features
  - Unlimited patrols
  - Trail history (90 days)
  - Priority support
  - Custom HQ logo
  - Advanced analytics

---

## Appendix B: FAQ

**Q: Can I use the system offline?**
A: Yes, GPS locations are buffered and sync when reconnected.

**Q: How often does GPS update?**
A: Every 3 seconds when patrolling.

**Q: Can multiple HQs use the system?**
A: Yes, the system supports multiple independent HQs.

**Q: What happens if I lose connection?**
A: The system buffers your location and syncs automatically when reconnected.

**Q: Can I see other patrols' locations?**
A: HQ can see all patrols. Patrols can only see their own location.

**Q: Is my location data secure?**
A: Yes, data is encrypted and only accessible to authorized personnel.

**Q: Can I export my patrol data?**
A: Contact your system administrator for data export requests.

**Q: What devices are supported?**
A: Any modern web browser on desktop, tablet, or mobile devices.

**Q: How do I reset my password?**
A: Contact your Super Admin for password reset.

**Q: Can I change my patrol information?**
A: Contact your HQ administrator to update patrol details.

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 20, 2025 | System Admin | Initial release |

---

**END OF MANUAL**

For questions or updates to this manual, contact the system administrator.
