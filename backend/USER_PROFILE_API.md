# User Profile API Documentation

## Overview
The User Profile module allows authenticated users to view and manage their profile information, including personal details, fitness goals, and account security.

## Base URL
```
http://localhost:5000/api/users
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## Endpoints

### 1. Get Current User Profile

**GET** `/me`

Get the profile of the currently authenticated user.

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "analyst",
    "avatar": "https://example.com/avatar.jpg",
    "age": 25,
    "gender": "male",
    "height": 175.5,
    "weight": 70.0,
    "fitness_goal": "muscle_gain",
    "activity_level": "moderately_active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T00:00:00.000Z",
    "last_login": "2024-01-20T10:30:00.000Z"
  }
}
```

#### Status Codes
- `200 OK` - Profile retrieved successfully
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

---

### 2. Update Current User Profile

**PUT** `/me`

Update the profile of the currently authenticated user.

#### Allowed Fields
- `name` or `full_name` (string, 2-255 characters)
- `avatar` (string, valid URL)
- `age` (integer, 1-150)
- `gender` (enum: 'male', 'female', 'other', 'prefer_not_to_say')
- `height` (decimal, 0.1-300 cm)
- `weight` (decimal, 0.1-500 kg)
- `fitnessGoal` or `fitness_goal` (enum: 'weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'general_fitness')
- `activityLevel` or `activity_level` (enum: 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')

#### Protected Fields (Cannot be Updated)
- `id`
- `email`
- `password`
- `role`
- `created_at`
- `updated_at`

#### Request Body
```json
{
  "name": "John Doe Updated",
  "avatar": "https://example.com/new-avatar.jpg",
  "age": 26,
  "gender": "male",
  "height": 180.0,
  "weight": 75.0,
  "fitnessGoal": "muscle_gain",
  "activityLevel": "very_active"
}
```

#### Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe Updated",
    "role": "analyst",
    "avatar": "https://example.com/new-avatar.jpg",
    "age": 26,
    "gender": "male",
    "height": 180.0,
    "weight": 75.0,
    "fitness_goal": "muscle_gain",
    "activity_level": "very_active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-20T12:00:00.000Z",
    "last_login": "2024-01-20T10:30:00.000Z"
  }
}
```

#### Status Codes
- `200 OK` - Profile updated successfully
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

#### Validation Errors
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Age must be a positive integer between 1 and 150",
      "param": "age",
      "location": "body"
    }
  ]
}
```

---

### 3. Change Password

**PUT** `/change-password`

Change the password of the currently authenticated user.

#### Request Body
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

#### Validation Rules
- `currentPassword` - Required
- `newPassword` - Minimum 6 characters, must be different from current password

#### Response (Success)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Response (Error)
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

#### Status Codes
- `200 OK` - Password changed successfully
- `400 Bad Request` - Validation error or incorrect current password
- `401 Unauthorized` - Missing or invalid token

---

### 4. Delete Account (Soft Delete)

**DELETE** `/me`

Soft delete the currently authenticated user's account. The account is marked as deleted but not permanently removed from the database.

#### Response
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

#### Status Codes
- `200 OK` - Account deleted successfully
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found or already deleted

---

## Field Constraints

### Gender
- `male`
- `female`
- `other`
- `prefer_not_to_say`

### Fitness Goal
- `weight_loss` - Focus on losing weight
- `muscle_gain` - Focus on building muscle
- `maintenance` - Maintain current fitness
- `endurance` - Improve stamina and endurance
- `general_fitness` - Overall health and fitness

### Activity Level
- `sedentary` - Little to no exercise
- `lightly_active` - Light exercise 1-3 days/week
- `moderately_active` - Moderate exercise 3-5 days/week
- `very_active` - Hard exercise 6-7 days/week
- `extremely_active` - Very hard exercise & physical job

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch profile"
}
```

---

## Usage Examples

### Get Profile
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer your_access_token"
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "age": 28,
    "fitnessGoal": "weight_loss",
    "activityLevel": "moderately_active"
  }'
```

### Change Password
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "old_password",
    "newPassword": "new_secure_password"
  }'
```

### Delete Account
```bash
curl -X DELETE http://localhost:5000/api/users/me \
  -H "Authorization: Bearer your_access_token"
```

---

## Security Notes

1. **Password Protection**: Password hashes are never returned in API responses
2. **User Isolation**: Users can only access and modify their own profile
3. **Soft Delete**: Deleted accounts remain in database with `deleted_at` timestamp
4. **Token Required**: All endpoints require valid JWT authentication
5. **Field Protection**: Critical fields (email, role, id) cannot be modified through profile update

---

## Database Schema

### Users Table (Profile Fields)
```sql
id SERIAL PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
full_name VARCHAR(255) NOT NULL
role VARCHAR(50) DEFAULT 'analyst'
avatar VARCHAR(500)
age INTEGER CHECK (age IS NULL OR age > 0)
gender VARCHAR(20) CHECK (gender IN (...))
height DECIMAL(5, 2) CHECK (height IS NULL OR height > 0)
weight DECIMAL(5, 2) CHECK (weight IS NULL OR weight > 0)
fitness_goal VARCHAR(50) CHECK (fitness_goal IN (...))
activity_level VARCHAR(50) CHECK (activity_level IN (...))
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
last_login TIMESTAMP
is_active BOOLEAN DEFAULT true
deleted_at TIMESTAMP
```
