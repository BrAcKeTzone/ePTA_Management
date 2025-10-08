# Announcements System API Documentation

## Overview

The Announcements System provides comprehensive functionality for creating, managing, and distributing announcements to parents and admins in the PTA system. It supports targeted announcements, priority levels, scheduled publishing, and automatic email notifications.

## Base URL

```
http://localhost:3000/api/announcements
```

## Authentication

All endpoints require proper authentication (to be implemented with auth middleware).

**Admin-only endpoints:**

- Create, Update, Delete, Publish, Unpublish announcements

**Parent & Admin access:**

- Get active announcements, Get announcement by ID

## Features

### 🎯 Targeted Announcements

- **ALL**: Send to all users (admins and parents)
- **PARENTS**: Send to all parents
- **ADMINS**: Send to all admins
- **SPECIFIC_PROGRAM**: Send to parents of students in a specific program (e.g., BSIT, BSCS)
- **SPECIFIC_YEAR_LEVEL**: Send to parents of students in a specific year level (e.g., 1st Year, 2nd Year)

### 📊 Priority Levels

- **LOW**: General information
- **MEDIUM**: Standard announcements (default)
- **HIGH**: Important notices
- **URGENT**: Critical/time-sensitive announcements

### 📧 Automatic Notifications

- Email notifications sent automatically when announcement is published
- Batched sending to prevent email server overload
- Priority-based email formatting
- Support for attachments

### ⏰ Publishing Controls

- Draft mode (isPublished: false)
- Scheduled publishing with publishDate
- Automatic expiry with expiryDate
- Publish/Unpublish capabilities

---

## Endpoints

### 1. Create Announcement (Admin)

**POST** `/api/announcements`

Creates a new announcement in draft mode.

**Request Body:**

```json
{
  "title": "Quarterly PTA Meeting",
  "content": "Dear Parents,\n\nWe are pleased to invite you to our quarterly PTA meeting scheduled for next week. This meeting will cover important updates about upcoming school activities and budget proposals.\n\nDate: October 15, 2025\nTime: 2:00 PM\nVenue: School Auditorium\n\nYour attendance is highly appreciated.",
  "priority": "HIGH",
  "targetAudience": "PARENTS",
  "publishDate": "2025-10-08T08:00:00Z",
  "expiryDate": "2025-10-15T18:00:00Z",
  "isPublished": false,
  "attachmentUrl": "https://example.com/meeting-agenda.pdf",
  "attachmentName": "Meeting Agenda.pdf",
  "createdById": 1
}
```

**Field Descriptions:**

| Field           | Type     | Required    | Description                                                           |
| --------------- | -------- | ----------- | --------------------------------------------------------------------- |
| title           | string   | ✅ Yes      | Announcement title (3-200 chars)                                      |
| content         | string   | ✅ Yes      | Announcement content (min 10 chars)                                   |
| priority        | string   | No          | LOW, MEDIUM (default), HIGH, URGENT                                   |
| targetAudience  | string   | No          | ALL (default), PARENTS, ADMINS, SPECIFIC_PROGRAM, SPECIFIC_YEAR_LEVEL |
| targetProgram   | string   | Conditional | Required if targetAudience is SPECIFIC_PROGRAM                        |
| targetYearLevel | string   | Conditional | Required if targetAudience is SPECIFIC_YEAR_LEVEL                     |
| isPublished     | boolean  | No          | Default: false (draft mode)                                           |
| publishDate     | ISO date | No          | When to publish (null = immediately when published)                   |
| expiryDate      | ISO date | No          | When announcement expires (must be after publishDate)                 |
| attachmentUrl   | string   | No          | URL to attachment file                                                |
| attachmentName  | string   | No          | Display name for attachment                                           |
| createdById     | number   | ✅ Yes      | ID of admin creating the announcement                                 |

**Response:**

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "title": "Quarterly PTA Meeting",
    "content": "Dear Parents,...",
    "priority": "HIGH",
    "targetAudience": "PARENTS",
    "targetProgram": null,
    "targetYearLevel": null,
    "isPublished": false,
    "publishDate": "2025-10-08T08:00:00.000Z",
    "expiryDate": "2025-10-15T18:00:00.000Z",
    "attachmentUrl": "https://example.com/meeting-agenda.pdf",
    "attachmentName": "Meeting Agenda.pdf",
    "createdById": 1,
    "createdBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  },
  "message": "Announcement created successfully",
  "success": true
}
```

---

### 2. Get All Announcements

**GET** `/api/announcements`

Retrieves announcements with optional filtering and pagination.

**Query Parameters:**

| Parameter      | Type    | Description                                    |
| -------------- | ------- | ---------------------------------------------- |
| search         | string  | Search in title and content                    |
| priority       | string  | Filter by priority (LOW, MEDIUM, HIGH, URGENT) |
| targetAudience | string  | Filter by target audience                      |
| isPublished    | boolean | Filter by published status (true/false)        |
| createdById    | number  | Filter by creator ID                           |
| page           | number  | Page number (default: 1)                       |
| limit          | number  | Items per page (default: 10, max: 100)         |

**Example:**

```
GET /api/announcements?priority=HIGH&isPublished=true&page=1&limit=20
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "announcements": [
      {
        "id": 1,
        "title": "Quarterly PTA Meeting",
        "content": "Dear Parents,...",
        "priority": "HIGH",
        "targetAudience": "PARENTS",
        "isPublished": true,
        "publishDate": "2025-10-08T08:00:00.000Z",
        "expiryDate": "2025-10-15T18:00:00.000Z",
        "createdBy": {
          "id": 1,
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "ADMIN"
        },
        "createdAt": "2025-10-08T10:30:00.000Z",
        "updatedAt": "2025-10-08T10:30:00.000Z"
      }
    ],
    "totalCount": 1,
    "totalPages": 1,
    "currentPage": 1
  },
  "message": "Announcements retrieved successfully",
  "success": true
}
```

---

### 3. Get Active Announcements

**GET** `/api/announcements/active`

Retrieves only published announcements that are not expired. This is the main endpoint for parents to view current announcements.

**Query Parameters:**

| Parameter | Type   | Description                            |
| --------- | ------ | -------------------------------------- |
| page      | number | Page number (default: 1)               |
| limit     | number | Items per page (default: 10, max: 100) |

**Example:**

```
GET /api/announcements/active?page=1&limit=10
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "announcements": [
      {
        "id": 1,
        "title": "Quarterly PTA Meeting",
        "content": "Dear Parents,...",
        "priority": "HIGH",
        "targetAudience": "PARENTS",
        "isPublished": true,
        "publishDate": "2025-10-08T08:00:00.000Z",
        "expiryDate": "2025-10-15T18:00:00.000Z",
        "attachmentUrl": "https://example.com/meeting-agenda.pdf",
        "attachmentName": "Meeting Agenda.pdf",
        "createdBy": {
          "id": 1,
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "ADMIN"
        },
        "createdAt": "2025-10-08T10:30:00.000Z",
        "updatedAt": "2025-10-08T10:30:00.000Z"
      }
    ],
    "totalCount": 1,
    "totalPages": 1,
    "currentPage": 1
  },
  "message": "Active announcements retrieved successfully",
  "success": true
}
```

---

### 4. Get Announcement Statistics

**GET** `/api/announcements/stats`

Retrieves statistics about announcements.

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "totalAnnouncements": 50,
    "publishedAnnouncements": 35,
    "unpublishedAnnouncements": 15,
    "activeAnnouncements": 30,
    "expiredAnnouncements": 5,
    "urgentAnnouncements": 3,
    "byPriority": [
      { "priority": "LOW", "count": 10 },
      { "priority": "MEDIUM", "count": 25 },
      { "priority": "HIGH", "count": 12 },
      { "priority": "URGENT", "count": 3 }
    ],
    "byTargetAudience": [
      { "targetAudience": "ALL", "count": 20 },
      { "targetAudience": "PARENTS", "count": 25 },
      { "targetAudience": "SPECIFIC_PROGRAM", "count": 5 }
    ]
  },
  "message": "Announcement statistics retrieved successfully",
  "success": true
}
```

---

### 5. Get Announcement by ID

**GET** `/api/announcements/:id`

Retrieves a specific announcement by ID.

**Example:**

```
GET /api/announcements/1
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Quarterly PTA Meeting",
    "content": "Dear Parents,...",
    "priority": "HIGH",
    "targetAudience": "PARENTS",
    "isPublished": true,
    "publishDate": "2025-10-08T08:00:00.000Z",
    "expiryDate": "2025-10-15T18:00:00.000Z",
    "attachmentUrl": "https://example.com/meeting-agenda.pdf",
    "attachmentName": "Meeting Agenda.pdf",
    "createdBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "createdAt": "2025-10-08T10:30:00.000Z",
    "updatedAt": "2025-10-08T10:30:00.000Z"
  },
  "message": "Announcement retrieved successfully",
  "success": true
}
```

---

### 6. Update Announcement (Admin)

**PUT** `/api/announcements/:id`

Updates an existing announcement.

**Request Body:**

```json
{
  "title": "Updated: Quarterly PTA Meeting",
  "content": "Updated content...",
  "priority": "URGENT",
  "expiryDate": "2025-10-16T18:00:00Z"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Updated: Quarterly PTA Meeting",
    "content": "Updated content...",
    "priority": "URGENT",
    ...
  },
  "message": "Announcement updated successfully",
  "success": true
}
```

---

### 7. Delete Announcement (Admin)

**DELETE** `/api/announcements/:id`

Deletes an announcement permanently.

**Example:**

```
DELETE /api/announcements/1
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "message": "Announcement deleted successfully"
  },
  "message": "Announcement deleted successfully",
  "success": true
}
```

---

### 8. Publish Announcement (Admin)

**PATCH** `/api/announcements/:id/publish`

Publishes an announcement and sends email notifications to targeted recipients.

**Request Body:**

```json
{
  "publishDate": "2025-10-08T08:00:00Z",
  "sendNotifications": true
}
```

| Field             | Type     | Required | Description                                         |
| ----------------- | -------- | -------- | --------------------------------------------------- |
| publishDate       | ISO date | No       | When to mark as published (default: now)            |
| sendNotifications | boolean  | No       | Whether to send email notifications (default: true) |

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "announcement": {
      "id": 1,
      "title": "Quarterly PTA Meeting",
      "isPublished": true,
      "publishDate": "2025-10-08T08:00:00.000Z",
      ...
    },
    "notificationResult": {
      "sent": 150,
      "failed": 2,
      "errors": [
        "Failed to send to john@example.com: Connection timeout"
      ]
    }
  },
  "message": "Announcement published successfully",
  "success": true
}
```

**Publishing Process:**

1. **Updates announcement**: Sets `isPublished = true` and `publishDate`
2. **Identifies recipients**: Based on `targetAudience` setting:
   - **ALL**: All users in the system
   - **PARENTS**: All users with role PARENT
   - **ADMINS**: All users with role ADMIN
   - **SPECIFIC_PROGRAM**: Parents of students in the specified program (with APPROVED link status)
   - **SPECIFIC_YEAR_LEVEL**: Parents of students in the specified year level (with APPROVED link status)
3. **Sends emails**: Batched email sending (10 emails per batch) with 1-second delay between batches
4. **Returns results**: Number of successful/failed deliveries

---

### 9. Unpublish Announcement (Admin)

**PATCH** `/api/announcements/:id/unpublish`

Unpublishes an announcement (sets isPublished to false). Does not send notifications.

**Example:**

```
PATCH /api/announcements/1/unpublish
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Quarterly PTA Meeting",
    "isPublished": false,
    ...
  },
  "message": "Announcement unpublished successfully",
  "success": true
}
```

---

## Targeted Announcements Examples

### Example 1: Send to All BSIT Students' Parents

```json
{
  "title": "BSIT Program Update",
  "content": "Important information for BSIT students and parents...",
  "priority": "HIGH",
  "targetAudience": "SPECIFIC_PROGRAM",
  "targetProgram": "BSIT",
  "createdById": 1
}
```

When published, this will send emails to all parents who have students in the BSIT program with APPROVED link status.

### Example 2: Send to All 1st Year Students' Parents

```json
{
  "title": "Freshman Orientation",
  "content": "Welcome to all 1st year students and their parents...",
  "priority": "HIGH",
  "targetAudience": "SPECIFIC_YEAR_LEVEL",
  "targetYearLevel": "1st Year",
  "createdById": 1
}
```

### Example 3: Urgent Announcement to Everyone

```json
{
  "title": "School Closure Due to Weather",
  "content": "Due to severe weather conditions, the school will be closed...",
  "priority": "URGENT",
  "targetAudience": "ALL",
  "createdById": 1
}
```

---

## Email Notification Format

When an announcement is published with `sendNotifications: true`, recipients receive an email like this:

**Subject:** `[High Priority] Quarterly PTA Meeting`

**Body:**

```
Dear Maria Cruz,

High Priority

ANNOUNCEMENT: Quarterly PTA Meeting

Dear Parents,

We are pleased to invite you to our quarterly PTA meeting scheduled for next week...

Attachment: https://example.com/meeting-agenda.pdf

---
This is an automated notification from the ePTA Management System.
John H. Catolico Sr. College - Dumingag Campus
Parent and Teacher Association

Please do not reply to this email.
```

---

## Data Models

### Announcement Priority

- `LOW`: General information, non-urgent
- `MEDIUM`: Standard announcements (default)
- `HIGH`: Important notices requiring attention
- `URGENT`: Critical/time-sensitive (displayed as 🔴 URGENT in emails)

### Target Audience

- `ALL`: All users (admins and parents)
- `PARENTS`: All parent accounts
- `ADMINS`: All admin accounts
- `SPECIFIC_PROGRAM`: Parents of students in a specific program
- `SPECIFIC_YEAR_LEVEL`: Parents of students in a specific year level

### Programs (for SPECIFIC_PROGRAM targeting)

BSIT, BSCS, BSED, BEED, BSBA, BSN, BSME, BSCE, BSEE, BSAG, BSFOR, BSPSYCH, BSMATH, BSPHY, BSCHEM, BSBIO

### Year Levels (for SPECIFIC_YEAR_LEVEL targeting)

1st Year, 2nd Year, 3rd Year, 4th Year, 5th Year

---

## Workflow Examples

### Admin Creates and Publishes Announcement

```
1. Admin: POST /api/announcements
   {
     "title": "PTA Meeting",
     "content": "Details...",
     "targetAudience": "PARENTS",
     "isPublished": false
   }
   → Creates draft announcement

2. Admin: PUT /api/announcements/1
   {
     "expiryDate": "2025-10-15T18:00:00Z"
   }
   → Updates announcement details

3. Admin: PATCH /api/announcements/1/publish
   {
     "sendNotifications": true
   }
   → Publishes and sends emails to all parents

4. System sends 150 emails in batches
   → 148 successful, 2 failed

5. Parents: GET /api/announcements/active
   → Parents can see the published announcement
```

### Admin Schedules Future Announcement

```
1. Admin: POST /api/announcements
   {
     "title": "Next Month's Budget Meeting",
     "content": "Details...",
     "publishDate": "2025-11-01T08:00:00Z",
     "expiryDate": "2025-11-05T18:00:00Z",
     "isPublished": false
   }
   → Creates draft with future publish date

2. On Nov 1, Admin: PATCH /api/announcements/2/publish
   → Publishes on scheduled date with notifications
```

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Target program is required for SPECIFIC_PROGRAM audience",
  "success": false
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Only admins can create announcements",
  "success": false
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Announcement not found",
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

---

## Best Practices

### 1. Use Draft Mode

Create announcements as drafts first (`isPublished: false`), review them, then publish.

### 2. Set Expiry Dates

Always set expiry dates for time-sensitive announcements to keep the active list clean.

### 3. Use Appropriate Priority Levels

- Use URGENT sparingly for truly critical situations
- HIGH for important notices
- MEDIUM for regular announcements
- LOW for general information

### 4. Target Your Audience

Use targeted announcements to avoid information overload:

- Use SPECIFIC_PROGRAM for program-specific information
- Use SPECIFIC_YEAR_LEVEL for year-specific information
- Use PARENTS for parent-only information

### 5. Test Notifications

When publishing important announcements, consider:

- Sending to a test group first
- Checking the notification result for failures
- Following up on failed deliveries

### 6. Batch Publishing

If you need to publish multiple announcements, add a delay between them to avoid overwhelming the email server.

---

## Implementation Notes

### Email Batching

- Emails are sent in batches of 10
- 1-second delay between batches
- Prevents email server rate limiting
- Returns detailed success/failure report

### Link Status Filtering

For targeted announcements (SPECIFIC_PROGRAM, SPECIFIC_YEAR_LEVEL), only parents with APPROVED student links receive notifications. This ensures that only verified parent-student relationships receive relevant announcements.

### Notification Performance

For large audiences (100+ recipients):

- Expect ~1 minute per 100 recipients
- Notifications are sent asynchronously
- Publishing operation returns immediately with notification promise
- Check notification result for success/failure counts
