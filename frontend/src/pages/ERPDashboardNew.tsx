import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  CardActions,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Assignment as ProjectIcon,
  Work as HRIcon,
  AutoAwesome as AIIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ArrowForward as ArrowIcon,
  Timeline as TimelineIcon,
  AccountBalance as FinanceIcon,
  ShoppingCart as OrderIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
  };
  suppliers: {
    totalSuppliers: number;
    activeSuppliers: number;
    averageRating: number;
  };
  orders: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  };
  finance: {
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
    profitMargin: number;
  };
}

interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  reorderPoint: number;
  unitPrice: number;
}

interface RecentActivity {
  id: string;
  type: 'inventory' | 'order' | 'supplier' | 'finance';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

const ERPDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    inventory: {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalValue: 0,
    },
    suppliers: {
      totalSuppliers: 0,
      activeSuppliers: 0,
      averageRating: 0,
    },
    orders: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    },
    finance: {
      totalRevenue: 0,
      totalExpenses: 0,
      profit: 0,
      profitMargin: 0,
    },
  });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for comprehensive dashboard
      const mockStats: DashboardStats = {
        inventory: {
          totalProducts: 156,
          lowStockCount: 12,
          outOfStockCount: 3,
          totalValue: 2850000,
        },
        suppliers: {
          totalSuppliers: 45,
          activeSuppliers: 42,
          averageRating: 4.2,
        },
        orders: {
          totalOrders: 342,
          pendingOrders: 28,
          completedOrders: 314,
          totalRevenue: 5420000,
        },
        finance: {
          totalRevenue: 5420000,
          totalExpenses: 3680000,
          profit: 1740000,
          profitMargin: 32.1,
        },
      };

      const mockLowStockProducts: LowStockProduct[] = [
        {
          _id: '1',
          name: 'Office Chair Executive',
          sku: 'OFC-001',
          stockQuantity: 5,
          reorderPoint: 10,
          unitPrice: 12500,
        },
        {
          _id: '2',
          name: 'Laptop Charger 65W',
          sku: 'ELC-003',
          stockQuantity: 2,
          reorderPoint: 8,
          unitPrice: 800,
        },
        {
          _id: '3',
          name: 'Printer Paper A4',
          sku: 'STA-005',
          stockQuantity: 0,
          reorderPoint: 20,
          unitPrice: 350,
        },
      ];

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'inventory',
          message: 'Low stock alert: Office Chair Executive needs reorder',
          timestamp: '2 hours ago',
          severity: 'warning',
        },
        {
          id: '2',
          type: 'order',
          message: 'New order #ORD-2024-001 received from TechCorp',
          timestamp: '4 hours ago',
          severity: 'success',
        },
        {
          id: '3',
          type: 'supplier',
          message: 'Supplier payment processed for Office Solutions Ltd',
          timestamp: '6 hours ago',
          severity: 'info',
        },
        {
          id: '4',
          type: 'inventory',
          message: 'Stock out: Printer Paper A4 is out of stock',
          timestamp: '8 hours ago',
          severity: 'error',
        },
        {
          id: '5',
          type: 'finance',
          message: 'Monthly revenue target achieved',
          timestamp: '1 day ago',
          severity: 'success',
        },
      ];

      setStats(mockStats);
      setLowStockProducts(mockLowStockProducts);
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: 'Inventory Management',
      icon: <InventoryIcon />,
      description: 'Manage products, stock levels, and warehouses',
      path: '/products',
      color: 'primary',
      stats: `${stats.inventory.totalProducts} Products`,
      alerts: stats.inventory.lowStockCount > 0 ? stats.inventory.lowStockCount : null,
    },
    {
      title: 'Supplier Management',
      icon: <BusinessIcon />,
      description: 'Manage suppliers and vendor relationships',
      path: '/suppliers',
      color: 'secondary',
      stats: `${stats.suppliers.totalSuppliers} Suppliers`,
      alerts: null,
    },
    {
      title: 'Order Management',
      icon: <OrderIcon />,
      description: 'Process orders and track deliveries',
      path: '/orders',
      color: 'info',
      stats: `${stats.orders.pendingOrders} Pending`,
      alerts: stats.orders.pendingOrders > 0 ? stats.orders.pendingOrders : null,
    },
    {
      title: 'Finance & Accounting',
      icon: <FinanceIcon />,
      description: 'Financial tracking and reporting',
      path: '/finance',
      color: 'success',
      stats: `₹${(stats.finance.profit / 100000).toFixed(1)}L Profit`,
      alerts: null,
    },
    {
      title: 'CRM & Customers',
      icon: <PeopleIcon />,
      description: 'Customer relationship management',
      path: '/customers',
      color: 'warning',
      stats: '284 Customers',
      alerts: null,
    },
    {
      title: 'Project Management',
      icon: <ProjectIcon />,
      description: 'Track projects and tasks',
      path: '/projects',
      color: 'error',
      stats: '12 Active Projects',
      alerts: null,
    },
    {
      title: 'HR & Payroll',
      icon: <HRIcon />,
      description: 'Employee management and payroll',
      path: '/hr',
      color: 'info',
      stats: '156 Employees',
      alerts: null,
    },
    {
      title: 'Analytics & Reports',
      icon: <AnalyticsIcon />,
      description: 'Business intelligence and insights',
      path: '/analytics',
      color: 'primary',
      stats: '25 Reports',
      alerts: null,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'inventory': return <InventoryIcon />;
      case 'order': return <OrderIcon />;
      case 'supplier': return <BusinessIcon />;
      case 'finance': return <FinanceIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          ERP Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.name}! Here's your business overview.
        </Typography>
      </Box>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ₹{(stats.finance.totalRevenue / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +15.3% from last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Orders
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.orders.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    {stats.orders.pendingOrders} pending
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <OrderIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Inventory Value
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    ₹{(stats.inventory.totalValue / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    {stats.inventory.lowStockCount} low stock items
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                  <InventoryIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Profit Margin
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.finance.profitMargin.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    ₹{(stats.finance.profit / 100000).toFixed(1)}L profit
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ERP Modules */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            ERP Modules
          </Typography>
        </Grid>
        {modules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => navigate(module.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Badge
                    badgeContent={module.alerts}
                    color="error"
                    invisible={!module.alerts}
                  >
                    <Avatar sx={{ bgcolor: `${module.color}.main`, mr: 2 }}>
                      {module.icon}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3">
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {module.stats}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {module.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  endIcon={<ArrowIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(module.path);
                  }}
                >
                  Open Module
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Low Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Stock Alerts
                </Typography>
                <Chip 
                  label={`${stats.inventory.lowStockCount + stats.inventory.outOfStockCount} items`} 
                  color="warning" 
                  size="small" 
                  sx={{ ml: 'auto' }}
                />
              </Box>
              {lowStockProducts.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Stock</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockProducts.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {product.sku}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {product.stockQuantity} / {product.reorderPoint}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={product.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'}
                              color={product.stockQuantity === 0 ? 'error' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    All products are well stocked
                  </Typography>
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => navigate('/products')}
                startIcon={<InventoryIcon />}
              >
                Manage Inventory
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Recent Activity
                </Typography>
              </Box>
              <List dense>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: `${getActivityColor(activity.severity)}.main` 
                      }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.message}
                      secondary={activity.timestamp}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => navigate('/notifications')}
                startIcon={<NotificationsIcon />}
              >
                View All Notifications
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions for Admin/Manager */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/products')}
              >
                Add Product
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<BusinessIcon />}
                onClick={() => navigate('/suppliers')}
              >
                Add Supplier
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<OrderIcon />}
                onClick={() => navigate('/orders')}
              >
                Create Order
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => navigate('/analytics')}
              >
                View Reports
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ERPDashboard;
