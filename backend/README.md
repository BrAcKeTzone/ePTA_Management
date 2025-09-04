# Online Management System for the Parent and Teacher Association of JHCSC Dumingag Campus

## Overview

This project is an Online Management System designed for the Parent and Teacher Association (PTA) of JHCSC Dumingag Campus. It aims to streamline PTA operations, improve transparency, and enhance communication between parents and teachers through a web-based platform.

## Technologies Used

- **Express.js**: A web application framework for Node.js, used to build the backend.
- **Prisma**: An ORM (Object-Relational Mapping) tool that simplifies database interactions.
- **MySQL**: A relational database management system used to store application data.

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Prisma schema for database models
├── src/
│   ├── api/                # Feature-based modules (routes, controllers, services)
│   │   ├── announcements/
│   │   ├── attendance/
│   │   ├── auth/
│   │   ├── contributions/
│   │   ├── meetings/
│   │   ├── penalties/
│   │   ├── projects/
│   │   ├── students/
│   │   └── users/
│   ├── configs/
│   │   └── prisma.js         # Prisma client instance
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   └── index.js          # Main API router
│   ├── utils/                # Utility functions and classes
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── asyncHandler.js
│   ├── app.js              # Express application setup and middleware
│   └── server.js           # Server initialization
├── .env                    # Environment variables (DB connection, JWT secret, etc.)
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Features

- **User Management**: Secure registration and login for parents and admins.
- **Role-Based Access Control (RBAC)**: Differentiated permissions for admins and parents.
- **Attendance Tracking**: Record and view attendance for PTA meetings and events.
- **Penalty System**: Automatically calculate and manage penalties for absences.
- **Contribution Management**: Track financial contributions and payments.
- **Project Management**: Monitor the status and progress of PTA projects.
- **Announcements**: Admins can post announcements for all members.

## API Endpoints

The API is structured by features. Each feature module in `src/api/` contains its own routes, controllers, and business logic. The main router is located at `src/routes/index.js`.

- `/api/v1/auth`: Authentication routes (login, register)
- `/api/v1/users`: User management
- `/api/v1/students`: Student record management
- `/api/v1/attendance`: Attendance tracking
- `/api/v1/penalties`: Penalty management
- `/api/v1/contributions`: Contribution and financial tracking
- `/api/v1/projects`: PTA project management
- `/api/v1/announcements`: System announcements
- `/api/v1/meetings`: Meeting schedules and records

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
     DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
     PORT=8000
     CORS_ORIGIN=*

     ACCESS_TOKEN_SECRET="your_access_token_secret"
     ACCESS_TOKEN_EXPIRY="1d"
     REFRESH_TOKEN_SECRET="your_refresh_token_secret"
     REFRESH_TOKEN_EXPIRY="10d"
     ```

4. **Apply database migrations**:

   - Ensure your MySQL server is running.
   - Run the following command to create the database tables based on your Prisma schema:

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

```
backend
├── prisma
│   └── schema.prisma       # Database schema definition
├── src
│   ├── app.js              # Main application configuration
│   ├── server.js           # Server setup and configuration
│   ├── controllers          # Request handling logic
│   │   └── index.js
│   ├── middlewares          # Middleware functions
│   │   └── index.js
│   └── routes               # Application routes
│       └── index.js
├── .env                     # Environment variables
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## Setup Instructions

1. **Clone the repository**:

   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:

   ```
   npm install
   ```

3. **Configure environment variables**:

   - Create a `.env` file in the root directory and add your database connection string and other necessary environment variables.

4. **Run the application**:

   ```
   npm start
   ```

5. **Development mode**:
   ```
   npm run dev
   ```

## Usage

- Access the application through the specified port (default is 3000).
- Use the defined API endpoints to interact with the PTA management system.

## Contribution

Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
