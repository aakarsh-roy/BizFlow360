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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Supplier {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId: string;
  paymentTerms: number;
  isActive: boolean;
  rating: number;
  totalOrders: number;
  totalValue: number;
  categories: string[];
  leadTime: number;
  minimumOrderValue: number;
  createdAt: string;
  updatedAt: string;
}

interface SupplierFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  paymentTerms: number;
  categories: string[];
  leadTime: number;
  minimumOrderValue: number;
}

const SupplierManagement: React.FC = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    taxId: '',
    paymentTerms: 30,
    categories: [],
    leadTime: 7,
    minimumOrderValue: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Hardware', 'Software', 'Medical', 'Automotive', 'Food & Beverage'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal'];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockSuppliers: Supplier[] = [
        {
          _id: '1',
          companyName: 'TechCorp Solutions',
          contactPerson: 'Rajesh Kumar',
          email: 'rajesh@techcorp.com',
          phone: '+91 98765 43210',
          address: {
            street: '123 Business District',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
          taxId: 'GST123456789',
          paymentTerms: 30,
          isActive: true,
          rating: 4.5,
          totalOrders: 45,
          totalValue: 850000,
          categories: ['Electronics', 'Hardware'],
          leadTime: 5,
          minimumOrderValue: 10000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          companyName: 'Office Supplies Hub',
          contactPerson: 'Priya Sharma',
          email: 'priya@officesupplies.com',
          phone: '+91 87654 32109',
          address: {
            street: '456 Supply Chain Road',
            city: 'Delhi',
            state: 'Delhi',
            postalCode: '110001',
            country: 'India',
          },
          taxId: 'GST987654321',
          paymentTerms: 15,
          isActive: true,
          rating: 4.2,
          totalOrders: 78,
          totalValue: 450000,
          categories: ['Office Supplies', 'Furniture'],
          leadTime: 3,
          minimumOrderValue: 5000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '3',
          companyName: 'MedEquip Enterprises',
          contactPerson: 'Dr. Amit Patel',
          email: 'amit@medequip.com',
          phone: '+91 76543 21098',
          address: {
            street: '789 Healthcare Avenue',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
          },
          taxId: 'GST456789123',
          paymentTerms: 45,
          isActive: false,
          rating: 3.8,
          totalOrders: 12,
          totalValue: 1200000,
          categories: ['Medical'],
          leadTime: 14,
          minimumOrderValue: 25000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setSuppliers(mockSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      showSnackbar('Error fetching suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      taxId: '',
      paymentTerms: 30,
      categories: [],
      leadTime: 7,
      minimumOrderValue: 0,
    });
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        street: supplier.address.street,
        city: supplier.address.city,
        state: supplier.address.state,
        postalCode: supplier.address.postalCode,
        country: supplier.address.country,
        taxId: supplier.taxId,
        paymentTerms: supplier.paymentTerms,
        categories: supplier.categories,
        leadTime: supplier.leadTime,
        minimumOrderValue: supplier.minimumOrderValue,
      });
    } else {
      setEditingSupplier(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSupplier(null);
    resetForm();
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setOpenViewDialog(true);
  };

  const handleInputChange = (field: keyof SupplierFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingSupplier) {
        // Update existing supplier
        const updatedSuppliers = suppliers.map(s => 
          s._id === editingSupplier._id 
            ? { 
                ...s, 
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
            : s
        );
        setSuppliers(updatedSuppliers);
        showSnackbar('Supplier updated successfully', 'success');
      } else {
        // Create new supplier
        const newSupplier: Supplier = {
          _id: Date.now().toString(),
          ...formData,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          isActive: true,
          rating: 0,
          totalOrders: 0,
          totalValue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSuppliers(prev => [newSupplier, ...prev]);
        showSnackbar('Supplier created successfully', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving supplier:', error);
      showSnackbar('Error saving supplier', 'error');
    }
  };

  const handleDelete = async (supplierId: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        setSuppliers(prev => prev.filter(s => s._id !== supplierId));
        showSnackbar('Supplier deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        showSnackbar('Error deleting supplier', 'error');
      }
    }
  };

  const handleToggleStatus = async (supplierId: string) => {
    try {
      const updatedSuppliers = suppliers.map(s => 
        s._id === supplierId 
          ? { ...s, isActive: !s.isActive, updatedAt: new Date().toISOString() }
          : s
      );
      setSuppliers(updatedSuppliers);
      showSnackbar('Supplier status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating supplier status:', error);
      showSnackbar('Error updating supplier status', 'error');
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'error';
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 !== 0 ? '⭐' : '');
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  const averageRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length || 0;
  const totalValue = suppliers.reduce((sum, s) => sum + s.totalValue, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Suppliers...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Supplier Management
        </Typography>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Add Supplier
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BusinessIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {totalSuppliers}
              </Typography>
              <Typography variant="body2">Total Suppliers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {activeSuppliers}
              </Typography>
              <Typography variant="body2">Active Suppliers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {averageRating.toFixed(1)}
              </Typography>
              <Typography variant="body2">Average Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShippingIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                ₹{(totalValue / 100000).toFixed(1)}L
              </Typography>
              <Typography variant="body2">Total Value</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search suppliers by company, contact, email, or category..."
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

      {/* Suppliers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Company</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Categories</strong></TableCell>
              <TableCell align="center"><strong>Rating</strong></TableCell>
              <TableCell align="right"><strong>Orders</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {supplier.companyName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {supplier.companyName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {supplier.taxId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body1">
                      {supplier.contactPerson}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {supplier.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {supplier.phone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {supplier.address.city}, {supplier.address.state}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {supplier.categories.slice(0, 2).map((category) => (
                      <Chip
                        key={category}
                        label={category}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {supplier.categories.length > 2 && (
                      <Chip
                        label={`+${supplier.categories.length - 2}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <Typography variant="body1">
                      {supplier.rating > 0 ? supplier.rating.toFixed(1) : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      {supplier.rating > 0 ? getRatingStars(supplier.rating) : ''}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="body1">
                      {supplier.totalOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{(supplier.totalValue / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={supplier.isActive ? 'Active' : 'Inactive'}
                    color={supplier.isActive ? 'success' : 'error'}
                    size="small"
                    onClick={() => (user?.role === 'admin' || user?.role === 'manager') && handleToggleStatus(supplier._id)}
                    sx={{ cursor: (user?.role === 'admin' || user?.role === 'manager') ? 'pointer' : 'default' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewSupplier(supplier)}
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <>
                        <Tooltip title="Edit Supplier">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(supplier)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {user?.role === 'admin' && (
                          <Tooltip title="Delete Supplier">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(supplier._id)}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredSuppliers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No suppliers found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first supplier'}
          </Typography>
        </Box>
      )}

      {/* Add Supplier FAB for mobile */}
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

      {/* Supplier Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                required
              />
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
                label="Tax ID / GST Number"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lead Time (Days)"
                type="number"
                value={formData.leadTime}
                onChange={(e) => handleInputChange('leadTime', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Order Value"
                type="number"
                value={formData.minimumOrderValue}
                onChange={(e) => handleInputChange('minimumOrderValue', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Categories"
                value={formData.categories}
                onChange={(e) => handleInputChange('categories', e.target.value)}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (selected as string[]).join(', '),
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.companyName || !formData.contactPerson || !formData.email}
          >
            {editingSupplier ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {viewingSupplier?.companyName.charAt(0)}
            </Avatar>
            {viewingSupplier?.companyName}
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingSupplier && (
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
                          primary="Contact Person"
                          secondary={viewingSupplier.contactPerson}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Email"
                          secondary={viewingSupplier.email}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Phone"
                          secondary={viewingSupplier.phone}
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
                      <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Address
                    </Typography>
                    <Typography variant="body2">
                      {viewingSupplier.address.street}<br />
                      {viewingSupplier.address.city}, {viewingSupplier.address.state}<br />
                      {viewingSupplier.address.postalCode}<br />
                      {viewingSupplier.address.country}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Performance
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Rating"
                          secondary={`${viewingSupplier.rating.toFixed(1)} ${getRatingStars(viewingSupplier.rating)}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Orders"
                          secondary={viewingSupplier.totalOrders}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Value"
                          secondary={`₹${viewingSupplier.totalValue.toLocaleString()}`}
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
                      <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Terms & Conditions
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Payment Terms"
                          secondary={`${viewingSupplier.paymentTerms} days`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Lead Time"
                          secondary={`${viewingSupplier.leadTime} days`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Minimum Order"
                          secondary={`₹${viewingSupplier.minimumOrderValue.toLocaleString()}`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Categories
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {viewingSupplier.categories.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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

export default SupplierManagement;
