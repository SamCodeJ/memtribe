# Guest Upload Troubleshooting Guide

## Issue: "Upload failed. Please try again"

If you're getting this error when uploading media as a guest, follow these steps:

## Step 1: Create Backend .env File

The backend needs a `.env` file. Create one in the `backend` folder:

```bash
cd backend
```

Create a file named `.env` with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000

# Database Configuration (update with your actual database credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/myappdb"

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AWS S3 - Optional (will use local storage if not set)
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
# AWS_S3_BUCKET=your-bucket
# AWS_REGION=us-east-1
```

**Important**: Update the `DATABASE_URL` with your actual PostgreSQL credentials.

## Step 2: Ensure Database is Running

From the backend logs, I can see you're using PostgreSQL. Make sure it's running:

```bash
# Check if PostgreSQL is running
# On Windows, check Services or use:
psql -U postgres -c "SELECT version();"
```

## Step 3: Run Database Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

This will:
- Create all necessary tables
- Seed initial data (packages, features, admin user)

## Step 4: Restart Backend

After creating the .env file:

```bash
cd backend
npm start
```

You should see:
```
✅ AWS S3 not configured, will use local storage
🚀 MemTribe API running on port 5000
📍 Environment: development
🌐 Client URL: http://localhost:5173
```

## Step 5: Test the API

Open a new terminal and test if the backend is responding:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return: {"status":"OK","message":"MemTribe API is running"}
```

## Step 6: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try uploading a file again
4. Look for error messages

Common errors you might see:

### Error: "Cannot connect to server"
**Solution**: Backend is not running. Start it with `npm start` in the backend folder.

### Error: "Failed to fetch"
**Solution**: CORS issue or backend not running. Check that:
- Backend is running on port 5000
- Frontend is running on port 5173
- No firewall blocking localhost connections

### Error: "Event not found"
**Solution**: The event ID in the URL is invalid. 
- Make sure you're using the correct upload link
- Verify the event exists in the database

### Error: "Media upload limit reached"
**Solution**: The event has reached its media upload limit. This is working as intended based on the organizer's subscription plan.

## Step 7: Check Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Try uploading again
4. Look for these requests:

**Expected requests:**
1. `GET /api/events/{event-id}` - Should return 200
2. `POST /api/media/filter` - Should return 200
3. `POST /api/integrations/upload-file` - Should return 200
4. `POST /api/media` - Should return 201

If any of these fail, click on them to see the error details.

## Common Issues and Solutions

### Issue: Database connection error
```
Error: Can't reach database server at localhost:5432
```

**Solution**:
1. Make sure PostgreSQL is running
2. Verify DATABASE_URL in backend/.env is correct
3. Test connection: `psql -U postgres -d myappdb`

### Issue: Permission denied writing to uploads folder
```
Error: EACCES: permission denied, mkdir '/uploads'
```

**Solution**:
```bash
cd backend
mkdir uploads
chmod 755 uploads  # On Unix systems
# On Windows, right-click uploads folder → Properties → Security → Grant full control
```

### Issue: File too large
```
Error: File too large
```

**Solution**: The current limit is 50MB. If you need larger files, update:
- `backend/src/routes/integration.routes.js` - line 16 (fileSize limit)
- `backend/src/server.js` - lines 34-35 (body parser limits)

### Issue: Invalid file type
```
Error: Only image and video files are allowed
```

**Solution**: Make sure you're uploading .jpg, .png, .gif, .mp4, .mov, etc. Other file types are rejected for security.

## Verify Everything is Working

### Test 1: Backend Health Check
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"OK","message":"MemTribe API is running"}`

### Test 2: List Events (if logged in)
Open browser console and run:
```javascript
fetch('http://localhost:5000/api/events')
  .then(r => r.json())
  .then(console.log)
```

### Test 3: Upload as Guest
1. Create an event as a logged-in user
2. Go to Event Management → Copy Upload Link
3. Open link in incognito window
4. Fill in name and email
5. Upload a small image (< 5MB)
6. Should see "Successfully Uploaded"

## Still Not Working?

If you've tried all the above and it's still failing:

1. **Check Backend Logs**: Look at the terminal where backend is running for error messages

2. **Enable Verbose Logging**: Add this to your backend/.env:
   ```env
   DEBUG=*
   LOG_LEVEL=debug
   ```

3. **Test with a Tiny File**: Try uploading a very small image (< 100KB) to rule out size issues

4. **Check Database Schema**: 
   ```bash
   cd backend
   npx prisma studio
   ```
   This opens a GUI to browse your database

5. **Look for Port Conflicts**:
   ```bash
   # Check what's running on port 5000
   netstat -ano | findstr :5000
   ```

## Get More Detailed Error

The updated MediaUpload component now shows the actual error message. When you try to upload, you should see a detailed alert with:
- The specific error message
- Checklist of things to verify

Please try uploading again and **share the exact error message** you see in the alert.

## Quick Reset (Last Resort)

If nothing works, try a fresh start:

```bash
# Stop all servers (Ctrl+C in both terminals)

# Backend
cd backend
rm -rf node_modules
npm install
npx prisma generate
npx prisma db push
npx prisma db seed

# Start backend
npm start

# In another terminal - Frontend
cd ..
npm run dev
```

Then try the upload again with the actual error message displayed.

