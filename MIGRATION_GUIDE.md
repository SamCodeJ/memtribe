# Migration Guide: Base44 to Custom Backend

This guide will help you migrate from Base44 to the custom Node.js backend.

## Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/memtribe?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=memtribe-uploads

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@memtribe.com
```

### 3. Set Up PostgreSQL Database

Install PostgreSQL if you haven't already, then create a database:

```bash
createdb memtribe
```

Or using psql:

```sql
CREATE DATABASE memtribe;
```

### 4. Run Database Migrations

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

This will:
- Generate Prisma client
- Create all database tables
- Seed initial data (plans, features, test users)

### 5. Start Backend Server

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Create Frontend Environment File

In the project root, create a `.env` file:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Update API Imports

Replace all Base44 imports with the new API:

#### Before (Base44):
```javascript
import { Event, RSVP, Media, User } from "@/api/entities";
import { UploadFile, GenerateImage } from "@/api/integrations";
```

#### After (Custom Backend):
```javascript
import { Event, RSVP, Media, User } from "@/api/newEntities";
import { UploadFile, GenerateImage } from "@/api/newIntegrations";
```

### 3. Update Authentication Flow

The authentication now uses JWT tokens instead of Base44's OAuth.

#### Login Example:
```javascript
// Before
await User.loginWithRedirect(redirectUrl);

// After - now handled automatically, but you can also use:
const user = await User.login(email, password);
```

#### Getting Current User:
```javascript
// Same API - no changes needed
const user = await User.me();
```

### 4. Run Frontend

```bash
npm install
npm run dev
```

## Key Changes

### API Differences

1. **Authentication**: Now uses JWT tokens stored in localStorage
2. **File Uploads**: Files go to AWS S3 instead of Base44 storage
3. **AI Images**: Uses OpenAI DALL-E instead of Base44 image generation
4. **Email**: Uses Resend instead of Base44 email service

### Database Schema

All your data models remain the same:
- User
- Event
- RSVP
- Media
- Package
- Feature
- PackageFeature
- SystemSettings

### API Endpoints

All CRUD operations work similarly:

```javascript
// List all events
const events = await Event.list("-created_date");

// Filter events
const myEvents = await Event.filter({ organizer_id: userId });

// Create event
const event = await Event.create({ title: "My Event", ... });

// Update event
await Event.update(eventId, { title: "Updated Title" });

// Delete event
await Event.delete(eventId);
```

## Testing

### Test Accounts

After seeding, you'll have these test accounts:

**Admin User:**
- Email: `admin@memtribe.com`
- Password: `admin123`

**Regular User:**
- Email: `test@memtribe.com`
- Password: `test123`

### API Testing

Test the backend directly:

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@memtribe.com","password":"test123"}'

# Get events (with token)
curl http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Backend Deployment (Recommended: Railway, Render, or AWS)

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations
4. Deploy Node.js application

### Frontend Deployment (Vercel, Netlify)

1. Set `VITE_API_URL` to your production backend URL
2. Deploy as usual

## Troubleshooting

### CORS Errors
Make sure `CLIENT_URL` in backend `.env` matches your frontend URL

### Database Connection Issues
Check your `DATABASE_URL` is correct and PostgreSQL is running

### File Upload Issues
Verify AWS credentials and S3 bucket permissions

### Authentication Issues
Clear localStorage and try logging in again

## Need Help?

Check the backend logs for detailed error messages:
```bash
cd backend
npm run dev
```

All errors will be logged to the console with stack traces in development mode.

