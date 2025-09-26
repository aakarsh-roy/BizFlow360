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
import * as processMonitorApi from '../services/processMonitorApi';

// Process instance interfaces (hybrid for compatibility)
interface ProcessInstance {
  id: string;
  processDefinitionId: string;
  processName: string;
  businessKey?: string;
  version?: string;
  status: 'running' | 'completed' | 'failed' | 'suspended' | 'cancelled';
  currentStep?: string;
  currentActivity?: string;
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  initiatedBy?: string;
  initiator?: string;
  assignedTo?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  variables?: Record<string, any>;
  activities?: ProcessActivity[];
  errors?: ProcessError[];
  auditLog?: Array<{
    timestamp: Date;
    action: string;
    userId: string;
    details: any;
    previousState?: any;
    newState?: any;
  }>;
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
  isActive?: boolean;
  definition?: any;
  permissions?: string[];
  tags?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

// Mock process definitions for fallback
const getMockProcessDefinitions = (): ProcessDefinition[] => {
  return [
    {
      id: 'invoice_approval',
      name: 'Invoice Approval Process',
      version: '1.2',
      description: 'Standard invoice approval workflow for finance department',
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
      description: 'New employee onboarding process for HR department',
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
      description: 'Vendor payment authorization workflow for procurement',
      category: 'Procurement',
      activeInstances: 28,
      avgDuration: 4.8,
      successRate: 98.5,
      lastDeployed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'purchase_order',
      name: 'Purchase Order Approval',
      version: '1.5',
      description: 'Purchase order approval workflow with multi-level approval',
      category: 'Procurement',
      activeInstances: 15,
      avgDuration: 6.2,
      successRate: 94.1,
      lastDeployed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'leave_request',
      name: 'Leave Request Process',
      version: '1.1',
      description: 'Employee leave request and approval process',
      category: 'HR',
      activeInstances: 8,
      avgDuration: 1.5,
      successRate: 98.9,
      lastDeployed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ];
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
  const [startProcessDialogOpen, setStartProcessDialogOpen] = useState(false);
  const [selectedProcessDefinition, setSelectedProcessDefinition] = useState<ProcessDefinition | null>(null);
  const [processVariables, setProcessVariables] = useState<Record<string, any>>({});
  const [businessKey, setBusinessKey] = useState('');
  const [startProcessLoading, setStartProcessLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
      setLoading(true);
      setApiError(null);

      console.log('Fetching process data...');

      // Fetch process definitions
      const definitionsResponse = await processMonitorApi.getProcessDefinitions();
      console.log('Definitions response:', definitionsResponse);
      
      // Fetch process instances  
      const instancesResponse = await processMonitorApi.getProcessInstances();
      console.log('Instances response:', instancesResponse);

      if (definitionsResponse.success && instancesResponse.success) {
        // Transform API data to match component interface
        const transformedDefinitions: ProcessDefinition[] = definitionsResponse.data.processDefinitions.map((def: any) => ({
          id: def._id || def.id,
          name: def.name,
          version: def.version || '1.0',
          description: def.description || '',
          category: def.category || 'General',
          activeInstances: def.activeInstances || 0,
          avgDuration: def.avgDuration || 0,
          successRate: def.successRate || 0,
          lastDeployed: new Date(def.lastDeployed || def.updatedAt || Date.now())
        }));

        const transformedInstances: ProcessInstance[] = instancesResponse.data.processInstances.map((instance: any) => {
          // Extract process definition details from populated field
          const processDefinition = instance.processDefinitionId;
          const processName = typeof processDefinition === 'object' ? processDefinition.name : 'Unknown Process';
          const processDefId = typeof processDefinition === 'object' ? processDefinition._id : processDefinition;
          
          return {
            id: instance._id || instance.id,
            processDefinitionId: processDefId,
            processName: processName,
            businessKey: instance.businessKey || `${processName}-${Date.now()}`,
            status: instance.status,
            currentStep: instance.currentStep || 'In Progress',
            currentActivity: instance.currentStep || 'In Progress',
            progress: instance.progress || (instance.status === 'completed' ? 100 : instance.status === 'running' ? 50 : 0),
            startTime: new Date(instance.startTime || instance.createdAt || Date.now()),
            endTime: instance.endTime ? new Date(instance.endTime) : undefined,
            duration: instance.duration,
            initiatedBy: typeof instance.initiatedBy === 'object' ? instance.initiatedBy.name : instance.initiatedBy,
            initiator: typeof instance.initiatedBy === 'object' ? instance.initiatedBy.name : instance.initiatedBy,
            assignedTo: instance.assignedTo || [],
            priority: instance.priority || 'medium',
            variables: instance.variables || {},
            activities: [], // We'll fetch these separately if needed
            errors: [], // We'll populate based on status
            auditLog: instance.auditLog || []
          };
        });

        console.log(`Loaded ${transformedDefinitions.length} definitions and ${transformedInstances.length} instances`);
        setProcessDefinitions(transformedDefinitions);
        setProcessInstances(transformedInstances);
      } else {
        const errorMsg = `API Error: ${definitionsResponse.message || instancesResponse.message}`;
        console.error('Failed to fetch process data:', errorMsg);
        setApiError(errorMsg);
        
        // Fallback to mock data for testing when API fails
        console.log('Using fallback mock data due to API failure');
        setProcessDefinitions(getMockProcessDefinitions());
        setProcessInstances([]);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching process data:', error);
      setApiError(`Network Error: ${error.message || 'Unable to connect to server'}`);
      setLoading(false);
      
      // Fallback to mock data for testing when network fails
      console.log('Using fallback mock data due to network error');
      setProcessDefinitions(getMockProcessDefinitions());
      setProcessInstances([]);
    }
  };

  // Process action handlers
  const handleSuspendProcess = async (instanceId: string) => {
    try {
      const response = await processMonitorApi.suspendProcessInstance(instanceId);
      if (response.success) {
        fetchProcessData(); // Refresh data
      }
    } catch (error) {
      console.error('Error suspending process:', error);
    }
  };

  const handleResumeProcess = async (instanceId: string) => {
    try {
      const response = await processMonitorApi.resumeProcessInstance(instanceId);
      if (response.success) {
        fetchProcessData(); // Refresh data
      }
    } catch (error) {
      console.error('Error resuming process:', error);
    }
  };

  const handleCancelProcess = async (instanceId: string) => {
    try {
      const response = await processMonitorApi.cancelProcessInstance(instanceId);
      if (response.success) {
        fetchProcessData(); // Refresh data
      }
    } catch (error) {
      console.error('Error cancelling process:', error);
    }
  };

  const handleRetryProcess = async (instanceId: string) => {
    try {
      const response = await processMonitorApi.retryProcessInstance(instanceId);
      if (response.success) {
        fetchProcessData(); // Refresh data
      }
    } catch (error) {
      console.error('Error retrying process:', error);
    }
  };

  const handleViewDetails = async (instance: ProcessInstance) => {
    try {
      // Fetch detailed information including steps
      const [instanceDetails, steps] = await Promise.all([
        processMonitorApi.getProcessInstance(instance.id),
        processMonitorApi.getProcessInstanceSteps(instance.id)
      ]);

      if (instanceDetails.success && steps.success) {
        // Transform steps to activities for compatibility
        const activities = steps.data.map((step: any) => ({
          id: step.id,
          name: step.name,
          type: step.type,
          status: step.status,
          assignee: step.assignee,
          startTime: new Date(step.startTime || Date.now()),
          endTime: step.endTime ? new Date(step.endTime) : undefined,
          duration: step.duration
        }));

        setSelectedInstance({
          ...instance,
          activities
        });
        setDetailDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching process details:', error);
      // Still show dialog with basic info
      setSelectedInstance(instance);
      setDetailDialogOpen(true);
    }
  };

  const handleStartProcess = async () => {
    if (!selectedProcessDefinition) return;
    
    try {
      setStartProcessLoading(true);
      
      const response = await processMonitorApi.startProcessInstance(
        selectedProcessDefinition.id,
        processVariables,
        businessKey || undefined
      );
      
      if (response.success) {
        console.log('Process started successfully:', response.data);
        
        // Reset form
        setSelectedProcessDefinition(null);
        setProcessVariables({});
        setBusinessKey('');
        setStartProcessDialogOpen(false);
        
        // Refresh data to show new instance
        await fetchProcessData();
        
        // Show success message
        console.log(`Successfully started process: ${selectedProcessDefinition.name}`);
      }
    } catch (error) {
      console.error('Error starting process:', error);
      
      // Mock success for testing when API fails
      console.log('Simulating process start success for testing');
      alert(`Mock: Started process "${selectedProcessDefinition.name}" with variables: ${JSON.stringify(processVariables, null, 2)}`);
      
      // Reset form
      setSelectedProcessDefinition(null);
      setProcessVariables({});
      setBusinessKey('');
      setStartProcessDialogOpen(false);
    } finally {
      setStartProcessLoading(false);
    }
  };

  const handleVariableChange = (key: string, value: any) => {
    setProcessVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInstanceAction = async (instanceId: string, action: 'suspend' | 'resume' | 'cancel' | 'retry') => {
    try {
      switch (action) {
        case 'suspend':
          await handleSuspendProcess(instanceId);
          break;
        case 'resume':
          await handleResumeProcess(instanceId);
          break;
        case 'cancel':
          await handleCancelProcess(instanceId);
          break;
        case 'retry':
          await handleRetryProcess(instanceId);
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} on instance ${instanceId}:`, error);
    }
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
      onClick={() => handleViewDetails(instance)}
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
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => setStartProcessDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Start New Process
            </Button>
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
                    onClick={() => handleSuspendProcess(selectedInstance.id)}
                  >
                    Suspend
                  </Button>
                  <Button 
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancelProcess(selectedInstance.id)}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {selectedInstance.status === 'failed' && (
                <Button 
                  variant="contained"
                  onClick={() => handleRetryProcess(selectedInstance.id)}
                >
                  Retry
                </Button>
              )}
              {selectedInstance.status === 'suspended' && (
                <Button 
                  variant="contained"
                  onClick={() => handleResumeProcess(selectedInstance.id)}
                >
                  Resume
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Start New Process Dialog */}
      <Dialog 
        open={startProcessDialogOpen} 
        onClose={() => setStartProcessDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Start New Process Instance
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Error Display */}
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {apiError}
              </Alert>
            )}

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Found {processDefinitions.length} process definitions in database
              </Alert>
            )}

            {/* Process Definition Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Process Definition</InputLabel>
              <Select
                value={selectedProcessDefinition?.id || ''}
                onChange={(e) => {
                  const definition = processDefinitions.find(def => def.id === e.target.value);
                  setSelectedProcessDefinition(definition || null);
                }}
                label="Select Process Definition"
              >
                {processDefinitions.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No process definitions available
                    </Typography>
                  </MenuItem>
                ) : (
                  processDefinitions.map((definition) => (
                    <MenuItem key={definition.id} value={definition.id}>
                      <Box>
                        <Typography variant="subtitle1">{definition.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          v{definition.version} • {definition.category}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Business Key */}
            <TextField
              fullWidth
              label="Business Key (Optional)"
              value={businessKey}
              onChange={(e) => setBusinessKey(e.target.value)}
              placeholder="e.g., INV-2024-001, EMP-ONBOARD-123"
              sx={{ mb: 3 }}
              helperText="A unique identifier for this process instance"
            />

            {/* Process Variables */}
            {selectedProcessDefinition && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Process Variables
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configure initial variables for this process instance
                </Typography>
                
                {/* Common process variables based on process type */}
                {selectedProcessDefinition.category === 'Finance' && (
                  <>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={processVariables.amount || ''}
                      onChange={(e) => handleVariableChange('amount', parseFloat(e.target.value) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Vendor/Supplier Name"
                      value={processVariables.vendorName || ''}
                      onChange={(e) => handleVariableChange('vendorName', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Invoice/Reference Number"
                      value={processVariables.referenceNumber || ''}
                      onChange={(e) => handleVariableChange('referenceNumber', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
                
                {selectedProcessDefinition.category === 'HR' && (
                  <>
                    <TextField
                      fullWidth
                      label="Employee Name"
                      value={processVariables.employeeName || ''}
                      onChange={(e) => handleVariableChange('employeeName', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Department"
                      value={processVariables.department || ''}
                      onChange={(e) => handleVariableChange('department', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={processVariables.startDate || ''}
                      onChange={(e) => handleVariableChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                  </>
                )}

                {/* Generic variables for other categories */}
                {!['Finance', 'HR'].includes(selectedProcessDefinition.category) && (
                  <>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={processVariables.description || ''}
                      onChange={(e) => handleVariableChange('description', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={processVariables.priority || 'medium'}
                        onChange={(e) => handleVariableChange('priority', e.target.value)}
                        label="Priority"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setStartProcessDialogOpen(false);
              setSelectedProcessDefinition(null);
              setProcessVariables({});
              setBusinessKey('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleStartProcess}
            disabled={!selectedProcessDefinition || startProcessLoading}
          >
            {startProcessLoading ? 'Starting...' : 'Start Process'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessMonitor;
