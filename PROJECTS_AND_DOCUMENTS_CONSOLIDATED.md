# Projects & Documents Management - Consolidated Page

## Overview

The Projects & Documents Management page consolidates two related workflows into a single interface:

- **Projects Tab**: Create, view, and manage PTA projects with full CRUD operations
- **Documents Tab**: Upload and manage meeting documents, resolutions, and meeting minutes

## Architecture

### File Location

- **Component**: `frontend/src/pages/Admin/ProjectsAndDocuments.jsx`
- **Route**: `/admin/projects`
- **Previous Components**:
  - `frontend/src/pages/Admin/Projects.jsx` (deprecated)

### Tab Structure

```
┌─────────────────────────────────────┐
│ Projects & Documents Management     │
├─────────────────────────────────────┤
│ [Projects] ━━━  [Documents]         │
│                                      │
│ ┌──────────────────────────────────┐│
│ │ Projects Tab Content             ││
│ │ - Projects table                 ││
│ │ - Create button                  ││
│ │ - View/Delete actions            ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Features

### Projects Tab

#### Create Project

- **Button**: "Create New Project"
- **Fields**:
  - Project Name (required)
  - Description (optional)
  - Priority: LOW, MEDIUM, HIGH, URGENT
  - Status: PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
  - Start Date (required)
  - End Date (optional)
  - Budget in Pesos (optional)
- **Validation**:
  - Project name is required
  - Start date is required
  - Budget must be numeric if provided

#### Project Table Columns

| Column       | Description                                 |
| ------------ | ------------------------------------------- |
| Project Name | Name and brief description                  |
| Priority     | Visual badge with color coding              |
| Status       | Current project status with color indicator |
| Duration     | Start and end dates                         |
| Budget       | Budget in PHP currency format               |
| Actions      | View and Delete buttons                     |

#### View Project

- Click "View" button to open details modal
- Shows full project information
- Can update Priority and Status from the modal
- Changes save immediately

#### Delete Project

- Click "Delete" button
- Confirmation dialog appears
- Project and all related data deleted on confirmation

### Documents Tab

#### Upload Document

- **Button**: "Upload Document"
- **Fields**:
  - Project (optional dropdown)
  - Document Title (required)
  - Description (optional)
  - Category: meeting_minutes, resolutions, agenda, report, other
  - File (required, file upload)
- **Validation**:
  - Title is required
  - File must be selected

#### Documents Table Columns

| Column         | Description                          |
| -------------- | ------------------------------------ |
| Document Title | Title and description                |
| Category       | Categorized with badge               |
| Project        | Associated project name or "General" |
| Upload Date    | When document was uploaded           |
| Actions        | Download and Delete buttons          |

#### Download Document

- Click "Download" button
- Browser automatically downloads the file

#### Delete Document

- Click "Delete" button
- Confirmation dialog appears
- Document deleted on confirmation

## State Management

### Tab State

```javascript
const [activeTab, setActiveTab] = useState("projects"); // "projects" or "documents"
```

### Projects State

```javascript
const [projects, setProjects] = useState([]);
const [showCreateProject, setShowCreateProject] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);
const [newProject, setNewProject] = useState({
  name: "",
  description: "",
  status: "PLANNING",
  startDate: "",
  endDate: "",
  budget: "",
  priority: "MEDIUM",
});
```

### Documents State

```javascript
const [documents, setDocuments] = useState([]);
const [showUploadDocument, setShowUploadDocument] = useState(false);
const [documentUpload, setDocumentUpload] = useState({
  projectId: "",
  title: "",
  description: "",
  category: "meeting_minutes",
  file: null,
});
```

## API Integration

### Projects API Calls

- `projectsApi.getAllProjects()` - Fetch all projects
- `projectsApi.createProject(projectData)` - Create new project
- `projectsApi.updateProject(id, updates)` - Update project fields
- `projectsApi.deleteProject(id)` - Delete project

### Documents API Calls

- `projectsApi.getAllMeetingDocuments()` - Fetch all documents
- `projectsApi.uploadMeetingDocument(projectId, data)` - Upload document
- `projectsApi.downloadDocument(id)` - Download document
- `projectsApi.deleteDocument(id)` - Delete document

## User Interactions

### Creating a Project

1. Click "Create New Project" button
2. Fill in project details in modal
3. Click "Create Project"
4. Modal closes, projects list refreshes
5. Success message shown

### Managing Projects

1. View details: Click "View" button
2. Change status: Select new status in modal
3. Change priority: Select new priority in modal
4. Delete: Click "Delete", confirm

### Uploading a Document

1. Switch to "Documents" tab
2. Click "Upload Document" button
3. Fill in document details (optional: select project)
4. Select file from computer
5. Click "Upload Document"
6. Modal closes, documents list refreshes

### Managing Documents

1. Download: Click "Download" button
2. Delete: Click "Delete" button, confirm

## Tab Switching

- Click "Projects" to view projects tab
- Click "Meeting Documents & Resolutions" to view documents tab
- Active tab indicated by blue underline
- Content switches without page reload
- Data persists (no re-fetching on tab switch)

## Modals

### Create Project Modal

- Title: "Create New Project"
- Size: Large (lg)
- Fields: All project creation fields
- Buttons: Cancel, Create Project

### Upload Document Modal

- Title: "Upload Meeting Document/Resolution"
- Size: Large (lg)
- Fields: Project dropdown, title, description, category, file input
- Buttons: Cancel, Upload Document

### View Project Modal

- Title: "Project Details"
- Size: Large (lg)
- Shows: Full project information
- Editable: Priority and Status fields
- Buttons: Close

## Color Coding

### Status Badges (Projects)

- PLANNING: Gray
- ACTIVE: Green
- ON_HOLD: Yellow
- COMPLETED: Blue
- CANCELLED: Red

### Priority Badges (Projects)

- LOW: Gray
- MEDIUM: Blue
- HIGH: Orange
- URGENT: Red

### Category Badges (Documents)

- All categories: Blue

## Error Handling

- API errors display as alert messages
- Failed requests show error details
- Validation errors shown before submission
- File upload requires file selection
- Project name required for creation

## Performance Considerations

1. **Initial Load**: Fetches both projects and documents on mount
2. **Tab Switching**: No re-fetch (data already loaded)
3. **Lazy Modals**: Modals render only when open
4. **Efficient Updates**: Only affected data re-fetched after changes

## Migration from Old Pages

### Previous Implementation

- Two separate pages: Projects.jsx and Documents in Projects.jsx
- Separate menu items/routes for each

### New Implementation

- Single consolidated page: ProjectsAndDocuments.jsx
- Single route: /admin/projects
- Tab-based navigation
- Same API endpoints, unified UI

### Breaking Changes

- None - API endpoints remain the same
- Old Projects.jsx can be deprecated

## Future Enhancements

1. **Project Filtering**

   - Filter by status
   - Filter by priority
   - Date range filtering

2. **Document Organization**

   - Search documents
   - Filter by category
   - Filter by project

3. **Advanced Features**

   - Project templates
   - Document version control
   - Bulk operations
   - Export to PDF/Excel

4. **Analytics**
   - Project progress tracking
   - Document statistics
   - Timeline views

## Troubleshooting

### Documents not showing after upload

- Verify file was selected
- Check browser console for API errors
- Ensure project association is correct

### Cannot update project status

- Verify user has admin role
- Check network connectivity
- Try refreshing the page

### Create project fails

- Ensure project name is provided
- Verify start date is selected
- Check for valid date range (end date > start date)

## Testing Checklist

- [ ] Create new project with all fields
- [ ] Create project with minimal fields
- [ ] Update project status
- [ ] Update project priority
- [ ] Delete project (with confirmation)
- [ ] Upload document with project association
- [ ] Upload document without project
- [ ] Download document
- [ ] Delete document
- [ ] Switch between tabs
- [ ] Tab data persists on switch
- [ ] Modals open/close correctly
- [ ] Error messages display properly
