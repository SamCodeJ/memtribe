# How to Configure Your Server for FFmpeg

## Step 1: Determine Your Hosting Type

### Quick Check: What hosting are you using?

Run this command to check your server type:
```bash
curl -I https://memtribe.com | grep -i server
```

Or check in browser DevTools:
1. Open https://memtribe.com
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Click on the first request (usually the HTML file)
6. Look at Response Headers → "Server" field

You'll see something like:
- `Server: nginx` → You're using Nginx
- `Server: Apache` → You're using Apache
- `Server: cloudflare` → Using Cloudflare (may have Nginx/Apache behind it)
- No server header → Likely using Netlify, Vercel, or similar

## Step 2: Access Your Server

### Option A: If Using Netlify/Vercel (Easiest!)

✅ **NO MANUAL CONFIGURATION NEEDED!**

The `_headers` file in your `dist/` folder will automatically work. Just:
1. Upload all `dist/` files
2. The `_headers` file will be read automatically
3. Done! ✅

---

### Option B: If Using Hostinger or VPS

You need SSH access:

#### Connect via SSH:
```bash
ssh username@your-server-ip
# OR
ssh username@memtribe.com
```

**Don't have SSH credentials?**
- Check your Hostinger email for SSH details
- Or log into Hostinger control panel → SSH Access section
- Default username is usually your hosting username
- IP address is in your hosting control panel

#### Can't use SSH?
Use Hostinger File Manager:
1. Log into Hostinger control panel (hPanel)
2. Click "File Manager"
3. Navigate to your website folder
4. You can edit files directly in the browser

---

## Step 3: Configure Based on Your Server Type

### 🟦 NGINX Configuration

#### Find the Nginx Config File:

Once connected via SSH:
```bash
# Find your site's config file (most common locations):
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/conf.d/

# Or search for memtribe config:
sudo find /etc/nginx -name "*memtribe*"
```

Common locations:
- `/etc/nginx/sites-available/memtribe.com`
- `/etc/nginx/sites-available/default`
- `/etc/nginx/conf.d/memtribe.com.conf`

#### Edit the Config File:

```bash
# Once you find it (example):
sudo nano /etc/nginx/sites-available/memtribe.com

# Or use vim:
sudo vim /etc/nginx/sites-available/memtribe.com
```

#### Add These Lines:

Find the `server {` block and add inside it:

```nginx
server {
    listen 443 ssl;
    server_name memtribe.com;
    
    # Add these lines anywhere in the server block:
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    
    # Add this location block for FFmpeg files:
    location /ffmpeg-core/ {
        add_header Cross-Origin-Resource-Policy "same-origin" always;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }
    
    # Your existing location block stays as is:
    location / {
        root /path/to/your/website;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Save and Apply:

**If using nano:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

**If using vim:**
- Press `Esc`
- Type `:wq`
- Press `Enter`

**Test and reload:**
```bash
# Test config syntax:
sudo nginx -t

# If OK, reload:
sudo systemctl reload nginx

# Or restart if needed:
sudo systemctl restart nginx
```

---

### 🟧 APACHE Configuration

#### Option 1: Using .htaccess (Easiest)

The `.htaccess` file goes in your **website root folder** (where your HTML files are).

**Find your website root:**
```bash
# Common locations:
/var/www/html/
/var/www/memtribe/
/home/username/public_html/
/home/username/domains/memtribe.com/public_html/
```

**Create/Edit .htaccess:**
```bash
# Navigate to your website root:
cd /var/www/html/  # or wherever your site is

# Create or edit .htaccess:
nano .htaccess
```

**Add these lines:**
```apache
# FFmpeg CORS Headers
<IfModule mod_headers.c>
    # Global headers
    Header always set Cross-Origin-Embedder-Policy "require-corp"
    Header always set Cross-Origin-Opener-Policy "same-origin"
    
    # FFmpeg-specific files
    <FilesMatch "\.(wasm|js)$">
        Header always set Cross-Origin-Resource-Policy "same-origin"
        Header always set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</IfModule>
```

**Save:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

**No restart needed** - Apache reads .htaccess automatically!

#### Option 2: Apache Main Config (More Permanent)

If you have root access:

```bash
# Find your site's config:
ls -la /etc/apache2/sites-available/

# Edit it:
sudo nano /etc/apache2/sites-available/memtribe.com.conf
```

Add inside `<VirtualHost *:443>`:
```apache
<VirtualHost *:443>
    ServerName memtribe.com
    
    # Add these lines:
    <IfModule mod_headers.c>
        Header always set Cross-Origin-Embedder-Policy "require-corp"
        Header always set Cross-Origin-Opener-Policy "same-origin"
        
        <FilesMatch "\.(wasm|js)$">
            Header always set Cross-Origin-Resource-Policy "same-origin"
        </FilesMatch>
    </IfModule>
    
    # Your existing config...
</VirtualHost>
```

**Save and reload:**
```bash
# Test config:
sudo apache2ctl configtest

# Reload:
sudo systemctl reload apache2
```

---

## Step 4: Using Hostinger File Manager (No SSH)

If you don't have SSH or prefer GUI:

### For .htaccess (Apache):

1. **Log into Hostinger hPanel**
2. **Click "File Manager"**
3. **Navigate to your website folder** (usually `public_html` or `domains/memtribe.com/public_html`)
4. **Look for `.htaccess` file**:
   - If it exists: Click to edit
   - If not: Click "New File" → Name it `.htaccess`
5. **Add the Apache configuration** (see above)
6. **Save**

### For Nginx:

Nginx config usually can't be edited via File Manager. You'll need:
- SSH access, OR
- Contact Hostinger support to add the headers, OR
- Use their control panel's "Custom Headers" feature (if available)

---

## Step 5: Verify Configuration

After making changes, verify the headers are working:

```bash
# Check main page:
curl -I https://memtribe.com | grep Cross-Origin

# Check FFmpeg files:
curl -I https://memtribe.com/ffmpeg-core/ffmpeg-core.js | grep Cross-Origin
```

Should show:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

Or check in browser:
1. Open https://memtribe.com
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Click on the first request
6. Look at Response Headers
7. Should see all three "Cross-Origin" headers

---

## Quick Reference: File Locations

### Nginx Configs:
```
/etc/nginx/sites-available/memtribe.com
/etc/nginx/sites-available/default
/etc/nginx/conf.d/memtribe.com.conf
/etc/nginx/nginx.conf
```

### Apache Configs:
```
/etc/apache2/sites-available/memtribe.com.conf
/etc/apache2/sites-available/000-default-le-ssl.conf
/etc/httpd/conf.d/memtribe.com.conf
```

### .htaccess Location:
```
/var/www/html/.htaccess
/var/www/memtribe/.htaccess
/home/username/public_html/.htaccess
/home/username/domains/memtribe.com/public_html/.htaccess
```

### Hostinger Specific:
```
/home/username/domains/memtribe.com/public_html/.htaccess
/home/username/public_html/.htaccess
```

---

## 🆘 Can't Find Config Files?

### Method 1: Ask Hostinger Support
Most hosting providers can add these headers for you:

**Email Hostinger Support:**
```
Subject: Add CORS Headers for FFmpeg Support

Hi,

I need these HTTP headers added to my site (memtribe.com):
- Cross-Origin-Embedder-Policy: require-corp
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Resource-Policy: same-origin (for /ffmpeg-core/ path)

These are needed for WebAssembly SharedArrayBuffer support.

Thank you!
```

### Method 2: Use Cloudflare Workers (If using Cloudflare)

If memtribe.com is behind Cloudflare, you can add headers via Workers.

### Method 3: Alternative Solution - Remove CORS Headers

If configuration is too difficult, there's a fallback:

**Remove the CORS headers entirely** and it will still work (just slower):
1. Delete `_headers` file from your deployment
2. Video generation will use single-threaded mode
3. Slower (60-120 sec vs 30-60 sec) but functional

---

## Summary: What You Need to Do

1. ✅ **Upload all `dist/` files** (most important!)
2. ⚠️ **Add server headers** (for better performance):
   - **Easy**: Use `.htaccess` if Apache
   - **Easy**: Let `_headers` work if Netlify/Vercel
   - **Medium**: Edit Nginx config if VPS
   - **Alternative**: Skip headers, accept slower performance

The app **will work without the headers**, just slower. The headers are an optimization, not a requirement!

---

## Need Help?

Tell me:
1. What hosting provider? (Hostinger? DigitalOcean? AWS? Netlify?)
2. Do you have SSH access? (yes/no)
3. Can you access File Manager? (yes/no)

I'll give you specific instructions for your setup!

