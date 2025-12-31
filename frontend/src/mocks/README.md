# Mock Authentication System

ระบบ Mock Authentication ด้วย MSW (Mock Service Worker) สำหรับการพัฒนาและทดสอบ Frontend โดยไม่ต้องพึ่ง Backend จริง

## 🎯 Features

- **Mock API Handlers** สำหรับ Authentication (login, register, logout, verify OTP)
- **4 User Roles**: Tourist, Shop, Community Admin, Platform Admin
- **Mock Enrollments Data** สำหรับแสดงในแดชบอร์ด
- **Protected Routes** ป้องกันการเข้าถึงหน้าที่ต้อง login
- **Auto-redirect** กลับหน้าเดิมหลัง login สำเร็จ

## 🧪 Test Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Tourist | `tourist@test.com` | `test123` | นักท่องเที่ยวทั่วไป |
| Shop Owner | `shop@test.com` | `test123` | เจ้าของร้านค้า/ผู้จัดกิจกรรม |
| Community Admin | `community@test.com` | `test123` | ผู้ดูแลชุมชน |
| Platform Admin | `admin@test.com` | `test123` | ผู้ดูแลระบบ |

## 📁 File Structure

```
src/mocks/
├── data/
│   └── mockUsers.js          # Mock user data และ enrollments
├── handlers/
│   ├── auth.js               # Auth API handlers
│   ├── users.js              # User API handlers
│   └── index.js              # Export all handlers
└── browser.js                # MSW browser setup
```

## 🚀 How It Works

### 1. MSW Initialization
MSW เริ่มทำงานใน `main.jsx` ก่อน render React app:

```javascript
// main.jsx
enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(...)
})
```

### 2. Protected Routes
หน้าที่ต้อง login ถูกห่อด้วย `<ProtectedRoute>`:

```javascript
// App.jsx
<Route path="dashboard" element={
  <ProtectedRoute>
    <UserDashboard />
  </ProtectedRoute>
} />
```

### 3. Workshop Enrollment
เมื่อกดปุ่มจองใน WorkshopModal:
- ถ้ายังไม่ login → redirect ไป `/login`
- ถ้า login แล้ว → ดำเนินการจอง

### 4. Login Redirect
หลัง login สำเร็จ:
- ถ้ามาจากหน้าอื่น → กลับไปหน้าเดิม
- ถ้าเข้า login โดยตรง → ไปหน้า `/dashboard`

## 🔧 API Endpoints (Mocked)

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify OTP (accepts `123456`)
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `GET /users/:id/enrollments` - Get user's workshop enrollments

## 💡 Usage Examples

### Login
```javascript
import { useAuth } from '../hooks/useAuth';

const { login } = useAuth();
const result = await login('tourist@test.com', 'test123');

if (result.success) {
  // Login successful
}
```

### Check Authentication
```javascript
import { useAuth } from '../hooks/useAuth';

const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  console.log('Logged in as:', user.email);
}
```

### Logout
```javascript
import { useAuth } from '../hooks/useAuth';

const { logout } = useAuth();
logout(); // Clear auth state and redirect
```

## 🎨 UI Components

### Navbar
- แสดง Login/Register buttons เมื่อยังไม่ login
- แสดง User dropdown (Dashboard, Settings, Logout) เมื่อ login แล้ว

### WorkshopModal
- ปุ่ม "จองกิจกรรม / สอบถาม" เมื่อ login แล้ว
- ปุ่ม "เข้าสู่ระบบ" เมื่อยังไม่ login (redirect ไป login)

### UserDashboard
- Protected route - ต้อง login ก่อน
- แสดงสถิติและรายการจองทั้งหมด
- Tabs: Upcoming, Past, All

## 🔄 Switching to Real Backend

เมื่อ Backend พร้อม:

1. ปิด MSW ใน `main.jsx`:
```javascript
// Comment out or remove
// enableMocking().then(() => { ... })

// Use normal render
createRoot(document.getElementById('root')).render(...)
```

2. อัปเดต API base URL ใน `.env`:
```
VITE_API_URL=https://your-backend-api.com
```

3. ลบหรือ comment MSW imports ออก

## 📝 Notes

- MSW ทำงานเฉพาะใน development mode (`import.meta.env.MODE === 'development'`)
- ข้อมูล mock จะหายเมื่อ refresh page (ไม่มี persistence)
- Token ถูกเก็บใน localStorage เพื่อจำลองการทำงานจริง
- Console จะแสดง `[MSW] Mocking enabled` เมื่อ MSW ทำงาน
