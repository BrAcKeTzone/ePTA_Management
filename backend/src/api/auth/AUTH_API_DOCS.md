# Authentication API Documentation

## Overview

The Authentication API provides secure user authentication and authorization functionality including registration, login, OTP verification, password management, and token refresh capabilities.

## Features

- ✅ **User Registration** with email OTP verification
- ✅ **Secure Login** with JWT tokens (access & refresh tokens)
- ✅ **OTP Verification** for registration and password reset
- ✅ **Password Management** (reset, change)
- ✅ **Token Refresh** for seamless authentication
- ✅ **First User Auto-Admin** feature
- ✅ **Email-based OTP** with 10-minute expiration
- ✅ **Logout** functionality

## Base URL

```
/api/auth
```

## Authentication Flow

```
Registration Flow:
1. POST /register → OTP sent to email
2. POST /verify-otp → Account activated
3. POST /login → Access & refresh tokens

Password Reset Flow:
1. POST /forgot-password → OTP sent to email
2. POST /verify-reset-otp → OTP verified
3. POST /reset-password → Password reset

Password Change Flow:
1. POST /change-password-request → OTP sent to email
2. POST /change-password → Password changed
```

---

## API Endpoints

### 1. Register User

Register a new user account (parent or admin).

**Endpoint**: `POST /api/auth/register`

**Access**: Public

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "role": "PARENT"
}
```

**Field Requirements**:

- `name` (required): Full name, min 2 characters
- `email` (required): Valid email address, must be unique
- `password` (required): Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
- `role` (optional): "ADMIN" or "PARENT" (default: "PARENT")

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "userId": 5,
    "message": "Registration successful. Please check your email for OTP verification."
  },
  "message": "User registered successfully. OTP sent to email."
}
```

**Notes**:

- OTP is sent to the provided email
- OTP expires in 10 minutes
- User account is inactive until OTP verification
- **First user registered automatically becomes ADMIN**
- Email must be unique in the system

**Errors**:

- `400`: Email already exists
- `400`: Validation errors (weak password, invalid email, etc.)
- `500`: Failed to send OTP email

---

### 2. Verify OTP (Registration)

Verify OTP code sent during registration to activate account.

**Endpoint**: `POST /api/auth/verify-otp`

**Access**: Public

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Email verified successfully"
  },
  "message": "OTP verified successfully"
}
```

**Notes**:

- OTP must match the one sent to email
- OTP must not be expired (10-minute validity)
- Account is activated after successful verification
- User can now login

**Errors**:

- `400`: Invalid or expired OTP
- `404`: User not found
- `400`: Account already verified

---

### 3. Login

Authenticate user and receive JWT tokens.

**Endpoint**: `POST /api/auth/login`

**Access**: Public

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "PARENT",
      "isActive": true,
      "isVerified": true
    }
  },
  "message": "Login successful"
}
```

**Token Details**:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens

**Usage**:

```http
Authorization: Bearer <accessToken>
```

**Notes**:

- Email must be verified
- Account must be active
- Password must match
- Tokens should be stored securely on client

**Errors**:

- `401`: Invalid credentials
- `403`: Account not verified (verify OTP first)
- `403`: Account is inactive (contact admin)
- `404`: User not found

---

### 4. Refresh Token

Get a new access token using refresh token.

**Endpoint**: `POST /api/auth/refresh-token`

**Access**: Public

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

**Notes**:

- Use when access token expires
- Returns both new access and refresh tokens
- Old refresh token becomes invalid
- Refresh token must not be expired

**Errors**:

- `401`: Invalid or expired refresh token
- `404`: User not found

---

### 5. Forgot Password (Request OTP)

Request OTP for password reset.

**Endpoint**: `POST /api/auth/forgot-password`

**Access**: Public

**Request Body**:

```json
{
  "email": "john.doe@example.com"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "OTP sent to email for password reset"
  },
  "message": "Password reset OTP sent successfully"
}
```

**Notes**:

- OTP sent to registered email
- OTP expires in 10 minutes
- Can be used multiple times (new OTP invalidates old one)
- Email must be registered

**Errors**:

- `404`: User not found
- `500`: Failed to send OTP email

---

### 6. Verify Reset OTP

Verify OTP for password reset.

**Endpoint**: `POST /api/auth/verify-reset-otp`

**Access**: Public

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "OTP verified. You can now reset your password."
  },
  "message": "Reset OTP verified successfully"
}
```

**Notes**:

- Must verify OTP before resetting password
- OTP must not be expired
- After verification, proceed to reset password

**Errors**:

- `400`: Invalid or expired OTP
- `404`: User not found

---

### 7. Reset Password

Reset password after OTP verification.

**Endpoint**: `POST /api/auth/reset-password`

**Access**: Public (requires prior OTP verification)

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Password reset successfully"
  },
  "message": "Password has been reset successfully"
}
```

**Password Requirements**:

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Notes**:

- OTP must be verified first (via verify-reset-otp)
- OTP must not be expired
- New password must meet requirements
- All existing sessions are invalidated
- User must login again

**Errors**:

- `400`: OTP not verified or expired
- `400`: Password does not meet requirements
- `404`: User not found

---

### 8. Change Password Request (Logged In User)

Request OTP to change password for logged-in user.

**Endpoint**: `POST /api/auth/change-password-request`

**Access**: Authenticated users only

**Headers**:

```
Authorization: Bearer <accessToken>
```

**Request Body**:

```json
{
  "email": "john.doe@example.com"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "OTP sent to email for password change"
  },
  "message": "Change password OTP sent successfully"
}
```

**Notes**:

- User must be logged in
- OTP sent to user's registered email
- OTP expires in 10 minutes
- Email must match logged-in user's email

**Errors**:

- `401`: Not authenticated
- `400`: Email doesn't match logged-in user
- `404`: User not found
- `500`: Failed to send OTP email

---

### 9. Change Password (Complete)

Change password after OTP verification (for logged-in users).

**Endpoint**: `POST /api/auth/change-password`

**Access**: Authenticated users only

**Headers**:

```
Authorization: Bearer <accessToken>
```

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Password changed successfully"
  },
  "message": "Password has been changed successfully"
}
```

**Notes**:

- User must be logged in
- OTP must be valid and not expired
- Email must match logged-in user
- New password must meet requirements
- All existing sessions remain valid (unlike reset)

**Errors**:

- `401`: Not authenticated
- `400`: Invalid or expired OTP
- `400`: Email doesn't match logged-in user
- `400`: Password does not meet requirements
- `404`: User not found

---

### 10. Resend OTP

Resend OTP for registration verification.

**Endpoint**: `POST /api/auth/resend-otp`

**Access**: Public

**Request Body**:

```json
{
  "email": "john.doe@example.com"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "New OTP sent to email"
  },
  "message": "OTP resent successfully"
}
```

**Notes**:

- Generates and sends new OTP
- Old OTP becomes invalid
- New OTP expires in 10 minutes
- Can be used if user didn't receive original OTP

**Errors**:

- `400`: Account already verified
- `404`: User not found
- `500`: Failed to send OTP email

---

### 11. Logout

Logout current user (invalidate tokens on client side).

**Endpoint**: `POST /api/auth/logout`

**Access**: Authenticated users only

**Headers**:

```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Logged out successfully"
  },
  "message": "Logout successful"
}
```

**Notes**:

- Client should delete stored tokens
- Tokens are not invalidated server-side (stateless JWT)
- User must login again to access protected routes

---

## Common Use Cases

### 1. New User Registration Flow

```javascript
// Step 1: Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "PARENT"
}

// Step 2: Check email for OTP (e.g., "123456")

// Step 3: Verify OTP
POST /api/auth/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}

// Step 4: Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

// Store accessToken and refreshToken
```

### 2. Forgot Password Flow

```javascript
// Step 1: Request password reset
POST /api/auth/forgot-password
{
  "email": "john@example.com"
}

// Step 2: Check email for OTP

// Step 3: Verify reset OTP
POST /api/auth/verify-reset-otp
{
  "email": "john@example.com",
  "otp": "123456"
}

// Step 4: Reset password
POST /api/auth/reset-password
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}

// Step 5: Login with new password
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "NewSecurePass123!"
}
```

### 3. Change Password (Logged In)

```javascript
// Step 1: Request password change
POST / api / auth / change - password - request;
Authorization: Bearer <
  accessToken >
  {
    email: "john@example.com",
  };

// Step 2: Check email for OTP

// Step 3: Change password
POST / api / auth / change - password;
Authorization: Bearer <
  accessToken >
  {
    email: "john@example.com",
    otp: "123456",
    newPassword: "NewSecurePass123!",
  };
```

### 4. Token Refresh Flow

```javascript
// When access token expires (401 response)
POST /api/auth/refresh-token
{
  "refreshToken": "<stored_refresh_token>"
}

// Store new accessToken and refreshToken
// Retry failed request with new accessToken
```

---

## Security Features

### Password Requirements

- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character
- ✅ Hashed with bcrypt (10 rounds)

### OTP Security

- ✅ 6-digit random code
- ✅ 10-minute expiration
- ✅ Email delivery only
- ✅ Single-use validation
- ✅ Marked as verified after use

### JWT Tokens

- ✅ Access Token: 15-minute expiration
- ✅ Refresh Token: 7-day expiration
- ✅ Signed with secret key
- ✅ Contains user ID and role
- ✅ Stateless authentication

### Account Protection

- ✅ Email verification required
- ✅ Account activation by admin (optional)
- ✅ Rate limiting ready
- ✅ Failed login tracking ready

---

## Error Handling

### HTTP Status Codes

- `200 OK` - Successful operation
- `201 Created` - User registered successfully
- `400 Bad Request` - Validation errors, invalid data
- `401 Unauthorized` - Invalid credentials, expired token
- `403 Forbidden` - Account not verified or inactive
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server or email sending error

### Error Response Format

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description here"
}
```

### Common Errors

- **"Email already exists"** - Email is already registered
- **"Invalid credentials"** - Email or password incorrect
- **"Account not verified"** - User must verify OTP first
- **"Account is inactive"** - Contact admin for activation
- **"Invalid or expired OTP"** - OTP incorrect or expired
- **"Password does not meet requirements"** - Weak password
- **"User not found"** - Email not registered
- **"Token expired"** - Use refresh token to get new access token

---

## Best Practices

### For Frontend Developers

1. **Store Tokens Securely**

   - Use httpOnly cookies or secure storage
   - Never store in localStorage (XSS vulnerability)
   - Clear tokens on logout

2. **Handle Token Expiration**

   - Implement automatic token refresh
   - Retry failed requests after refresh
   - Redirect to login if refresh fails

3. **Password Validation**

   - Validate on client-side before submission
   - Show password strength indicator
   - Display requirements clearly

4. **OTP Handling**

   - Show countdown timer (10 minutes)
   - Provide resend option
   - Clear OTP input on error

5. **User Feedback**
   - Show loading states during API calls
   - Display clear error messages
   - Confirm successful operations

### For Backend Integration

1. **Protect Routes**

   ```javascript
   import { authenticate } from "./middlewares/auth.middleware";
   router.get("/protected", authenticate, controller);
   ```

2. **Check User Role**

   ```javascript
   import { authorize } from "./middlewares/auth.middleware";
   router.post("/admin-only", authenticate, authorize("ADMIN"), controller);
   ```

3. **Access User in Controllers**
   ```javascript
   const userId = req.user.id;
   const userRole = req.user.role;
   ```

---

## Testing

### Test Accounts

Create test accounts for different scenarios:

- First user (auto-admin)
- Regular parent account
- Verified vs unverified
- Active vs inactive

### Test Scenarios

1. ✅ Register new user
2. ✅ Verify OTP
3. ✅ Login with valid credentials
4. ✅ Login with invalid credentials
5. ✅ Refresh expired token
6. ✅ Request password reset
7. ✅ Reset password
8. ✅ Change password (logged in)
9. ✅ Resend OTP
10. ✅ Logout

---

## Support

For authentication issues:

- Check email spam folder for OTP
- Verify email address is correct
- Ensure password meets requirements
- Check token expiration
- Contact system administrator for account activation

---

**API Version:** 1.0.0  
**Last Updated:** October 9, 2025  
**Maintained By:** Development Team
