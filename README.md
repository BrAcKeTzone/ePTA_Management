# ePTA Management System

A comprehensive Parent-Teacher Association (PTA) management system for JHCSC Dumingag Campus, built with React, Node.js, Express, and MySQL.

---

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Step-by-Step Installation Guide](#step-by-step-installation-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Setup MySQL Database with XAMPP](#2-setup-mysql-database-with-xampp)
  - [3. Configure Backend Environment](#3-configure-backend-environment)
  - [4. Install Backend Dependencies](#4-install-backend-dependencies)
  - [5. Run Database Migrations](#5-run-database-migrations)
  - [6. Configure Frontend Environment](#6-configure-frontend-environment)
  - [7. Install Frontend Dependencies](#7-install-frontend-dependencies)
  - [8. Start the Application](#8-start-the-application)
- [Troubleshooting](#troubleshooting)
- [Default Admin Account](#default-admin-account)
- [Tech Stack](#tech-stack)

---

## 🖥️ System Requirements

Before you begin, make sure your Windows 11 device has the following installed:

- ✅ **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- ✅ **Git** - [Download here](https://git-scm.com/)
- ✅ **XAMPP** (for MySQL database) - [Download here](https://www.apachefriends.org/)
- ✅ **Visual Studio Code** (recommended) - [Download here](https://code.visualstudio.com/)

---

## 🚀 Step-by-Step Installation Guide

### 1. Clone the Repository

Open **PowerShell** or **Command Prompt** and navigate to where you want to store the project:

```powershell
# Navigate to your desired directory (example: D:\Projects)
cd D:\Projects

# Clone the repository from GitHub
git clone https://github.com/BrAcKeTzone/ePTA_Management.git

# Navigate into the project directory
cd ePTA_Management
```

---

### 2. Setup MySQL Database with XAMPP

#### 2.1 Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Wait until both services show **green "Running"** status

#### 2.2 Create the Database

1. Open your web browser and go to: `http://localhost/phpmyadmin`
2. Click on **"New"** in the left sidebar
3. Enter the database name: `pta_management_system`
4. Select **Collation**: `utf8mb4_general_ci`
5. Click **"Create"**

**✅ Your database is now ready!**

> **Note**: XAMPP's MySQL default password is empty. We'll configure this in the next step.

---

### 3. Configure Backend Environment

#### 3.1 Navigate to Backend Folder

```powershell
cd backend
```

#### 3.2 Create Environment File

Create a new file named `.env` in the `backend` folder and copy the following configuration:

```env
# Database Configuration (XAMPP MySQL - No Password)
DATABASE_URL="mysql://root:@localhost:3306/pta_management_system"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (for authentication)
JWT_SECRET="yoursecretkey"

# Email Configuration (Gmail SMTP) - Uses project owner's keys
EMAIL_USER=mathsaya4kids@gmail.com
EMAIL_PASS="okwb kxxn voai bfsw"
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=mathsaya4kids@gmail.com
EMAIL_PASSWORD="okwb kxxn voai bfsw"

# Cloudinary Configuration (for image uploads) - Uses project owner's keys
CLOUDINARY_NAME=dnfunfiga
CLOUDINARY_API_KEY=249235862156371
CLOUDINARY_API_SECRET=hCijtBdwtzpa2lNemhK8eBcfIlI

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173/

# Test Database (optional - for running tests)
TEST_DATABASE_URL="mysql://root:@localhost:3306/epta_test"
```

#### 3.3 Important: Database URL Format

The **DATABASE_URL** format for XAMPP (with empty password) is:

```
mysql://root:@localhost:3306/pta_management_system
```

Breaking it down:

- `mysql://` - Database type
- `root` - Username (default XAMPP user)
- `:@` - **Empty password** (notice there's nothing between `:` and `@`)
- `localhost:3306` - Host and port
- `/pta_management_system` - Database name

**⚠️ CRITICAL**: If your XAMPP MySQL has a password, change it to:

```
mysql://root:YOUR_PASSWORD@localhost:3306/pta_management_system
```

---

### 4. Install Backend Dependencies

Make sure you're in the `backend` folder, then run:

```powershell
npm install
```

This will install all required packages including:

- Express (web framework)
- Prisma (database ORM)
- JWT (authentication)
- Nodemailer (email service)
- Cloudinary (image uploads)
- And many more...

**⏳ This may take 2-5 minutes depending on your internet speed.**

---

### 5. Run Database Migrations

After dependencies are installed, set up the database schema:

```powershell
# Generate Prisma Client
npx prisma generate

# Run database migrations to create all tables
npx prisma migrate deploy
```

**What this does:**

- Creates all necessary tables (User, Student, Meeting, Contribution, etc.)
- Sets up relationships between tables
- Applies all database schema changes

#### 5.1 (Optional) Seed Initial Admin User

To create a default admin account for first-time login:

```powershell
npx prisma db seed
```

This creates:

- **Email**: `admin@jhcsc.edu.ph`
- **Password**: `Admin@123`
- **Role**: ADMIN

---

### 6. Configure Frontend Environment

#### 6.1 Navigate to Frontend Folder

```powershell
# Go back to root directory
cd ..

# Navigate to frontend folder
cd frontend
```

#### 6.2 Create Environment File

Create a new file named `.env` in the `frontend` folder:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api
```

**Note**: The frontend uses Vite, so environment variables must start with `VITE_`

---

### 7. Install Frontend Dependencies

While in the `frontend` folder, run:

```powershell
npm install
```

This installs:

- React 19
- React Router
- Redux Toolkit (state management)
- Axios (API calls)
- Tailwind CSS (styling)
- And other UI libraries...

**⏳ This may take 2-5 minutes.**

---

### 8. Start the Application

Now you're ready to run the application!

#### 8.1 Start Backend Server

Open a **new PowerShell/Terminal window**:

```powershell
# Navigate to backend folder
cd D:\Projects\ePTA_Management\backend

# Start the backend server
npm run dev
```

**✅ Backend running at**: `http://localhost:3000`

You should see:

```
🚀 Server is running on port 3000
✅ Database connected successfully
```

#### 8.2 Start Frontend Development Server

Open **another PowerShell/Terminal window**:

```powershell
# Navigate to frontend folder
cd D:\Projects\ePTA_Management\frontend

# Start the frontend server
npm run dev
```

**✅ Frontend running at**: `http://localhost:5173`

You should see:

```
VITE v6.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

#### 8.3 Access the Application

Open your web browser and go to: **http://localhost:5173**

---

## 🔧 Troubleshooting

### ❌ Problem: "Port 3000 is already in use"

**Solution:**

```powershell
# Find and kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

Or change the port in `backend/.env`:

```env
PORT=3001
```

### ❌ Problem: "Cannot connect to MySQL"

**Solutions:**

1. **Check XAMPP MySQL is running**

   - Open XAMPP Control Panel
   - MySQL should show green "Running" status

2. **Verify database exists**

   - Go to `http://localhost/phpmyadmin`
   - Check if `pta_management_system` database exists

3. **Check DATABASE_URL format**

   - Make sure it's: `mysql://root:@localhost:3306/pta_management_system`
   - Notice the empty password (`:@`)

4. **Check MySQL port**
   - XAMPP default is 3306
   - If changed, update DATABASE_URL

### ❌ Problem: "Prisma Client not generated"

**Solution:**

```powershell
cd backend
npx prisma generate
```

### ❌ Problem: "Module not found" errors

**Solution:**

```powershell
# Delete node_modules and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

### ❌ Problem: "CORS policy blocking requests"

**Solution:**

Check `backend/.env` has correct frontend URL:

```env
FRONTEND_URL=http://localhost:5173/
```

### ❌ Problem: Email notifications not working

**Note**: The system uses the project owner's Gmail SMTP credentials. If emails aren't sending:

- Check internet connection
- The credentials are already configured (no action needed)
- Contact the project owner if issues persist

---

## 👤 Default Admin Account

After running migrations and seed, use these credentials to login:

**Email**: `admin@jhcsc.edu.ph`  
**Password**: `Admin@123`

**⚠️ Important**: Change this password after first login!

To create the admin account if not already created:

```powershell
cd backend
npx prisma db seed
```

---

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Programming language
- **Prisma ORM** - Database management
- **MySQL** - Database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Cloudinary** - Image storage
- **Joi** - Validation

### Frontend

- **React 19** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Zustand** - Additional state management

---

## 📝 Additional Commands

### Backend Commands

```powershell
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Frontend Commands

```powershell
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## 📂 Project Structure

```
ePTA_Management/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── src/
│   │   ├── api/               # API routes and controllers
│   │   ├── middlewares/       # Express middlewares
│   │   ├── utils/             # Helper functions
│   │   ├── configs/           # Configuration files
│   │   └── server.ts          # Entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/               # API service calls
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Page components
    │   ├── store/             # Redux store
    │   ├── utils/             # Helper functions
    │   └── App.jsx            # Main app component
    ├── .env                   # Frontend environment variables
    └── package.json
```

---

## 🎯 Quick Start Summary

For experienced developers, here's the TL;DR:

```powershell
# 1. Clone repo
git clone https://github.com/BrAcKeTzone/ePTA_Management.git
cd ePTA_Management

# 2. Create database in phpMyAdmin: pta_management_system

# 3. Backend setup
cd backend
# Create .env with DATABASE_URL="mysql://root:@localhost:3306/pta_management_system"
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# 4. Frontend setup (new terminal)
cd frontend
# Create .env with VITE_API_URL=http://localhost:3000/api
npm install

# 5. Run both servers (separate terminals)
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev

# 6. Access: http://localhost:5173
```

---

## 📞 Support

If you encounter any issues not covered in this guide:

1. Check the **Troubleshooting** section above
2. Verify all steps were followed correctly
3. Ensure XAMPP MySQL is running
4. Check that ports 3000 and 5173 are not in use
5. Contact the project maintainer

---

## 📄 License

This project is developed for JHCSC Dumingag Campus PTA Management.

---

**Happy Coding! 🚀**
