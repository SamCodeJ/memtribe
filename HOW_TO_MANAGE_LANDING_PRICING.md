# How to Manage Landing Page Pricing

## Quick Start Guide

Your landing page now displays **dynamic pricing** that automatically updates when you make changes in the admin panel!

---

## Step-by-Step: Update Landing Page Pricing

### 1. Login as Admin
```
Navigate to: /login
Use admin credentials
```

### 2. Go to Pricing Management
```
Dashboard → Pricing Management
```

### 3. Manage Packages

#### To Create a New Package:
1. Click **"Create Package"** button
2. Fill in the form:
   - **Package Name**: Display name (e.g., "Premium", "Enterprise")
   - **Package Slug**: URL-friendly identifier (e.g., "premium", "enterprise")
   - **Monthly Price**: Price in dollars (e.g., 49)
   - **Yearly Price**: Annual price (optional)
   - **Description**: Short tagline (e.g., "Perfect for growing teams")
   - **Is Popular**: ✅ Check to show "Most Popular" badge
   - **Display Order**: Number to control position (1 = first, 2 = second, etc.)
   - **Color Scheme**: Visual theme
   - **Is Active**: ✅ Must be checked to show on landing page

3. Add Features:
   - Select features from the list
   - Set values (number, unlimited, etc.)
   - Save

4. Click **"Create Package"**

#### To Edit an Existing Package:
1. Find the package card
2. Click **"Edit"** button
3. Modify any fields
4. Update features if needed
5. Click **"Save Changes"**

#### To Hide a Package from Landing Page:
1. Edit the package
2. **Uncheck** "Is Active"
3. Save
   
   ⚠️ Package will be hidden but not deleted

#### To Delete a Package:
1. Find the package card
2. Click **"Delete"** button
3. Confirm deletion
   
   ⚠️ This permanently removes the package

---

## Understanding Package Fields

### Required Fields:
- **Package Name** - Shown as the plan title on landing page
- **Package Slug** - Must be unique, used in URLs

### Display Fields:
- **Monthly Price** - Main price displayed (can be $0 for free plans)
- **Description** - Subtitle under the price
- **Is Popular** - Adds "Most Popular" badge and yellow styling
- **Display Order** - Controls left-to-right order (lower = left)
- **Is Active** - Must be TRUE to appear on landing page

### Feature Management:
- Features are the bullet points shown under each package
- You can assign multiple features per package
- Each feature can have:
  - A specific value (e.g., "10 events/month")
  - "Unlimited" flag
  - On/off toggle

---

## Landing Page Display Logic

### What Shows:
✅ Only packages where **Is Active = true**  
✅ Sorted by **Display Order** (ascending)  
✅ All assigned features with checkmarks  
✅ "Most Popular" badge if flagged  
✅ Appropriate button text based on price

### Styling:
- **Free Plans ($0)**: "Get Started Free" button
- **Popular Plans**: Yellow border + "Most Popular" badge
- **Regular Plans**: White border + standard button

### Responsive Layout:
- **1 package**: Centered, single column
- **2 packages**: 2-column grid
- **3 packages**: 3-column grid
- **4+ packages**: 4-column grid

---

## Example Workflows

### Scenario 1: Launch a New Plan
```
Goal: Add a "Startup" plan between Starter and Pro

Steps:
1. Go to Pricing Management
2. Click "Create Package"
3. Fill in:
   - Name: "Startup"
   - Slug: "startup"
   - Price: $15
   - Description: "For new businesses"
   - Display Order: 1.5 (shows between order 1 and 2)
   - Is Active: ✅
4. Add features:
   - Events Per Month: 5
   - Guests Per Event: 150
   - Media Per Event: 500
5. Save
6. Refresh landing page → New plan appears!
```

### Scenario 2: Run a Promotion
```
Goal: Temporarily reduce Pro plan from $29 to $19

Steps:
1. Go to Pricing Management
2. Find "Pro" package
3. Click "Edit"
4. Change Monthly Price: 29 → 19
5. Save
6. Refresh landing page → Price updated!

To revert:
- Edit again and change back to $29
```

### Scenario 3: Seasonal Plan
```
Goal: Add a "Holiday Special" plan for limited time

Steps:
1. Create new package "Holiday Special"
2. Set competitive pricing
3. Mark as "Popular" for visibility
4. Set "Is Active: ✅"
5. When promotion ends: Edit and set "Is Active: ❌"
   - Plan immediately hidden from landing page
   - Data preserved for future use
```

### Scenario 4: Reorder Plans
```
Goal: Move Enterprise plan to be first (leftmost)

Steps:
1. Edit "Enterprise" package
2. Change Display Order: 4 → 0
3. Save
4. Refresh landing page → Enterprise now shows first!
```

---

## Tips & Best Practices

### ✅ DO:
- Use clear, descriptive package names
- Keep descriptions short (under 50 characters)
- Set logical display order (gaps are OK, e.g., 1, 5, 10, 20)
- Test changes by refreshing the landing page
- Mark your best-selling plan as "Popular"
- Use $0 for free plans (not $0.00 or "Free")

### ❌ DON'T:
- Use duplicate package slugs (system will prevent this)
- Leave packages active if they're not ready
- Forget to add features (empty packages look unprofessional)
- Use very long package names (they may wrap awkwardly)

---

## Common Questions

**Q: How quickly do changes appear on the landing page?**  
A: Changes take effect **immediately** when users refresh the page. No deployment needed!

**Q: Can I have more than 4 packages?**  
A: Yes! The grid will adjust automatically, but 3-4 packages is recommended for best UX.

**Q: What if I delete a package that users are subscribed to?**  
A: ⚠️ Be careful! Check subscriptions first. Consider marking as "inactive" instead.

**Q: Can I change pricing for existing subscribers?**  
A: Changing the package price won't automatically affect existing subscriptions. That's controlled by your subscription logic.

**Q: How do I make a plan "featured"?**  
A: Set **Is Popular = true** to get the yellow border and "Most Popular" badge.

**Q: Can I preview changes before making them live?**  
A: Set **Is Active = false** to keep the package hidden while you work on it. Once ready, set to **true**.

**Q: What's the difference between monthly_price and price?**  
A: They're kept in sync. Use **monthly_price** for monthly billing, **yearly_price** for annual options.

---

## Troubleshooting

### Package not showing on landing page?
1. ✅ Is **Is Active** checked?
2. ✅ Did you refresh the browser?
3. ✅ Is the backend server running?
4. ✅ Check browser console for errors

### Features not displaying?
1. ✅ Did you assign features to the package?
2. ✅ Are the features marked as active?
3. ✅ Check if PackageFeature records exist

### Wrong order displaying?
1. ✅ Check **Display Order** values (lower = left)
2. ✅ Verify sorting is numeric, not alphabetic
3. ✅ Gaps are OK (1, 5, 10, 20 works fine)

---

## Technical Details

### API Endpoints:
- `GET /api/packages` - Landing page fetches from here
- `GET /api/features` - Feature definitions
- `GET /api/package-features` - Package-feature relationships

### Database Tables:
- `Package` - Package definitions
- `Feature` - Feature definitions  
- `PackageFeature` - Many-to-many relationship

### Landing Page Code:
- File: `src/pages/Landing.jsx`
- Fetches data on mount using `useEffect`
- Filters for `is_active = true`
- Sorts by `display_order`

---

**Need Help?** Check `LANDING_PAGE_DYNAMIC_PRICING.md` for technical implementation details.

