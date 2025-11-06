# Meetings & Attendance: Visual Summary

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Meetings & Attendance Management                       [x]  │
│ Manage meetings and record attendance                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [Meetings] ━━━━  [Attendance]                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ All Meetings        [Create New Meeting] Button       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Title      │ Date/Time    │ Location │ Status│ Actions│   │
│  │ ─────────────────────────────────────────────────────│   │
│  │ Monthly GA │ Dec 25, 2025 │ Room A   │SCHEDU│ View   │   │
│  │            │ 10:00 AM - .. │         │LED   │ Delete │   │
│  │ ─────────────────────────────────────────────────────│   │
│  │ Emergency  │ Jan 10, 2026 │ Room B   │SCHEDU│ View   │   │
│  │ Meeting    │ 2:00 PM - 4:..│         │LED   │ Delete │   │
│  │ ─────────────────────────────────────────────────────│   │
│  │ Quarterly  │ Feb 20, 2026 │ Auditor..│SCHEDU│ View   │   │
│  │ Meeting    │ 9:00 AM - .. │         │LED   │ Delete │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Active: Meetings Tab
```

## Tab Navigation

```
┌─────────────────────────────────────────────────────────────┐
│ [Meetings] ━━━━━━━━ [Attendance]                            │
│  ▲                                                           │
│  │ Active Tab (blue underline)                              │
│  │ Content shown below                                      │
│                                                              │
│ Inactive Tab (gray text)                                    │
│ No content, greyed out                                      │
└─────────────────────────────────────────────────────────────┘
```

## Tab Switching

```
User in Meetings Tab          User in Attendance Tab
        │                              ▲
        │ Click "Attendance"           │ Click "Meetings"
        ├─────────────────────────────┤
        │                              │
        ▼                              │

Meetings Table shows          Attendance Table shows
- All meetings               - All meetings
- Create/View/Edit/Delete    - Record/View Attendance
- "Create New Meeting" button - "Record/View Attendance" button
```

## Modals Flow

```
Meetings Tab
        │
        ├─→ Click "Create New Meeting"
        │   │
        │   └─→ Create Meeting Modal
        │       ├─ Fill form
        │       └─ Submit/Cancel
        │
        ├─→ Click "View" on meeting
        │   │
        │   └─→ View Meeting Modal (Read-Only)
        │       ├─ Click "Edit"
        │       │  └─→ Edit Mode (Fields Editable)
        │       │      └─ Click "Update Meeting" or "Cancel"
        │       │
        │       └─ Click "Close"
        │
        └─→ Click "Delete" on meeting
            └─→ Confirm dialog → Meeting deleted

Attendance Tab
        │
        └─→ Click "Record/View Attendance"
            │
            └─→ Attendance Modal
                ├─ Shows all parents/users
                ├─ Mark each as Present/Absent
                └─ Auto-saves
```

## Before vs After Comparison

### BEFORE: Separate Pages

```
Admin Navigation Menu
├── Dashboard
├── Users
├── Meetings           ← Page 1
├── Attendance         ← Page 2 (separate)
├── Contributions
├── Projects
└── Announcements

Users had to navigate between two pages
Context switching required
Different menu items for related tasks
```

### AFTER: Combined Page

```
Admin Navigation Menu
├── Dashboard
├── Users
├── Meetings & Attendance ← Single page with tabs
├── Contributions
├── Projects
└── Announcements

Single page for both tasks
Tab switching within same page
Related tasks grouped together
Reduced navigation friction
```

## User Experience Flow

### Scenario: Prepare and Record a Meeting

```
Step 1: Create Meeting
├─ Navigate to Meetings & Attendance
├─ Ensure "Meetings" tab is active
├─ Click "Create New Meeting"
├─ Fill form: title, date, time, location
├─ Click "Create Meeting"
└─ Meeting appears in table ✓

Step 2: Record Attendance (Same Session)
├─ Click "Attendance" tab (no navigation away!)
├─ Find the meeting you just created
├─ Click "Record/View Attendance"
├─ Modal opens with list of parents
├─ Mark each as Present or Absent
├─ Attendance records saved ✓
└─ Done! No page reloads

TOTAL TIME: Fewer clicks, better workflow, same place
```

## Interface Elements

### Header

```
┌──────────────────────────────────────────────────────┐
│ Meetings & Attendance Management    [Create Button] │
│ Manage meetings and record attendance                │
└──────────────────────────────────────────────────────┘
```

### Tab Bar

```
┌──────────────────────────────────────────────────────┐
│ [Meetings] ━━━━  [Attendance]                        │
│
│ Meetings Tab:
│ - Blue underline (active)
│ - Dark text
│ - Shows: meeting table + create button
│
│ Attendance Tab:
│ - Gray text (inactive) when not selected
│ - Blue underline (active) when selected
│ - Shows: attendance table
└──────────────────────────────────────────────────────┘
```

### Meetings Table

```
┌─────────┬──────────────┬──────────┬─────────┬────────┐
│ Title   │ Date & Time  │ Location │ Status  │ Actions│
├─────────┼──────────────┼──────────┼─────────┼────────┤
│ Monthly │ Dec 25, 2025 │ Room A   │ SCHEDUL │ View   │
│ GA      │ 10:00-11:00  │          │ ED      │ Delete │
├─────────┼──────────────┼──────────┼─────────┼────────┤
│ ...     │ ...          │ ...      │ ...     │ ...    │
└─────────┴──────────────┴──────────┴─────────┴────────┘
```

### Attendance Table

```
┌─────────────────────┬──────────────┬──────────────────────┐
│ Meeting             │ Attendees    │ Actions              │
├─────────────────────┼──────────────┼──────────────────────┤
│ Monthly GA          │ 5 recorded   │ Record/View          │
│ Dec 25, 2025        │              │ Attendance           │
├─────────────────────┼──────────────┼──────────────────────┤
│ Emergency Meeting   │ 8 recorded   │ Record/View          │
│ Jan 10, 2026        │              │ Attendance           │
└─────────────────────┴──────────────┴──────────────────────┘
```

### Create Meeting Modal

```
┌─────────────────────────────────────────────────────┐
│ Create New Meeting                           [x]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Meeting Title: [________________]                    │
│                                                      │
│ Description: [________________________________]     │
│              [________________________________]     │
│                                                      │
│ Meeting Type: [General Meeting        ▼]            │
│                                                      │
│ Date: [2025-12-25]                                  │
│                                                      │
│ Start Time: [10:00 AM    ▼]                         │
│ End Time:   [11:00 AM    ▼]                         │
│                                                      │
│ Location: [School Auditorium]                       │
│                                                      │
│                  [Cancel]  [Create Meeting]          │
└─────────────────────────────────────────────────────┘
```

### View Meeting Modal

```
┌─────────────────────────────────────────────────────┐
│ View Meeting                                 [x]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Meeting Title: [Monthly GA] (READ-ONLY)            │
│                (gray background)                    │
│                                                      │
│ Description: [Full description text...] (GRAYED)   │
│              [________________________]              │
│                                                      │
│ Meeting Type: [General Meeting      ▼] (GRAYED)    │
│                                                      │
│ Date: [2025-12-25] (GRAYED)                        │
│                                                      │
│ Start Time: [10:00 AM    ▼] (GRAYED)               │
│ End Time:   [11:00 AM    ▼] (GRAYED)               │
│                                                      │
│ Location: [School Auditorium] (GRAYED)             │
│                                                      │
│                  [Close]  [Edit]                     │
└─────────────────────────────────────────────────────┘

↓ Click "Edit" ↓

┌─────────────────────────────────────────────────────┐
│ Edit Meeting                                 [x]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Meeting Title: [Monthly GA______] (EDITABLE)       │
│                (white background)                   │
│                                                      │
│ Description: [Full description text...] (EDITABLE)│
│              [________________________]              │
│                                                      │
│ Meeting Type: [General Meeting      ▼] (EDITABLE) │
│                                                      │
│ Date: [2025-12-25] (EDITABLE)                      │
│                                                      │
│ Start Time: [10:00 AM    ▼] (EDITABLE)             │
│ End Time:   [11:00 AM    ▼] (EDITABLE)             │
│                                                      │
│ Location: [School Auditorium_____] (EDITABLE)     │
│                                                      │
│                [Cancel]  [Update Meeting]           │
└─────────────────────────────────────────────────────┘
```

### Record Attendance Modal

```
┌─────────────────────────────────────────────────────┐
│ Record Attendance                            [x]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Mark attendance for each parent below:              │
│                                                      │
│ ┌───────────────────────────────────────────────┐  │
│ │ Juan Dela Cruz                    [Present]  │  │
│ │ Son: Pedro Dela Cruz               [Absent]  │  │
│ └───────────────────────────────────────────────┘  │
│                                                      │
│ ┌───────────────────────────────────────────────┐  │
│ │ Maria Santos                      [Present]  │  │
│ │ Daughter: Ana Santos               [Absent]  │  │
│ └───────────────────────────────────────────────┘  │
│                                                      │
│ ┌───────────────────────────────────────────────┐  │
│ │ Jose Gomez                        [Present]  │  │
│ │ Son: Miguel Gomez                  [Absent]  │  │
│ └───────────────────────────────────────────────┘  │
│                                                      │
│ (Scroll if more entries)                           │
│                                                      │
│ Auto-saves on each click                           │
└─────────────────────────────────────────────────────┘
```

## Color Coding

### Tab States

```
Active Tab:   [Meetings] Blue border, blue text
Inactive Tab: [Attendance] Gray text, transparent border
Hover:        Darker gray text
```

### Modal States

```
Read-Only Fields: Gray background (bg-gray-50)
Editable Fields:  White background
Disabled Text:    Gray color with "not-allowed" cursor
Active Input:     Blue ring focus
```

### Status Badges

```
SCHEDULED:  Blue background, blue text
ONGOING:    Green background, green text
COMPLETED:  Gray background, gray text
CANCELLED:  Red background, red text
POSTPONED:  Yellow background, yellow text
```

## Interaction Patterns

### Click Actions

```
[Create New Meeting] → Modal opens (form)
[View]              → Modal opens (read-only) + [Edit] button
[Edit]              → Fields unlock, buttons change
[Update Meeting]    → Save and close
[Record/View]       → Modal opens (attendance list)
[Present/Absent]    → Save (no modal close)
[Delete]            → Confirm → Remove
```

### State Transitions

```
Meetings Tab
    ├─ Default: Table view
    ├─ Click Create: Modal form
    ├─ Click View: Modal read-only
    ├─ Click Edit: Modal editable
    └─ Click Delete: Confirmation

Attendance Tab
    ├─ Default: Table view
    └─ Click Record: Modal with attendance list
```

## Navigation Summary

```
Pages before:  2 separate pages (Meetings + Attendance)
Pages after:   1 page with 2 tabs
Navigation:    Click tab instead of navigate
Performance:   Faster (no page reload)
UX:            Better (related tasks together)
```

## Status Indicators

### Visual Feedback

```
Loading:       Spinner in center of page
Success:       Alert message + data updates
Error:         Alert message in red
Validation:    Red text under field
Disabled:      Gray text, cursor "not-allowed"
Active:        Blue underline on tab
```

## Summary

✅ **One Page**: Both meetings and attendance management
✅ **Tab Interface**: Easy switching between features
✅ **Read-Only First**: Safe viewing before editing
✅ **Modal System**: Clear interactions
✅ **Auto-Save**: Attendance records save immediately
✅ **Validation**: Time and data validation
✅ **Responsive**: Works on all devices
✅ **Fast**: No page reloads on tab switch
