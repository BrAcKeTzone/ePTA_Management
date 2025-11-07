# Student Management Page - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Students Management                                              │
│ Manage student records and parent links                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STATISTICS CARDS (3 columns)                                   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌──────────────┐  ┌─────────────┐              │
│ │Total        │  │Active        │  │Inactive     │              │
│ │Students     │  │Students      │  │Students     │              │
│ │    150      │  │    100       │  │    50       │              │
│ └─────────────┘  └──────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ACTION BUTTON                                                   │
├─────────────────────────────────────────────────────────────────┤
│ [+ Add New Student]                                             │
└─────────────────────────────────────────────────────────────────┘

┌─ Filter Students ─────────────────────────────────────────────┐
│                                                                │
│  ┌─────────────────────┐  ┌────────────────┐  ┌──────────┐   │
│  │ Search              │  │ Status    ▼    │  │ Year ▼   │   │
│  │ Name or Student ID  │  │ • All Status   │  │ • All    │   │
│  │ ________________    │  │ • Active       │  │ • 2022   │   │
│  │        🔍           │  │ • Inactive     │  │ • 2023   │   │
│  └─────────────────────┘  └────────────────┘  │ • 2024   │   │
│                                               │ • 2025   │   │
│                                               └──────────┘   │
│                                        [Clear Filters Button] │
└────────────────────────────────────────────────────────────────┘

┌─ Students (150) ──────────────────────────────────────────────┐
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Name           │ Status  │ Year │ Birth   │ Parent │Act│   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Juan Dela Cruz │ ACTIVE  │ 2024 │ 01/15.. │Maria..│E│D│   │
│  │ ID: 2024-001   │ [Green] │      │ /2010   │email..│ │ │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Maria Santos   │INACTIVE │ 2023 │ 03/20.. │John...│E│D│   │
│  │ ID: 2024-002   │ [Red]   │      │ /2009   │email..│ │ │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ (8 more students...)                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Show: [10 ▼] entries   Showing 1 to 10 of 150 results        │
│                                                                │
│  [< Prev] [1][2][3][4][5] [> Next]                            │
└────────────────────────────────────────────────────────────────┘
```

## Desktop View (Full Table)

```
STUDENT MANAGEMENT PAGE (Desktop - lg+)

┌─────────────────────────────────────────────────────────────────┐
│ Statistics | Add Button | Filters | Full Table | Pagination    │
│                                                                 │
│  Statistics (3 cards)                                           │
│  [Add New Student]                                              │
│                                                                 │
│  ┌─ Filter Students ─────────────────────────────────────────┐ │
│  │ [Search] [Status ▼] [Year ▼]              [Clear Filters] │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ TABLE: Full columns, all details visible                │   │
│  │ - Student Name (with ID)                                │   │
│  │ - Status (color badge)                                  │   │
│  │ - Year Enrolled                                         │   │
│  │ - Birth Date                                            │   │
│  │ - Parent (name + email)                                 │   │
│  │ - Actions (Edit/Delete)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Show: [10 ▼] entries   Pagination: [< 1 2 3 4 5 >]          │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile View (Card Layout)

```
STUDENT MANAGEMENT PAGE (Mobile - sm)

┌─────────────────────────┐
│ Statistics (stacked)    │
│ [Total][Active]         │
│ [Inactive]              │
├─────────────────────────┤
│ [+ Add New Student]     │
├─────────────────────────┤
│ ┌─ Filter Students ───┐ │
│ │ [Search]            │ │
│ │ [Status ▼]          │ │
│ │ [Year ▼]            │ │
│ │ [Clear Filters]     │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ┌─ Students (150) ────┐ │
│ │ ┌─────────────────┐ │ │
│ │ │ Juan Dela Cruz  │ │ │
│ │ │ ID: 2024-001    │ │ │
│ │ │ [ACTIVE Badge]  │ │ │
│ │ │ Year: 2024      │ │ │
│ │ │ DOB: 01/15/2010 │ │ │
│ │ │ Maria Dela Cruz │ │ │
│ │ │ maria@email.com │ │ │
│ │ │ [Edit][Delete]  │ │ │
│ │ └─────────────────┘ │ │
│ │ ┌─────────────────┐ │ │
│ │ │ (More cards)    │ │ │
│ │ └─────────────────┘ │ │
│ │                     │ │
│ │ Show: [10 ▼]       │ │
│ │ Pagination (below) │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## Component Hierarchy

```
StudentsManagement
│
├── Header Section
│   ├── Title: "Students Management"
│   └── Subtitle: "Manage student records..."
│
├── Statistics Cards Row
│   ├── DashboardCard (Total Students)
│   ├── DashboardCard (Active Students)
│   └── DashboardCard (Inactive Students)
│
├── Action Buttons
│   └── Button (Add New Student)
│
├── Filter Card (DashboardCard)
│   ├── Input (Search)
│   ├── Select (Status)
│   ├── Select (Year Enrolled)
│   └── Button (Clear Filters)
│
├── Table Card (DashboardCard)
│   ├── Desktop View (lg+)
│   │   └── Table Component
│   │       ├── Column: Student Name
│   │       ├── Column: Status
│   │       ├── Column: Year Enrolled
│   │       ├── Column: Birth Date
│   │       ├── Column: Parent
│   │       └── Column: Actions
│   │
│   ├── Mobile View (<lg)
│   │   └── Card List
│   │       └── Card (per student)
│   │           ├── Header (Name + Status Badge)
│   │           ├── Details (Year, DOB, Parent)
│   │           └── Actions (Edit/Delete buttons)
│   │
│   └── Pagination Section
│       ├── Entries Per Page Selector
│       │   └── Select: 10, 25, 50, 100
│       └── Pagination Component
│           ├── Previous Button
│           ├── Page Numbers (1, 2, 3, ...)
│           └── Next Button
│
├── Create Modal
│   └── Form (First, Last, Middle names, ID, Year, Birth Date)
│
├── Edit Modal
│   └── Form (Same as Create, ID disabled)
│
└── Delete Modal
    └── Confirmation (Unsafe operation warning)
```

## Data Flow Diagram

```
┌──────────────────────────┐
│  User Interaction        │
│  (Search/Filter/Paginate)│
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Handler Function        │
│  (handleFilterChange,    │
│   handlePageChange, etc) │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Update State            │
│  (setFilters)            │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  useEffect Triggered     │
│  (Dependencies matched)  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  applyFiltersAndPaginate │
│  1. Filter search        │
│  2. Filter status        │
│  3. Filter year          │
│  4. Calculate pages      │
│  5. Slice for page       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Update Display State    │
│  (setPaginatedStudents)  │
│  (setFilters totalPages) │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Re-render Component     │
│  Display new data        │
└──────────────────────────┘
```

## State Structure

```javascript
{
  // Student Data
  students: Array,           // All students from API
  paginatedStudents: Array,  // Current page students
  selectedStudent: Object,   // For edit/delete modal
  newStudent: Object,        // Form data for create

  // Statistics
  studentStats: {
    total: Number,
    active: Number,
    inactive: Number
  },

  // Filtering & Pagination
  filters: {
    search: String,        // Debounced search
    status: String,        // "ACTIVE"|"INACTIVE"|""
    yearEnrolled: String,  // Year value or ""
    page: Number,          // Current page (1+)
    limit: Number,         // Items per page (10,25,50,100)
    totalPages: Number,    // Calculated from filter result
    totalCount: Number     // Total filtered results
  },

  // UI State
  searchInput: String,       // Raw search input (before debounce)
  isSearching: Boolean,      // Debounce indicator
  loading: Boolean,
  showCreateModal: Boolean,
  showEditModal: Boolean,
  showDeleteModal: Boolean
}
```

## Filter Logic Flowchart

```
START (applyFiltersAndPagination)
   │
   ├─ Copy students array
   │
   ├─ IF search.trim()
   │  └─ Filter: name includes search OR id includes search
   │
   ├─ IF status !== ""
   │  └─ Filter: student.status === filters.status
   │
   ├─ IF yearEnrolled !== ""
   │  └─ Filter: student.yearEnrolled === parseInt(yearEnrolled)
   │
   ├─ Calculate totalPages = ceil(filtered.length / limit)
   │
   ├─ Calculate startIndex = (page - 1) * limit
   ├─ Calculate endIndex = startIndex + limit
   │
   ├─ Slice: paginatedData = filtered.slice(startIndex, endIndex)
   │
   ├─ IF page > totalPages
   │  └─ Adjust page to totalPages
   │
   ├─ Update: setPaginatedStudents(paginatedData)
   └─ Update: setFilters with totalPages and totalCount
END
```

## Pagination Example

```
Total Students: 150
Items Per Page: 10
Total Pages: 15

Page 1: Students 1-10
Page 2: Students 11-20
Page 3: Students 21-30
...
Page 15: Students 141-150

Display Format: "Showing 1 to 10 of 150 results"

With Status Filter (75 results):
Page 1: Students 1-10 (of filtered 75)
Page 2: Students 11-20 (of filtered 75)
...
Page 8: Students 71-75 (of filtered 75)

Display Format: "Showing 1 to 10 of 75 results - Filtered"
```

## Button States

### Pagination Buttons

```
[< Prev] - ENABLED on page > 1, DISABLED on page 1

[1][2][3][4][5] - Current page is PRIMARY, others OUTLINE
                - Max 5 pages shown
                - "..." for gaps

[> Next] - ENABLED on page < totalPages, DISABLED otherwise
```

### Entry Selector

```
Show: [10 ▼] entries
      ├─ 10 (selected)
      ├─ 25
      ├─ 50
      └─ 100

Changing limit:
- Reset page to 1
- Recalculate totalPages
- Re-render with new limit
```

## Search Debounce Timeline

```
User types: "J-u-a-n"

t=0ms    └─ "J"
         ├─ searchInput = "J"
         └─ Timer start

t=100ms  └─ "u" (arrived before 500ms)
         ├─ searchInput = "Ju"
         ├─ Timer cancelled
         └─ Timer restart

t=250ms  └─ "a" (arrived before 500ms)
         ├─ searchInput = "Jua"
         ├─ Timer cancelled
         └─ Timer restart

t=350ms  └─ "n" (arrived before 500ms)
         ├─ searchInput = "Juan"
         ├─ Timer cancelled
         └─ Timer restart

t=850ms  └─ Timer completes (500ms elapsed since "n")
         ├─ setFilters({ search: "Juan" })
         ├─ applyFiltersAndPaginate()
         ├─ Filter results for "Juan"
         └─ Display matches
```

---

This visual guide helps understand how the Student Management page is organized and flows data through the system.
