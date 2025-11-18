# Slideshow Video Generation - Troubleshooting Guide

## Error: "Failed to load video encoder"

This error occurs when FFmpeg.wasm cannot be loaded. Here are the solutions:

---

## Solution 1: Add CORS Headers (Required for SharedArrayBuffer)

FFmpeg.wasm requires specific HTTP headers to enable SharedArrayBuffer for better performance.

### For Nginx (Hostinger VPS):

Add these headers to your Nginx config:

```nginx
# Edit your site config
sudo nano /etc/nginx/sites-available/your-site

# Add inside the server block:
server {
    # ... your existing config ...
    
    # Enable SharedArrayBuffer for FFmpeg.wasm
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Restart Nginx
sudo systemctl restart nginx
```

### For Netlify/Vercel:

Create a `public/_headers` file (already created):

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

### For Apache (.htaccess):

Add to your `.htaccess` file:

```apache
<IfModule mod_headers.c>
    Header set Cross-Origin-Embedder-Policy "require-corp"
    Header set Cross-Origin-Opener-Policy "same-origin"
</IfModule>
```

---

## Solution 2: Browser Compatibility Check

The video generation requires:

✅ **Supported Browsers:**
- Chrome/Edge 91+ ✅
- Firefox 89+ ✅
- Safari 15.2+ ✅
- Opera 77+ ✅

❌ **NOT Supported:**
- Internet Explorer (any version)
- Old browser versions
- Some mobile browsers (older versions)

**Test your browser:**
Open browser console (F12) and run:
```javascript
console.log('WebAssembly:', typeof WebAssembly !== 'undefined' ? '✅' : '❌');
console.log('SharedArrayBuffer:', typeof SharedArrayBuffer !== 'undefined' ? '✅' : '❌');
```

---

## Solution 3: Check Internet Connection

FFmpeg.wasm loads from CDN (~2.5MB download). Ensure:
- ✅ Stable internet connection
- ✅ No firewall blocking unpkg.com or jsdelivr.net
- ✅ No content blockers interfering

**Test CDN access:**
Open these URLs in your browser:
- https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js
- https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js

Both should download JavaScript files.

---

## Solution 4: Clear Browser Cache

Sometimes old cached files cause issues:

**Chrome/Edge:**
1. Press Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Hard refresh page (Ctrl+F5)

**Firefox:**
1. Press Ctrl+Shift+Delete
2. Select "Cache"
3. Click "Clear Now"
4. Hard refresh page (Ctrl+F5)

**Safari:**
1. Safari menu → Clear History
2. Select "all history"
3. Click "Clear History"
4. Hard refresh page (Cmd+Option+R)

---

## Solution 5: Try Different Browser

If one browser fails, try another:
1. Chrome (most reliable) ✅
2. Firefox (good alternative)
3. Edge (Chromium-based, similar to Chrome)

---

## Solution 6: Rebuild and Redeploy

The code has been updated with better error handling:

```bash
# Rebuild with latest fixes
npm run build

# Redeploy dist folder to production
# (Use your deployment method)
```

**What changed:**
- ✅ Multiple CDN fallbacks
- ✅ Better error messages
- ✅ Browser compatibility checks
- ✅ ESM distribution (more reliable)

---

## Solution 7: Check Browser Console

Open browser console (F12) and look for errors:

**Common Issues:**

### "SharedArrayBuffer is not defined"
**Fix:** Add CORS headers (Solution 1)

### "Failed to fetch"
**Fix:** Check internet connection and CDN access (Solution 3)

### "WebAssembly is not defined"
**Fix:** Update browser to modern version

### CORS errors
**Fix:** Images must be from same domain or have CORS enabled

---

## Solution 8: Test with Small Event

Start with a small test:
1. Create event with 2-3 images only
2. Try generating video
3. If it works, the issue was memory/performance
4. If it fails, the issue is configuration

---

## Solution 9: Disable Browser Extensions

Some extensions block WebAssembly or CDN requests:

1. Open browser in Incognito/Private mode
2. Try video generation
3. If it works, an extension was blocking it
4. Disable extensions one by one to find culprit

**Common culprits:**
- Ad blockers
- Privacy extensions
- Script blockers
- Content security extensions

---

## Solution 10: Use Alternative Browser Settings

### Enable JavaScript & WebAssembly:

**Chrome:**
1. Settings → Privacy and Security
2. Site Settings → JavaScript
3. Ensure "Sites can use Javascript" is enabled

**Firefox:**
1. about:config
2. Search: javascript.options.wasm
3. Ensure it's true

---

## Quick Diagnostic Script

Run this in browser console to diagnose issues:

```javascript
// Diagnostic check
console.log('=== FFmpeg.wasm Diagnostic ===');
console.log('WebAssembly support:', typeof WebAssembly !== 'undefined' ? '✅' : '❌ UPDATE BROWSER');
console.log('SharedArrayBuffer:', typeof SharedArrayBuffer !== 'undefined' ? '✅' : '⚠️ ADD CORS HEADERS');
console.log('Browser:', navigator.userAgent);
console.log('Online:', navigator.onLine ? '✅' : '❌ CHECK CONNECTION');

// Test CDN access
fetch('https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js', {method: 'HEAD'})
  .then(() => console.log('unpkg.com CDN:', '✅'))
  .catch(() => console.log('unpkg.com CDN:', '❌ BLOCKED OR OFFLINE'));

fetch('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js', {method: 'HEAD'})
  .then(() => console.log('jsdelivr.net CDN:', '✅'))
  .catch(() => console.log('jsdelivr.net CDN:', '❌ BLOCKED OR OFFLINE'));

console.log('=== End Diagnostic ===');
```

---

## Still Not Working?

### Workaround: Use Different Device/Computer

If the issue persists on one device:
1. Try from different computer
2. Try from mobile device
3. Try from different network

This helps identify if it's:
- Device-specific issue
- Network/firewall issue
- Server configuration issue

---

## Server-Side Verification

### Check Headers Are Applied:

```bash
# Test your production site
curl -I https://yourdomain.com

# Look for these headers in response:
# Cross-Origin-Embedder-Policy: require-corp
# Cross-Origin-Opener-Policy: same-origin
```

Or use online tool:
- https://securityheaders.com/
- Enter your domain
- Check for COOP and COEP headers

---

## Alternative: Simplified HTML Download (Fallback)

If video generation consistently fails, you can offer HTML download as fallback:

```javascript
// In EventSlideshow.jsx, catch video error and offer HTML download
try {
  await generateSlideshowVideo(...);
} catch (error) {
  console.error(error);
  // Offer HTML slideshow download as fallback
  downloadHTMLSlideshow();
}
```

---

## Summary Checklist

Before reporting issues, verify:

- [ ] Using modern browser (Chrome 91+, Firefox 89+, Safari 15+)
- [ ] CORS headers added to server config
- [ ] Browser cache cleared
- [ ] JavaScript enabled
- [ ] No ad blockers interfering
- [ ] Stable internet connection
- [ ] CDNs accessible (unpkg.com, jsdelivr.net)
- [ ] Latest code deployed (with fixes)
- [ ] Console shows no CORS errors
- [ ] Tested in different browser

---

## Contact Support

If none of these solutions work, provide:

1. **Browser info:** Version and name
2. **Console errors:** Full error messages
3. **Diagnostic results:** From script above
4. **Server type:** Nginx, Apache, Netlify, etc.
5. **Domain:** Your production URL
6. **Screenshots:** Of error messages

---

## Performance Notes

**Expected behavior:**
- First load: 5-10 seconds (downloading FFmpeg.wasm)
- Subsequent loads: Instant (cached)
- Video generation: 30-90 seconds for 10 images
- Progress bar shows: 0% → 100%

**If it's extremely slow:**
- Check device RAM (needs ~300MB free)
- Close other browser tabs
- Try with fewer images first
- Check CPU usage

---

## Success Indicators

When working correctly:
1. ✅ Click "Download Video" button
2. ✅ See "Attempting to load FFmpeg from..." in console
3. ✅ See "FFmpeg loaded successfully!" in console
4. ✅ Progress bar moves from 0% → 100%
5. ✅ MP4 file downloads automatically
6. ✅ Video plays in media player

---

## Need Help?

1. Run diagnostic script
2. Check browser console
3. Verify headers are set
4. Try different browser
5. Clear cache and retry

Most issues are solved by adding CORS headers (Solution 1) or using a modern browser! 🎬

