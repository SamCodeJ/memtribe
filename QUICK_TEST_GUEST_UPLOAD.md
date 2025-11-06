# Quick Test Guide: Guest Media Upload

## ✅ What Was Fixed

**Issue**: Guests couldn't upload media - they saw an "Access Restricted" page

**Fixed**:
1. ✅ Frontend routing now properly allows guest access to MediaUpload page
2. ✅ Removed broken API call that was failing for guests  
3. ✅ Added backend enforcement of media limits (secure & reliable)

## 🧪 How to Test

### Test 1: Guest Can Access Upload Page

1. **Start the Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend** (in a new terminal):
   ```bash
   npm run dev
   ```

3. **Login and Create a Test Event**:
   - Go to http://localhost:5173
   - Login with your account
   - Navigate to "Create Event"
   - Create a new test event and publish it

4. **Get the Guest Upload Link**:
   - Go to "My Events"
   - Click on your test event
   - In Event Management, find "Media Hub" section
   - Click "Copy Upload Link"

5. **Test as Guest**:
   - Open a **new incognito/private browser window**
   - Paste the upload link (should look like: `http://localhost:5173/MediaUpload?event=<event-id>`)
   - **Expected Result**: You should see the upload form, NOT an "Access Restricted" page

### Test 2: Guest Can Upload Media

1. In the incognito window with the upload form:
   - Enter your name: "Test Guest"
   - Enter your email: "guest@example.com"
   - Click "Choose Files" or "Take Photo"
   - Select a photo or video
   - Click upload

2. **Expected Result**:
   - Progress bar appears
   - "Successfully Uploaded" message shows
   - You see the uploaded media in the "Successfully Uploaded" section

### Test 3: Verify Upload in Admin View

1. Back in your logged-in window:
   - Navigate to Event Management for that event
   - Click "Moderate Media"
   - **Expected Result**: You should see the guest's upload with status "Pending"

## 🐛 If Something Doesn't Work

### Issue: Still seeing "Access Restricted"

**Solution**:
1. Clear your browser cache
2. Try in a fresh incognito window
3. Check browser console (F12) for errors
4. Look for this log: `Layout - Current Page: MediaUpload, Is Public: true`

### Issue: Upload fails with an error

**Solution**:
1. Check backend console for errors
2. Verify the backend is running on port 5000
3. Check if the event ID in the URL is valid
4. Ensure the .env file has correct database credentials

### Issue: Upload succeeds but limit message appears

**Solution**:
- This is expected if the event has reached its media limit
- The error should say: "Media upload limit reached..."
- This means the backend limit enforcement is working correctly

## 📋 Debug Checklist

If issues persist, check:

- [ ] Backend is running on http://localhost:5000
- [ ] Frontend is running on http://localhost:5173  
- [ ] Database is connected (check backend logs)
- [ ] Event exists and is published
- [ ] Upload link has valid event ID parameter
- [ ] Browser console shows no JavaScript errors
- [ ] Network tab shows API calls succeeding

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Guests can access /MediaUpload?event=<id> without login
2. ✅ Upload form appears with name/email fields
3. ✅ File upload succeeds and shows "Successfully Uploaded"
4. ✅ Uploaded media appears in admin moderation queue
5. ✅ Backend logs show "Guest upload mode - backend will enforce limits"

## 📱 Mobile Testing

The fix works on mobile devices too:
1. Get the upload link from desktop
2. Send it to your mobile device
3. Open in mobile browser
4. Should work the same as desktop

## 🔐 Security Note

Even though guests can upload:
- ✅ All uploads are set to "pending" status
- ✅ Backend enforces media limits per event
- ✅ Uploads require moderation before appearing in slideshow
- ✅ No sensitive data is exposed to guests

