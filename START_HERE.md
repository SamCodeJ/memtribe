# 🚀 START HERE - Fix "No Photos Available" Error

## The Issue
You uploaded photos and approved them, but "Create Photobook" shows "No Photos Available".

## The Cause
Your database isn't set up, so photos aren't being saved (even though files are uploaded).

## The Fix (5 Minutes)

### Do you have Docker installed?

#### ✅ YES - Use Docker (Easiest)

```powershell
# 1. Start database
cd backend
docker-compose up -d

# 2. Create backend/.env file with this content:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memtribe?schema=public"
JWT_SECRET="my-secret-key-123"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
BASE_URL="http://localhost:5000"

# 3. Setup database
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed

# 4. Start backend
npm start
```

#### ❌ NO - Manual Setup

1. **Install PostgreSQL:**
   - Download: https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember the password you set!

2. **Create database:**
   ```powershell
   # Open PowerShell as Administrator
   psql -U postgres
   # Enter your password
   
   CREATE DATABASE memtribe;
   \q
   ```

3. **Create backend/.env file** (replace YOUR_PASSWORD):
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/memtribe?schema=public"
   JWT_SECRET="my-secret-key-123"
   PORT=5000
   NODE_ENV=development
   CLIENT_URL="http://localhost:5173"
   BASE_URL="http://localhost:5000"
   ```

4. **Setup database:**
   ```powershell
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   npm run prisma:seed
   npm start
   ```

### ✅ Verify It Works

```powershell
cd backend
node check-media.js
```

If you see "Total media items: 0" - that's normal! The database was empty.

### 🔄 Upload Photos Again

Since the database was empty, you need to re-upload:
1. Start both servers (backend + frontend)
2. Upload photos to your event
3. Go to "Moderate Media" and approve them
4. Click "Create Photobook" → Photos should appear! 🎉

## Need More Help?

- **Detailed instructions:** See `PHOTOBOOK_FIX_INSTRUCTIONS.md`
- **Full technical details:** See `PHOTOBOOK_FIX_SUMMARY.md`
- **Quick reference:** See `QUICK_START.md`

## Still Stuck?

Check your backend console for error messages and browser console (F12) for debug logs.

