# Backend Server Startup Guide

## Issue
The login page shows "NetworkError when attempting to fetch resource" because the backend server is not running on port 5000.

## What I've Done

1. ✅ Created `.env` file with necessary environment variables
2. ✅ Regenerated Prisma client successfully
3. ❌ Backend server is not starting (need to diagnose why)

## Steps to Start the Backend Manually

### 1. Open a NEW terminal/command prompt

### 2. Navigate to the backend directory:
```bash
cd C:\Users\Donation\Documents\ReactProjects\memtribe\backend
```

### 3. Try to start the server:
```bash
npm run dev
```

### 4. Look for errors in the output

## Common Issues and Solutions

### Issue 1: Database Connection Error
**Error:** `Can't reach database server at localhost:5432`

**Solution:** Make sure PostgreSQL is running:
1. Open Services (Win + R, type `services.msc`)
2. Find "PostgreSQL" service
3. Start it if it's stopped
4. Or install PostgreSQL if not installed

### Issue 2: Port Already in Use
**Error:** `Port 5000 is already in use`

**Solution:** Kill the process using port 5000:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

### Issue 3: Missing Dependencies
**Error:** `Cannot find module...`

**Solution:** Reinstall dependencies:
```bash
npm install
```

### Issue 4: JWT_SECRET Missing
**Error:** Related to JWT or authentication

**Solution:** The `.env` file has been created with a default JWT_SECRET. You can change it if needed.

## Environment Variables Created

The `.env` file in the backend folder now contains:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myappdb"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

## Verify Backend is Running

Once the server starts successfully, you should see:
```
🚀 MemTribe API running on port 5000
📍 Environment: development
🌐 Client URL: http://localhost:5173
```

Test it by visiting: http://localhost:5000/health

You should see:
```json
{
  "status": "OK",
  "message": "MemTribe API is running"
}
```

## After Backend Starts

1. The frontend should be able to connect
2. Login should work
3. All API calls should succeed

## If You Still Have Issues

1. Check if PostgreSQL database `myappdb` exists:
```bash
# Connect to PostgreSQL
psql -U postgres

# List databases
\l

# If myappdb doesn't exist, create it:
CREATE DATABASE myappdb;
```

2. Run migrations:
```bash
cd backend
npm run prisma:migrate
```

3. Seed the database (optional):
```bash
npm run prisma:seed
```

## Next Steps

1. **Start the backend server** in a separate terminal
2. **Keep it running**
3. **Refresh your frontend** (http://localhost:5173)
4. **Try logging in again**

The network error should be resolved once the backend is running!

