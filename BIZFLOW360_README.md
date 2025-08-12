# BizFlow360 - Business Process Automation Platform

## Overview
BizFlow360 is a simplified business automation platform designed for small to mid-sized enterprises (SMEs). It focuses on core business process automation features with a clean, user-friendly interface.

## Core Features ✅

### 1. Authentication & Security
- ✅ Role-based login system (Admin, Manager, User)
- ✅ JWT token authentication
- ✅ Secure password hashing with bcrypt
- ✅ Protected routes and API endpoints

### 2. Business Process Automation
- 📋 Process automation for approvals, leave requests, and client onboarding
- 📊 Real-time performance tracking via dashboards
- 🔔 Automated notifications and workflow alerts
- 👥 Role-based access control with personalized dashboards

### 3. Key Performance Indicators (KPIs)
- Total Users tracking
- Active Workflows monitoring
- Completed Tasks metrics
- Pending Approvals overview

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for modern UI components
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication

## Project Structure (Simplified)

```
BizFlow360/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx              # User authentication
│   │   │   └── SimpleDashboard.tsx    # Main business dashboard
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx        # Authentication state management
│   │   │   └── SocketContext.tsx      # Real-time communication
│   │   ├── components/
│   │   │   └── PrivateRoute.tsx       # Route protection
│   │   └── App.tsx                    # Main application component
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts               # Authentication endpoints
│   │   │   ├── users.ts              # User management
│   │   │   ├── tasks.ts              # Task management
│   │   │   └── analytics.ts          # KPI and analytics
│   │   ├── models/
│   │   │   ├── User.ts               # User data model
│   │   │   └── Task.ts               # Task data model
│   │   └── middleware/
│   │       └── auth.ts               # Authentication middleware
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BizFlow360
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend (.env)
   MONGODB_URI=mongodb://localhost:27017/bizflow360
   JWT_SECRET=your-secret-key
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Test Users

```javascript
// Admin User
Email: admin@bizflow360.com
Password: admin123

// Manager User  
Email: manager@bizflow360.com
Password: manager123

// Regular User
Email: user@bizflow360.com
Password: user123
```

## Features Implemented

### ✅ Working Features
1. **User Authentication**
   - Login/Logout functionality
   - Role-based access control
   - JWT token management
   - Password encryption

2. **Dashboard**
   - User profile display
   - KPI metrics (mock data)
   - System status indicators
   - Business feature overview

3. **Security**
   - Protected routes
   - API authentication middleware
   - Secure password storage
   - Token-based session management

### 🔄 Core Business Features (Ready for Extension)
1. **Workflow Management**
   - Database models ready
   - API endpoints available
   - Frontend integration ready

2. **Task Management**
   - CRUD operations implemented
   - Status tracking system
   - Assignment capabilities

3. **Analytics & Reporting**
   - KPI calculation endpoints
   - Data aggregation pipelines
   - Dashboard integration points

## Business Value

BizFlow360 provides immediate value through:

1. **Reduced Manual Work**: Automated business processes eliminate repetitive tasks
2. **Real-time Visibility**: Instant access to key business metrics and performance indicators
3. **Improved Efficiency**: Streamlined workflows and automated approvals
4. **Scalable Architecture**: Built to grow with your business needs
5. **Role-based Security**: Ensure proper access control and data protection

## Next Steps for Production

1. **Add Business Logic**: Implement specific workflow rules for your organization
2. **Integrate External APIs**: Connect with existing business systems
3. **Custom Workflows**: Build drag-and-drop workflow designer
4. **Advanced Analytics**: Add detailed reporting and visualization
5. **Mobile App**: Develop mobile companion for on-the-go access

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

**BizFlow360** - Automating business processes for the modern enterprise.
