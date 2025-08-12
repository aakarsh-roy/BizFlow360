import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
  Fab,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Customer {
  _id: string;
  customerCode: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  companyName?: string;
  customerType: 'individual' | 'corporate';
  isActive: boolean;
  creditLimit: number;
  paymentTerms: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  rating: number;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  companyName: string;
  customerType: 'individual' | 'corporate';
  creditLimit: number;
  paymentTerms: number;
}

interface CustomerOrder {
  _id: string;
  orderNumber: string;
  date: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanelComponent(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CustomerManagement: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [viewTabValue, setViewTabValue] = useState(0);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    companyName: '',
    customerType: 'individual',
    creditLimit: 50000,
    paymentTerms: 30,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal'];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockCustomers: Customer[] = [
        {
          _id: '1',
          customerCode: 'CUST-001',
          name: 'Rohit Sharma',
          email: 'rohit@example.com',
          phone: '+91 98765 43210',
          address: {
            street: '123 Business Plaza',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
          companyName: 'TechCorp Solutions',
          customerType: 'corporate',
          isActive: true,
          creditLimit: 500000,
          paymentTerms: 30,
          totalOrders: 24,
          totalSpent: 1250000,
          lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 4.8,
          loyaltyPoints: 2500,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          customerCode: 'CUST-002',
          name: 'Priya Patel',
          email: 'priya@gmail.com',
          phone: '+91 87654 32109',
          address: {
            street: '456 Residential Area',
            city: 'Ahmedabad',
            state: 'Gujarat',
            postalCode: '380001',
            country: 'India',
          },
          customerType: 'individual',
          isActive: true,
          creditLimit: 100000,
          paymentTerms: 15,
          totalOrders: 8,
          totalSpent: 85000,
          lastOrderDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 4.5,
          loyaltyPoints: 850,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '3',
          customerCode: 'CUST-003',
          name: 'Anil Kumar',
          email: 'anil@business.com',
          phone: '+91 76543 21098',
          address: {
            street: '789 Corporate Tower',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
          },
          companyName: 'Digital Solutions Ltd',
          customerType: 'corporate',
          isActive: false,
          creditLimit: 750000,
          paymentTerms: 45,
          totalOrders: 15,
          totalSpent: 950000,
          lastOrderDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 3.8,
          loyaltyPoints: 1900,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showSnackbar('Error fetching customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    // Mock orders data
    const mockOrders: CustomerOrder[] = [
      {
        _id: '1',
        orderNumber: 'ORD-2024-001',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 125000,
        status: 'completed',
        items: 5,
      },
      {
        _id: '2',
        orderNumber: 'ORD-2024-002',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 85000,
        status: 'completed',
        items: 3,
      },
      {
        _id: '3',
        orderNumber: 'ORD-2024-003',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 95000,
        status: 'pending',
        items: 4,
      },
    ];
    setCustomerOrders(mockOrders);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      companyName: '',
      customerType: 'individual',
      creditLimit: 50000,
      paymentTerms: 30,
    });
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        postalCode: customer.address.postalCode,
        country: customer.address.country,
        companyName: customer.companyName || '',
        customerType: customer.customerType,
        creditLimit: customer.creditLimit,
        paymentTerms: customer.paymentTerms,
      });
    } else {
      setEditingCustomer(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    resetForm();
  };

  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer);
    setViewTabValue(0);
    fetchCustomerOrders(customer._id);
    setOpenViewDialog(true);
  };

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingCustomer) {
        // Update existing customer
        const updatedCustomers = customers.map(c => 
          c._id === editingCustomer._id 
            ? { 
                ...c, 
                ...formData,
                address: {
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  postalCode: formData.postalCode,
                  country: formData.country,
                },
                updatedAt: new Date().toISOString() 
              }
            : c
        );
        setCustomers(updatedCustomers);
        showSnackbar('Customer updated successfully', 'success');
      } else {
        // Create new customer
        const newCustomer: Customer = {
          _id: Date.now().toString(),
          customerCode: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
          ...formData,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          isActive: true,
          totalOrders: 0,
          totalSpent: 0,
          rating: 0,
          loyaltyPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCustomers(prev => [newCustomer, ...prev]);
        showSnackbar('Customer created successfully', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving customer:', error);
      showSnackbar('Error saving customer', 'error');
    }
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setCustomers(prev => prev.filter(c => c._id !== customerId));
        showSnackbar('Customer deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting customer:', error);
        showSnackbar('Error deleting customer', 'error');
      }
    }
  };

  const handleToggleStatus = async (customerId: string) => {
    try {
      const updatedCustomers = customers.map(c => 
        c._id === customerId 
          ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() }
          : c
      );
      setCustomers(updatedCustomers);
      showSnackbar('Customer status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating customer status:', error);
      showSnackbar('Error updating customer status', 'error');
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 !== 0 ? '⭐' : '');
  };

  const getCustomerValue = (customer: Customer) => {
    if (customer.totalSpent >= 1000000) return { label: 'VIP', color: 'primary' as const };
    if (customer.totalSpent >= 500000) return { label: 'Premium', color: 'secondary' as const };
    if (customer.totalSpent >= 100000) return { label: 'Gold', color: 'warning' as const };
    return { label: 'Regular', color: 'default' as const };
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Customers...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Customer Management
        </Typography>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Add Customer
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {totalCustomers}
              </Typography>
              <Typography variant="body2">Total Customers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BusinessIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {activeCustomers}
              </Typography>
              <Typography variant="body2">Active Customers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MoneyIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                ₹{(totalRevenue / 100000).toFixed(1)}L
              </Typography>
              <Typography variant="body2">Total Revenue</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                ₹{(averageOrderValue / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="body2">Avg Order Value</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search customers by name, email, code, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell align="right"><strong>Orders</strong></TableCell>
              <TableCell align="right"><strong>Total Spent</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => {
              const customerValue = getCustomerValue(customer);
              return (
                <TableRow key={customer._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {customer.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {customer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {customer.customerCode}
                        </Typography>
                        {customer.companyName && (
                          <Typography variant="body2" color="text.secondary">
                            {customer.companyName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {customer.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customer.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customer.address.city}, {customer.address.state}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={customer.customerType}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                      <br />
                      <Chip
                        label={customerValue.label}
                        color={customerValue.color}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body1">
                        {customer.totalOrders}
                      </Typography>
                      {customer.lastOrderDate && (
                        <Typography variant="body2" color="text.secondary">
                          Last: {new Date(customer.lastOrderDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="medium">
                      ₹{(customer.totalSpent / 1000).toFixed(0)}K
                    </Typography>
                    {customer.rating > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {customer.rating.toFixed(1)} {getRatingStars(customer.rating)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.isActive ? 'Active' : 'Inactive'}
                      color={customer.isActive ? 'success' : 'error'}
                      size="small"
                      onClick={() => (user?.role === 'admin' || user?.role === 'manager') && handleToggleStatus(customer._id)}
                      sx={{ cursor: (user?.role === 'admin' || user?.role === 'manager') ? 'pointer' : 'default' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewCustomer(customer)}
                          color="info"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <>
                          <Tooltip title="Edit Customer">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(customer)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {user?.role === 'admin' && (
                            <Tooltip title="Delete Customer">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(customer._id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredCustomers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No customers found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first customer'}
          </Typography>
        </Box>
      )}

      {/* Add Customer FAB for mobile */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Customer Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Customer Type"
                value={formData.customerType}
                onChange={(e) => handleInputChange('customerType', e.target.value)}
                required
              >
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="corporate">Corporate</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </Grid>
            {formData.customerType === 'corporate' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              >
                {states.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credit Limit"
                type="number"
                value={formData.creditLimit}
                onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Terms (Days)"
                type="number"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', parseInt(e.target.value) || 0)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.email}
          >
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {viewingCustomer?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{viewingCustomer?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {viewingCustomer?.customerCode}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingCustomer && (
            <Box>
              <Tabs value={viewTabValue} onChange={(e, newValue) => setViewTabValue(newValue)}>
                <Tab label="Details" />
                <Tab label="Order History" />
                <Tab label="Analytics" />
              </Tabs>
              
              <TabPanelComponent value={viewTabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Contact Information
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemText
                              primary="Email"
                              secondary={viewingCustomer.email}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Phone"
                              secondary={viewingCustomer.phone}
                            />
                          </ListItem>
                          {viewingCustomer.companyName && (
                            <ListItem>
                              <ListItemText
                                primary="Company"
                                secondary={viewingCustomer.companyName}
                              />
                            </ListItem>
                          )}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Address
                        </Typography>
                        <Typography variant="body2">
                          {viewingCustomer.address.street}<br />
                          {viewingCustomer.address.city}, {viewingCustomer.address.state}<br />
                          {viewingCustomer.address.postalCode}<br />
                          {viewingCustomer.address.country}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Financial Information
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemText
                              primary="Credit Limit"
                              secondary={`₹${viewingCustomer.creditLimit.toLocaleString()}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Payment Terms"
                              secondary={`${viewingCustomer.paymentTerms} days`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Total Spent"
                              secondary={`₹${viewingCustomer.totalSpent.toLocaleString()}`}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <StarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Customer Metrics
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemText
                              primary="Rating"
                              secondary={viewingCustomer.rating > 0 ? `${viewingCustomer.rating.toFixed(1)} ${getRatingStars(viewingCustomer.rating)}` : 'Not rated'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Total Orders"
                              secondary={viewingCustomer.totalOrders}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Loyalty Points"
                              secondary={viewingCustomer.loyaltyPoints}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanelComponent>

              <TabPanelComponent value={viewTabValue} index={1}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order Number</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Items</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>{order.orderNumber}</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right">₹{order.amount.toLocaleString()}</TableCell>
                          <TableCell align="center">{order.items}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={
                                order.status === 'completed' ? 'success' :
                                order.status === 'pending' ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanelComponent>

              <TabPanelComponent value={viewTabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <OrderIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" color="primary">
                          {viewingCustomer.totalOrders}
                        </Typography>
                        <Typography variant="body2">Total Orders</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <MoneyIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" color="success.main">
                          ₹{(viewingCustomer.totalSpent / 1000).toFixed(0)}K
                        </Typography>
                        <Typography variant="body2">Total Spent</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TrendingUpIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" color="info.main">
                          ₹{viewingCustomer.totalOrders > 0 ? (viewingCustomer.totalSpent / viewingCustomer.totalOrders / 1000).toFixed(0) : '0'}K
                        </Typography>
                        <Typography variant="body2">Avg Order Value</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanelComponent>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerManagement;
