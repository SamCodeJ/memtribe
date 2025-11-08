# Quick Plan Update Guide

## Issue Found

Your database still shows `subscription_plan: "starter"` even though you tried to upgrade. The update didn't persist to the database.

## Console Logs Show:
```
subscription_plan: "starter"
userPlan: "starter"
userPlanIndex: 0
```

This is why all templates except "Minimal" are locked.

## Solution 1: Via Subscription Page (Recommended)

1. Navigate to **Subscription** page
2. Click the **Enterprise** (or desired) plan button
3. Wait for success message: "You have successfully upgraded to the Enterprise plan!"
4. Verify button shows "Current Plan" (green)
5. Hard refresh Photobook Creator page (Ctrl+Shift+R)

## Solution 2: Via Browser Console (If button doesn't work)

Open browser console (F12) and paste:

```javascript
// Update to Enterprise
fetch('/api/auth/me', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ subscription_plan: 'enterprise' })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Updated to:', data.user.subscription_plan);
  alert('Plan updated! Refresh the Photobook Creator page.');
})
.catch(err => console.error('❌ Error:', err));
```

After running this:
1. You should see: `✅ Updated to: enterprise`
2. Go back to Photobook Creator
3. Hard refresh (Ctrl+Shift+R)
4. All templates should now be unlocked!

## Solution 3: Via Backend Database (Direct)

If you have database access:

```sql
-- Check your current plan
SELECT id, email, full_name, subscription_plan FROM users;

-- Update to enterprise (replace with your email)
UPDATE users 
SET subscription_plan = 'enterprise' 
WHERE email = 'your@email.com';

-- Verify
SELECT email, subscription_plan FROM users WHERE email = 'your@email.com';
```

## Verify It Worked

After any of the above methods, check in browser console:

```javascript
fetch('/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(d => console.log('Current plan:', d.user.subscription_plan))
```

Should show: `Current plan: enterprise`

Then refresh Photobook Creator and you'll see:
- Event Organizer's Plan: **Enterprise (enterprise)**
- All 4 templates unlocked and clickable ✅

## Available Plans

Choose one of these slugs:
- `starter` - Only Minimal template
- `pro` - Minimal + Magazine
- `business` - Minimal + Magazine + Scrapbook  
- `enterprise` - ALL 4 templates

## Why This Happened

The subscription plan update might have failed due to:
1. Network error during the API call
2. Backend not running when you clicked upgrade
3. Authentication token issues
4. JavaScript error preventing the update

The new code now has better logging to catch these issues.

