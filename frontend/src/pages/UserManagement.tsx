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
  ListItemSecondaryAction,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Person,
  Add,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Search,
  FilterList,
  MoreVert,
  Email,
  Phone,
  Business,
  AdminPanelSettings,
  Security,
  Visibility,
  VisibilityOff,
  Group,
  PersonAdd,
  VpnKey,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// User interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer';
  department: string;
  position: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  permissions: string[];
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
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

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // User management states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: '',
    position: '',
    phone: '',
    password: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API calls with realistic data
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'admin',
            department: 'IT',
            position: 'System Administrator',
            phone: '+1-555-0101',
            status: 'active',
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            permissions: ['user_management', 'system_settings', 'process_management', 'analytics_view']
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'manager',
            department: 'Finance',
            position: 'Finance Manager',
            phone: '+1-555-0102',
            status: 'active',
            lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            permissions: ['approval_management', 'financial_reports', 'team_management']
          },
          {
            id: '3',
            name: 'Mike Chen',
            email: 'mike.chen@company.com',
            role: 'manager',
            department: 'Operations',
            position: 'Operations Manager',
            phone: '+1-555-0103',
            status: 'active',
            lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            permissions: ['process_management', 'team_management', 'task_assignment']
          },
          {
            id: '4',
            name: 'Emily Davis',
            email: 'emily.davis@company.com',
            role: 'employee',
            department: 'HR',
            position: 'HR Specialist',
            phone: '+1-555-0104',
            status: 'active',
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            permissions: ['employee_management', 'document_access']
          },
          {
            id: '5',
            name: 'Alex Wilson',
            email: 'alex.wilson@company.com',
            role: 'employee',
            department: 'Engineering',
            position: 'Software Developer',
            status: 'inactive',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            permissions: ['task_management', 'document_access']
          }
        ];

        const mockRoles: Role[] = [
          {
            id: 'admin',
            name: 'Administrator',
            description: 'Full system access and user management',
            permissions: ['user_management', 'system_settings', 'process_management', 'analytics_view', 'security_management'],
            userCount: 1
          },
          {
            id: 'manager',
            name: 'Manager',
            description: 'Team and process management capabilities',
            permissions: ['team_management', 'approval_management', 'process_management', 'analytics_view'],
            userCount: 2
          },
          {
            id: 'employee',
            name: 'Employee',
            description: 'Standard user with task execution permissions',
            permissions: ['task_management', 'document_access', 'basic_analytics'],
            userCount: 2
          },
          {
            id: 'viewer',
            name: 'Viewer',
            description: 'Read-only access to processes and analytics',
            permissions: ['basic_analytics', 'document_view'],
            userCount: 0
          }
        ];

        const mockPermissions: Permission[] = [
          { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete users', category: 'Administration' },
          { id: 'system_settings', name: 'System Settings', description: 'Configure system-wide settings', category: 'Administration' },
          { id: 'security_management', name: 'Security Management', description: 'Manage security policies and access controls', category: 'Administration' },
          { id: 'process_management', name: 'Process Management', description: 'Create and modify business processes', category: 'Processes' },
          { id: 'approval_management', name: 'Approval Management', description: 'Approve or reject process requests', category: 'Processes' },
          { id: 'task_management', name: 'Task Management', description: 'Execute and manage assigned tasks', category: 'Tasks' },
          { id: 'task_assignment', name: 'Task Assignment', description: 'Assign tasks to team members', category: 'Tasks' },
          { id: 'team_management', name: 'Team Management', description: 'Manage team members and their assignments', category: 'Teams' },
          { id: 'analytics_view', name: 'Analytics View', description: 'Access to detailed analytics and reports', category: 'Analytics' },
          { id: 'basic_analytics', name: 'Basic Analytics', description: 'Access to basic dashboards and metrics', category: 'Analytics' },
          { id: 'financial_reports', name: 'Financial Reports', description: 'Access to financial data and reports', category: 'Finance' },
          { id: 'document_access', name: 'Document Access', description: 'Read and write access to documents', category: 'Documents' },
          { id: 'document_view', name: 'Document View', description: 'Read-only access to documents', category: 'Documents' },
          { id: 'employee_management', name: 'Employee Management', description: 'Manage employee records and onboarding', category: 'HR' }
        ];

        setUsers(mockUsers);
        setRoles(mockRoles);
        setPermissions(mockPermissions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      department: '',
      position: '',
      phone: '',
      password: '',
      permissions: []
    });
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      phone: user.phone || '',
      password: '',
      permissions: user.permissions
    });
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      // Simulate API call
      console.log('Saving user:', formData);
      
      if (selectedUser) {
        // Update existing user
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...formData, role: formData.role as 'admin' | 'manager' | 'employee' | 'viewer', permissions: formData.permissions }
            : user
        ));
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        // Create new user
        const newUser: User = {
          id: `user_${Date.now()}`,
          ...formData,
          role: formData.role as 'admin' | 'manager' | 'employee' | 'viewer',
          status: 'active',
          createdAt: new Date(),
          permissions: formData.permissions
        };
        setUsers(prev => [...prev, newUser]);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      
      setUserDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({ open: true, message: 'Error saving user', severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      // Simulate API call
      console.log('Deleting user:', selectedUser.id);
      
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({ open: true, message: 'Error deleting user', severity: 'error' });
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'employee': return 'info';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const filteredUsers = getFilteredUsers();
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users, roles, and permissions for your organization
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {users.filter(u => u.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {users.filter(u => u.role === 'admin').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrators
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {users.filter(u => u.role === 'manager').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Managers
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {users.filter(u => u.lastLogin && u.lastLogin > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Today
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Paper>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Users" />
          <Tab label="Roles & Permissions" />
          <Tab label="Access Logs" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
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
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>
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
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchData}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Users Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.department}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.position}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status} 
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleToggleUserStatus(user.id)}
                        color={user.status === 'active' ? 'error' : 'success'}
                      >
                        {user.status === 'active' ? <Block /> : <CheckCircle />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3} sx={{ p: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Roles
              </Typography>
              {roles.map((role) => (
                <Card key={role.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">
                          {role.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {role.description}
                        </Typography>
                        <Chip 
                          label={`${role.userCount} users`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Permissions:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {role.permissions.map((permId) => {
                          const permission = permissions.find(p => p.id === permId);
                          return permission ? (
                            <Chip 
                              key={permId}
                              label={permission.name} 
                              size="small" 
                              variant="outlined"
                            />
                          ) : null;
                        })}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              {Object.entries(
                permissions.reduce((acc, permission) => {
                  const category = permission.category;
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(permission);
                  return acc;
                }, {} as Record<string, Permission[]>)
              ).map(([category, categoryPermissions]) => (
                <Paper key={category} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {category}
                  </Typography>
                  <List dense>
                    {categoryPermissions.map((permission) => (
                      <ListItem key={permission.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            <Security fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={permission.name}
                          secondary={permission.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Access Logs
            </Typography>
            <List>
              {users
                .filter(user => user.lastLogin)
                .sort((a, b) => (b.lastLogin?.getTime() || 0) - (a.lastLogin?.getTime() || 0))
                .slice(0, 10)
                .map((user) => (
                  <ListItem key={`${user.id}-log`}>
                    <ListItemAvatar>
                      <Avatar>
                        {user.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.name} logged in`}
                      secondary={`${user.lastLogin?.toLocaleString()} • Role: ${user.role}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        </TabPanel>
      </Paper>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            {!selectedUser && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={permissions}
                getOptionLabel={(option) => option.name}
                value={permissions.filter(p => formData.permissions.includes(p.id))}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, permissions: newValue.map(p => p.id) });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Additional Permissions"
                    placeholder="Select permissions"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
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
