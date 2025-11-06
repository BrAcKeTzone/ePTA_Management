# Edit User Active Status Fix

## Issue

The ability to set a user's active status to inactive via the Edit User modal was not working properly. The `isActive` field was not being sent to the backend during user updates.

## Root Cause Analysis

### Problem 1: Frontend Store Missing isActive Field

**File:** `frontend/src/store/userManagementStore.js`

The `updateUser` action was mapping user data but NOT including the `isActive` field:

```javascript
// BEFORE - Missing isActive
const mappedUserData = {
  email: userData.email,
  firstName: userData.firstName,
  middleName: userData.middleName || "",
  lastName: userData.lastName,
  phone: userData.phone || "",
  role: userData.role,
  // isActive was missing!
};
```

### Problem 2: Backend Validation Schema Missing Phone Field

**File:** `backend/src/api/users/users.validation.ts`

The `updateUserByAdmin` validation schema didn't include the `phone` field, which would cause validation errors when updating user phone numbers.

## Solutions Implemented

### Solution 1: Add isActive Field to updateUser Store Action

**File:** `frontend/src/store/userManagementStore.js`

**After:**

```javascript
const mappedUserData = {
  email: userData.email,
  firstName: userData.firstName,
  middleName: userData.middleName || "",
  lastName: userData.lastName,
  phone: userData.phone || "",
  role: userData.role,
  isActive: userData.isActive !== undefined ? userData.isActive : true,
};
```

This ensures:

- The `isActive` field is always sent
- Defaults to `true` if not provided
- Properly passes the checkbox value from the Edit User modal

### Solution 2: Add Phone Field to updateUserByAdmin Validation Schema

**File:** `backend/src/api/users/users.validation.ts`

**After:**

```typescript
export const updateUserByAdmin = Joi.object().keys({
  firstName: Joi.string().min(2).max(100).optional(),
  middleName: Joi.string().min(1).max(100).optional().allow(null, ""),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().allow(null, ""), // ADDED
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
  isActive: Joi.boolean().optional(),
});
```

This allows:

- Phone field to be updated without validation errors
- Consistent with the `createUser` schema

## How It Works Now

### Edit User Flow

1. User opens Edit User modal in Admin Users page
2. Modal pre-populates with current user data including `isActive` status
3. User unchecks "User is active" checkbox (isActive becomes false)
4. User clicks "Update User"
5. Frontend store receives `selectedUser` object with `isActive: false`
6. `updateUser` action maps it to backend format including `isActive`
7. API sends `PUT /api/users/:id` with `{ ..., isActive: false, ... }`
8. Backend validation schema accepts `isActive` boolean
9. `updateUserByAdmin` service receives the data
10. Checks if deactivating last admin (prevents it if so)
11. Updates user with `isActive: false`
12. User is successfully deactivated

### Backend Logic

The backend includes safety checks:

- **Cannot deactivate last admin**: If trying to set the last active admin to inactive, throws error
- **Email uniqueness**: Validates email isn't taken by another user
- **Role changes**: Validates last admin can't change role away from ADMIN

## Files Modified

### Frontend

- `frontend/src/store/userManagementStore.js`
  - Added `isActive` field to `updateUser` action mapping

### Backend

- `backend/src/api/users/users.validation.ts`
  - Added `phone` field to `updateUserByAdmin` schema

## Testing

### Test Case 1: Deactivate a User

1. Navigate to Admin > Users
2. Click Edit on any user (not the last admin)
3. Uncheck "User is active"
4. Click "Update User"
5. **Expected**: User status changes to Inactive
6. **Verify**: User appears with inactive status in list

### Test Case 2: Reactivate a User

1. Click Edit on an inactive user
2. Check "User is active"
3. Click "Update User"
4. **Expected**: User status changes to Active
5. **Verify**: User appears with active status in list

### Test Case 3: Cannot Deactivate Last Admin

1. Ensure there's only one admin user
2. Try to deactivate that admin
3. **Expected**: Error message "Cannot deactivate the last active admin"
4. **Verify**: User remains active

### Test Case 4: Update Phone Number During Edit

1. Click Edit on a user
2. Change the phone number
3. Change active status
4. Click "Update User"
5. **Expected**: Both phone and status update successfully
6. **Verify**: User list shows new phone and status

## API Contract

### PUT /api/users/:id

**Request Body:**

```json
{
  "firstName": "John",
  "middleName": "Paul",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+63-912-345-6789",
  "role": "PARENT",
  "isActive": false
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": 1,
    "firstName": "John",
    "middleName": "Paul",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+63-912-345-6789",
    "role": "PARENT",
    "isActive": false,
    "createdAt": "2025-11-06T04:26:20.029Z",
    "updatedAt": "2025-11-06T05:30:00.000Z"
  },
  "message": "User updated successfully"
}
```

**Error Response (400) - Cannot deactivate last admin:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot deactivate the last active admin"
}
```

## Status: ✅ FIXED

All components now properly handle the active status field:

- ✅ Frontend modal captures checkbox state
- ✅ Store properly maps isActive field
- ✅ Backend accepts and validates isActive
- ✅ Phone field validation also fixed
- ✅ Safety checks prevent invalid operations
- ✅ No console errors

The edit user functionality is now production-ready and can toggle user active status successfully.
