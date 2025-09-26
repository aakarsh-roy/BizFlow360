import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

import Login from './pages/Login';
import BPADashboard from './pages/BPADashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';
import AutomatedWorkflowBuilder from './components/AutomatedWorkflowBuilder';
import TaskInbox from './pages/TaskInbox';
import KPIDashboard from './pages/KPIDashboard';
import ProcessMonitor from './pages/ProcessMonitor';
import UserManagement from './pages/UserManagement';
import CompanySettings from './pages/CompanySettings';
import InventoryManagement from './pages/InventoryManagement';
import AIDashboard from './pages/AIDashboard';
import TeamChat from './pages/TeamChat';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';

// AI Components
import AIKPIInsightsWidget from './components/AIKPIInsightsWidget';
import AIProcessOptimizer from './components/AIProcessOptimizer';
import AIInventoryManager from './components/AIInventoryManager';
import AIWorkflowBuilder from './components/AIWorkflowBuilder';
import AIAssistant, { AIAssistantFAB } from './components/AIAssistant';
import AIUserManagement from './components/AIUserManagement';
import AIDataManager from './components/ai/AIDataManager';
import FloatingChatWidget from './components/FloatingChatWidget';

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

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
    <ChatProvider>
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
          path="/automated-workflow-builder"
          element={
            <PrivateRoute>
              <AutomatedWorkflowBuilder />
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
          path="/inventory"
          element={
            <PrivateRoute>
              <InventoryManagement />
            </PrivateRoute>
          }
        />
        {/* AI-Enhanced Routes */}
        <Route
          path="/ai-kpi-insights"
          element={
            <PrivateRoute>
              <AIKPIInsightsWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-process-optimizer"
          element={
            <PrivateRoute>
              <AIProcessOptimizer />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-inventory-manager"
          element={
            <PrivateRoute>
              <AIInventoryManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-workflow-builder"
          element={
            <PrivateRoute>
              <AIWorkflowBuilder />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-dashboard"
          element={
            <PrivateRoute>
              <AIDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-user-management"
          element={
            <PrivateRoute>
              <AIUserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-data-manager"
          element={
            <PrivateRoute>
              <AIDataManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/team-chat"
          element={
            <PrivateRoute>
              <TeamChat />
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
      
      {/* AI Assistant - Available as floating action button on all authenticated pages */}
      {user && (
        <AIAssistantFAB 
          onClick={() => setAiAssistantOpen(true)}
        />
      )}
      
      {/* AI Assistant Dialog */}
      <AIAssistant 
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
      
      {/* Floating Chat Widget - Available on all authenticated pages */}
      {user && <FloatingChatWidget />}
    </ChatProvider>
  );
};

export default App;
