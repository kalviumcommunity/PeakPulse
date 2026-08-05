# Quick Start - User Profile Module

## ⚡ Immediate Next Steps

### 1. Start PostgreSQL Database
Ensure your PostgreSQL server is running on port 5432.

### 2. Run Database Migration
```bash
cd backend
npm run migrate:profile
```

This will add the new profile fields to your users table.

### 3. Start Backend Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 4. Test the API

#### Step 1: Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "test123",
    "full_name": "Test User"
  }'
```

#### Step 2: Login and get token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "test123"
  }'
```

**Save the `accessToken` from response!**

#### Step 3: Get your profile
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

#### Step 4: Update your profile
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 25,
    "gender": "male",
    "height": 175.5,
    "weight": 70.0,
    "fitnessGoal": "muscle_gain",
    "activityLevel": "moderately_active"
  }'
```

#### Step 5: Change password
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "test123",
    "newPassword": "newpassword123"
  }'
```

---

## 📂 New Files Overview

### Controllers
- `backend/src/controllers/user.controller.ts` - Handles HTTP requests

### Services  
- `backend/src/services/user.service.ts` - Business logic

### Routes
- `backend/src/routes/user.routes.ts` - API route definitions

### Migrations
- `backend/src/database/migrations/add_profile_fields.sql` - Database schema changes
- `backend/src/database/migrations/run_profile_migration.ts` - Migration runner

---

## 🎯 Key Features

### ✅ Implemented Endpoints

1. **GET /api/users/me** - Get profile
2. **PUT /api/users/me** - Update profile  
3. **PUT /api/users/change-password** - Change password
4. **DELETE /api/users/me** - Soft delete account

### ✅ Profile Fields

- name/full_name
- avatar (URL)
- age (1-150)
- gender (male, female, other, prefer_not_to_say)
- height (0.1-300 cm)
- weight (0.1-500 kg)
- fitnessGoal (weight_loss, muscle_gain, maintenance, endurance, general_fitness)
- activityLevel (sedentary, lightly_active, moderately_active, very_active, extremely_active)

### 🔒 Security

- ✅ JWT authentication required
- ✅ Password never exposed
- ✅ User isolation (can only access own profile)
- ✅ Protected fields (id, email, role cannot be changed)
- ✅ Password verification for changes
- ✅ Soft delete (data preserved)

---

## 🧪 Testing

Full test suite with 50+ test cases available in:
`backend/tests/user-profile.test.md`

Run through all test cases to verify:
- Authentication
- Profile retrieval
- Profile updates
- Validation
- Password change
- Account deletion

---

## 📖 Documentation

- **API Reference:** `backend/USER_PROFILE_API.md`
- **Test Cases:** `backend/tests/user-profile.test.md`
- **Summary:** `USER_PROFILE_MODULE_SUMMARY.md`

---

## 🔧 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Start PostgreSQL server

### Migration Already Applied
If migration fails because fields already exist, that's OK - they're already there!

### Token Expired
If you get 403 errors, login again to get a new token.

---

## 🚀 Git Status

**Branch:** `feature/user-profile-module` ✅  
**Pushed to GitHub:** ✅  
**Ready for PR:** ✅

**Next Steps:**
1. Test all endpoints
2. Create Pull Request on GitHub
3. Get code review
4. Merge to main

---

## 💡 Quick Tips

1. **Token Management:** Save your access token after login - you'll need it for all profile endpoints

2. **Validation:** The API validates all input - check error messages if requests fail

3. **Flexible Input:** The API accepts both camelCase (`fitnessGoal`) and snake_case (`fitness_goal`)

4. **Partial Updates:** You can update just one field - no need to send all fields

5. **Password Security:** Always verify current password before allowing change

---

## ✅ Verification Checklist

Before marking as complete, verify:

- [ ] Database migration ran successfully
- [ ] Server starts without errors
- [ ] Can register new user
- [ ] Can login and get token
- [ ] Can get profile (password not exposed)
- [ ] Can update profile with valid data
- [ ] Validation rejects invalid data
- [ ] Cannot update protected fields (email, id, role)
- [ ] Can change password successfully
- [ ] Current password verified for password change
- [ ] Can soft delete account
- [ ] Deleted user cannot login

---

## 🎓 Learning Points

This implementation demonstrates:

1. **Clean Architecture** - Controllers → Services → Database
2. **Validation Strategy** - Express Validator middleware
3. **Security Best Practices** - JWT auth, password hashing, field protection
4. **TypeScript Types** - DTOs and interfaces
5. **Error Handling** - Consistent error responses
6. **Database Migrations** - Safe schema updates
7. **Documentation** - API docs and test cases
8. **Git Workflow** - Feature branch, meaningful commits

---

**Happy Coding! 🚀**
