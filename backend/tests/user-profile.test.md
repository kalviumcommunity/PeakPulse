# User Profile API Testing Guide

## Prerequisites
- Backend server running on http://localhost:5000
- Valid JWT token from login

## Test Cases

### 1. Authentication Tests

#### 1.1 Access profile without token
```bash
curl -X GET http://localhost:5000/api/users/me
# Expected: 401 Unauthorized
```

#### 1.2 Access with invalid token
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer invalid_token_here"
# Expected: 403 Forbidden
```

#### 1.3 Access with expired token
```bash
# Use an expired token
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer expired_token_here"
# Expected: 403 Forbidden
```

### 2. Get Profile Tests

#### 2.1 Get profile with valid token
```bash
# First login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Copy the accessToken from response, then:
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
# Expected: 200 OK with user profile (no password_hash)
```

### 3. Update Profile Tests

#### 3.1 Update valid fields
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "age": 25,
    "gender": "male",
    "height": 175.5,
    "weight": 70.0,
    "fitnessGoal": "muscle_gain",
    "activityLevel": "moderately_active"
  }'
# Expected: 200 OK with updated profile
```

#### 3.2 Update with avatar
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar": "https://example.com/avatar.jpg"
  }'
# Expected: 200 OK
```

#### 3.3 Update with partial data
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30
  }'
# Expected: 200 OK (only age updated)
```

### 4. Validation Failure Tests

#### 4.1 Invalid age (negative)
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": -5
  }'
# Expected: 400 Bad Request
```

#### 4.2 Invalid age (too high)
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 200
  }'
# Expected: 400 Bad Request
```

#### 4.3 Invalid gender
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "invalid_gender"
  }'
# Expected: 400 Bad Request
```

#### 4.4 Invalid height (negative)
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "height": -10
  }'
# Expected: 400 Bad Request
```

#### 4.5 Invalid weight (negative)
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weight": -5
  }'
# Expected: 400 Bad Request
```

#### 4.6 Invalid fitness goal
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fitnessGoal": "become_superhero"
  }'
# Expected: 400 Bad Request
```

#### 4.7 Invalid activity level
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activityLevel": "super_active"
  }'
# Expected: 400 Bad Request
```

#### 4.8 Invalid avatar URL
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar": "not_a_valid_url"
  }'
# Expected: 400 Bad Request
```

#### 4.9 Name too short
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A"
  }'
# Expected: 400 Bad Request
```

### 5. Protected Fields Tests

#### 5.1 Attempt to update email
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@test.com"
  }'
# Expected: 400 Bad Request (email cannot be updated)
```

#### 5.2 Attempt to update password directly
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword"
  }'
# Expected: 400 Bad Request (password cannot be updated)
```

#### 5.3 Attempt to update id
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 999
  }'
# Expected: 400 Bad Request
```

#### 5.4 Attempt to update role
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
# Expected: 400 Bad Request
```

#### 5.5 Attempt to update created_at
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "created_at": "2020-01-01T00:00:00Z"
  }'
# Expected: 400 Bad Request
```

### 6. Change Password Tests

#### 6.1 Change password successfully
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "test123",
    "newPassword": "newtest123"
  }'
# Expected: 200 OK

# Verify by logging in with new password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"newtest123"}'
# Expected: 200 OK with tokens
```

#### 6.2 Change password with wrong current password
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "wrongpassword",
    "newPassword": "newtest123"
  }'
# Expected: 400 Bad Request (incorrect current password)
```

#### 6.3 New password too short
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "test123",
    "newPassword": "123"
  }'
# Expected: 400 Bad Request (password too short)
```

#### 6.4 New password same as current
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "test123",
    "newPassword": "test123"
  }'
# Expected: 400 Bad Request (new password must be different)
```

#### 6.5 Missing current password
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newtest123"
  }'
# Expected: 400 Bad Request
```

#### 6.6 Missing new password
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "test123"
  }'
# Expected: 400 Bad Request
```

### 7. Delete Account Tests

#### 7.1 Soft delete account
```bash
curl -X DELETE http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
# Expected: 200 OK

# Verify user cannot login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
# Expected: 401 Unauthorized
```

#### 7.2 Delete without authentication
```bash
curl -X DELETE http://localhost:5000/api/users/me
# Expected: 401 Unauthorized
```

### 8. Edge Cases

#### 8.1 Update with empty object
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 200 OK (no changes)
```

#### 8.2 Very long name
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'"$(printf 'A%.0s' {1..300})"'"
  }'
# Expected: 400 Bad Request (name too long)
```

#### 8.3 Boundary values for height
```bash
# Minimum valid height
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"height": 0.1}'
# Expected: 200 OK

# Maximum valid height
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"height": 300}'
# Expected: 200 OK
```

#### 8.4 Boundary values for weight
```bash
# Minimum valid weight
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.1}'
# Expected: 200 OK

# Maximum valid weight
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weight": 500}'
# Expected: 200 OK
```

## Testing Checklist

- [ ] All authentication tests pass
- [ ] Profile retrieval works correctly
- [ ] Profile updates work with valid data
- [ ] All validation tests fail appropriately
- [ ] Protected fields cannot be updated
- [ ] Password change works correctly
- [ ] Password validations work
- [ ] Account deletion works (soft delete)
- [ ] No password hashes exposed in responses
- [ ] Users can only access their own profile
- [ ] All edge cases handled properly

## Notes

- Replace `YOUR_ACCESS_TOKEN` with actual token from login
- Test with multiple users to verify isolation
- Check database to confirm soft delete sets deleted_at
- Verify updated_at timestamps change on updates
