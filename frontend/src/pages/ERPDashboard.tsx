import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  Paper, 
  Alert, 
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  People,
  LocalShipping,
  Store,
  Assessment,
  Settings,
  Notifications,
  AccountBalance,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Dashboard interfaces
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  monthlyGrowth: number;
  lowStockCount: number;
  recentOrdersCount: number;
  pendingTasksCount: number;
}

interface ProductAlert {
  _id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  alertType: 'low_stock' | 'out_of_stock';
}

interface RecentActivity {
  _id: string;
  type: 'order' | 'payment' | 'stock' | 'customer';
  title: string;
  description: string;
  timestamp: Date;
  amount?: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  path: string;
}

const ERPDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    monthlyGrowth: 0,
    lowStockCount: 0,
    recentOrdersCount: 0,
    pendingTasksCount: 0
  });
  const [productAlerts, setProductAlerts] = useState<ProductAlert[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Quick action cards data
  const quickActions: QuickAction[] = [
    {
      id: 'inventory',
      title: 'Product Management',
      description: 'Manage products, track inventory, and monitor stock levels',
      icon: <Store />,
      color: 'primary',
      path: '/products'
    },
    {
      id: 'suppliers',
      title: 'Supplier Management',
      description: 'Manage supplier relationships and procurement',
      icon: <LocalShipping />,
      color: 'success',
      path: '/suppliers'
    },
    {
      id: 'customers',
      title: 'Customer Management',
      description: 'CRM system for customer relationships and orders',
      icon: <People />,
      color: 'info',
      path: '/customers'
    },
    {
      id: 'orders',
      title: 'Order Management',
      description: 'Process and track customer orders',
      icon: <Assessment />,
      color: 'warning',
      path: '/orders'
    },
    {
      id: 'finance',
      title: 'Financial Reports',
      description: 'View financial reports and analytics',
      icon: <AccountBalance />,
      color: 'secondary',
      path: '/finance'
    },
    {
      id: 'reports',
      title: 'Analytics & Reports',
      description: 'Business intelligence and reporting tools',
      icon: <TrendingUp />,
      color: 'success',
      path: '/reports'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'System alerts and notifications',
      icon: <Notifications />,
      color: 'error',
      path: '/notifications'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure system preferences and user settings',
      icon: <Settings />,
      color: 'primary',
      path: '/settings'
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls with mock data for now
        setTimeout(() => {
          setStats({
            totalRevenue: 1250000,
            totalOrders: 3420,
            totalCustomers: 1850,
            totalProducts: 450,
            monthlyGrowth: 12.5,
            lowStockCount: 23,
            recentOrdersCount: 12,
            pendingTasksCount: 5
          });

          setProductAlerts([
            {
              _id: '1',
              name: 'Wireless Headphones',
              sku: 'WH-001',
              currentStock: 5,
              reorderPoint: 20,
              alertType: 'low_stock'
            },
            {
              _id: '2',
              name: 'Gaming Mouse',
              sku: 'GM-003',
              currentStock: 0,
              reorderPoint: 15,
              alertType: 'out_of_stock'
            }
          ]);

          setRecentActivities([
            {
              _id: '1',
              type: 'order',
              title: 'New Order Received',
              description: 'Order #ORD-2024-001 from ABC Corp',
              timestamp: new Date(),
              amount: 45000
            },
            {
              _id: '2',
              type: 'payment',
              title: 'Payment Received',
              description: 'Payment for Order #ORD-2024-002',
              timestamp: new Date(Date.now() - 3600000),
              amount: 32500
            },
            {
              _id: '3',
              type: 'stock',
              title: 'Stock Updated',
              description: 'Inventory restocked for Product SKU: LAP-001',
              timestamp: new Date(Date.now() - 7200000)
            }
          ]);

          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Assessment color="primary" />;
      case 'payment':
        return <AccountBalance color="success" />;
      case 'stock':
        return <Store color="warning" />;
      case 'customer':
        return <People color="info" />;
      default:
        return <Notifications />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          BizFlow360 ERP Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back, {user?.name}! Here's what's happening with your business today.
        </Typography>
      </Box>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Revenue
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.totalOrders.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Orders
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.totalCustomers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Customers
                  </Typography>
                </Box>
                <People sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.totalProducts}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Products
                  </Typography>
                </Box>
                <Store sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ERP Modules */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              mb: 3
            }}>
              <Settings color="primary" />
              ERP Management Modules
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={action.id}>
                  <Card sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      borderColor: `${action.color}.main`
                    },
                    border: '2px solid transparent',
                    cursor: 'pointer'
                  }}>
                    <CardActionArea 
                      onClick={() => handleModuleClick(action.path)}
                      sx={{ height: '100%', p: 2 }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 1 }}>
                        <Box sx={{ 
                          color: `${action.color}.main`, 
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          {React.cloneElement(action.icon, { sx: { fontSize: 40 } })}
                        </Box>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem' }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {action.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Inventory Alerts */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}>
              <Warning color="warning" />
              Stock Alerts
              {stats.lowStockCount > 0 && (
                <Chip 
                  label={`${stats.lowStockCount} items`} 
                  color="warning" 
                  size="small" 
                />
              )}
            </Typography>
            
            {productAlerts.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Reorder Point</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productAlerts.map((alert) => (
                      <TableRow key={alert._id}>
                        <TableCell>{alert.name}</TableCell>
                        <TableCell>{alert.sku}</TableCell>
                        <TableCell align="right">{alert.currentStock}</TableCell>
                        <TableCell align="right">{alert.reorderPoint}</TableCell>
                        <TableCell>
                          <Chip
                            label={alert.alertType === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                            color={alert.alertType === 'out_of_stock' ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="success">
                All products are well-stocked! No alerts at this time.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Quick Stats */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    +{stats.monthlyGrowth}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Growth
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Badge badgeContent={stats.pendingTasksCount} color="error">
                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {stats.recentOrdersCount}
                    </Typography>
                  </Badge>
                  <Typography variant="body2" color="text.secondary">
                    Recent Orders
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              <Notifications color="primary" />
              Recent Activity
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity._id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {activity.description}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
                          {activity.amount && (
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(activity.amount)}
                            </Typography>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ERPDashboard;
