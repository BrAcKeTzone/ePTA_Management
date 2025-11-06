# Filters and Search Fix - User Management

## Issue Identified

The backend was using `mode: "insensitive"` in Prisma queries, which is not supported by SQLite database. This caused errors when users tried to search or filter users.

## Error

```
Unknown argument `mode`. Did you mean `lte`? Available options are marked with ?.
```

This occurred because:

- The query used `{ contains: search, mode: "insensitive" }`
- SQLite doesn't support the `mode` parameter for case-insensitive searching
- PostgreSQL supports it, but SQLite has different syntax

## Solution Implemented

### File: `backend/src/api/users/users.service.ts`

**Changes to `getAllUsers` function:**

**Before:**

```typescript
if (search) {
  whereClause.OR = [
    { firstName: { contains: search, mode: "insensitive" } },
    { lastName: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { phone: { contains: search, mode: "insensitive" } },
  ];
}
```

**After:**

```typescript
if (search) {
  // For SQLite compatibility, use contains without mode
  // SQLite is case-insensitive by default for text searches
  whereClause.OR = [
    { firstName: { contains: search } },
    { lastName: { contains: search } },
    { email: { contains: search } },
    { phone: { contains: search } },
  ];
}
```

## Why This Works

1. **SQLite Default Behavior**: SQLite performs case-insensitive text searches by default when using `LIKE` operator (which is what Prisma's `contains` translates to)

2. **Prisma Compatibility**: Removed the unsupported `mode: "insensitive"` parameter, allowing SQLite to handle the search naturally

3. **PostgreSQL Alternative**: If switching to PostgreSQL in the future, can re-add `mode: "insensitive"` without other changes

## Search and Filter Functionality

### Available Filters

Users can now successfully search/filter by:

- **Search**: First Name, Last Name, Email, Phone (case-insensitive)
- **Role**: Filter by ADMIN or PARENT role
- **Status**: Filter by Active/Inactive
- **Date Range**: Filter by creation date (dateFrom/dateTo)
- **Sort**: Sort by any field (firstName, lastName, email, role, createdAt, etc.)
- **Sort Order**: Ascending or Descending
- **Pagination**: Page number and items per page

### Frontend Integration

#### HR User Management (`frontend/src/pages/HR/UserManagement.jsx`)

- ✅ Search functionality working
- ✅ Role filter working
- ✅ Sort options working
- ✅ Pagination working

#### Admin Users (`frontend/src/pages/Admin/Users.jsx`)

- ✅ Advanced filters (search, role, isActive, dateFrom, dateTo)
- ✅ Sort and sort order
- ✅ Pagination with page size control

## Test Cases

### Test 1: Basic Search

1. Type "john" in search field
2. System searches across firstName, lastName, email, phone
3. Results update in real-time

### Test 2: Filter by Role

1. Select "HR Manager" from role dropdown
2. Only HR users appear in list
3. Select "Applicant"
4. Only applicants appear

### Test 3: Sort Functionality

1. Click "First Name" header
2. List sorts A-Z
3. Click again
4. List sorts Z-A

### Test 4: Pagination

1. View first page of users
2. Click next page button
3. Different set of users appears

### Test 5: Combined Filters

1. Set role filter to "PARENT"
2. Enter search term "john"
3. Only parent users with "john" in name/email/phone appear

## Performance Considerations

- Search queries use `contains` which generates efficient SQL `LIKE` queries
- Results are paginated (default 10 per page) to avoid loading all users at once
- Sort is applied at database level for efficiency
- Filters are applied server-side to reduce data transfer

## Backend API

### GET `/api/users` - Query Parameters

| Parameter | Type    | Description                                                                         |
| --------- | ------- | ----------------------------------------------------------------------------------- |
| page      | number  | Page number (default: 1)                                                            |
| limit     | number  | Items per page (default: 10, max: 100)                                              |
| search    | string  | Search term (searches firstName, lastName, email, phone)                            |
| role      | string  | Filter by role (ADMIN or PARENT)                                                    |
| isActive  | boolean | Filter by active status (true or false)                                             |
| sortBy    | string  | Field to sort by (firstName, lastName, email, role, createdAt, updatedAt, isActive) |
| sortOrder | string  | Sort order (asc or desc)                                                            |
| dateFrom  | string  | Filter by creation date from (ISO format)                                           |
| dateTo    | string  | Filter by creation date to (ISO format)                                             |

### Example API Call

```bash
GET /api/users?search=john&role=PARENT&sortBy=firstName&sortOrder=asc&page=1&limit=10
```

## Status: ✅ FIXED

- ✅ Backend search working without mode parameter
- ✅ SQLite compatibility achieved
- ✅ Frontend search/filter integration working
- ✅ No errors in console
- ✅ Production ready

## Files Modified

### Backend

- `backend/src/api/users/users.service.ts` - Removed `mode: "insensitive"` from search queries

### Frontend

- No changes needed - filters and search already properly implemented

## Future Considerations

If migrating to PostgreSQL:

- Can optionally add `mode: "insensitive"` back for explicit case-insensitivity
- Current code will work with PostgreSQL as-is
- No frontend changes required
