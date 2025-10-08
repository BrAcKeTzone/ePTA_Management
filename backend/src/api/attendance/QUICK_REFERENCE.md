# Attendance Tracking - Quick Reference

## Quick Start

### Record Single Attendance

```bash
POST /api/attendance
{
  "meetingId": 1,
  "parentId": 5,
  "status": "PRESENT",
  "checkInTime": "2024-10-08T14:00:00Z"
}
```

### Bulk Record Attendance

```bash
POST /api/attendance/bulk
{
  "meetingId": 1,
  "attendances": [
    { "parentId": 5, "status": "PRESENT" },
    { "parentId": 6, "status": "ABSENT" }
  ]
}
```

### Get Attendance Records

```bash
GET /api/attendance?meetingId=1&page=1&limit=20
```

### Generate Report

```bash
GET /api/attendance/report?dateFrom=2024-01-01&dateTo=2024-12-31&groupBy=meeting
```

### Calculate Penalties

```bash
POST /api/attendance/calculate-penalties
{
  "meetingId": 1,
  "applyPenalties": true
}
```

### Get Statistics

```bash
GET /api/attendance/stats?dateFrom=2024-01-01&dateTo=2024-12-31
```

## Status Types

- **PRESENT**: Parent attended (may be late)
- **ABSENT**: Parent did not attend (penalty applied)
- **EXCUSED**: Valid excuse provided (no penalty)

## Key Features

✅ Single & bulk recording
✅ Check-in/check-out tracking
✅ Late arrival management
✅ Automatic penalty calculation
✅ Comprehensive reports
✅ Advanced filtering
✅ Statistics & analytics

## Admin Actions

- Record attendance (single/bulk)
- Update attendance records
- Delete attendance (if penalties not applied)
- Generate reports
- Calculate and apply penalties

## Parent Actions

- View own attendance history
- View attendance statistics

## Penalty System

### When Penalties Apply

- **Absence**: Penalty = `penaltyRatePerAbsence` (default ₱50)
- **Late**: Penalty = `penaltyRateLate` (default ₱25)
- **Excused**: No penalty

### Penalty Workflow

1. Record attendance → Penalties calculated
2. Admin reviews → Calculate penalties endpoint
3. Admin applies → Creates Penalty records
4. Attendance marked → `penaltyApplied = true`

## Best Practices

1. **Use bulk recording** for efficiency at meeting start
2. **Mark excused absences** to avoid unfair penalties
3. **Generate reports regularly** for insights
4. **Apply penalties** only after review
5. **Track late minutes** for accurate records

## Common Queries

### View meeting attendance

```
GET /api/attendance?meetingId=1
```

### View parent history

```
GET /api/attendance?parentId=5
```

### Find all absences

```
GET /api/attendance?status=ABSENT
```

### Get records with penalties

```
GET /api/attendance?hasPenalty=true
```

### Date range query

```
GET /api/attendance?dateFrom=2024-10-01&dateTo=2024-10-31
```

## Report Types

1. **Basic Report**: All attendance records
2. **Statistical Report**: With counts and percentages
3. **Grouped Report**: By meeting, parent, or status
4. **Penalty Report**: Calculate penalties preview/apply

## API Endpoints

| Method | Endpoint                              | Access | Description               |
| ------ | ------------------------------------- | ------ | ------------------------- |
| POST   | `/api/attendance`                     | Admin  | Record single attendance  |
| POST   | `/api/attendance/bulk`                | Admin  | Bulk record attendance    |
| GET    | `/api/attendance`                     | All    | List with filters         |
| GET    | `/api/attendance/:id`                 | All    | Get by ID                 |
| PUT    | `/api/attendance/:id`                 | Admin  | Update attendance         |
| DELETE | `/api/attendance/:id`                 | Admin  | Delete attendance         |
| GET    | `/api/attendance/report`              | Admin  | Generate report           |
| POST   | `/api/attendance/calculate-penalties` | Admin  | Calculate/apply penalties |
| GET    | `/api/attendance/stats`               | All    | Get statistics            |

## Need Help?

See full documentation: [ATTENDANCE_API_DOCS.md](ATTENDANCE_API_DOCS.md)
