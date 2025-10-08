# Projects Management - Quick Reference

## 🚀 Quick Start

### Base URL

```
http://localhost:3000/api/projects
```

### Authentication

All endpoints require JWT token:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📌 Common Operations

### 1️⃣ Create Project (Admin)

```http
POST /api/projects
Content-Type: application/json

{
  "name": "Library Expansion",
  "description": "Expand school library",
  "budget": 500000,
  "priority": "HIGH",
  "startDate": "2024-11-01T00:00:00Z",
  "endDate": "2025-06-30T00:00:00Z"
}
```

### 2️⃣ Get All Projects

```http
GET /api/projects?status=ACTIVE&page=1&limit=10
```

### 3️⃣ Get Project Details

```http
GET /api/projects/1
```

### 4️⃣ Update Project Status

```http
PUT /api/projects/1
Content-Type: application/json

{
  "status": "ACTIVE",
  "progressPercentage": 25
}
```

### 5️⃣ Record Expense (Admin)

```http
POST /api/projects/1/expenses
Content-Type: application/json

{
  "title": "Construction Materials",
  "amount": 50000,
  "category": "Materials",
  "expenseDate": "2024-11-15T00:00:00Z"
}
```

### 6️⃣ Post Project Update (Admin)

```http
POST /api/projects/1/updates
Content-Type: application/json

{
  "title": "Phase 1 Complete",
  "content": "Foundation work finished successfully",
  "isPublic": true,
  "isMilestone": true
}
```

### 7️⃣ Update Raised Funds (Admin)

```http
POST /api/projects/1/update-raised
```

### 8️⃣ Generate Report (Admin)

```http
GET /api/projects/report?dateFrom=2024-01-01&dateTo=2024-12-31
```

### 9️⃣ Get Statistics

```http
GET /api/projects/stats?status=ACTIVE
```

### 🔟 Search Projects

```http
GET /api/projects?search=library&priority=HIGH
```

---

## 📊 Project Status Flow

```
PLANNING → ACTIVE → COMPLETED
           ↓
        ON_HOLD → ACTIVE
           ↓
        CANCELLED
```

---

## 🎯 Priority Levels

- **URGENT** - Highest priority
- **HIGH** - High priority
- **MEDIUM** - Normal priority (default)
- **LOW** - Low priority

---

## 💰 Financial Tracking

### Automatic Calculations:

```
balance = budget - totalExpenses
totalRaised = SUM(contributions.amountPaid)
fundingProgress = (totalRaised / fundingGoal) * 100
budgetUtilization = (totalExpenses / budget) * 100
```

### Budget Rules:

- ✅ Cannot record expenses exceeding balance
- ✅ Balance automatically recalculates
- ✅ All operations use transactions

---

## 🔑 Key Fields

### Required for Creation:

- `name` (string)
- `budget` (number)
- `startDate` (ISO date)

### Optional but Important:

- `description` (text)
- `fundingGoal` (number)
- `targetBeneficiaries` (number)
- `priority` (enum)
- `endDate` (ISO date)
- `location` (string)
- `venue` (string)

---

## 🔍 Filtering Options

### Status Filter:

```
?status=ACTIVE
?status=PLANNING
?status=COMPLETED
```

### Priority Filter:

```
?priority=HIGH
?priority=URGENT
```

### Date Range:

```
?dateFrom=2024-01-01&dateTo=2024-12-31
```

### Search:

```
?search=library
```

### Pagination:

```
?page=1&limit=10
```

### Sorting:

```
?sortBy=createdAt&sortOrder=desc
```

---

## 🚨 Common Errors

### 400 - Bad Request

- Expense exceeds budget
- Invalid data format
- Missing required fields

### 401 - Unauthorized

- No JWT token
- Invalid token
- Token expired

### 403 - Forbidden

- Parent trying admin action
- Insufficient permissions

### 404 - Not Found

- Project doesn't exist
- Expense doesn't exist
- Update doesn't exist

---

## 📈 Statistics Available

- Total projects count
- Total budget across projects
- Total raised from contributions
- Total expenses
- Remaining balance
- Average progress
- Funding progress percentage
- Budget utilization percentage
- Status breakdown
- Priority breakdown

---

## 🔗 Integration

### Link Contribution to Project:

```http
POST /api/contributions
Content-Type: application/json

{
  "parentId": 1,
  "type": "PROJECT",
  "title": "Library Contribution",
  "amount": 5000,
  "projectId": 1
}
```

Then update raised funds:

```http
POST /api/projects/1/update-raised
```

---

## ✅ Best Practices

1. **Set realistic budgets** from the start
2. **Update progress regularly** (weekly recommended)
3. **Record expenses promptly** with receipts
4. **Post public updates** for transparency
5. **Mark milestones** to celebrate achievements
6. **Monitor budget utilization** to avoid overspending
7. **Update raised funds** after new contributions
8. **Generate reports** monthly or quarterly

---

## 📝 Expense Categories (Suggested)

- Materials
- Labor
- Equipment
- Transportation
- Professional Services
- Permits & Licenses
- Utilities
- Other

---

## 🎯 Complete Workflow Example

```bash
# 1. Create project
POST /api/projects { "name": "...", "budget": 500000 }

# 2. Activate project
PUT /api/projects/1 { "status": "ACTIVE" }

# 3. Link contributions
POST /api/contributions { "projectId": 1 }

# 4. Update raised funds
POST /api/projects/1/update-raised

# 5. Record expenses
POST /api/projects/1/expenses { "amount": 50000 }

# 6. Post updates
POST /api/projects/1/updates { "title": "Progress..." }

# 7. Update progress
PUT /api/projects/1 { "progressPercentage": 50 }

# 8. Complete project
PUT /api/projects/1 { "status": "COMPLETED", "progressPercentage": 100 }

# 9. Generate report
GET /api/projects/report?projectId=1
```

---

## 📚 Documentation Links

- `PROJECTS_API_DOCS.md` - Complete API reference
- `PROJECTS_TESTING_GUIDE.md` - Testing scenarios
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `README.md` - Project documentation

---

**Version:** 1.0.0  
**Last Updated:** October 9, 2025
