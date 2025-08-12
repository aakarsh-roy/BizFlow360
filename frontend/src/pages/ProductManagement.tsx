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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Fab,
  Tooltip,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Visibility,
  Warning,
  CheckCircle,
  Inventory,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Product {
  _id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  isActive: boolean;
  supplier?: {
    name: string;
  };
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  unit: string;
}

const ProductManagement: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    unitPrice: 0,
    costPrice: 0,
    stockQuantity: 0,
    reorderPoint: 10,
    unit: 'pieces'
  });

  // Mock data for demonstration
  const mockProducts: Product[] = [
    {
      _id: '1',
      sku: 'OFF-001',
      name: 'Office Chair Executive',
      category: 'Furniture',
      unitPrice: 12500,
      stockQuantity: 15,
      reorderPoint: 10,
      isActive: true,
      supplier: { name: 'Office Solutions Ltd' }
    },
    {
      _id: '2',
      sku: 'LAP-002',
      name: 'Laptop Bag Premium',
      category: 'Accessories',
      unitPrice: 1200,
      stockQuantity: 5,
      reorderPoint: 15,
      isActive: true,
      supplier: { name: 'Tech Accessories Co' }
    },
    {
      _id: '3',
      sku: 'STA-003',
      name: 'Stapler Heavy Duty',
      category: 'Stationery',
      unitPrice: 450,
      stockQuantity: 0,
      reorderPoint: 20,
      isActive: true,
      supplier: { name: 'Office Supplies Inc' }
    },
    {
      _id: '4',
      sku: 'DES-004',
      name: 'Standing Desk',
      category: 'Furniture',
      unitPrice: 25000,
      stockQuantity: 8,
      reorderPoint: 5,
      isActive: true,
      supplier: { name: 'Ergonomic Solutions' }
    },
    {
      _id: '5',
      sku: 'PRN-005',
      name: 'Wireless Printer',
      category: 'Electronics',
      unitPrice: 8500,
      stockQuantity: 12,
      reorderPoint: 8,
      isActive: true,
      supplier: { name: 'Tech World' }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      unitPrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      reorderPoint: 10,
      unit: 'pieces'
    });
    setOpenDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: '',
      category: product.category,
      unitPrice: product.unitPrice,
      costPrice: product.unitPrice * 0.7, // Estimate cost price
      stockQuantity: product.stockQuantity,
      reorderPoint: product.reorderPoint,
      unit: 'pieces'
    });
    setOpenDialog(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Simulate API call
        setProducts(products.filter(p => p._id !== productId));
        setAlert({ type: 'success', message: 'Product deleted successfully!' });
        setTimeout(() => setAlert(null), 3000);
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to delete product.' });
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProducts = products.map(p => 
          p._id === editingProduct._id 
            ? { 
                ...p, 
                name: formData.name, 
                category: formData.category,
                unitPrice: formData.unitPrice,
                stockQuantity: formData.stockQuantity,
                reorderPoint: formData.reorderPoint
              }
            : p
        );
        setProducts(updatedProducts);
        setAlert({ type: 'success', message: 'Product updated successfully!' });
      } else {
        // Add new product
        const newProduct: Product = {
          _id: Date.now().toString(),
          sku: `NEW-${Date.now().toString().slice(-3)}`,
          name: formData.name,
          category: formData.category,
          unitPrice: formData.unitPrice,
          stockQuantity: formData.stockQuantity,
          reorderPoint: formData.reorderPoint,
          isActive: true,
          supplier: { name: 'Default Supplier' }
        };
        setProducts([newProduct, ...products]);
        setAlert({ type: 'success', message: 'Product added successfully!' });
      }
      
      setOpenDialog(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save product.' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const getStockStatus = (current: number, reorderPoint: number) => {
    if (current === 0) return { label: 'Out of Stock', color: 'error' as const };
    if (current <= reorderPoint) return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = products.reduce((sum, product) => sum + (product.unitPrice * product.stockQuantity), 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderPoint).length;
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduct}
            size="large"
          >
            Add Product
          </Button>
        )}
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Inventory color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {products.length}
              </Typography>
              <Typography variant="body2">Total Products</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {lowStockCount}
              </Typography>
              <Typography variant="body2">Low Stock Items</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {outOfStockCount}
              </Typography>
              <Typography variant="body2">Out of Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                ₹{(totalValue / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="body2">Total Value</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search products by name, SKU, or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Reorder Point</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Supplier</TableCell>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <TableCell align="center">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stockQuantity, product.reorderPoint);
              return (
                <TableRow key={product._id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">₹{product.unitPrice.toLocaleString()}</TableCell>
                  <TableCell align="right">{product.stockQuantity}</TableCell>
                  <TableCell align="right">{product.reorderPoint}</TableCell>
                  <TableCell>
                    <Chip
                      label={stockStatus.label}
                      color={stockStatus.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{product.supplier?.name || 'N/A'}</TableCell>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <TableCell align="center">
                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          onClick={() => handleEditProduct(product)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {user?.role === 'admin' && (
                        <Tooltip title="Delete Product">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteProduct(product._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="Furniture">Furniture</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Stationery">Stationery</MenuItem>
                  <MenuItem value="Accessories">Accessories</MenuItem>
                  <MenuItem value="Equipment">Equipment</MenuItem>
                </Select>
              </FormControl>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Reorder Point"
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  label="Unit"
                >
                  <MenuItem value="pieces">Pieces</MenuItem>
                  <MenuItem value="kg">Kilogram</MenuItem>
                  <MenuItem value="liters">Liters</MenuItem>
                  <MenuItem value="boxes">Boxes</MenuItem>
                  <MenuItem value="packets">Packets</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained"
            disabled={!formData.name || !formData.category || formData.unitPrice <= 0}
          >
            {editingProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
