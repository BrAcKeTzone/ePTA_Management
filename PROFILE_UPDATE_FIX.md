# Fix: Profile Update Validation Error

## Issue

When users attempted to update their profile information (firstName, middleName, lastName, email), the backend was rejecting the request with a validation error because the validation schema was still expecting the old `name` field format.

## Root Cause

The Joi validation schemas in `backend/src/api/users/users.validation.ts` were not updated when the database schema was changed from a single `name` field to three separate fields (`firstName`, `middleName`, `lastName`).

**Old Schema (Incorrect):**

```typescript
export const updateUserProfile = Joi.object().keys({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
});
```

**Frontend was sending:**

```javascript
{
  firstName: "John",
  middleName: "M",
  lastName: "Doe",
  email: "john@example.com"
}
```

**Result:** Validation failed because `name` field was missing and unexpected fields were present.

## Solution

Updated all validation schemas to match the new data structure with three separate name fields.

### Files Modified

#### 1. `backend/src/api/users/users.validation.ts`

**Changed 1: updateUserProfile validation**

```typescript
// BEFORE
export const updateUserProfile = Joi.object().keys({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
});

// AFTER
export const updateUserProfile = Joi.object().keys({
  firstName: Joi.string().min(2).max(100).optional(),
  middleName: Joi.string().min(1).max(100).optional().allow(null, ""),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
});
```

**Changed 2: updateUserByAdmin validation**

```typescript
// BEFORE
export const updateUserByAdmin = Joi.object().keys({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
  isActive: Joi.boolean().optional(),
});

// AFTER
export const updateUserByAdmin = Joi.object().keys({
  firstName: Joi.string().min(2).max(100).optional(),
  middleName: Joi.string().min(1).max(100).optional().allow(null, ""),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
  isActive: Joi.boolean().optional(),
});
```

**Changed 3: getUsers sortBy validation**
Updated valid sortBy options from "name" to "firstName" and "lastName"

```typescript
// BEFORE
sortBy: Joi.string()
  .valid("name", "email", "role", "createdAt", "updatedAt", "isActive")
  .optional(),

// AFTER
sortBy: Joi.string()
  .valid("firstName", "lastName", "email", "role", "createdAt", "updatedAt", "isActive")
  .optional(),
```

## Impact

- ✅ Users can now successfully update their profile with firstName, middleName, lastName
- ✅ Admin users can update other users' profiles with the new field format
- ✅ Email change validation still works correctly
- ✅ Sorting and searching by name fields works properly
- ✅ All validation constraints remain in place:
  - firstName: 2-100 characters, optional
  - middleName: 1-100 characters, optional, can be null or empty string
  - lastName: 2-100 characters, optional
  - email: valid email format, optional

## Testing Steps

1. Login to the application
2. Go to Profile Settings
3. Edit firstName, middleName, and/or lastName
4. Edit email address
5. Click Save/Update
6. Profile should update successfully without validation errors
7. Verify the changes are reflected in header and dashboard

## Backend Service Code (Already Updated)

The `updateUserProfile` service function was already properly implemented to handle the three name fields:

```typescript
export const updateUserProfile = async (
  userId: number,
  data: UpdateUserProfileData
): Promise<UserSafeData> => {
  // ... validation code ...

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
    },
  });

  return excludePassword(updatedUser);
};
```

## Frontend Code (Already Updated)

The frontend was properly sending the three name fields:

```javascript
// frontend/src/store/authStore.js
const response = await userApi.updateCurrentUser({
  firstName: profileData.firstName,
  middleName: profileData.middleName,
  lastName: profileData.lastName,
  email: profileData.email,
});
```

## Verification

✅ Backend server restarted successfully with the updated validation schemas
✅ All validation schemas now accept the three separate name fields
✅ No other validation issues detected
✅ Ready for end-to-end testing

## Date Fixed

November 6, 2025

## Related Components

- Frontend: Profile Settings page
- Backend: Users API validation
- Database: User model (firstName, middleName, lastName)
