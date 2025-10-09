# Meetings Management API Documentation

## Overview

The Meetings Management API provides comprehensive functionality for scheduling, managing, and tracking PTA meetings including minutes, resolutions, attendance tracking, quorum management, and member notifications.

## Features

- ✅ **Meeting Scheduling** - Create and schedule meetings with full details
- ✅ **6 Meeting Types** - GENERAL, SPECIAL, EMERGENCY, COMMITTEE, ANNUAL, QUARTERLY
- ✅ **3 Meeting Modes** - PHYSICAL, VIRTUAL, HYBRID
- ✅ **Meeting Status Tracking** - SCHEDULED, ONGOING, COMPLETED, CANCELLED, POSTPONED
- ✅ **Minutes & Resolutions** - Add meeting documentation after completion
- ✅ **Quorum Tracking** - Monitor meeting attendance quorum
- ✅ **Email Notifications** - Notify members about meetings
- ✅ **Meeting History** - Track past meetings
- ✅ **Upcoming Meetings** - View scheduled meetings
- ✅ **Statistics & Analytics** - Comprehensive meeting statistics
- ✅ **Filtering & Search** - Advanced filtering by type, status, date range

## Base URL

```
/api/meetings
```

## Authentication

All endpoints require authentication via JWT token:

```
Authorization: Bearer <your_jwt_token>
```

---

## Meeting Types

| Type          | Description              | Typical Use          |
| ------------- | ------------------------ | -------------------- |
| **GENERAL**   | Regular PTA meetings     | Monthly meetings     |
| **SPECIAL**   | Special purpose meetings | Specific topics      |
| **EMERGENCY** | Urgent meetings          | Critical issues      |
| **COMMITTEE** | Committee meetings       | Subgroup discussions |
| **ANNUAL**    | Annual general meetings  | Yearly gatherings    |
| **QUARTERLY** | Quarterly meetings       | Every 3 months       |

## Meeting Status

| Status        | Description                      |
| ------------- | -------------------------------- |
| **SCHEDULED** | Meeting is scheduled for future  |
| **ONGOING**   | Meeting is currently in progress |
| **COMPLETED** | Meeting has ended                |
| **CANCELLED** | Meeting was cancelled            |
| **POSTPONED** | Meeting was postponed            |

## Meeting Mode

| Mode         | Description                        |
| ------------ | ---------------------------------- |
| **PHYSICAL** | In-person meeting                  |
| **VIRTUAL**  | Online meeting (with meeting link) |
| **HYBRID**   | Both physical and virtual          |

---

## API Endpoints Summary

| Method | Endpoint                        | Description                | Access |
| ------ | ------------------------------- | -------------------------- | ------ |
| POST   | `/api/meetings`                 | Create meeting             | Admin  |
| GET    | `/api/meetings`                 | List meetings with filters | All    |
| GET    | `/api/meetings/:id`             | Get meeting details        | All    |
| PUT    | `/api/meetings/:id`             | Update meeting             | Admin  |
| DELETE | `/api/meetings/:id`             | Delete meeting             | Admin  |
| GET    | `/api/meetings/upcoming`        | Get upcoming meetings      | All    |
| GET    | `/api/meetings/history`         | Get past meetings          | All    |
| GET    | `/api/meetings/stats`           | Get statistics             | Admin  |
| POST   | `/api/meetings/:id/minutes`     | Add minutes                | Admin  |
| POST   | `/api/meetings/:id/resolutions` | Add resolutions            | Admin  |
| PUT    | `/api/meetings/:id/quorum`      | Update quorum              | Admin  |
| POST   | `/api/meetings/:id/notify`      | Send notifications         | Admin  |
| POST   | `/api/meetings/:id/cancel`      | Cancel meeting             | Admin  |

**Total: 14 endpoints**

---

## Detailed Endpoint Documentation

### 1. Create Meeting

Schedule a new PTA meeting.

**Endpoint**: `POST /api/meetings`

**Access**: Admin only

**Request Body**:

```json
{
  "title": "Monthly PTA Meeting - November 2024",
  "description": "Discussion on upcoming school events, budget review, and parent concerns.",
  "meetingType": "GENERAL",
  "mode": "HYBRID",
  "scheduledDate": "2024-11-15T14:00:00Z",
  "location": "JHCSC Main Building - Conference Room",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "agenda": "1. Opening Prayer\n2. Budget Review\n3. Upcoming Events\n4. Open Forum\n5. Closing Remarks",
  "expectedAttendees": 50
}
```

**Field Details**:

- `title` (required): Meeting title
- `description` (optional): Detailed description
- `meetingType` (required): One of meeting types
- `mode` (optional, default: PHYSICAL): Meeting mode
- `scheduledDate` (required): ISO date/time
- `location` (optional): Physical venue
- `meetingLink` (optional): Required for VIRTUAL/HYBRID
- `agenda` (optional): Meeting agenda
- `expectedAttendees` (optional): Number expected

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "title": "Monthly PTA Meeting - November 2024",
    "description": "Discussion on upcoming school events...",
    "meetingType": "GENERAL",
    "mode": "HYBRID",
    "status": "SCHEDULED",
    "scheduledDate": "2024-11-15T14:00:00.000Z",
    "location": "JHCSC Main Building - Conference Room",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "agenda": "1. Opening Prayer...",
    "expectedAttendees": 50,
    "actualAttendees": 0,
    "quorumMet": false,
    "createdBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-10-09T00:00:00.000Z",
    "updatedAt": "2024-10-09T00:00:00.000Z"
  },
  "message": "Meeting created successfully"
}
```

**Notes**:

- Status automatically set to SCHEDULED
- meetingLink required for VIRTUAL/HYBRID modes
- actualAttendees starts at 0
- quorumMet defaults to false

---

### 2. Get All Meetings

Retrieve meetings with filtering and pagination.

**Endpoint**: `GET /api/meetings`

**Access**: All authenticated users

**Query Parameters**:

- `type` (optional): Filter by meeting type
- `status` (optional): Filter by status
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 100): Items per page
- `sortBy` (optional, default: scheduledDate): Sort field
- `sortOrder` (optional, default: desc): Sort order

**Example**:

```
GET /api/meetings?type=GENERAL&status=SCHEDULED&page=1&limit=20
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "meetings": [
      {
        "id": 1,
        "title": "Monthly PTA Meeting - November 2024",
        "meetingType": "GENERAL",
        "mode": "HYBRID",
        "status": "SCHEDULED",
        "scheduledDate": "2024-11-15T14:00:00.000Z",
        "location": "JHCSC Main Building - Conference Room",
        "expectedAttendees": 50,
        "actualAttendees": 0,
        "_count": {
          "attendances": 0
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "message": "Meetings retrieved successfully"
}
```

---

### 3. Get Meeting by ID

Get detailed information about a specific meeting.

**Endpoint**: `GET /api/meetings/:id`

**Access**: All authenticated users

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Monthly PTA Meeting - November 2024",
    "description": "Discussion on upcoming school events...",
    "meetingType": "GENERAL",
    "mode": "HYBRID",
    "status": "COMPLETED",
    "scheduledDate": "2024-11-15T14:00:00.000Z",
    "startTime": "2024-11-15T14:05:00.000Z",
    "endTime": "2024-11-15T16:30:00.000Z",
    "location": "JHCSC Main Building - Conference Room",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "agenda": "1. Opening Prayer...",
    "minutes": "Meeting started at 2:05 PM...",
    "resolutions": "Resolved to allocate 50,000 PHP for...",
    "expectedAttendees": 50,
    "actualAttendees": 45,
    "quorumMet": true,
    "createdBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "attendances": [
      {
        "id": 1,
        "parent": {
          "id": 2,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "status": "PRESENT",
        "checkInTime": "2024-11-15T14:03:00.000Z"
      }
    ],
    "_count": {
      "attendances": 45
    },
    "createdAt": "2024-10-09T00:00:00.000Z",
    "updatedAt": "2024-11-15T16:35:00.000Z"
  },
  "message": "Meeting retrieved successfully"
}
```

**Notes**:

- Includes all meeting details
- Lists all attendances
- Shows minutes and resolutions if added
- Shows actual start/end times

---

### 4. Update Meeting

Update existing meeting details.

**Endpoint**: `PUT /api/meetings/:id`

**Access**: Admin only

**Request Body** (all fields optional):

```json
{
  "title": "Updated Meeting Title",
  "scheduledDate": "2024-11-16T14:00:00Z",
  "status": "POSTPONED",
  "location": "New Location"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Updated Meeting Title",
    "scheduledDate": "2024-11-16T14:00:00.000Z",
    "status": "POSTPONED",
    ...
  },
  "message": "Meeting updated successfully"
}
```

**Notes**:

- Can update any field except ID
- Status can be changed manually
- Can reschedule meetings
- Cannot update if meeting is COMPLETED

---

### 5. Delete Meeting

Delete a meeting (only if not started).

**Endpoint**: `DELETE /api/meetings/:id`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Meeting deleted successfully"
  },
  "message": "Meeting deleted successfully"
}
```

**Notes**:

- Can only delete SCHEDULED meetings
- Cannot delete ONGOING or COMPLETED meetings
- Consider CANCELLING instead of deleting
- Cascade deletes attendance records

---

### 6. Get Upcoming Meetings

Get all scheduled upcoming meetings.

**Endpoint**: `GET /api/meetings/upcoming`

**Access**: All authenticated users

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 2,
      "title": "Special Meeting - School Renovation",
      "meetingType": "SPECIAL",
      "scheduledDate": "2024-11-20T10:00:00.000Z",
      "status": "SCHEDULED",
      "mode": "PHYSICAL",
      "location": "Main Conference Room"
    }
  ],
  "message": "Upcoming meetings retrieved successfully"
}
```

**Notes**:

- Only returns SCHEDULED meetings
- Sorted by scheduledDate (ascending)
- Filters meetings with scheduledDate > now

---

### 7. Get Meeting History

Get all past/completed meetings.

**Endpoint**: `GET /api/meetings/history`

**Access**: All authenticated users

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "title": "Monthly PTA Meeting - November 2024",
      "meetingType": "GENERAL",
      "scheduledDate": "2024-11-15T14:00:00.000Z",
      "status": "COMPLETED",
      "actualAttendees": 45,
      "quorumMet": true
    }
  ],
  "message": "Meeting history retrieved successfully"
}
```

**Notes**:

- Returns COMPLETED or CANCELLED meetings
- Sorted by scheduledDate (descending)
- Most recent meetings first

---

### 8. Get Meeting Statistics

Get comprehensive meeting statistics and analytics.

**Endpoint**: `GET /api/meetings/stats`

**Access**: Admin only

**Query Parameters**:

- `dateFrom` (optional): Start date
- `dateTo` (optional): End date

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "totalMeetings": 15,
    "byStatus": {
      "SCHEDULED": 3,
      "ONGOING": 0,
      "COMPLETED": 10,
      "CANCELLED": 2,
      "POSTPONED": 0
    },
    "byType": {
      "GENERAL": 8,
      "SPECIAL": 3,
      "EMERGENCY": 1,
      "COMMITTEE": 2,
      "ANNUAL": 1,
      "QUARTERLY": 0
    },
    "byMode": {
      "PHYSICAL": 7,
      "VIRTUAL": 5,
      "HYBRID": 3
    },
    "averageAttendance": 42.5,
    "totalAttendances": 425,
    "quorumMetCount": 9,
    "quorumMetPercentage": "90.00",
    "upcomingMeetings": 3,
    "completedMeetings": 10
  },
  "message": "Meeting statistics retrieved successfully"
}
```

**Notes**:

- Provides comprehensive analytics
- Breakdown by status, type, mode
- Attendance and quorum statistics
- Can filter by date range

---

### 9. Add Minutes

Add meeting minutes after meeting completion.

**Endpoint**: `POST /api/meetings/:id/minutes`

**Access**: Admin only

**Request Body**:

```json
{
  "minutes": "Meeting Minutes:\n\n1. Opening Prayer - Led by John Doe\n2. Budget Review - Discussed allocation for library renovation\n3. Upcoming Events - Christmas party planning\n4. Open Forum - Multiple parents raised concerns about school uniform costs\n5. Closing Remarks - Adjournment at 4:30 PM\n\nAttendance: 45 out of 50 expected\nQuorum: Met (90% attendance)"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Monthly PTA Meeting - November 2024",
    "minutes": "Meeting Minutes:\n\n1. Opening Prayer...",
    "status": "COMPLETED",
    ...
  },
  "message": "Meeting minutes added successfully"
}
```

**Notes**:

- Can only add to COMPLETED meetings
- Minutes can be updated by calling again
- Support rich text/markdown
- Consider adding attachments via separate field

---

### 10. Add Resolutions

Add meeting resolutions/decisions.

**Endpoint**: `POST /api/meetings/:id/resolutions`

**Access**: Admin only

**Request Body**:

```json
{
  "resolutions": "Resolutions Passed:\n\n1. Resolved to allocate PHP 50,000 for library expansion project\n2. Resolved to hold Christmas party on December 20, 2024\n3. Resolved to review uniform supplier contracts\n4. Resolved to form committee for sports event planning\n\nAll resolutions passed unanimously."
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Monthly PTA Meeting - November 2024",
    "resolutions": "Resolutions Passed:\n\n1. Resolved to...",
    "status": "COMPLETED",
    ...
  },
  "message": "Meeting resolutions added successfully"
}
```

**Notes**:

- Can only add to COMPLETED meetings
- Resolutions can be updated
- Important for record-keeping
- Consider action item tracking

---

### 11. Update Quorum

Update meeting quorum status and actual attendance.

**Endpoint**: `PUT /api/meetings/:id/quorum`

**Access**: Admin only

**Request Body**:

```json
{
  "actualAttendees": 45,
  "quorumMet": true
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Monthly PTA Meeting - November 2024",
    "expectedAttendees": 50,
    "actualAttendees": 45,
    "quorumMet": true,
    "attendanceRate": "90.00",
    ...
  },
  "message": "Meeting quorum updated successfully"
}
```

**Notes**:

- Updates actual attendance count
- Sets quorum status
- Typically done after meeting
- Can be calculated automatically from attendance records

---

### 12. Send Notifications

Send email notifications to members about the meeting.

**Endpoint**: `POST /api/meetings/:id/notify`

**Access**: Admin only

**Request Body**:

```json
{
  "subject": "Reminder: Monthly PTA Meeting Tomorrow",
  "message": "This is a reminder that the Monthly PTA Meeting is scheduled for tomorrow, November 15, 2024 at 2:00 PM. Please ensure your attendance.\n\nAgenda:\n1. Budget Review\n2. Upcoming Events\n3. Open Forum\n\nLocation: JHCSC Main Building - Conference Room\nVirtual Link: https://meet.google.com/abc-defg-hij"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Notifications sent successfully",
    "recipientCount": 50,
    "sentCount": 48,
    "failedCount": 2
  },
  "message": "Meeting notifications sent"
}
```

**Notes**:

- Sends to all active parents
- Includes meeting details automatically
- Custom subject and message
- Rate-limited batch sending
- Returns send statistics

---

### 13. Cancel Meeting

Cancel a scheduled meeting.

**Endpoint**: `POST /api/meetings/:id/cancel`

**Access**: Admin only

**Request Body** (optional):

```json
{
  "reason": "Due to unforeseen circumstances, this meeting has been cancelled. A new date will be announced soon."
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Monthly PTA Meeting - November 2024",
    "status": "CANCELLED",
    "cancellationReason": "Due to unforeseen circumstances...",
    ...
  },
  "message": "Meeting cancelled successfully"
}
```

**Notes**:

- Changes status to CANCELLED
- Stores cancellation reason
- Can send notification to members
- Cannot cancel COMPLETED meetings
- Consider rescheduling instead

---

## Common Use Cases

### 1. Schedule Regular Monthly Meeting

```javascript
POST /api/meetings
{
  "title": "Monthly PTA Meeting - December 2024",
  "description": "Regular monthly meeting",
  "meetingType": "GENERAL",
  "mode": "HYBRID",
  "scheduledDate": "2024-12-15T14:00:00Z",
  "location": "Main Conference Room",
  "meetingLink": "https://meet.google.com/xyz",
  "agenda": "1. Opening\n2. Reports\n3. New Business\n4. Closing",
  "expectedAttendees": 50
}
```

### 2. Schedule Emergency Meeting

```javascript
POST /api/meetings
{
  "title": "Emergency Meeting - Urgent School Matter",
  "meetingType": "EMERGENCY",
  "mode": "VIRTUAL",
  "scheduledDate": "2024-11-10T18:00:00Z",
  "meetingLink": "https://meet.google.com/emergency",
  "agenda": "Urgent discussion required",
  "expectedAttendees": 30
}

// Send immediate notification
POST /api/meetings/1/notify
{
  "subject": "URGENT: Emergency PTA Meeting Tonight",
  "message": "Emergency meeting tonight at 6 PM..."
}
```

### 3. Complete Meeting Workflow

```javascript
// 1. Create meeting
POST /api/meetings
{ ... meeting details ... }

// 2. Send notification before meeting
POST /api/meetings/1/notify
{ "subject": "Reminder...", "message": "..." }

// 3. During meeting - record attendance
POST /api/attendance/record
{ "meetingId": 1, "parentId": 2, "status": "PRESENT" }

// 4. After meeting - update quorum
PUT /api/meetings/1/quorum
{ "actualAttendees": 45, "quorumMet": true }

// 5. Add minutes
POST /api/meetings/1/minutes
{ "minutes": "Meeting minutes..." }

// 6. Add resolutions
POST /api/meetings/1/resolutions
{ "resolutions": "Resolutions passed..." }

// 7. Update status
PUT /api/meetings/1
{ "status": "COMPLETED" }
```

### 4. View Upcoming Meetings

```javascript
GET / api / meetings / upcoming;

// Returns all scheduled future meetings
```

### 5. Generate Meeting Report

```javascript
GET /api/meetings/stats?dateFrom=2024-01-01&dateTo=2024-12-31

// Returns comprehensive statistics for the year
```

---

## Integration with Other Modules

### With Attendance Module

```javascript
// Record attendance for meeting
POST /api/attendance/record
{
  "meetingId": 1,
  "parentId": 2,
  "status": "PRESENT"
}

// Bulk record
POST /api/attendance/bulk-record
{
  "meetingId": 1,
  "attendances": [...]
}
```

### With Penalties Module

```javascript
// Attendance automatically creates penalties
// for absent parents based on settings
```

### With Users Module

```javascript
// Meetings created by admin users
// meeting.createdBy → user.id

// Notifications sent to all parents
```

### With Settings Module

```javascript
// Meeting requirements from settings
// - Minimum quorum percentage
// - Penalty rates for absences
```

---

## Error Handling

### Common Errors

**400 Bad Request**

- Invalid meeting type
- Invalid date format
- Missing required fields
- Cannot add minutes to non-completed meeting

**401 Unauthorized**

- Missing or invalid token
- Token expired

**403 Forbidden**

- Parent trying admin action
- Insufficient permissions

**404 Not Found**

- Meeting not found
- Invalid meeting ID

**500 Internal Server Error**

- Database error
- Email sending failed

### Error Response Format

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description"
}
```

---

## Best Practices

### Meeting Management

1. **Schedule in advance** - At least 1 week notice
2. **Send reminders** - 24 hours before meeting
3. **Set clear agenda** - Help members prepare
4. **Track attendance** - Use attendance module
5. **Document outcomes** - Add minutes and resolutions
6. **Monitor quorum** - Ensure valid meetings

### For Virtual Meetings

1. **Test links** - Verify meeting links work
2. **Send credentials** - Include access information
3. **Record sessions** - For those who can't attend
4. **Follow up** - Share recordings and minutes

### For Administrators

1. **Update status** - Keep status current
2. **Archive properly** - Add minutes/resolutions
3. **Track metrics** - Review statistics regularly
4. **Communicate changes** - Notify about cancellations/changes

---

## Support

For meeting management issues:

- Verify meeting permissions
- Check meeting status before operations
- Ensure proper date formatting
- Contact system administrator for technical issues

---

**API Version:** 1.0.0  
**Last Updated:** October 9, 2025  
**Maintained By:** Development Team
