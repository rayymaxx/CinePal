## 🧪 Admin System Testing Guide

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173` (Vite)
- Admin user initialized (rayymaxx/raymond123?)

### Test Cases

#### 1️⃣ Admin Login
**Endpoint**: `POST /admin/login`

```bash
curl -X POST http://localhost:8000/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rayymaxx",
    "password": "raymond123?"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "username": "rayymaxx"
}
```

---

#### 2️⃣ Get Dashboard Stats
**Endpoint**: `GET /admin/dashboard/stats`

```bash
curl -X GET http://localhost:8000/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "total_users": 5,
  "active_users_today": 2,
  "total_chat_requests": 42,
  "total_api_requests": 156,
  "avg_response_time_ms": 45.23,
  "total_recommendations": 38,
  "error_count": 3,
  "peak_concurrent_users": 0
}
```

---

#### 3️⃣ Get Activity Timeline
**Endpoint**: `GET /admin/activity/timeline?limit=20&offset=0`

```bash
curl -X GET "http://localhost:8000/admin/activity/timeline?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "user_id": 5,
    "activity_type": "chat",
    "timestamp": "2025-12-24T22:15:30.123456",
    "session_id": "session_12345",
    "activity_data": {
      "message_count": 3,
      "recommendations": 2
    }
  },
  ...
]
```

---

#### 4️⃣ Get API Performance
**Endpoint**: `GET /admin/api/performance?hours=24&limit=100`

```bash
curl -X GET "http://localhost:8000/admin/api/performance?hours=24" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "endpoint": "/api/chat",
      "method": "POST",
      "status_code": 200,
      "response_time_ms": 150.5,
      "user_id": 5,
      "timestamp": "2025-12-24T22:15:30.123456",
      "error_message": null
    },
    ...
  ],
  "total_count": 15
}
```

---

#### 5️⃣ Get Metrics History
**Endpoint**: `GET /admin/metrics/history?days=7`

```bash
curl -X GET "http://localhost:8000/admin/metrics/history?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "metrics": [
    {
      "metric_date": "2025-12-24T00:00:00",
      "total_users": 5,
      "active_users_today": 2,
      "total_chat_requests": 42,
      "total_api_requests": 156,
      "avg_response_time_ms": 45.23,
      "total_recommendations_given": 38,
      "error_count": 3
    },
    ...
  ],
  "total_days": 1
}
```

---

#### 6️⃣ Frontend Testing

**Login to Admin Dashboard:**
1. Open `http://localhost:5173/admin/login`
2. Enter:
   - Username: `rayymaxx`
   - Password: `raymond123?`
3. Click "Access Dashboard"
4. You'll be redirected to `/admin/dashboard`

**Test Dashboard Tabs:**
- **Overview**: Should show stat cards and 7-day trend chart
- **Activity**: Should show a table of recent user activities
- **Analytics**: Should show 4 charts with metrics data

**Test Logout:**
- Click "Logout" button in top-right
- Should redirect to `/admin/login`
- Token should be removed from localStorage

---

### Performance Testing

#### Generate Test Activity
You can generate test activities by:

1. **Register a test user** via the frontend login page
2. **Make chat requests** to generate activity logs
3. **View the admin dashboard** to see the activities and metrics

---

### Debugging

#### Check Logs
```bash
# Backend logs (if using logs)
tail -f backend.log

# Browser console (Frontend)
# Open DevTools > Console tab
```

#### Verify Database
```bash
# Check if tables were created
sqlite3 Backend/data/sqlite.db
.tables
.schema admin_users
.schema user_activity
.schema api_requests
.schema system_metrics
```

#### Test Token Validity
```bash
curl -X POST http://localhost:8000/admin/health \
  -H "Authorization: Bearer INVALID_TOKEN"
# Should return 401 Unauthorized
```

---

### Common Issues & Solutions

#### Issue: 401 Unauthorized on admin endpoints
**Solution**: 
- Verify token is valid and not expired
- Re-login if needed
- Check Authorization header format: `Bearer <token>`

#### Issue: Admin dashboard shows "Loading..." indefinitely
**Solution**:
- Check browser console for errors
- Verify backend is running
- Verify token is stored in localStorage

#### Issue: Charts not displaying
**Solution**:
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify metrics data is available (may need to wait for data collection)

#### Issue: Token not persisting across page refresh
**Solution**:
- Check localStorage is enabled in browser
- Verify localStorage.setItem() is being called on login
- Check browser storage in DevTools > Application tab

---

### Load Testing

To test with multiple concurrent users:

```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:8000/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or using curl in a loop
for i in {1..100}; do
  curl -s http://localhost:8000/admin/dashboard/stats \
    -H "Authorization: Bearer YOUR_TOKEN"
done
```

---

### Expected Behavior

✅ **Login**: Should return JWT token
✅ **Dashboard Stats**: Should return current statistics
✅ **Activity Feed**: Should show recent activities
✅ **API Performance**: Should show request metrics
✅ **Metrics History**: Should show last N days of data
✅ **Charts**: Should display data from metrics API
✅ **Auto-refresh**: Dashboard should refresh every 30 seconds
✅ **Logout**: Should clear token and redirect to login

---

### Next Steps (Optional)

1. **Export Reports**: Add CSV/PDF export functionality
2. **Real-time Updates**: Use WebSockets for live metrics
3. **User Management**: Add ability to manage regular users
4. **Custom Alerts**: Set thresholds for metrics alerts
5. **Advanced Filters**: Filter activity by date range, user, type
6. **Performance Optimization**: Add caching for frequently accessed data

---

**Happy Testing! 🚀**
