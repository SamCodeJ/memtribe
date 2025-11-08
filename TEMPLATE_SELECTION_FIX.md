# Template Selection Fix - Photobook Creator

## Issue

Users with upgraded subscription plans (Pro, Business, Enterprise) were unable to select premium photobook templates even though they had the correct plan level.

## Root Cause

The template permission checking logic was comparing the package name (e.g., "Enterprise", "Business") with a slug-based hierarchy array ["starter", "pro", "business", "enterprise"]. This comparison was unreliable because:

1. The `getPlanDetails()` function only returned `name: pkg.package_name` (not the slug)
2. The template checker relied on lowercasing the name, which could fail if package names had different formats
3. No fallback to the actual package slug for reliable comparison

## Solution

### 1. **Added Package Slug to Plan Details** (`src/components/utils/plans.jsx`)
   - Now returns both `name` and `slug` from the package
   - Updated `defaultPlan` to include `slug: "starter"`
   - This ensures consistent plan identification

### 2. **Updated Template Permission Logic** (`src/components/templates/PhotobookTemplates.jsx`)
   - Now prioritizes using the plan slug over the name
   - Added debug console logging to track permission checks
   - Fallback chain: `slug → lowercase name → "starter"`

### 3. **Added Debug Logging** 
   - PhotobookCreator now logs organizer data and plan details
   - Template component logs each permission check with details
   - Helps diagnose issues in browser console (F12)

## Files Changed

```
src/
├── components/
│   ├── templates/
│   │   └── PhotobookTemplates.jsx  ✅ Updated permission logic
│   └── utils/
│       └── plans.jsx               ✅ Added slug to planDetails
└── pages/
    └── PhotobookCreator.jsx        ✅ Added debug logging
```

## How to Verify the Fix

### Step 1: Check Your Subscription Plan

1. Open your browser console (F12)
2. Navigate to **Subscription** page
3. Verify you're on the Enterprise (or desired) plan
4. Check the URL in your profile: should show `subscription_plan: "enterprise"`

### Step 2: Check Photobook Creator

1. Navigate to your event
2. Click **"Create Photobook"**
3. Open browser console (F12)
4. Look for these debug messages:

```javascript
// Expected output for Enterprise user:
🔍 DEBUG: Organizer data: { 
  id: "...",
  email: "...",
  subscription_plan: "enterprise",  // ← Should match your plan
  ...
}

🔍 DEBUG: Plan details: {
  name: "Enterprise",
  slug: "enterprise",  // ← Should be present
  ...features
}

🔍 Template Check: {
  template: "Professional",
  userPlan: "enterprise",      // ← Should match
  currentPlan: { name: "Enterprise", slug: "enterprise", ... },
  userPlanIndex: 3,            // ← 3 = enterprise
  requiredPlanIndex: 3,        // ← 3 = enterprise
  canUse: true                 // ← Should be true!
}
```

### Step 3: Test Template Selection

1. In the Photobook Creator, you should now see all templates unlocked
2. Click on different templates - they should be selectable
3. Enterprise plan should unlock all 4 templates:
   - ✅ Minimal (Starter+)
   - ✅ Magazine (Pro+)
   - ✅ Scrapbook (Business+)
   - ✅ Professional (Enterprise only)

## Plan Hierarchy

```
Starter (0)     → Can use: Minimal
    ↓
Pro (1)         → Can use: Minimal, Magazine
    ↓
Business (2)    → Can use: Minimal, Magazine, Scrapbook
    ↓
Enterprise (3)  → Can use: ALL templates
```

## Troubleshooting

### Issue: Still showing "Upgrade required" on templates

**Check 1: User Database Record**
```sql
-- Check your user's subscription plan in the database
SELECT id, email, subscription_plan FROM users WHERE email = 'your@email.com';
```

**Expected**: `subscription_plan` should be `"enterprise"` (lowercase slug)

**If it shows "starter"**: The subscription upgrade didn't save to the database
- Go to the Subscription page
- Click the plan button again
- Check the database again

**Check 2: Refresh the Page**
- After upgrading your plan, refresh the Photobook Creator page
- The plan is loaded when the page loads, so it needs a refresh

**Check 3: Event Ownership**
- Templates are based on the **event organizer's plan**, not the viewer's plan
- Make sure you're the organizer of the event
- Check console: `🔍 DEBUG: Organizer data` should show YOUR email

### Issue: Console shows "userPlanIndex: -1"

This means the plan slug/name wasn't found in the hierarchy array.

**Possible causes**:
1. Package slug is not lowercase (should be)
2. Package slug doesn't match ["starter", "pro", "business", "enterprise"]
3. Plan details are null/undefined

**Solution**: Check the console logs for `currentPlan` and verify the slug value.

### Issue: Database has wrong package slugs

**Run this SQL to check**:
```sql
SELECT id, package_name, package_slug FROM packages;
```

**Expected output**:
```
package_name  | package_slug
--------------|-------------
Starter       | starter
Pro           | pro
Business      | business
Enterprise    | enterprise
```

**If different**: Run the seed script to fix:
```bash
cd backend
npm run prisma:seed
```

## Testing Different Plans

To test the template restrictions work correctly:

1. **Starter Plan**: Should only see Minimal
   ```javascript
   await User.updateMyUserData({ subscription_plan: 'starter' });
   ```

2. **Pro Plan**: Should see Minimal + Magazine
   ```javascript
   await User.updateMyUserData({ subscription_plan: 'pro' });
   ```

3. **Business Plan**: Should see Minimal + Magazine + Scrapbook
   ```javascript
   await User.updateMyUserData({ subscription_plan: 'business' });
   ```

4. **Enterprise Plan**: Should see ALL templates
   ```javascript
   await User.updateMyUserData({ subscription_plan: 'enterprise' });
   ```

## Additional Notes

### Why Check Organizer's Plan?

The photobook creator checks the **event organizer's plan** (not the current viewer's plan) because:
- The organizer pays for the event features
- Template access is tied to the event owner's subscription
- Guests/collaborators use the organizer's plan benefits

### Future Improvements

Consider adding:
- [ ] Visual indicator of current plan in Photobook Creator
- [ ] "Upgrade Plan" button directly in template selector
- [ ] Plan comparison tooltip on locked templates
- [ ] Automatic plan refresh without page reload

---

**Status**: ✅ Fixed and Tested  
**Last Updated**: November 8, 2025

