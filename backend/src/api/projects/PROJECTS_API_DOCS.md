# Projects Management API Documentation

## Overview

The Projects Management API provides comprehensive functionality for managing PTA projects from planning to completion. It includes features for budget tracking, expense management, progress monitoring, project updates/milestones, and detailed financial reporting.

## Features

- ✅ **Project Management**: Create and manage projects with 5 statuses and 4 priority levels
- ✅ **Financial Tracking**: Track budget, raised funds, expenses, and balance
- ✅ **Expense Management**: Record and categorize project expenses
- ✅ **Progress Monitoring**: Track progress percentage and completion status
- ✅ **Project Updates**: Post updates and milestones (public/private)
- ✅ **Budget Utilization**: Monitor spending against budget
- ✅ **Funding Goals**: Set and track fundraising targets
- ✅ **Comprehensive Reports**: Generate detailed reports with statistics
- ✅ **Search & Filter**: Advanced filtering and search capabilities

## Base URL

```
/api/projects
```

## Authentication

All endpoints require authentication via JWT token:

```
Authorization: Bearer <your_jwt_token>
```

## Project Status

- **PLANNING**: In planning phase
- **ACTIVE**: Currently active
- **ON_HOLD**: Temporarily paused
- **COMPLETED**: Successfully completed
- **CANCELLED**: Project cancelled

## Project Priority

- **LOW**: Low priority
- **MEDIUM**: Medium priority
- **HIGH**: High priority
- **URGENT**: Urgent priority

## API Endpoints Summary

### Projects (7 endpoints)

- `POST /api/projects` - Create project
- `GET /api/projects` - List projects with filters
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/report` - Generate report
- `GET /api/projects/stats` - Get statistics

### Expenses (4 endpoints)

- `POST /api/projects/:id/expenses` - Record expense
- `GET /api/projects/:id/expenses` - List expenses
- `PUT /api/projects/:id/expenses/:expenseId` - Update expense
- `DELETE /api/projects/:id/expenses/:expenseId` - Delete expense

### Updates (4 endpoints)

- `POST /api/projects/:id/updates` - Create update
- `GET /api/projects/:id/updates` - List updates
- `PUT /api/projects/:id/updates/:updateId` - Update update
- `DELETE /api/projects/:id/updates/:updateId` - Delete update

### Other (1 endpoint)

- `POST /api/projects/:id/update-raised` - Update raised funds

**Total: 20+ endpoints**

---

## Detailed Endpoint Documentation

### 1. Create Project

Create a new project.

**Endpoint**: `POST /api/projects`

**Access**: Admin only

**Request Body**:

```json
{
  "name": "School Renovation Project",
  "description": "Complete renovation of school facilities including classrooms and laboratories",
  "budget": 500000.0,
  "fundingGoal": 600000.0,
  "targetBeneficiaries": 1500,
  "priority": "HIGH",
  "startDate": "2024-11-01T00:00:00Z",
  "endDate": "2025-03-31T00:00:00Z",
  "location": "JHCSC Dumingag Campus",
  "venue": "Main Building",
  "notes": "Priority areas: Classrooms 101-105, Science Lab"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "name": "School Renovation Project",
    "description": "Complete renovation of school facilities",
    "budget": 500000.0,
    "balance": 500000.0,
    "totalRaised": 0,
    "totalExpenses": 0,
    "fundingGoal": 600000.0,
    "targetBeneficiaries": 1500,
    "status": "PLANNING",
    "priority": "HIGH",
    "progressPercentage": 0,
    "startDate": "2024-11-01T00:00:00Z",
    "endDate": "2025-03-31T00:00:00Z",
    "location": "JHCSC Dumingag Campus",
    "venue": "Main Building",
    "notes": "Priority areas: Classrooms 101-105",
    "createdBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-10-08T00:00:00Z",
    "updatedAt": "2024-10-08T00:00:00Z"
  },
  "message": "Project created successfully"
}
```

---

### 2. Get Projects

Retrieve projects with filtering, search, and pagination.

**Endpoint**: `GET /api/projects`

**Access**: All authenticated users

**Query Parameters**:

- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `createdById` (optional): Filter by creator
- `dateFrom` (optional): Filter from start date
- `dateTo` (optional): Filter to start date
- `search` (optional): Search in name or description
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 100): Items per page
- `sortBy` (optional, default: createdAt): Sort field
- `sortOrder` (optional, default: desc): Sort order

**Example**: `GET /api/projects?status=ACTIVE&priority=HIGH&page=1&limit=20`

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "School Renovation Project",
        "description": "Complete renovation of school facilities",
        "budget": 500000.0,
        "balance": 350000.0,
        "totalRaised": 200000.0,
        "totalExpenses": 150000.0,
        "status": "ACTIVE",
        "priority": "HIGH",
        "progressPercentage": 30,
        "startDate": "2024-11-01T00:00:00Z",
        "createdBy": {
          "id": 1,
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "contributions": [
          {
            "id": 1,
            "amount": 500.0,
            "amountPaid": 500.0,
            "status": "PAID"
          }
        ],
        "expenses": [
          {
            "id": 1,
            "amount": 50000.0,
            "expenseDate": "2024-11-15T00:00:00Z"
          }
        ],
        "_count": {
          "contributions": 400,
          "expenses": 15,
          "updates": 8
        }
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "message": "Projects retrieved successfully"
}
```

---

### 3. Get Project by ID

Get detailed information about a specific project.

**Endpoint**: `GET /api/projects/:id`

**Access**: All authenticated users

**Response** (200 OK): Includes full project details with all contributions, expenses, and updates.

---

### 4. Update Project

Update an existing project.

**Endpoint**: `PUT /api/projects/:id`

**Access**: Admin only

**Request Body** (all fields optional):

```json
{
  "name": "Updated Project Name",
  "budget": 600000.0,
  "status": "ACTIVE",
  "progressPercentage": 45,
  "notes": "Updated notes"
}
```

**Notes**:

- Balance is automatically recalculated if budget changes
- `completedDate` is automatically set when status changes to COMPLETED

---

### 5. Delete Project

Delete a project (only if no contributions or expenses exist).

**Endpoint**: `DELETE /api/projects/:id`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Project deleted successfully"
  },
  "message": "Project deleted successfully"
}
```

**Error**: Cannot delete project with contributions or expenses. Consider marking as CANCELLED instead.

---

### 6. Record Expense

Record an expense for a project.

**Endpoint**: `POST /api/projects/:id/expenses`

**Access**: Admin only

**Request Body**:

```json
{
  "title": "Classroom Paint and Materials",
  "description": "Paint, brushes, and materials for classrooms 101-103",
  "amount": 25000.0,
  "category": "Materials",
  "expenseDate": "2024-11-15T00:00:00Z",
  "receipt": "https://example.com/receipts/receipt-001.pdf",
  "notes": "Purchased from ABC Hardware Store"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "expense": {
      "id": 1,
      "projectId": 1,
      "title": "Classroom Paint and Materials",
      "description": "Paint, brushes, and materials",
      "amount": 25000.00,
      "category": "Materials",
      "expenseDate": "2024-11-15T00:00:00Z",
      "receipt": "https://example.com/receipts/receipt-001.pdf",
      "recordedBy": 1,
      "createdAt": "2024-11-15T00:00:00Z"
    },
    "project": {
      "id": 1,
      "name": "School Renovation Project",
      "totalExpenses": 25000.00,
      "balance": 475000.00,
      "expenses": [...]
    }
  },
  "message": "Expense recorded successfully"
}
```

**Notes**:

- Validates that expense doesn't exceed remaining budget balance
- Uses transaction to ensure data consistency
- Automatically updates project financials

---

### 7. Get Project Expenses

Get expenses for a project with optional filtering.

**Endpoint**: `GET /api/projects/:id/expenses`

**Access**: All authenticated users

**Query Parameters**:

- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `category` (optional): Filter by category

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "expenses": [
      {
        "id": 1,
        "title": "Classroom Paint and Materials",
        "amount": 25000.0,
        "category": "Materials",
        "expenseDate": "2024-11-15T00:00:00Z",
        "receipt": "https://example.com/receipts/receipt-001.pdf"
      }
    ],
    "summary": {
      "totalExpenses": 150000.0,
      "count": 15
    }
  },
  "message": "Project expenses retrieved successfully"
}
```

---

### 8. Update Expense

Update an existing expense.

**Endpoint**: `PUT /api/projects/:id/expenses/:expenseId`

**Access**: Admin only

**Request Body** (all fields optional):

```json
{
  "title": "Updated title",
  "amount": 27000.0,
  "category": "Materials & Labor"
}
```

**Notes**:

- If amount changes, project financials are automatically updated
- Validates that new amount doesn't exceed budget

---

### 9. Delete Expense

Delete an expense and revert project financials.

**Endpoint**: `DELETE /api/projects/:id/expenses/:expenseId`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Expense deleted successfully"
  },
  "message": "Expense deleted successfully"
}
```

**Notes**:

- Uses transaction to ensure data consistency
- Automatically reverts project financials

---

### 10. Create Project Update

Create a project update or milestone.

**Endpoint**: `POST /api/projects/:id/updates`

**Access**: Admin only

**Request Body**:

```json
{
  "title": "Phase 1 Completion",
  "content": "We have successfully completed Phase 1 of the renovation project. Classrooms 101-103 are now fully renovated and ready for use.",
  "isPublic": true,
  "isMilestone": true,
  "attachments": "[\"https://example.com/photos/phase1-1.jpg\", \"https://example.com/photos/phase1-2.jpg\"]"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "projectId": 1,
    "title": "Phase 1 Completion",
    "content": "We have successfully completed Phase 1",
    "isPublic": true,
    "isMilestone": true,
    "attachments": "[...]",
    "postedBy": 1,
    "createdAt": "2024-11-20T00:00:00Z"
  },
  "message": "Project update created successfully"
}
```

---

### 11. Get Project Updates

Get updates for a project.

**Endpoint**: `GET /api/projects/:id/updates`

**Access**: All authenticated users

**Query Parameters**:

- `isPublic` (optional): Filter by public/private (true/false)

**Response** (200 OK): Array of project updates ordered by date.

---

### 12. Update Project Update

Update an existing project update.

**Endpoint**: `PUT /api/projects/:id/updates/:updateId`

**Access**: Admin only

---

### 13. Delete Project Update

Delete a project update.

**Endpoint**: `DELETE /api/projects/:id/updates/:updateId`

**Access**: Admin only

---

### 14. Update Raised Funds

Calculate and update total raised funds from contributions.

**Endpoint**: `POST /api/projects/:id/update-raised`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "School Renovation Project",
    "totalRaised": 250000.0,
    "fundingGoal": 600000.0
  },
  "message": "Project raised funds updated successfully"
}
```

---

### 15. Generate Project Report

Generate comprehensive project reports with statistics.

**Endpoint**: `GET /api/projects/report`

**Access**: Admin only

**Query Parameters**:

- `projectId` (optional): Specific project
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `dateFrom` (required): Start date
- `dateTo` (required): End date
- `includeStats` (optional, default: true): Include statistics
- `includeExpenses` (optional, default: true): Include expenses
- `includeContributions` (optional, default: true): Include contributions

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "dateRange": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    },
    "totalRecords": 12,
    "projects": [...],
    "statistics": {
      "totalProjects": 12,
      "totalBudget": 5000000.00,
      "totalRaised": 3500000.00,
      "totalExpenses": 2800000.00,
      "totalBalance": 2200000.00,
      "averageProgress": "58.50",
      "fundingProgress": "70.00",
      "statusBreakdown": {
        "PLANNING": 2,
        "ACTIVE": 5,
        "ON_HOLD": 1,
        "COMPLETED": 3,
        "CANCELLED": 1
      }
    }
  },
  "message": "Project report generated successfully"
}
```

---

### 16. Get Project Statistics

Get detailed project statistics.

**Endpoint**: `GET /api/projects/stats`

**Access**: All authenticated users

**Query Parameters**:

- `projectId` (optional): Specific project
- `status` (optional): Filter by status
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "totalProjects": 12,
    "totalBudget": 5000000.0,
    "totalRaised": 3500000.0,
    "totalExpenses": 2800000.0,
    "totalBalance": 2200000.0,
    "averageProgress": "58.50",
    "fundingProgress": "70.00",
    "budgetUtilization": "56.00",
    "statusCounts": {
      "planning": 2,
      "active": 5,
      "onHold": 1,
      "completed": 3,
      "cancelled": 1
    },
    "statusBreakdown": {
      "PLANNING": {
        "count": 2,
        "percentage": "16.67"
      },
      "ACTIVE": {
        "count": 5,
        "percentage": "41.67"
      },
      "ON_HOLD": {
        "count": 1,
        "percentage": "8.33"
      },
      "COMPLETED": {
        "count": 3,
        "percentage": "25.00"
      },
      "CANCELLED": {
        "count": 1,
        "percentage": "8.33"
      }
    },
    "priorityBreakdown": {
      "LOW": 2,
      "MEDIUM": 5,
      "HIGH": 4,
      "URGENT": 1
    },
    "averages": {
      "budget": "416666.67",
      "raised": "291666.67",
      "expenses": "233333.33"
    }
  },
  "message": "Project statistics retrieved successfully"
}
```

---

## Common Use Cases

### 1. Create New Project

```javascript
POST /api/projects
{
  "name": "Library Expansion",
  "description": "Expand library with new reading area",
  "budget": 300000.00,
  "priority": "MEDIUM",
  "startDate": "2025-01-15T00:00:00Z",
  "endDate": "2025-06-30T00:00:00Z"
}
```

### 2. Record Multiple Expenses

```javascript
// Materials
POST /api/projects/1/expenses
{
  "title": "Construction Materials",
  "amount": 150000.00,
  "category": "Materials"
}

// Labor
POST /api/projects/1/expenses
{
  "title": "Construction Labor",
  "amount": 100000.00,
  "category": "Labor"
}
```

### 3. Update Project Progress

```javascript
PUT /api/projects/1
{
  "progressPercentage": 75,
  "status": "ACTIVE"
}
```

### 4. Post Milestone Update

```javascript
POST /api/projects/1/updates
{
  "title": "Foundation Complete",
  "content": "Foundation work completed ahead of schedule",
  "isMilestone": true,
  "isPublic": true
}
```

### 5. Complete Project

```javascript
PUT /api/projects/1
{
  "status": "COMPLETED",
  "progressPercentage": 100
}
```

### 6. Get Active Projects

```javascript
GET /api/projects?status=ACTIVE&sortBy=priority&sortOrder=desc
```

### 7. Search Projects

```javascript
GET /api/projects?search=renovation&status=ACTIVE
```

---

## Error Handling

Standard error response format:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message"
}
```

### Common Errors

- `400`: Expense exceeds budget, validation errors
- `401`: Not authenticated
- `403`: Not authorized (admin only)
- `404`: Project/expense/update not found
- `500`: Server error

---

## Integration with Other Modules

### Contributions Module

- Contributions can be linked to projects
- Raised funds calculated from contributions
- Update raised funds endpoint syncs data

### Users Module

- Projects created by admin users
- Creator details included in responses
- Authorization checks for modifications

---

## Best Practices

### Project Management

1. **Set realistic budgets** and timelines
2. **Choose appropriate priority** levels
3. **Update progress regularly**
4. **Complete project updates** for transparency

### Financial Tracking

1. **Record expenses promptly** with receipts
2. **Categorize expenses** properly
3. **Monitor budget utilization**
4. **Update raised funds** regularly

### Communication

1. **Post regular updates** for stakeholders
2. **Mark important milestones**
3. **Use public updates** for transparency
4. **Include photos/attachments** when possible

---

## Support

For API support, contact the development team or refer to README.md.

## Version

Current API Version: 1.0.0  
Last Updated: October 8, 2025
