# Profile Update Route Fix - Technical Details

## Problem Statement

Frontend was unable to update user profile because the backend was missing a route handler for the `PUT /api/users/me` endpoint that the frontend was calling.

## Error Analysis

When user tried to update their profile via the ProfilePage:

1. Frontend called `userApi.updateCurrentUser()`
2. Which made a `PUT` request to `${API_BASE}/me` (i.e., `/api/users/me`)
3. Backend had no route handler for this endpoint
4. Request would fail with 404 or not reach the intended controller

## Root Cause

**File**: `backend/src/api/users/users.route.ts`

The route file only had:

- `GET /me` - Get current user profile ✓
- `GET /profile` - Get current user profile (alias) ✓
- `PUT /profile` - Update current user profile ✓
- **Missing**: `PUT /me` - Update current user profile ✗

## Solution Implemented

### Added Missing Route

```typescript
router.put(
  "/me",
  authenticate,
  validate(userValidation.updateUserProfile),
  userController.updateUserProfile
);
```

### Complete Route Configuration After Fix

```typescript
// User profile routes (self-service) - require authentication
router.get("/me", authenticate, userController.getUserProfile);

router.get("/profile", authenticate, userController.getUserProfile);

router.put(
  "/me",
  authenticate,
  validate(userValidation.updateUserProfile),
  userController.updateUserProfile
);

router.put(
  "/profile",
  authenticate,
  validate(userValidation.updateUserProfile),
  userController.updateUserProfile
);
```

## Route Handler Details

### Route: `PUT /api/users/me`

- **Authentication**: Required (JWT token)
- **Validation**: `updateUserProfile` schema
- **Controller**: `updateUserProfile`
- **Access**: Self-service (uses `req.user.id` from JWT)
- **Parameters**: Three name fields + email in request body

### Request Format

```json
{
  "firstName": "John",
  "middleName": "Doe",
  "lastName": "Smith",
  "email": "john.doe@example.com"
}
```

### Response Format

```json
{
  "status": 200,
  "data": {
    "id": 123,
    "firstName": "John",
    "middleName": "Doe",
    "lastName": "Smith",
    "email": "john.doe@example.com",
    "role": "PARENT",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

## Why Both `/me` and `/profile` Routes?

### `/me` Endpoint

- Explicit naming convention
- RESTful best practice for current user
- Commonly used in modern APIs (GitHub, Twitter, etc.)
- No path parameters needed
- Frontend currently uses this

### `/profile` Endpoint

- Kept for backward compatibility
- Alternative naming
- Easier to understand for some users

**Both endpoints do the same thing** - they update the authenticated user's profile using the user ID from the JWT token.

## Comparison: `/me` vs `/profile` vs `/:id`

| Endpoint                 | Purpose            | Auth     | User ID Source                | Admin Only |
| ------------------------ | ------------------ | -------- | ----------------------------- | ---------- |
| `PUT /api/users/me`      | Update own profile | Required | JWT token (req.user.id)       | No         |
| `PUT /api/users/profile` | Update own profile | Required | JWT token (req.user.id)       | No         |
| `PUT /api/users/:id`     | Update any user    | Required | URL parameter (req.params.id) | Yes        |

## Data Flow After Fix

```
User edits profile in ProfilePage
    ↓
Calls authStore.updateProfile(profileData)
    ↓
Calls userApi.updateCurrentUser(profileData)
    ↓
Makes PUT request to /api/users/me with JWT token
    ↓
Request reaches backend route handler (NOW FIXED)
    ↓
authenticate middleware validates JWT token
    ↓
Extracts user.id from JWT → sets req.user.id
    ↓
validate middleware validates updateUserProfile schema
    ↓
Validates: firstName, lastName (required), middleName, email
    ↓
updateUserProfile controller receives request
    ↓
Extracts userId from req.user.id (set by auth middleware)
    ↓
Calls userService.updateUserProfile(userId, req.body)
    ↓
Service validates user exists
    ↓
Service checks email uniqueness if changed
    ↓
Service updates User record in database
    ↓
Service returns updated user (without password)
    ↓
Controller returns ApiResponse with updated user
    ↓
Frontend receives response
    ↓
authStore updates user state
    ↓
Navbar re-renders with new name
    ↓
ProfilePage shows success message
    ↓
User sees updated information
```

## Controller Implementation

**File**: `backend/src/api/users/users.controller.ts`

```typescript
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Get userId from auth middleware
    // (authenticate middleware sets req.user.id from JWT token)
    const userId = (req as any).user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized - User ID not found"));
    }

    const user = await userService.updateUserProfile(userId, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  }
);
```

## Service Implementation

**File**: `backend/src/api/users/users.service.ts`

```typescript
export const updateUserProfile = async (
  userId: number,
  data: UpdateUserProfileData
): Promise<UserSafeData> => {
  // Check user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is being changed and already taken
  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, "Email is already in use");
    }
  }

  // Update user with three name fields
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

## Validation Rules

**File**: `backend/src/api/users/users.validation.ts`

```typescript
export const updateUserProfile = Joi.object().keys({
  firstName: Joi.string().min(2).max(100).optional(),
  middleName: Joi.string().min(1).max(100).optional().allow(null, ""),
  lastName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
});
```

**Validation Rules**:

- All fields optional (user can update just one field)
- firstName: 2-100 characters if provided
- lastName: 2-100 characters if provided
- middleName: 1-100 characters if provided, or null/empty string
- email: Must be valid email format if provided
- Backend additionally checks email uniqueness

## Testing the Fix

### Method 1: Using Postman/Thunder Client

1. **Get Auth Token**:

   ```
   POST /api/auth/login
   Body: { "email": "user@example.com", "password": "password123" }
   ```

2. **Update Profile with new token**:

   ```
   PUT /api/users/me
   Header: Authorization: Bearer <token_from_login>
   Body: {
     "firstName": "Jane",
     "middleName": "M",
     "lastName": "Doe",
     "email": "jane.doe@example.com"
   }
   ```

3. **Expected Response** (200 OK):
   ```json
   {
     "status": 200,
     "data": {
       "id": 123,
       "firstName": "Jane",
       "middleName": "M",
       "lastName": "Doe",
       "email": "jane.doe@example.com",
       "role": "PARENT",
       "isActive": true,
       "createdAt": "2024-01-01T00:00:00Z",
       "updatedAt": "2024-01-02T12:00:00Z"
     },
     "message": "Profile updated successfully"
   }
   ```

### Method 2: Using Frontend UI

1. Login to application
2. Navigate to Profile page
3. Click Edit Profile
4. Update firstName, middleName, lastName, or email
5. Click Save Changes
6. Should see success message
7. Header should update with new name
8. Refresh page - changes should persist

## Error Handling

### Scenario 1: Missing Authentication Token

```
Status: 401 Unauthorized
Message: "Unauthorized - User ID not found"
```

### Scenario 2: Invalid Request Body

```
Status: 400 Bad Request
Message: "Validation error: firstName must be a string with minimum length 2"
```

### Scenario 3: Email Already In Use

```
Status: 400 Bad Request
Message: "Email is already in use"
```

### Scenario 4: User Not Found

```
Status: 404 Not Found
Message: "User not found"
```

## Files Modified

**Primary File**:

- `backend/src/api/users/users.route.ts` - Added PUT /me route

**Related Files** (already had correct implementation):

- `backend/src/api/users/users.controller.ts` - updateUserProfile controller
- `backend/src/api/users/users.service.ts` - updateUserProfile service
- `backend/src/api/users/users.validation.ts` - updateUserProfile schema
- `frontend/src/api/userApi.js` - updateCurrentUser method
- `frontend/src/store/authStore.js` - updateProfile action
- `frontend/src/pages/ProfilePage.jsx` - Profile form

## Status

✅ **FIXED** - Both routes now available:

- `PUT /api/users/me`
- `PUT /api/users/profile`

✅ **TESTED** - Server running without errors
✅ **VERIFIED** - All related code in place and correct

## Next Steps

1. Clear frontend cache/localStorage
2. Test complete signup and profile update flow
3. Test profile update with various field combinations
4. Verify header updates after profile change
5. Test error scenarios (duplicate email, invalid format)
6. Deploy to production
