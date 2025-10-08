# Contributions Management - Complete Testing Guide

## 🎯 Overview

This guide provides step-by-step instructions for testing all **11 Contributions Management endpoints** using Postman or similar API testing tools.

**Status**: ✅ **FULLY IMPLEMENTED & READY FOR TESTING**

---

## 📋 Pre-Testing Setup

### 1. Start the Server

```powershell
npm run dev
```

### 2. Get Authentication Token

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

Save the returned JWT token for all subsequent requests.

### 3. Set Authorization Header

For all requests below, include:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🧪 Testing Endpoints

### **1. Create Contribution** ✅

**Test financial contribution tracking**

```http
POST http://localhost:3000/api/contributions
Content-Type: application/json
Authorization: Bearer <token>

{
  "parentId": 2,
  "type": "MONTHLY",
  "title": "Monthly Contribution - November 2024",
  "description": "Regular monthly PTA contribution",
  "amount": 100.00,
  "dueDate": "2024-11-30T00:00:00Z",
  "academicYear": "2024-2025",
  "period": "November"
}
```

**Expected Response** (201):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "parentId": 2,
    "type": "MONTHLY",
    "title": "Monthly Contribution - November 2024",
    "amount": 100.0,
    "amountPaid": 0,
    "balance": 100.0,
    "status": "PENDING",
    "isPaid": false,
    "isOverdue": false,
    "parent": {
      "id": 2,
      "name": "Parent Name",
      "email": "parent@example.com"
    }
  },
  "message": "Contribution created successfully"
}
```

**Test Cases:**

- ✅ Create monthly contribution
- ✅ Create project-specific contribution
- ✅ Create with adjustment amount
- ✅ Create without due date (defaults to 30 days)
- ❌ Create with invalid parent ID (404)
- ❌ Create with negative amount (400)

---

### **2. Create Project Contribution** ✅

**Link contribution to specific project**

```http
POST http://localhost:3000/api/contributions
Content-Type: application/json
Authorization: Bearer <token>

{
  "parentId": 2,
  "projectId": 1,
  "type": "PROJECT",
  "title": "School Renovation - Phase 1",
  "description": "Contribution for classroom renovation",
  "amount": 500.00,
  "dueDate": "2024-12-15T00:00:00Z"
}
```

**Test Cases:**

- ✅ Link to existing project
- ❌ Link to non-existent project (404)

---

### **3. Create Contribution with Adjustment** ✅

**Test discount/waiver partial amounts**

```http
POST http://localhost:3000/api/contributions
Content-Type: application/json
Authorization: Bearer <token>

{
  "parentId": 2,
  "type": "MONTHLY",
  "title": "Monthly Contribution - Discounted",
  "amount": 100.00,
  "adjustmentAmount": 20.00,
  "adjustmentReason": "Financial hardship - 20% discount approved",
  "dueDate": "2024-11-30T00:00:00Z"
}
```

**Expected**: Balance should be 80.00 (100 - 20)

**Test Cases:**

- ✅ Adjustment less than amount
- ❌ Adjustment exceeds amount (400)

---

### **4. Get All Contributions** ✅

**Test filtering and pagination**

```http
GET http://localhost:3000/api/contributions?page=1&limit=10
Authorization: Bearer <token>
```

**With Filters:**

```http
GET http://localhost:3000/api/contributions?type=MONTHLY&status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

**Advanced Filters:**

```http
GET http://localhost:3000/api/contributions?parentId=2&academicYear=2024-2025&isOverdue=false&sortBy=dueDate&sortOrder=asc
Authorization: Bearer <token>
```

**Test Cases:**

- ✅ Get all contributions
- ✅ Filter by parent
- ✅ Filter by project
- ✅ Filter by type (MONTHLY, PROJECT, SPECIAL, etc.)
- ✅ Filter by status (PENDING, PARTIAL, PAID, OVERDUE, WAIVED)
- ✅ Filter by academic year
- ✅ Filter by date range
- ✅ Pagination (page 1, 2, 3...)
- ✅ Sorting (by amount, dueDate, createdAt)

---

### **5. Get Contribution by ID** ✅

**Retrieve detailed contribution information**

```http
GET http://localhost:3000/api/contributions/1
Authorization: Bearer <token>
```

**Expected Response** (200):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "parentId": 2,
    "type": "MONTHLY",
    "title": "Monthly Contribution - November 2024",
    "amount": 100.00,
    "amountPaid": 0,
    "balance": 100.00,
    "status": "PENDING",
    "parent": {...},
    "project": null,
    "payments": []
  },
  "message": "Contribution retrieved successfully"
}
```

**Test Cases:**

- ✅ Get existing contribution
- ❌ Get non-existent contribution (404)

---

### **6. Update Contribution** ✅

**Modify unpaid contributions**

```http
PUT http://localhost:3000/api/contributions/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "amount": 120.00,
  "dueDate": "2024-12-15T00:00:00Z"
}
```

**Test Cases:**

- ✅ Update title, description
- ✅ Update amount (balance recalculated)
- ✅ Update due date
- ✅ Update adjustment amount
- ❌ Update paid contribution (400)
- ❌ Update waived contribution (400)

---

### **7. Record Payment** ✅

**Test payment processing**

**Full Payment:**

```http
POST http://localhost:3000/api/contributions/1/payment
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 100.00,
  "method": "CASH",
  "reference": "OR-2024-001",
  "notes": "Paid in full via cash"
}
```

**Expected Response** (201):

```json
{
  "statusCode": 201,
  "data": {
    "payment": {
      "id": 1,
      "contributionId": 1,
      "amount": 100.0,
      "method": "CASH",
      "reference": "OR-2024-001"
    },
    "contribution": {
      "id": 1,
      "amountPaid": 100.0,
      "balance": 0,
      "isPaid": true,
      "status": "PAID",
      "paidAt": "2024-11-08T..."
    }
  },
  "message": "Payment recorded successfully"
}
```

**Partial Payment:**

```http
POST http://localhost:3000/api/contributions/2/payment
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 50.00,
  "method": "GCASH",
  "reference": "GCH-123456789",
  "notes": "Partial payment - 1st installment"
}
```

**Expected**: Status changes to "PARTIAL", balance reduced

**Test Cases:**

- ✅ Full payment (status → PAID)
- ✅ Partial payment (status → PARTIAL)
- ✅ Multiple partial payments
- ✅ Different payment methods (CASH, BANK_TRANSFER, GCASH, PAYMAYA, CHECK, OTHER)
- ❌ Payment exceeds balance (400)
- ❌ Payment on fully paid contribution (400)
- ❌ Payment on waived contribution (400)

---

### **8. Waive Contribution** ✅

**Test waiver system**

```http
POST http://localhost:3000/api/contributions/1/waive
Content-Type: application/json
Authorization: Bearer <token>

{
  "waiverReason": "Financial hardship due to family emergency. Board approved waiver."
}
```

**Expected Response** (200):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "isWaived": true,
    "waivedAt": "2024-11-08T...",
    "waivedBy": 1,
    "waiverReason": "Financial hardship...",
    "balance": 0,
    "status": "WAIVED"
  },
  "message": "Contribution waived successfully"
}
```

**Test Cases:**

- ✅ Waive unpaid contribution
- ✅ Waive partially paid contribution
- ❌ Waive fully paid contribution (400)
- ❌ Waive already waived contribution (400)
- ❌ Waive without reason (400)

---

### **9. Update Overdue Status** ✅

**Batch update overdue contributions**

```http
POST http://localhost:3000/api/contributions/update-overdue
Authorization: Bearer <token>
```

**Expected Response** (200):

```json
{
  "statusCode": 200,
  "data": {
    "message": "5 contributions marked as overdue",
    "count": 5
  },
  "message": "5 contributions marked as overdue"
}
```

**Test Cases:**

- ✅ Mark overdue contributions
- ✅ Calculate days overdue
- ✅ Update status to OVERDUE

---

### **10. Generate Contribution Report** ✅

**Comprehensive financial reports**

**Basic Report:**

```http
GET http://localhost:3000/api/contributions/report?dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

**Filtered Report:**

```http
GET http://localhost:3000/api/contributions/report?dateFrom=2024-01-01&dateTo=2024-12-31&type=MONTHLY&status=PAID&includeStats=true
Authorization: Bearer <token>
```

**Grouped Report:**

```http
GET http://localhost:3000/api/contributions/report?dateFrom=2024-01-01&dateTo=2024-12-31&groupBy=parent
Authorization: Bearer <token>
```

**Expected Response** (200):

```json
{
  "statusCode": 200,
  "data": {
    "dateRange": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    },
    "totalRecords": 150,
    "contributions": [...],
    "statistics": {
      "totalContributions": 150,
      "totalAmount": 15000.00,
      "totalPaid": 120,
      "totalPending": 20,
      "totalPartial": 5,
      "totalWaived": 5,
      "totalOverdue": 10,
      "totalAmountPaid": 12500.00,
      "totalBalance": 2500.00,
      "collectionRate": "83.33",
      "statusBreakdown": {...}
    }
  },
  "message": "Contribution report generated successfully"
}
```

**Test Cases:**

- ✅ Generate report for date range
- ✅ Filter by parent, project, type, status
- ✅ Include statistics
- ✅ Group by parent
- ✅ Group by project
- ✅ Group by type
- ✅ Group by status
- ❌ Missing required dates (400)

---

### **11. Get Contribution Statistics** ✅

**Analytics and insights**

**Overall Stats:**

```http
GET http://localhost:3000/api/contributions/stats
Authorization: Bearer <token>
```

**Filtered Stats:**

```http
GET http://localhost:3000/api/contributions/stats?academicYear=2024-2025&type=MONTHLY
Authorization: Bearer <token>
```

**Expected Response** (200):

```json
{
  "statusCode": 200,
  "data": {
    "totalContributions": 150,
    "totalAmount": 15000.00,
    "totalAmountPaid": 12500.00,
    "totalBalance": 2500.00,
    "collectionRate": "83.33",
    "statusCounts": {
      "paid": 120,
      "pending": 20,
      "partial": 5,
      "waived": 5,
      "overdue": 10
    },
    "statusBreakdown": {
      "PAID": {
        "count": 120,
        "percentage": "80.00"
      },
      "PENDING": {...},
      "PARTIAL": {...}
    },
    "typeBreakdown": {
      "MONTHLY": 100,
      "PROJECT": 30,
      "SPECIAL": 20
    },
    "averages": {
      "contributionAmount": "100.00",
      "paymentAmount": "83.33"
    }
  },
  "message": "Contribution statistics retrieved successfully"
}
```

**Test Cases:**

- ✅ Get overall statistics
- ✅ Filter by parent
- ✅ Filter by project
- ✅ Filter by type
- ✅ Filter by academic year
- ✅ Filter by date range

---

## 🔄 Integration Testing

### **Scenario 1: Complete Contribution Lifecycle**

1. **Create contribution**

   ```
   POST /api/contributions
   ```

2. **Verify creation**

   ```
   GET /api/contributions/1
   ```

3. **Record partial payment**

   ```
   POST /api/contributions/1/payment
   Amount: 50.00
   ```

4. **Check status** (Should be PARTIAL)

   ```
   GET /api/contributions/1
   ```

5. **Record final payment**

   ```
   POST /api/contributions/1/payment
   Amount: 50.00
   ```

6. **Verify paid status** (Should be PAID)
   ```
   GET /api/contributions/1
   ```

---

### **Scenario 2: Project-Linked Contribution**

1. **Create project** (if not exists)

   ```
   POST /api/projects
   ```

2. **Create contribution linked to project**

   ```
   POST /api/contributions
   {
     "projectId": 1,
     "type": "PROJECT",
     ...
   }
   ```

3. **Record payment**

   ```
   POST /api/contributions/2/payment
   ```

4. **Update project raised funds**

   ```
   POST /api/projects/1/update-raised
   ```

5. **Verify project financials**
   ```
   GET /api/projects/1
   ```

---

### **Scenario 3: Waiver Process**

1. **Create contribution**
2. **Record partial payment** (optional)
3. **Waive remaining balance**
   ```
   POST /api/contributions/1/waive
   {
     "waiverReason": "Board approved waiver"
   }
   ```
4. **Verify waived status**

---

### **Scenario 4: Overdue Management**

1. **Create contribution with past due date**

   ```
   POST /api/contributions
   {
     "dueDate": "2024-10-01T00:00:00Z"
   }
   ```

2. **Run overdue update**

   ```
   POST /api/contributions/update-overdue
   ```

3. **Check overdue status**
   ```
   GET /api/contributions?isOverdue=true
   ```

---

## 📊 Testing Checklist

### **Create Operations** ✅

- [ ] Create monthly contribution
- [ ] Create project contribution
- [ ] Create with adjustment
- [ ] Create for multiple parents
- [ ] Validate parent exists
- [ ] Validate project exists
- [ ] Calculate balance correctly

### **Read Operations** ✅

- [ ] Get all contributions
- [ ] Get by parent
- [ ] Get by project
- [ ] Get by type
- [ ] Get by status
- [ ] Get overdue only
- [ ] Pagination works
- [ ] Sorting works
- [ ] Get contribution by ID
- [ ] Include related data (parent, project, payments)

### **Update Operations** ✅

- [ ] Update title/description
- [ ] Update amount (balance recalculates)
- [ ] Update due date
- [ ] Update adjustment
- [ ] Cannot update paid contribution
- [ ] Cannot update waived contribution

### **Payment Operations** ✅

- [ ] Record full payment
- [ ] Record partial payment
- [ ] Multiple partial payments
- [ ] All payment methods work
- [ ] Balance updates correctly
- [ ] Status changes (PENDING → PARTIAL → PAID)
- [ ] Payment history tracked
- [ ] Cannot overpay
- [ ] Cannot pay waived contribution

### **Waiver Operations** ✅

- [ ] Waive unpaid contribution
- [ ] Waive partially paid
- [ ] Reason required
- [ ] Balance set to 0
- [ ] Status changes to WAIVED
- [ ] Cannot waive paid
- [ ] Cannot waive twice

### **Reporting** ✅

- [ ] Generate report with date range
- [ ] Filter by multiple criteria
- [ ] Include statistics
- [ ] Group by parent
- [ ] Group by project
- [ ] Group by type
- [ ] Group by status

### **Statistics** ✅

- [ ] Overall stats calculated correctly
- [ ] Collection rate accurate
- [ ] Status breakdown correct
- [ ] Type breakdown correct
- [ ] Filtered stats work

### **Edge Cases** ✅

- [ ] Empty results handled
- [ ] Invalid IDs return 404
- [ ] Invalid dates return 400
- [ ] Unauthorized access blocked
- [ ] Admin-only routes protected

---

## 🔐 Authorization Testing

### **Admin Routes** (Require ADMIN role)

- ✅ POST /api/contributions (create)
- ✅ PUT /api/contributions/:id (update)
- ✅ DELETE /api/contributions/:id (delete)
- ✅ POST /api/contributions/:id/payment (record payment)
- ✅ POST /api/contributions/:id/waive (waive)
- ✅ POST /api/contributions/update-overdue
- ✅ GET /api/contributions/report

### **All User Routes**

- ✅ GET /api/contributions (list)
- ✅ GET /api/contributions/:id (view)
- ✅ GET /api/contributions/stats

**Test**: Try accessing admin routes as PARENT user (should return 403)

---

## 💡 Tips for Testing

1. **Use Environment Variables in Postman**

   - Set `{{baseUrl}}` = `http://localhost:3000`
   - Set `{{token}}` = Your JWT token
   - Set `{{parentId}}` = Test parent ID

2. **Create Test Data**

   - Create 2-3 parent users
   - Create 2-3 projects
   - Create 10-15 contributions with various types/statuses

3. **Test Sequentially**

   - Follow the scenarios above in order
   - Verify each step before proceeding

4. **Check Database**

   - Use Prisma Studio to verify data
   - Check payment records
   - Verify balance calculations

5. **Test Error Cases**
   - Don't only test happy paths
   - Try invalid data, missing fields, wrong IDs

---

## 🎉 Success Criteria

**Contributions Management is working perfectly if:**

✅ All 11 endpoints return correct status codes  
✅ CRUD operations work flawlessly  
✅ Payment processing updates balances correctly  
✅ Status transitions work (PENDING → PARTIAL → PAID)  
✅ Waiver system functions properly  
✅ Reports generate accurate statistics  
✅ Filtering and pagination work  
✅ Authorization checks prevent unauthorized access  
✅ Integration with Projects module works  
✅ All validation catches invalid data

---

## 📞 Need Help?

If you encounter issues:

1. Check server logs for errors
2. Verify database schema matches Prisma schema
3. Ensure JWT token is valid
4. Review API documentation in CONTRIBUTIONS_API_DOCS.md

---

**Testing Status**: Ready for comprehensive testing!  
**Last Updated**: October 9, 2024  
**Version**: 1.0.0
