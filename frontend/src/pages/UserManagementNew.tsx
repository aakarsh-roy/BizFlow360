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
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Work as ManagerIcon,
  Person as UserIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  isActive: boolean;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    isActive: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const roles = ['admin', 'manager', 'user'];
  const departments = ['IT', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales', 'General'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      const response = await fetch('/api/auth/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const apiUsers = data.users?.map((user: any) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department || 'Not Set',
          isActive: user.isActive !== false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })) || [];
        setUsers(apiUsers);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data if API fails
      setUsers([
        {
          _id: '1',
          name: 'John Admin',
          email: 'admin@bizflow360.com',
          role: 'admin',
          department: 'IT',
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Sarah Manager',
          email: 'manager@bizflow360.com',
          role: 'manager',
          department: 'Operations',
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Mike User',
          email: 'user@bizflow360.com',
          role: 'user',
          department: 'Finance',
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
      setSnackbar({ open: true, message: 'Failed to load data from server, showing sample data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      department: '',
      isActive: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department,
      isActive: user.isActive
    });
    setDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({ open: true, message: 'Error deleting user', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        const response = await fetch(`/api/auth/users/${editingUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          setUsers(prev => prev.map(user => 
            user._id === editingUser._id 
              ? { ...user, ...formData, updatedAt: new Date().toISOString() }
              : user
          ));
          setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
        } else {
          throw new Error('Failed to update user');
        }
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const data = await response.json();
          const newUser: User = {
            _id: data.user._id || Date.now().toString(),
            name: data.user.name || formData.name,
            email: data.user.email || formData.email,
            role: data.user.role || formData.role,
            department: data.user.department || formData.department,
            isActive: true,
            createdAt: data.user.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUsers(prev => [...prev, newUser]);
          setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
        } else {
          throw new Error('Failed to create user');
        }
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({ open: true, message: 'Error saving user', severity: 'error' });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon color="error" />;
      case 'manager':
        return <ManagerIcon color="warning" />;
      default:
        return <UserIcon color="info" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error' as const;
      case 'manager':
        return 'warning' as const;
      default:
        return 'info' as const;
    }
  };

  const activeUsersCount = users.filter(u => u.isActive).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'manager').length;
  const userCount = users.filter(u => u.role === 'user').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            User Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage user accounts, roles, and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={currentUser?.role !== 'admin'}
        >
          Add User
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main">
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {activeUsersCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error.main">
                {adminCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrators
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {managerCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Managers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Users
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRoleIcon(user.role)}
                          <Chip
                            label={user.role}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(user)}
                          disabled={currentUser?.role !== 'admin'}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(user._id)}
                          disabled={currentUser?.role !== 'admin' || user._id === currentUser?.id}
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

      {/* User Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                required
              >
                {roles.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                {departments.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active User"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
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

export default UserManagement;
