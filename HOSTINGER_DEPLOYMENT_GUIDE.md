# Hostinger Deployment Guide for MemTribe

This guide will help you deploy your MemTribe application to Hostinger without using AWS services.

## Prerequisites

- Hostinger VPS or Business hosting plan (Node.js support required)
- Domain name configured in Hostinger
- SSH access to your Hostinger server
- MySQL/PostgreSQL database on Hostinger

## Architecture Overview

Your application will run on Hostinger with:
- **Frontend**: React app (Vite build)
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL (Hostinger database)
- **File Storage**: Local storage on Hostinger server (no AWS S3)

---

## Part 1: Database Setup

### 1. Create PostgreSQL Database on Hostinger

1. Log into Hostinger control panel (hPanel)
2. Navigate to **Databases** → **PostgreSQL Databases**
3. Create a new database:
   - Database name: `memtribe_db`
   - Username: (create a user)
   - Password: (save this securely)
4. Note your database connection details:
   - Host: Usually `localhost` or provided by Hostinger
   - Port: Usually `5432`
   - Database name
   - Username
   - Password

### 2. Get Database Connection String

Your `DATABASE_URL` will look like:
```
postgresql://username:password@host:5432/memtribe_db
```

---

## Part 2: Backend Deployment

### 1. Connect to Your Server via SSH

```bash
ssh your_username@your_hostinger_ip
```

### 2. Install Node.js (if not already installed)

Hostinger usually has Node.js, but verify:

```bash
node --version
npm --version
```

If not installed, use:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 3. Upload Your Backend Code

Option A: Using Git (Recommended)
```bash
cd ~/domains/yourdomain.com
git clone your-repository-url
cd memtribe/backend
```

Option B: Using FTP/SFTP
- Upload the entire `backend` folder to your Hostinger server
- Common path: `/home/username/domains/yourdomain.com/backend`

### 4. Create Environment File

Create `.env` in your backend folder:

```bash
cd ~/domains/yourdomain.com/memtribe/backend
nano .env
```

Add the following (adjust values):

```env
# Server Configuration
NODE_ENV=production
PORT=5000
BASE_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/memtribe_db

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (your frontend domain)
CLIENT_URL=https://yourdomain.com

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key

# OpenAI (if using AI features)
OPENAI_API_KEY=your-openai-api-key-optional

# AWS - LEAVE EMPTY or REMOVE (not using AWS)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_S3_BUCKET=
# AWS_REGION=
```

**Important**: Since you're not using AWS, either:
- Leave the AWS variables commented out
- Don't include them at all
- Set them to empty strings

The app will automatically use local file storage.

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Prisma Migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

Optionally seed the database:
```bash
npm run prisma:seed
```

### 7. Create Uploads Directory

```bash
mkdir -p uploads
chmod 755 uploads
```

This is where your media files will be stored locally.

### 8. Test the Backend

```bash
npm start
```

Verify it's running:
```bash
curl http://localhost:5000/health
```

You should see: `{"status":"OK","message":"MemTribe API is running"}`

---

## Part 3: Process Management (Keep Backend Running)

### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start your app
pm2 start src/server.js --name memtribe-api

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Check status
pm2 status
pm2 logs memtribe-api
```

### Option B: Using systemd

Create a service file:
```bash
sudo nano /etc/systemd/system/memtribe.service
```

Add:
```ini
[Unit]
Description=MemTribe API
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/home/username/domains/yourdomain.com/memtribe/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl start memtribe
sudo systemctl enable memtribe
sudo systemctl status memtribe
```

---

## Part 4: Reverse Proxy Setup (Nginx)

### 1. Install Nginx (if not installed)

```bash
sudo apt update
sudo apt install nginx
```

### 2. Configure Nginx for Backend API

Create or edit Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/memtribe-api
```

Add:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # File upload size limit
    client_max_body_size 50M;

    # API proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads {
        alias /home/username/domains/yourdomain.com/memtribe/backend/uploads;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/memtribe-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate (HTTPS)

Install Certbot and get SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Certbot will automatically update your Nginx config for HTTPS.

---

## Part 5: Frontend Deployment

### 1. Build Frontend Locally

On your local machine:

```bash
cd memtribe
npm install
npm run build
```

This creates a `dist` folder with optimized production files.

### 2. Update Frontend API Configuration

Before building, make sure your frontend API client points to your Hostinger backend.

Edit `src/api/client.js` or wherever your API base URL is configured:

```javascript
const API_BASE_URL = 'https://api.yourdomain.com';
```

Rebuild:
```bash
npm run build
```

### 3. Upload Frontend Build

Option A: Using FTP/SFTP
- Upload the entire `dist` folder to: `/home/username/domains/yourdomain.com/public_html`

Option B: Using SSH/SCP
```bash
scp -r dist/* username@your_hostinger_ip:/home/username/domains/yourdomain.com/public_html/
```

### 4. Configure Nginx for Frontend

```bash
sudo nano /etc/nginx/sites-available/memtribe-frontend
```

Add:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/username/domains/yourdomain.com/public_html;
    index index.html;

    # SPA routing - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/memtribe-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Add SSL for Frontend

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Part 6: Important Configuration Updates

### Backend Environment Variables Checklist

✅ **DATABASE_URL**: Your Hostinger PostgreSQL connection string
✅ **BASE_URL**: Your backend URL (e.g., `https://api.yourdomain.com`)
✅ **CLIENT_URL**: Your frontend URL (e.g., `https://yourdomain.com`)
✅ **JWT_SECRET**: Strong random string
✅ **PORT**: Usually 5000 or any available port
✅ **NODE_ENV**: `production`
✅ **AWS variables**: Leave empty or don't include them

### File Storage Location

Your media files will be stored at:
```
/home/username/domains/yourdomain.com/memtribe/backend/uploads/
```

**Make sure this directory has proper permissions**:
```bash
chmod -R 755 uploads
```

---

## Part 7: DNS Configuration in Hostinger

1. Go to Hostinger control panel
2. Navigate to **DNS/Nameservers**
3. Add A records:

```
Type: A
Name: @ (or yourdomain.com)
Points to: Your server IP
TTL: 14400

Type: A
Name: api
Points to: Your server IP
TTL: 14400

Type: A
Name: www
Points to: Your server IP
TTL: 14400
```

Wait for DNS propagation (can take up to 24-48 hours, but usually much faster).

---

## Part 8: Testing Your Deployment

### 1. Test Backend API

```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{"status":"OK","message":"MemTribe API is running"}
```

### 2. Test File Upload

Upload a test image through your frontend media upload feature.

Check if the file appears in:
```bash
ls -la /home/username/domains/yourdomain.com/memtribe/backend/uploads/
```

Access the file via browser:
```
https://api.yourdomain.com/uploads/filename.jpg
```

### 3. Test Frontend

Visit `https://yourdomain.com` and test:
- Login/Registration
- Event creation
- Media upload
- All other features

---

## Part 9: Monitoring & Maintenance

### Check Logs

Using PM2:
```bash
pm2 logs memtribe-api
pm2 monit
```

Using systemd:
```bash
sudo journalctl -u memtribe -f
```

Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

Backend:
```bash
pm2 restart memtribe-api
# or
sudo systemctl restart memtribe
```

Nginx:
```bash
sudo systemctl restart nginx
```

### Update Application

```bash
cd ~/domains/yourdomain.com/memtribe/backend
git pull
npm install
npx prisma migrate deploy
pm2 restart memtribe-api
```

---

## Part 10: Backup Strategy

### Database Backup

Create a daily backup script:

```bash
nano ~/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/username/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U your_db_user -d memtribe_db > $BACKUP_DIR/memtribe_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "memtribe_*.sql" -mtime +7 -delete
```

Make executable and add to cron:
```bash
chmod +x ~/backup-db.sh
crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /home/username/backup-db.sh
```

### Files Backup

Backup uploads folder:
```bash
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /home/username/domains/yourdomain.com/memtribe/backend/uploads/
```

---

## Troubleshooting

### Issue: Cannot connect to database

**Solution**:
- Verify DATABASE_URL in `.env`
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql -h localhost -U your_user -d memtribe_db`
- Check firewall rules

### Issue: File uploads not working

**Solution**:
- Check uploads directory exists and has permissions
- Verify BASE_URL in `.env` is correct
- Check Nginx file size limit: `client_max_body_size 50M;`
- Look at server logs for errors

### Issue: CORS errors

**Solution**:
- Verify CLIENT_URL in backend `.env` matches your frontend domain
- Check Nginx CORS headers are set properly

### Issue: 502 Bad Gateway

**Solution**:
- Backend is not running, check: `pm2 status` or `systemctl status memtribe`
- Wrong port in Nginx proxy_pass
- Check backend logs for errors

### Issue: Uploads folder getting too large

**Solution**:
Consider implementing:
- Image compression before upload
- Regular cleanup of old media
- Or switch to external storage service (Cloudinary, Backblaze B2, etc.)

---

## Alternative: Using Hostinger Object Storage (if available)

If Hostinger offers S3-compatible object storage, you can configure it:

1. Get your Hostinger object storage credentials
2. Update `.env`:
```env
AWS_ACCESS_KEY_ID=your_hostinger_access_key
AWS_SECRET_ACCESS_KEY=your_hostinger_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=your_region
S3_ENDPOINT=https://your-hostinger-s3-endpoint.com
```

3. Update `backend/src/services/s3.service.js` to use custom endpoint if needed.

---

## Performance Optimization

### 1. Enable Nginx Caching

Add to your Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_pass http://localhost:5000;
    # ... other proxy settings
}
```

### 2. Use CDN (Optional)

Consider Cloudflare's free CDN:
- Point your domain nameservers to Cloudflare
- Enable proxy for your domain
- Configure caching rules

### 3. Database Optimization

```bash
# Inside PostgreSQL
VACUUM ANALYZE;

# Add indexes for frequently queried fields
CREATE INDEX idx_events_user_id ON "Event"(user_id);
CREATE INDEX idx_media_event_id ON "Media"(event_id);
```

---

## Security Checklist

✅ Strong JWT_SECRET (minimum 32 characters)
✅ Database password is strong and secure
✅ SSL/HTTPS enabled for both frontend and backend
✅ Environment variables are not committed to Git
✅ Nginx has rate limiting configured
✅ Database backups are running
✅ File upload size limits are set
✅ CORS is properly configured
✅ Firewall rules are configured (UFW or similar)

---

## Cost Considerations on Hostinger

**Advantages of local storage vs AWS S3:**
- ✅ No per-request charges
- ✅ No data transfer fees
- ✅ Simpler setup
- ✅ One less external dependency

**Disadvantages:**
- ❌ Limited by server storage capacity
- ❌ Not as scalable for millions of files
- ❌ Backups are your responsibility
- ❌ No built-in CDN for global distribution

**When to consider external storage:**
- You expect to store hundreds of GBs of media
- You need global CDN distribution
- You want automatic backups and redundancy

**Recommended external services (if needed later):**
- Cloudinary (generous free tier, built-in image optimization)
- Backblaze B2 (cheaper than AWS S3)
- DigitalOcean Spaces (S3-compatible)

---

## Summary

Your application is **already configured** to work without AWS! Just:

1. Set up your Hostinger database
2. Deploy backend with correct `.env` (no AWS variables)
3. Build and deploy frontend
4. Configure Nginx
5. Set up SSL
6. Monitor and maintain

The local file storage will work automatically since AWS credentials are not provided.

---

## Support & Resources

- Hostinger Documentation: https://support.hostinger.com
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
- Nginx Documentation: https://nginx.org/en/docs/
- PM2 Documentation: https://pm2.keymetrics.io/docs/

---

## Need Help?

If you encounter issues:
1. Check the logs (PM2, Nginx, systemd)
2. Verify environment variables
3. Test each component individually
4. Review Hostinger's knowledge base
5. Check your application's error handling

Good luck with your deployment! 🚀

