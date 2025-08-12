import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Tab,
  Tabs,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Speed,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  Refresh,
  Settings,
  Download,
  FilterList,
  Notifications,
  CheckCircle,
  Schedule,
  Error,
  Warning,
  AttachMoney,
  Group,
  Assignment,
  BusinessCenter,
  AccessTime,
  Star,
  MoreVert
} from '@mui/icons-material';

// Chart component for KPI visualizations
const KPIChart: React.FC<{ 
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  title: string;
  height?: number;
}> = ({ type, data, title, height = 200 }) => {
  return (
    <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
      <Box sx={{ textAlign: 'center' }}>
        {type === 'line' && <ShowChart sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />}
        {type === 'bar' && <BarChart sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />}
        {type === 'pie' && <PieChart sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />}
        {type === 'area' && <Timeline sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />}
        <Typography variant="caption" display="block" color="text.secondary">
          {title} Chart
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          (Chart.js integration needed)
        </Typography>
      </Box>
    </Box>
  );
};

// KPI metric interfaces
interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  period: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  target?: number;
  unit?: string;
  description?: string;
  trend: 'up' | 'down' | 'stable';
}

interface ProcessKPI {
  processName: string;
  completionRate: number;
  avgDuration: number;
  activeInstances: number;
  bottlenecks: string[];
  efficiency: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const KPIDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [timePeriod, setTimePeriod] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [processKPIs, setProcessKPIs] = useState<ProcessKPI[]>([]);

  useEffect(() => {
    fetchKPIData();
    
    // Auto-refresh every 30 seconds if enabled
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchKPIData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [timePeriod, autoRefresh]);

  const fetchKPIData = async () => {
    setLoading(true);
    try {
      // Simulate API call with realistic KPI data
      setTimeout(() => {
        const mockKPIMetrics: KPIMetric[] = [
          {
            id: 'revenue',
            title: 'Total Revenue',
            value: '$245,680',
            change: 12.5,
            period: 'vs last month',
            icon: <AttachMoney />,
            color: 'success',
            target: 250000,
            unit: '$',
            description: 'Monthly recurring revenue',
            trend: 'up'
          },
          {
            id: 'workflows',
            title: 'Completed Workflows',
            value: 1284,
            change: 8.2,
            period: 'vs last week',
            icon: <CheckCircle />,
            color: 'primary',
            target: 1400,
            unit: 'workflows',
            description: 'Successfully completed business processes',
            trend: 'up'
          },
          {
            id: 'approval_time',
            title: 'Avg Approval Time',
            value: '2.4h',
            change: -15.3,
            period: 'vs last month',
            icon: <AccessTime />,
            color: 'warning',
            target: 2,
            unit: 'hours',
            description: 'Average time for approval processes',
            trend: 'down'
          },
          {
            id: 'active_users',
            title: 'Active Users',
            value: 342,
            change: 5.7,
            period: 'vs last week',
            icon: <Group />,
            color: 'info',
            target: 400,
            unit: 'users',
            description: 'Users actively using the platform',
            trend: 'up'
          },
          {
            id: 'efficiency',
            title: 'Process Efficiency',
            value: '94.2%',
            change: 2.1,
            period: 'vs last month',
            icon: <Speed />,
            color: 'success',
            target: 95,
            unit: '%',
            description: 'Overall process completion efficiency',
            trend: 'up'
          },
          {
            id: 'errors',
            title: 'Process Errors',
            value: 23,
            change: -28.4,
            period: 'vs last week',
            icon: <Error />,
            color: 'error',
            target: 10,
            unit: 'errors',
            description: 'Failed or errored process instances',
            trend: 'down'
          },
          {
            id: 'pending_tasks',
            title: 'Pending Tasks',
            value: 156,
            change: -12.1,
            period: 'vs yesterday',
            icon: <Schedule />,
            color: 'warning',
            target: 100,
            unit: 'tasks',
            description: 'Tasks awaiting user action',
            trend: 'down'
          },
          {
            id: 'satisfaction',
            title: 'User Satisfaction',
            value: '4.7/5',
            change: 3.2,
            period: 'vs last month',
            icon: <Star />,
            color: 'success',
            target: 4.8,
            unit: 'rating',
            description: 'Average user satisfaction rating',
            trend: 'up'
          }
        ];

        const mockProcessKPIs: ProcessKPI[] = [
          {
            processName: 'Invoice Approval',
            completionRate: 96.8,
            avgDuration: 2.3,
            activeInstances: 45,
            bottlenecks: ['Manager Approval', 'Finance Review'],
            efficiency: 94.2
          },
          {
            processName: 'Employee Onboarding',
            completionRate: 89.2,
            avgDuration: 72.5,
            activeInstances: 12,
            bottlenecks: ['Background Check', 'Equipment Setup'],
            efficiency: 87.1
          },
          {
            processName: 'Vendor Payment',
            completionRate: 98.5,
            avgDuration: 4.8,
            activeInstances: 28,
            bottlenecks: ['CFO Approval'],
            efficiency: 96.7
          },
          {
            processName: 'Quality Assurance',
            completionRate: 92.1,
            avgDuration: 18.7,
            activeInstances: 34,
            bottlenecks: ['Lab Testing', 'Documentation Review'],
            efficiency: 90.3
          },
          {
            processName: 'Customer Support',
            completionRate: 94.6,
            avgDuration: 6.2,
            activeInstances: 67,
            bottlenecks: ['Escalation Review', 'Technical Resolution'],
            efficiency: 92.8
          }
        ];

        setKpiMetrics(mockKPIMetrics);
        setProcessKPIs(mockProcessKPIs);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setLoading(false);
    }
  };

  const KPICard: React.FC<{ metric: KPIMetric }> = ({ metric }) => (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: `${metric.color}.main`, width: 40, height: 40 }}>
              {metric.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {metric.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.title}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {metric.trend === 'up' ? (
            <TrendingUp color="success" fontSize="small" />
          ) : metric.trend === 'down' ? (
            <TrendingDown color="error" fontSize="small" />
          ) : (
            <TrendingUp color="disabled" fontSize="small" />
          )}
          <Typography 
            variant="body2" 
            color={metric.change > 0 ? 'success.main' : metric.change < 0 ? 'error.main' : 'text.secondary'}
          >
            {metric.change > 0 ? '+' : ''}{metric.change}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {metric.period}
          </Typography>
        </Box>
        
        {metric.target && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Progress to Target
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {((typeof metric.value === 'string' ? parseFloat(metric.value.replace(/[^0-9.]/g, '')) : metric.value) / metric.target * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(100, (typeof metric.value === 'string' ? parseFloat(metric.value.replace(/[^0-9.]/g, '')) : metric.value) / metric.target * 100)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const ProcessKPICard: React.FC<{ process: ProcessKPI }> = ({ process }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {process.processName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip 
                label={`${process.completionRate}% Complete`} 
                color={process.completionRate >= 95 ? 'success' : process.completionRate >= 85 ? 'warning' : 'error'}
                size="small"
              />
              <Chip 
                label={`${process.activeInstances} Active`} 
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          <Typography variant="h4" color={process.efficiency >= 90 ? 'success.main' : 'warning.main'}>
            {process.efficiency}%
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Average Duration
            </Typography>
            <Typography variant="h6" color="primary">
              {process.avgDuration < 24 ? `${process.avgDuration}h` : `${(process.avgDuration / 24).toFixed(1)}d`}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Current Bottlenecks
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {process.bottlenecks.map((bottleneck, index) => (
                <Chip 
                  key={index}
                  label={bottleneck} 
                  color="warning"
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Efficiency Score
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={process.efficiency}
            color={process.efficiency >= 90 ? 'success' : process.efficiency >= 70 ? 'warning' : 'error'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading KPI data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              KPI Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor key performance indicators and business process metrics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto-refresh"
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchKPIData}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Settings />}
            >
              Configure
            </Button>
          </Box>
        </Box>

        {/* Time Period Selector */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="subtitle2">
                Time Period:
              </Typography>
            </Grid>
            <Grid item>
              <FormControl size="small">
                <Select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                >
                  <MenuItem value="1d">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="1y">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="Real-time" color="success" size="small" />
                <Chip label={`Updated ${new Date().toLocaleTimeString()}`} variant="outlined" size="small" />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* KPI Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Process Performance" />
          <Tab label="Financial Metrics" />
          <Tab label="User Analytics" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Key Metrics Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpiMetrics.map((metric) => (
              <Grid item xs={12} sm={6} lg={3} key={metric.id}>
                <KPICard metric={metric} />
              </Grid>
            ))}
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Workflow Completion Trends
                </Typography>
                <KPIChart type="line" data={[]} title="Weekly Completions" height={250} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Process Distribution
                </Typography>
                <KPIChart type="pie" data={[]} title="Process Types" height={250} />
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Alerts */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Alerts
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Warning />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="High pending task volume"
                  secondary="156 tasks pending approval (target: <100)"
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <Error />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Process efficiency below target"
                  secondary="Employee Onboarding at 87.1% (target: >90%)"
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Revenue target exceeded"
                  secondary="Monthly revenue 12.5% above target"
                />
              </ListItem>
            </List>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Typography variant="h6" gutterBottom>
                Process Performance Overview
              </Typography>
              {processKPIs.map((process, index) => (
                <ProcessKPICard key={index} process={process} />
              ))}
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Performing Processes
                </Typography>
                <List>
                  {processKPIs
                    .sort((a, b) => b.efficiency - a.efficiency)
                    .slice(0, 3)
                    .map((process, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={process.processName}
                          secondary={`${process.efficiency}% efficiency`}
                        />
                      </ListItem>
                    ))}
                </List>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Bottleneck Analysis
                </Typography>
                <KPIChart type="bar" data={[]} title="Bottleneck Impact" height={200} />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <KPICard metric={kpiMetrics.find(m => m.id === 'revenue')!} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Trends
                </Typography>
                <KPIChart type="area" data={[]} title="Monthly Revenue" height={300} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Cost Analysis by Process
                </Typography>
                <KPIChart type="bar" data={[]} title="Process Costs" height={250} />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <KPICard metric={kpiMetrics.find(m => m.id === 'active_users')!} />
            </Grid>
            <Grid item xs={12} md={6}>
              <KPICard metric={kpiMetrics.find(m => m.id === 'satisfaction')!} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  User Activity Trends
                </Typography>
                <KPIChart type="line" data={[]} title="Daily Active Users" height={250} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  User Role Distribution
                </Typography>
                <KPIChart type="pie" data={[]} title="User Roles" height={250} />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default KPIDashboard;
