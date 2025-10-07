# Student Management API Documentation

## Overview

The Student Management API provides comprehensive functionality for managing student records in a state college PTA system.

## Base URL

```
http://localhost:3000/api/students
```

## Authentication

All endpoints require proper authentication (to be implemented with auth middleware).

## Endpoints

### 1. Create Student

**POST** `/api/students`

Creates a new student record and links them to a parent.

**Request Body:**

```json
{
  "studentId": "2024-12345",
  "firstName": "Juan",
  "lastName": "Cruz",
  "middleName": "Santos",
  "academicYear": "2023-2024",
  "yearLevel": "2nd Year",
  "program": "BSIT",
  "section": "A",
  "email": "juan.cruz@example.com",
  "phone": "+1234567890",
  "parentId": 1
}
```

**Response:**

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "studentId": "2024-12345",
    "firstName": "Juan",
    "lastName": "Cruz",
    "middleName": "Santos",
    "academicYear": "2023-2024",
    "yearLevel": "2nd Year",
    "program": "BSIT",
    "section": "A",
    "status": "ACTIVE",
    "linkStatus": "PENDING",
    "enrollmentDate": "2024-01-15T00:00:00.000Z",
    "email": "juan.cruz@example.com",
    "phone": "+1234567890",
    "parentId": 1,
    "parent": {
      "id": 1,
      "name": "Maria Cruz",
      "email": "maria.cruz@example.com",
      "phone": "+1234567891"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Student created successfully",
  "success": true
}
```

### 2. Get All Students

**GET** `/api/students`

Retrieves students with filtering and pagination support.

**Query Parameters:**

- `search` (string): Search by name or student ID
- `academicYear` (string): Filter by academic year (e.g., "2023-2024")
- `yearLevel` (string): Filter by year level ("1st Year", "2nd Year", etc.)
- `program` (string): Filter by program ("BSIT", "BSCS", etc.)
- `status` (string): Filter by status ("ACTIVE", "INACTIVE", "GRADUATED", etc.)
- `linkStatus` (string): Filter by link status ("PENDING", "APPROVED", "REJECTED")
- `parentId` (number): Filter by parent ID
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Example:**

```
GET /api/students?program=BSIT&yearLevel=2nd Year&page=1&limit=20
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "students": [...],
    "totalCount": 50,
    "totalPages": 3,
    "currentPage": 1
  },
  "message": "Students retrieved successfully",
  "success": true
}
```

### 3. Get Student by ID

**GET** `/api/students/:id`

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "studentId": "2024-12345"
    // ... other student fields
  },
  "message": "Student retrieved successfully",
  "success": true
}
```

### 4. Get Student by Student ID

**GET** `/api/students/student-id/:studentId`

**Example:**

```
GET /api/students/student-id/2024-12345
```

### 5. Update Student

**PUT** `/api/students/:id`

**Request Body:**

```json
{
  "firstName": "Juan Carlos",
  "yearLevel": "3rd Year",
  "status": "ACTIVE"
}
```

### 6. Delete Student

**DELETE** `/api/students/:id`

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "message": "Student deleted successfully"
  },
  "message": "Student deleted successfully",
  "success": true
}
```

### 7. Approve Student Link

**PATCH** `/api/students/:id/approve`

Approves the parent-student link (changes linkStatus from PENDING to APPROVED).

### 8. Reject Student Link

**PATCH** `/api/students/:id/reject`

Rejects the parent-student link (changes linkStatus from PENDING to REJECTED).

### 9. Get Students by Parent ID

**GET** `/api/students/parent/:parentId`

Retrieves all students linked to a specific parent.

### 10. Get Enrollment Statistics

**GET** `/api/students/stats`

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "totalStudents": 150,
    "activeStudents": 120,
    "graduatedStudents": 25,
    "inactiveStudents": 5,
    "pendingLinks": 10,
    "byProgram": [
      { "program": "BSIT", "count": 45 },
      { "program": "BSCS", "count": 30 }
    ],
    "byYearLevel": [
      { "yearLevel": "1st Year", "count": 40 },
      { "yearLevel": "2nd Year", "count": 35 }
    ],
    "byAcademicYear": [
      { "academicYear": "2023-2024", "count": 120 },
      { "academicYear": "2022-2023", "count": 30 }
    ]
  },
  "message": "Enrollment statistics retrieved successfully",
  "success": true
}
```

### 11. Get Pending Students

**GET** `/api/students/pending`

Retrieves students with pending link status.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

### 12. Bulk Update Student Status

**PATCH** `/api/students/bulk/status`

Updates the status of multiple students.

**Request Body:**

```json
{
  "studentIds": [1, 2, 3, 4],
  "status": "GRADUATED"
}
```

## Data Models

### Student Status Enum

- `ACTIVE`: Currently enrolled
- `INACTIVE`: Temporarily not enrolled
- `GRADUATED`: Successfully completed program
- `TRANSFERRED`: Moved to another institution
- `DROPPED`: Discontinued studies
- `SUSPENDED`: Temporarily suspended

### Link Status Enum

- `PENDING`: Awaiting approval
- `APPROVED`: Approved link
- `REJECTED`: Rejected link

### Year Levels

- "1st Year"
- "2nd Year"
- "3rd Year"
- "4th Year"
- "5th Year"

### Programs

- "BSIT" (Bachelor of Science in Information Technology)
- "BSCS" (Bachelor of Science in Computer Science)
- "BSED" (Bachelor of Science in Education)
- "BEED" (Bachelor of Elementary Education)
- "BSBA" (Bachelor of Science in Business Administration)
- "BSN" (Bachelor of Science in Nursing)
- "BSME" (Bachelor of Science in Mechanical Engineering)
- "BSCE" (Bachelor of Science in Civil Engineering)
- "BSEE" (Bachelor of Science in Electrical Engineering)
- "BSAG" (Bachelor of Science in Agriculture)
- "BSFOR" (Bachelor of Science in Forestry)
- "BSPSYCH" (Bachelor of Science in Psychology)
- "BSMATH" (Bachelor of Science in Mathematics)
- "BSPHY" (Bachelor of Science in Physics)
- "BSCHEM" (Bachelor of Science in Chemistry)
- "BSBIO" (Bachelor of Science in Biology)

## Student-Parent Linking Feature

### Overview

The linking feature allows parents to request linking with students. Each student can only be linked to **one parent**, but a parent can link **multiple students**.

### 13. Request Student Link (Parent)

**POST** `/api/students/link`

Parent requests to link a student to their account.

**Request Body:**

```json
{
  "studentId": "2024-12345",
  "parentId": 1
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "studentId": "2024-12345",
    "firstName": "Juan",
    "lastName": "Cruz",
    "linkStatus": "PENDING",
    "parentId": 1,
    "parent": {
      "id": 1,
      "name": "Maria Cruz",
      "email": "maria.cruz@example.com"
    }
  },
  "message": "Link request submitted successfully",
  "success": true
}
```

**Business Rules:**

- Student can only be linked to one parent at a time
- If student is already linked to another parent (APPROVED status), request will be rejected
- If student has a pending request, duplicate requests are not allowed
- Only PARENT role accounts can request links
- Admin must approve the link before it becomes active

### 14. Get Pending Link Requests (Parent)

**GET** `/api/students/parent/:parentId/pending`

Retrieves all pending link requests for a specific parent.

**Example:**

```
GET /api/students/parent/1/pending
```

**Response:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "studentId": "2024-12345",
      "firstName": "Juan",
      "lastName": "Cruz",
      "linkStatus": "PENDING",
      "parentId": 1
    }
  ],
  "message": "Pending link requests retrieved successfully",
  "success": true
}
```

### 15. Get Approved Students (Parent)

**GET** `/api/students/parent/:parentId/approved`

Retrieves all approved (linked) students for a specific parent.

**Example:**

```
GET /api/students/parent/1/approved
```

**Response:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "studentId": "2024-12345",
      "firstName": "Juan",
      "lastName": "Cruz",
      "linkStatus": "APPROVED",
      "parentId": 1
    },
    {
      "id": 2,
      "studentId": "2024-12346",
      "firstName": "Maria",
      "lastName": "Cruz",
      "linkStatus": "APPROVED",
      "parentId": 1
    }
  ],
  "message": "Linked students retrieved successfully",
  "success": true
}
```

### 16. Unlink Student (Parent/Admin)

**PATCH** `/api/students/:id/unlink`

Unlinks a student from their parent account.

**Request Body:**

```json
{
  "userId": 1,
  "userRole": "PARENT"
}
```

**Authorization:**

- Parent can only unlink their own students
- Admin can unlink any student

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "message": "Student unlinked successfully"
  },
  "message": "Student unlinked successfully",
  "success": true
}
```

## Linking Workflow

### Parent Requests Link

```
1. Parent: POST /api/students/link
   {
     "studentId": "2024-12345",
     "parentId": 1
   }

2. System checks:
   - Is student already linked? (Reject if APPROVED to another parent)
   - Is parent account valid?
   - Is there a duplicate pending request?

3. Status set to PENDING

4. Admin: GET /api/students/pending
   (View all pending link requests)

5. Admin: PATCH /api/students/1/approve
   (Approve the link)

6. Parent: GET /api/students/parent/1/approved
   (View linked students)
```

### Parent Links Multiple Students

```
Parent (ID: 1) can link multiple students:

POST /api/students/link
{ "studentId": "2024-12345", "parentId": 1 }
→ Student 1 linked to Parent 1

POST /api/students/link
{ "studentId": "2024-12346", "parentId": 1 }
→ Student 2 linked to Parent 1

POST /api/students/link
{ "studentId": "2024-12347", "parentId": 1 }
→ Student 3 linked to Parent 1

All three students can be linked to the same parent.
```

### Student Can Only Have One Parent

```
Student (ID: 2024-12345) linked to Parent 1:

Another parent tries to link:
POST /api/students/link
{ "studentId": "2024-12345", "parentId": 2 }

→ ERROR: "Student is already linked to another parent.
         A student can only have one parent account."
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Student ID must follow format: YYYY-NNNNN (e.g., 2024-12345)",
  "success": false
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Student not found",
  "success": false
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "success": false
}
```
