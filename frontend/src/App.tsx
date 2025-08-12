import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

import Login from './pages/Login';
import ERPDashboard from './pages/ERPDashboard';
import ProductManagement from './pages/ProductManagement';
import SupplierManagement from './pages/SupplierManagement';
import CustomerManagement from './pages/CustomerManagement';
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
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              BizFlow360 ERP - Enterprise Resource Planning
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
              <ERPDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <ProductManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <PrivateRoute>
              <SupplierManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <CustomerManagement />
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
