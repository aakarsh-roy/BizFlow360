# Business Process Automation (BPA) Platform

A comprehensive Business Process Automation platform with integrated analytics and real-time dashboard reporting for development and learning purposes.

## Features

- **Task Automation & Routing**: Intelligent task assignment and workflow management
- **Real-time Analytics**: KPI monitoring and performance metrics  
- **Dashboard Reporting**: Interactive data visualization and insights
- **Notification System**: Real-time alerts and notifications
- **Process Management**: Workflow designer and automation engine
- **User Management**: Role-based access control

## Architecture

- **Backend**: Node.js with Express and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React with TypeScript and Material-UI
- **Real-time**: Socket.IO for live updates
- **Analytics**: Chart.js for visualizations
- **Authentication**: JWT with role-based permissions

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Nodemailer for notifications

### Frontend
- React + TypeScript
- Material-UI (MUI)
- Chart.js & Recharts
- Socket.IO Client
- Axios for API calls
- React Router

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Docker)
- npm or yarn

### Quick Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start MongoDB:**
   ```bash
   # Option 1: Local MongoDB
   mongod
   
   # Option 2: Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Demo Credentials

- **Admin**: admin@bpa.com / admin123
- **Manager**: manager@bpa.com / manager123  
- **User**: user@bpa.com / user123

### Troubleshooting

**TypeScript Errors**: If you see TypeScript errors, they have been configured to not block development. The application will still run.

**MongoDB Connection**: Make sure MongoDB is running on port 27017. Check with:
```bash
# Test MongoDB connection
mongosh --eval "db.runCommand('ping')"
```

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:backend` - Start only backend
- `npm run dev:frontend` - Start only frontend
- `npm run install:all` - Install dependencies for both frontend and backend

### Project Structure

```
FinalYear/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── services/       # Business services
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── package.json
└── README.md
```

## License

MIT License
