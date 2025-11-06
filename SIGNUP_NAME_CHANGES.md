# Signup Name Fields Separation - Changes Summary

## Overview

Modified the signup process to separate the full name field into three separate fields: **First Name**, **Middle Name** (optional), and **Last Name**.

## Changes Made

### 1. Backend - Prisma Schema (`backend/prisma/schema.prisma`)

**What Changed:**

- Replaced single `name: String` field with three separate fields in the User model:
  - `firstName: String` (required)
  - `middleName: String?` (optional)
  - `lastName: String` (required)

**Migration Created:** `20251105165045_separate_name_to_first_middle_last`

### 2. Backend - Auth Validation (`backend/src/api/auth/auth.validation.ts`)

**What Changed:**

- Updated the `register` validation schema to accept three separate fields:
  ```typescript
  export const register = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    firstName: Joi.string().required(),
    middleName: Joi.string().allow("", null).optional(),
    lastName: Joi.string().required(),
  });
  ```

### 3. Backend - Auth Service (`backend/src/api/auth/auth.service.ts`)

**What Changed:**

- Updated the `RegisterData` interface to include the new fields:
  ```typescript
  interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    middleName?: string;
    lastName: string;
  }
  ```
- Modified the `register()` function to handle the three name fields separately
- Middle name is stored as `null` if not provided

### 4. Frontend - SignupForm Component (`frontend/src/features/auth/SignupForm.jsx`)

**What Changed:**

- Updated form state to include three separate name fields:
  ```jsx
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    firstName: "",
    middleName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  ```
- Updated validation to check `firstName` and `lastName` (middle name is optional)
- Modified Phase 3 form to display:
  - First Name input (required)
  - Last Name input (required)
  - Middle Name input (optional)
  - Password inputs
- Updated success message to display: `{firstName} {lastName}`

### 5. Frontend - Auth Store (`frontend/src/store/authStore.js`)

**What Changed:**

- Updated `signupData` state to include the three name fields
- Modified `completeRegistration()` function to pass the separated name fields to the backend API:
  ```javascript
  const registrationData = {
    email: signupData.email,
    password: personalData.password,
    firstName: personalData.firstName,
    middleName: personalData.middleName,
    lastName: personalData.lastName,
  };
  ```
- Updated `resetSignup()` to reset the three name fields

## File Paths

### Backend Files Modified:

1. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\backend\prisma\schema.prisma`
2. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\backend\src\api\auth\auth.validation.ts`
3. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\backend\src\api\auth\auth.service.ts`
4. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\backend\src\middlewares\auth.middleware.ts` - Updated to use firstName/lastName instead of name
5. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\backend\src\api\users\users.service.ts` - Updated all User queries to use new name fields
6. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\backend\src\utils\announcementNotification.ts` - Updated to handle firstName/lastName
7. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\backend\src\api\attendance\attendance.service.ts` - Updated parent name references
8. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\backend\src\api\meetings\meetings.service.ts` - Updated notification handling
9. All other service files (`students`, `settings`, `projects`, `contributions`, `penalties`) - Updated all User select queries to use new name fields

### Frontend Files Modified:

1. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\frontend\src\features\auth\SignupForm.jsx`
2. `d:\Projects\MyWebProjects\Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus\ePTA_Management\frontend\src\store\authStore.js`

## Usage

### Signup Form - Step 3 (New UI)

Users will now see three separate input fields:

```
First Name: [________________] *required
Last Name:  [________________] *required
Middle Name (Optional): [________________]
```

### API Request Format (Updated)

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe"
}
```

### Database (User Table)

```sql
firstName VARCHAR(255) NOT NULL
middleName VARCHAR(255) NULL
lastName VARCHAR(255) NOT NULL
```

## Notes

- All existing functionality remains intact
- The migration has been applied to the development database
- Middle name is optional and can be left empty
- First name and last name are required fields
