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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Speed,
  Timeline,
  Error,
  Warning,
  CheckCircle,
  Schedule,
  Visibility,
  Refresh,
  FilterList,
  Search,
  MoreVert,
  TrendingUp,
  TrendingDown,
  AccountTree,
  Assignment,
  Person,
  AccessTime,
  PriorityHigh,
  Notifications,
  Settings,
  BugReport,
  Analytics,
  Route
} from '@mui/icons-material';

// Process instance interfaces
interface ProcessInstance {
  id: string;
  processDefinitionId: string;
  processName: string;
  version: string;
  status: 'running' | 'completed' | 'failed' | 'suspended' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  currentActivity: string;
  initiator: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  variables: Record<string, any>;
  activities: ProcessActivity[];
  errors?: ProcessError[];
}

interface ProcessActivity {
  id: string;
  name: string;
  type: 'start' | 'task' | 'approval' | 'decision' | 'service' | 'end';
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  assignee?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

interface ProcessError {
  id: string;
  message: string;
  code: string;
  timestamp: Date;
  activityId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface ProcessDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  activeInstances: number;
  avgDuration: number;
  successRate: number;
  lastDeployed: Date;
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

const ProcessMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [processInstances, setProcessInstances] = useState<ProcessInstance[]>([]);
  const [processDefinitions, setProcessDefinitions] = useState<ProcessDefinition[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds

  useEffect(() => {
    fetchProcessData();
    
    // Auto-refresh
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchProcessData();
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const fetchProcessData = async () => {
    try {
      // Simulate API call with realistic process data
      setTimeout(() => {
        const mockProcessDefinitions: ProcessDefinition[] = [
          {
            id: 'invoice_approval',
            name: 'Invoice Approval Process',
            version: '1.2',
            description: 'Standard invoice approval workflow',
            category: 'Finance',
            activeInstances: 45,
            avgDuration: 2.3,
            successRate: 96.8,
            lastDeployed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'employee_onboarding',
            name: 'Employee Onboarding',
            version: '2.1',
            description: 'New employee onboarding process',
            category: 'HR',
            activeInstances: 12,
            avgDuration: 72.5,
            successRate: 89.2,
            lastDeployed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'vendor_payment',
            name: 'Vendor Payment Process',
            version: '1.0',
            description: 'Vendor payment authorization workflow',
            category: 'Procurement',
            activeInstances: 28,
            avgDuration: 4.8,
            successRate: 98.5,
            lastDeployed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ];

        const mockProcessInstances: ProcessInstance[] = [
          {
            id: 'pi_001',
            processDefinitionId: 'invoice_approval',
            processName: 'Invoice Approval Process',
            version: '1.2',
            status: 'running',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            currentActivity: 'Manager Approval',
            initiator: 'Sarah Johnson',
            priority: 'high',
            progress: 60,
            variables: {
              invoiceAmount: 2450.00,
              vendorName: 'Office Supplies Co.',
              invoiceNumber: 'INV-2024-0156'
            },
            activities: [
              {
                id: 'act_1',
                name: 'Submit Invoice',
                type: 'start',
                status: 'completed',
                assignee: 'Sarah Johnson',
                startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
                duration: 5
              },
              {
                id: 'act_2',
                name: 'Finance Review',
                type: 'task',
                status: 'completed',
                assignee: 'Finance Team',
                startTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
                endTime: new Date(Date.now() - 90 * 60 * 1000),
                duration: 30
              },
              {
                id: 'act_3',
                name: 'Manager Approval',
                type: 'approval',
                status: 'active',
                assignee: 'Mike Chen',
                startTime: new Date(Date.now() - 90 * 60 * 1000)
              }
            ]
          },
          {
            id: 'pi_002',
            processDefinitionId: 'employee_onboarding',
            processName: 'Employee Onboarding',
            version: '2.1',
            status: 'running',
            startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
            currentActivity: 'Background Check',
            initiator: 'HR Team',
            priority: 'medium',
            progress: 40,
            variables: {
              employeeName: 'Alex Wilson',
              department: 'Engineering',
              startDate: '2024-02-01'
            },
            activities: [
              {
                id: 'act_4',
                name: 'Create Profile',
                type: 'task',
                status: 'completed',
                assignee: 'HR Team',
                startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
                duration: 30
              },
              {
                id: 'act_5',
                name: 'Background Check',
                type: 'service',
                status: 'active',
                startTime: new Date(Date.now() - 5.5 * 60 * 60 * 1000)
              }
            ]
          },
          {
            id: 'pi_003',
            processDefinitionId: 'vendor_payment',
            processName: 'Vendor Payment Process',
            version: '1.0',
            status: 'failed',
            startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
            duration: 30,
            currentActivity: 'Payment Authorization',
            initiator: 'Procurement Team',
            priority: 'urgent',
            progress: 80,
            variables: {
              amount: 15000.00,
              vendorName: 'TechSolutions Inc.',
              paymentMethod: 'Bank Transfer'
            },
            activities: [
              {
                id: 'act_6',
                name: 'Create Payment Request',
                type: 'start',
                status: 'completed',
                assignee: 'Procurement Team',
                startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
                duration: 12
              },
              {
                id: 'act_7',
                name: 'Payment Authorization',
                type: 'approval',
                status: 'failed',
                assignee: 'CFO',
                startTime: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
                duration: 18
              }
            ],
            errors: [
              {
                id: 'err_1',
                message: 'Insufficient budget allocation for this payment',
                code: 'BUDGET_EXCEEDED',
                timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
                activityId: 'act_7',
                severity: 'high',
                resolved: false
              }
            ]
          },
          {
            id: 'pi_004',
            processDefinitionId: 'invoice_approval',
            processName: 'Invoice Approval Process',
            version: '1.2',
            status: 'completed',
            startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
            duration: 120,
            currentActivity: 'Completed',
            initiator: 'John Smith',
            priority: 'low',
            progress: 100,
            variables: {
              invoiceAmount: 850.00,
              vendorName: 'Cleaning Services Ltd.',
              invoiceNumber: 'INV-2024-0155'
            },
            activities: [
              {
                id: 'act_8',
                name: 'Submit Invoice',
                type: 'start',
                status: 'completed',
                assignee: 'John Smith',
                startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 7.9 * 60 * 60 * 1000),
                duration: 6
              },
              {
                id: 'act_9',
                name: 'Finance Review',
                type: 'task',
                status: 'completed',
                assignee: 'Finance Team',
                startTime: new Date(Date.now() - 7.9 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 7.5 * 60 * 60 * 1000),
                duration: 24
              },
              {
                id: 'act_10',
                name: 'Manager Approval',
                type: 'approval',
                status: 'completed',
                assignee: 'Mike Chen',
                startTime: new Date(Date.now() - 7.5 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
                duration: 90
              }
            ]
          }
        ];

        setProcessDefinitions(mockProcessDefinitions);
        setProcessInstances(mockProcessInstances);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching process data:', error);
      setLoading(false);
    }
  };

  const handleInstanceAction = (instanceId: string, action: 'suspend' | 'resume' | 'cancel' | 'retry') => {
    console.log(`Performing ${action} on instance ${instanceId}`);
    // Implement instance management actions
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'suspended': return 'warning';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getActivityStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'active': return <PlayArrow color="info" />;
      case 'failed': return <Error color="error" />;
      case 'pending': return <Schedule color="warning" />;
      case 'skipped': return <Pause color="disabled" />;
      default: return <Schedule color="disabled" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 24 * 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(minutes / (24 * 60));
      const hours = Math.floor((minutes % (24 * 60)) / 60);
      return `${days}d ${hours}h`;
    }
  };

  const getFilteredInstances = () => {
    return processInstances.filter(instance => {
      const matchesSearch = instance.processName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          instance.initiator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          instance.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || instance.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const ProcessInstanceCard: React.FC<{ instance: ProcessInstance }> = ({ instance }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': { boxShadow: 4 }
      }}
      onClick={() => {
        setSelectedInstance(instance);
        setDetailDialogOpen(true);
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {instance.processName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Instance ID: {instance.id} • Version {instance.version}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Current Activity: {instance.currentActivity}
            </Typography>
          </Box>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip 
            label={instance.status.toUpperCase()} 
            color={getStatusColor(instance.status) as any}
            size="small"
          />
          <Chip 
            label={instance.priority.toUpperCase()} 
            color={getPriorityColor(instance.priority) as any}
            size="small"
          />
          {instance.errors && instance.errors.length > 0 && (
            <Chip 
              label={`${instance.errors.length} errors`} 
              color="error"
              size="small"
              icon={<BugReport />}
            />
          )}
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {instance.progress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={instance.progress}
            color={instance.status === 'failed' ? 'error' : 'primary'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Started: {instance.startTime.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              By: {instance.initiator}
            </Typography>
          </Box>
          
          {instance.duration && (
            <Typography variant="caption" color="text.secondary">
              Duration: {formatDuration(instance.duration)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading process monitor...</Typography>
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
              Process Monitor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time monitoring and management of business process instances
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
              onClick={fetchProcessData}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
            >
              Analytics
            </Button>
          </Box>
        </Box>

        {/* Real-time Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {processInstances.filter(p => p.status === 'running').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Running Instances
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {processInstances.filter(p => p.status === 'failed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed Instances
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {processInstances.filter(p => p.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Today
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {processInstances.reduce((sum, p) => sum + (p.errors?.length || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Errors
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search process instances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="running">Running</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Refresh (sec)</InputLabel>
              <Select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                label="Refresh (sec)"
              >
                <MenuItem value={5}>5 seconds</MenuItem>
                <MenuItem value={10}>10 seconds</MenuItem>
                <MenuItem value={30}>30 seconds</MenuItem>
                <MenuItem value={60}>1 minute</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Process Tabs */}
      <Paper>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={getFilteredInstances().length} color="primary">
                Active Instances
              </Badge>
            } 
          />
          <Tab label="Process Definitions" />
          <Tab label="Performance Metrics" />
          <Tab label="Error Analysis" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {getFilteredInstances().length > 0 ? (
            getFilteredInstances().map(instance => (
              <ProcessInstanceCard key={instance.id} instance={instance} />
            ))
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No process instances found matching your criteria.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Process Name</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Active Instances</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Avg Duration</TableCell>
                  <TableCell>Last Deployed</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processDefinitions.map((definition) => (
                  <TableRow key={definition.id}>
                    <TableCell>{definition.name}</TableCell>
                    <TableCell>{definition.version}</TableCell>
                    <TableCell>
                      <Chip label={definition.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{definition.activeInstances}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {definition.successRate}%
                        </Typography>
                        {definition.successRate >= 95 ? (
                          <TrendingUp color="success" fontSize="small" />
                        ) : (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDuration(definition.avgDuration)}</TableCell>
                    <TableCell>{definition.lastDeployed.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Settings />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Process Performance Trends
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    Performance chart placeholder
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Bottleneck Analysis
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <Warning />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Manager Approval Bottleneck"
                      secondary="Average delay: 2.3 hours in Invoice Approval"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <Error />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Background Check Delays"
                      secondary="External service timeout in Employee Onboarding"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Instance ID</TableCell>
                  <TableCell>Process</TableCell>
                  <TableCell>Error Message</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processInstances
                  .filter(instance => instance.errors && instance.errors.length > 0)
                  .flatMap(instance => 
                    instance.errors?.map(error => ({
                      ...error,
                      instanceId: instance.id,
                      processName: instance.processName
                    })) || []
                  )
                  .map((error) => (
                    <TableRow key={error.id}>
                      <TableCell>{error.instanceId}</TableCell>
                      <TableCell>{error.processName}</TableCell>
                      <TableCell>{error.message}</TableCell>
                      <TableCell>
                        <Chip 
                          label={error.severity.toUpperCase()} 
                          color={error.severity === 'critical' ? 'error' : error.severity === 'high' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{error.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={error.resolved ? 'Resolved' : 'Open'} 
                          color={error.resolved ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Resolve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Process Instance Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedInstance && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedInstance.processName} - {selectedInstance.id}
                </Typography>
                <Chip 
                  label={selectedInstance.status.toUpperCase()} 
                  color={getStatusColor(selectedInstance.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Process Activities
                  </Typography>
                  <List>
                    {selectedInstance.activities.map((activity, index) => (
                      <ListItem key={activity.id}>
                        <ListItemAvatar>
                          <Avatar>
                            {getActivityStatusIcon(activity.status)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {activity.assignee && `Assigned to: ${activity.assignee} • `}
                                Started: {activity.startTime.toLocaleString()}
                                {activity.endTime && ` • Completed: ${activity.endTime.toLocaleString()}`}
                                {activity.duration && ` • Duration: ${formatDuration(activity.duration)}`}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Instance Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Status" secondary={selectedInstance.status} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Priority" secondary={selectedInstance.priority} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Initiator" secondary={selectedInstance.initiator} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Start Time" secondary={selectedInstance.startTime.toLocaleString()} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Progress" secondary={`${selectedInstance.progress}%`} />
                      </ListItem>
                    </List>
                  </Paper>

                  {Object.keys(selectedInstance.variables).length > 0 && (
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Process Variables
                      </Typography>
                      <List dense>
                        {Object.entries(selectedInstance.variables).map(([key, value]) => (
                          <ListItem key={key}>
                            <ListItemText 
                              primary={key} 
                              secondary={typeof value === 'object' ? JSON.stringify(value) : String(value)} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
              {selectedInstance.status === 'running' && (
                <>
                  <Button 
                    variant="outlined"
                    onClick={() => handleInstanceAction(selectedInstance.id, 'suspend')}
                  >
                    Suspend
                  </Button>
                  <Button 
                    variant="outlined"
                    color="error"
                    onClick={() => handleInstanceAction(selectedInstance.id, 'cancel')}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {selectedInstance.status === 'failed' && (
                <Button 
                  variant="contained"
                  onClick={() => handleInstanceAction(selectedInstance.id, 'retry')}
                >
                  Retry
                </Button>
              )}
              {selectedInstance.status === 'suspended' && (
                <Button 
                  variant="contained"
                  onClick={() => handleInstanceAction(selectedInstance.id, 'resume')}
                >
                  Resume
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProcessMonitor;
