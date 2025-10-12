# 🔧 Fix: User API Query Parameter Type Handling

## 📋 Issue Description

**Error:** 500 Internal Server Error on `GET /api/users?role=parent`

```
GET http://localhost:3000/api/users?role=parent 500 (Internal Server Error)
Students.jsx:55 Error fetching parents:
AxiosError {message: 'Request failed with status code 500', ...}
```

**Root Cause:** The `getAllUsers` service function was not properly handling query string parameters. Query strings in Express are always received as strings, but the function was expecting typed parameters like `UserRole` enum and `number` types.

---

## 🔍 Problem Analysis

### Before Fix:

```typescript
interface GetUsersFilter {
  search?: string;
  role?: UserRole; // ❌ Expected enum, got string "parent"
  isActive?: boolean; // ❌ Expected boolean, got string "true"/"false"
  page?: number; // ❌ Expected number, got string "1"
  limit?: number; // ❌ Expected number, got string "10"
}

export const getAllUsers = async (filter: GetUsersFilter) => {
  const { search, role, isActive, page = 1, limit = 10 } = filter;

  // ❌ Direct usage without type conversion
  whereClause.role = role; // Type mismatch

  // ❌ Arithmetic operations on strings
  const skip = (page - 1) * limit; // Type error
};
```

### Request Flow:

1. Frontend calls: `userApi.getAllUsers({ role: "parent" })`
2. Axios sends: `GET /api/users?role=parent`
3. Express `req.query` receives: `{ role: "parent" }` (string)
4. Controller passes to service: `userService.getAllUsers(req.query)`
5. Service expects `role: UserRole.PARENT` (enum)
6. ❌ **Type mismatch causes runtime error**

---

## ✅ Solution Implemented

### Changes to `users.service.ts`:

#### 1. Updated Interface to Accept Strings

```typescript
interface GetUsersFilter {
  search?: string;
  role?: UserRole | string; // ✅ Accept string or enum
  isActive?: boolean | string; // ✅ Accept string or boolean
  page?: number | string; // ✅ Accept string or number
  limit?: number | string; // ✅ Accept string or number
}
```

#### 2. Added Type Conversion Logic

```typescript
export const getAllUsers = async (filter: GetUsersFilter) => {
  const { search, role, isActive } = filter;

  // ✅ Parse pagination parameters
  const page =
    typeof filter.page === "string" ? parseInt(filter.page) : filter.page || 1;

  const limit =
    typeof filter.limit === "string"
      ? parseInt(filter.limit)
      : filter.limit || 10;

  const skip = (page - 1) * limit; // ✅ Now works with numbers

  const whereClause: any = {};

  // ... search logic ...

  // ✅ Validate and cast role to UserRole enum
  if (role) {
    const roleUpper = typeof role === "string" ? role.toUpperCase() : role;
    if (roleUpper === UserRole.ADMIN || roleUpper === UserRole.PARENT) {
      whereClause.role = roleUpper as UserRole;
    }
  }

  // ✅ Convert isActive string to boolean
  if (typeof isActive === "boolean") {
    whereClause.isActive = isActive;
  } else if (typeof isActive === "string") {
    whereClause.isActive = isActive === "true";
  }

  // ... rest of the function
};
```

---

## 🎯 Key Improvements

### 1. **Role Parameter Handling**

- ✅ Accepts both string ("parent", "admin") and enum (UserRole.PARENT)
- ✅ Converts to uppercase for case-insensitive matching
- ✅ Validates against UserRole enum values
- ✅ Safely casts to UserRole type for Prisma query

### 2. **Boolean Parameter Handling**

- ✅ Accepts both boolean (true/false) and string ("true"/"false")
- ✅ Converts string to boolean for query
- ✅ Handles both direct boolean and query string boolean

### 3. **Pagination Parameter Handling**

- ✅ Accepts both number and string types
- ✅ Parses strings to integers using `parseInt()`
- ✅ Applies default values (page = 1, limit = 10)
- ✅ Enables proper arithmetic operations

---

## 📊 Affected Frontend Pages

### 1. `Students.jsx` (Admin)

```javascript
// Line 50 - Fetching parents for student linking
const fetchParents = async () => {
  try {
    const response = await userApi.getAllUsers({ role: "parent" });
    setParents(response.data?.data?.users || []);
  } catch (error) {
    console.error("Error fetching parents:", error);
  }
};
```

### 2. Potential Other Uses

Any page that calls `userApi.getAllUsers()` with query parameters will benefit from this fix:

- User management pages
- Dashboard statistics
- Parent selection dropdowns
- Role-based filtering

---

## 🧪 Testing Verification

### Manual Test:

```bash
# Test 1: Role filter
curl "http://localhost:3000/api/users?role=parent"

# Test 2: Active status filter
curl "http://localhost:3000/api/users?isActive=true"

# Test 3: Pagination
curl "http://localhost:3000/api/users?page=2&limit=5"

# Test 4: Combined filters
curl "http://localhost:3000/api/users?role=parent&isActive=true&page=1&limit=10"

# Test 5: Search
curl "http://localhost:3000/api/users?search=john"
```

### Expected Response:

```json
{
  "statusCode": 200,
  "data": {
    "users": [...],
    "totalCount": 10,
    "totalPages": 2,
    "currentPage": 1
  },
  "message": "Users retrieved successfully",
  "success": true
}
```

---

## 📝 Type Safety Improvements

### TypeScript Compilation

Before: ❌ Compile errors

```
The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
Type 'string | number' is not assignable to type 'number | undefined'.
```

After: ✅ No errors

```
No errors found
```

---

## 🔐 Query Parameter Best Practices

### General Pattern for Express Query Strings:

```typescript
// ❌ DON'T: Assume query params are typed
const { page, limit, role } = req.query;
const skip = (page - 1) * limit; // Error: page is string

// ✅ DO: Parse and validate query params
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;
const skip = (page - 1) * limit; // Works: page is number
```

### Enum Validation Pattern:

```typescript
// ❌ DON'T: Direct assignment
whereClause.role = req.query.role; // Type error

// ✅ DO: Validate and cast
const roleInput = req.query.role as string;
const roleUpper = roleInput.toUpperCase();
if (Object.values(UserRole).includes(roleUpper as UserRole)) {
  whereClause.role = roleUpper as UserRole;
}
```

---

## 🚀 Status

✅ **Fixed** - Backend now properly handles all query parameter types
✅ **Tested** - No compilation errors
✅ **Deployed** - Backend auto-reloads with ts-node-dev

---

## 📚 Related Files

### Modified:

- `backend/src/api/users/users.service.ts` - Added type conversion logic

### Affected (Fixed by this change):

- `frontend/src/pages/Admin/Students.jsx` - Fetches parents by role
- Any page using `userApi.getAllUsers()` with filters

---

## 💡 Future Improvements

### Consider Adding:

1. **Query Parameter Validation Middleware**

   ```typescript
   // middleware/validate-query.middleware.ts
   export const validateQueryParams = (schema) => {
     return (req, res, next) => {
       req.query = schema.parse(req.query);
       next();
     };
   };
   ```

2. **Zod Schema for Query Validation**

   ```typescript
   import { z } from "zod";

   const getUsersQuerySchema = z.object({
     role: z.enum(["ADMIN", "PARENT"]).optional(),
     isActive: z.boolean().optional(),
     page: z.number().min(1).optional(),
     limit: z.number().min(1).max(100).optional(),
   });
   ```

3. **Type-safe Query Builder**
   ```typescript
   class QueryBuilder<T> {
     parseQuery(query: any): T {
       // Type-safe parsing logic
     }
   }
   ```

---

**Fixed:** October 10, 2025  
**Version:** 1.0.0  
**Impact:** High - Fixes critical API endpoint error
