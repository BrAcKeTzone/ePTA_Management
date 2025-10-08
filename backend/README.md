# Online Management System for the Parent and Teacher Association of JHCSC Dumingag Campus

## Overview

This project is an Online Management System designed for the Parent and Teacher Association (PTA) of JHCSC Dumingag Campus. It aims to streamline PTA operations, improve transparency, and enhance communication between parents and teachers through a web-based platform.

## Technologies Used

- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Express.js**: A web application framework for Node.js, used to build the backend.
- **Prisma**: An ORM (Object-Relational Mapping) tool that simplifies database interactions.
- **MySQL**: A relational database management system used to store application data.
- **JWT**: JSON Web Tokens for secure authentication.
- **Nodemailer**: For sending emails (OTP verification).

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Prisma schema for database models
│   └── migrations/         # Database migrations
├── src/
│   ├── api/                # Feature-based modules (routes, controllers, services)
│   │   ├── announcements/
│   │   │   ├── ANNOUNCEMENTS_API_DOCS.md
│   │   │   ├── announcements.controller.ts
│   │   │   ├── announcements.route.ts
│   │   │   ├── announcements.service.ts
│   │   │   └── announcements.validation.ts
│   │   ├── attendance/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.test.ts
│   │   │   └── auth.validation.ts
│   │   ├── contributions/
│   │   ├── meetings/
│   │   ├── penalties/
│   │   ├── projects/
│   │   ├── students/
│   │   │   ├── STUDENT_API_DOCS.md
│   │   │   ├── students.controller.ts
│   │   │   ├── students.route.ts
│   │   │   ├── students.service.ts
│   │   │   └── students.validation.ts
│   │   └── users/
│   │   │   ├── USERS_API_DOCS.md
│   │   │   ├── users.controller.ts
│   │   │   ├── users.route.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.validation.ts
│   ├── configs/
│   │   ├── cloudinary.ts       # Cloudinary configuration
│   │   └── prisma.ts           # Prisma client instance
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/
│   │   └── index.ts          # Main API router
│   ├── types/
│   │   └── environment.d.ts  # TypeScript environment declarations
│   ├── utils/                # Utility functions and classes
│   │   ├── announcementNotification.ts
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── email.ts
│   │   └── errors.ts
│   ├── app.ts              # Express application setup and middleware
│   └── server.ts           # Server initialization
├── .env                    # Environment variables (DB connection, JWT secret, etc.)
├── FIRST_USER_ADMIN.md     # Documentation for first user auto-admin feature
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Features

- **User Management**: ✨ **Complete and Functional**
  - Secure registration and login for parents and admins
  - **First User Auto-Admin**: The first user to register automatically becomes an admin
  - **OTP Verification**: All registrations require email verification via OTP
  - User profile management (view, update)
  - Password change functionality
  - Admin user management (list, update, deactivate/activate)
  - Role management (ADMIN/PARENT)
  - Account activation/deactivation
  - User statistics and analytics
- **Role-Based Access Control (RBAC)**: Differentiated permissions for admins and parents.
- **Student Management**: ✨ **Complete and Functional**
  - Comprehensive student record management with search, filtering, and status tracking
  - Student-parent linking with approval workflow
  - One parent per student, multiple students per parent
  - College-specific fields (programs, year levels, academic years)
- **Announcements System**: ✨ **Complete and Functional**
  - Create, manage, and distribute announcements
  - Targeted announcements (ALL, PARENTS, ADMINS, SPECIFIC_PROGRAM, SPECIFIC_YEAR_LEVEL)
  - Priority levels (LOW, MEDIUM, HIGH, URGENT)
  - Scheduled publishing with expiry dates
  - Automatic email notifications to targeted recipients
  - Draft mode for preparing announcements
  - Batch email sending to prevent server overload
  - Full statistics and reporting
- **Settings Management**: ✨ **Complete and Functional**
  - System-wide configuration management
  - Penalty rates configuration (absence and late penalties)
  - Contribution amounts management (monthly and project contributions)
  - Payment basis settings (PER_STUDENT, PER_FAMILY, PER_MEETING)
  - Meeting requirements configuration
  - Document category management
  - Academic year settings
  - System information and notification preferences
- **Meetings Management**: ✨ **Complete and Functional**
  - Create, schedule, and manage meetings
  - Multiple meeting types (GENERAL, SPECIAL, EMERGENCY, COMMITTEE, ANNUAL, QUARTERLY)
  - Virtual and physical meeting support
  - Add minutes and resolutions to meetings
  - Track quorum and attendance
  - Meeting history and upcoming meetings
  - Email notifications to members
  - Meeting statistics and reporting
  - Cancel and postpone meetings
- **Attendance Tracking**: ✨ **Complete and Functional**
  - Record attendance for meetings (single and bulk operations)
  - Track check-in/check-out times
  - Mark late arrivals with late minutes tracking
  - Automatic penalty calculation for absences and late arrivals
  - Attendance status tracking (PRESENT, ABSENT, EXCUSED)
  - Excuse reasons and remarks support
  - Comprehensive attendance reports with statistics
  - Filter by meeting, parent, status, date range
  - Attendance rate and late rate analytics
  - Penalty calculation and application system
  - Group reports by meeting, parent, or status
- **Penalties Management**: ✨ **Complete and Functional**
  - Create and track penalties for parents
  - Multiple payment methods (CASH, BANK_TRANSFER, GCASH, PAYMAYA, CHECK, OTHER)
  - Payment status tracking (UNPAID, PARTIAL, PAID, WAIVED, OVERDUE)
  - Record full or partial payments
  - Payment history and audit trail
  - Due date management with overdue tracking
  - Penalty waiver system with reasons
  - Discount/adjustment support
  - Comprehensive penalty reports with statistics
  - Filter by parent, meeting, payment status, date range
  - Payment and collection rate analytics
  - Group reports by parent, meeting, or status
  - Automatic overdue status updates
- **Contributions Management**: ✨ **Complete and Functional**
  - Track financial contributions from parents
  - 6 contribution types (MONTHLY, PROJECT, SPECIAL, DONATION, MEMBERSHIP, EVENT)
  - 5 contribution statuses (PENDING, PARTIAL, PAID, OVERDUE, WAIVED)
  - Full and partial payment support with 6 payment methods
  - Payment history and audit trail
  - Academic year and period tracking
  - Due date management with overdue tracking
  - Waiver system with reasons
  - Adjustment/discount support
  - Link contributions to specific projects
  - Comprehensive reports with statistics and grouping
  - Collection rate and analytics
  - Filter by parent, project, type, status, academic year
- **Projects Management**: ✨ **Complete and Functional**
  - Create and manage PTA projects
  - 5 project statuses (PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
  - 4 priority levels (LOW, MEDIUM, HIGH, URGENT)
  - Complete financial tracking (budget, raised funds, expenses, balance)
  - Track funding goals and target beneficiaries
  - Progress percentage monitoring
  - Record and manage project expenses with categories
  - Project updates/milestones with public/private visibility
  - Automatic calculation of raised funds from contributions
  - Budget utilization and funding progress analytics
  - Comprehensive reports with expenses and contributions
  - Filter by status, priority, date range
  - Search functionality for projects

## API Endpoints

The API is structured by features. Each feature module in `src/api/` contains its own routes, controllers, and business logic. The main router is located at `src/routes/index.ts`.

### Completed & Functional APIs:

- **`/api/auth`**: Authentication routes (login, register, OTP verification, password reset/change)
- **`/api/users`**: User management system (see [USERS_API_DOCS.md](src/api/users/USERS_API_DOCS.md))
- **`/api/students`**: Student record management with parent linking (see [STUDENT_API_DOCS.md](src/api/students/STUDENT_API_DOCS.md))
- **`/api/announcements`**: Comprehensive announcements system (see [ANNOUNCEMENTS_API_DOCS.md](src/api/announcements/ANNOUNCEMENTS_API_DOCS.md))
- **`/api/settings`**: System configuration management (see [SETTINGS_API_DOCS.md](src/api/settings/SETTINGS_API_DOCS.md))
- **`/api/meetings`**: Meeting management with minutes, resolutions, and notifications
- **`/api/attendance`**: Attendance tracking with bulk operations, reports, and penalty calculations
- **`/api/penalties`**: Penalty management with payment processing and reports
- **`/api/contributions`**: Contribution tracking with payment processing, waiver system, and reports
- **`/api/projects`**: Project management with financial tracking, expenses, and progress updates

All core features are now complete and functional!

### API Documentation

For detailed API documentation, refer to:

- **Users API**: [src/api/users/USERS_API_DOCS.md](src/api/users/USERS_API_DOCS.md)
- **Announcements API**: [src/api/announcements/ANNOUNCEMENTS_API_DOCS.md](src/api/announcements/ANNOUNCEMENTS_API_DOCS.md)
- **Students API**: [src/api/students/STUDENT_API_DOCS.md](src/api/students/STUDENT_API_DOCS.md)
- **Settings API**: [src/api/settings/SETTINGS_API_DOCS.md](src/api/settings/SETTINGS_API_DOCS.md)
- **Attendance API**: [src/api/attendance/ATTENDANCE_API_DOCS.md](src/api/attendance/ATTENDANCE_API_DOCS.md)
- **First User Admin**: [FIRST_USER_ADMIN.md](FIRST_USER_ADMIN.md)

## Setup and Installation

1. **Clone the repository**:

   ```bash
   git clone <your-repository-url>
   cd Online_Management_System_for_the_Parent_and_Teacher_Association_of_JHCSC_Dumingag_Campus/ePTA_Management/backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   - Create a `.env` file in the `backend` directory.
   - Add the following variables, replacing the placeholder values:

     ```env
     # Database Configuration
     DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

     # Server Configuration
     PORT=3000
     CORS_ORIGIN=*

     # JWT Configuration
     ACCESS_TOKEN_SECRET="your_access_token_secret"
     ACCESS_TOKEN_EXPIRY="1d"
     REFRESH_TOKEN_SECRET="your_refresh_token_secret"
     REFRESH_TOKEN_EXPIRY="10d"

     # Email Configuration (for OTP and Announcements)
     EMAIL_HOST="smtp.gmail.com"
     EMAIL_PORT=587
     EMAIL_USERNAME="your_email@gmail.com"
     EMAIL_PASSWORD="your_app_password"
     ```

   - **Email Setup Note**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

4. **Apply database migrations**:

   - Ensure your MySQL server is running.
   - Run the following command to sync the database with your Prisma schema:

   ```bash
   npx prisma db push
   ```

   - Or create a migration:

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run the application**:

   ```bash
   npm start
   ```

6. **Run in development mode (with auto-reloading)**:
   ```bash
   npm run dev
   ```

## Usage

Once the server is running, you can access the API at `http://localhost:8000` (or your configured port). Use an API client like Postman or integrate with the frontend application to interact with the endpoints.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs, feature requests, or improvements.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
