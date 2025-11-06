# Backend Setup for Guest Upload

## Quick Setup (5 minutes)

### 1. Create Backend `.env` File

Create a file `backend/.env` with this content:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000

# Update these with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/memtribe_db"

# Generate a random string for this (or keep this for development)
JWT_SECRET=memtribe-secret-key-2024-change-in-production

# Optional: AWS S3 (leave commented to use local storage)
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
# AWS_S3_BUCKET=your-bucket
```

**⚠️ Important**: Replace `postgres:password` with your actual PostgreSQL username and password!

### 2. Create the Database

Open a terminal and create the database:

```bash
# Option 1: Using psql
psql -U postgres
CREATE DATABASE memtribe_db;
\q

# Option 2: Using pgAdmin
# Open pgAdmin, right-click Databases → Create → Database
# Name: memtribe_db
```

### 3. Run Migrations and Seed

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

This will:
- ✅ Create all database tables
- ✅ Add subscription packages (Starter, Pro, Business, Enterprise)
- ✅ Add features (events_per_month, media_per_event, etc.)
- ✅ Create a default admin user

### 4. Start the Backend

```bash
cd backend
npm start
```

You should see:
```
ℹ️  AWS S3 not configured, will use local storage
🚀 MemTribe API running on port 5000
📍 Environment: development
🌐 Client URL: http://localhost:5173
```

### 5. Start the Frontend (in another terminal)

```bash
npm run dev
```

You should see:
```
VITE v6.3.6  ready in 14502 ms
➜  Local:   http://localhost:5173/
```

### 6. Test Guest Upload

1. Go to http://localhost:5173
2. Login with the seeded admin user:
   - Email: `admin@memtribe.com`
   - Password: `Admin123!`
3. Create a test event
4. Go to Event Management → Copy Upload Link
5. Open the link in an incognito window
6. Enter name and email
7. Upload a photo
8. Should see "Successfully Uploaded" ✅

## Alternative: Using SQLite (Easier Setup)

If you don't want to use PostgreSQL, you can use SQLite instead:

### 1. Update `backend/prisma/schema.prisma`

Change line 8-11 from:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

To:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Update `backend/.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000

# SQLite database (no PostgreSQL needed!)
DATABASE_URL="file:./dev.db"

JWT_SECRET=memtribe-secret-key-2024-change-in-production
```

### 3. Run Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm start
```

Much easier! No PostgreSQL installation required.

## Troubleshooting

### Error: "Can't reach database server"

**PostgreSQL not running**. Start it:
- Windows: Services → PostgreSQL → Start
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### Error: "authentication failed"

**Wrong credentials in DATABASE_URL**. Update backend/.env with correct username/password.

### Error: "database does not exist"

**Database not created**. Run:
```bash
psql -U postgres -c "CREATE DATABASE memtribe_db;"
```

### Error: "P1001: Can't reach database"

**Wrong DATABASE_URL format**. Should be:
```
postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
```

Replace:
- `USERNAME` with your PostgreSQL username (usually `postgres`)
- `PASSWORD` with your PostgreSQL password
- `DATABASE_NAME` with `memtribe_db`

### Port 5000 Already in Use

Another app is using port 5000. Either:
1. Stop that app
2. Change the port in backend/.env: `PORT=5001`
3. Update frontend to match: Create `.env` at root with `VITE_API_URL=http://localhost:5001/api`

## Next Steps

Once both servers are running:

1. ✅ Test health check: http://localhost:5000/health
2. ✅ Test frontend: http://localhost:5173
3. ✅ Login and create event
4. ✅ Try guest upload in incognito window

If you still get "Upload failed", check:
1. Browser console (F12) for error details
2. Backend terminal for error logs
3. Network tab (F12) to see which API call is failing

The updated MediaUpload component will now show you the **actual error message** instead of just "Upload failed. Please try again."

