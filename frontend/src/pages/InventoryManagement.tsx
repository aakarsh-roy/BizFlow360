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
  Alert,
  CircularProgress,
  Fab,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  supplier: {
    _id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  supplier: string;
  status: 'active' | 'inactive' | 'discontinued';
}

const InventoryManagement: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    unit: 'piece',
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    reorderPoint: 0,
    maxStock: 0,
    supplier: '',
    status: 'active'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const categories = ['Electronics', 'Clothing', 'Food & Beverage', 'Books', 'Home & Garden', 'Sports', 'Automotive', 'Other'];
  const units = ['piece', 'kg', 'gram', 'liter', 'meter', 'box', 'pack'];
  const statuses = ['active', 'inactive', 'discontinued'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory/products');
      const mappedProducts = (response.data.data || []).map((product: any) => ({
        _id: product._id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        category: product.category,
        brand: product.brand,
        unit: product.unit,
        costPrice: product.costPrice,
        sellingPrice: product.unitPrice, // Map unitPrice to sellingPrice
        currentStock: product.stockQuantity, // Map stockQuantity to currentStock
        reorderPoint: product.reorderPoint,
        maxStock: product.maxStockLevel, // Map maxStockLevel to maxStock
        supplier: product.supplier || { _id: '', name: '' },
        status: product.isActive ? 'active' : 'inactive',
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({ open: true, message: 'Error fetching products', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      brand: '',
      unit: 'piece',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      reorderPoint: 0,
      maxStock: 0,
      supplier: '',
      status: 'active'
    });
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    if (!product || !product._id) {
      console.error('Invalid product object passed to handleEdit:', product);
      setSnackbar({ 
        open: true, 
        message: 'Error: Invalid product data', 
        severity: 'error' 
      });
      return;
    }

    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      unit: product.unit || 'pieces',
      costPrice: product.costPrice || 0,
      sellingPrice: product.sellingPrice || 0,
      currentStock: product.currentStock || 0,
      reorderPoint: product.reorderPoint || 0,
      maxStock: product.maxStock || 0,
      supplier: product.supplier?._id || '',
      status: product.status || 'active'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/inventory/products/${productId}`);
      setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({ open: true, message: 'Error deleting product', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await api.put(`/inventory/products/${editingProduct._id}`, formData);
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      } else {
        await api.post('/inventory/products', formData);
        setSnackbar({ open: true, message: 'Product created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({ open: true, message: 'Error saving product', severity: 'error' });
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) {
      return { label: 'Out of Stock', color: 'error' as const };
    } else if (product.currentStock <= product.reorderPoint) {
      return { label: 'Low Stock', color: 'warning' as const };
    } else {
      return { label: 'In Stock', color: 'success' as const };
    }
  };

  const lowStockCount = products.filter(p => p.currentStock <= p.reorderPoint).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Inventory Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage products, track stock levels, and monitor inventory health
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={user?.role === 'user'}
        >
          Add Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main">
                {products.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {lowStockCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error.main">
                {outOfStockCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of Stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                ₹{totalValue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {lowStockCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          {lowStockCount} product(s) are running low on stock. Consider restocking soon.
        </Alert>
      )}

      {outOfStockCount > 0 && (
        <Alert severity="error" sx={{ mb: 2 }} icon={<TrendingDownIcon />}>
          {outOfStockCount} product(s) are out of stock. Immediate restocking required.
        </Alert>
      )}

      {/* Products Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Products
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
                    <TableCell>SKU</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Reorder Point</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.filter(product => product && product._id).map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product._id}>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.brand}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${product.currentStock} ${product.unit}`}
                            color={stockStatus.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{product.reorderPoint}</TableCell>
                        <TableCell>₹{product.sellingPrice}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.status}
                            color={product.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(product)}
                            disabled={user?.role === 'user'}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(product._id)}
                            disabled={user?.role !== 'admin'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              >
                {units.map((option) => (
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
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                required
              >
                {statuses.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Selling Price"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Reorder Point"
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Max Stock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Create'}
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

export default InventoryManagement;
