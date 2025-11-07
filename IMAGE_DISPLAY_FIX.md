# Image Display & Button Fix

## Issues Fixed

### 1. Approve/Reject Buttons Not Working ✅
**Problem**: Buttons weren't updating media status  
**Solution**: 
- Removed `moderator_notes` field (doesn't exist in schema)
- Added error handling and success alerts
- Added console logging for debugging

### 2. Images Not Displaying
**Problem**: Images show broken icon instead of actual photos  
**Solution**: Added error handler to show URL and help debug

## Testing the Fixes

### Step 1: Open Browser Console
1. Press F12 (or right-click → Inspect)
2. Go to Console tab
3. Refresh the Media Moderation page

### Step 2: Check What You See

**In Console, you should see:**
```javascript
// When page loads
Updating media: [id] to status: approved

// On success
Media updated successfully: {...}
```

**If you see errors:**
```javascript
Image load failed: [url]
```

### Step 3: Test Approve Button
1. Click the green "Approve" button on one image
2. Should see alert: "Media approved successfully!"
3. Image should move to "Approved" tab
4. Counter should update

### Step 4: Test Reject Button
1. Click the red "Reject" button on one image
2. Should see alert: "Media rejected successfully!"
3. Image should move to "Rejected" tab

## Debugging Image Display

### Check Image URLs in Console

Add this to your browser console on the Media Moderation page:

```javascript
// Get all media items
const checkMediaUrls = async () => {
  const eventId = new URLSearchParams(window.location.search).get('event');
  const response = await fetch(`http://localhost:5000/api/media?event_id=${eventId}`);
  const media = await response.json();
  
  console.log('Media items:', media.length);
  media.forEach((m, i) => {
    console.log(`Media ${i+1}:`, {
      id: m.id,
      file_url: m.file_url,
      file_type: m.file_type,
      moderation_status: m.moderation_status
    });
  });
  
  // Test if first image loads
  if (media[0]) {
    const img = new Image();
    img.onload = () => console.log('✅ Image loads successfully:', media[0].file_url);
    img.onerror = () => console.error('❌ Image failed to load:', media[0].file_url);
    img.src = media[0].file_url;
  }
};

checkMediaUrls();
```

### Expected Results

**If Local Development:**
```javascript
file_url: "http://localhost:5000/uploads/32209b27-8f76-4735-adaa-c5b3bb0ff22c.jpg"
✅ Image loads successfully
```

**If Deployed (memtribe.com):**
```javascript
file_url: "https://memtribe.com/uploads/32209b27-8f76-4735-adaa-c5b3bb0ff22c.jpg"
OR
file_url: "http://localhost:5000/uploads/32209b27-8f76-4735-adaa-c5b3bb0ff22c.jpg" ❌ WRONG!
```

### Common Issues

#### Issue 1: localhost URL on deployed site
**Problem**: Database has `http://localhost:5000` in file_url but site is on `https://memtribe.com`

**Solution**: Update backend BASE_URL in `.env`:
```env
BASE_URL=https://memtribe.com
```

Then restart backend and test new uploads.

#### Issue 2: CORS Error
**Problem**: Browser blocks loading images from different domain

**Check Console for:**
```
Access to image blocked by CORS policy
```

**Solution**: Backend already has CORS headers, but verify:
```javascript
// In backend/src/server.js (already added)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../uploads')));
```

#### Issue 3: Files Not Found
**Problem**: 404 error when loading image

**Check:**
```bash
# On server
cd /var/www/memtribe/backend/uploads
ls -la
# Should show your uploaded files
```

**If files are missing**, check where upload service is saving:
```bash
# Check s3.service.js logs
pm2 logs memtribe-backend | grep "File saved"
```

### Fix for Deployed Sites

If your site is deployed and using localhost URLs:

**Option 1: Update Existing URLs in Database**
```sql
-- Connect to database
psql -U postgres -d memtribe_db

-- Update existing URLs
UPDATE media 
SET file_url = REPLACE(file_url, 'http://localhost:5000', 'https://memtribe.com')
WHERE file_url LIKE 'http://localhost:5000%';

-- Verify
SELECT id, file_url, file_type FROM media;
```

**Option 2: Re-upload Images**
1. Set correct BASE_URL in backend/.env
2. Restart backend
3. Delete old media entries
4. Have guests upload again

### Manual Image URL Fix

If you need to manually fix URLs in the browser (temporary):

```javascript
// In browser console on Media Moderation page
const fixImageUrls = () => {
  document.querySelectorAll('img').forEach(img => {
    if (img.src.includes('localhost:5000')) {
      img.src = img.src.replace('http://localhost:5000', 'https://memtribe.com');
    }
  });
};

fixImageUrls();
```

## Testing Checklist

- [ ] Browser console shows no errors
- [ ] Images display (not broken icons)
- [ ] Click Approve → Success alert shows
- [ ] Media moves to Approved tab
- [ ] Counter updates (Pending: 1 → 0, Approved: 0 → 1)
- [ ] Click Reject → Success alert shows
- [ ] Media moves to Rejected tab
- [ ] Can switch between tabs
- [ ] All tabs show correct media

## If Images Still Don't Show

1. **Check the actual URL** being used:
   - Open browser DevTools → Network tab
   - Refresh page
   - Look for image requests
   - Check if they're 404 or CORS errors

2. **Verify file exists on server**:
   ```bash
   curl https://memtribe.com/uploads/[filename]
   # OR
   curl http://localhost:5000/uploads/[filename]
   ```

3. **Check backend logs**:
   ```bash
   pm2 logs memtribe-backend
   # Look for upload-related logs
   ```

4. **Test direct access**:
   - Copy the file_url from database
   - Paste in browser address bar
   - Should download/display the image

## Next Steps

1. Refresh your Media Moderation page
2. Open browser console (F12)
3. Click Approve button
4. Check if alert shows "Media approved successfully!"
5. Share any console errors if buttons still don't work
6. Share the file_url value if images don't display

