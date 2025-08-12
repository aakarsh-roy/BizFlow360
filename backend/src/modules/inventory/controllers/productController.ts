import { Request, Response } from 'express';
import Product from '../models/Product';
import StockMovement from '../models/StockMovement';
import { AuthRequest } from '../../../middleware/auth';

// @desc    Get all products with filtering and pagination
// @route   GET /api/inventory/products
// @access  Private
export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.stockStatus) {
      switch (req.query.stockStatus) {
        case 'low_stock':
          filter.$expr = { $lte: ['$stockQuantity', '$reorderPoint'] };
          break;
        case 'out_of_stock':
          filter.stockQuantity = 0;
          break;
        case 'in_stock':
          filter.$expr = { $gt: ['$stockQuantity', '$reorderPoint'] };
          break;
      }
    }

    const products = await Product.find(filter)
      .populate('supplier', 'name companyName')
      .populate('warehouse', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/inventory/products/:id
// @access  Private
export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name companyName email phone')
      .populate('warehouse', 'name location')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/inventory/products
// @access  Private (Admin/Manager)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const product = await Product.create(productData);
    
    // Create initial stock movement record
    if (product.stockQuantity > 0) {
      await StockMovement.create({
        product: product._id,
        warehouse: product.warehouse,
        movementType: 'in',
        quantity: product.stockQuantity,
        unitCost: product.costPrice,
        totalValue: product.stockQuantity * product.costPrice,
        referenceType: 'adjustment',
        reason: 'Initial stock entry',
        performedBy: req.user.id,
        isApproved: true,
        stockBefore: 0,
        stockAfter: product.stockQuantity
      });
    }

    const populatedProduct = await Product.findById(product._id)
      .populate('supplier', 'name companyName')
      .populate('warehouse', 'name location');

    res.status(201).json({ success: true, data: populatedProduct });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/inventory/products/:id
// @access  Private (Admin/Manager)
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).populate('supplier', 'name companyName')
     .populate('warehouse', 'name location');

    res.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/inventory/products/:id
// @access  Private (Admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Soft delete - set isActive to false
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock products
// @route   GET /api/inventory/products/low-stock
// @access  Private
export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$reorderPoint'] }
    })
    .populate('supplier', 'name companyName')
    .populate('warehouse', 'name location')
    .sort({ stockQuantity: 1 });

    res.json({ success: true, data: lowStockProducts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product stock
// @route   PUT /api/inventory/products/:id/stock
// @access  Private (Admin/Manager)
export const updateStock = async (req: AuthRequest, res: Response) => {
  try {
    const { quantity, movementType, reason, unitCost } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const stockBefore = product.stockQuantity;
    let stockAfter: number;

    // Calculate new stock based on movement type
    if (movementType === 'in') {
      stockAfter = stockBefore + Math.abs(quantity);
    } else if (movementType === 'out') {
      stockAfter = Math.max(0, stockBefore - Math.abs(quantity));
    } else {
      stockAfter = Math.max(0, quantity); // Direct adjustment
    }

    // Update product stock
    product.stockQuantity = stockAfter;
    await product.save();

    // Create stock movement record
    await StockMovement.create({
      product: product._id,
      warehouse: product.warehouse,
      movementType: movementType || 'adjustment',
      quantity: movementType === 'out' ? -Math.abs(quantity) : Math.abs(quantity),
      unitCost: unitCost || product.costPrice,
      totalValue: Math.abs(quantity) * (unitCost || product.costPrice),
      referenceType: 'adjustment',
      reason: reason || 'Manual stock adjustment',
      performedBy: req.user.id,
      isApproved: true,
      stockBefore,
      stockAfter
    });

    const updatedProduct = await Product.findById(product._id)
      .populate('supplier', 'name companyName')
      .populate('warehouse', 'name location');

    res.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get product stock movements
// @route   GET /api/inventory/products/:id/movements
// @access  Private
export const getProductMovements = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const movements = await StockMovement.find({ product: req.params.id })
      .populate('performedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('warehouse', 'name location')
      .sort({ movementDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StockMovement.countDocuments({ product: req.params.id });

    res.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
