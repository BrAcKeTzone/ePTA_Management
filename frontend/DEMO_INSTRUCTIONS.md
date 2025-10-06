# PTA Management System - Demo Instructions

## Getting Started

This is a prototype version of the PTA Management System using dummy data for demonstration purposes. All data is simulated and stored locally.

### 🔧 Configuration

The system is currently configured to use dummy data. You can change this in `src/config/index.js`:

```javascript
USE_DUMMY_DATA: true; // Set to false to use real API
```

### 🔑 Demo Login Credentials

#### Admin Account

- **Email:** `admin@jhcsc.edu.ph`
- **Password:** `admin123`
- **Role:** Administrator (Full system access)

#### Parent Accounts

- **Email:** `parent1@gmail.com` **Password:** `parent123`
- **Email:** `parent2@gmail.com` **Password:** `parent123`
- **Email:** `parent3@gmail.com` **Password:** `parent123`
- **Email:** `parent4@gmail.com` **Password:** `parent123`
- **Email:** `parent5@gmail.com` **Password:** `parent123`
- **Email:** `parent6@gmail.com` **Password:** `parent123`
- **Email:** `parent7@gmail.com` **Password:** `parent123`

### 📊 Demo Data Overview

The system includes realistic sample data:

#### Users (8 total)

- 1 Admin user
- 7 Parent users with different family situations

#### Students (8 total)

- Elementary: 4 students (Grades 1-6)
- High School: 4 students (Grades 7-12)
- Each linked to different parents

#### Attendance (3 meetings)

- Monthly PTA Meeting (January 2024)
- Budget Planning Meeting (February 2024)
- School Event Planning Meeting (March 2024)

#### Contributions (7 payments)

- Monthly dues and project contributions
- Various payment statuses (Paid, Pending, Overdue)

#### Announcements (5 active)

- School events and important notices
- Featured and regular announcements

#### Projects (3 active)

- School Improvement Project
- Sports Equipment Fund
- Computer Lab Upgrade
- Each with milestones and documents

#### Clearance Requests (4 requests)

- Various purposes and statuses
- Transfer certificates, good moral certificates

### 🎯 Demo Features to Test

#### As Admin:

1. **Dashboard** - View system overview and statistics
2. **User Management** - Browse and manage users
3. **Attendance Management** - Track meeting attendance
4. **Contributions** - Monitor payments and dues
5. **Projects** - Manage PTA projects and documentation
6. **Announcements** - Create and manage school communications
7. **Clearance** - Process parent clearance requests
8. **Reports** - Generate various system reports

#### As Parent:

1. **Dashboard** - View personal overview
2. **My Attendance** - Check meeting participation
3. **My Contributions** - View payment history and balance
4. **Announcements** - Read school notifications
5. **Projects** - Follow PTA project progress
6. **Clearance** - Request clearance certificates

### 🔄 Demo Simulation Features

#### Realistic API Behavior:

- Network delays (300-1200ms) to simulate real API calls
- Proper success/error responses
- Data persistence during session (localStorage)
- Authentication state management

#### Data Operations:

- Create, Read, Update, Delete operations
- Search and filtering
- Pagination support
- File upload simulation

### 🚀 Getting Started

1. **Start the development server:**

   ```bash
   cd frontend
   npm run dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:5173`

3. **Login with demo credentials:**
   Use any of the provided login credentials above

4. **Explore the system:**
   Try different features based on your role (Admin vs Parent)

### 💡 Tips for Demo

- **Switch between accounts** to see different user perspectives
- **Test all major features** to see the full system capabilities
- **Check responsive design** on different screen sizes
- **Notice the realistic data** that matches PTA operations
- **Use browser dev tools** to see API simulation in action

### 🔧 Customization

To modify demo data, edit the JSON files in `src/data/`:

- `users.json` - User accounts and profiles
- `students.json` - Student information
- `attendance.json` - Meeting attendance records
- `contributions.json` - Payment and contribution data
- `announcements.json` - School announcements
- `projects.json` - PTA projects and milestones
- `clearance.json` - Clearance requests and certificates

### 📱 Mobile Testing

The system is fully responsive. Test on:

- Desktop browsers
- Tablet devices
- Mobile phones
- Different screen orientations

### 🎨 Theme Testing

The system supports both light and dark themes. Use the theme toggle in the navbar to switch between modes.

---

**Note:** This is a demonstration prototype. All data is simulated and will not persist between browser sessions unless specifically saved to localStorage by the dummy service.
