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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  PlayArrow,
  Assignment,
  TrendingUp,
  Build,
  Dashboard,
  People,
  Timer,
  CheckCircle,
  Warning,
  Error,
  AutoMode,
  Analytics,
  Speed,
  AccountTree,
  AutoAwesome,
  SmartToy,
  Psychology,
  Inventory
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AIDashboardWidget from '../components/AIDashboardWidget';

// BPA Dashboard interfaces
interface BPAStats {
  totalProcesses: number;
  activeProcesses: number;
  completedTasks: number;
  pendingApprovals: number;
  avgProcessingTime: number;
  successRate: number;
  automationSavings: number;
  tasksInQueue: number;
}

interface ProcessAlert {
  _id: string;
  processName: string;
  taskName: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  status: 'overdue' | 'due_soon' | 'blocked';
}

interface RecentActivity {
  _id: string;
  type: 'process_started' | 'task_completed' | 'approval_requested' | 'process_completed';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  processId?: string;
}

interface BPAModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  path: string;
  badge?: number;
  restricted?: string[];
}

const BPADashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Tab Panel Component
  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`dashboard-tabpanel-${index}`}
        aria-labelledby={`dashboard-tab-${index}`}
      >
        {value === index && (
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };
  const [stats, setStats] = useState<BPAStats>({
    totalProcesses: 0,
    activeProcesses: 0,
    completedTasks: 0,
    pendingApprovals: 0,
    avgProcessingTime: 0,
    successRate: 0,
    automationSavings: 0,
    tasksInQueue: 0
  });
  const [processAlerts, setProcessAlerts] = useState<ProcessAlert[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Regular BPA Modules
  const bpaModules: BPAModule[] = [
    {
      id: 'workflow-builder',
      title: 'Workflow Builder',
      description: 'Design and deploy automated business processes with drag-and-drop interface',
      icon: <AccountTree />,
      color: 'primary',
      path: '/workflow-builder',
      restricted: ['admin', 'manager']
    },

    {
      id: 'task-inbox',
      title: 'Task Inbox',
      description: 'Manage assigned tasks, approvals, and process actions',
      icon: <Assignment />,
      color: 'info',
      path: '/task-inbox',
      badge: stats.pendingApprovals
    },
    {
      id: 'kpi-dashboard',
      title: 'KPI Dashboard',
      description: 'Real-time business metrics, process analytics, and performance insights',
      icon: <Dashboard />,
      color: 'success',
      path: '/kpi-dashboard'
    },

    {
      id: 'process-monitor',
      title: 'Process Monitor',
      description: 'Track running processes, bottlenecks, and process health',
      icon: <Speed />,
      color: 'warning',
      path: '/process-monitor'
    },

    {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Manage products, track stock levels, and monitor inventory health',
      icon: <Assignment />,
      color: 'primary',
      path: '/inventory'
    },

    {
      id: 'automation-hub',
      title: 'Automation Hub',
      description: 'Pre-built automation templates and integrations',
      icon: <AutoMode />,
      color: 'secondary',
      path: '/automation-hub'
    },
    {
      id: 'analytics',
      title: 'Process Analytics',
      description: 'Advanced analytics, reports, and process optimization insights',
      icon: <Analytics />,
      color: 'info',
      path: '/analytics'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users, roles, and access permissions',
      icon: <People />,
      color: 'primary',
      path: '/users',
      restricted: ['admin']
    },
    {
      id: 'settings',
      title: 'Company Settings',
      description: 'Configure company-wide BPA settings and integrations',
      icon: <Build />,
      color: 'secondary',
      path: '/settings',
      restricted: ['admin']
    }
  ];

  // AI Modules - Separate array for AI-powered features
  const aiModules: BPAModule[] = [
    {
      id: 'ai-dashboard',
      title: 'AI Control Center',
      description: 'Monitor and manage all AI-powered features across BizFlow360',
      icon: <SmartToy />,
      color: 'primary',
      path: '/ai-dashboard',
      restricted: ['admin', 'manager']
    },
    {
      id: 'automated-workflow-builder',
      title: 'AI Workflow Builder',
      description: 'Generate workflows using AI from natural language descriptions and templates',
      icon: <AutoAwesome />,
      color: 'secondary',
      path: '/automated-workflow-builder',
      restricted: ['admin', 'manager']
    },
    {
      id: 'ai-workflow-builder',
      title: 'Enhanced AI Workflows',
      description: 'Advanced AI workflow generation with templates and automation suggestions',
      icon: <AutoAwesome />,
      color: 'secondary',
      path: '/ai-workflow-builder',
      restricted: ['admin', 'manager']
    },
    {
      id: 'ai-kpi-insights',
      title: 'AI KPI Insights',
      description: 'Intelligent KPI analysis with predictive forecasting and optimization',
      icon: <Analytics />,
      color: 'success',
      path: '/ai-kpi-insights'
    },
    {
      id: 'ai-process-optimizer',
      title: 'AI Process Optimizer',
      description: 'Intelligent process optimization with bottleneck identification and recommendations',
      icon: <Speed />,
      color: 'warning',
      path: '/ai-process-optimizer'
    },
    {
      id: 'ai-inventory-manager',
      title: 'AI Inventory Manager',
      description: 'Smart inventory management with demand forecasting and stock optimization',
      icon: <Inventory />,
      color: 'primary',
      path: '/ai-inventory-manager'
    },
    {
      id: 'ai-user-management',
      title: 'AI User Analytics',
      description: 'Intelligent user management with role suggestions and security insights',
      icon: <Psychology />,
      color: 'primary',
      path: '/ai-user-management',
      restricted: ['admin']
    },
    {
      id: 'ai-data-manager',
      title: 'AI Data Management',
      description: 'Manage AI training data, monitor model health, and control machine learning systems',
      icon: <AutoMode />,
      color: 'secondary',
      path: '/ai-data-manager',
      restricted: ['admin']
    }
  ];

  useEffect(() => {
    const fetchBPAData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls with realistic BPA data
        setTimeout(() => {
          setStats({
            totalProcesses: 47,
            activeProcesses: 23,
            completedTasks: 1248,
            pendingApprovals: 17,
            avgProcessingTime: 4.2, // hours
            successRate: 94.7, // percentage
            automationSavings: 156000, // in currency
            tasksInQueue: 8
          });

          setProcessAlerts([
            {
              _id: '1',
              processName: 'Invoice Approval',
              taskName: 'Finance Manager Review',
              assignee: 'John Smith',
              priority: 'high',
              dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
              status: 'due_soon'
            },
            {
              _id: '2',
              processName: 'Employee Onboarding',
              taskName: 'HR Documentation',
              assignee: 'Sarah Johnson',
              priority: 'medium',
              dueDate: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours overdue
              status: 'overdue'
            },
            {
              _id: '3',
              processName: 'Purchase Request',
              taskName: 'Budget Approval',
              assignee: 'Mike Wilson',
              priority: 'high',
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
              status: 'blocked'
            }
          ]);

          setRecentActivities([
            {
              _id: '1',
              type: 'process_completed',
              title: 'Invoice Processing Completed',
              description: 'Invoice #INV-2024-0156 has been processed and approved',
              timestamp: new Date(),
              user: 'Finance Team',
              processId: 'proc_001'
            },
            {
              _id: '2',
              type: 'approval_requested',
              title: 'Purchase Request Pending',
              description: 'New purchase request for $15,000 requires approval',
              timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
              user: 'John Doe',
              processId: 'proc_002'
            },
            {
              _id: '3',
              type: 'process_started',
              title: 'Employee Onboarding Started',
              description: 'New employee onboarding process initiated for Sarah Wilson',
              timestamp: new Date(Date.now() - 3600000), // 1 hour ago
              user: 'HR System',
              processId: 'proc_003'
            }
          ]);

          setLoading(false);
        }, 1000);

        // Insert AI widget data fetch here if desired in future
      } catch (error) {
        setLoading(false);
      }
    };
    fetchBPAData();
  }, []);

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'process_started':
        return <PlayArrow color="primary" />;
      case 'task_completed':
        return <CheckCircle color="success" />;
      case 'approval_requested':
        return <Assignment color="warning" />;
      case 'process_completed':
        return <CheckCircle color="success" />;
      default:
        return <Assignment />;
    }
  };

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Error color="error" />;
      case 'due_soon':
        return <Warning color="warning" />;
      case 'blocked':
        return <Error color="error" />;
      default:
        return <Timer />;
    }
  };

  const getAlertColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'error';
      case 'due_soon':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'info';
    }
  };

  // Filter modules based on user role
  const accessibleModules = bpaModules.filter(module => 
    !module.restricted || module.restricted.includes(user?.role || 'user')
  );

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
          Loading BPA Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Business Process Automation Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back, {user?.name}! Monitor and manage your business processes in real-time.
        </Typography>
      </Box>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.activeProcesses}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Processes
                  </Typography>
                </Box>
                <PlayArrow sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.completedTasks.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tasks Completed
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.pendingApprovals}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Approvals
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.successRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Success Rate
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* BPA Modules */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              mb: 3
            }}>
              <AutoMode color="primary" />
              BPA Platform Modules
            </Typography>
            
            {/* Tabs for organizing modules */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(event, newValue) => setActiveTab(newValue)}
                aria-label="module tabs"
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 120,
                    fontWeight: 'medium'
                  }
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Core Modules
                      <Chip 
                        label={accessibleModules.length} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    </Box>
                  }
                  icon={<Dashboard />}
                  id="dashboard-tab-0"
                  aria-controls="dashboard-tabpanel-0"
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      AI Features
                      <Chip 
                        label={aiModules.filter(m => !m.restricted || m.restricted.includes(user?.role || 'user')).length} 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: '20px'
                        }}
                      />
                    </Box>
                  }
                  icon={<SmartToy />}
                  id="dashboard-tab-1"
                  aria-controls="dashboard-tabpanel-1"
                />
              </Tabs>
            </Box>

            {/* Core Modules Tab */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={2}>
                {accessibleModules.map((module) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
                  <Card sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      borderColor: `${module.color}.main`
                    },
                    border: '2px solid transparent',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <CardActionArea 
                      onClick={() => handleModuleClick(module.path)}
                      sx={{ height: '100%', p: 2 }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 1 }}>
                        <Box sx={{ 
                          color: `${module.color}.main`, 
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {React.cloneElement(module.icon, { sx: { fontSize: 40 } })}
                          {module.badge && module.badge > 0 && (
                            <Chip 
                              label={module.badge}
                              size="small"
                              color="error"
                              sx={{ 
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                minWidth: '20px',
                                height: '20px'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem' }}>
                          {module.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {module.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
              </Grid>
            </TabPanel>

            {/* AI Features Tab */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={2}>
                {aiModules.filter(module => 
                  !module.restricted || module.restricted.includes(user?.role || 'user')
                ).map((module) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
                    <Card sx={{ 
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                        borderColor: `${module.color}.main`
                      },
                      border: '2px solid transparent',
                      cursor: 'pointer',
                      position: 'relative',
                      background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)'
                    }}>
                      <CardActionArea 
                        onClick={() => handleModuleClick(module.path)}
                        sx={{ height: '100%', p: 2 }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 1 }}>
                          <Box sx={{ 
                            color: `${module.color}.main`, 
                            mb: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            {React.cloneElement(module.icon, { sx: { fontSize: 40 } })}
                            {module.badge && module.badge > 0 && (
                              <Chip 
                                label={module.badge}
                                size="small"
                                color="error"
                                sx={{ 
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  minWidth: '20px',
                                  height: '20px'
                                }}
                              />
                            )}
                            {/* AI Badge */}
                            <Chip
                              label="AI"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -12,
                                left: -12,
                                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                                color: 'white',
                                fontSize: '0.7rem',
                                height: '18px'
                              }}
                            />
                          </Box>
                          <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem' }}>
                            {module.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {module.description}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </Paper>

          {/* Process Alerts */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}>
              <Warning color="warning" />
              Process Alerts
              {processAlerts.length > 0 && (
                <Chip 
                  label={`${processAlerts.length} alerts`} 
                  color="warning" 
                  size="small" 
                />
              )}
            </Typography>
            
            {processAlerts.length > 0 ? (
              <List>
                {processAlerts.map((alert, index) => (
                  <React.Fragment key={alert._id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${getAlertColor(alert.status)}.light` }}>
                          {getAlertIcon(alert.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {alert.processName}
                            </Typography>
                            <Chip 
                              label={alert.priority} 
                              size="small" 
                              color={alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {alert.taskName} - Assigned to {alert.assignee}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              Due: {alert.dueDate.toLocaleString()}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate('/task-inbox')}
                      >
                        View Task
                      </Button>
                    </ListItem>
                    {index < processAlerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="success">
                All processes are running smoothly! No alerts at this time.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Quick Stats */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Process Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {stats.avgProcessingTime}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Processing Time
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats.automationSavings)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Savings
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Process Success Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.successRate} 
                sx={{ height: 8, borderRadius: 4 }}
                color="success"
              />
              <Typography variant="caption" color="text.secondary">
                {stats.successRate}% of processes completed successfully
              </Typography>
            </Box>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              <PlayArrow color="primary" />
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
                            {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
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

      {/* AI Dashboard Widget - Analytics Area */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          mb: 3
        }}>
          <Analytics color="primary" />
          AI Insights Dashboard
        </Typography>
        <AIDashboardWidget />
      </Box>
    </Box>
  );
};

export default BPADashboard;
