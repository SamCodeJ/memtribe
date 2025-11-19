# 🚀 DEPLOY NOW - Quick Guide

## ✅ What's Ready

Your app is **built and ready to deploy** with self-hosted FFmpeg files.

## 📁 What to Upload

Upload **EVERYTHING** from the `dist/` folder:

```
dist/
├── _headers                    ← IMPORTANT: Upload this!
├── index.html
├── test-ffmpeg.html
├── assets/                     ← All JavaScript/CSS files
│   ├── index-BzuGdEpR.js
│   ├── index-CIrl16zc.css
│   └── ... (all other files)
└── ffmpeg-core/                ← CRITICAL: Upload this folder!
    ├── ffmpeg-core.js          (~520 KB)
    └── ffmpeg-core.wasm        (~31 MB) ← Large file, may take time
```

## ⚡ Quick Upload Options

### Option 1: FTP/SFTP (FileZilla, WinSCP)
1. Connect to your server
2. Navigate to website root (usually `public_html` or `domains/memtribe.com`)
3. **Delete old files first** or upload with overwrite
4. Upload entire `dist/` folder contents
5. **Verify `ffmpeg-core` folder uploaded with both files**

### Option 2: Hostinger File Manager
1. Log into Hostinger control panel
2. Go to File Manager
3. Navigate to website root
4. Upload all `dist/` files
5. Make sure `ffmpeg-core` folder has both files (check file sizes)

### Option 3: Command Line (if you have SSH)
```powershell
# In PowerShell (on your computer)
cd C:\Users\Donation\Documents\ReactProjects\memtribe

# Create zip file
Compress-Archive -Path dist\* -DestinationPath memtribe-dist.zip

# Upload to server (replace with your details)
scp memtribe-dist.zip username@server:/path/to/website/

# Then on server:
ssh username@server
cd /path/to/website/
unzip -o memtribe-dist.zip
rm memtribe-dist.zip
```

## ✅ After Upload - Test Immediately

1. **Clear browser cache**: Ctrl+Shift+R (Chrome/Firefox)
2. **Test FFmpeg Loading**: https://memtribe.com/test-ffmpeg.html
   - Should show: "✅ SUCCESS with self-hosted (local)"
3. **Test Slideshow**: 
   - Go to any event
   - Click "Slideshow"
   - Click "Download Video"
   - Should work now! 🎉

## 🔍 Quick Verification

Check if files are accessible:
- https://memtribe.com/ffmpeg-core/ffmpeg-core.js (should download/show)
- https://memtribe.com/ffmpeg-core/ffmpeg-core.wasm (should download)

If these URLs return 404, the files weren't uploaded correctly.

## ⚠️ Important Notes

1. **Large File**: The `ffmpeg-core.wasm` file is 31 MB
   - FTP upload may take 1-5 minutes depending on your connection
   - Don't interrupt the upload!
   - Verify the uploaded file size matches (~31 MB)

2. **Overwrite Everything**: Make sure to replace all old files
   - Old JavaScript files may cause conflicts
   - Clear old `assets/` folder first

3. **_headers File**: Must be in the root
   - Some FTP clients hide files starting with `_`
   - Make sure it's uploaded (not just `_headers.txt`)

## 🎯 Expected Console Output

When it works, you'll see:

```
🔍 Checking environment:
  - SharedArrayBuffer available: true
  - WebAssembly available: true

🔄 Attempting: self-hosted (local)
   Strategy: direct
   Base URL: /ffmpeg-core
   → Using direct CDN URLs...
   → Loading FFmpeg...

✅ SUCCESS! FFmpeg loaded from: self-hosted (local)
   Core version: 0.12.10
   Mode: single-threaded
```

Then video generation will start and complete!

## 🆘 If Upload Fails

If FTP/file upload is too slow for the 31 MB file:

**Alternative**: Download directly on the server
```bash
# SSH into your server
ssh username@server
cd /path/to/website/ffmpeg-core/

# Download files directly
wget https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js
wget https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm

# Check file sizes
ls -lh
# Should show: ffmpeg-core.js (~520K), ffmpeg-core.wasm (~31M)
```

## 📊 Deployment Time Estimate

| Method | Upload Time | Difficulty |
|--------|-------------|------------|
| FTP (slow) | 5-10 min | Easy |
| FTP (fast) | 1-2 min | Easy |
| SSH/SCP | 1-2 min | Medium |
| Direct wget on server | 30 sec | Medium |

---

**Ready? Upload the `dist/` folder now and let me know when it's done!** 🚀

After upload, test at: https://memtribe.com/test-ffmpeg.html

