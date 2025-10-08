# Penalties Management API Documentation

## Overview

The Penalties Management API provides comprehensive functionality for creating, tracking, and managing penalties for PTA members. It includes features for payment processing, payment status tracking, waiver management, reporting, and statistics.

## Features

- ✅ **Penalty Creation**: Create penalties for parents with meeting links
- ✅ **Payment Processing**: Record full or partial payments with multiple payment methods
- ✅ **Payment Methods**: CASH, BANK_TRANSFER, GCASH, PAYMAYA, CHECK, OTHER
- ✅ **Payment Status**: UNPAID, PARTIAL, PAID, WAIVED, OVERDUE
- ✅ **Due Date Management**: Track due dates and automatically mark overdue
- ✅ **Penalty Waivers**: Waive penalties with documented reasons
- ✅ **Discounts**: Apply discounts with reasons
- ✅ **Payment History**: Complete audit trail of all payments
- ✅ **Comprehensive Reports**: Generate detailed reports with statistics
- ✅ **Advanced Filtering**: Filter by parent, meeting, status, date range
- ✅ **Statistics & Analytics**: Payment rates, collection rates, status breakdowns

## Base URL

```
/api/penalties
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Penalty

Create a new penalty for a parent.

**Endpoint**: `POST /api/penalties`

**Access**: Admin only

**Request Body**:

```json
{
  "parentId": 5,
  "meetingId": 1,
  "amount": 100.0,
  "reason": "Absence from General PTA Meeting without prior notice",
  "dueDate": "2024-11-08T00:00:00Z",
  "discountAmount": 10.0,
  "discountReason": "First-time offender discount"
}
```

**Field Descriptions**:

- `parentId` (required): ID of the parent
- `meetingId` (optional): ID of the meeting (if penalty is meeting-related)
- `amount` (required): Penalty amount
- `reason` (required): Reason for the penalty (min 3, max 2000 characters)
- `dueDate` (optional): Due date for payment (defaults to 30 days from now)
- `discountAmount` (optional): Discount amount to apply
- `discountReason` (optional): Reason for discount

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "parentId": 5,
    "meetingId": 1,
    "amount": 100.0,
    "balance": 90.0,
    "reason": "Absence from General PTA Meeting without prior notice",
    "paymentStatus": "UNPAID",
    "isPaid": false,
    "amountPaid": 0,
    "dueDate": "2024-11-08T00:00:00Z",
    "isOverdue": false,
    "daysOverdue": 0,
    "discountAmount": 10.0,
    "discountReason": "First-time offender discount",
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
      "meetingType": "GENERAL"
    },
    "createdAt": "2024-10-08T00:00:00Z",
    "updatedAt": "2024-10-08T00:00:00Z"
  },
  "message": "Penalty created successfully"
}
```

**Error Responses**:

- `400`: Invalid parent role, discount exceeds amount, validation errors
- `404`: Parent or meeting not found
- `401`: Not authenticated
- `403`: Not authorized (not admin)

---

### 2. Get Penalties

Retrieve penalties with filtering and pagination.

**Endpoint**: `GET /api/penalties`

**Access**: All authenticated users

**Query Parameters**:

- `parentId` (optional): Filter by specific parent
- `meetingId` (optional): Filter by specific meeting
- `paymentStatus` (optional): Filter by status (UNPAID, PARTIAL, PAID, WAIVED, OVERDUE)
- `isPaid` (optional): Filter by paid status (true/false)
- `isOverdue` (optional): Filter by overdue status (true/false)
- `isWaived` (optional): Filter by waived status (true/false)
- `dateFrom` (optional): Filter from this date (ISO format)
- `dateTo` (optional): Filter until this date (ISO format)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 100): Items per page
- `sortBy` (optional, default: createdAt): Sort field (createdAt, amount, dueDate, balance)
- `sortOrder` (optional, default: desc): Sort order (asc, desc)

**Example Request**:

```
GET /api/penalties?parentId=5&paymentStatus=UNPAID&page=1&limit=20
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "penalties": [
      {
        "id": 1,
        "amount": 100.0,
        "balance": 90.0,
        "amountPaid": 0,
        "reason": "Absence from General PTA Meeting",
        "paymentStatus": "UNPAID",
        "isPaid": false,
        "isOverdue": false,
        "dueDate": "2024-11-08T00:00:00Z",
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
          "meetingType": "GENERAL",
          "venue": "School Auditorium"
        },
        "payments": [],
        "createdAt": "2024-10-08T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  },
  "message": "Penalties retrieved successfully"
}
```

---

### 3. Get Penalty by ID

Get detailed information about a specific penalty.

**Endpoint**: `GET /api/penalties/:id`

**Access**: All authenticated users

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "amount": 100.0,
    "balance": 40.0,
    "amountPaid": 60.0,
    "reason": "Absence from General PTA Meeting",
    "paymentStatus": "PARTIAL",
    "isPaid": false,
    "paidAt": null,
    "paymentMethod": "GCASH",
    "paymentReference": "GCASH-123456",
    "dueDate": "2024-11-08T00:00:00Z",
    "isOverdue": false,
    "daysOverdue": 0,
    "discountAmount": 0,
    "isWaived": false,
    "parent": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+639123456789"
    },
    "meeting": {
      "id": 1,
      "title": "General PTA Meeting",
      "description": "Discussion of school activities",
      "date": "2024-10-08T00:00:00Z",
      "startTime": "14:00",
      "venue": "School Auditorium",
      "meetingType": "GENERAL"
    },
    "payments": [
      {
        "id": 1,
        "amount": 60.0,
        "method": "GCASH",
        "reference": "GCASH-123456",
        "notes": "First installment",
        "recordedBy": 1,
        "createdAt": "2024-10-10T00:00:00Z"
      }
    ],
    "createdAt": "2024-10-08T00:00:00Z",
    "updatedAt": "2024-10-10T00:00:00Z"
  },
  "message": "Penalty retrieved successfully"
}
```

**Error Responses**:

- `404`: Penalty not found

---

### 4. Update Penalty

Update an existing penalty.

**Endpoint**: `PUT /api/penalties/:id`

**Access**: Admin only

**Request Body** (all fields optional):

```json
{
  "amount": 120.0,
  "reason": "Updated reason",
  "dueDate": "2024-11-15T00:00:00Z",
  "discountAmount": 20.0,
  "discountReason": "Updated discount"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "amount": 120.0,
    "balance": 100.0,
    "reason": "Updated reason",
    "dueDate": "2024-11-15T00:00:00Z",
    "discountAmount": 20.0,
    "parent": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "updatedAt": "2024-10-12T00:00:00Z"
  },
  "message": "Penalty updated successfully"
}
```

**Notes**:

- Cannot update paid or waived penalties
- Balance is automatically recalculated
- Overdue status is automatically updated
- At least one field must be provided

**Error Responses**:

- `404`: Penalty not found
- `400`: Cannot update paid/waived penalty, new balance would be negative

---

### 5. Delete Penalty

Delete a penalty (only if no payments have been made).

**Endpoint**: `DELETE /api/penalties/:id`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "Penalty deleted successfully"
  },
  "message": "Penalty deleted successfully"
}
```

**Error Responses**:

- `404`: Penalty not found
- `400`: Cannot delete penalty with payment history

---

### 6. Record Payment

Record a payment for a penalty (full or partial).

**Endpoint**: `POST /api/penalties/:id/payment`

**Access**: Admin only

**Request Body**:

```json
{
  "amount": 50.0,
  "method": "GCASH",
  "reference": "GCASH-789012",
  "notes": "Second installment payment"
}
```

**Field Descriptions**:

- `amount` (required): Payment amount
- `method` (required): Payment method (CASH, BANK_TRANSFER, GCASH, PAYMAYA, CHECK, OTHER)
- `reference` (optional): Payment reference number/transaction ID
- `notes` (optional): Additional payment notes

**Response** (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "payment": {
      "id": 2,
      "penaltyId": 1,
      "amount": 50.0,
      "method": "GCASH",
      "reference": "GCASH-789012",
      "notes": "Second installment payment",
      "recordedBy": 1,
      "createdAt": "2024-10-15T00:00:00Z"
    },
    "penalty": {
      "id": 1,
      "amount": 100.0,
      "amountPaid": 100.0,
      "balance": 0,
      "paymentStatus": "PAID",
      "isPaid": true,
      "paidAt": "2024-10-15T00:00:00Z",
      "parent": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "payments": [
        {
          "id": 1,
          "amount": 50.0,
          "method": "GCASH",
          "reference": "GCASH-123456",
          "createdAt": "2024-10-10T00:00:00Z"
        },
        {
          "id": 2,
          "amount": 50.0,
          "method": "GCASH",
          "reference": "GCASH-789012",
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
- Automatically updates payment status (PARTIAL or PAID)
- Creates payment audit record
- Marks penalty as paid when balance reaches zero

**Error Responses**:

- `404`: Penalty not found
- `400`: Already fully paid, payment exceeds balance, waived penalty

---

### 7. Waive Penalty

Waive a penalty (forgive the debt).

**Endpoint**: `POST /api/penalties/:id/waive`

**Access**: Admin only

**Request Body**:

```json
{
  "waiverReason": "Medical emergency - parent was hospitalized"
}
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "amount": 100.0,
    "balance": 0,
    "paymentStatus": "WAIVED",
    "isWaived": true,
    "waivedAt": "2024-10-12T00:00:00Z",
    "waivedBy": 1,
    "waiverReason": "Medical emergency - parent was hospitalized",
    "parent": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "Penalty waived successfully"
}
```

**Notes**:

- Sets balance to zero
- Marks penalty as waived
- Records who waived and when
- Cannot waive already paid penalties

**Error Responses**:

- `404`: Penalty not found
- `400`: Already paid or already waived

---

### 8. Update Overdue Status

Automatically update overdue status for all penalties past their due date.

**Endpoint**: `POST /api/penalties/update-overdue`

**Access**: Admin only

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "message": "15 penalties marked as overdue",
    "count": 15
  },
  "message": "15 penalties marked as overdue"
}
```

**Notes**:

- Scans all unpaid/partial penalties
- Marks those past due date as overdue
- Calculates days overdue
- Updates payment status to OVERDUE if unpaid

---

### 9. Generate Penalty Report

Generate comprehensive penalty reports with statistics.

**Endpoint**: `GET /api/penalties/report`

**Access**: Admin only

**Query Parameters** (all optional except dateFrom and dateTo):

- `parentId` (optional): Filter by specific parent
- `meetingId` (optional): Filter by specific meeting
- `paymentStatus` (optional): Filter by status
- `dateFrom` (required): Start date for report (ISO format)
- `dateTo` (required): End date for report (ISO format)
- `includeStats` (optional, default: true): Include statistics
- `groupBy` (optional): Group results by 'parent', 'meeting', or 'status'

**Example Request**:

```
GET /api/penalties/report?dateFrom=2024-01-01&dateTo=2024-12-31&includeStats=true&groupBy=parent
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
    "penalties": [
      {
        "id": 1,
        "amount": 100.0,
        "amountPaid": 100.0,
        "balance": 0,
        "paymentStatus": "PAID",
        "parent": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "meeting": {
          "id": 1,
          "title": "General PTA Meeting",
          "date": "2024-10-08T00:00:00Z",
          "meetingType": "GENERAL"
        },
        "payments": [
          {
            "id": 1,
            "amount": 100.0,
            "method": "GCASH",
            "createdAt": "2024-10-15T00:00:00Z"
          }
        ]
      }
    ],
    "statistics": {
      "totalPenalties": 150,
      "totalAmount": 15000.0,
      "totalPaid": 120,
      "totalUnpaid": 25,
      "totalWaived": 5,
      "totalOverdue": 15,
      "totalAmountPaid": 12000.0,
      "totalBalance": 3000.0,
      "paymentRate": "80.00",
      "statusBreakdown": {
        "UNPAID": 10,
        "PARTIAL": 15,
        "PAID": 120,
        "WAIVED": 5,
        "OVERDUE": 0
      }
    },
    "groupedData": [
      {
        "parent": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "penalties": [
          /* array of penalties */
        ],
        "totalAmount": 300.0,
        "totalPaid": 300.0,
        "totalBalance": 0
      }
    ]
  },
  "message": "Penalty report generated successfully"
}
```

**Report Features**:

- **Statistics**: Total penalties, amounts, payment rates
- **Status Breakdown**: Count by payment status
- **Grouping**: Group by parent (all penalties per parent), meeting (all penalties per meeting), or status
- **Date Range**: Flexible date range filtering

---

### 10. Get Penalty Statistics

Get detailed penalty statistics with optional filtering.

**Endpoint**: `GET /api/penalties/stats`

**Access**: All authenticated users

**Query Parameters** (all optional):

- `parentId` (optional): Statistics for specific parent
- `meetingId` (optional): Statistics for specific meeting
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)

**Example Request**:

```
GET /api/penalties/stats?dateFrom=2024-01-01&dateTo=2024-12-31
```

**Response** (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "totalPenalties": 150,
    "totalAmount": 15000.0,
    "totalAmountPaid": 12000.0,
    "totalBalance": 3000.0,
    "paymentRate": "80.00",
    "collectionRate": "80.00",
    "statusCounts": {
      "paid": 120,
      "unpaid": 10,
      "partial": 15,
      "waived": 5,
      "overdue": 0
    },
    "statusBreakdown": {
      "UNPAID": {
        "count": 10,
        "percentage": "6.67"
      },
      "PARTIAL": {
        "count": 15,
        "percentage": "10.00"
      },
      "PAID": {
        "count": 120,
        "percentage": "80.00"
      },
      "WAIVED": {
        "count": 5,
        "percentage": "3.33"
      },
      "OVERDUE": {
        "count": 0,
        "percentage": "0.00"
      }
    },
    "averages": {
      "penaltyAmount": "100.00",
      "paymentAmount": "80.00"
    }
  },
  "message": "Penalty statistics retrieved successfully"
}
```

**Statistics Included**:

- **Overall**: Total penalties, amounts, payment/collection rates
- **Status Counts**: Count for each payment status
- **Status Breakdown**: Count and percentage for each status
- **Averages**: Average penalty amount, average payment amount

---

## Payment Methods

### Available Payment Methods

- **CASH**: Physical cash payment
- **BANK_TRANSFER**: Bank transfer/deposit
- **GCASH**: GCash mobile wallet
- **PAYMAYA**: PayMaya mobile wallet
- **CHECK**: Check payment
- **OTHER**: Other payment methods

---

## Payment Status Types

### UNPAID

- No payment has been made
- Balance equals full penalty amount
- May be overdue if past due date

### PARTIAL

- Some payment has been made
- Balance is less than full amount but greater than zero
- Requires additional payment to complete

### PAID

- Full payment has been received
- Balance is zero
- Payment date recorded

### WAIVED

- Penalty has been forgiven
- Balance set to zero
- Waiver reason and date recorded

### OVERDUE

- Past due date with unpaid/partial balance
- Days overdue calculated automatically
- Requires immediate attention

---

## Common Use Cases

### 1. Create Penalty from Attendance

```javascript
// After recording absence in attendance
POST /api/penalties
{
  "parentId": 5,
  "meetingId": 1,
  "amount": 50.00,
  "reason": "Absence from meeting without prior notice"
}
```

### 2. Record Full Payment

```javascript
POST /api/penalties/1/payment
{
  "amount": 50.00,
  "method": "GCASH",
  "reference": "GCASH-123456"
}
```

### 3. Record Partial Payment (Installment)

```javascript
// First payment
POST /api/penalties/1/payment
{
  "amount": 25.00,
  "method": "CASH",
  "notes": "First installment"
}

// Later: Second payment
POST /api/penalties/1/payment
{
  "amount": 25.00,
  "method": "CASH",
  "notes": "Final installment"
}
```

### 4. Waive Penalty with Valid Reason

```javascript
POST /api/penalties/1/waive
{
  "waiverReason": "Parent had medical emergency - hospital confinement"
}
```

### 5. Generate Monthly Penalty Report

```javascript
GET /api/penalties/report?dateFrom=2024-10-01&dateTo=2024-10-31&groupBy=status
```

### 6. Check Parent's Outstanding Penalties

```javascript
GET /api/penalties?parentId=5&paymentStatus=UNPAID&sortBy=dueDate&sortOrder=asc
```

### 7. Update Overdue Penalties (Daily Cron Job)

```javascript
POST / api / penalties / update - overdue;
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

### Attendance Module

- Penalties automatically created from attendance records
- Penalty amounts from system settings
- Meeting links maintained

### Settings Module

- `penaltyRatePerAbsence`: Default amount for absences
- `penaltyRateLate`: Default amount for late arrivals
- `paymentDueDays`: Default days until due date

### Users Module

- Parent verification before creating penalties
- Parent details included in responses
- Admin authorization for modifications

### Meetings Module

- Optional meeting links for context
- Meeting details included in reports

---

## Best Practices

### Payment Processing

1. **Always verify payment before recording**
2. **Keep payment references** for audit trail
3. **Record payments promptly** to maintain accuracy
4. **Use appropriate payment method** for tracking

### Penalty Management

1. **Provide clear reasons** for penalties
2. **Set realistic due dates**
3. **Apply discounts fairly** with documented reasons
4. **Review waivers carefully** before approving

### Reporting

1. **Generate reports regularly** for insights
2. **Monitor overdue penalties** proactively
3. **Track payment rates** to improve collection
4. **Use grouping** for better analysis

---

## Future Enhancements

- [ ] Email notifications for new penalties
- [ ] SMS reminders for due dates
- [ ] Automatic payment reminders
- [ ] Payment plan/installment agreements
- [ ] Online payment integration
- [ ] Receipt generation (PDF)
- [ ] Payment confirmation emails
- [ ] Bulk penalty creation
- [ ] Penalty appeals system
- [ ] Payment gateway integration

---

## Support

For API support or questions, contact the development team or refer to the main README.md file.

## Version

Current API Version: 1.0.0
Last Updated: October 8, 2024
