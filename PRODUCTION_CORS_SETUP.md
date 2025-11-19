# Production Server CORS Setup for FFmpeg Video Generation

## Overview
The slideshow video generation feature requires specific CORS headers to enable SharedArrayBuffer support for better performance. Without these headers, the feature will work but may be slower (single-threaded mode only).

## Required Headers
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

## Server Configuration Examples

### Nginx
Add to your server block or location block:

```nginx
server {
    listen 443 ssl;
    server_name memtribe.com;
    
    # Add these headers for FFmpeg support
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    
    # Your other configuration...
    location / {
        root /var/www/memtribe;
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache
Add to your `.htaccess` file or Apache configuration:

```apache
<IfModule mod_headers.c>
    Header always set Cross-Origin-Embedder-Policy "require-corp"
    Header always set Cross-Origin-Opener-Policy "same-origin"
</IfModule>
```

### Node.js/Express
Add middleware to your Express app:

```javascript
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});
```

### Cloudflare Workers
Add to your worker or Page Rules:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch(request);
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  
  return newResponse;
}
```

### Netlify
Create a `_headers` file in your publish directory:

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

### Vercel
Add to your `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

## Important Notes

### 1. **All Resources Must Be CORS-Compatible**
Once you enable these headers, ALL resources (images, scripts, styles) must be either:
- From the same origin
- Served with `Cross-Origin-Resource-Policy: cross-origin` header
- Served with proper CORS headers

### 2. **Third-Party Resources**
If you're loading resources from external CDNs (e.g., Google Fonts, external images), they must support CORS. Consider:
- Self-hosting critical resources
- Using a proxy for external resources
- Ensuring external CDNs send proper CORS headers

### 3. **Development vs Production**
- **Development**: Vite config already has these headers (see `vite.config.js`)
- **Production**: You must configure your production server

### 4. **Testing the Headers**
Check if headers are properly set:

```bash
# Test with curl
curl -I https://your-domain.com | grep Cross-Origin

# Or check in browser DevTools
# 1. Open DevTools → Network tab
# 2. Reload the page
# 3. Click on the main document
# 4. Check Response Headers
```

### 5. **Fallback Behavior**
If these headers are not present:
- The app will still work
- Video generation will use single-threaded mode (slower)
- Users will see a warning in the console
- No functionality will be lost, just performance

## Troubleshooting

### Error: "Failed to load video encoder"
**Symptoms**: Video generation fails completely
**Solutions**:
1. Check browser console for detailed errors
2. Verify network connectivity
3. Try different browser
4. Check if third-party scripts are blocked

### Warning: "SharedArrayBuffer not available"
**Symptoms**: Video generation works but is slow
**Solutions**:
1. Add the CORS headers above
2. Verify headers are being sent (use curl or DevTools)
3. Clear browser cache and reload

### Error: "Failed to fetch [resource]"
**Symptoms**: Some resources fail to load after adding headers
**Solutions**:
1. Ensure all resources are CORS-compatible
2. Add `crossorigin="anonymous"` to external resources
3. Self-host problematic resources
4. Use a proxy for external resources

## Performance Impact

### With Headers (Multi-threaded):
- ✅ Faster video generation (2-3x faster)
- ✅ Better CPU utilization
- ✅ Smoother progress updates
- ⚠️ Requires proper CORS setup

### Without Headers (Single-threaded):
- ⚠️ Slower video generation
- ⚠️ Single-core usage only
- ✅ Simpler setup
- ✅ No CORS complications

## Recommended Setup

For **memtribe.com** (appears to be the production domain), add the headers to your server configuration. Based on the error logs, it seems you're using a standard web server (Nginx or Apache).

### Quick Setup for Nginx (Most Likely):
1. SSH into your server
2. Edit Nginx config: `sudo nano /etc/nginx/sites-available/memtribe.com`
3. Add the headers inside the `server` block
4. Test config: `sudo nginx -t`
5. Reload: `sudo systemctl reload nginx`
6. Verify: `curl -I https://memtribe.com | grep Cross-Origin`

## Questions?
If you need help with your specific server setup, please provide:
1. Server type (Nginx, Apache, IIS, etc.)
2. Hosting provider (AWS, DigitalOcean, Vercel, etc.)
3. Any error messages from the server logs

