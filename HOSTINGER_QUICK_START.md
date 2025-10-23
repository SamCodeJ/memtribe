# 🚀 Quick Start: Deploying MemTribe to Hostinger

## Good News! 

Your application **already works without AWS**! It automatically falls back to local file storage when AWS credentials are not provided.

---

## 📋 What You Need

1. **Hostinger VPS or Business Plan** (with Node.js support)
2. **PostgreSQL Database** (create in Hostinger panel)
3. **Domain Name** (configured in Hostinger)
4. **SSH Access** to your server

---

## ⚡ Quick Setup Steps

### 1️⃣ Backend Setup on Hostinger

```bash
# SSH into your server
ssh your_username@your_hostinger_ip

# Navigate to your domain directory
cd ~/domains/yourdomain.com

# Clone or upload your code
git clone your-repo-url memtribe
cd memtribe/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Add this to your .env file:**

```env
NODE_ENV=production
PORT=5000
BASE_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://username:password@localhost:5432/memtribe_db
JWT_SECRET=4f1db4a01d7991c0949a6aa6d98606530461c04b838cac8bc7f7791afaa581d7
CLIENT_URL=https://yourdomain.com
RESEND_API_KEY=your_resend_api_key

# DO NOT ADD AWS VARIABLES - local storage will be used automatically
```

**Run migrations:**

```bash
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed  # Optional
```

**Start with PM2:**

```bash
npm install -g pm2
pm2 start src/server.js --name memtribe-api
pm2 save
pm2 startup
```

### 2️⃣ Configure Nginx

Create `/etc/nginx/sites-available/memtribe-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias /home/username/domains/yourdomain.com/memtribe/backend/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/memtribe-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3️⃣ Add SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 4️⃣ Deploy Frontend

**On your local machine:**

```bash
# Update API URL in your frontend code
# src/api/client.js or similar

# Build
npm run build

# Upload dist folder to Hostinger
scp -r dist/* username@your_hostinger_ip:/home/username/domains/yourdomain.com/public_html/
```

**Configure Nginx for frontend** (`/etc/nginx/sites-available/memtribe-frontend`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/username/domains/yourdomain.com/public_html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and add SSL:

```bash
sudo ln -s /etc/nginx/sites-available/memtribe-frontend /etc/nginx/sites-enabled/
sudo systemctl restart nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🧪 Testing

### Test Backend:
```bash
curl https://api.yourdomain.com/health
```

### Test File Upload:
1. Upload an image through your frontend
2. Check: `ls ~/domains/yourdomain.com/memtribe/backend/uploads/`
3. Access: `https://api.yourdomain.com/uploads/filename.jpg`

---

## 📁 File Storage

**Where files are stored:**
```
/home/username/domains/yourdomain.com/memtribe/backend/uploads/
```

**How it works:**
- Files are saved locally (no AWS needed)
- Served via Nginx at `/uploads` route
- Accessible at: `https://api.yourdomain.com/uploads/filename.jpg`

**Storage Limits:**
- Check your Hostinger plan's disk space
- Monitor usage: `du -sh ~/domains/yourdomain.com/memtribe/backend/uploads/`

---

## 🔧 Common Commands

### Check Backend Status:
```bash
pm2 status
pm2 logs memtribe-api
```

### Restart Backend:
```bash
pm2 restart memtribe-api
```

### Check Nginx:
```bash
sudo nginx -t
sudo systemctl status nginx
```

### View Logs:
```bash
# Backend logs
pm2 logs memtribe-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Update Application:
```bash
cd ~/domains/yourdomain.com/memtribe/backend
git pull
npm install
npx prisma migrate deploy
pm2 restart memtribe-api
```

---

## 🚨 Important Notes

### ✅ What's Already Working:

- **Local file storage** (no AWS needed)
- **Automatic fallback** when AWS is not configured
- **Static file serving** via Express
- **CORS headers** for uploads
- **File size limits** (50MB)

### ⚠️ Things to Remember:

1. **Don't add AWS credentials** - the app will use local storage
2. **Set proper permissions** on uploads folder: `chmod 755 uploads`
3. **Monitor disk space** - files accumulate over time
4. **Set up backups** for database and uploads folder
5. **Use strong JWT_SECRET** - never use default values

### 🔒 Security:

- Change default JWT_SECRET
- Use strong database password
- Keep .env file secure (never commit to Git)
- Enable firewall (UFW)
- Keep system updated: `sudo apt update && sudo apt upgrade`

---

## 📚 More Information

For detailed deployment guide, see: **[HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md)**

For environment variables, see: **[ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md)**

---

## 💡 Tips

### If uploads folder gets too large:

**Option 1: Implement cleanup**
- Delete old/unused media periodically
- Compress images before storage

**Option 2: Use external storage**
- Cloudinary (free tier, auto optimization)
- Backblaze B2 (cheap, S3-compatible)
- DigitalOcean Spaces (S3-compatible)

### For better performance:

- Enable Nginx caching
- Use Cloudflare CDN (free)
- Optimize images before upload
- Add database indexes

### For scaling:

- Upgrade Hostinger plan for more storage
- Use external object storage for media
- Implement CDN for global distribution
- Add Redis for caching

---

## ✨ You're All Set!

Your application is ready for Hostinger deployment without any AWS dependencies. The local file storage will work automatically! 🎉

**Need help?** Check the detailed guide or logs:
- Backend: `pm2 logs memtribe-api`
- Nginx: `/var/log/nginx/error.log`
- System: `sudo journalctl -xe`

