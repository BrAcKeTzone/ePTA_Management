# JHCSC Dumingag Campus - PTA Management System (Frontend)

## 📖 Project Overview

The **ePTA Management System** is a comprehensive web application designed to digitize and streamline the operations of the Parent and Teacher Association (PTA) at JHCSC Dumingag Campus. This frontend application provides an intuitive interface for parents, administrators, and PTA officers to manage various aspects of PTA operations.

## 🎯 System Purpose

This system addresses the need to:

- **Digitize Paper-based Operations**: Replace manual attendance tracking, contribution records, and meeting management
- **Improve Transparency**: Provide clear visibility into PTA finances, projects, and activities
- **Enhance Communication**: Facilitate better communication between PTA officers and parents
- **Streamline Administration**: Automate routine tasks like attendance tracking and contribution management
- **Generate Reports**: Provide comprehensive reporting capabilities for PTA activities

## 🏗️ System Architecture

### Frontend Stack

- **React 19** - Modern UI library with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication

### Key Features Implemented

#### 🔐 Authentication System

- **Multi-step Registration**: Email verification with OTP
- **Secure Login**: JWT-based authentication
- **Password Management**: Reset and change password functionality
- **Role-based Access**: Different interfaces for Admin and Parent roles

#### 👨‍💼 Admin Dashboard

- **User Management**: CRUD operations for managing parents and students
- **Attendance Management**: Track and manage meeting attendance
- **Contribution Management**: Monitor and verify financial contributions
- **Meeting Management**: Schedule and manage PTA meetings
- **Reports & Analytics**: Generate comprehensive reports

#### 👨‍👩‍👧‍👦 Parent Dashboard

- **Personal Dashboard**: Overview of attendance, contributions, and announcements
- **Attendance Tracking**: View personal attendance history and statistics
- **Contribution History**: Track personal contributions and make new ones
- **Announcements**: Stay updated with PTA news and important information
- **Profile Management**: Update personal information and settings

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── api/                   # API service functions
│   │   ├── apiClient.js       # Axios configuration
│   │   ├── authAPI.js         # Authentication endpoints
│   │   ├── attendanceAPI.js   # Attendance endpoints
│   │   └── contributionsAPI.js # Contributions endpoints
│   ├── components/            # Reusable UI components
│   │   ├── Auth/              # Authentication components
│   │   ├── Layout/            # Layout components
│   │   └── UI/                # Base UI components (Button, Input, etc.)
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   │   ├── Admin/             # Admin-specific pages
│   │   ├── Auth/              # Authentication pages
│   │   └── Parent/            # Parent-specific pages
│   ├── store/                 # Zustand state management
│   │   ├── authStore.js       # Authentication state
│   │   ├── attendanceStore.js # Attendance state
│   │   └── contributionsStore.js # Contributions state
│   ├── styles/                # Global styles and Tailwind config
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Main application component
│   └── main.jsx               # Application entry point
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend API server running (see backend README)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ePTA_Management/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_APP_NAME=JHCSC Dumingag Campus PTA
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

## 🎨 UI Components

### Core Components

- **Button**: Versatile button component with multiple variants
- **Input**: Form input with validation and error handling
- **Card**: Container component for grouped content
- **Modal**: Overlay component for dialogs and forms
- **Table**: Data table with sorting and pagination
- **Badge**: Status indicators and tags
- **StatsCard**: Dashboard statistics display

### Layout Components

- **Navbar**: Navigation with role-based menu items
- **Sidebar**: Collapsible navigation sidebar
- **Footer**: Application footer with links
- **ProtectedRoute**: Route wrapper for authentication

## 🔄 State Management

### Zustand Stores

#### AuthStore

- User authentication state
- Login/logout functionality
- Profile management
- Role-based permissions

#### AttendanceStore

- Attendance records management
- Meeting attendance tracking
- Statistics and reporting

#### ContributionsStore

- Financial contribution tracking
- Payment verification
- Contribution statistics

## 🎯 Key Features Implemented

### 1. Authentication Flow

- **Registration**: Multi-step form with email verification
- **Login**: Secure authentication with remember me option
- **Password Reset**: Email-based password recovery
- **OTP Verification**: Email-based verification for security

### 2. Dashboard Interfaces

#### Admin Dashboard

- **User Management**: Add, edit, delete users and students
- **Attendance Tracking**: Mark attendance for meetings
- **Contribution Monitoring**: Verify and track contributions
- **Report Generation**: Export data and generate reports

#### Parent Dashboard

- **Personal Overview**: Quick stats and recent activity
- **Attendance History**: Detailed attendance records
- **Contribution Tracking**: Personal contribution history
- **Announcements**: Important PTA communications

### 3. Data Management

- **Real-time Updates**: Instant UI updates on data changes
- **Offline Capability**: Local storage for temporary data
- **Error Handling**: Comprehensive error management
- **Loading States**: User-friendly loading indicators

## 📱 Responsive Design

The application is fully responsive and works on:

- **Desktop**: Full-featured interface (1200px+)
- **Tablet**: Adapted layout (768px - 1199px)
- **Mobile**: Touch-optimized interface (320px - 767px)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for Admin/Parent
- **API Protection**: Request interceptors for authentication
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Token-based request validation

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Optimized Images**: Compressed and optimized assets
- **Caching**: Browser and application-level caching
- **Bundle Optimization**: Tree shaking and minification

## 🧪 Testing Strategy

### Recommended Testing Tools

- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **MSW**: API mocking for tests

### Test Coverage Areas

- Authentication flows
- Component functionality
- API integration
- User interactions
- Error handling

## 📦 Build and Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deployment Options

- **Vercel**: Recommended for React apps
- **Netlify**: Static site hosting
- **AWS S3**: With CloudFront CDN
- **Traditional Web Servers**: Apache/Nginx

## 🤝 API Integration

### Backend Dependencies

This frontend connects to the backend API with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Students**: `/api/students/*`
- **Meetings**: `/api/meetings/*`
- **Attendance**: `/api/attendance/*`
- **Contributions**: `/api/contributions/*`
- **Announcements**: `/api/announcements/*`
- **Projects**: `/api/projects/*`
- **Penalties**: `/api/penalties/*`

## 🎓 Educational Context

### JHCSC Dumingag Campus

- **Institution**: Jamiatul Hadith Colleges of the Philippines
- **Campus**: Dumingag Campus
- **Purpose**: Digitize PTA operations for better governance
- **Stakeholders**: Parents, Teachers, PTA Officers, Administrators

### PTA Management Goals

- Improve attendance tracking accuracy
- Enhance financial transparency
- Streamline communication
- Generate detailed reports
- Reduce administrative overhead

## 🔧 Customization

### Theming

- Modify `tailwind.config.js` for custom colors
- Update brand assets in `public/` directory
- Customize component styles in respective files

### Configuration

- Environment variables in `.env`
- API endpoints in `src/api/apiClient.js`
- Application constants in `src/utils/constants.js`

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is developed for JHCSC Dumingag Campus PTA management purposes.

## 📞 Support

For technical support or questions about the PTA Management System:

- Contact: PTA Officers at JHCSC Dumingag Campus
- Email: [Contact Information]
- Documentation: Check inline code comments and this README

---

**Built with ❤️ for JHCSC Dumingag Campus PTA Community**
