# 🚀 Admin Features - Quick Reference Card

## 📝 System Logs

### Access
**URL:** `/SystemLogs` (Admin sidebar)

### API Endpoints
```
GET  /api/admin/logs              - Get logs (paginated, filterable)
GET  /api/admin/logs/stats        - Get statistics
POST /api/admin/logs/clear        - Clear logs older than N days
```

### Query Parameters
```
?log_type=error          - Filter by type
?action=user_login       - Filter by action
?user_id=xxx             - Filter by user
?limit=50                - Results per page
?offset=0                - Pagination offset
?startDate=2024-01-01    - Start date
?endDate=2024-12-31      - End date
```

### Log Types
- ✅ **success** - Green - Successful operations
- ℹ️ **info** - Blue - Informational messages
- ⚠️ **warning** - Yellow - Warnings and failed attempts
- ❌ **error** - Red - Errors and failures

### Actions Logged
- `user_registered` - New user signup
- `user_login` - Successful login
- `login_failed` - Failed login attempt
- `event_created` - New event created
- `event_deleted` - Event deleted
- `subscription_updated` - Plan changed

---

## 👥 User Subscriptions

### Access
**URL:** `/UserSubscriptions` (Admin sidebar)

### API Endpoints
```
GET  /api/admin/users/subscriptions    - Get all users with plans
GET  /api/admin/subscriptions/stats    - Get statistics
PUT  /api/admin/users/:id/subscription - Update user plan
```

### Query Parameters
```
?subscription_plan=pro   - Filter by plan
?search=john             - Search name/email
?limit=50                - Results per page
?offset=0                - Pagination offset
```

### Subscription Plans
- 🌟 **starter** - Free/basic tier
- ⚡ **pro** - Professional tier
- 🏢 **business** - Business tier
- 👑 **enterprise** - Enterprise tier

### Update Plan
```json
PUT /api/admin/users/:userId/subscription
{
  "subscription_plan": "pro"
}
```

---

## 💻 Developer Quick Start

### Add Logging to Any Controller

```javascript
import LoggerService from '../services/logger.service.js';

// Success log
await LoggerService.success('action_name', 'Message', {
  user_id: req.user.id,
  user_email: req.user.email,
  ip_address: req.ip,
  user_agent: req.get('user-agent'),
  metadata: { additional: 'data' }
});

// Info log
await LoggerService.info('action_name', 'Message', data);

// Warning log
await LoggerService.warning('action_name', 'Message', data);

// Error log
await LoggerService.error('action_name', 'Message', data);
```

### Database Queries

```javascript
// Get logs
const logs = await prisma.systemLog.findMany({
  where: { log_type: 'error' },
  orderBy: { created_at: 'desc' },
  take: 50
});

// Count logs
const count = await prisma.systemLog.count({
  where: { action: 'user_login' }
});

// Delete old logs
await prisma.systemLog.deleteMany({
  where: {
    created_at: { lt: cutoffDate }
  }
});
```

---

## 🔐 Security Checklist

✅ All endpoints require authentication  
✅ All endpoints require admin role  
✅ JWT token verified on each request  
✅ No sensitive data logged (passwords, etc.)  
✅ Subscription changes are logged  
✅ Failed login attempts are tracked  

---

## 🐛 Common Issues & Fixes

### Issue: "Table does not exist"
**Fix:**
```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Issue: "Cannot access admin pages"
**Fix:** Make user an admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### Issue: "No logs appearing"
**Fix:** Logs start empty - perform actions to generate them

### Issue: "Statistics showing 0"
**Fix:** No logs yet - this is normal for new installation

---

## 📊 Useful SQL Queries

```sql
-- Count logs by type
SELECT log_type, COUNT(*) 
FROM system_logs 
GROUP BY log_type;

-- Recent failed logins
SELECT * FROM system_logs 
WHERE action = 'login_failed' 
ORDER BY created_at DESC 
LIMIT 10;

-- Users by subscription plan
SELECT subscription_plan, COUNT(*) 
FROM users 
GROUP BY subscription_plan;

-- Most active users
SELECT u.email, COUNT(sl.id) as log_count
FROM users u
LEFT JOIN system_logs sl ON u.id = sl.user_id
GROUP BY u.id
ORDER BY log_count DESC
LIMIT 10;
```

---

## 🎯 Common Tasks

### Task: Check for suspicious activity
1. Go to System Logs
2. Filter by "warning"
3. Look for repeated `login_failed` from same IP

### Task: Find when user created event
1. Go to System Logs
2. Search for user email
3. Filter by action "event_created"

### Task: Upgrade user plan
1. Go to User Subscriptions
2. Search for user
3. Click "Edit Plan"
4. Select new plan
5. Save

### Task: See who's on which plan
1. Go to User Subscriptions
2. Check statistics cards at top
3. Or use filter dropdown

### Task: Export logs for analysis
Use API with large limit:
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/admin/logs?limit=1000" \
  > logs.json
```

---

## 🔧 Maintenance

### Daily
- Check System Logs for errors
- Monitor failed login attempts

### Weekly
- Review subscription statistics
- Check for unusual activity patterns

### Monthly
- Clear old logs (>30 days)
- Review user growth trends
- Analyze plan distribution

---

## 📞 Support Files

| File | Purpose |
|------|---------|
| `README_ADMIN_FEATURES.md` | Quick overview |
| `SETUP_ADMIN_FEATURES.md` | Setup guide |
| `ADMIN_FEATURES.md` | Full documentation |
| `ADMIN_FEATURES_IMPLEMENTATION.md` | Technical details |
| `ADMIN_QUICK_REFERENCE.md` | This cheat sheet |

---

## 💡 Best Practices

### Logging
✅ DO log important user actions  
✅ DO log security events  
✅ DO include user context  
❌ DON'T log passwords  
❌ DON'T log sensitive PII  
❌ DON'T log too frequently  

### Subscription Management
✅ DO verify before changing plans  
✅ DO notify users of changes  
✅ DO check logs after updates  
❌ DON'T change plans without reason  
❌ DON'T forget to document changes  

---

## 🎓 Learning Path

1. **Start Here** → `README_ADMIN_FEATURES.md`
2. **Setup** → `SETUP_ADMIN_FEATURES.md`
3. **Learn Features** → `ADMIN_FEATURES.md`
4. **Use This** → `ADMIN_QUICK_REFERENCE.md`
5. **Deep Dive** → `ADMIN_FEATURES_IMPLEMENTATION.md`

---

**Keep this handy for quick reference!** 📌

