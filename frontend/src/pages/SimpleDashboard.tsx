import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const SimpleDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        BizFlow360 Dashboard
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        Welcome back, {user?.name}! Your business automation platform is ready.
      </Alert>

      <Grid container spacing={3}>
        {/* User Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Profile
            </Typography>
            <Typography><strong>Name:</strong> {user?.name}</Typography>
            <Typography><strong>Email:</strong> {user?.email}</Typography>
            <Typography><strong>Role:</strong> {user?.role}</Typography>
            <Typography><strong>Department:</strong> {user?.department}</Typography>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Typography color="success.main">✅ Authentication</Typography>
              <Typography color="success.main">✅ Database</Typography>
              <Typography color="success.main">✅ API Services</Typography>
              <Typography color="success.main">✅ Ready for Business</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Features */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              BizFlow360 - Business Process Automation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body1">
                  📋 <strong>Process Automation</strong><br/>
                  Automate approvals and workflows
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1">
                  📊 <strong>Performance Tracking</strong><br/>
                  Monitor key business metrics
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1">
                  🔔 <strong>Smart Notifications</strong><br/>
                  Automated alerts and updates
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimpleDashboard;
