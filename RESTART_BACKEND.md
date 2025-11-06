# Quick Fix: Restart Backend

## The Issue
There was a typo in `backend/src/controllers/media.controller.js` line 12:
- **Before**: ` me  // Check if event exists...` ❌
- **After**: `  // Check if event exists...` ✅

## How to Fix

### If using local development (npm start):
1. Stop the backend server (Ctrl+C)
2. Start it again:
```bash
cd backend
npm start
```

### If deployed on a server (like /var/www/memtribe):
1. SSH into your server
2. Navigate to the backend directory:
```bash
cd /var/www/memtribe/backend
```
3. Restart the Node.js process:
```bash
# If using PM2:
pm2 restart memtribe-backend

# If using systemd:
sudo systemctl restart memtribe-backend

# Or stop and start manually:
# Kill the process and then:
npm start
```

## Then Test Again
1. Refresh the MediaUpload page on your phone
2. Try uploading again
3. Should work now! ✅

## What Was Wrong
A single typo (`me` on line 12) caused a JavaScript ReferenceError. This prevented the media creation function from running.

