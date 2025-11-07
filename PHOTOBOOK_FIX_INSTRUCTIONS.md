# Photobook "No Photos Available" - Fix Instructions

## Issue Summary

When you try to create a photobook after uploading and approving photos, you see "No Photos Available for Photobook".

## Root Cause

Database is not properly configured or not running, so media records aren't being saved even though the files are uploaded successfully to `backend/uploads/`.

## Solution Steps

### Step 1: Set Up Database

You need to create a `backend/.env` file with your database connection. Copy the example:

**For Windows with PostgreSQL:**

1. **Install PostgreSQL** (if not installed):
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, remember your password for the `postgres` user
   - Default port is `5432`

2. **Create the database:**
   Open PowerShell or Command Prompt and run:
   ```bash
   psql -U postgres
   # Enter your password when prompted
   
   CREATE DATABASE memtribe;
   \q
   ```

3. **Create `backend/.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/memtribe?schema=public"
   JWT_SECRET="your-secret-key-for-jwt-tokens"
   PORT=5000
   NODE_ENV=development
   CLIENT_URL="http://localhost:5173"
   BASE_URL="http://localhost:5000"
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password.

**Alternative: Using Docker (Easier)**

If you have Docker installed:

1. Create `docker-compose.yml` in the backend directory:
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       restart: always
       ports:
         - "5432:5432"
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: memtribe
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

2. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```

3. Create `backend/.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memtribe?schema=public"
   JWT_SECRET="your-secret-key-for-jwt-tokens"
   PORT=5000
   NODE_ENV=development
   CLIENT_URL="http://localhost:5173"
   BASE_URL="http://localhost:5000"
   ```

### Step 2: Apply Database Migration

Once the database is running and `.env` is created:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run prisma:seed
```

This will:
- Create all database tables
- Add the `filtered_url` field to the media table
- Seed initial data (subscription plans)

### Step 3: Restart Backend

```bash
cd backend
npm start
```

You should see:
```
🚀 MemTribe API running on port 5000
✅ Database connected
```

### Step 4: Upload and Approve Photos Again

1. Go to your event
2. Upload some photos
3. Go to "Moderate Media" and approve them
4. Now try "Create Photobook" - photos should appear!

## What Was Fixed in the Code

1. **Added `filtered_url` field** to the Media model in `backend/prisma/schema.prisma`
   - This field stores branded/filtered versions of images
   - Was missing and causing errors during moderation

2. **Added debugging** to `src/pages/PhotobookCreator.jsx`
   - Console logs will show what media is being loaded
   - Check browser console (F12) to see the debug output

## Verification

To check if media is being saved properly:

```bash
cd backend
node check-media.js
```

This will show:
- Total media count
- Media by status (pending/approved/rejected)
- Media by type (image/video)
- Sample media items

## Common Issues

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check the DATABASE_URL in .env matches your setup
- Test connection: `psql -U postgres -h localhost -d memtribe`

### "Media uploaded but not in database"
- Check backend console for errors
- Ensure backend is actually running (not just frontend)
- Check `.env` file exists and has correct DATABASE_URL

### "No approved images found"
- Make sure you've approved photos in "Moderate Media"
- Check the `moderation_status` field is set to "approved"
- Run `node check-media.js` to verify

## Need Help?

If you're still having issues:
1. Check backend console for error messages
2. Check browser console (F12) for the debug logs
3. Run `node backend/check-media.js` and share the output
4. Share any error messages from the terminal

