# Attendance Tracking API Documentation

## Overview

The Attendance Tracking API provides comprehensive functionality for recording, managing, and reporting on parent attendance at PTA meetings. It includes features for bulk operations, automatic penalty calculation, detailed reports, and attendance analytics.

## Features

- ✅ **Single & Bulk Attendance Recording**: Record attendance for one or multiple parents
- ✅ **Check-in/Check-out Tracking**: Track arrival and departure times
- ✅ **Late Arrival Management**: Mark and track late arrivals with minutes
- ✅ **Automatic Penalty Calculation**: Calculate penalties for absences and late arrivals
- ✅ **Attendance Status**: PRESENT, ABSENT, EXCUSED with reason support
- ✅ **Comprehensive Reports**: Generate detailed reports with statistics
- ✅ **Advanced Filtering**: Filter by meeting, parent, status, date range
- ✅ **Attendance Analytics**: Rates, statistics, trends
- ✅ **Penalty Management**: Calculate and apply penalties

## Base URL

```
/api/attendance
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Record Single Attendance

Record attendance for a single parent.

**Endpoint**: `POST /api/attendance`

**Access**: Admin only

**Request Body**:

```json
{
  "meetingId": 1,
  "parentId": 5,
  "status": "PRESENT",
  "checkInTime": "2024-10-08T14:30:00Z",
  "checkOutTime": "2024-10-08T16:00:00Z",
  "isLate": true,
  "lateMinutes": 15,
  "remarks": "Arrived late due to traffic",
  "excuseReason": null
}
```

**Field Descriptions**:

- `meetingId` (required): ID of the meeting
- `parentId` (required): ID of the parent
- `status` (required): One of: `PRESENT`, `ABSENT`, `EXCUSED`
- `checkInTime` (optional): ISO date-time when parent checked in
- `checkOutTime` (optional): ISO date-time when parent checked out
- `isLate` (optional): Boolean indicating if parent arrived late
- `lateMinutes` (optional): Number of minutes late
- `remarks` (optional): Additional notes (max 1000 chars)
- `excuseReason` (optional): Reason if status is EXCUSED (max 1000 chars)

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 123,
    "meetingId": 1,
    "parentId": 5,
    "status": "PRESENT",
    "checkInTime": "2024-10-08T14:30:00Z",
    "checkOutTime": "2024-10-08T16:00:00Z",
    "isLate": true,
    "lateMinutes": 15,
    "hasPenalty": true,
    "penaltyAmount": 25.0,
    "penaltyApplied": false,
    "remarks": "Arrived late due to traffic",
    "parent": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "meeting": {
      "id": 1,
      "title": "General PTA Meeting",
      "date": "2024-10-08T00:00:00Z",
      "startTime": "14:00"
    },
    "recordedBy": {
      "id": 1,
      "name": "Admin User"
    },
    "createdAt": "2024-10-08T14:35:00Z",
    "updatedAt": "2024-10-08T14:35:00Z"
  },
  "message": "Attendance recorded successfully"
}
```

**Error Responses**:

- `400`: Attendance already recorded, invalid parent role, validation errors
- `404`: Meeting or parent not found
- `401`: Not authenticated
- `403`: Not authorized (not admin)

---

### 2. Bulk Record Attendance

Record attendance for multiple parents at once.

**Endpoint**: `POST /api/attendance/bulk`

**Access**: Admin only

**Request Body**:

```json
{
  "meetingId": 1,
  "attendances": [
    {
      "parentId": 5,
      "status": "PRESENT",
      "checkInTime": "2024-10-08T14:00:00Z",
      "isLate": false,
      "lateMinutes": 0
    },
    {
      "parentId": 6,
      "status": "ABSENT",
      "remarks": "No prior notice"
    },
    {
      "parentId": 7,
      "status": "EXCUSED",
      "excuseReason": "Medical emergency"
    }
  ]
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "count": 3,
    "attendances": [
      {
        "id": 124,
        "meetingId": 1,
        "parentId": 5,
        "status": "PRESENT",
        "hasPenalty": false,
        "parent": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      {
        "id": 125,
        "meetingId": 1,
        "parentId": 6,
        "status": "ABSENT",
        "hasPenalty": true,
        "penaltyAmount": 50.0,
        "parent": {
          "id": 6,
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      },
      {
        "id": 126,
        "meetingId": 1,
        "parentId": 7,
        "status": "EXCUSED",
        "hasPenalty": false,
        "parent": {
          "id": 7,
          "name": "Bob Johnson",
          "email": "bob@example.com"
        }
      }
    ]
  },
  "message": "3 attendance records created successfully"
}
```

**Error Responses**:

- `400`: Some parent IDs invalid, attendance already recorded for some parents
- `404`: Meeting not found

---

### 3. Get Attendance Records

Retrieve attendance records with filtering and pagination.

**Endpoint**: `GET /api/attendance`

**Access**: All authenticated users

**Query Parameters**:

- `meetingId` (optional): Filter by specific meeting
- `parentId` (optional): Filter by specific parent
- `status` (optional): Filter by status (PRESENT, ABSENT, EXCUSED)
- `hasPenalty` (optional): Filter by penalty status (true/false)
- `dateFrom` (optional): Filter meetings from this date (ISO format)
- `dateTo` (optional): Filter meetings until this date (ISO format)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 100): Items per page
- `sortBy` (optional, default: createdAt): Sort field (createdAt, checkInTime, status)
- `sortOrder` (optional, default: desc): Sort order (asc, desc)

**Example Request**:

```
GET /api/attendance?meetingId=1&status=PRESENT&page=1&limit=20
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "attendances": [
      {
        "id": 123,
        "status": "PRESENT",
        "checkInTime": "2024-10-08T14:00:00Z",
        "checkOutTime": "2024-10-08T16:00:00Z",
        "isLate": false,
        "lateMinutes": 0,
        "hasPenalty": false,
        "parent": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+639123456789"
        },
        "meeting": {
          "id": 1,
          "title": "General PTA Meeting",
          "date": "2024-10-08T00:00:00Z",
          "startTime": "14:00",
          "endTime": "16:00",
          "venue": "School Auditorium",
          "meetingType": "GENERAL",
          "status": "COMPLETED"
        },
        "recordedBy": {
          "id": 1,
          "name": "Admin User"
        },
        "createdAt": "2024-10-08T14:05:00Z",
        "updatedAt": "2024-10-08T14:05:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  },
  "message": "Attendance records retrieved successfully"
}
```

---

### 4. Get Attendance by ID

Get detailed information about a specific attendance record.

**Endpoint**: `GET /api/attendance/:id`

**Access**: All authenticated users

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 123,
    "status": "PRESENT",
    "checkInTime": "2024-10-08T14:00:00Z",
    "checkOutTime": "2024-10-08T16:00:00Z",
    "isLate": false,
    "lateMinutes": 0,
    "hasPenalty": false,
    "penaltyAmount": null,
    "penaltyApplied": false,
    "remarks": null,
    "excuseReason": null,
    "parent": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+639123456789"
    },
    "meeting": {
      "id": 1,
      "title": "General PTA Meeting",
      "description": "Discussing school activities and budget",
      "date": "2024-10-08T00:00:00Z",
      "startTime": "14:00",
      "endTime": "16:00",
      "venue": "School Auditorium",
      "meetingType": "GENERAL",
      "status": "COMPLETED"
    },
    "recordedBy": {
      "id": 1,
      "name": "Admin User"
    },
    "createdAt": "2024-10-08T14:05:00Z",
    "updatedAt": "2024-10-08T14:05:00Z"
  },
  "message": "Attendance record retrieved successfully"
}
```

**Error Responses**:

- `404`: Attendance record not found

---

### 5. Update Attendance

Update an existing attendance record.

**Endpoint**: `PUT /api/attendance/:id`

**Access**: Admin only

**Request Body** (all fields optional):

```json
{
  "status": "EXCUSED",
  "checkInTime": "2024-10-08T14:30:00Z",
  "checkOutTime": "2024-10-08T16:00:00Z",
  "isLate": true,
  "lateMinutes": 30,
  "remarks": "Updated remarks",
  "excuseReason": "Medical appointment"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 123,
    "status": "EXCUSED",
    "checkInTime": "2024-10-08T14:30:00Z",
    "checkOutTime": "2024-10-08T16:00:00Z",
    "isLate": true,
    "lateMinutes": 30,
    "hasPenalty": false,
    "penaltyAmount": null,
    "remarks": "Updated remarks",
    "excuseReason": "Medical appointment",
    "parent": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "meeting": {
      "id": 1,
      "title": "General PTA Meeting",
      "date": "2024-10-08T00:00:00Z",
      "startTime": "14:00"
    },
    "updatedAt": "2024-10-08T15:00:00Z"
  },
  "message": "Attendance record updated successfully"
}
```

**Notes**:

- Updating status from ABSENT/PRESENT to EXCUSED removes penalties
- Penalties are recalculated based on new status
- At least one field must be provided

**Error Responses**:

- `404`: Attendance record not found
- `400`: No fields provided, validation errors

---

### 6. Delete Attendance

Delete an attendance record (only if penalties haven't been applied).

**Endpoint**: `DELETE /api/attendance/:id`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Attendance record deleted successfully"
  },
  "message": "Attendance record deleted successfully"
}
```

**Error Responses**:

- `404`: Attendance record not found
- `400`: Cannot delete - penalties already applied

---

### 7. Generate Attendance Report

Generate comprehensive attendance reports with statistics.

**Endpoint**: `GET /api/attendance/report`

**Access**: Admin only

**Query Parameters** (all optional except dateFrom and dateTo):

- `meetingId` (optional): Filter by specific meeting
- `parentId` (optional): Filter by specific parent
- `dateFrom` (required): Start date for report (ISO format)
- `dateTo` (required): End date for report (ISO format)
- `includeStats` (optional, default: true): Include statistics
- `groupBy` (optional): Group results by 'meeting', 'parent', or 'status'

**Example Request**:

```
GET /api/attendance/report?dateFrom=2024-01-01&dateTo=2024-12-31&includeStats=true&groupBy=meeting
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "dateRange": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-12-31T23:59:59Z"
    },
    "totalRecords": 150,
    "attendances": [
      {
        "id": 123,
        "status": "PRESENT",
        "checkInTime": "2024-10-08T14:00:00Z",
        "isLate": false,
        "hasPenalty": false,
        "parent": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "meeting": {
          "id": 1,
          "title": "General PTA Meeting",
          "date": "2024-10-08T00:00:00Z",
          "startTime": "14:00",
          "venue": "School Auditorium",
          "meetingType": "GENERAL"
        }
      }
    ],
    "statistics": {
      "totalPresent": 120,
      "totalAbsent": 20,
      "totalExcused": 10,
      "totalLate": 15,
      "totalWithPenalty": 25,
      "totalPenaltyAmount": 1250.0,
      "attendanceRate": "80.00"
    },
    "groupedData": [
      {
        "meeting": {
          "id": 1,
          "title": "General PTA Meeting",
          "date": "2024-10-08T00:00:00Z",
          "startTime": "14:00",
          "venue": "School Auditorium",
          "meetingType": "GENERAL"
        },
        "attendances": [
          // Attendance records for this meeting
        ]
      }
    ]
  },
  "message": "Attendance report generated successfully"
}
```

**Report Features**:

- **Statistics**: Present/absent/excused counts, late statistics, penalty totals, attendance rate
- **Grouping**: Group by meeting (all attendances per meeting), parent (all meetings per parent), or status
- **Date Range**: Flexible date range filtering
- **Filtering**: Optional filtering by specific meeting or parent

---

### 8. Calculate Penalties

Calculate penalties for attendance records (with optional application).

**Endpoint**: `POST /api/attendance/calculate-penalties`

**Access**: Admin only

**Request Body** (all fields optional):

```json
{
  "meetingId": 1,
  "parentId": 5,
  "applyPenalties": true,
  "dateFrom": "2024-01-01T00:00:00Z",
  "dateTo": "2024-12-31T23:59:59Z"
}
```

**Field Descriptions**:

- `meetingId` (optional): Calculate for specific meeting only
- `parentId` (optional): Calculate for specific parent only
- `applyPenalties` (optional, default: false): If true, creates penalty records and marks attendance as applied
- `dateFrom` (optional): Calculate from this date
- `dateTo` (optional): Calculate until this date

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "15 penalties applied successfully",
    "totalPenalties": 15,
    "totalAmount": 750.0,
    "penalties": [
      {
        "attendanceId": 123,
        "parentId": 5,
        "parentName": "John Doe",
        "meetingId": 1,
        "meetingTitle": "General PTA Meeting",
        "meetingDate": "2024-10-08T00:00:00Z",
        "status": "ABSENT",
        "isLate": false,
        "lateMinutes": 0,
        "penaltyAmount": 50.0,
        "reason": "Absence from meeting"
      },
      {
        "attendanceId": 124,
        "parentId": 6,
        "parentName": "Jane Smith",
        "meetingId": 2,
        "meetingTitle": "Special Meeting",
        "meetingDate": "2024-10-15T00:00:00Z",
        "status": "PRESENT",
        "isLate": true,
        "lateMinutes": 30,
        "penaltyAmount": 25.0,
        "reason": "Late arrival to meeting"
      }
    ]
  },
  "message": "15 penalties applied successfully"
}
```

**Notes**:

- Only calculates penalties for records where `hasPenalty=true` and `penaltyApplied=false`
- Requires system settings to have `enableAutoPenalty=true`
- If `applyPenalties=true`, creates actual Penalty records in the database
- If `applyPenalties=false`, only shows what penalties would be calculated (preview mode)

**Error Responses**:

- `400`: Auto penalty calculation disabled in system settings
- `500`: System settings not found

---

### 9. Get Attendance Statistics

Get detailed attendance statistics with optional filtering.

**Endpoint**: `GET /api/attendance/stats`

**Access**: All authenticated users

**Query Parameters** (all optional):

- `meetingId` (optional): Statistics for specific meeting
- `parentId` (optional): Statistics for specific parent
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)

**Example Request**:

```
GET /api/attendance/stats?dateFrom=2024-01-01&dateTo=2024-12-31
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "totalRecords": 150,
    "attendanceRate": "80.00",
    "statusBreakdown": {
      "PRESENT": {
        "count": 120,
        "percentage": "80.00"
      },
      "ABSENT": {
        "count": 20,
        "percentage": "13.33"
      },
      "EXCUSED": {
        "count": 10,
        "percentage": "6.67"
      }
    },
    "lateStatistics": {
      "totalLate": 15,
      "lateRate": "12.50",
      "averageLateMinutes": "22.50"
    },
    "penaltyStatistics": {
      "totalWithPenalty": 25,
      "totalPenaltyAmount": 1250.0,
      "averagePenaltyAmount": "50.00"
    }
  },
  "message": "Attendance statistics retrieved successfully"
}
```

**Statistics Included**:

- **Overall**: Total records, attendance rate
- **Status Breakdown**: Count and percentage for each status (PRESENT, ABSENT, EXCUSED)
- **Late Statistics**: Total late, late rate (% of present), average late minutes
- **Penalty Statistics**: Total with penalties, total amount, average penalty amount

---

## Attendance Status Types

### PRESENT

- Parent attended the meeting
- May have late flag if arrived after start time
- Penalty applied if late (based on system settings)

### ABSENT

- Parent did not attend the meeting
- Automatic penalty applied (if enabled in settings)
- Penalty amount based on `penaltyRatePerAbsence` setting

### EXCUSED

- Parent could not attend but provided valid excuse
- No penalty applied
- Requires `excuseReason` field

---

## Penalty Calculation System

### Automatic Penalty Calculation

Penalties are automatically calculated when recording attendance if:

1. System setting `enableAutoPenalty` is `true`
2. Status is `ABSENT` or `PRESENT` with `isLate=true`

### Penalty Amounts

- **Absence**: Uses `penaltyRatePerAbsence` from system settings (default: ₱50.00)
- **Late Arrival**: Uses `penaltyRateLate` from system settings (default: ₱25.00)

### Penalty Workflow

1. **Record Attendance**: Penalties are calculated but not applied
2. **Calculate Penalties**: Admin reviews calculated penalties
3. **Apply Penalties**: Admin applies penalties to create actual Penalty records
4. **Mark as Applied**: Attendance records marked as `penaltyApplied=true`

### Grace Period

System settings include `penaltyGracePeriodDays` to allow time before penalties take effect.

---

## Bulk Operations Best Practices

### Efficient Bulk Recording

```javascript
// Good: Record all attendances at once
POST /api/attendance/bulk
{
  "meetingId": 1,
  "attendances": [
    { "parentId": 5, "status": "PRESENT" },
    { "parentId": 6, "status": "ABSENT" },
    { "parentId": 7, "status": "EXCUSED", "excuseReason": "Sick" }
  ]
}

// Avoid: Multiple single requests
POST /api/attendance (multiple times)
```

### Bulk Penalty Application

```javascript
// Apply all penalties for a meeting at once
POST /api/attendance/calculate-penalties
{
  "meetingId": 1,
  "applyPenalties": true
}

// Or for a date range
POST /api/attendance/calculate-penalties
{
  "dateFrom": "2024-10-01",
  "dateTo": "2024-10-31",
  "applyPenalties": true
}
```

---

## Reporting Examples

### Monthly Attendance Report for All Parents

```javascript
GET /api/attendance/report?dateFrom=2024-10-01&dateTo=2024-10-31&includeStats=true&groupBy=parent
```

### Meeting-Specific Attendance Report

```javascript
GET /api/attendance/report?meetingId=1&dateFrom=2024-01-01&dateTo=2024-12-31
```

### Individual Parent Attendance History

```javascript
GET /api/attendance?parentId=5&page=1&limit=50&sortBy=createdAt&sortOrder=desc
```

### Penalty Summary Report

```javascript
POST /api/attendance/calculate-penalties
{
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31",
  "applyPenalties": false
}
```

---

## Common Use Cases

### 1. Record Attendance at Meeting Start

```javascript
// Use bulk recording for efficiency
POST /api/attendance/bulk
{
  "meetingId": 1,
  "attendances": [
    {
      "parentId": 5,
      "status": "PRESENT",
      "checkInTime": "2024-10-08T14:00:00Z",
      "isLate": false
    }
    // ... more parents
  ]
}
```

### 2. Mark Late Arrival

```javascript
PUT /api/attendance/123
{
  "isLate": true,
  "lateMinutes": 15,
  "checkInTime": "2024-10-08T14:15:00Z",
  "remarks": "Arrived during opening remarks"
}
```

### 3. Excuse Absence with Reason

```javascript
PUT /api/attendance/124
{
  "status": "EXCUSED",
  "excuseReason": "Medical emergency - hospital confinement"
}
```

### 4. Generate Monthly Report

```javascript
GET /api/attendance/report?dateFrom=2024-10-01&dateTo=2024-10-31&includeStats=true&groupBy=status
```

### 5. Calculate and Apply Penalties

```javascript
// Step 1: Preview penalties
POST /api/attendance/calculate-penalties
{
  "meetingId": 1,
  "applyPenalties": false
}

// Step 2: Apply after review
POST /api/attendance/calculate-penalties
{
  "meetingId": 1,
  "applyPenalties": true
}
```

### 6. Track Parent Attendance History

```javascript
GET /api/attendance?parentId=5&sortBy=createdAt&sortOrder=desc&limit=50
```

### 7. Meeting Attendance Summary

```javascript
GET /api/attendance/stats?meetingId=1
```

---

## Error Handling

All endpoints follow standard error response format:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message describing what went wrong"
}
```

### Common Error Codes

- `400`: Bad request (validation errors, business logic violations)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized for this action)
- `404`: Resource not found
- `500`: Internal server error

### Validation Errors

```json
{
  "statusCode": 400,
  "data": null,
  "message": "\"status\" must be one of [PRESENT, ABSENT, EXCUSED]"
}
```

---

## Integration with Other Modules

### Meetings Module

- Attendance records are linked to meetings
- Meeting date and time used for late calculation
- Meeting status affects attendance recording

### Penalties Module

- Calculated penalties create Penalty records
- Penalty amounts from system settings
- Penalty application is one-way (cannot unapply)

### Settings Module

- `penaltyRatePerAbsence`: Amount for absences
- `penaltyRateLate`: Amount for late arrivals
- `enableAutoPenalty`: Enable/disable auto calculation
- `penaltyGracePeriodDays`: Grace period before enforcement

### Users Module

- Parent verification before recording
- Parent details included in reports
- Admin authorization for modifications

---

## Data Export

### CSV Export (Future Enhancement)

The report endpoint provides all data needed for CSV export:

```javascript
// Get report data
const response = await fetch(
  "/api/attendance/report?dateFrom=2024-01-01&dateTo=2024-12-31"
);
const data = await response.json();

// Convert to CSV format
const csv = convertToCSV(data.data.attendances);
downloadCSV(csv, "attendance-report.csv");
```

---

## Performance Considerations

### Pagination

- Default limit: 10 records
- Maximum limit: 100 records
- Use pagination for large datasets

### Indexing

- Database indexes on: `status`, `parentId`, `meetingId`, `hasPenalty`
- Optimized queries for date range filtering
- Efficient bulk operations

### Caching

- Consider caching statistics for frequently accessed data
- Cache parent and meeting details

---

## Security Notes

- **Admin Only Actions**: Record, update, delete, bulk operations, penalty calculations, reports
- **All Users**: View own attendance, statistics
- **Data Privacy**: Parents can only see their own attendance
- **Audit Trail**: All attendance records track who recorded them (`recordedBy`)
- **Soft Deletes**: Consider implementing soft deletes for audit purposes

---

## Future Enhancements

- [ ] QR code check-in system
- [ ] Mobile app integration
- [ ] Real-time attendance dashboard
- [ ] Automatic reminders for chronic absences
- [ ] Attendance certificates generation
- [ ] Export to Excel/PDF
- [ ] Attendance trends and predictions
- [ ] Biometric integration
- [ ] Geofencing for check-ins
- [ ] Parent self-check-in portal

---

## Support

For API support or questions, contact the development team or refer to the main README.md file.

## Version

Current API Version: 1.0.0
Last Updated: October 8, 2024
