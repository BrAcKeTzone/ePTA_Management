# User Management API Documentation

## Overview

The User Management API provides comprehensive functionality for managing user accounts in the PTA system, including profile management, role assignment, account activation/deactivation, and user statistics.

## Base URL

```
http://localhost:3000/api/users
```

## Authentication

All endpoints require proper authentication (to be implemented with auth middleware). Some endpoints are admin-only.

---

## User Profile Endpoints (Self-Service)

### 1. Get Current User Profile

**GET** `/api/users/profile`

Retrieves the profile of the currently authenticated user, including linked students.

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "email": "maria.cruz@example.com",
    "name": "Maria Cruz",
    "phone": "+1234567890",
    "role": "PARENT",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "students": [
      {
        "id": 1,
        "studentId": "2024-12345",
        "firstName": "Juan",
        "lastName": "Cruz",
        "middleName": "Santos",
        "program": "BSIT",
        "yearLevel": "2nd Year",
        "academicYear": "2024-2025",
        "status": "ACTIVE",
        "email": "juan.cruz@example.com",
        "phone": "+1234567891"
      }
    ]
  },
  "message": "Profile retrieved successfully",
  "success": true
}
```

### 2. Update User Profile

**PUT** `/api/users/profile`

Updates the current user's profile information.

**Request Body:**

```json
{
  "name": "Maria Santos Cruz",
  "phone": "+9876543210",
  "email": "maria.s.cruz@example.com"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "email": "maria.s.cruz@example.com",
    "name": "Maria Santos Cruz",
    "phone": "+9876543210",
    "role": "PARENT",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  },
  "message": "Profile updated successfully",
  "success": true
}
```

**Validation:**

- `name`: 2-100 characters (optional)
- `phone`: 10-15 characters (optional)
- `email`: Valid email format (optional)

### 3. Change Password

**POST** `/api/users/change-password`

Changes the current user's password.

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "message": "Password changed successfully"
  },
  "message": "Password changed successfully",
  "success": true
}
```

**Validation:**

- `currentPassword`: Required, min 6 characters
- `newPassword`: Required, min 6 characters
- `confirmPassword`: Must match `newPassword`

**Business Rules:**

- Current password must be correct
- New password must be different from current password
- Password is hashed with bcrypt before storage

---

## Admin Endpoints (User Management)

### 4. Get All Users

**GET** `/api/users`

Retrieves all users with filtering and pagination. **Admin only.**

**Query Parameters:**

- `search` (string): Search by name, email, or phone
- `role` (string): Filter by role (`ADMIN` | `PARENT`)
- `isActive` (boolean): Filter by active status
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Example:**

```
GET /api/users?role=PARENT&isActive=true&page=1&limit=20
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "users": [
      {
        "id": 2,
        "email": "parent1@example.com",
        "name": "John Doe",
        "phone": "+1234567890",
        "role": "PARENT",
        "isActive": true,
        "createdAt": "2025-02-01T08:00:00.000Z",
        "updatedAt": "2025-02-01T08:00:00.000Z",
        "_count": {
          "students": 2,
          "attendances": 5,
          "contributions": 3,
          "penalties": 1
        }
      }
    ],
    "totalCount": 50,
    "totalPages": 3,
    "currentPage": 1
  },
  "message": "Users retrieved successfully",
  "success": true
}
```

### 5. Get User by ID

**GET** `/api/users/:id`

Retrieves detailed information about a specific user. **Admin only.**

**Example:**

```
GET /api/users/1
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "phone": "+1234567890",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "students": [],
    "_count": {
      "students": 0,
      "attendances": 0,
      "contributions": 0,
      "penalties": 0,
      "createdAnnouncements": 15,
      "createdMeetings": 8
    }
  },
  "message": "User retrieved successfully",
  "success": true
}
```

### 6. Update User (Admin)

**PUT** `/api/users/:id`

Updates a user's information. **Admin only.**

**Request Body:**

```json
{
  "name": "Updated Name",
  "phone": "+9876543210",
  "email": "newemail@example.com",
  "role": "ADMIN",
  "isActive": false
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 2,
    "email": "newemail@example.com",
    "name": "Updated Name",
    "phone": "+9876543210",
    "role": "ADMIN",
    "isActive": false,
    "createdAt": "2025-02-01T08:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  },
  "message": "User updated successfully",
  "success": true
}
```

**Validation:**

- All fields optional
- Email must be unique
- Role: `ADMIN` | `PARENT`

**Business Rules:**

- Cannot change the last admin's role to non-admin
- Cannot deactivate the last active admin

### 7. Update User Role

**PATCH** `/api/users/:id/role`

Changes a user's role. **Admin only.**

**Request Body:**

```json
{
  "role": "ADMIN"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 2,
    "email": "user@example.com",
    "name": "User Name",
    "role": "ADMIN",
    "isActive": true,
    ...
  },
  "message": "User role updated successfully",
  "success": true
}
```

**Business Rules:**

- Cannot change the last admin's role to PARENT
- Role must be either `ADMIN` or `PARENT`

### 8. Deactivate User

**PATCH** `/api/users/:id/deactivate`

Deactivates a user account. **Admin only.**

**Example:**

```
PATCH /api/users/5/deactivate
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 5,
    "email": "user@example.com",
    "name": "User Name",
    "isActive": false,
    ...
  },
  "message": "User deactivated successfully",
  "success": true
}
```

**Business Rules:**

- User must be currently active
- Cannot deactivate the last active admin
- Deactivated users cannot log in

### 9. Activate User

**PATCH** `/api/users/:id/activate`

Activates a previously deactivated user account. **Admin only.**

**Example:**

```
PATCH /api/users/5/activate
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 5,
    "email": "user@example.com",
    "name": "User Name",
    "isActive": true,
    ...
  },
  "message": "User activated successfully",
  "success": true
}
```

**Business Rules:**

- User must be currently inactive
- Activated users can log in again

### 10. Delete User

**DELETE** `/api/users/:id`

Permanently deletes a user account. **Admin only.**

**Example:**

```
DELETE /api/users/5
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "message": "User deleted successfully"
  },
  "message": "User deleted successfully",
  "success": true
}
```

**Business Rules:**

- Cannot delete the last admin
- Deletes all associated records (cascading delete)
- **This action is irreversible**

⚠️ **Warning:** Deleting a user will also delete:

- All linked students
- All attendance records
- All contributions
- All penalties
- All created announcements (if admin)
- All created meetings (if admin)

Consider deactivating users instead of deleting them.

### 11. Get User Statistics

**GET** `/api/users/stats`

Retrieves comprehensive user statistics. **Admin only.**

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "totalUsers": 150,
    "activeUsers": 145,
    "inactiveUsers": 5,
    "adminCount": 3,
    "parentCount": 147,
    "usersWithStudents": 120,
    "usersWithoutStudents": 27,
    "recentUsers": 15
  },
  "message": "User statistics retrieved successfully",
  "success": true
}
```

**Statistics Explained:**

- `totalUsers`: Total number of users in the system
- `activeUsers`: Users with `isActive = true`
- `inactiveUsers`: Users with `isActive = false`
- `adminCount`: Users with role `ADMIN`
- `parentCount`: Users with role `PARENT`
- `usersWithStudents`: Parents with at least one APPROVED student link
- `usersWithoutStudents`: Parents with no APPROVED student links
- `recentUsers`: Users registered in the last 30 days

---

## Data Models

### User Roles

- **ADMIN**: Full system access, can manage all users and content
- **PARENT**: Limited access, can view own profile and linked students

### User Status

- **Active (`isActive: true`)**: Can log in and use the system
- **Inactive (`isActive: false`)**: Cannot log in, account is suspended

---

## Common Workflows

### Workflow 1: Parent Updates Profile

```
1. Parent: GET /api/users/profile
   (View current information)

2. Parent: PUT /api/users/profile
   {
     "name": "Updated Name",
     "phone": "+1234567890"
   }

3. System validates and updates profile

4. Response: Updated user data
```

### Workflow 2: Admin Manages User

```
1. Admin: GET /api/users?search=john
   (Find user by name)

2. Admin: GET /api/users/5
   (View full user details)

3. Admin: PUT /api/users/5
   {
     "role": "ADMIN"
   }
   (Promote to admin)

4. System validates and updates user
```

### Workflow 3: Admin Deactivates User

```
1. Admin: GET /api/users?isActive=true
   (List active users)

2. Admin: PATCH /api/users/10/deactivate
   (Suspend user account)

3. System checks business rules:
   - Not the last admin? ✓
   - Currently active? ✓

4. User account suspended
   - User cannot log in
   - Data preserved
```

### Workflow 4: Parent Changes Password

```
1. Parent: POST /api/users/change-password
   {
     "currentPassword": "oldPass123",
     "newPassword": "newSecurePass456",
     "confirmPassword": "newSecurePass456"
   }

2. System verifies:
   - Current password correct? ✓
   - New password matches confirmation? ✓

3. Password hashed and updated

4. User can log in with new password
```

---

## Security Considerations

### Password Security

- Passwords are hashed using bcrypt (cost factor: 10)
- Never returned in API responses
- Current password required for password changes

### Admin Protection

- Cannot delete the last admin
- Cannot change the last admin's role
- Cannot deactivate the last active admin

### Email Uniqueness

- Each email can only be used once
- System prevents duplicate registrations
- Email changes validated against existing users

### Role-Based Access

- Self-service endpoints: Any authenticated user
- Admin endpoints: ADMIN role required (to be enforced with auth middleware)

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Email is already in use",
  "success": false
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Current password is incorrect",
  "success": false
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Admin access required",
  "success": false
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "User not found",
  "success": false
}
```

---

## Best Practices

### For Users (Self-Service)

1. **Keep profile updated**: Ensure contact information is current
2. **Use strong passwords**: Minimum 6 characters, use mix of characters
3. **Change password regularly**: Update every 3-6 months
4. **Verify email**: Use a working email for important notifications

### For Admins

1. **Deactivate instead of delete**: Preserve data by deactivating users
2. **Maintain multiple admins**: Never rely on a single admin account
3. **Review user list regularly**: Check for inactive or duplicate accounts
4. **Use search effectively**: Find users quickly with search filters
5. **Monitor statistics**: Track user growth and engagement

### Security Tips

- Never share passwords
- Log out after use on shared devices
- Report suspicious activity to admins
- Verify identity before role changes

---

## Implementation Notes

### Current Limitations

- ⚠️ Authentication middleware not yet implemented
- ⚠️ User ID currently from request body (temporary)
- ⚠️ Role-based access control to be added

### Future Enhancements

- Email verification for profile changes
- Password strength requirements
- Account activity logging
- Two-factor authentication
- Bulk user operations
- User import/export
- Advanced search filters
- User groups/permissions

---

## Related Documentation

- **Authentication API**: [src/api/auth](../auth)
- **Student Management**: [src/api/students/STUDENT_API_DOCS.md](../students/STUDENT_API_DOCS.md)
- **Announcements**: [src/api/announcements/ANNOUNCEMENTS_API_DOCS.md](../announcements/ANNOUNCEMENTS_API_DOCS.md)

---

**Need Help?** Contact system administrator or refer to the main [README.md](../../../README.md)
