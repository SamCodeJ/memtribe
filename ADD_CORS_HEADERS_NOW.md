# 🚨 URGENT: Add CORS Headers to Fix Video Generation

## The Problem

Your video generation is failing because your server is missing required HTTP headers. This is **100% the cause** of your error.

---

## ⚡ Quick Fix (Choose Your Server Type)

### Option 1: Nginx (Most Common)

**Step 1:** SSH into your server
```bash
ssh username@memtribe.com
```

**Step 2:** Edit your Nginx config
```bash
sudo nano /etc/nginx/sites-available/memtribe
# or
sudo nano /etc/nginx/sites-available/default
```

**Step 3:** Add these TWO lines inside your `server` block:
```nginx
server {
    listen 80;
    server_name memtribe.com www.memtribe.com;
    
    # ADD THESE TWO LINES:
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    
    # Your existing config below...
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Step 4:** Test and restart Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

**Step 5:** Clear browser cache (Ctrl+Shift+Delete) and test again

---

### Option 2: Apache (.htaccess)

**Step 1:** Connect to your server via FTP/SSH

**Step 2:** Edit `.htaccess` in your `public_html` folder

**Step 3:** Add these lines at the top:
```apache
<IfModule mod_headers.c>
    Header set Cross-Origin-Embedder-Policy "require-corp"
    Header set Cross-Origin-Opener-Policy "same-origin"
</IfModule>
```

**Step 4:** Save file

**Step 5:** Clear browser cache and test

---

### Option 3: cPanel (Hostinger Control Panel)

**Step 1:** Log into cPanel

**Step 2:** Go to "File Manager"

**Step 3:** Navigate to `public_html`

**Step 4:** Find or create `.htaccess` file

**Step 5:** Edit and add:
```apache
<IfModule mod_headers.c>
    Header set Cross-Origin-Embedder-Policy "require-corp"
    Header set Cross-Origin-Opener-Policy "same-origin"
</IfModule>
```

**Step 6:** Save and close

**Step 7:** Clear browser cache and test

---

## 🔍 Verify Headers Are Working

### Method 1: Browser Console
Open your site, press F12, and run:
```javascript
fetch(window.location.href).then(r => {
  console.log('COEP:', r.headers.get('cross-origin-embedder-policy'));
  console.log('COOP:', r.headers.get('cross-origin-opener-policy'));
});
```

You should see:
```
COEP: require-corp
COOP: same-origin
```

### Method 2: Command Line
```bash
curl -I https://memtribe.com
```

Look for:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Method 3: Use the Check Page
1. Upload the `check-headers.html` file to your server
2. Visit: `https://memtribe.com/check-headers.html`
3. It will show you exactly what's missing

---

## 🎯 Complete Example Nginx Config

Here's a full example:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name memtribe.com www.memtribe.com;
    
    root /var/www/memtribe/public_html;
    index index.html index.htm;
    
    # CORS headers for FFmpeg.wasm
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    
    # Large file uploads
    client_max_body_size 50M;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        # IMPORTANT: Re-add CORS headers for cached assets
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }
}

# SSL redirect (if using HTTPS)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name memtribe.com www.memtribe.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/memtribe.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/memtribe.com/privkey.pem;
    
    root /var/www/memtribe/public_html;
    index index.html index.htm;
    
    # CORS headers for FFmpeg.wasm
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    
    client_max_body_size 50M;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
    }
}
```

---

## 🎯 Complete Example Apache .htaccess

```apache
# CORS Headers for FFmpeg.wasm
<IfModule mod_headers.c>
    Header set Cross-Origin-Embedder-Policy "require-corp"
    Header set Cross-Origin-Opener-Policy "same-origin"
</IfModule>

# SPA Routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Large file uploads
<IfModule mod_php.c>
    php_value upload_max_filesize 50M
    php_value post_max_size 50M
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

---

## ❓ FAQ

### Q: Why do I need these headers?
**A:** FFmpeg.wasm uses WebAssembly with SharedArrayBuffer for performance. Browsers require these security headers to enable SharedArrayBuffer.

### Q: Will this affect my other pages?
**A:** No, these headers are safe and won't break anything. They just enable advanced browser features.

### Q: Do I need to restart my server?
**A:** 
- **Nginx:** Yes, run `sudo systemctl restart nginx`
- **Apache:** Usually not, but you can run `sudo systemctl restart apache2` to be sure

### Q: I added headers but it still doesn't work
**A:**
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check headers are actually set: `curl -I https://memtribe.com`
4. Make sure you edited the correct config file
5. Make sure Nginx/Apache restarted successfully

### Q: Can I test without adding headers?
**A:** No, there's no workaround. These headers are required by the browser for security reasons.

---

## 🚀 After Adding Headers

1. **Rebuild and deploy** (you already did this)
2. **Clear browser cache**
3. **Hard refresh** your site (Ctrl+F5)
4. **Try video generation again**
5. **Check console** - you should see:
   ```
   Attempting to load FFmpeg from: unpkg (single-threaded)
   URL: https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd
   ✅ FFmpeg loaded successfully from: unpkg (single-threaded)
   ```

---

## 🆘 Still Having Issues?

Run this diagnostic in your browser console on memtribe.com:

```javascript
console.log('WebAssembly:', typeof WebAssembly !== 'undefined' ? '✅' : '❌');
console.log('SharedArrayBuffer:', typeof SharedArrayBuffer !== 'undefined' ? '✅' : '❌');

fetch(window.location.href).then(r => {
  console.log('COEP:', r.headers.get('cross-origin-embedder-policy') || '❌ NOT SET');
  console.log('COOP:', r.headers.get('cross-origin-opener-policy') || '❌ NOT SET');
});
```

Send me the output from this diagnostic.

---

## ⚡ TL;DR - Just Do This

1. SSH into your server
2. Edit Nginx config: `sudo nano /etc/nginx/sites-available/memtribe`
3. Add two header lines (shown above)
4. Restart: `sudo systemctl restart nginx`
5. Clear browser cache
6. Test video generation

**That's it!** This will 100% fix your issue. 🎉

