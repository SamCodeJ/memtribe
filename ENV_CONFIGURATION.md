# Environment Variables Configuration

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# ==========================================
# SERVER CONFIGURATION
# ==========================================
NODE_ENV=development
PORT=5000
# For local dev: http://localhost:5000
# For production: https://api.yourdomain.com
BASE_URL=http://localhost:5000

# ==========================================
# DATABASE
# ==========================================
# Local development example:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/memtribe"
# Hostinger production example:
# DATABASE_URL="postgresql://username:password@localhost:5432/memtribe_db"
DATABASE_URL="postgresql://postgres:password@localhost:5432/memtribe"

# ==========================================
# JWT AUTHENTICATION
# ==========================================
# Generate a strong random string (minimum 32 characters)
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=change-this-to-a-strong-random-secret-key-in-production

# ==========================================
# CORS - CLIENT URL
# ==========================================
# The URL of your frontend application
# Local: http://localhost:5173 or http://localhost:5174
# Production: https://yourdomain.com
CLIENT_URL=http://localhost:5173

# ==========================================
# EMAIL SERVICE (RESEND)
# ==========================================
# Get your API key from: https://resend.com
RESEND_API_KEY=your-resend-api-key

# ==========================================
# OPENAI (OPTIONAL)
# ==========================================
# Only needed if using AI features
# Get your API key from: https://platform.openai.com
OPENAI_API_KEY=your-openai-api-key-optional

# ==========================================
# AWS S3 CONFIGURATION (OPTIONAL)
# ==========================================
# LEAVE EMPTY OR REMOVE THESE IF NOT USING AWS
# The app will automatically use local file storage
# if these are not configured

# AWS_ACCESS_KEY_ID=your-aws-access-key-id
# AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
# AWS_S3_BUCKET=your-s3-bucket-name
# AWS_REGION=us-east-1
```

## Important Notes for Hostinger Deployment

### File Storage Strategy

Your application **already supports local file storage** without AWS! Here's how it works:

1. **Automatic Detection**: The `s3.service.js` checks if AWS credentials are configured
2. **Fallback to Local**: If AWS is not configured, files are saved to `backend/uploads/`
3. **Static Serving**: The Express server serves files from `/uploads` route
4. **No Changes Needed**: Just leave AWS variables empty or remove them

### Environment Variables for Hostinger Production

When deploying to Hostinger, update these values:

```env
NODE_ENV=production
PORT=5000
BASE_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://your_hostinger_username:your_password@localhost:5432/memtribe_db
JWT_SECRET=YOUR_STRONG_RANDOM_SECRET_HERE
CLIENT_URL=https://yourdomain.com
RESEND_API_KEY=your_resend_api_key
```

**Do NOT include AWS variables** - the app will automatically use local storage.

### Generating a Strong JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

### Database URL Format

The PostgreSQL connection string format:

```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

Example for Hostinger:
```
postgresql://memtribe_user:SecurePassword123@localhost:5432/memtribe_db
```

### Where Files Are Stored

**Local Development:**
- Files: `backend/uploads/`
- Access: `http://localhost:5000/uploads/filename.jpg`

**Hostinger Production:**
- Files: `/home/username/domains/yourdomain.com/memtribe/backend/uploads/`
- Access: `https://api.yourdomain.com/uploads/filename.jpg`

### Storage Considerations

**Local Storage (Current Setup):**
- ✅ Free (included in hosting)
- ✅ Simple setup
- ✅ No external dependencies
- ✅ No per-request fees
- ❌ Limited by server disk space
- ❌ Not distributed/CDN

**When You Might Need External Storage:**
- You have thousands of high-resolution images
- You need global CDN distribution
- Your Hostinger plan has limited storage
- You want automatic backups

**Recommended External Services (if needed later):**
1. **Cloudinary** - Free tier, automatic image optimization
2. **Backblaze B2** - Cheaper than AWS S3
3. **DigitalOcean Spaces** - S3-compatible

---

## Frontend Environment Variables

If your frontend needs environment variables, create a `.env` file in the root directory:

```env
VITE_API_URL=https://api.yourdomain.com
```

Then update your API client to use it:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

---

## Security Checklist

Before deploying to Hostinger:

- [ ] Strong JWT_SECRET (minimum 32 characters, random)
- [ ] Strong database password
- [ ] NODE_ENV set to 'production'
- [ ] BASE_URL points to your production API domain
- [ ] CLIENT_URL points to your production frontend domain
- [ ] .env file is in .gitignore (never commit it!)
- [ ] Email service (Resend) API key is valid
- [ ] Database connection string is correct
- [ ] SSL certificates are installed (HTTPS)

---

## Testing Configuration

### Test Local Setup

1. Make sure you have a `.env` file in the `backend` directory
2. Start your backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Test health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```
4. Upload a test file through your frontend
5. Check that files appear in `backend/uploads/`
6. Access the file: `http://localhost:5000/uploads/[filename]`

### Test Hostinger Setup

After deployment:

1. SSH into your Hostinger server
2. Check environment variables are set correctly
3. Test health endpoint:
   ```bash
   curl https://api.yourdomain.com/health
   ```
4. Upload a test image through your frontend
5. Verify file appears in uploads directory:
   ```bash
   ls -la ~/domains/yourdomain.com/memtribe/backend/uploads/
   ```
6. Access the file in browser:
   ```
   https://api.yourdomain.com/uploads/[filename]
   ```

---

## Troubleshooting

### Issue: Files not uploading

**Check:**
1. `uploads` directory exists in `backend/`
2. Directory has proper permissions: `chmod 755 uploads`
3. `BASE_URL` in `.env` is correct
4. No AWS credentials are set (leave them empty)
5. Check server logs for errors

### Issue: Cannot access uploaded files

**Check:**
1. Nginx is configured to serve `/uploads` route
2. File actually exists in uploads directory
3. Proper CORS headers are set
4. File permissions are correct (not 600)

### Issue: Database connection error

**Check:**
1. PostgreSQL is running on Hostinger
2. Database exists and user has access
3. `DATABASE_URL` format is correct
4. Password doesn't contain special characters that need escaping
5. Firewall allows PostgreSQL connections

---

## Quick Start Commands

### Local Development

```bash
# Backend
cd backend
cp ../ENV_CONFIGURATION.md .env  # Create .env based on this file
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend (in another terminal)
cd ..
npm install
npm run dev
```

### Hostinger Deployment

```bash
# On Hostinger server via SSH
cd ~/domains/yourdomain.com/memtribe/backend
nano .env  # Create and configure .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed  # Optional
pm2 start src/server.js --name memtribe-api
```

---

For complete deployment instructions, see `HOSTINGER_DEPLOYMENT_GUIDE.md`

