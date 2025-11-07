# Quick Start - Fix "No Photos Available" Issue

## The Problem

You uploaded photos and approved them, but when you click "Create Photobook", it shows "No Photos Available".

**Root Cause:** The database isn't properly set up, so photos aren't being saved to the database (even though they're uploaded to `backend/uploads/`).

## Quick Fix (Choose ONE option)

### Option A: Use Docker (Recommended - Easiest!)

If you have Docker installed:

```bash
# 1. Start PostgreSQL database
cd backend
docker-compose up -d

# 2. Create .env file (copy and paste this into backend/.env)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memtribe?schema=public"
JWT_SECRET="your-secret-key-change-this"
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

### Option B: Install PostgreSQL Manually

1. Install PostgreSQL from: https://www.postgresql.org/download/windows/
2. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE memtribe;
   \q
   ```
3. Create `backend/.env` file with your PostgreSQL password
4. Run setup commands from Option A step 3-4

## Verify It Works

```bash
cd backend
node check-media.js
```

Should show your media records.

## Re-Upload Photos

Since the database was empty, you'll need to:
1. Upload photos again
2. Go to "Moderate Media" and approve them  
3. Now "Create Photobook" will work!

## Files Changed

- ✅ Added `filtered_url` field to database schema
- ✅ Added debugging logs to PhotobookCreator
- ✅ Created database check script
- ✅ Fixed Docker setup

See `PHOTOBOOK_FIX_INSTRUCTIONS.md` for detailed instructions.
