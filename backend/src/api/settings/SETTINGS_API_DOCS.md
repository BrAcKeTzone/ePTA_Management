# Settings Management API Documentation

## Overview

The Settings Management System provides centralized configuration for the entire PTA Management System. Administrators can configure penalty rates, contribution amounts, payment settings, meeting requirements, document categories, academic year information, and system-wide settings.

**Base URL**: `/api/settings`

**Authentication**: All endpoints require authentication (JWT token in Authorization header)

**Authorization**: Most endpoints are restricted to ADMIN role only

---

## Table of Contents

1. [Configuration Categories](#configuration-categories)
2. [Endpoints](#endpoints)
   - [Get All Settings](#1-get-all-settings)
   - [Update Settings](#2-update-settings)
   - [Get Settings by Category](#3-get-settings-by-category)
   - [Initialize Settings](#4-initialize-settings)
   - [Reset to Defaults](#5-reset-to-defaults)
   - [Get Document Categories](#6-get-document-categories)
   - [Add Document Category](#7-add-document-category)
   - [Remove Document Category](#8-remove-document-category)
3. [Configuration Fields](#configuration-fields)
4. [Default Values](#default-values)
5. [Usage Examples](#usage-examples)
6. [Workflows](#workflows)
7. [Error Handling](#error-handling)

---

## Configuration Categories

The system settings are organized into the following categories:

1. **Penalty Settings** - Late fees and absence penalties
2. **Contribution Settings** - Monthly dues and project contributions
3. **Payment Settings** - Payment basis and options
4. **Meeting Settings** - Meeting requirements and notifications
5. **Document Settings** - Document category management
6. **Academic Year Settings** - School year configuration
7. **System Settings** - Organization information
8. **Notification Settings** - Email and SMS preferences

---

## Endpoints

### 1. Get All Settings

Retrieve all system configuration settings.

**Endpoint**: `GET /api/settings`

**Access**: Private (Admin only)

**Request Headers**:

```http
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "key": "system_config",

    // Penalty Settings
    "penaltyRatePerAbsence": 50.0,
    "penaltyRateLate": 25.0,
    "penaltyGracePeriodDays": 7,
    "enableAutoPenalty": true,

    // Contribution Settings
    "monthlyContributionAmount": 100.0,
    "projectContributionMinimum": 50.0,
    "enableMandatoryContribution": true,

    // Payment Settings
    "paymentBasis": "PER_STUDENT",
    "allowPartialPayment": true,
    "paymentDueDays": 30,

    // Meeting Settings
    "minimumMeetingsPerYear": 4,
    "quorumPercentage": 50.0,
    "notificationDaysBeforeMeet": 7,

    // Document Categories
    "documentCategories": [
      "Minutes",
      "Resolutions",
      "Financial Reports",
      "Project Proposals",
      "Attendance Records",
      "Legal Documents",
      "Communications",
      "Other"
    ],

    // Academic Year Settings
    "currentAcademicYear": "2024-2025",
    "academicYearStart": "08-01",
    "academicYearEnd": "07-31",

    // System Settings
    "systemName": "JHCSC Dumingag Campus PTA",
    "systemEmail": "pta@jhcsc.edu.ph",
    "systemPhone": "+639123456789",
    "enableEmailNotifications": true,
    "enableSMSNotifications": false,

    // Metadata
    "updatedBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "updatedById": 1,
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "System settings retrieved successfully",
  "success": true
}
```

**Notes**:

- If settings don't exist, they will be automatically created with default values
- First admin user in the database will be set as the creator

---

### 2. Update Settings

Update one or more system configuration settings.

**Endpoint**: `PUT /api/settings`

**Access**: Private (Admin only)

**Request Headers**:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "penaltyRatePerAbsence": 75.0,
  "monthlyContributionAmount": 150.0,
  "paymentBasis": "PER_FAMILY",
  "currentAcademicYear": "2025-2026",
  "systemName": "JHCSC Dumingag PTA",
  "enableEmailNotifications": true
}
```

**Validation Rules**:

- At least one field must be provided
- Numeric fields must be within valid ranges
- Dates must follow specified formats
- Enums must match allowed values

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "key": "system_config",
    "penaltyRatePerAbsence": 75.0,
    "monthlyContributionAmount": 150.0,
    "paymentBasis": "PER_FAMILY",
    // ... other fields ...
    "updatedBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "updatedAt": "2025-01-15T14:20:00.000Z"
  },
  "message": "System settings updated successfully",
  "success": true
}
```

**Error Responses**:

400 Bad Request - Invalid input:

```json
{
  "statusCode": 400,
  "message": "Penalty rate per absence cannot exceed 10,000",
  "success": false
}
```

401 Unauthorized:

```json
{
  "statusCode": 401,
  "message": "User not authenticated",
  "success": false
}
```

---

### 3. Get Settings by Category

Retrieve settings for a specific category.

**Endpoint**: `GET /api/settings/category/:category`

**Access**: Private (Admin only)

**URL Parameters**:

- `category` (string) - One of: `penalty`, `contribution`, `payment`, `meeting`, `document`, `academic`, `system`, `notification`, `all`

**Request Headers**:

```http
Authorization: Bearer <jwt_token>
```

**Example Request**:

```http
GET /api/settings/category/penalty
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "penaltyRatePerAbsence": 50.0,
    "penaltyRateLate": 25.0,
    "penaltyGracePeriodDays": 7,
    "enableAutoPenalty": true
  },
  "message": "penalty settings retrieved successfully",
  "success": true
}
```

**Category Response Examples**:

**Contribution**:

```json
{
  "monthlyContributionAmount": 100.0,
  "projectContributionMinimum": 50.0,
  "enableMandatoryContribution": true
}
```

**Payment**:

```json
{
  "paymentBasis": "PER_STUDENT",
  "allowPartialPayment": true,
  "paymentDueDays": 30
}
```

**Meeting**:

```json
{
  "minimumMeetingsPerYear": 4,
  "quorumPercentage": 50.0,
  "notificationDaysBeforeMeet": 7
}
```

**Document**:

```json
{
  "documentCategories": ["Minutes", "Resolutions", "Financial Reports"]
}
```

**Academic**:

```json
{
  "currentAcademicYear": "2024-2025",
  "academicYearStart": "08-01",
  "academicYearEnd": "07-31"
}
```

**System**:

```json
{
  "systemName": "JHCSC Dumingag Campus PTA",
  "systemEmail": "pta@jhcsc.edu.ph",
  "systemPhone": "+639123456789"
}
```

**Notification**:

```json
{
  "enableEmailNotifications": true,
  "enableSMSNotifications": false
}
```

---

### 4. Initialize Settings

Initialize system settings with default values (first-time setup).

**Endpoint**: `POST /api/settings/initialize`

**Access**: Private (Admin only)

**Request Headers**:

```http
Authorization: Bearer <jwt_token>
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "key": "system_config"
    // ... all default settings ...
  },
  "message": "System settings initialized successfully",
  "success": true
}
```

**Notes**:

- If settings already exist, returns existing settings without modification
- Used during initial system setup
- Creates settings with all default values

---

### 5. Reset to Defaults

Reset all settings to their default values.

**Endpoint**: `POST /api/settings/reset`

**Access**: Private (Admin only)

**Request Headers**:

```http
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 2,
    "key": "system_config",
    // ... all default settings ...
    "updatedBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  },
  "message": "System settings reset to defaults successfully",
  "success": true
}
```

**Notes**:

- Deletes existing settings and creates new default settings
- All custom configurations will be lost
- Use with caution - recommend confirming with user before executing

---

### 6. Get Document Categories

Retrieve the list of available document categories.

**Endpoint**: `GET /api/settings/documents/categories`

**Access**: Private

**Request Headers**:

```http
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "categories": [
      "Minutes",
      "Resolutions",
      "Financial Reports",
      "Project Proposals",
      "Attendance Records",
      "Legal Documents",
      "Communications",
      "Other"
    ]
  },
  "message": "Document categories retrieved successfully",
  "success": true
}
```

**Notes**:

- Available to all authenticated users
- Used when uploading documents or filtering by category

---

### 7. Add Document Category

Add a new document category to the system.

**Endpoint**: `POST /api/settings/documents/categories`

**Access**: Private (Admin only)

**Request Headers**:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "category": "Policy Documents"
}
```

**Validation Rules**:

- `category` is required
- Must be a non-empty string
- Cannot duplicate existing category (case-insensitive)
- Maximum 100 characters
- Maximum 50 total categories allowed

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "categories": [
      "Minutes",
      "Resolutions",
      "Financial Reports",
      "Project Proposals",
      "Attendance Records",
      "Legal Documents",
      "Communications",
      "Other",
      "Policy Documents"
    ]
  },
  "message": "Document category added successfully",
  "success": true
}
```

**Error Responses**:

400 Bad Request - Duplicate category:

```json
{
  "statusCode": 400,
  "message": "Document category already exists",
  "success": false
}
```

400 Bad Request - Missing category:

```json
{
  "statusCode": 400,
  "message": "Category name is required",
  "success": false
}
```

---

### 8. Remove Document Category

Remove a document category from the system.

**Endpoint**: `DELETE /api/settings/documents/categories/:category`

**Access**: Private (Admin only)

**URL Parameters**:

- `category` (string) - Name of the category to remove

**Request Headers**:

```http
Authorization: Bearer <jwt_token>
```

**Example Request**:

```http
DELETE /api/settings/documents/categories/Policy%20Documents
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "categories": [
      "Minutes",
      "Resolutions",
      "Financial Reports",
      "Project Proposals",
      "Attendance Records",
      "Legal Documents",
      "Communications",
      "Other"
    ]
  },
  "message": "Document category removed successfully",
  "success": true
}
```

**Error Responses**:

404 Not Found - Category doesn't exist:

```json
{
  "statusCode": 404,
  "message": "Document category not found",
  "success": false
}
```

400 Bad Request - Last category:

```json
{
  "statusCode": 400,
  "message": "At least one document category is required",
  "success": false
}
```

---

## Configuration Fields

### Penalty Settings

| Field                    | Type    | Default | Range      | Description                                      |
| ------------------------ | ------- | ------- | ---------- | ------------------------------------------------ |
| `penaltyRatePerAbsence`  | Float   | 50.00   | 0 - 10,000 | Penalty amount charged per meeting absence (PHP) |
| `penaltyRateLate`        | Float   | 25.00   | 0 - 10,000 | Penalty amount for late attendance (PHP)         |
| `penaltyGracePeriodDays` | Integer | 7       | 0 - 365    | Days before penalty is applied                   |
| `enableAutoPenalty`      | Boolean | true    | -          | Automatically calculate and apply penalties      |

### Contribution Settings

| Field                         | Type    | Default | Range       | Description                            |
| ----------------------------- | ------- | ------- | ----------- | -------------------------------------- |
| `monthlyContributionAmount`   | Float   | 100.00  | 0 - 100,000 | Monthly dues amount (PHP)              |
| `projectContributionMinimum`  | Float   | 50.00   | 0 - 100,000 | Minimum contribution per project (PHP) |
| `enableMandatoryContribution` | Boolean | true    | -           | Require mandatory contributions        |

### Payment Settings

| Field                 | Type    | Default       | Allowed Values                       | Description                      |
| --------------------- | ------- | ------------- | ------------------------------------ | -------------------------------- |
| `paymentBasis`        | String  | "PER_STUDENT" | PER_STUDENT, PER_FAMILY, PER_MEETING | How contributions are calculated |
| `allowPartialPayment` | Boolean | true          | -                                    | Allow partial payments           |
| `paymentDueDays`      | Integer | 30            | 1 - 365                              | Days to pay after due date       |

### Meeting Settings

| Field                        | Type    | Default | Range   | Description                              |
| ---------------------------- | ------- | ------- | ------- | ---------------------------------------- |
| `minimumMeetingsPerYear`     | Integer | 4       | 1 - 52  | Required annual meetings                 |
| `quorumPercentage`           | Float   | 50.0    | 0 - 100 | Percentage needed for quorum             |
| `notificationDaysBeforeMeet` | Integer | 7       | 0 - 90  | Days before meeting to send notification |

### Document Settings

| Field                | Type          | Default                         | Description                 |
| -------------------- | ------------- | ------------------------------- | --------------------------- |
| `documentCategories` | Array[String] | ["Minutes", "Resolutions", ...] | List of document categories |

### Academic Year Settings

| Field                 | Type   | Default     | Format    | Description                 |
| --------------------- | ------ | ----------- | --------- | --------------------------- |
| `currentAcademicYear` | String | "2024-2025" | YYYY-YYYY | Current school year         |
| `academicYearStart`   | String | "08-01"     | MM-DD     | Start date of academic year |
| `academicYearEnd`     | String | "07-31"     | MM-DD     | End date of academic year   |

### System Settings

| Field         | Type   | Default                     | Description            |
| ------------- | ------ | --------------------------- | ---------------------- |
| `systemName`  | String | "JHCSC Dumingag Campus PTA" | Organization name      |
| `systemEmail` | String | "pta@jhcsc.edu.ph"          | Official email address |
| `systemPhone` | String | "+639123456789"             | Contact phone number   |

### Notification Settings

| Field                      | Type    | Default | Description                |
| -------------------------- | ------- | ------- | -------------------------- |
| `enableEmailNotifications` | Boolean | true    | Enable email notifications |
| `enableSMSNotifications`   | Boolean | false   | Enable SMS notifications   |

---

## Default Values

When settings are initialized, the following default values are used:

```javascript
{
  // Penalty Settings
  penaltyRatePerAbsence: 50.00,
  penaltyRateLate: 25.00,
  penaltyGracePeriodDays: 7,
  enableAutoPenalty: true,

  // Contribution Settings
  monthlyContributionAmount: 100.00,
  projectContributionMinimum: 50.00,
  enableMandatoryContribution: true,

  // Payment Settings
  paymentBasis: "PER_STUDENT",
  allowPartialPayment: true,
  paymentDueDays: 30,

  // Meeting Settings
  minimumMeetingsPerYear: 4,
  quorumPercentage: 50.0,
  notificationDaysBeforeMeet: 7,

  // Document Categories
  documentCategories: [
    "Minutes",
    "Resolutions",
    "Financial Reports",
    "Project Proposals",
    "Attendance Records",
    "Legal Documents",
    "Communications",
    "Other"
  ],

  // Academic Year
  currentAcademicYear: "2024-2025",
  academicYearStart: "08-01",
  academicYearEnd: "07-31",

  // System Info
  systemName: "JHCSC Dumingag Campus PTA",
  systemEmail: "pta@jhcsc.edu.ph",
  systemPhone: "+639123456789",

  // Notifications
  enableEmailNotifications: true,
  enableSMSNotifications: false
}
```

---

## Usage Examples

### Example 1: Update Penalty Rates

**Scenario**: Admin wants to increase penalty rates for absences and late attendance.

```javascript
// Request
PUT /api/settings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "penaltyRatePerAbsence": 75.00,
  "penaltyRateLate": 35.00,
  "penaltyGracePeriodDays": 5
}

// Response
{
  "statusCode": 200,
  "data": {
    "penaltyRatePerAbsence": 75.00,
    "penaltyRateLate": 35.00,
    "penaltyGracePeriodDays": 5,
    // ... other settings remain unchanged ...
  },
  "message": "System settings updated successfully",
  "success": true
}
```

### Example 2: Change Payment Basis

**Scenario**: Admin switches from per-student to per-family payment basis.

```javascript
// Request
PUT /api/settings

{
  "paymentBasis": "PER_FAMILY",
  "monthlyContributionAmount": 200.00
}

// Response
{
  "statusCode": 200,
  "data": {
    "paymentBasis": "PER_FAMILY",
    "monthlyContributionAmount": 200.00,
    // ... other settings ...
  },
  "message": "System settings updated successfully",
  "success": true
}
```

### Example 3: Get Penalty Settings Only

**Scenario**: Admin wants to review current penalty configuration.

```javascript
// Request
GET /api/settings/category/penalty

// Response
{
  "statusCode": 200,
  "data": {
    "penaltyRatePerAbsence": 50.00,
    "penaltyRateLate": 25.00,
    "penaltyGracePeriodDays": 7,
    "enableAutoPenalty": true
  },
  "message": "penalty settings retrieved successfully",
  "success": true
}
```

### Example 4: Update Academic Year

**Scenario**: Admin updates the academic year at the start of new school year.

```javascript
// Request
PUT /api/settings

{
  "currentAcademicYear": "2025-2026",
  "academicYearStart": "08-15",
  "academicYearEnd": "07-31"
}

// Response
{
  "statusCode": 200,
  "data": {
    "currentAcademicYear": "2025-2026",
    "academicYearStart": "08-15",
    "academicYearEnd": "07-31",
    // ... other settings ...
  },
  "message": "System settings updated successfully",
  "success": true
}
```

### Example 5: Manage Document Categories

**Scenario**: Admin adds a new document category and removes an old one.

```javascript
// Add new category
POST /api/settings/documents/categories

{
  "category": "Training Materials"
}

// Response
{
  "statusCode": 201,
  "data": {
    "categories": [
      "Minutes",
      "Resolutions",
      // ...
      "Training Materials"
    ]
  },
  "message": "Document category added successfully",
  "success": true
}

// Remove category
DELETE /api/settings/documents/categories/Other

// Response
{
  "statusCode": 200,
  "data": {
    "categories": [
      "Minutes",
      "Resolutions",
      // ... (without "Other")
    ]
  },
  "message": "Document category removed successfully",
  "success": true
}
```

---

## Workflows

### Initial System Setup Workflow

```
1. Admin logs in
   POST /api/auth/login

2. Initialize settings (if not exists)
   POST /api/settings/initialize

3. Customize settings as needed
   PUT /api/settings
```

### Penalty Configuration Workflow

```
1. Review current penalty settings
   GET /api/settings/category/penalty

2. Update penalty rates
   PUT /api/settings
   {
     "penaltyRatePerAbsence": 75.00,
     "penaltyRateLate": 35.00
   }

3. Verify changes
   GET /api/settings/category/penalty
```

### Academic Year Transition Workflow

```
1. Get current academic year settings
   GET /api/settings/category/academic

2. Update to new academic year
   PUT /api/settings
   {
     "currentAcademicYear": "2025-2026"
   }

3. Reset contribution tracking (separate API)

4. Notify members of new year settings
```

### Document Category Management Workflow

```
1. Get current categories
   GET /api/settings/documents/categories

2. Add new category
   POST /api/settings/documents/categories
   { "category": "New Category" }

3. Remove obsolete category
   DELETE /api/settings/documents/categories/:category

4. Update document upload forms to use new categories
```

---

## Error Handling

### Common Error Codes

| Status Code | Error                 | Description                                       |
| ----------- | --------------------- | ------------------------------------------------- |
| 400         | Bad Request           | Invalid input, validation failed                  |
| 401         | Unauthorized          | Missing or invalid authentication token           |
| 403         | Forbidden             | Insufficient permissions (non-admin)              |
| 404         | Not Found             | Resource not found (e.g., category doesn't exist) |
| 500         | Internal Server Error | Server-side error                                 |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Penalty rate per absence cannot exceed 10,000",
  "success": false
}
```

### Validation Errors

```json
{
  "statusCode": 400,
  "message": "\"paymentBasis\" must be one of: PER_STUDENT, PER_FAMILY, PER_MEETING",
  "success": false
}
```

### Authentication Errors

```json
{
  "statusCode": 401,
  "message": "User not authenticated",
  "success": false
}
```

---

## Best Practices

### 1. Regular Settings Review

- Review penalty rates quarterly
- Adjust contribution amounts based on inflation
- Update academic year settings at start of school year
- Review document categories annually

### 2. Before Updating Settings

- Get current settings first
- Document changes for audit trail
- Communicate changes to all members
- Consider impact on existing records

### 3. Payment Basis Changes

- Notify all members before changing payment basis
- Adjust contribution amounts accordingly
- Update invoices and payment tracking
- Consider mid-year transition carefully

### 4. Document Categories

- Keep categories relevant and organized
- Don't create too many categories (max 15-20)
- Use clear, descriptive names
- Remove unused categories periodically

### 5. Security

- Only allow ADMIN role to modify settings
- Log all setting changes with user ID
- Implement confirmation for destructive actions (reset)
- Backup settings before major changes

---

## Integration Notes

### Using Settings in Other Modules

**Penalty Calculation**:

```javascript
import { getSettings } from "../settings/settings.service";

const settings = await getSettings();
const penaltyAmount = absenceCount * settings.penaltyRatePerAbsence;
```

**Contribution Amount**:

```javascript
const settings = await getSettings();
const amount =
  settings.paymentBasis === "PER_FAMILY"
    ? settings.monthlyContributionAmount
    : settings.monthlyContributionAmount * studentCount;
```

**Document Upload Validation**:

```javascript
import { getDocumentCategories } from "../settings/settings.service";

const validCategories = await getDocumentCategories();
if (!validCategories.includes(uploadedCategory)) {
  throw new Error("Invalid document category");
}
```

**Meeting Quorum Check**:

```javascript
const settings = await getSettings();
const quorumReached =
  (attendees / totalMembers) * 100 >= settings.quorumPercentage;
```

---

## Testing

### Manual Testing Checklist

- [ ] Get all settings
- [ ] Update each category of settings
- [ ] Get settings by each category
- [ ] Initialize settings
- [ ] Reset to defaults
- [ ] Get document categories
- [ ] Add document category
- [ ] Remove document category
- [ ] Try updating with invalid values
- [ ] Test authentication requirement
- [ ] Test admin-only access
- [ ] Verify audit trail (updatedBy)

### Automated Testing

Test cases should cover:

- Settings initialization
- Settings updates with valid/invalid data
- Category-specific retrieval
- Document category CRUD operations
- Permission validation
- Data persistence

---

## Support

For issues or questions about Settings Management:

- Check validation rules for proper input formats
- Review default values for reference
- Consult integration notes for usage in other modules
- Contact system administrator for access issues

---

**Last Updated**: January 2025  
**API Version**: 1.0  
**Module**: Settings Management
