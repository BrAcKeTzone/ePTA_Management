# Quick Testing Guide - Add/Edit User Forms

## Overview

The Add/Edit User forms now properly support three separate name fields and phone instead of phoneNumber throughout the entire application stack.

## Quick Test Checklist

### 1. Add User via HR Management Page

**Steps:**

1. Navigate to HR > User Management
2. Click "Add New User" button
3. Fill in the form:
   - First Name: "John"
   - Middle Name: "Paul" (optional)
   - Last Name: "Doe"
   - Email: "john@example.com"
   - Phone: "+63-912-345-6789"
   - Role: "APPLICANT"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Add User"

**Expected Result:**

- Modal closes
- User appears in the table with all three name fields displayed as "John Paul Doe"
- Email is recorded correctly
- Phone field is saved

### 2. Add User via Admin Users Page

**Steps:**

1. Navigate to Admin > Users
2. Click "Add New User" button
3. Fill in the form with same data as above
4. Role options: "Parent" or "Administrator"
5. Click "Create User"

**Expected Result:**

- Same as HR test
- User role is recorded correctly

### 3. Edit User (Admin Only)

**Steps:**

1. Navigate to Admin > Users
2. Click "Edit" button on any user row
3. Modal opens with user data pre-filled
4. Modify one of the name fields (e.g., change Middle Name)
5. Click "Update User"

**Expected Result:**

- Modal closes
- User list refreshes
- Changes are reflected in the table

### 4. Data Display Verification

**After adding a user, verify in the table:**

- User column shows: "firstName middleName lastName"
- Email column shows the correct email
- Phone column shows the correct phone (if provided)
- Created date is current

### 5. Database Verification (Backend)

**To verify data in database:**

```bash
# Connect to database and check User table
SELECT id, firstName, middleName, lastName, email, phone, role, isActive
FROM "User"
WHERE email = 'john@example.com';
```

**Expected Output:**

- firstName: John
- middleName: Paul
- lastName: Doe
- email: john@example.com
- phone: +63-912-345-6789
- role: APPLICANT or PARENT
- isActive: true

### 6. API Endpoint Testing

#### Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "middleName": "Anne",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+63-917-987-6543",
    "password": "password123",
    "role": "PARENT"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": 123,
    "firstName": "Jane",
    "middleName": "Anne",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+63-917-987-6543",
    "role": "PARENT",
    "isActive": true,
    "createdAt": "2025-11-06T04:26:20.029Z",
    "updatedAt": "2025-11-06T04:26:20.029Z"
  },
  "message": "User created successfully"
}
```

#### Update User

```bash
curl -X PUT http://localhost:3000/api/users/123 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "middleName": "Marie",
    "lastName": "Smith",
    "phone": "+63-917-111-2222"
  }'
```

**Expected Response:**

- Same structure as Create User response with updated fields

### 7. Error Cases to Test

#### Duplicate Email

**Try to create user with existing email:**

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "existing@example.com", // Already exists
  "password": "password123",
  "role": "PARENT"
}
```

**Expected:** Error 400 "Email already exists"

#### Missing Required Fields

**Try to create user without firstName:**

```json
{
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "role": "PARENT"
}
```

**Expected:** Validation error for missing firstName

#### Invalid Role

**Try to create user with invalid role:**

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "role": "INVALID_ROLE"
}
```

**Expected:** Validation error for invalid role

#### Short Password

**Try to create user with short password:**

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "12345", // Less than 6 characters
  "role": "PARENT"
}
```

**Expected:** Validation error for password too short

## Form Field Mapping

### Frontend Form Fields → Backend API

| Frontend Field | Backend Field | Required | Type    | Notes                      |
| -------------- | ------------- | -------- | ------- | -------------------------- |
| First Name     | firstName     | Yes      | String  | Min 2 chars                |
| Middle Name    | middleName    | No       | String  | Can be empty or null       |
| Last Name      | lastName      | Yes      | String  | Min 2 chars                |
| Email          | email         | Yes      | String  | Must be unique             |
| Phone          | phone         | No       | String  | Can be empty or null       |
| Password       | password      | Yes      | String  | Min 6 chars (create only)  |
| Role           | role          | Yes      | Enum    | PARENT or ADMIN            |
| Is Active      | isActive      | No       | Boolean | Defaults to true on create |

## Frontend Components Updated

1. `frontend/src/pages/HR/UserManagement.jsx` - Add User form
2. `frontend/src/pages/Admin/Users.jsx` - Add User and Edit User forms
3. `frontend/src/store/userManagementStore.js` - Data mapping

## Backend Endpoints Updated

1. `POST /api/users` - Create new user (NEW)
2. `PUT /api/users/:id` - Update existing user (ENHANCED)

## Known Limitations

- Admin cannot update their own role (to prevent removing all admins)
- Admin cannot deactivate the last active admin
- Email must be unique across the system
- Phone field is optional but stored as-is if provided

## Success Indicators

✅ Forms accept three separate name fields
✅ Phone field saves correctly
✅ Data displays as "firstName middleName lastName" in tables
✅ API endpoints accept new data structure
✅ No duplicate emails allowed
✅ Edit modal pre-fills all three name fields
✅ Password is hashed on create
✅ No password field shown in display or edit response
