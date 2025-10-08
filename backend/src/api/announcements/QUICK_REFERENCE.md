# Announcements System - Quick Reference

## 🚀 Quick Start

### Create & Publish an Announcement

```bash
# 1. Create draft announcement
POST /api/announcements
{
  "title": "PTA Meeting Next Week",
  "content": "Dear Parents, we invite you to our PTA meeting...",
  "priority": "HIGH",
  "targetAudience": "PARENTS",
  "isPublished": false,
  "createdById": 1
}

# 2. Publish and notify
PATCH /api/announcements/1/publish
{
  "sendNotifications": true
}
```

### View Active Announcements (Parents)

```bash
GET /api/announcements/active?page=1&limit=10
```

---

## 📊 Priority Levels

| Priority | Use Case                | Email Format        |
| -------- | ----------------------- | ------------------- |
| LOW      | General info, FYI       | `[Low Priority]`    |
| MEDIUM   | Standard announcements  | `[Medium Priority]` |
| HIGH     | Important notices       | `[High Priority]`   |
| URGENT   | Critical/time-sensitive | `[🔴 URGENT]`       |

---

## 🎯 Target Audiences

| Audience            | Sends To                       | Example Use Case              |
| ------------------- | ------------------------------ | ----------------------------- |
| ALL                 | Everyone (admins + parents)    | School-wide announcements     |
| PARENTS             | All parent accounts            | Parent-specific information   |
| ADMINS              | All admin accounts             | Admin notifications           |
| SPECIFIC_PROGRAM    | Parents of students in program | "BSIT students: Lab schedule" |
| SPECIFIC_YEAR_LEVEL | Parents of students in year    | "1st Year: Orientation"       |

---

## 📝 Common Workflows

### Workflow 1: General Announcement

```javascript
// Create announcement for all parents
POST /api/announcements
{
  "title": "School Event Reminder",
  "content": "...",
  "priority": "MEDIUM",
  "targetAudience": "PARENTS",
  "expiryDate": "2025-10-20T18:00:00Z",
  "createdById": 1
}

// Publish immediately with notifications
PATCH /api/announcements/{id}/publish
```

### Workflow 2: Urgent Targeted Announcement

```javascript
// Urgent notice for specific program
POST /api/announcements
{
  "title": "BSIT Lab Equipment Issue",
  "content": "Attention BSIT students...",
  "priority": "URGENT",
  "targetAudience": "SPECIFIC_PROGRAM",
  "targetProgram": "BSIT",
  "createdById": 1
}

// Publish and notify BSIT parents only
PATCH /api/announcements/{id}/publish
```

### Workflow 3: Scheduled Announcement

```javascript
// Create with future publish date
POST /api/announcements
{
  "title": "Enrollment Period Opens",
  "content": "...",
  "publishDate": "2025-11-01T08:00:00Z",
  "expiryDate": "2025-11-15T18:00:00Z",
  "isPublished": false,
  "createdById": 1
}

// On Nov 1, admin publishes
PATCH /api/announcements/{id}/publish
```

---

## 🔍 Filtering & Search

```bash
# Search in title and content
GET /api/announcements?search=meeting

# Filter by priority
GET /api/announcements?priority=HIGH

# Filter by published status
GET /api/announcements?isPublished=true

# Filter by creator
GET /api/announcements?createdById=1

# Combine filters with pagination
GET /api/announcements?priority=HIGH&isPublished=true&page=1&limit=20
```

---

## 📈 Statistics

```bash
GET /api/announcements/stats

# Returns:
{
  "totalAnnouncements": 50,
  "publishedAnnouncements": 35,
  "activeAnnouncements": 30,
  "expiredAnnouncements": 5,
  "urgentAnnouncements": 3,
  "byPriority": [...],
  "byTargetAudience": [...]
}
```

---

## 📧 Email Notification Details

### Batch Processing

- **Batch Size**: 10 emails per batch
- **Delay**: 1 second between batches
- **Time Estimate**: ~1 minute per 100 recipients

### Email Content

```
Subject: [High Priority] PTA Meeting Next Week

Dear John Doe,

High Priority

ANNOUNCEMENT: PTA Meeting Next Week

[Content here...]

Attachment: https://example.com/agenda.pdf

---
This is an automated notification from the ePTA Management System.
John H. Catolico Sr. College - Dumingag Campus
Parent and Teacher Association

Please do not reply to this email.
```

---

## ⚠️ Important Notes

### Target Audience Rules

- **SPECIFIC_PROGRAM**: Requires `targetProgram` field
- **SPECIFIC_YEAR_LEVEL**: Requires `targetYearLevel` field
- Only parents with **APPROVED** student links receive targeted announcements

### Date Validation

- `expiryDate` must be after `publishDate`
- Both dates are optional
- Expiry automatically removes from active list

### Admin-Only Actions

- Create announcements
- Update announcements
- Delete announcements
- Publish/unpublish announcements

### Parent Access

- View active announcements
- View announcement details

---

## 🛠️ Troubleshooting

### Announcement Not Showing in Active List

Check:

1. Is `isPublished = true`?
2. Has it expired? (`expiryDate < now`)
3. Is `publishDate` in the future?

### Notifications Not Sending

Check:

1. Email server configured in `.env`?
2. `sendNotifications` set to `true`?
3. Are there recipients for target audience?
4. Check notification result for error details

### No Recipients Found

Check:

1. Target audience has users?
2. For SPECIFIC_PROGRAM/YEAR_LEVEL: Are there students in that program/year?
3. Are student links APPROVED?

---

## 📚 Additional Resources

- **Full API Documentation**: [ANNOUNCEMENTS_API_DOCS.md](./ANNOUNCEMENTS_API_DOCS.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Student Linking**: [../students/STUDENT_API_DOCS.md](../students/STUDENT_API_DOCS.md)

---

## 🎯 Best Practices

1. **Use Draft Mode**: Create as draft first, review, then publish
2. **Set Expiry Dates**: Keep active list clean
3. **Choose Right Priority**: Don't overuse URGENT
4. **Target Appropriately**: Avoid spam by targeting correctly
5. **Test First**: Try with small audience before mass sending
6. **Monitor Results**: Check notification results for failures
7. **Handle Failures**: Follow up on failed email deliveries

---

**Need Help?** See full documentation in `ANNOUNCEMENTS_API_DOCS.md`
