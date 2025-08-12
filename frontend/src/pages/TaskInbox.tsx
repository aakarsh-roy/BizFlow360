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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Badge,
  Alert,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  PriorityHigh,
  Person,
  Comment,
  AttachFile,
  MoreVert,
  FilterList,
  Search,
  Refresh,
  PlayArrow,
  Pause,
  Done,
  Close,
  Warning,
  Info,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Task interfaces
interface Task {
  _id: string;
  title: string;
  description: string;
  processName: string;
  processId: string;
  assignee: string;
  assigneeRole: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'escalated';
  type: 'approval' | 'review' | 'data_entry' | 'decision' | 'verification';
  dueDate: Date;
  createdDate: Date;
  completedDate?: Date;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  requiredApprovals?: number;
  currentApprovals?: number;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  formData?: any;
  escalationLevel: number;
}

interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: Date;
  type: 'comment' | 'approval' | 'rejection' | 'escalation';
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

const TaskInbox: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Simulate API call with realistic task data
      setTimeout(() => {
        const mockTasks: Task[] = [
          {
            _id: '1',
            title: 'Approve Invoice #INV-2024-0156',
            description: 'Review and approve invoice for office supplies purchase. Amount: $2,450.00',
            processName: 'Invoice Approval Process',
            processId: 'proc_001',
            assignee: user?.name || 'Current User',
            assigneeRole: user?.role || 'manager',
            priority: 'high',
            status: 'pending',
            type: 'approval',
            dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
            createdDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            estimatedDuration: 15,
            requiredApprovals: 1,
            currentApprovals: 0,
            attachments: [
              {
                id: 'att1',
                name: 'invoice_INV-2024-0156.pdf',
                url: '#',
                type: 'application/pdf',
                size: 245760,
                uploadedBy: 'Finance Team',
                uploadedAt: new Date()
              }
            ],
            comments: [
              {
                id: 'c1',
                userId: 'user1',
                userName: 'Finance Team',
                comment: 'Invoice has been verified and all documentation is complete.',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                type: 'comment'
              }
            ],
            escalationLevel: 0
          },
          {
            _id: '2',
            title: 'Review Employee Onboarding Documents',
            description: 'Complete review of new employee Sarah Wilson\'s onboarding documents and approve access permissions.',
            processName: 'Employee Onboarding',
            processId: 'proc_002',
            assignee: user?.name || 'Current User',
            assigneeRole: user?.role || 'manager',
            priority: 'medium',
            status: 'in_progress',
            type: 'review',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
            createdDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            estimatedDuration: 30,
            attachments: [
              {
                id: 'att2',
                name: 'onboarding_checklist.pdf',
                url: '#',
                type: 'application/pdf',
                size: 156780,
                uploadedBy: 'HR Team',
                uploadedAt: new Date()
              },
              {
                id: 'att3',
                name: 'background_check.pdf',
                url: '#',
                type: 'application/pdf',
                size: 98432,
                uploadedBy: 'HR Team',
                uploadedAt: new Date()
              }
            ],
            comments: [],
            escalationLevel: 0
          },
          {
            _id: '3',
            title: 'Vendor Payment Authorization',
            description: 'Authorize payment of $15,000 to TechSolutions Inc. for software licensing.',
            processName: 'Vendor Payment Process',
            processId: 'proc_003',
            assignee: user?.name || 'Current User',
            assigneeRole: user?.role || 'manager',
            priority: 'urgent',
            status: 'pending',
            type: 'approval',
            dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            createdDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            estimatedDuration: 10,
            requiredApprovals: 2,
            currentApprovals: 1,
            attachments: [
              {
                id: 'att4',
                name: 'payment_request.pdf',
                url: '#',
                type: 'application/pdf',
                size: 234567,
                uploadedBy: 'Procurement Team',
                uploadedAt: new Date()
              }
            ],
            comments: [
              {
                id: 'c2',
                userId: 'user2',
                userName: 'CFO',
                comment: 'Budget has been verified. This payment is approved from my end.',
                timestamp: new Date(Date.now() - 45 * 60 * 1000),
                type: 'approval'
              }
            ],
            escalationLevel: 1
          },
          {
            _id: '4',
            title: 'Quality Check - Product Batch #2024-Q1-089',
            description: 'Perform quality verification for product batch before shipment approval.',
            processName: 'Quality Assurance Process',
            processId: 'proc_004',
            assignee: user?.name || 'Current User',
            assigneeRole: user?.role || 'manager',
            priority: 'medium',
            status: 'completed',
            type: 'verification',
            dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            createdDate: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            completedDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            estimatedDuration: 45,
            actualDuration: 38,
            attachments: [],
            comments: [
              {
                id: 'c3',
                userId: 'user3',
                userName: user?.name || 'Current User',
                comment: 'Quality check completed. All parameters within acceptable ranges.',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                type: 'approval'
              }
            ],
            escalationLevel: 0
          }
        ];
        setTasks(mockTasks);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId: string, action: 'approve' | 'reject' | 'complete' | 'start') => {
    try {
      // Simulate API call
      console.log(`Performing ${action} on task ${taskId}`);
      
      setTasks(prev => prev.map(task => {
        if (task._id === taskId) {
          const updatedTask = { ...task };
          switch (action) {
            case 'approve':
              updatedTask.status = 'completed';
              updatedTask.completedDate = new Date();
              break;
            case 'reject':
              updatedTask.status = 'rejected';
              break;
            case 'complete':
              updatedTask.status = 'completed';
              updatedTask.completedDate = new Date();
              break;
            case 'start':
              updatedTask.status = 'in_progress';
              break;
          }
          return updatedTask;
        }
        return task;
      }));
      
      setTaskDetailOpen(false);
    } catch (error) {
      console.error('Error performing task action:', error);
    }
  };

  const handleAddComment = () => {
    if (!comment.trim() || !selectedTask) return;
    
    const newComment: TaskComment = {
      id: `c_${Date.now()}`,
      userId: user?.id || 'current_user',
      userName: user?.name || 'Current User',
      comment: comment.trim(),
      timestamp: new Date(),
      type: 'comment'
    };
    
    setTasks(prev => prev.map(task => {
      if (task._id === selectedTask._id) {
        return {
          ...task,
          comments: [...task.comments, newComment]
        };
      }
      return task;
    }));
    
    setSelectedTask(prev => prev ? {
      ...prev,
      comments: [...prev.comments, newComment]
    } : null);
    
    setComment('');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'escalated': return 'error';
      default: return 'default';
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.processName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesTabStatus = status === 'all' || task.status === status;
      
      return matchesSearch && matchesPriority && matchesStatus && matchesTabStatus;
    });
  };

  const pendingTasks = getTasksByStatus('pending');
  const inProgressTasks = getTasksByStatus('in_progress');
  const completedTasks = getTasksByStatus('completed');
  const allTasks = getTasksByStatus('all');

  const formatTimeRemaining = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) {
      return `Overdue by ${Math.abs(hours)}h ${Math.abs(minutes)}m`;
    } else if (hours === 0) {
      return `${minutes}m remaining`;
    } else {
      return `${hours}h ${minutes}m remaining`;
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        border: selectedTask?._id === task._id ? '2px solid' : '1px solid',
        borderColor: selectedTask?._id === task._id ? 'primary.main' : 'grey.300',
        '&:hover': { boxShadow: 4 }
      }}
      onClick={() => {
        setSelectedTask(task);
        setTaskDetailOpen(true);
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {task.processName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {task.description}
            </Typography>
          </Box>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip 
            label={task.priority.toUpperCase()} 
            color={getPriorityColor(task.priority) as any}
            size="small"
          />
          <Chip 
            label={task.status.replace('_', ' ').toUpperCase()} 
            color={getStatusColor(task.status) as any}
            size="small"
          />
          <Chip 
            label={task.type.replace('_', ' ').toUpperCase()} 
            variant="outlined"
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Due Date">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule fontSize="small" color={isOverdue(task.dueDate) ? 'error' : 'action'} />
                <Typography variant="caption" color={isOverdue(task.dueDate) ? 'error' : 'text.secondary'}>
                  {formatTimeRemaining(task.dueDate)}
                </Typography>
              </Box>
            </Tooltip>
            
            {task.attachments.length > 0 && (
              <Tooltip title={`${task.attachments.length} attachments`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AttachFile fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {task.attachments.length}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            
            {task.comments.length > 0 && (
              <Tooltip title={`${task.comments.length} comments`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Comment fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {task.comments.length}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
          
          {task.requiredApprovals && (
            <LinearProgress 
              variant="determinate" 
              value={(task.currentApprovals || 0) / task.requiredApprovals * 100}
              sx={{ width: 60, height: 6 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading your tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Task Inbox
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your assigned tasks, approvals, and process activities
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
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
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                input={<OutlinedInput label="Priority" />}
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
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                input={<OutlinedInput label="Status" />}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchTasks}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterAnchor(e.currentTarget)}
              >
                More Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Task Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={pendingTasks.length} color="warning">
                Pending
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={inProgressTasks.length} color="info">
                In Progress
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={completedTasks.length} color="success">
                Completed
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={allTasks.length} color="primary">
                All Tasks
              </Badge>
            } 
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {pendingTasks.length > 0 ? (
            pendingTasks.map(task => <TaskCard key={task._id} task={task} />)
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No pending tasks found.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {inProgressTasks.length > 0 ? (
            inProgressTasks.map(task => <TaskCard key={task._id} task={task} />)
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No tasks in progress found.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {completedTasks.length > 0 ? (
            completedTasks.map(task => <TaskCard key={task._id} task={task} />)
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No completed tasks found.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {allTasks.length > 0 ? (
            allTasks.map(task => <TaskCard key={task._id} task={task} />)
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No tasks found matching your criteria.
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Task Detail Dialog */}
      <Dialog 
        open={taskDetailOpen} 
        onClose={() => setTaskDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedTask.title}</Typography>
                <IconButton onClick={() => setTaskDetailOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedTask.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Process: {selectedTask.processName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Chip 
                      label={selectedTask.priority.toUpperCase()} 
                      color={getPriorityColor(selectedTask.priority) as any}
                      size="small"
                    />
                    <Chip 
                      label={selectedTask.status.replace('_', ' ').toUpperCase()} 
                      color={getStatusColor(selectedTask.status) as any}
                      size="small"
                    />
                  </Box>

                  {selectedTask.attachments.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments
                      </Typography>
                      <List dense>
                        {selectedTask.attachments.map(attachment => (
                          <ListItem key={attachment.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <AttachFile />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={attachment.name}
                              secondary={`${(attachment.size / 1024).toFixed(1)} KB • ${attachment.uploadedBy}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Comments & Activity
                    </Typography>
                    <List>
                      {selectedTask.comments.map(comment => (
                        <ListItem key={comment.id} alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar>{comment.userName.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={comment.userName}
                            secondary={
                              <>
                                <Typography component="span" variant="body2">
                                  {comment.comment}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  {comment.timestamp.toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        multiline
                        rows={2}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Button onClick={handleAddComment}>Post</Button>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Task Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Assignee"
                          secondary={selectedTask.assignee}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Due Date"
                          secondary={selectedTask.dueDate.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Created"
                          secondary={selectedTask.createdDate.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Estimated Duration"
                          secondary={`${selectedTask.estimatedDuration} minutes`}
                        />
                      </ListItem>
                      {selectedTask.requiredApprovals && (
                        <ListItem>
                          <ListItemText 
                            primary="Approvals"
                            secondary={`${selectedTask.currentApprovals || 0} of ${selectedTask.requiredApprovals}`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedTask.status === 'pending' && (
                <>
                  <Button onClick={() => setTaskDetailOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => handleTaskAction(selectedTask._id, 'start')}
                  >
                    Start Task
                  </Button>
                  {selectedTask.type === 'approval' && (
                    <>
                      <Button 
                        variant="outlined"
                        color="error"
                        onClick={() => handleTaskAction(selectedTask._id, 'reject')}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="contained"
                        onClick={() => handleTaskAction(selectedTask._id, 'approve')}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </>
              )}
              
              {selectedTask.status === 'in_progress' && (
                <>
                  <Button onClick={() => setTaskDetailOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => handleTaskAction(selectedTask._id, 'complete')}
                  >
                    Complete Task
                  </Button>
                </>
              )}
              
              {selectedTask.status === 'completed' && (
                <Button onClick={() => setTaskDetailOpen(false)}>
                  Close
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TaskInbox;
