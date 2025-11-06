# Database Schema Mismatch Fix

## Issue Discovered

When testing guest media upload, the error message revealed:

```
PrismaClientValidationError: Argument file_url is missing.

Invalid prisma.media.create() invocation:
{
  data: {
    event_id: "84f36b32-7843-4310-8c9c-3f7397b813a6",
    uploader_name: "Samuel Titiloye",
    uploader_email: "titiloye1@gmail.com",
    media_url: "http://localhost:5000/uploads/32209b27-8f76-4735-adaa-c5b3bb0ff22c.jpg",
    media_type: "image",
    caption: "",
    status: "pending",
    moderation_status: "pending",
+   file_url: String  ← MISSING!
  }
}
```

## Root Cause

The frontend code was using **old field names** that didn't match the **database schema**:

### Database Schema (backend/prisma/schema.prisma)
```prisma
model Media {
  id                String   @id @default(uuid())
  event_id          String
  file_url          String      ← Should be this
  file_type         String      ← Should be this
  uploaded_by       String?     ← Should be this
  uploader_email    String?
  moderation_status String @default("pending")
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  event Event @relation(fields: [event_id], references: [id], onDelete: Cascade)
}
```

### Frontend Was Sending (WRONG ❌)
```javascript
{
  media_url: "...",        // Should be file_url
  media_type: "image",     // Should be file_type  
  uploader_name: "...",    // Should be uploaded_by
  caption: "...",          // Doesn't exist in schema
  status: "pending"        // Should be moderation_status
}
```

## Files Fixed

### 1. **src/pages/MediaUpload.jsx**
Changed media creation call:
```javascript
// BEFORE ❌
await Media.create({
  event_id: event.id,
  uploader_name: formData.uploader_name,
  uploader_email: formData.uploader_email,
  media_url: file_url,
  media_type: mediaType,
  caption: formData.caption,
  status: "pending"
});

// AFTER ✅
await Media.create({
  event_id: event.id,
  uploaded_by: formData.uploader_name,
  uploader_email: formData.uploader_email,
  file_url: file_url,
  file_type: fileType,
  moderation_status: "pending"
});
```

### 2. **src/pages/EventSlideshow.jsx**
Updated field references:
- `media.media_url` → `media.file_url`
- `media.media_type` → `media.file_type`
- `media.uploader_name` → `media.uploaded_by || 'Guest'`

### 3. **src/pages/PhotobookCreator.jsx**
Updated field references:
- `media.media_url` → `media.file_url`
- `media.media_type` → `media.file_type`
- `media.uploader_name` → `media.uploaded_by || 'Guest'`

### 4. **src/pages/MediaModeration.jsx**
Updated field references:
- `media.media_url` → `media.file_url`
- `media.media_type` → `media.file_type`
- `media.uploader_name` → `media.uploaded_by || 'Guest'`

## Field Mapping Reference

| Old Field Name (Frontend) | Correct Field Name (Database) | Type   |
|---------------------------|-------------------------------|--------|
| `media_url`               | `file_url`                    | String |
| `media_type`              | `file_type`                   | String |
| `uploader_name`           | `uploaded_by`                 | String? |
| `status`                  | `moderation_status`           | String |
| `caption`                 | ❌ Not in schema              | -      |

**Note**: The `caption` field doesn't exist in the current database schema. It was removed from the Media.create() call.

## Testing the Fix

### 1. Restart Frontend
Since we made code changes, restart the dev server:
```bash
npm run dev
```

### 2. Test Guest Upload
1. Login and create/open an event
2. Copy the media upload link
3. Open in incognito window
4. Enter name and email
5. Upload a photo
6. **Should now succeed!** ✅

### Expected Success Flow
```
✅ File uploaded to: http://localhost:5000/uploads/[uuid].jpg
✅ Media record created in database
✅ "Successfully Uploaded" message appears
✅ Media appears in moderation queue with status "pending"
```

## Verifying the Data

You can check the database to verify the media was created with correct fields:

```bash
cd backend
npx prisma studio
```

Navigate to the `Media` table and you should see:
- ✅ `file_url`: Full URL to the uploaded file
- ✅ `file_type`: "image" or "video"
- ✅ `uploaded_by`: The guest's name
- ✅ `uploader_email`: The guest's email
- ✅ `moderation_status`: "pending"

## Additional Notes

### Caption Field
The schema doesn't have a `caption` field. If you want to support captions in the future, you need to:

1. Add the field to the schema:
```prisma
model Media {
  // ... existing fields ...
  caption String? // Optional caption
  // ...
}
```

2. Run migration:
```bash
cd backend
npx prisma migrate dev --name add_caption_to_media
```

3. Update the frontend to include it again

### Why This Happened

This mismatch likely occurred because:
1. The database schema was updated at some point
2. The frontend code wasn't updated to match
3. No TypeScript types were enforcing the correct structure
4. The error only surfaced when actually trying to create a record

## Prevention

To prevent this in the future:

1. **Use TypeScript**: Add type definitions for your Prisma models
2. **Generate Types**: Use Prisma's type generation
3. **Centralized Types**: Create a shared types file
4. **Code Review**: Check schema changes against frontend code
5. **Integration Tests**: Test the full flow from upload to database

## Build Status

✅ **Frontend builds successfully** with all changes
✅ **No linter errors**
✅ **All files updated consistently**

## Summary

The guest media upload was failing because the frontend was sending fields with the wrong names (e.g., `media_url` instead of `file_url`). This has been fixed by:

1. ✅ Updating MediaUpload.jsx to send correct field names
2. ✅ Updating all display components to read correct field names
3. ✅ Removing the `caption` field (not in schema)
4. ✅ Changing `status` to `moderation_status`
5. ✅ Build verified successfully

**The guest media upload should now work!** 🎉

Try uploading again and it should succeed!

