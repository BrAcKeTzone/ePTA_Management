# Contributions Management API Documentation

## Overview

The Contributions Management API provides comprehensive functionality for tracking financial contributions from PTA members. It includes features for payment processing, waiver management, academic year tracking, and detailed reporting.

## Features

- ✅ **Contribution Tracking**: Create and manage contributions with 6 types
- ✅ **Payment Processing**: Record full or partial payments with 6 payment methods
- ✅ **Payment Status**: Track PENDING, PARTIAL, PAID, OVERDUE, WAIVED
- ✅ **Academic Tracking**: Link contributions to academic years and periods
- ✅ **Project Linking**: Associate contributions with specific projects
- ✅ **Waiver System**: Waive contributions with documented reasons
- ✅ **Adjustments**: Apply adjustments/discounts with reasons
- ✅ **Payment History**: Complete audit trail of all payments
- ✅ **Comprehensive Reports**: Generate detailed reports with statistics
- ✅ **Advanced Filtering**: Filter by parent, project, type, status, academic year

## Base URL

```
/api/contributions
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Contribution Types

- **MONTHLY**: Regular monthly contribution
- **PROJECT**: Project-specific contribution
- **SPECIAL**: Special fundraising
- **DONATION**: Voluntary donation
- **MEMBERSHIP**: Membership fee
- **EVENT**: Event-specific contribution

## Contribution Status

- **PENDING**: Awaiting payment
- **PARTIAL**: Partially paid
- **PAID**: Fully paid
- **OVERDUE**: Past due date with unpaid balance
- **WAIVED**: Contribution waived/forgiven

## Payment Methods

- **CASH**: Physical cash payment
- **BANK_TRANSFER**: Bank transfer/deposit
- **GCASH**: GCash mobile wallet
- **PAYMAYA**: PayMaya mobile wallet
- **CHECK**: Check payment
- **OTHER**: Other payment methods

## Endpoints

### 1. Create Contribution

Create a new contribution for a parent.

**Endpoint**: `POST /api/contributions`

**Access**: Admin only

**Request Body**:

```json
{
  "parentId": 5,
  "projectId": 1,
  "type": "MONTHLY",
  "title": "Monthly PTA Contribution - October 2024",
  "description": "Regular monthly contribution for October",
  "amount": 200.0,
  "dueDate": "2024-10-31T00:00:00Z",
  "academicYear": "2024-2025",
  "period": "October",
  "adjustmentAmount": 20.0,
  "adjustmentReason": "Multiple children discount"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "parentId": 5,
    "projectId": 1,
    "type": "MONTHLY",
    "title": "Monthly PTA Contribution - October 2024",
    "description": "Regular monthly contribution for October",
    "amount": 200.0,
    "balance": 180.0,
    "amountPaid": 0,
    "status": "PENDING",
    "isPaid": false,
    "dueDate": "2024-10-31T00:00:00Z",
    "isOverdue": false,
    "academicYear": "2024-2025",
    "period": "October",
    "adjustmentAmount": 20.0,
    "adjustmentReason": "Multiple children discount",
    "parent": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+639123456789"
    },
    "project": {
      "id": 1,
      "name": "School Renovation Project",
      "description": "Renovation of school facilities",
      "budget": 500000.0
    },
    "createdAt": "2024-10-01T00:00:00Z",
    "updatedAt": "2024-10-01T00:00:00Z"
  },
  "message": "Contribution created successfully"
}
```

---

### 2. Get Contributions

Retrieve contributions with filtering and pagination.

**Endpoint**: `GET /api/contributions`

**Access**: All authenticated users

**Query Parameters**:

- `parentId` (optional): Filter by specific parent
- `projectId` (optional): Filter by specific project
- `type` (optional): Filter by type
- `status` (optional): Filter by status
- `isPaid` (optional): Filter by paid status (true/false)
- `isOverdue` (optional): Filter by overdue status (true/false)
- `isWaived` (optional): Filter by waived status (true/false)
- `academicYear` (optional): Filter by academic year
- `period` (optional): Filter by period
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 100): Items per page
- `sortBy` (optional, default: createdAt): Sort field
- `sortOrder` (optional, default: desc): Sort order (asc, desc)

**Example**: `GET /api/contributions?parentId=5&type=MONTHLY&page=1&limit=20`

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "contributions": [
      {
        "id": 1,
        "type": "MONTHLY",
        "title": "Monthly PTA Contribution - October 2024",
        "amount": 200.0,
        "balance": 180.0,
        "amountPaid": 0,
        "status": "PENDING",
        "isPaid": false,
        "dueDate": "2024-10-31T00:00:00Z",
        "academicYear": "2024-2025",
        "period": "October",
        "parent": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "project": {
          "id": 1,
          "name": "School Renovation Project"
        },
        "payments": [],
        "createdAt": "2024-10-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  },
  "message": "Contributions retrieved successfully"
}
```

---

### 3. Get Contribution by ID

Get detailed information about a specific contribution.

**Endpoint**: `GET /api/contributions/:id`

**Access**: All authenticated users

**Response** (200 OK): Similar to create response with full payment history

---

### 4. Update Contribution

Update an existing contribution.

**Endpoint**: `PUT /api/contributions/:id`

**Access**: Admin only

**Request Body** (all fields optional):

```json
{
  "title": "Updated title",
  "amount": 250.0,
  "dueDate": "2024-11-15T00:00:00Z",
  "adjustmentAmount": 30.0,
  "adjustmentReason": "Updated discount"
}
```

**Notes**:

- Cannot update paid or waived contributions
- Balance is automatically recalculated
- Overdue status is automatically updated

---

### 5. Delete Contribution

Delete a contribution (only if no payments have been made).

**Endpoint**: `DELETE /api/contributions/:id`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Contribution deleted successfully"
  },
  "message": "Contribution deleted successfully"
}
```

---

### 6. Record Payment

Record a payment for a contribution (full or partial).

**Endpoint**: `POST /api/contributions/:id/payment`

**Access**: Admin only

**Request Body**:

```json
{
  "amount": 100.0,
  "method": "GCASH",
  "reference": "GCASH-123456789",
  "notes": "First installment payment"
}
```

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "payment": {
      "id": 1,
      "contributionId": 1,
      "amount": 100.0,
      "method": "GCASH",
      "reference": "GCASH-123456789",
      "notes": "First installment payment",
      "recordedBy": 1,
      "createdAt": "2024-10-15T00:00:00Z"
    },
    "contribution": {
      "id": 1,
      "amount": 200.0,
      "amountPaid": 100.0,
      "balance": 80.0,
      "status": "PARTIAL",
      "isPaid": false,
      "payments": [
        {
          "id": 1,
          "amount": 100.0,
          "method": "GCASH",
          "createdAt": "2024-10-15T00:00:00Z"
        }
      ]
    }
  },
  "message": "Payment recorded successfully"
}
```

**Notes**:

- Supports partial payments
- Automatically updates payment status
- Creates payment audit record
- Marks as paid when balance reaches zero

---

### 7. Waive Contribution

Waive a contribution (forgive the debt).

**Endpoint**: `POST /api/contributions/:id/waive`

**Access**: Admin only

**Request Body**:

```json
{
  "waiverReason": "Parent facing financial hardship due to medical emergency"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "amount": 200.0,
    "balance": 0,
    "status": "WAIVED",
    "isWaived": true,
    "waivedAt": "2024-10-12T00:00:00Z",
    "waivedBy": 1,
    "waiverReason": "Parent facing financial hardship due to medical emergency"
  },
  "message": "Contribution waived successfully"
}
```

---

### 8. Update Overdue Status

Automatically update overdue status for all contributions past their due date.

**Endpoint**: `POST /api/contributions/update-overdue`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "12 contributions marked as overdue",
    "count": 12
  },
  "message": "12 contributions marked as overdue"
}
```

---

### 9. Generate Contribution Report

Generate comprehensive contribution reports with statistics.

**Endpoint**: `GET /api/contributions/report`

**Access**: Admin only

**Query Parameters**:

- `parentId` (optional): Filter by parent
- `projectId` (optional): Filter by project
- `type` (optional): Filter by type
- `status` (optional): Filter by status
- `academicYear` (optional): Filter by academic year
- `period` (optional): Filter by period
- `dateFrom` (required): Start date
- `dateTo` (required): End date
- `includeStats` (optional, default: true): Include statistics
- `groupBy` (optional): Group by parent, project, type, or status

**Example**: `GET /api/contributions/report?dateFrom=2024-01-01&dateTo=2024-12-31&groupBy=type`

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "dateRange": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-12-31T23:59:59Z"
    },
    "totalRecords": 250,
    "contributions": [...],
    "statistics": {
      "totalContributions": 250,
      "totalAmount": 50000.00,
      "totalAmountPaid": 42000.00,
      "totalBalance": 8000.00,
      "collectionRate": "84.00",
      "statusBreakdown": {
        "PENDING": 30,
        "PARTIAL": 20,
        "PAID": 190,
        "WAIVED": 8,
        "OVERDUE": 2
      }
    },
    "groupedData": [
      {
        "type": "MONTHLY",
        "contributions": [...],
        "totalAmount": 40000.00,
        "totalPaid": 35000.00,
        "totalBalance": 5000.00
      },
      {
        "type": "PROJECT",
        "contributions": [...],
        "totalAmount": 10000.00,
        "totalPaid": 7000.00,
        "totalBalance": 3000.00
      }
    ]
  },
  "message": "Contribution report generated successfully"
}
```

---

### 10. Get Contribution Statistics

Get detailed contribution statistics with optional filtering.

**Endpoint**: `GET /api/contributions/stats`

**Access**: All authenticated users

**Query Parameters**:

- `parentId` (optional): Statistics for specific parent
- `projectId` (optional): Statistics for specific project
- `type` (optional): Filter by type
- `academicYear` (optional): Filter by academic year
- `period` (optional): Filter by period
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "totalContributions": 250,
    "totalAmount": 50000.0,
    "totalAmountPaid": 42000.0,
    "totalBalance": 8000.0,
    "collectionRate": "84.00",
    "statusCounts": {
      "paid": 190,
      "pending": 30,
      "partial": 20,
      "waived": 8,
      "overdue": 2
    },
    "statusBreakdown": {
      "PENDING": {
        "count": 30,
        "percentage": "12.00"
      },
      "PARTIAL": {
        "count": 20,
        "percentage": "8.00"
      },
      "PAID": {
        "count": 190,
        "percentage": "76.00"
      },
      "WAIVED": {
        "count": 8,
        "percentage": "3.20"
      },
      "OVERDUE": {
        "count": 2,
        "percentage": "0.80"
      }
    },
    "typeBreakdown": {
      "MONTHLY": 200,
      "PROJECT": 30,
      "SPECIAL": 15,
      "DONATION": 5
    },
    "averages": {
      "contributionAmount": "200.00",
      "paymentAmount": "168.00"
    }
  },
  "message": "Contribution statistics retrieved successfully"
}
```

---

## Common Use Cases

### 1. Create Monthly Contribution

```javascript
POST /api/contributions
{
  "parentId": 5,
  "type": "MONTHLY",
  "title": "Monthly Contribution - October 2024",
  "amount": 200.00,
  "academicYear": "2024-2025",
  "period": "October",
  "dueDate": "2024-10-31T00:00:00Z"
}
```

### 2. Create Project Contribution

```javascript
POST /api/contributions
{
  "parentId": 5,
  "projectId": 1,
  "type": "PROJECT",
  "title": "School Renovation Fund",
  "amount": 500.00,
  "dueDate": "2024-11-30T00:00:00Z"
}
```

### 3. Record Full Payment

```javascript
POST /api/contributions/1/payment
{
  "amount": 180.00,
  "method": "GCASH",
  "reference": "GCASH-123456"
}
```

### 4. Record Partial Payment (Installment)

```javascript
// First installment
POST /api/contributions/1/payment
{
  "amount": 90.00,
  "method": "CASH",
  "notes": "First installment"
}

// Second installment
POST /api/contributions/1/payment
{
  "amount": 90.00,
  "method": "CASH",
  "notes": "Final installment"
}
```

### 5. Waive Contribution

```javascript
POST /api/contributions/1/waive
{
  "waiverReason": "Financial hardship - parent lost job"
}
```

### 6. Get Parent's Outstanding Contributions

```javascript
GET /api/contributions?parentId=5&status=PENDING&sortBy=dueDate&sortOrder=asc
```

### 7. Get Project Contributions

```javascript
GET /api/contributions?projectId=1&type=PROJECT
```

### 8. Generate Monthly Report

```javascript
GET /api/contributions/report?dateFrom=2024-10-01&dateTo=2024-10-31&academicYear=2024-2025&period=October
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

---

## Integration with Other Modules

### Projects Module

- Contributions can be linked to specific projects
- Project raised funds calculated from contributions
- Project reports include contribution data

### Settings Module

- Default contribution amounts from settings
- Payment methods configured in settings
- Due date defaults from settings

### Users Module

- Parent verification before creating contributions
- Parent details included in responses
- Admin authorization for modifications

---

## Best Practices

### Contribution Management

1. **Set realistic due dates** for parents
2. **Use appropriate contribution types** for tracking
3. **Apply adjustments fairly** with documented reasons
4. **Track academic years and periods** for reporting

### Payment Processing

1. **Always verify payment before recording**
2. **Keep payment references** for audit trail
3. **Record payments promptly** to maintain accuracy
4. **Use appropriate payment method** for tracking

### Waiver System

1. **Document reasons clearly** for waivers
2. **Review waivers carefully** before approving
3. **Track waiver patterns** for policy decisions

### Reporting

1. **Generate reports regularly** for insights
2. **Monitor collection rates** to improve efficiency
3. **Track by academic year** for annual planning
4. **Use grouping** for better analysis

---

## Support

For API support or questions, contact the development team or refer to the main README.md file.

## Version

Current API Version: 1.0.0  
Last Updated: October 8, 2025
