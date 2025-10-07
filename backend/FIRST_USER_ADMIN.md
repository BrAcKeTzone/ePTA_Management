# First User Auto-Admin Feature

## Overview

The system automatically assigns the **ADMIN** role to the first user who registers in the system. All subsequent users will be assigned the **PARENT** role by default.

## How It Works

1. When a user attempts to register, the system checks if there are any existing users in the database.
2. If the user count is **0** (no users exist), the new user is assigned the **ADMIN** role.
3. If users already exist, the new user is assigned the **PARENT** role.

## Implementation Details

### Location

File: `src/api/auth/auth.service.ts`

### Code Logic

```typescript
// Check if this is the first user in the system
const userCount = await prisma.user.count();
const isFirstUser = userCount === 0;

user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    phone,
    // First user automatically becomes an admin
    role: isFirstUser ? "ADMIN" : "PARENT",
  },
});
```

## Benefits

1. **Automatic Setup**: No need for manual admin account creation.
2. **Secure**: Only the very first user gets admin privileges automatically.
3. **User-Friendly**: Simplifies initial system setup for new deployments.
4. **Scalable**: All subsequent users follow the normal parent role assignment.

## Important Notes

- ⚠️ **Security**: Make sure the first registration is done by the intended administrator.
- ⚠️ **Production**: In production, consider registering the first admin account immediately after deployment.
- ℹ️ **Testing**: In test environments, you may need to clear the database to test this feature.

## Registration Flow

### First User (Becomes Admin)

1. Request OTP: `POST /api/auth/send-otp` with email
2. Verify OTP: `POST /api/auth/verify-otp` with email and OTP
3. Register: `POST /api/auth/register` with user details
4. ✅ User is created with **ADMIN** role

### Subsequent Users (Become Parents)

1. Request OTP: `POST /api/auth/send-otp` with email
2. Verify OTP: `POST /api/auth/verify-otp` with email and OTP
3. Register: `POST /api/auth/register` with user details
4. ✅ User is created with **PARENT** role

## Example

### Database is Empty (First User)

```json
POST /api/auth/register
{
  "email": "admin@school.edu",
  "password": "SecurePass123",
  "name": "School Administrator",
  "phone": "+1234567890"
}

Response:
{
  "statusCode": 201,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@school.edu",
      "name": "School Administrator",
      "role": "ADMIN",  // ← Automatically assigned
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Database Has Users (Second+ User)

```json
POST /api/auth/register
{
  "email": "parent@example.com",
  "password": "SecurePass123",
  "name": "John Parent",
  "phone": "+1234567891"
}

Response:
{
  "statusCode": 201,
  "data": {
    "user": {
      "id": 2,
      "email": "parent@example.com",
      "name": "John Parent",
      "role": "PARENT",  // ← Default role
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Troubleshooting

### Issue: Second user got admin role

**Cause**: The database was not properly set up or was empty when the second user registered.
**Solution**: Ensure the first admin user completed registration successfully before allowing other users to register.

### Issue: Want to change admin assignment

**Solution**: Admins can manually change user roles through the user management system (to be implemented) or directly in the database if needed.

## Future Enhancements

- Add an admin endpoint to promote/demote users to/from admin role.
- Add a setting to disable automatic admin assignment after first setup.
- Add audit logging for role changes.
