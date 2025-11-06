# Guest Media Upload Fix

## Issue
Guests were unable to upload media to events, being blocked by an "Access Restricted" page.

## Root Causes Identified

### 1. **Frontend Layout Authentication Check**
The `Layout.jsx` component was not properly handling public pages, causing guests to see an access restricted message even though `MediaUpload` was intended to be a public page.

### 2. **Frontend API Call Issue**
The `MediaUpload.jsx` page was trying to call `User.get(organizer_id)` to fetch the event organizer's subscription plan details. However:
- The `UserEntity` class doesn't have a `.get()` method
- Even if it did, guests wouldn't have permission to access user data
- This caused the page to fail silently or show errors for guest users

### 3. **Missing Backend Limit Enforcement**
The backend media creation endpoint wasn't enforcing upload limits based on the event organizer's subscription plan, relying entirely on frontend validation which guests could bypass.

## Fixes Implemented

### 1. **Improved Layout.jsx Public Page Handling**
```javascript
// Define public pages that don't require authentication
const publicPages = ["Landing", "EventView", "Login", "Signup", "MediaUpload", "EventSlideshow", "login", "signup"];
const isPublicPage = publicPages.includes(currentPageName);

// Show loading state only for pages that require authentication
if (isLoading && !isPublicPage) {
  // ... loading screen
}

// Show access restricted page only for protected pages when user is not authenticated
if (!currentUser && !isPublicPage) {
  // ... access restricted screen
}
```

**Benefits:**
- Cleaner, more maintainable code
- Public pages are explicitly defined in one place
- Added debug logging for development

### 2. **Updated MediaUpload.jsx for Guest Access**
```javascript
// Try to get current user's plan (if authenticated)
try {
  const currentUser = await User.me();
  const plan = await getPlanDetails(currentUser);
  setCurrentPlan(plan);
} catch (authError) {
  // Guest users - allow uploads without strict frontend limits
  // The backend will enforce proper limits based on the event organizer's plan
  console.log("Guest upload mode - backend will enforce limits");
  setCurrentPlan(null); // Set to null to indicate no frontend limit checking
}
```

**Changes:**
- Removed the failing `User.get(organizer_id)` call
- Guest users now have `currentPlan` set to `null` 
- Frontend limit checks are skipped for guests (`currentPlan === null`)
- Guests can freely upload media (backend enforces actual limits)

### 3. **Added Backend Media Limit Enforcement**
The backend `createMedia` controller now:
1. Fetches the event with organizer information
2. Counts existing media for the event
3. Retrieves the organizer's subscription plan from the database
4. Extracts the `media_per_event` limit from the plan features
5. Returns a 403 error if the limit is reached

**Code snippet:**
```javascript
// Check media count for this event
const existingMediaCount = await prisma.media.count({
  where: { event_id }
});

// Get the organizer's plan limits
const planSlug = event.organizer?.subscription_plan || 'starter';
// ... fetch package and features ...

// Check if limit is reached
if (existingMediaCount >= mediaLimit) {
  return res.status(403).json({ 
    error: `Media upload limit reached. This event can have a maximum of ${mediaLimit} media uploads...` 
  });
}
```

## Testing the Fix

### 1. **Test Guest Upload**
1. Create an event as an authenticated user
2. Copy the media upload link from Event Management
3. Open the link in an incognito/private browser window (or logout)
4. You should see the MediaUpload page with upload form
5. Enter your name and email
6. Upload a photo or video
7. The upload should succeed and show "Successfully Uploaded"

### 2. **Test Limit Enforcement**
1. As an authenticated user with a plan that has a media limit (e.g., 100 media per event)
2. Upload media until the limit is reached
3. Try uploading more media as a guest
4. You should receive an error: "Media upload limit reached..."

### 3. **Test Authenticated Upload**
1. Login as a user
2. Create an event
3. Navigate to Event Management → Media Hub → Copy Upload Link
4. Open the link (should still work for authenticated users)
5. Upload should work with the proper plan limits displayed

## Security & Performance Considerations

### Security
✅ Backend enforces all limits - guests cannot bypass restrictions
✅ No sensitive user data exposed to guests
✅ Media requires moderation (status: 'pending') before appearing in slideshows

### Performance
✅ Reduced frontend API calls for guest users
✅ Backend limit check uses efficient database queries (`.count()`)
✅ Plan details are cached in the organizer's user record

## Files Modified

1. **src/pages/Layout.jsx**
   - Improved public page detection
   - Added development logging
   - Cleaner conditional rendering

2. **src/pages/MediaUpload.jsx**
   - Removed problematic `User.get()` call
   - Added guest mode support
   - Updated limit checking logic

3. **backend/src/controllers/media.controller.js**
   - Added comprehensive media limit enforcement
   - Fetches organizer's subscription plan
   - Returns proper error messages when limits are reached

## Migration Notes

No database migrations required. The fix is purely code-based and backwards compatible.

## Future Improvements

1. **Caching Plan Limits**: Cache plan limits in Redis to reduce database queries
2. **Public User Endpoint**: Create a `/users/:id/plan` endpoint that returns only public plan info
3. **Frontend Limit Display**: Show current media count and limit to guests (non-blocking)
4. **Rate Limiting**: Add rate limiting for guest uploads to prevent abuse
5. **Email Verification**: Optionally require email verification for guest uploads

## Debugging

If guest uploads still don't work:

1. **Check Browser Console**: Look for errors in the browser console
2. **Check Layout Debug Logs**: In development mode, the Layout component logs: 
   ```
   Layout - Current Page: MediaUpload, Is Public: true, Has User: false
   ```
3. **Check Backend Logs**: Look for "Guest upload mode - backend will enforce limits"
4. **Test Event ID**: Ensure the event ID in the URL is valid
5. **Check Backend Routes**: Verify media routes don't require authentication:
   ```javascript
   router.post('/', createMedia); // No authenticate middleware
   ```

## Support

If you encounter issues after this fix:
- Clear browser cache and try in incognito mode
- Restart both frontend and backend servers
- Check that `USE_CUSTOM_BACKEND = true` in `src/api/index.js`
- Verify the backend is running and accessible

