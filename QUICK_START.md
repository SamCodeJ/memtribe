# Quick Start Guide - Custom Backend

Get your MemTribe custom backend up and running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- AWS account (for S3 file uploads)
- OpenAI API key (for AI image generation)
- Resend account (for emails)

## Step 1: Backend Setup (5 minutes)

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Environment
Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# PostgreSQL Database (update with your credentials)
DATABASE_URL="postgresql://postgres:password@localhost:5432/memtribe?schema=public"

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-random-string-here
JWT_EXPIRES_IN=7d

# AWS S3 (get from AWS Console)
AWS_ACCESS_KEY_ID=your-key-here
AWS_SECRET_ACCESS_KEY=your-secret-here
AWS_REGION=us-east-1
AWS_S3_BUCKET=memtribe-uploads

# OpenAI (get from platform.openai.com)
OPENAI_API_KEY=sk-your-key-here

# Resend (get from resend.com)
RESEND_API_KEY=re_your-key-here
FROM_EMAIL=noreply@yourdomain.com
```

### Setup Database
```bash
# Create database
createdb memtribe

# Or using psql:
# psql -U postgres
# CREATE DATABASE memtribe;

# Run migrations and seed data
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Start Backend
```bash
npm run dev
```

✅ Backend should now be running on http://localhost:5000

Test it: http://localhost:5000/health

## Step 2: Frontend Setup (2 minutes)

### Configure Frontend Environment

Create `.env` in project root:
```env
VITE_API_URL=http://localhost:5000/api
```

### Install Dependencies (if not already)
```bash
npm install
```

### Start Frontend
```bash
npm run dev
```

✅ Frontend should now be running on http://localhost:5173

## Step 3: Test the Application (3 minutes)

### Login with Test Account

Use one of these pre-seeded accounts:

**Admin Account:**
- Email: `admin@memtribe.com`
- Password: `admin123`
- Plan: Enterprise

**Regular User:**
- Email: `test@memtribe.com`
- Password: `test123`
- Plan: Starter

### Test Core Features

1. **Create an Event**
   - Go to Dashboard → Create Event
   - Fill in event details
   - Try AI image generation (if OpenAI key configured)
   - Upload an event banner

2. **RSVP to Event**
   - Copy event QR code or share link
   - Submit an RSVP as a guest

3. **Upload Media**
   - Go to Media Hub
   - Upload photos/videos
   - Test moderation

## Quick Architecture Overview

```
┌─────────────────┐      HTTP/REST      ┌──────────────────┐
│                 │ ←─────────────────→  │                  │
│  React Frontend │                      │  Express Backend │
│  (Port 5173)    │                      │  (Port 5000)     │
│                 │                      │                  │
└─────────────────┘                      └────────┬─────────┘
                                                  │
                                         ┌────────┴─────────┐
                                         │                  │
                                         │   PostgreSQL DB  │
                                         │                  │
                                         └──────────────────┘

External Services:
├── AWS S3 (File Storage)
├── OpenAI (AI Images)
└── Resend (Email)
```

## Common Issues & Solutions

### "Database connection failed"
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Try connecting with psql: `psql postgresql://username:password@localhost:5432/memtribe`

### "CORS error"
- Ensure CLIENT_URL in backend `.env` matches your frontend URL
- Default should be: `http://localhost:5173`

### "File upload failed"
- Verify AWS credentials
- Check S3 bucket exists and has proper permissions
- Ensure bucket allows public read access (or update S3 service)

### "AI image generation failed"
- Verify OpenAI API key
- Check you have API credits
- Ensure key has access to DALL-E 3

### "Email not sending"
- Verify Resend API key
- Check FROM_EMAIL is verified in Resend dashboard
- Use a real domain email (not @gmail.com)

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev          # Start with auto-reload
npm run prisma:studio # View/edit database in browser
```

### Frontend Development
```bash
npm run dev          # Start Vite dev server
```

### Database Migrations
```bash
cd backend
# After changing schema.prisma:
npm run prisma:migrate
npm run prisma:generate
```

## Switching from Base44

To switch your frontend to use the custom backend:

1. Edit `src/api/index.js`
2. Change `USE_CUSTOM_BACKEND = false` to `USE_CUSTOM_BACKEND = true`
3. Restart frontend dev server

That's it! No code changes needed.

## Next Steps

- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring and logging
- [ ] Implement rate limiting
- [ ] Add API documentation

## Need Help?

- Check logs in terminal
- Review `MIGRATION_GUIDE.md` for detailed info
- Backend API docs: http://localhost:5000 (coming soon)
- Frontend runs on: http://localhost:5173

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [AWS S3 Setup](https://docs.aws.amazon.com/s3/)
- [OpenAI API](https://platform.openai.com/docs)
- [Resend Docs](https://resend.com/docs)

Happy coding! 🚀

