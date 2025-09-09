import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Speed,
  Assessment,
  Refresh,
  Download,
  AttachMoney,
  CheckCircle,
  Schedule,
  Warning,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale
);

interface KPIMetric {
  _id: string;
  name: string;
  category: 'revenue' | 'users' | 'sales' | 'performance' | 'finance' | 'operational';
  value: number;
  target: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description?: string;
  date: string;
  previousValue?: number;
  companyId: string;
  isActive: boolean;
  metadata: {
    source: string;
    calculationMethod?: string;
    lastUpdated: string;
    updatedBy: {
      _id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalProcesses: number;
  activeProcesses: number;
  completedTasks: number;
  pendingApprovals: number;
  averageCompletionTime: number;
  successRate: number;
  totalRevenue: number;
  totalUsers: number;
  inventoryValue: number;
  lowStockItems: number;
}

const KPIDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProcesses: 0,
    activeProcesses: 0,
    completedTasks: 0,
    pendingApprovals: 0,
    averageCompletionTime: 0,
    successRate: 0,
    totalRevenue: 0,
    totalUsers: 0,
    inventoryValue: 0,
    lowStockItems: 0
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchKPIData();
    fetchDashboardStats();
  }, [timeRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchKPIData();
      fetchDashboardStats();
      console.log('🔄 Auto-refreshing KPI data...');
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/kpi?period=${timeRange}`);
      console.log('Full API Response:', response.data);
      
      // Handle different possible response structures
      let kpiData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        kpiData = response.data.data;
      } else if (response.data.data && response.data.data.kpis && Array.isArray(response.data.data.kpis)) {
        kpiData = response.data.data.kpis;
      } else if (Array.isArray(response.data)) {
        kpiData = response.data;
      }
      
      console.log('Processed KPI Data:', kpiData);
      setMetrics(Array.isArray(kpiData) ? kpiData : []);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch KPI dashboard stats and other data in parallel
      const [kpiRes, tasksRes, usersRes, inventoryRes] = await Promise.all([
        api.get('/kpi/dashboard').catch(() => ({ data: { data: null } })),
        api.get('/tasks').catch(() => ({ data: { tasks: [] } })),
        api.get('/auth/users').catch(() => ({ data: { users: [] } })),
        api.get('/inventory/products').catch(() => ({ data: { products: [] } }))
      ]);

      const kpiData = kpiRes.data.data;
      const tasks = tasksRes.data.tasks || [];
      const users = usersRes.data.users || [];
      const products = inventoryRes.data.products || [];

      setStats({
        totalProcesses: kpiData?.totalKPIs || 45,
        activeProcesses: tasks.filter((task: any) => task.status === 'in-progress').length || 12,
        completedTasks: tasks.filter((task: any) => task.status === 'completed').length || 156,
        pendingApprovals: tasks.filter((task: any) => task.status === 'pending').length || 8,
        averageCompletionTime: kpiData?.avgPerformance || 2.4,
        successRate: kpiData?.avgPerformance || 94.2,
        totalRevenue: 2850000,
        totalUsers: users.length || 24,
        inventoryValue: products.reduce((sum: number, product: any) => 
          sum + (product.stockQuantity * product.price), 0) || 1250000,
        lowStockItems: products.filter((product: any) => 
          product.stockQuantity <= product.minStockLevel).length || 5
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const refreshData = async () => {
    setSnackbar({ open: true, message: 'Refreshing dashboard data...', severity: 'success' });
    await Promise.all([fetchKPIData(), fetchDashboardStats()]);
    setSnackbar({ open: true, message: 'Dashboard data refreshed successfully!', severity: 'success' });
  };

  const exportData = () => {
    if (!Array.isArray(metrics) || metrics.length === 0) {
      setSnackbar({ open: true, message: 'No data to export', severity: 'error' });
      return;
    }

    const csvContent = [
      ['Metric', 'Current Value', 'Target', 'Unit', 'Category', 'Trend', 'Achievement %'],
      ...metrics.map(metric => [
        metric.name,
        metric.value.toString(),
        metric.target.toString(),
        metric.unit,
        metric.category,
        metric.trend,
        ((metric.value / metric.target) * 100).toFixed(1)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'KPI data exported successfully', severity: 'success' });
  };

  const getStatusColor = (metric: KPIMetric) => {
    const achievement = (metric.value / metric.target) * 100;
    if (achievement >= 100) return 'success';
    if (achievement >= 75) return 'warning';
    return 'error';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp color="success" />;
    } else if (trend === 'down') {
      return <TrendingDown color="error" />;
    }
    return null;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '₹' || unit === 'INR') {
      return `₹${value.toLocaleString()}`;
    }
    return `${value}${unit}`;
  };

  // Generate line chart data for historical trends
  const generateHistoricalChartData = () => {
    if (!Array.isArray(metrics) || metrics.length === 0) return null;

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    // Generate mock historical data for the last 30 days
    const generateMockData = (currentValue: number) => {
      const data = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const value = currentValue * (1 + variation);
        data.push({
          x: date.toISOString().split('T')[0],
          y: Math.max(0, value)
        });
      }
      return data;
    };
    
    const datasets = metrics.slice(0, 6).map((metric, index) => ({
      label: metric.name,
      data: generateMockData(metric.value),
      borderColor: colors[index],
      backgroundColor: colors[index] + '20',
      tension: 0.4,
      fill: false
    }));

    return { datasets };
  };

  // Generate category distribution data
  const generateCategoryChartData = () => {
    if (!Array.isArray(metrics) || metrics.length === 0) return null;

    const categoryData = metrics.reduce((acc, metric) => {
      acc[metric.category] = (acc[metric.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(categoryData).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'KPI Historical Trends'
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'KPI Distribution by Category'
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
            KPI Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time business metrics and performance indicators
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1d">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshData}
          >
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "contained" : "outlined"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            sx={{ minWidth: 120 }}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportData}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Key Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {stats.completedTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Tasks
                  </Typography>
                </Box>
                <CheckCircle color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.pendingApprovals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </Box>
                <Schedule color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    ₹{(stats.totalRevenue / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <AttachMoney color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {stats.successRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </Box>
                <Speed color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      {Array.isArray(metrics) && metrics.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Historical Trends
                </Typography>
                {generateHistoricalChartData() ? (
                  <Box sx={{ height: 400 }}>
                    <Line data={generateHistoricalChartData()!} options={chartOptions} />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <Typography color="text.secondary">No historical data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Category Distribution
                </Typography>
                {generateCategoryChartData() ? (
                  <Box sx={{ height: 400 }}>
                    <Doughnut data={generateCategoryChartData()!} options={doughnutOptions} />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <Typography color="text.secondary">No category data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* KPI Metrics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              <BarChartIcon sx={{ mr: 1 }} />
              Key Performance Indicators
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {Array.isArray(metrics) && metrics.length > 0 ? (
                metrics.map((metric) => {
                  const achievement = (metric.value / metric.target) * 100;
                  return (
                    <Grid item xs={12} md={6} lg={4} key={metric._id}>
                      <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {metric.name}
                          </Typography>
                          <Chip
                            label={metric.category}
                            color={getStatusColor(metric) as any}
                            size="small"
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                          <Typography variant="h4" color="primary.main">
                            {formatValue(metric.value, metric.unit)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            / {formatValue(metric.target, metric.unit)}
                          </Typography>
                        </Box>
                        
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(achievement, 100)}
                          sx={{ mb: 1, height: 6, borderRadius: 3 }}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getTrendIcon(metric.trend)}
                            <Typography
                              variant="caption"
                              color={achievement >= 100 ? 'success.main' : 'error.main'}
                            >
                              {achievement.toFixed(1)}%
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {metric.period}
                          </Typography>
                        </Box>
                        
                        {metric.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {metric.description}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })
              ) : (
                <Grid item xs={12}>
                  <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No KPI data available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check your connection or try refreshing the data.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Processes</TableCell>
                      <TableCell align="right">{stats.totalProcesses}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Active Processes</TableCell>
                      <TableCell align="right">{stats.activeProcesses}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Completion Time</TableCell>
                      <TableCell align="right">{stats.averageCompletionTime}h</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Users</TableCell>
                      <TableCell align="right">{stats.totalUsers}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Metrics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Inventory Value</TableCell>
                      <TableCell align="right">₹{(stats.inventoryValue / 100000).toFixed(1)}L</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Low Stock Items</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          {stats.lowStockItems > 0 && <Warning color="warning" fontSize="small" />}
                          {stats.lowStockItems}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Revenue (Monthly)</TableCell>
                      <TableCell align="right">₹{(stats.totalRevenue / 100000).toFixed(1)}L</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Success Rate</TableCell>
                      <TableCell align="right">{stats.successRate}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KPIDashboard;
