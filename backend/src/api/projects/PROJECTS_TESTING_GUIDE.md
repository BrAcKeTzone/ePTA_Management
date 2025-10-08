# Projects Management Testing Guide

## 🎯 Overview

This guide provides comprehensive testing scenarios for the Projects Management system including:

- ✅ Project lifecycle management (CRUD operations)
- ✅ Budget tracking and financial management
- ✅ Expense recording and management
- ✅ Project updates and milestones
- ✅ Integration with Contributions module
- ✅ Reporting and statistics

---

## 📋 Prerequisites

### 1. Server Setup

```bash
# Ensure database is running and migrations are applied
npx prisma db push

# Start the development server
npm run dev
```

### 2. Authentication

All endpoints require authentication. First, obtain a JWT token:

**Login as Admin:**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Save the token from response:**

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

**Use token in all subsequent requests:**

```
Authorization: Bearer <your_access_token>
```

---

## 🧪 Test Scenarios

### **Scenario 1: Create a New Project**

Test the complete project creation workflow.

#### Request:

```http
POST http://localhost:3000/api/projects
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "School Library Expansion Project",
  "description": "Expansion of the school library to accommodate more students and resources. Will include new reading areas, computer stations, and study rooms.",
  "budget": 500000.00,
  "fundingGoal": 600000.00,
  "targetBeneficiaries": 1500,
  "priority": "HIGH",
  "startDate": "2024-11-01T00:00:00Z",
  "endDate": "2025-06-30T00:00:00Z",
  "location": "JHCSC Dumingag Campus",
  "venue": "Main Building - Second Floor",
  "notes": "Priority areas: Reading area, computer lab, and study rooms. Need to coordinate with maintenance department."
}
```

#### Expected Response (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "name": "School Library Expansion Project",
    "description": "Expansion of the school library...",
    "budget": 500000.0,
    "totalRaised": 0,
    "totalExpenses": 0,
    "balance": 500000.0,
    "status": "PLANNING",
    "priority": "HIGH",
    "progressPercentage": 0,
    "fundingGoal": 600000.0,
    "targetBeneficiaries": 1500,
    "startDate": "2024-11-01T00:00:00.000Z",
    "endDate": "2025-06-30T00:00:00.000Z",
    "location": "JHCSC Dumingag Campus",
    "venue": "Main Building - Second Floor",
    "notes": "Priority areas...",
    "createdBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-10-09T00:00:00.000Z",
    "updatedAt": "2024-10-09T00:00:00.000Z"
  },
  "message": "Project created successfully"
}
```

#### ✅ Validation Points:

- [x] Project created with PLANNING status
- [x] Balance equals budget initially
- [x] totalRaised and totalExpenses are 0
- [x] Creator information included
- [x] All fields saved correctly

---

### **Scenario 2: Update Project Status to Active**

Activate the project to begin implementation.

#### Request:

```http
PUT http://localhost:3000/api/projects/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "ACTIVE",
  "progressPercentage": 5
}
```

#### Expected Response (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "School Library Expansion Project",
    "status": "ACTIVE",
    "progressPercentage": 5,
    ...
  },
  "message": "Project updated successfully"
}
```

#### ✅ Validation Points:

- [x] Status changed to ACTIVE
- [x] Progress percentage updated
- [x] Other fields remain unchanged

---

### **Scenario 3: Record Project Expenses**

Track spending on the project.

#### Request 1: Materials Purchase

```http
POST http://localhost:3000/api/projects/1/expenses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Construction Materials - Cement, Steel, Wood",
  "description": "Initial purchase of construction materials: 50 bags cement, steel bars, plywood, lumber",
  "amount": 150000.00,
  "category": "Materials",
  "expenseDate": "2024-11-05T00:00:00Z",
  "receipt": "https://example.com/receipts/2024-11-05-001.pdf",
  "notes": "Purchased from ABC Hardware & Construction Supply"
}
```

#### Request 2: Labor Costs

```http
POST http://localhost:3000/api/projects/1/expenses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Construction Labor - Week 1",
  "description": "Labor costs for construction crew - demolition and foundation work",
  "amount": 50000.00,
  "category": "Labor",
  "expenseDate": "2024-11-08T00:00:00Z",
  "notes": "5 workers x 5 days"
}
```

#### Request 3: Equipment Rental

```http
POST http://localhost:3000/api/projects/1/expenses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Equipment Rental - Jackhammer and Tools",
  "description": "Rental of construction equipment for demolition phase",
  "amount": 15000.00,
  "category": "Equipment",
  "expenseDate": "2024-11-06T00:00:00Z",
  "receipt": "https://example.com/receipts/2024-11-06-001.pdf"
}
```

#### Expected Response for Each (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "expense": {
      "id": 1,
      "projectId": 1,
      "title": "Construction Materials - Cement, Steel, Wood",
      "description": "Initial purchase of construction materials...",
      "amount": 150000.00,
      "category": "Materials",
      "expenseDate": "2024-11-05T00:00:00.000Z",
      "receipt": "https://example.com/receipts/2024-11-05-001.pdf",
      "recordedBy": 1,
      "createdAt": "2024-11-05T00:00:00.000Z"
    },
    "project": {
      "id": 1,
      "name": "School Library Expansion Project",
      "totalExpenses": 150000.00,
      "balance": 350000.00,
      ...
    }
  },
  "message": "Expense recorded successfully"
}
```

#### ✅ Validation Points:

- [x] totalExpenses increases with each expense
- [x] Balance decreases correctly (budget - totalExpenses)
- [x] Cannot exceed remaining balance
- [x] Receipt URLs saved
- [x] Categories tracked properly

---

### **Scenario 4: Link Contributions to Project**

Test the integration between Contributions and Projects modules.

#### Request 1: Create Contribution for Project

```http
POST http://localhost:3000/api/contributions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "parentId": 2,
  "type": "PROJECT",
  "title": "Library Expansion Contribution",
  "description": "Monthly contribution for library expansion project",
  "amount": 5000.00,
  "projectId": 1,
  "academicYear": "2024-2025",
  "period": "November"
}
```

#### Request 2: Record Payment for Contribution

```http
POST http://localhost:3000/api/contributions/1/record-payment
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "amount": 5000.00,
  "method": "GCASH",
  "reference": "GCASH-2024110512345",
  "notes": "Full payment via GCash"
}
```

#### Request 3: Update Project Raised Funds

```http
POST http://localhost:3000/api/projects/1/update-raised
Authorization: Bearer <admin_token>
```

#### Expected Response (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "School Library Expansion Project",
    "totalRaised": 5000.00,
    "fundingGoal": 600000.00,
    "balance": 350000.00,
    ...
  },
  "message": "Project raised funds updated successfully"
}
```

#### ✅ Validation Points:

- [x] Contributions can be linked to projects
- [x] totalRaised calculates from paid contributions
- [x] Multiple parents can contribute
- [x] Funding progress tracked

---

### **Scenario 5: Post Project Updates**

Communicate progress to stakeholders.

#### Request 1: Milestone Update

```http
POST http://localhost:3000/api/projects/1/updates
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Foundation Work Complete",
  "content": "We are pleased to announce that the foundation work has been completed successfully. The construction team has finished laying the foundation for the new library wing. Next phase will begin on November 15th with the structural framing.",
  "isPublic": true,
  "isMilestone": true,
  "attachments": "[\"https://example.com/photos/foundation-complete-1.jpg\", \"https://example.com/photos/foundation-complete-2.jpg\"]"
}
```

#### Request 2: Progress Update

```http
POST http://localhost:3000/api/projects/1/updates
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Week 2 Progress Report",
  "content": "Construction is progressing well. All materials have been delivered. Team completed demolition and foundation work. On schedule for next phase.",
  "isPublic": true,
  "isMilestone": false
}
```

#### Request 3: Internal Note (Private)

```http
POST http://localhost:3000/api/projects/1/updates
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Budget Review Meeting",
  "content": "Internal note: Need to discuss budget allocation for additional electrical work not included in original plan. Schedule meeting with finance committee.",
  "isPublic": false,
  "isMilestone": false
}
```

#### Expected Response (201 Created):

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "projectId": 1,
    "title": "Foundation Work Complete",
    "content": "We are pleased to announce...",
    "isPublic": true,
    "isMilestone": true,
    "attachments": "[...]",
    "postedBy": 1,
    "createdAt": "2024-11-10T00:00:00.000Z"
  },
  "message": "Project update created successfully"
}
```

#### ✅ Validation Points:

- [x] Public updates visible to all users
- [x] Private updates only for admins
- [x] Milestones marked properly
- [x] Attachments saved as JSON array
- [x] Timeline tracked

---

### **Scenario 6: Get Project Details**

Retrieve complete project information.

#### Request:

```http
GET http://localhost:3000/api/projects/1
Authorization: Bearer <token>
```

#### Expected Response (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "School Library Expansion Project",
    "description": "Expansion of the school library...",
    "budget": 500000.0,
    "totalRaised": 5000.0,
    "totalExpenses": 215000.0,
    "balance": 285000.0,
    "status": "ACTIVE",
    "priority": "HIGH",
    "progressPercentage": 5,
    "fundingGoal": 600000.0,
    "targetBeneficiaries": 1500,
    "startDate": "2024-11-01T00:00:00.000Z",
    "endDate": "2025-06-30T00:00:00.000Z",
    "completedDate": null,
    "location": "JHCSC Dumingag Campus",
    "venue": "Main Building - Second Floor",
    "createdBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "contributions": [
      {
        "id": 1,
        "parentId": 2,
        "type": "PROJECT",
        "amount": 5000.0,
        "amountPaid": 5000.0,
        "status": "PAID",
        "parent": {
          "id": 2,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "expenses": [
      {
        "id": 1,
        "title": "Construction Materials - Cement, Steel, Wood",
        "amount": 150000.0,
        "category": "Materials",
        "expenseDate": "2024-11-05T00:00:00.000Z"
      },
      {
        "id": 2,
        "title": "Construction Labor - Week 1",
        "amount": 50000.0,
        "category": "Labor",
        "expenseDate": "2024-11-08T00:00:00.000Z"
      },
      {
        "id": 3,
        "title": "Equipment Rental - Jackhammer and Tools",
        "amount": 15000.0,
        "category": "Equipment",
        "expenseDate": "2024-11-06T00:00:00.000Z"
      }
    ],
    "updates": [
      {
        "id": 1,
        "title": "Foundation Work Complete",
        "content": "We are pleased to announce...",
        "isPublic": true,
        "isMilestone": true,
        "createdAt": "2024-11-10T00:00:00.000Z"
      },
      {
        "id": 2,
        "title": "Week 2 Progress Report",
        "content": "Construction is progressing well...",
        "isPublic": true,
        "isMilestone": false,
        "createdAt": "2024-11-12T00:00:00.000Z"
      }
    ],
    "_count": {
      "contributions": 1,
      "expenses": 3,
      "updates": 2
    },
    "createdAt": "2024-10-09T00:00:00.000Z",
    "updatedAt": "2024-11-12T00:00:00.000Z"
  },
  "message": "Project retrieved successfully"
}
```

#### ✅ Validation Points:

- [x] All project details included
- [x] Financial calculations correct
- [x] Related contributions included
- [x] All expenses listed
- [x] Updates with visibility rules
- [x] Counts accurate

---

### **Scenario 7: Filter and Search Projects**

Test advanced filtering and search capabilities.

#### Request 1: Search by Name

```http
GET http://localhost:3000/api/projects?search=library
Authorization: Bearer <token>
```

#### Request 2: Filter by Status

```http
GET http://localhost:3000/api/projects?status=ACTIVE
Authorization: Bearer <token>
```

#### Request 3: Filter by Priority

```http
GET http://localhost:3000/api/projects?priority=HIGH&priority=URGENT
Authorization: Bearer <token>
```

#### Request 4: Date Range Filter

```http
GET http://localhost:3000/api/projects?dateFrom=2024-11-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

#### Request 5: Combined Filters with Pagination

```http
GET http://localhost:3000/api/projects?status=ACTIVE&priority=HIGH&search=school&page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

#### Expected Response (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "projects": [...],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "message": "Projects retrieved successfully"
}
```

#### ✅ Validation Points:

- [x] Search works on name and description
- [x] Multiple filters apply correctly
- [x] Pagination works
- [x] Sorting functions properly
- [x] Empty results handled

---

### **Scenario 8: Generate Project Report**

Create comprehensive financial reports.

#### Request:

```http
GET http://localhost:3000/api/projects/report?dateFrom=2024-11-01&dateTo=2024-11-30&includeStats=true&includeExpenses=true&includeContributions=true
Authorization: Bearer <admin_token>
```

#### Expected Response (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "dateRange": {
      "from": "2024-11-01",
      "to": "2024-11-30"
    },
    "totalRecords": 1,
    "projects": [
      {
        "id": 1,
        "name": "School Library Expansion Project",
        "budget": 500000.00,
        "totalRaised": 5000.00,
        "totalExpenses": 215000.00,
        "balance": 285000.00,
        "status": "ACTIVE",
        "priority": "HIGH",
        "progressPercentage": 5,
        "expenses": [
          {
            "title": "Construction Materials",
            "amount": 150000.00,
            "category": "Materials"
          },
          ...
        ],
        "contributions": [
          {
            "amount": 5000.00,
            "amountPaid": 5000.00,
            "parent": {
              "name": "John Doe"
            }
          }
        ]
      }
    ],
    "statistics": {
      "totalProjects": 1,
      "totalBudget": 500000.00,
      "totalRaised": 5000.00,
      "totalExpenses": 215000.00,
      "totalBalance": 285000.00,
      "averageProgress": "5.00",
      "fundingProgress": "0.83",
      "statusBreakdown": {
        "PLANNING": 0,
        "ACTIVE": 1,
        "ON_HOLD": 0,
        "COMPLETED": 0,
        "CANCELLED": 0
      }
    }
  },
  "message": "Project report generated successfully"
}
```

#### ✅ Validation Points:

- [x] Date range filtering works
- [x] Statistics calculated correctly
- [x] Expenses and contributions included
- [x] Status breakdown accurate
- [x] Financial totals correct

---

### **Scenario 9: Get Project Statistics**

Retrieve analytical data.

#### Request:

```http
GET http://localhost:3000/api/projects/stats?status=ACTIVE
Authorization: Bearer <token>
```

#### Expected Response (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "totalProjects": 5,
    "totalBudget": 2500000.0,
    "totalRaised": 450000.0,
    "totalExpenses": 1200000.0,
    "totalBalance": 1300000.0,
    "averageProgress": "42.50",
    "fundingProgress": "18.00",
    "budgetUtilization": "48.00",
    "statusCounts": {
      "planning": 1,
      "active": 3,
      "onHold": 0,
      "completed": 1,
      "cancelled": 0
    },
    "statusBreakdown": {
      "PLANNING": {
        "count": 1,
        "percentage": "20.00"
      },
      "ACTIVE": {
        "count": 3,
        "percentage": "60.00"
      },
      "COMPLETED": {
        "count": 1,
        "percentage": "20.00"
      }
    },
    "priorityBreakdown": {
      "LOW": 1,
      "MEDIUM": 2,
      "HIGH": 2,
      "URGENT": 0
    },
    "averages": {
      "budget": "500000.00",
      "raised": "90000.00",
      "expenses": "240000.00"
    }
  },
  "message": "Project statistics retrieved successfully"
}
```

#### ✅ Validation Points:

- [x] Aggregations accurate
- [x] Percentages calculated correctly
- [x] Breakdown by status/priority
- [x] Averages computed properly
- [x] Filters apply correctly

---

### **Scenario 10: Complete Project Lifecycle**

Test full project workflow from start to completion.

#### Step 1: Update Progress

```http
PUT http://localhost:3000/api/projects/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "progressPercentage": 100
}
```

#### Step 2: Mark as Completed

```http
PUT http://localhost:3000/api/projects/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

#### Expected Response (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "progressPercentage": 100,
    "completedDate": "2024-11-30T00:00:00.000Z",
    ...
  },
  "message": "Project updated successfully"
}
```

#### ✅ Validation Points:

- [x] Status changed to COMPLETED
- [x] completedDate automatically set
- [x] Progress at 100%
- [x] Financial data preserved

---

## 🚨 Error Testing

### Test 1: Budget Exceeded

```http
POST http://localhost:3000/api/projects/1/expenses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Large Expense",
  "amount": 999999999.00,
  "category": "Other"
}
```

**Expected:** `400 Bad Request` - "Expense amount exceeds remaining project balance"

### Test 2: Delete Project with Dependencies

```http
DELETE http://localhost:3000/api/projects/1
Authorization: Bearer <admin_token>
```

**Expected:** `400 Bad Request` - "Cannot delete project with existing contributions or expenses"

### Test 3: Unauthorized Access (Parent)

```http
POST http://localhost:3000/api/projects
Authorization: Bearer <parent_token>
Content-Type: application/json

{ "name": "Test Project" }
```

**Expected:** `403 Forbidden` - "Insufficient permissions"

### Test 4: Invalid Project ID

```http
GET http://localhost:3000/api/projects/99999
Authorization: Bearer <token>
```

**Expected:** `404 Not Found` - "Project not found"

---

## 📊 Integration Testing

### Integration 1: Projects + Contributions

1. Create project
2. Create contribution linked to project
3. Record payment on contribution
4. Update project raised funds
5. Verify totalRaised increased

### Integration 2: Projects + Users

1. Admin creates project
2. Verify createdBy relationship
3. Multiple admins can manage
4. Parents can view but not edit

### Integration 3: Financial Tracking

1. Set budget: 100,000
2. Record expenses: 30,000
3. Verify balance: 70,000
4. Record more expenses: 50,000
5. Verify balance: 20,000
6. Try to exceed balance - should fail

---

## ✅ Success Criteria

**All tests pass if:**

- ✅ All CRUD operations work correctly
- ✅ Financial calculations are accurate
- ✅ Budget constraints enforced
- ✅ Integration with contributions works
- ✅ Authorization rules respected
- ✅ Filtering and search functional
- ✅ Reports generate correctly
- ✅ Statistics calculate accurately
- ✅ Error handling appropriate
- ✅ Data integrity maintained

---

## 📝 Notes

1. **Always authenticate first** - Get admin token before testing
2. **Test in sequence** - Some tests depend on previous data
3. **Verify calculations** - Check all financial math manually
4. **Test edge cases** - Try invalid data, large numbers, empty fields
5. **Monitor database** - Check actual DB state after operations
6. **Clean up** - Reset database between major test runs

---

## 🎯 Quick Test Checklist

- [ ] Create project
- [ ] Update project status
- [ ] Record expenses (multiple)
- [ ] Link contributions
- [ ] Update raised funds
- [ ] Post project updates
- [ ] Get project details
- [ ] Filter projects
- [ ] Generate report
- [ ] Get statistics
- [ ] Test error cases
- [ ] Complete project lifecycle
- [ ] Test authorization
- [ ] Verify financial calculations
- [ ] Check data integrity

---

## 📞 Support

If tests fail, check:

1. Database connection
2. JWT token validity
3. User permissions
4. Data existence
5. Schema migrations applied

For assistance, refer to:

- `PROJECTS_API_DOCS.md` - Complete API documentation
- `projects.service.ts` - Business logic
- `projects.validation.ts` - Validation rules
