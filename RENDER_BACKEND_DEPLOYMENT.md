# Deploy MemTribe Backend to Render.com (Free Tier)

## Overview
This guide shows how to deploy your Node.js backend to Render.com's free tier while keeping your frontend on Hostinger shared hosting.

## Prerequisites
- GitHub account
- Render.com account (free)
- Your code pushed to GitHub

---

## Step 1: Prepare Your Backend for Render

### 1.1 Update `package.json`

Make sure your `backend/package.json` has a start script:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "node prisma/seed.js"
  }
}
```

### 1.2 Create `render.yaml` (Optional but Recommended)

Create a file `backend/render.yaml`:

```yaml
services:
  - type: web
    name: memtribe-api
    runtime: node
    region: oregon  # or your preferred region
    plan: free
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: memtribe-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 10000
    healthCheckPath: /health

databases:
  - name: memtribe-db
    databaseName: memtribe
    user: memtribe
    plan: free
    region: oregon
```

### 1.3 Update `.gitignore`

Make sure `.env` is in `.gitignore`:

```gitignore
node_modules/
.env
.env.local
uploads/
*.log
```

---

## Step 2: Create Render Account & Services

### 2.1 Sign Up for Render
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.2 Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `memtribe-db`
   - **Database**: `memtribe`
   - **User**: `memtribe` (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free**
3. Click **"Create Database"**
4. Wait for provisioning (~2 minutes)
5. **Copy the Internal Database URL** (starts with `postgresql://`)

### 2.3 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `memtribe-api`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

---

## Step 3: Configure Environment Variables

In your Render web service dashboard, go to **"Environment"** tab and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | Paste your PostgreSQL connection string |
| `JWT_SECRET` | Generate a strong random string (32+ chars) |
| `CLIENT_URL` | `https://yourdomain.com` (your Hostinger domain) |
| `BASE_URL` | Your Render URL (e.g., `https://memtribe-api.onrender.com`) |
| `RESEND_API_KEY` | Your Resend API key (if using email) |
| `OPENAI_API_KEY` | Your OpenAI key (optional) |

**Generate JWT_SECRET:**
```bash
# In your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Deploy and Run Migrations

### 4.1 Deploy
1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for build to complete (~2-5 minutes)
3. Check logs for errors

### 4.2 Run Database Migrations

Once deployed, you need to run Prisma migrations:

**Option A: Using Render Shell**
1. Go to your web service dashboard
2. Click **"Shell"** in the top right
3. Run:
```bash
npx prisma migrate deploy
npx prisma db seed  # Optional
```

**Option B: Add to Build Command**
Update your build command to include migration:
```
npm install && npx prisma generate && npx prisma migrate deploy
```

---

## Step 5: Test Your Backend

### 5.1 Get Your API URL
Your Render URL will be: `https://memtribe-api.onrender.com` (or similar)

### 5.2 Test Health Endpoint
```bash
curl https://memtribe-api.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "MemTribe API is running"
}
```

### 5.3 Test Registration/Login
Try creating a user through your frontend (after updating frontend API URL).

---

## Step 6: Deploy Frontend to Hostinger Shared Hosting

### 6.1 Update Frontend API URL

Edit `src/api/client.js` (or wherever your API base URL is defined):

```javascript
// Change from localhost to your Render URL
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://memtribe-api.onrender.com'  // Your Render URL
  : 'http://localhost:5000';

export default API_BASE_URL;
```

### 6.2 Build Frontend

```bash
# In your project root (not backend folder)
npm install
npm run build
```

This creates a `dist` folder with production-ready files.

### 6.3 Upload to Hostinger

**Using File Manager:**
1. Log into Hostinger hPanel
2. Go to **File Manager**
3. Navigate to `public_html` folder
4. Upload all files from your `dist` folder
5. Make sure `index.html` is in the root of `public_html`

**Using FTP:**
1. Use FileZilla or any FTP client
2. Connect with credentials from Hostinger
3. Upload all `dist` folder contents to `public_html`

### 6.4 Configure .htaccess for React Router

Create/edit `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures React Router works properly with direct URL access.

---

## Step 7: Update CORS Settings

Make sure your backend allows requests from your Hostinger domain.

In `backend/src/server.js`, verify CORS configuration:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

Make sure `CLIENT_URL` environment variable on Render is set to your Hostinger domain:
```
CLIENT_URL=https://yourdomain.com
```

---

## Important Notes About Render Free Tier

### ⚠️ Limitations:

1. **Sleep Mode**: 
   - Free services sleep after 15 minutes of inactivity
   - First request after sleeping takes ~30-60 seconds to wake up
   - **Solution**: Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your API every 14 minutes

2. **File Storage**:
   - Uploaded files are **not persistent** (lost on redeploy/restart)
   - **Solution**: Use external storage like:
     - Cloudinary (free tier: 25GB storage)
     - Uploadcare
     - Supabase Storage

3. **Database**:
   - 90-day expiration on free tier
   - 256MB storage limit
   - **Solution**: Upgrade to paid tier ($7/month) when needed

4. **Build Minutes**:
   - 500 free build minutes/month
   - Each deploy consumes ~2-3 minutes

---

## File Upload Configuration for Render

Since Render's free tier doesn't persist uploaded files, you have two options:

### Option 1: Use Cloudinary (Recommended)

1. Sign up for Cloudinary (free tier)
2. Install cloudinary package:
```bash
npm install cloudinary
```

3. Update `backend/src/services/s3.service.js` to use Cloudinary instead:

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Update upload function to use cloudinary
```

4. Add Cloudinary credentials to Render environment variables

### Option 2: Use Supabase Storage

1. Create Supabase account
2. Install supabase client
3. Configure storage bucket
4. Update upload service to use Supabase

---

## Monitoring & Logs

### View Logs
1. Go to your Render service dashboard
2. Click **"Logs"** tab
3. View real-time logs

### Check Metrics
- View requests, CPU, memory usage in **"Metrics"** tab
- Free tier shows basic metrics

### Alerts
- Set up email alerts for deployment failures
- Monitor uptime with external services

---

## Keeping Your Service Awake

To prevent sleep mode on free tier:

### Use UptimeRobot (Free)
1. Sign up at https://uptimerobot.com
2. Create new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://memtribe-api.onrender.com/health`
   - **Interval**: 5 minutes
3. This pings your API every 5 minutes, keeping it awake

---

## Updating Your Application

### Automatic Deploys
Render automatically deploys when you push to your connected GitHub branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will automatically:
1. Pull latest code
2. Run build command
3. Deploy new version

### Manual Deploy
1. Go to service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Cost Summary

### Free Tier (Current Setup):
- ✅ Backend hosting: **Free**
- ✅ PostgreSQL database: **Free** (with limitations)
- ✅ Hostinger shared hosting: **$2-4/month**
- ✅ Cloudinary file storage: **Free** (25GB)

**Total: $2-4/month**

### When to Upgrade:
- Need persistent backend (no sleep): **$7/month** (Render)
- Database > 256MB or > 90 days: **$7/month** (Render DB)
- More file storage: **$0.02/GB/month** (Cloudinary)

---

## Troubleshooting

### Issue: Build Fails
**Check:**
- Build logs in Render dashboard
- Make sure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Solution:**
```bash
# Add .node-version or .nvmrc file
echo "18" > backend/.node-version
```

### Issue: Database Connection Fails
**Check:**
- DATABASE_URL environment variable is correct
- Database is in same region as web service (or using external URL)

**Solution:**
- Use "Internal Database URL" if in same region
- Use "External Database URL" if different region

### Issue: Frontend Can't Connect to Backend
**Check:**
- CORS configuration in backend
- API URL in frontend is correct
- Environment variables on Render

**Solution:**
- Update `CLIENT_URL` on Render
- Rebuild frontend with correct API URL
- Check browser console for CORS errors

### Issue: Service Keeps Sleeping
**Solution:**
- Set up UptimeRobot pinger
- Or upgrade to paid tier ($7/month)

---

## Security Best Practices

✅ **Never commit .env files**
✅ **Use strong JWT_SECRET** (generated randomly)
✅ **Enable HTTPS** (automatic on Render)
✅ **Set proper CORS origins**
✅ **Keep dependencies updated**
✅ **Use environment variables** for all secrets
✅ **Enable Render's DDoS protection**

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Configure database and environment variables
3. ✅ Run migrations
4. ✅ Update frontend API URL
5. ✅ Build and upload frontend to Hostinger
6. ✅ Test everything
7. ✅ Set up UptimeRobot
8. ✅ Configure Cloudinary for file uploads (if needed)

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Prisma with Render**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render

---

## Need Help?

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables
3. Test API endpoints directly
4. Check CORS configuration
5. Review database connection

Good luck with your deployment! 🚀

