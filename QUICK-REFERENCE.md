# Quick Reference Guide
## Military Patrol Tracking System

---

## 🚀 Quick Start

### Access the System
1. Go to: `http://localhost:3000`
2. Enter your access code
3. Start using the system

### Access Codes
| Role | Code | Notes |
|------|------|-------|
| Super Admin | `92481526` | Change password! |
| HQ | `8993` | Demo HQ |
| Patrol | `1526` | Register first |

---

## 📱 Patrol Commander Quick Guide

### First Time Setup
1. Enter code: `1526`
2. Fill registration form
3. Click "Register"

### Daily Use
**Start Patrol:**
- Click green "Start Patrol" button
- GPS begins tracking
- HQ sees your location

**Stop Patrol:**
- Click red "Stop Patrol" button
- Tracking ends
- Final location saved

**Send SOS:**
- Click red SOS button (triangle)
- Only for emergencies!
- HQ notified immediately

**Call HQ:**
- Click phone icon for audio
- Click video icon for video call

**View Location:**
- Blue marker = your position
- Trail line = your path

---

## 🏢 HQ Commander Quick Guide

### Dashboard
- **Map**: See all patrols in real-time
- **Panel**: View patrol list and details
- **SOS**: See emergency alerts

### Common Tasks

**View Patrol Details:**
- Click marker on map
- OR find in panel list
- See name, unit, status

**Call Patrol:**
- Find patrol in list/map
- Click phone (audio) or video icon
- Wait for answer

**Respond to SOS:**
- Click "Show SOS"
- Click alert to view details
- Click "Resolve" when handled

**Map Controls:**
- 🔥 Heatmap - Show patrol density
- 〰️ Trails - Show movement paths
- 🏕️ Camps - Show camp locations
- 🔄 Refresh - Update data

---

## ⚙️ Super Admin Quick Guide

### Dashboard
- **Statistics**: Overview of system status
- **HQ Management**: Create, approve, manage HQs
- **Subscription Plans**: View all plans

### Common Tasks

**Create New HQ:**
1. Click "Register New HQ"
2. Enter HQ details
3. Click "Register HQ"
4. Approve when ready

**Approve HQ:**
1. Find pending HQ
2. Click "Approve"
3. Confirm

**Upload Logo:**
1. Click "Upload Logo" on HQ card
2. Select PNG file
3. Click "Upload"

**Activate Subscription:**
1. Find HQ in list
2. Click "Activate Subscription"
3. Select plan
4. Click "Activate"

**Deactivate HQ:**
1. Find HQ
2. Click "Deactivate"
3. Confirm

---

## 🆘 Emergency Procedures

### For Patrol Commanders

**Medical Emergency:**
1. Click SOS button
2. Stay on the line when HQ calls
3. Describe your condition
4. Follow HQ instructions

**Security Threat:**
1. Click SOS button
2. Move to safe location if possible
3. Keep phone accessible
4. Report details when called

**Lost/Disoriented:**
1. Click SOS button
2. Stay where you are (if safe)
3. Wait for assistance
4. Describe surroundings when called

### For HQ Commanders

**SOS Alert Received:**
1. Immediately call the patrol
2. Get precise location
3. Assess situation
4. Dispatch assistance if needed
5. Alert nearby patrols

**Communication Lost:**
1. Check patrol's last known location
2. Try calling patrol
3. Alert backup if available
4. Monitor for reconnection

---

## 🔧 System Management

### Start Services
```bash
bun run services:start
```

### Stop Services
```bash
bun run services:stop
```

### Check Status
```bash
bun run services:status
```

### Restart Services
```bash
bun run services:restart
```

### View Logs
```bash
# Development log
tail -f dev.log

# Tracking service log
tail -f mini-services/tracking-service/tracking-service.log
```

---

## 📊 Status Indicators

### Patrol Status
| Icon | Status | Meaning |
|------|--------|---------|
| 🟢 Green | Idle | Not patrolling |
| 🟡 Yellow | Patrolling | Active patrol |
| 🔴 Red | SOS | Emergency alert |
| ⚪ Gray | Offline | No connection |

### Connection Status
| Icon | Status | Meaning |
|------|--------|---------|
| 🟢 WiFi | Online | Connected to server |
| 🔴 WiFi Off | Offline | No connection |

### Call Status
| Status | Meaning |
|--------|---------|
| Connecting | Establishing call |
| Connected | Call in progress |
| Ended | Call finished |

---

## 🎨 Map Legend

### Markers
- **Blue Dot**: Patrol location
- **Red Triangle**: SOS location
- **Camp Icon**: Permanent camp

### Trails
- **Colored Lines**: Patrol movement history
- Each patrol has unique color

### Heatmap
- **Red**: High patrol activity
- **Yellow**: Medium activity
- **Green**: Low activity

---

## ⚠️ Important Reminders

### For Patrol Commanders
- ✅ Start patrol before leaving
- ✅ Keep device charged
- ✅ Use GPS tracking
- ✅ Report regularly
- ❌ Don't use SOS for non-emergencies
- ❌ Don't share access codes
- ❌ Don't ignore calls from HQ

### For HQ Commanders
- ✅ Monitor patrols regularly
- ✅ Respond to SOS immediately
- ✅ Answer calls promptly
- ✅ Keep records
- ❌ Don't ignore alerts
- ❌ Don't share sensitive info

### For Super Admins
- ✅ Change default password
- ✅ Approve HQs quickly
- ✅ Monitor subscriptions
- ✅ Backup database regularly
- ❌ Don't share admin credentials
- ❌ Don't delete active HQs without backup

---

## 📞 Support

### Contact Information
- **System Admin**: [Add phone/email]
- **Technical Support**: [Add phone/email]
- **Emergency**: [Add phone/email]

### Getting Help
1. Check this guide first
2. Review full OPERATING-MANUAL.md
3. Check system logs
4. Contact support

---

## 🔐 Security Tips

1. **Keep passwords secret** - Never share
2. **Log out after use** - Protect your account
3. **Use secure networks** - Avoid public Wi-Fi
4. **Report lost devices** - Immediately
5. **Change passwords regularly** - Every 90 days
6. **Monitor for suspicious activity** - Report issues

---

## 📱 Mobile Tips

### Battery Conservation
- Lower screen brightness
- Close unused apps
- Use power saving mode
- Keep backup battery

### GPS Accuracy
- Ensure clear sky view
- Wait for GPS to lock
- Avoid underground locations
- Check location settings

### Connectivity
- Use 4G/5G when available
- Have offline maps as backup
- Test connection before patrol
- Keep signal booster if needed

---

## 🎯 Best Practices

### Before Patrol
- ✅ Charge device to 100%
- ✅ Test GPS signal
- ✅ Check internet connection
- ✅ Inform HQ of departure
- ✅ Start patrol tracking

### During Patrol
- ✅ Maintain connection
- ✅ Check status regularly
- ✅ Report significant events
- ✅ Monitor battery level
- ✅ Keep device accessible

### After Patrol
- ✅ Stop patrol tracking
- ✅ Call HQ for debrief
- ✅ Review trail if needed
- ✅ Charge device
- ✅ Report any issues

---

## ⌨️ Keyboard Shortcuts

### Global
- `F5` or `Ctrl+R` - Refresh page
- `F12` - Developer tools
- `Ctrl+Shift+R` - Hard refresh

### During Call
- `Space` - Mute/Unmute (if supported)
- `Esc` - End call (if supported)

---

## 📋 Checklist

### Daily Patrol Checklist
- [ ] Device charged
- [ ] GPS working
- [ ] Internet connected
- [ ] Patrol started
- [ ] HQ informed of departure
- [ ] Regular check-ins completed
- [ ] Patrol stopped
- [ ] HQ informed of return

### HQ Daily Checklist
- [ ] Review active patrols
- [ ] Check for SOS alerts
- [ ] Monitor system status
- [ ] Answer all calls
- [ ] Document events
- [ ] End of shift report

### Super Admin Weekly Checklist
- [ ] Review new HQ requests
- [ ] Check subscription expirations
- [ ] Review system logs
- [ ] Backup database
- [ ] Update if needed
- [ ] Security audit

---

## 💡 Pro Tips

### Patrol Commanders
- **Save battery**: Use airplane mode when not tracking, turn on for GPS
- **Improve GPS**: Stay in open areas for better signal
- **Stay connected**: Know coverage areas in your patrol zone
- **Quick SOS**: Add SOS shortcut to home screen

### HQ Commanders
- **Customize view**: Adjust map controls for your needs
- **Use filters**: Filter patrols by status or search by name
- **Monitor patterns**: Review trails to optimize patrol routes
- **Stay organized**: Use panel to manage multiple patrols

### Super Admins
- **Plan ahead**: Activate subscriptions before expiry
- **Keep records**: Document all HQ approvals
- **Stay secure**: Use strong, unique passwords
- **Monitor usage**: Review subscription usage patterns

---

## 🔄 Common Workflows

### Starting a Patrol
1. Open app
2. Enter code `1526`
3. Fill registration (first time only)
4. Click green "Start Patrol"
5. Begin movement
6. HQ sees your location

### Handling an Emergency
1. Click SOS button
2. Wait for HQ call
3. Describe situation
4. Follow instructions
5. Stay on line if possible

### HQ Responding to SOS
1. See SOS alert
2. Click to view details
3. Call patrol immediately
4. Assess situation
5. Dispatch if needed
6. Mark resolved when done

### Creating New HQ (Super Admin)
1. Login with code `92481526`
2. Go to "HQ Management"
3. Click "Register New HQ"
4. Fill in details
5. Click "Register"
6. Approve when ready

---

## 🎓 Training Tips

### New Patrol Commanders
1. Read full manual
2. Practice in safe area first
3. Test all features
4. Ask HQ for guidance
5. Keep quick reference handy

### New HQ Commanders
1. Learn map controls
2. Practice responding to alerts
3. Test calling features
4. Review patrol data
5. Understand SOS procedures

### New Super Admins
1. Learn admin dashboard
2. Practice HQ management
3. Understand subscription system
4. Learn security procedures
5. Review backup processes

---

## 📞 Emergency Contacts

**Fill in your organization's contacts:**

- **System Administrator**: _______________
- **IT Support**: _______________
- **Security Office**: _______________
- **Medical Emergency**: _______________
- **HQ Command**: _______________

---

## 📝 Notes

```
Use this section for:
- Personal notes
- Important contacts
- Custom procedures
- Quick reminders
```

---

**Quick Reference Guide v1.0**  
Last Updated: February 20, 2025

For complete details, see OPERATING-MANUAL.md
