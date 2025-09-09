import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Snackbar,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  PlayArrow as InProgressIcon,
  PriorityHigh as HighPriorityIcon,
  Person as AssignIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Task {
  _id: string;
  taskName: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  } | null;
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  dueDate: string;
  category: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskFormData {
  taskName: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  dueDate: string;
  category: string;
  progress: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const TaskInbox: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<TaskFormData>({
    taskName: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    category: '',
    progress: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const statuses = ['pending', 'in-progress', 'completed', 'on-hold'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const categories = ['Development', 'Design', 'Testing', 'Documentation', 'Management', 'Support', 'Other'];

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.data?.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setSnackbar({ open: true, message: 'Error fetching tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setFormData({
      taskName: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
      category: '',
      progress: 0
    });
    setDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    if (!task || !task._id) {
      console.error('Invalid task object passed to handleEdit:', task);
      setSnackbar({ 
        open: true, 
        message: 'Error: Invalid task data', 
        severity: 'error' 
      });
      return;
    }

    setEditingTask(task);
    setFormData({
      taskName: task.taskName || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      category: task.category || '',
      progress: task.progress || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({ open: true, message: 'Error deleting task', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    try {
      const taskData = {
        ...formData,
        assignedTo: formData.assignedTo || null
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
        setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
      } else {
        await api.post('/tasks', taskData);
        setSnackbar({ open: true, message: 'Task created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbar({ open: true, message: 'Error saving task', severity: 'error' });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setSnackbar({ open: true, message: 'Task status updated', severity: 'success' });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      setSnackbar({ open: true, message: 'Error updating task status', severity: 'error' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error' as const;
      case 'high':
        return 'warning' as const;
      case 'medium':
        return 'info' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success' as const;
      case 'in-progress':
        return 'primary' as const;
      case 'on-hold':
        return 'warning' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompleteIcon />;
      case 'in-progress':
        return <InProgressIcon />;
      case 'on-hold':
        return <PendingIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const filterTasksByTab = () => {
    switch (tabValue) {
      case 0: // All tasks
        return tasks;
      case 1: // My tasks
        return tasks.filter(task => task.assignedTo?._id === currentUser?.id);
      case 2: // Pending
        return tasks.filter(task => task.status === 'pending');
      case 3: // In Progress
        return tasks.filter(task => task.status === 'in-progress');
      case 4: // Completed
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasksByTab();
  const pendingCount = tasks.filter(task => task.status === 'pending').length;
  const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const myTasksCount = tasks.filter(task => task.assignedTo?._id === currentUser?.id).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <TaskIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Task Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage and track your tasks and assignments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTasks}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Task
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main">
                {tasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {inProgressCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {completedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Tabs and Table */}
      <Card>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="All Tasks" />
          <Tab 
            label={
              <Badge badgeContent={myTasksCount} color="primary">
                My Tasks
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={pendingCount} color="warning">
                Pending
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={inProgressCount} color="info">
                In Progress
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={completedCount} color="success">
                Completed
              </Badge>
            } 
          />
        </Tabs>

        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.filter(task => task && task._id).map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {task.taskName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                          {task.category && (
                            <Chip label={task.category} size="small" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {task.assignedTo ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {task.assignedTo.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {task.assignedTo.name}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority}
                          color={getPriorityColor(task.priority)}
                          size="small"
                          icon={task.priority === 'urgent' ? <HighPriorityIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                          icon={getStatusIcon(task.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={task.progress} 
                            sx={{ width: 60 }}
                          />
                          <Typography variant="body2">
                            {task.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(task)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(task._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Task Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Assign To"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Progress (%)"
                type="number"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default TaskInbox;
