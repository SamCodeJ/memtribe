# 🔍 Check If FFmpeg Files Are Uploaded

## Quick Check - Open These URLs in Your Browser:

1. **Check JavaScript file**: 
   https://memtribe.com/ffmpeg-core/ffmpeg-core.js
   
   - ✅ Should download or show JavaScript code
   - ❌ If you see 404 = Files not uploaded

2. **Check WASM file**:
   https://memtribe.com/ffmpeg-core/ffmpeg-core.wasm
   
   - ✅ Should download a 31 MB file
   - ❌ If you see 404 = Files not uploaded

## What Should You See?

### ✅ If Files Are Uploaded Correctly:
- The JavaScript file opens or downloads
- The WASM file downloads (~31 MB)
- Both return HTTP 200 (not 404)

### ❌ If You See 404:
The files aren't on your server yet! You need to upload them.

---

## How to Upload the FFmpeg Files

### Method 1: Via SSH (Fastest)

```bash
# On your local machine (PowerShell):
cd C:\Users\Donation\Documents\ReactProjects\memtribe

# Compress the ffmpeg-core folder
Compress-Archive -Path dist\ffmpeg-core -DestinationPath ffmpeg-core.zip

# Upload to server
scp ffmpeg-core.zip username@your-server:/tmp/

# On server:
ssh username@your-server
cd /var/www/memtribe/dist/
unzip -o /tmp/ffmpeg-core.zip
ls -lh ffmpeg-core/
# Should show: ffmpeg-core.js (~520K) and ffmpeg-core.wasm (~31M)
```

### Method 2: Via FTP/SFTP (FileZilla, WinSCP)

1. **Connect to your server** using FTP client
2. **Navigate to**: `/var/www/memtribe/dist/`
3. **Create folder**: `ffmpeg-core` (if it doesn't exist)
4. **Upload these files** from your local `dist/ffmpeg-core/` folder:
   - `ffmpeg-core.js` (520 KB)
   - `ffmpeg-core.wasm` (31 MB) ⚠️ Large file, takes time!
5. **Verify** both files are there

### Method 3: Via Hosting Control Panel

If you have a file manager in your hosting control panel:

1. **Log into hosting panel**
2. **Go to File Manager**
3. **Navigate to**: `/var/www/memtribe/dist/`
4. **Create folder**: `ffmpeg-core`
5. **Upload files** from `C:\Users\Donation\Documents\ReactProjects\memtribe\dist\ffmpeg-core\`
   - Upload `ffmpeg-core.js`
   - Upload `ffmpeg-core.wasm` (be patient, 31 MB)

---

## After Upload - Verify Files Exist on Server

### Via SSH:
```bash
ssh username@your-server
cd /var/www/memtribe/dist/ffmpeg-core/
ls -lh

# Should show:
# -rw-r--r-- 1 user user  520K Nov 19 23:00 ffmpeg-core.js
# -rw-r--r-- 1 user user   31M Nov 19 23:00 ffmpeg-core.wasm
```

### Via Browser:
Just open these URLs:
- https://memtribe.com/ffmpeg-core/ffmpeg-core.js
- https://memtribe.com/ffmpeg-core/ffmpeg-core.wasm

Both should work (not 404).

---

## Common Issues & Solutions

### Issue: "I uploaded but still getting 404"

**Check file permissions:**
```bash
ssh username@your-server
cd /var/www/memtribe/dist/
chmod 755 ffmpeg-core
chmod 644 ffmpeg-core/*
```

**Check file ownership:**
```bash
sudo chown -R www-data:www-data /var/www/memtribe/dist/ffmpeg-core/
# Or
sudo chown -R nginx:nginx /var/www/memtribe/dist/ffmpeg-core/
```

### Issue: "Files are there but still not loading"

**Check Nginx config:**
```bash
# Make sure this is in your Nginx config:
location /ffmpeg-core/ {
    root /var/www/memtribe/dist;
    try_files $uri =404;
}

# Then reload:
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: "Upload is too slow (31 MB file)"

**Download directly on server instead:**
```bash
ssh username@your-server
cd /var/www/memtribe/dist/
mkdir -p ffmpeg-core
cd ffmpeg-core
wget https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js
wget https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm
ls -lh
```

This downloads the files directly to your server (much faster than uploading from your computer).

---

## Test After Upload

1. **Check URLs work**:
   - https://memtribe.com/ffmpeg-core/ffmpeg-core.js ✅
   - https://memtribe.com/ffmpeg-core/ffmpeg-core.wasm ✅

2. **Clear browser cache**: Ctrl+Shift+R

3. **Try video generation again**

4. **Check console** - Should now show:
   ```
   🔄 Attempting: self-hosted (local)
   ✅ SUCCESS! FFmpeg loaded from: self-hosted (local)
   ```

---

## Quick Diagnostic Commands

Run these on your server to check everything:

```bash
# Check if files exist:
ls -lh /var/www/memtribe/dist/ffmpeg-core/

# Check if Nginx can read them:
sudo -u www-data cat /var/www/memtribe/dist/ffmpeg-core/ffmpeg-core.js | head -n 1

# Check file permissions:
stat /var/www/memtribe/dist/ffmpeg-core/ffmpeg-core.wasm

# Test Nginx config:
sudo nginx -t

# Check Nginx error log:
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 Most Likely Issue:

The `dist/ffmpeg-core/` folder **wasn't uploaded** to your server yet.

**Solution**: Upload the folder using one of the methods above, then test again!

