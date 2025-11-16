# 🔧 Admin Features - System Logs & User Subscriptions

## Overview

Two new powerful admin features have been added to MemTribe to help you monitor and manage your platform effectively:

1. **System Logs** - Monitor all system activity and events
2. **User Subscriptions** - View and manage user subscription plans

---

## 📊 System Logs

### What It Does

The System Logs feature automatically tracks important system events including:
- **User Registration** - New user sign-ups
- **User Login** - Successful and failed login attempts
- **Event Creation** - When users create events
- **Event Deletion** - When events are deleted
- **Subscription Changes** - When admin updates user plans
- **Security Events** - Failed login attempts, suspicious activity

### Accessing System Logs

1. Log in as an **admin** user
2. Navigate to **System Logs** from the sidebar
3. View logs in real-time with filtering options

### Features

#### 📈 Statistics Dashboard
- Total logs count
- Breakdown by type (Success, Info, Warning, Error)
- Real-time statistics

#### 🔍 Advanced Filtering
- **Filter by Type**: Success, Info, Warning, Error
- **Search**: Search by message, action, or user email
- **Pagination**: Browse through large log volumes

#### 🎯 Log Details
Each log entry includes:
- **Timestamp** - When the event occurred
- **Log Type** - Success, Info, Warning, or Error
- **Action** - What happened (e.g., user_login, event_created)
- **Message** - Human-readable description
- **User Email** - Who performed the action
- **IP Address** - Where the request came from
- **User Agent** - Browser/device information
- **Metadata** - Additional context (JSON data)

#### 🧹 Maintenance
- **Clear Old Logs** - Remove logs older than 30 days
- Helps keep database size manageable
- Preserves recent activity for monitoring

### API Endpoints

```
GET  /api/admin/logs              - Get system logs (with filters)
GET  /api/admin/logs/stats        - Get log statistics
POST /api/admin/logs/clear        - Clear old logs
```

### Example Use Cases

1. **Security Monitoring**
   - Track failed login attempts
   - Identify suspicious activity patterns
   - Monitor user access times

2. **User Activity**
   - See when users create events
   - Track platform usage patterns
   - Identify active vs inactive users

3. **Troubleshooting**
   - Debug error reports
   - Track down issues users report
   - Understand system behavior

---

## 👥 User Subscriptions

### What It Does

The User Subscriptions dashboard allows admins to:
- View all registered users and their subscription plans
- See subscription plan distribution
- Update user subscription plans
- Track user activity (event counts)

### Accessing User Subscriptions

1. Log in as an **admin** user
2. Navigate to **User Subscriptions** from the sidebar
3. View all users with their current plans

### Features

#### 📊 Subscription Statistics
- **Total Users** - All registered users
- **Plan Distribution** - Users per plan (Starter, Pro, Business, Enterprise)
- **Total Events** - All events created across platform
- **Percentage Breakdown** - Visual representation of plan adoption

#### 👤 User Management Table
View detailed information about each user:
- **Full Name** - User's display name
- **Email** - Contact information
- **Current Plan** - Subscription level
- **Events Count** - Number of events created
- **Role** - User or Admin
- **Join Date** - When they registered

#### 🔍 Search & Filter
- **Search** - Find users by name or email
- **Filter by Plan** - Show only specific subscription tiers
- **Pagination** - Browse through large user lists

#### ✏️ Update Subscriptions
- Click **Edit Plan** on any user
- Select new subscription tier
- Save changes instantly
- Automatic logging of changes

### API Endpoints

```
GET  /api/admin/users/subscriptions     - Get all users with plans
GET  /api/admin/subscriptions/stats     - Get subscription statistics
PUT  /api/admin/users/:userId/subscription - Update user plan
GET  /api/admin/overview                - System overview dashboard
```

### Plan Types

| Plan | Icon | Color | Typical Users |
|------|------|-------|---------------|
| Starter | ⚡ Sparkles | Gray | New/trial users |
| Pro | ⚡ Zap | Blue | Active individuals |
| Business | 🏢 Building | Purple | Small teams |
| Enterprise | 👑 Crown | Gold | Large organizations |

### Example Use Cases

1. **Manual Upgrades**
   - Upgrade user who called support
   - Apply promotional offers
   - Reward loyal customers

2. **Account Management**
   - Downgrade users who request it
   - Handle billing disputes
   - Manage enterprise accounts

3. **Analytics**
   - Track plan adoption rates
   - Identify upgrade opportunities
   - Monitor subscription trends

---

## 🚀 Getting Started

### Step 1: Run Database Migration

Before using these features, run the migration to create the `system_logs` table:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Step 2: Restart Backend

```bash
cd backend
npm start
# or with PM2:
pm2 restart memtribe-api
```

### Step 3: Access Admin Features

1. Log in with an admin account
2. Look for these new items in the sidebar:
   - **User Subscriptions**
   - **System Logs**

---

## 🔐 Security & Permissions

### Admin-Only Access

Both features are **restricted to admin users only**:
- Middleware checks `requireAdmin` before allowing access
- Regular users cannot access these endpoints
- Unauthorized attempts are logged

### Data Privacy

System logs include:
- ✅ User IDs and emails (for admin reference)
- ✅ IP addresses (for security monitoring)
- ✅ User agents (for troubleshooting)
- ❌ No passwords or sensitive data

### Log Retention

- Logs are kept indefinitely by default
- Admins can clear logs older than 30 days
- Consider setting up automated cleanup for large deployments

---

## 📝 Logged Actions

The system automatically logs these actions:

### Authentication
- `user_registered` - New user sign-up (SUCCESS)
- `user_login` - Successful login (SUCCESS)
- `login_failed` - Failed login attempt (WARNING)

### Events
- `event_created` - New event created (SUCCESS)
- `event_deleted` - Event removed (INFO)

### Administration
- `subscription_updated` - Admin changed user plan (INFO)
- `log_cleanup` - Old logs cleared (INFO)

### Future Actions (Easily Extensible)
- Media uploads/moderation
- RSVP submissions
- Payment processing
- Email sending
- API errors
- System errors

---

## 💡 Best Practices

### For System Logs

1. **Regular Review**
   - Check logs daily for errors
   - Monitor failed login attempts
   - Look for unusual patterns

2. **Maintenance**
   - Clear old logs monthly
   - Keep at least 30 days of history
   - Archive important logs if needed

3. **Alerting** (Future Enhancement)
   - Set up alerts for error spikes
   - Monitor failed login patterns
   - Track subscription changes

### For User Subscriptions

1. **Before Changing Plans**
   - Verify with the user first
   - Understand their needs
   - Document the reason

2. **Communication**
   - Notify users of plan changes
   - Explain new limits/features
   - Provide support if needed

3. **Monitoring**
   - Track plan distribution trends
   - Identify popular tiers
   - Adjust pricing based on data

---

## 🛠️ Extending the Features

### Adding New Log Types

In any controller, import and use the LoggerService:

```javascript
import LoggerService from '../services/logger.service.js';

// Log a success
await LoggerService.success(
  'action_name',
  'Human readable message',
  {
    user_id: req.user.id,
    user_email: req.user.email,
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    metadata: { additional: 'data' }
  }
);

// Log an error
await LoggerService.error(
  'error_action',
  'Error description',
  { user_id: req.user.id }
);

// Log a warning
await LoggerService.warning(
  'warning_action',
  'Warning message',
  { user_id: req.user.id }
);

// Log info
await LoggerService.info(
  'info_action',
  'Info message',
  { user_id: req.user.id }
);
```

### Customizing Log Retention

Edit `backend/src/services/logger.service.js`:

```javascript
// Change default retention from 30 to 90 days
static async clearOldLogs(daysToKeep = 90) {
  // ... implementation
}
```

---

## 📊 Database Schema

### SystemLog Model

```prisma
model SystemLog {
  id         String   @id @default(uuid())
  log_type   String   // info, warning, error, success
  action     String   // login, register, event_created, etc.
  user_id    String?
  user_email String?
  message    String   @db.Text
  ip_address String?
  user_agent String?
  metadata   Json?    // Additional JSON data
  created_at DateTime @default(now())

  @@index([log_type])
  @@index([action])
  @@index([user_id])
  @@index([created_at])
  @@map("system_logs")
}
```

---

## 🎯 Performance Considerations

### For Large Deployments

1. **Indexing**
   - Log types are indexed for fast filtering
   - Created_at is indexed for date queries
   - User_id is indexed for user-specific logs

2. **Pagination**
   - Logs are paginated (50 per page)
   - Prevents loading thousands of records at once
   - Smooth UI performance

3. **Cleanup**
   - Regular log cleanup prevents database bloat
   - Consider scheduled jobs for automatic cleanup
   - Archive important logs before clearing

---

## ✅ Testing Checklist

### System Logs
- [ ] Register new user → Check log appears
- [ ] Login → Check success log
- [ ] Failed login → Check warning log
- [ ] Create event → Check log appears
- [ ] Delete event → Check log appears
- [ ] Filter by type → Verify filtering works
- [ ] Search logs → Verify search works
- [ ] Clear old logs → Verify cleanup works

### User Subscriptions
- [ ] View all users → Check data loads
- [ ] See statistics → Verify calculations
- [ ] Filter by plan → Verify filtering
- [ ] Search users → Verify search works
- [ ] Update plan → Check update succeeds
- [ ] Check logs → Verify change was logged

---

## 🐛 Troubleshooting

### Logs Not Appearing

1. **Check Migration**
   ```bash
   cd backend
   npx prisma migrate status
   npx prisma migrate deploy
   ```

2. **Check Console**
   - Look for logging errors in backend console
   - Verify LoggerService is imported

3. **Check Database**
   ```bash
   npx prisma studio
   # Look for system_logs table
   ```

### Cannot Access Admin Pages

1. **Verify Admin Role**
   - Check user.role === 'admin'
   - Update in database if needed

2. **Check Routes**
   - Verify `/api/admin` routes are loaded
   - Check server.js imports admin routes

3. **Check Authentication**
   - Ensure valid JWT token
   - Check middleware is working

---

## 🎉 Summary

You now have two powerful admin features:

✅ **System Logs** - Monitor everything happening on your platform
✅ **User Subscriptions** - Manage user plans and track adoption

These features give you complete visibility and control over your MemTribe platform!

---

## 📚 Related Documentation

- [BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md) - Full backend documentation
- [SETUP_BACKEND.md](./SETUP_BACKEND.md) - Backend setup instructions
- [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) - Environment configuration

---

**Need Help?** Check the code comments in:
- `backend/src/services/logger.service.js`
- `backend/src/controllers/admin.controller.js`
- `src/pages/SystemLogs.jsx`
- `src/pages/UserSubscriptions.jsx`

