# Announcement Publish Feature Implementation

## Problem

Announcements were showing "Draft" status in admin side and not appearing on parent side because:

1. The `isPublished` field defaulted to `false` in validation
2. `getActiveAnnouncements` filters for `isPublished: true`
3. Admin UI had no way to publish/unpublish announcements
4. Create/Edit forms didn't include `isPublished` field
5. **CRITICAL**: Published announcements need `publishDate` set for the query to work properly, but it was `NULL`

## Root Cause

The `getActiveAnnouncements` service orders results by `publishDate`:

```typescript
orderBy: [{ priority: "desc" }, { publishDate: "desc" }];
```

If `publishDate` is `NULL`, announcements won't appear properly to parents even when `isPublished: true`.

## Solution Implemented

### 1. Backend Changes

#### Route (`announcements.route.ts`)

- ✅ Added `PATCH /:id/toggle-publish` route

#### Controller (`announcements.controller.ts`)

- ✅ Added `togglePublish` controller that calls service and returns success response

#### Service (`announcements.service.ts`)

- ✅ Added `togglePublish` service that:

  - Finds announcement by ID
  - Toggles the `isPublished` field
  - **Sets `publishDate` to current date when publishing**
  - **Clears `publishDate` when unpublishing**
  - Returns updated announcement

- ✅ Updated `createAnnouncement` service:

  - **Automatically sets `publishDate` to current date when `isPublished: true`**
  - Sets `publishDate` to `null` when `isPublished: false`

- ✅ Updated `updateAnnouncement` service:
  - **Automatically sets `publishDate` when changing from unpublished to published**
  - **Clears `publishDate` when unpublishing**
  - Added `isPublished` to UpdateAnnouncementData interface

#### Validation (`announcements.validation.ts`)

- ✅ Changed `isPublished` default from `false` to `true`
  - New announcements will auto-publish by default

### 2. Frontend Changes

#### API (`announcementsApi.js`)

- ✅ Added `togglePublish` function that calls `PATCH /api/announcements/:id/toggle-publish`

#### Admin Page (`Admin/Announcements.jsx`)

- ✅ Added `isPublished: true` to `newAnnouncement` initial state
- ✅ Added `handleTogglePublish` function
- ✅ Added **Publish/Unpublish button** in desktop table actions
- ✅ Added **Publish/Unpublish button** in mobile card actions
- ✅ Added **"Publish immediately"** checkbox in Create modal
- ✅ Added **"Publish"** checkbox in Edit modal
- ✅ Green styling for Publish button when announcement is draft

## How to Use

### ⚠️ IMPORTANT: Fix Existing Announcements First

If you have **existing published announcements** that aren't showing on the parent side, you need to fix their `publishDate`:

**Run this script in the backend folder:**

```bash
cd backend
node fix-publish-dates.js
```

This script will:

- Find all published announcements with `publishDate: NULL`
- Set their `publishDate` to their `createdAt` timestamp
- Make them visible to parents immediately

**Output example:**

```
🔍 Checking for published announcements without publishDate...

📝 Found 1 published announcement(s) without publishDate:

1. ID: 2
   Title: "hello"
   Created: Fri Nov 14 2025 03:09:14 GMT+0800
   publishDate: NULL

🔧 Updating publishDate to createdAt for these announcements...

✓ Updated announcement #2: "hello"

✅ Successfully updated 1 announcement(s)!
```

### Creating New Announcements

1. Open "Create Announcement" modal
2. Fill in title, content, priority, etc.
3. ✅ **"Publish immediately (visible to parents)"** checkbox is checked by default
4. Uncheck if you want to save as draft
5. Click "Create Announcement"

### Publishing Existing Draft Announcements

**Desktop View:**

1. Find the announcement with "Draft" status
2. Click the **"Publish"** button (green highlighted)
3. Announcement will immediately appear on parent side

**Mobile View:**

1. Scroll to draft announcement card
2. Status shows "Draft"
3. Tap **"Publish"** button (green highlighted)
4. Announcement will immediately appear on parent side

### Unpublishing Announcements

1. Find published announcement
2. Click **"Unpublish"** button
3. Announcement will be hidden from parents (saved as draft)

### Editing Announcements

1. Click "Edit" button
2. Modal opens with current values
3. Check/uncheck **"Publish (visible to parents)"** checkbox
4. Click "Update Announcement"

## Status Display

### Admin Side - Mobile Cards

Shows: `Status: Published` or `Status: Draft`

### Admin Side - Desktop Table

Shows badges:

- 🟡 **Featured** (if `isFeatured: true`)
- 🔴 **Expired** (if past `expiryDate`)
- ⚫ **Archived** (if `isArchived: true`)
- _(No badge for draft/published status in table view)_

### Parent Side

Only shows announcements where:

- `isPublished: true`
- `isArchived: false`
- Not expired (or no expiry date)

## Technical Details

### Database Field

```prisma
model Announcement {
  isPublished Boolean @default(true)
  // other fields...
}
```

### API Endpoint

```
PATCH /api/announcements/:id/toggle-publish
```

### Response

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "isPublished": true
    // other fields...
  },
  "message": "Publish status toggled successfully"
}
```

## What Changed for Existing Announcements

### Before This Fix

- All existing announcements have `isPublished: false` (Draft)
- Not visible to parents
- No way to publish from admin UI

### After This Fix

- Can now click "Publish" button to make them visible to parents
- New announcements auto-publish by default
- Can toggle publish status anytime

## Testing Checklist

- [x] Backend route, controller, service added
- [x] Frontend API function added
- [x] Desktop publish button works
- [x] Mobile publish button works
- [x] Create modal has publish checkbox (checked by default)
- [x] Edit modal has publish checkbox
- [x] **publishDate automatically set when publishing**
- [x] **publishDate cleared when unpublishing**
- [x] **createAnnouncement sets publishDate if isPublished:true**
- [x] **updateAnnouncement sets publishDate when publishing**
- [x] **togglePublish sets publishDate when publishing**
- [x] Published announcements appear on parent side
- [x] Draft announcements don't appear on parent side
- [x] Status display correct in mobile cards
- [x] No TypeScript/ESLint errors
- [x] **Fix script for existing announcements created and tested**

## How to Publish All Existing Drafts (Bulk)

### Method 1: Using the Fix Script (Recommended)

```bash
cd backend
node fix-publish-dates.js
```

### Method 2: Direct SQL

```sql
UPDATE Announcement
SET publishDate = createdAt
WHERE isPublished = true AND publishDate IS NULL;
```

### Method 3: Manual (Admin UI)

Publish them one by one using the new **Publish** button in the admin UI.

## Troubleshooting

### Problem: Announcements still not showing on parent side after clicking Publish

**Solution:** Run the fix script to set `publishDate`:

```bash
cd backend
node fix-publish-dates.js
```

### Problem: New announcements not appearing

**Check:**

1. ✅ `isPublished` is `true` (should be checked by default)
2. ✅ `publishDate` is set (automatic now)
3. ✅ `isArchived` is `false`
4. ✅ `expiryDate` is either `null` or in the future

### Problem: Priority colors not showing correctly

The parent side expects uppercase priority values: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

### How to Verify in Database

Check published announcements:

```sql
SELECT id, title, isPublished, publishDate, createdAt, isArchived, expiryDate
FROM Announcement
WHERE isPublished = true
ORDER BY publishDate DESC;
```

Find problematic announcements:

```sql
SELECT id, title, isPublished, publishDate
FROM Announcement
WHERE isPublished = true AND publishDate IS NULL;
```
