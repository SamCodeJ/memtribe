# 🚀 Quick Setup: Admin Features

## Overview

You now have two new admin features:
1. **System Logs** - Monitor all system activity
2. **User Subscriptions** - Manage user subscription plans

This guide will get them up and running in 5 minutes.

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Run Database Migration

The migration file has been created for you. Run it:

```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
```

**What this does:**
- Creates `system_logs` table in your database
- Adds indexes for fast querying
- Updates Prisma client

### Step 2: Restart Your Backend

If your backend is running, restart it to load the new code:

```powershell
# If running with npm
cd backend
npm start

# If running with nodemon (auto-restarts)
# Just save any file in backend/src/

# If running with PM2
pm2 restart memtribe-api
```

### Step 3: Access the Features

1. **Log in as Admin**
   - Email: Your admin account
   - Make sure `role = 'admin'` in database

2. **Check the Sidebar**
   - You'll see two new menu items:
     - **User Subscriptions** 
     - **System Logs**

3. **Done!** 🎉

---

## ✅ Verify Everything Works

### Test System Logs

1. Go to **System Logs** page
2. You should see existing logs (if any)
3. Try these actions to generate logs:
   - Log out and log back in → Creates login log
   - Create a new event → Creates event_created log
   - Delete an event → Creates event_deleted log

### Test User Subscriptions

1. Go to **User Subscriptions** page
2. You should see all registered users
3. Try:
   - Search for a user
   - Filter by plan
   - Click "Edit Plan" on a user
   - Change their plan and save

---

## 🔧 Make Yourself an Admin

If you're not an admin yet, update your user role in the database:

### Using Prisma Studio (Easy)

```powershell
cd backend
npx prisma studio
```

Then:
1. Open the `users` table
2. Find your user
3. Change `role` from `user` to `admin`
4. Save
5. Log out and log back in

### Using SQL (Advanced)

```sql
-- Replace 'your@email.com' with your email
UPDATE users 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

---

## 📊 What Gets Logged Automatically

Once set up, these actions are automatically logged:

### ✅ Currently Logged
- ✅ User registration
- ✅ User login (success)
- ✅ Failed login attempts
- ✅ Event creation
- ✅ Event deletion
- ✅ Subscription plan changes

### 🔮 Easy to Add
You can easily log any other actions by adding LoggerService calls to controllers.

---

## 🎯 Key Files Created/Modified

### Backend Files
```
✨ NEW FILES:
backend/src/services/logger.service.js          - Logging service
backend/src/controllers/admin.controller.js     - Admin API endpoints
backend/src/routes/admin.routes.js              - Admin routes
backend/prisma/migrations/.../migration.sql     - Database migration

📝 MODIFIED FILES:
backend/src/server.js                           - Added admin routes
backend/prisma/schema.prisma                    - Added SystemLog model
backend/src/controllers/auth.controller.js      - Added logging
backend/src/controllers/event.controller.js     - Added logging
```

### Frontend Files
```
✨ NEW FILES:
src/pages/SystemLogs.jsx                        - System logs UI
src/pages/UserSubscriptions.jsx                 - User subscriptions UI

📝 MODIFIED FILES:
src/pages/index.jsx                             - Added new routes
src/pages/Layout.jsx                            - Added sidebar links
```

### Documentation
```
✨ NEW FILES:
ADMIN_FEATURES.md                               - Comprehensive guide
SETUP_ADMIN_FEATURES.md                         - This quick start guide
```

---

## 🐛 Troubleshooting

### "Table system_logs does not exist"

Run the migration:
```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
```

### "Cannot access admin pages"

Make sure you're logged in as admin:
1. Check your user role in database
2. Log out and log back in
3. Verify sidebar shows admin menu items

### "No logs appearing"

1. The table is empty initially (that's normal!)
2. Perform some actions:
   - Log in/out
   - Create/delete events
3. Refresh the System Logs page

### Migration Stuck

If the migration command hangs:
1. Press Ctrl+C to cancel
2. The migration file already exists at:
   `backend/prisma/migrations/20251116000000_add_system_logs/migration.sql`
3. You can apply it manually:
   ```powershell
   cd backend
   npx prisma db push
   npx prisma generate
   ```

---

## 💡 Quick Tips

### For System Logs
- Filter by type to find errors quickly
- Search by user email to track specific users
- Clear old logs monthly to keep database lean

### For User Subscriptions
- Use search to find users quickly
- Filter by plan to see who's on which tier
- Log changes are automatic when you update plans

---

## 📖 Need More Details?

See **ADMIN_FEATURES.md** for:
- Complete feature documentation
- API endpoint details
- Extending the logging system
- Best practices
- Advanced configuration

---

## 🎉 You're All Set!

Your admin features are ready to use. You can now:

✅ Monitor all system activity with **System Logs**
✅ Manage user subscriptions with **User Subscriptions**
✅ Track user behavior and platform usage
✅ Identify and troubleshoot issues quickly
✅ Make data-driven decisions

**Happy managing!** 🚀

---

## Next Steps

1. ✅ Run the migration
2. ✅ Restart backend
3. ✅ Make yourself admin
4. ✅ Access the new pages
5. ✅ Test the features
6. 📚 Read ADMIN_FEATURES.md for advanced usage

**Everything working?** Great! You're ready to monitor and manage your MemTribe platform like a pro! 🎯

