import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

import Login from './pages/Login';
import BPADashboard from './pages/BPADashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';
import TaskInbox from './pages/TaskInbox';
import KPIDashboard from './pages/KPIDashboard';
import ProcessMonitor from './pages/ProcessMonitor';
import UserManagement from './pages/UserManagement';
import CompanySettings from './pages/CompanySettings';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();

  // Debug logging
  console.log('🔍 App render - user:', user);
  console.log('🔍 App render - loading:', loading);

  if (loading) {
    console.log('⏳ App is loading...');
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6">Loading BizFlow360 ERP...</Typography>
      </Box>
    );
  }

  return (
    <>
      {user && (
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              BizFlow360 BPA - Business Process Automation & KPI Platform
            </Typography>
            <Typography sx={{ mr: 2 }}>
              {user.name} ({user.role}) - {user.department}
            </Typography>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}
      
      <Routes>
        <Route
          path="/login"
          element={(() => {
            console.log('🔍 Login route - user exists:', !!user);
            return user ? <Navigate to="/dashboard" /> : <Login />;
          })()}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <BPADashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/workflow-builder"
          element={
            <PrivateRoute>
              <WorkflowBuilder />
            </PrivateRoute>
          }
        />
        <Route
          path="/task-inbox"
          element={
            <PrivateRoute>
              <TaskInbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/kpi-dashboard"
          element={
            <PrivateRoute>
              <KPIDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/process-monitor"
          element={
            <PrivateRoute>
              <ProcessMonitor />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <CompanySettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to="/dashboard" />}
        />
        <Route
          path="*"
          element={<Navigate to="/dashboard" />}
        />
      </Routes>
    </>
  );
};

export default App;
